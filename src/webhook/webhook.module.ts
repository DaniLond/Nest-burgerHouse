import { Module } from '@nestjs/common';
import { WebhookController } from './webhook.controller';
import { OrderModule } from 'src/Order/order.module';

@Module({
  controllers: [WebhookController],
  imports: [OrderModule],
})
export class WebhookModule {}
