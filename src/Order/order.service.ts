import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Order } from './entities/order-entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { PaginationDto } from '../commons/dto/pagination.dto';
import { User } from '../user/entities/user.entity';
import { ProductService } from '../product/product.service';
import { ValidRoles } from '../user/enums/valid-roles.enum';
import { Product } from '../product/entities/product.entity';
import { OrderState } from './enums/valid-state.enums';
import { PaginatedResponseDto } from './dto/pagination-response.dto';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    private readonly productService: ProductService,
    private readonly dataSource: DataSource,
  ) { }

  async findByDateRange(startDate: Date, endDate: Date, states?: OrderState[]) {
    const query = this.orderRepository.createQueryBuilder('order')
      .leftJoinAndSelect('order.products', 'products')
      .where('order.date BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });

    if (states && states.length > 0) {
      query.andWhere('order.state IN (:...states)', { states });
    }

    return query.getMany();
  }

  async create(createOrderDto: CreateOrderDto, user: User | { id: string }) {


    const { productIds, state = OrderState.Pending, address, ...orderData } = createOrderDto;

    // Validation
    if (!productIds || productIds.length === 0) {
      throw new BadRequestException('Order must contain at least one product');
    }

    if (!address || address.trim().length === 0) {
      throw new BadRequestException('Delivery address is required');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const products: Product[] = [];
      let calculatedTotal = 0;

      for (const productId of productIds) {
        const product = await this.productService.findOneById(productId);
        calculatedTotal += parseFloat(product.price.toString());
        products.push(product);
      }

      const order = this.orderRepository.create({
        ...orderData,
        user,
        state,
        total: calculatedTotal,
        date: new Date(),
        address: address.trim(),
      });

      const savedOrder = await this.orderRepository.save(order);

      await queryRunner.manager
        .createQueryBuilder()
        .insert()
        .into('order_product')
        .values(
          productIds.map(productId => ({
            orderId: savedOrder.id,
            productId
          }))
        )
        .execute();

      await queryRunner.commitTransaction();

      return this.findOne(savedOrder.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.handleDBExceptions(error);
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(paginationDto: PaginationDto): Promise<PaginatedResponseDto<Order>> {
    const { limit = 10, offset = 0 } = paginationDto;

    // Usamos findAndCount para obtener los registros y el total
    const [orders, total] = await this.orderRepository.findAndCount({
      take: limit,
      skip: offset,
      relations: ['user', 'products'],
      // Opcional: puedes añadir order por fecha descendente
    });

    return {
      data: orders,
      total,
      limit,
      offset,
      currentPage: Math.floor(offset / limit) + 1, // Opcional
      totalPages: Math.ceil(total / limit),
    };
  }
  // order.service.ts
  // order.service.ts
  async findByUser(
    userId: string,
    { limit = 10, offset = 0 }: PaginationDto
  ): Promise<PaginatedResponseDto<Order>> {
    const [orders, total] = await this.orderRepository.findAndCount({
      where: { user: { id: userId } },
      take: limit,
      skip: offset,
      relations: ['products'],
    });

    return {
      data: orders,
      total,
      limit,
      offset,
      // Calculamos currentPage para referencia (opcional)
      currentPage: Math.floor(offset / limit) + 1,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string, user?: User) {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['user', 'products'],
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    if (user && order.user.id !== user.id &&
      !user.roles.includes(ValidRoles.admin) &&
      !user.roles.includes(ValidRoles.delivery)) {
      throw new ForbiddenException('You are not authorized to view this order');
    }

    return order;
  }

  async update(id: string, updateOrderDto: UpdateOrderDto, user: User) {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['user', 'products'],
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    const isAdmin = user.roles.includes(ValidRoles.admin);
    const isDelivery = user.roles.includes(ValidRoles.delivery);
    const isOwner = order.user.id === user.id;

    if (isDelivery && !isAdmin) {
      if (Object.keys(updateOrderDto).length > 1 || !updateOrderDto.state) {
        throw new ForbiddenException('Delivery users can only update the order state');
      }
    }
    else if (!isAdmin && !isOwner) {
      throw new ForbiddenException('You are not authorized to update this order');
    }

    const { productIds, ...updateData } = updateOrderDto;


    if (!isAdmin && !isDelivery &&
      (updateData.state === OrderState.Delivered ||
        updateData.state === OrderState.OnTheWay)) {
      throw new ForbiddenException('Regular users cannot set order state to Delivered or OnTheWay');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Update order fields if any
      if (Object.keys(updateData).length > 0) {
        await this.orderRepository.update(id, updateData);
      }

      // Update product relationships if needed
      if (productIds && productIds.length > 0) {
        if (!isAdmin && !isOwner) {
          throw new ForbiddenException('Only the order owner or admin can update products');
        }

        await queryRunner.manager
          .createQueryBuilder()
          .delete()
          .from('order_product')
          .where('orderId = :orderId', { orderId: id })
          .execute();

        await queryRunner.manager
          .createQueryBuilder()
          .insert()
          .into('order_product')
          .values(
            productIds.map(productId => ({
              orderId: id,
              productId
            }))
          )
          .execute();

        let calculatedTotal = 0;
        for (const productId of productIds) {
          const product = await this.productService.findOne(productId);
          calculatedTotal += parseFloat(product.price.toString());
        }

        await this.orderRepository.update(id, { total: calculatedTotal });
      }

      await queryRunner.commitTransaction();

      return this.findOne(id, user);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.handleDBExceptions(error);
    } finally {
      await queryRunner.release();
    }
  }

  async remove(id: string, user: User) {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    const isAdmin = user.roles.includes(ValidRoles.admin) || user.roles.includes(ValidRoles.delivery);
    const isOwner = order.user.id === user.id;

    if (!isAdmin && !isOwner) {
      throw new ForbiddenException('Only the order owner or admin can cancel this order');
    }

    if (order.state === OrderState.OnTheWay || order.state === OrderState.Delivered) {
      throw new BadRequestException(`Cannot cancel an order that is already ${order.state}`);
    }


    await this.orderRepository.update(id, { state: OrderState.Cancelled });

    return {
      message: `Order with ID ${id} has been cancelled successfully`
    };
  }

  private handleDBExceptions(error: any) {
    if (error.code === '23505') {
      throw new BadRequestException(error.detail);
    }

    console.log(error);
    throw new BadRequestException('Unexpected error, check server logs');
  }
}
