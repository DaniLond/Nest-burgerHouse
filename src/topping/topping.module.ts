import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ToppingController } from './topping.controller';
import { ToppingService } from './topping.service';
import { Topping } from './entities/topping.entity';
import { ProductTopping } from './entities/product-topping.entity';
import { Product } from '../product/entities/product.entity';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
    TypeOrmModule.forFeature([Topping, Product, ProductTopping]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [ToppingController],
  providers: [ToppingService],
  exports: [ToppingService, TypeOrmModule],
})
export class ToppingModule {}
