import { Controller, Get } from '@nestjs/common';
import { ProductSeedService } from './product-seed.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@Controller('seed-products')
@ApiTags('Seed Products')
export class ProductSeedController {
  constructor(private readonly productSeedService: ProductSeedService) {}

  @Get()
  @ApiOperation({ summary: 'Run the product seed script' })
  @ApiResponse({
    status: 200,
    description: 'The seeding process was completed successfully.',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error during product seeding.',
  })
  runProductSeed() {
    return this.productSeedService.runProductSeed();
  }
}
