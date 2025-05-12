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
import { User } from 'src/user/entities/user.entity';
import { ProductService } from 'src/product/product.service';
import { ValidRoles } from 'src/user/enums/valid-roles.enum';
import { Product } from 'src/product/entities/product.entity';
import { OrderState } from './enums/valid-state.enums';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    private readonly productService: ProductService,
    private readonly dataSource: DataSource,
  ) {}

  async create(createOrderDto: CreateOrderDto, user: User) {

    if (user.roles.includes(ValidRoles.admin) || user.roles.includes(ValidRoles.delivery)) {
      throw new ForbiddenException('Only regular users can create orders');
    }
    const { productIds, state = OrderState.Pending, ...orderData } = createOrderDto;
    
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
        userId: user.id,
        state,
        total: calculatedTotal,
        date: new Date(),
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

  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;
    
    return this.orderRepository.find({
      take: limit,
      skip: offset,
      relations: ['user', 'products'],
    });
  }

  async findByUser(userId: string, paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;
    
    return this.orderRepository.find({
      where: { userId },
      take: limit,
      skip: offset,
      relations: ['products'],
    });
  }

  async findOne(id: string, user?: User) {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['user', 'products'],
    });
    
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    if (user && order.userId !== user.id && 
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
    const isOwner = order.userId === user.id;
    
    
    if (isDelivery && !isAdmin) {
      
      if (Object.keys(updateOrderDto).length > 1 || !updateOrderDto.state) {
        throw new ForbiddenException('Delivery users can only update the order state');
      }
    } 
    
    else if (isAdmin) {
      
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
   
      if (Object.keys(updateData).length > 0) {
        await this.orderRepository.update(id, updateData);
      }
      
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
    const isOwner = order.userId === user.id;
    
    if (!isAdmin && !isOwner) {
      throw new ForbiddenException('Only the order owner or admin can cancel this order');
    }
    
    if (order.state === OrderState.OnTheWay || order.state === OrderState.Delivered) {
      throw new BadRequestException(`Cannot cancel an order that is already ${order.state}`);
    }
    
    // Set to cancelled state
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