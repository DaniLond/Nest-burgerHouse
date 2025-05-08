import { Controller, Get } from '@nestjs/common';
import { UserSeedService } from './user-seed.service';

@Controller('seed-users')
export class UserSeedController {
  constructor(private readonly userSeedService: UserSeedService) {}

  @Get()
  runUserSeed() {
    return this.userSeedService.runUserSeed();
  }
}
