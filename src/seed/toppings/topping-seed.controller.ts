import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ToppingSeedService } from './topping-seed.service';

@Controller('seed-toppings')
@ApiTags('Seed Toppings')
export class ToppingSeedController {
  constructor(private readonly toppingSeedService: ToppingSeedService) {}

  @Get()
  @ApiOperation({ summary: 'Run the topping seed script' })
  @ApiResponse({
    status: 200,
    description: 'The seeding process was completed successfully.',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error during topping seeding.',
  })
  runToppingSeed() {
    return this.toppingSeedService.runToppingSeed();
  }
}
