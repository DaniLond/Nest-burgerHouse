import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { initialOrderData } from './data/seed-order-data';
import { OrderService } from '../../Order/order.service';
import { Order } from '../../Order/entities/order-entity';
import { User } from '../../user/entities/user.entity';
import { Product } from '../../product/entities/product.entity';
import { CreateOrderDto } from '../../Order/dto/create-order.dto';

@Injectable()
export class OrderSeedService {
  private readonly logger = new Logger('OrderSeedService');

  constructor(
    private readonly orderService: OrderService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async runOrderSeed() {
    await this.insertOrders();
    return 'Order seed executed';
  }

  private async insertOrders() {

    const users = await this.userRepository.find();
    if (users.length === 0) {
      this.logger.warn('No users found. Please run user seed first.');
      return;
    }

  
    const products = await this.productRepository.find();
    if (products.length === 0) {
      this.logger.warn('No products found. Please run product seed first.');
      return;
    }

    const seedOrders = initialOrderData.orders;
    const insertPromises: Promise<Order | null>[] = [];

    for (const seedOrder of seedOrders) {
      try {
        
        const randomUser = users[Math.floor(Math.random() * users.length)];
        
       
        const numberOfProducts = Math.floor(Math.random() * 3) + 2; 
        const randomProducts: Product[] = [];
        const randomProductIds: string[] = [];
        
       
        const availableProducts = [...products];
        
        for (let i = 0; i < numberOfProducts && availableProducts.length > 0; i++) {
          const randomIndex = Math.floor(Math.random() * availableProducts.length);
          const randomProduct = availableProducts.splice(randomIndex, 1)[0];
          randomProducts.push(randomProduct);
          randomProductIds.push(randomProduct.id);
        }

       
        let total = 0;
        for (const product of randomProducts) {
          total += parseFloat(product.price.toString());
        }
        
        
        const orderDto: CreateOrderDto = {
          total: total, 
          userId: randomUser.id,
          productIds: randomProductIds,
          state: seedOrder.state,
        };
        
        const result = await this.orderService.create(orderDto, randomUser);
        
        if (result) {
          insertPromises.push(Promise.resolve(result));
          this.logger.log(`Order created successfully for user ${randomUser.fullName}`);
        } else {
          this.logger.warn(`Failed to create order for user ${randomUser.fullName}`);
          insertPromises.push(Promise.resolve(null));
        }
      } catch (error) {
        this.logger.error(`Error creating order: ${error.message}`);
        insertPromises.push(Promise.resolve(null));
      }
    }

    const results = await Promise.all(insertPromises);
    const successfulOrders = results.filter((order) => order !== null);

    this.logger.log(
      `Successfully seeded ${successfulOrders.length} out of ${seedOrders.length} orders`,
    );
  }
}