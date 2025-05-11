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

@Module({
  controllers: [UserSeedController, ProductSeedController, ToppingSeedController],
  providers: [UserSeedService, ProductSeedService, ToppingSeedService],
  imports: [UserModule, ProductModule, ToppingModule],
})
export class SeedModule {}
