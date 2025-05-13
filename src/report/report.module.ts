import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportController } from './report.controller';
import { ReportService } from './report.service';
import { PassportModule } from '@nestjs/passport';
import { OrderModule } from '../Order/order.module';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    OrderModule,
  ],
  controllers: [ReportController],
  providers: [ReportService],
  exports: [ReportService],
})
export class ReportModule {}