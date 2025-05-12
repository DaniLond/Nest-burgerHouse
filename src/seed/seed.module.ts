import { Module } from '@nestjs/common';
import { UserSeedService } from './users/user-seed.service';
import { UserSeedController } from './users/user-seed.controller';
import { UserModule } from '../user/user.module';
import { ProductSeedController } from './products/product-seed.controller';
import { ProductSeedService } from './products/product-seed.service';
import { ProductModule } from 'src/product/product.module';
import { ToppingSeedService } from './toppings/topping-seed.service';
import { ToppingModule } from 'src/topping/topping.module';
import { ToppingSeedController } from './toppings/topping-seed.controller';
import { OrderSeedController } from './orders/order-seed.controller';
import { OrderSeedService } from './orders/order-seed.service';
import { OrderModule } from 'src/Order/order.module';

@Module({
  controllers: [UserSeedController, ProductSeedController, ToppingSeedController,OrderSeedController],
  providers: [UserSeedService, ProductSeedService, ToppingSeedService, OrderSeedService],
  imports: [UserModule, ProductModule, ToppingModule,OrderModule],
})
export class SeedModule {}
