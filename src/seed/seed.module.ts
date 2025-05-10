import { Module } from '@nestjs/common';
import { UserSeedService } from './users/user-seed.service';
import { UserSeedController } from './users/user-seed.controller';
import { UserModule } from '../user/user.module';
import { ProductSeedController } from './products/product-seed.controller';
import { ProductSeedService } from './products/product-seed.service';
import { ProductModule } from 'src/product/product.module';

@Module({
  controllers: [UserSeedController, ProductSeedController],
  providers: [UserSeedService, ProductSeedService],
  imports: [UserModule, ProductModule],
})
export class SeedModule {}
