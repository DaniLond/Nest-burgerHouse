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

  async create(createOrderDto: CreateOrderDto,
    user: User | { id: string },
  ) {
    const { productIds, state = OrderState.Pending, address, ...orderData } = createOrderDto;
    console.log("Paso 1");
    // Validation
    if (!productIds || productIds.length === 0) {
      throw new BadRequestException('Order must contain at least one product');
    }
    console.log("Paso 2");

    if (!address || address.trim().length === 0) {
      throw new BadRequestException('Delivery address is required');
    }
    console.log("Paso 3");

    // Eliminar productos duplicados
    const uniqueProductIds = [...new Set(productIds)];
    console.log("Paso 4");

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    console.log("Paso 5");

    try {
      const products: Product[] = [];
      let calculatedTotal = 0;

      // Procesar solo los productos únicos
      for (const productId of uniqueProductIds) {
        const product = await this.productService.findOneById(productId);
        calculatedTotal += parseFloat(product.price.toString());
        products.push(product);
      }
      console.log("Paso 6");

      const order = this.orderRepository.create({
        ...orderData,
        user,
        state,
        total: calculatedTotal,
        date: new Date(),
        address: address.trim(),

      });
      console.log("Paso 7");

      const savedOrder = await this.orderRepository.save(order);
      console.log("Paso 8");

      // Insertar relaciones solo con productos únicos
      await queryRunner.manager
        .createQueryBuilder()
        .insert()
        .into('order_product')
        .values(
          uniqueProductIds.map(productId => ({
            orderId: savedOrder.id,
            productId
          }))
        )
        .execute();
      console.log("Paso 9");

      await queryRunner.commitTransaction();
      console.log("Paso 10");

      return this.findOneUnrestricted(savedOrder.id);
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
      where: { isActive: true }, // Filtramos por isActive si es necesario
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
      where: { user: { id: userId }, isActive: true },
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

  async findOneUnrestricted(id: string, user?: User) {
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


  async findOne(id: string, user?: User) {
    const order = await this.orderRepository.findOne({
      where: { id, isActive: true },
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

  async activateOrder(id: string) {
  // Primero encontramos la orden sin restricciones
  const order = await this.findOneUnrestricted(id);
  
  if (!order) {
    throw new NotFoundException(`Order with ID ${id} not found`);
  }

  // Actualizamos el estado
  order.isActive = true;
  

    await this.orderRepository.save(order);
  

  return order;
}

  async update(id: string) {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['user', 'products'],
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    switch (order.state) {
      case OrderState.Pending:
        order.state = OrderState.Preparing;
        break;
      case OrderState.Preparing:
        order.state = OrderState.Ready;
        break;
      case OrderState.Ready:
        order.state = OrderState.OnTheWay;
        break;
      case OrderState.OnTheWay:
        order.state = OrderState.Delivered;
        break;
      case OrderState.Delivered:
        // No hacemos nada si ya está entregado
        break;
      case OrderState.Cancelled:
        // Tampoco hacemos nada si está cancelado
        break;
      default:
        break;
    }

    await this.orderRepository.save(order);

    return order;
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


  async erase(id: string, user: User) {
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


    await this.orderRepository.remove(order);
  }

  private handleDBExceptions(error: any) {
    if (error.code === '23505') {
      throw new BadRequestException(error.detail);
    }

    console.log(error);
    throw new BadRequestException('Unexpected error, check server logs');
  }
}
