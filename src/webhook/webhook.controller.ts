import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Headers, UnauthorizedException } from '@nestjs/common';

import Stripe from 'stripe';
import { OrderService } from 'src/Order/order.service';

@Controller('webhook')
export class WebhookController {
  private stripe: Stripe;

  constructor(private readonly orderService: OrderService) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  }

  @Post("stripe")
  async activateOrder(
    @Req() req: Request,
    @Headers('stripe-signature') stripeSignature: string,
  ) {
    let event: any;
    const body = req.body!.toString();

    try {
      event = this.stripe.webhooks.constructEvent(
        body,
        stripeSignature,
        process.env.STRIPE_SIGNATURE!
      );
    } catch (err) {
      console.log(err);
      throw new UnauthorizedException(`Webhook Error: ${err.message}`);
    }

    const bodys = JSON.parse(body);
    const productIds: string[] = JSON.parse(bodys.data.object.metadata.productIds);
    const totalStr = bodys.data.object.metadata.total;
    const total = Number(totalStr);
    const userId = bodys.data.object.metadata.userId;
    const address = bodys.data.object.metadata.address;

    this.orderService.create({ productIds, total, address }, { id: userId })
    return { received: true };
  }

}
