import { Controller, Get } from '@nestjs/common';
import { OrderSeedService } from './order-seed.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@Controller('seed-orders')
@ApiTags('Seed Orders')
export class OrderSeedController {
  constructor(private readonly orderSeedService: OrderSeedService) {}

  @Get()
  @ApiOperation({ summary: 'Run the order seed script' })
  @ApiResponse({
    status: 200,
    description: 'The order seeding process was completed successfully.',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error during order seeding.',
  })
  runOrderSeed() {
    return this.orderSeedService.runOrderSeed();
  }
}