import { Module } from '@nestjs/common';
import { UserSeedService } from './user-seed.service';
import { UserSeedController } from './user-seed.controller';
import { UserModule } from '../../user/user.module';

@Module({
  controllers: [UserSeedController],
  providers: [UserSeedService],
  imports: [UserModule],
})
export class SeedModule {}
