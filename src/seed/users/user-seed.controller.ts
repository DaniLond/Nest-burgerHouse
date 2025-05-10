import { Controller, Get } from '@nestjs/common';
import { UserSeedService } from './user-seed.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@Controller('seed-users')
@ApiTags('Seed Users')
export class UserSeedController {
  constructor(private readonly userSeedService: UserSeedService) {}

  @Get()
  @ApiOperation({ summary: 'Run the user seed script' })
  @ApiResponse({
    status: 200,
    description: 'The user seeding process was completed successfully.',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error during user seeding.',
  })
  runUserSeed() {
    return this.userSeedService.runUserSeed();
  }
}
