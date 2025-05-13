import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { OrderState } from '../src/Order/enums/valid-state.enums';
import { ValidRoles } from '../src/user/enums/valid-roles.enum';

describe('OrderController (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let adminToken: string;
  let customerToken: string;
  let deliveryToken: string;
  let testOrderId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Login as different users to get tokens
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'admin@example.com',
        password: 'Abc123',
      });
    adminToken = loginResponse.body.token;

    const customerLoginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'customer@example.com',
        password: 'Abc123',
      });
    customerToken = customerLoginResponse.body.token;

    const deliveryLoginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'delivery@example.com',
        password: 'Abc123',
      });
    deliveryToken = deliveryLoginResponse.body.token;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /orders', () => {
    it('should create a new order', async () => {
      const createOrderDto = {
        productIds: ['product-uuid-1', 'product-uuid-2'],
        total: 45.99,
      };

      const response = await request(app.getHttpServer())
        .post('/orders')
        .set('Authorization', `Bearer ${customerToken}`)
        .send(createOrderDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.total).toBe(45.99);
      expect(response.body.state).toBe(OrderState.Pending);
      testOrderId = response.body.id;
    });

    it('should not allow admin to create orders', async () => {
      const createOrderDto = {
        productIds: ['product-uuid-1'],
        total: 25.99,
      };

      await request(app.getHttpServer())
        .post('/orders')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(createOrderDto)
        .expect(403);
    });
  });

  describe('GET /orders', () => {
    it('should get all orders (admin)', async () => {
      const response = await request(app.getHttpServer())
        .get('/orders')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should get orders for current user (customer)', async () => {
      const response = await request(app.getHttpServer())
        .get('/orders/user')
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('GET /orders/:id', () => {
    it('should get order by id', async () => {
      const response = await request(app.getHttpServer())
        .get(`/orders/${testOrderId}`)
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(200);

      expect(response.body.id).toBe(testOrderId);
    });

    it('should not allow unauthorized access', async () => {
      await request(app.getHttpServer())
        .get(`/orders/${testOrderId}`)
        .expect(401);
    });
  });

  describe('PATCH /orders/:id', () => {
    it('should update order state (delivery)', async () => {
      const updateOrderDto = {
        state: OrderState.OnTheWay,
      };

      const response = await request(app.getHttpServer())
        .patch(`/orders/${testOrderId}`)
        .set('Authorization', `Bearer ${deliveryToken}`)
        .send(updateOrderDto)
        .expect(200);

      expect(response.body.state).toBe(OrderState.OnTheWay);
    });

    it('should not allow customer to update to invalid state', async () => {
      const updateOrderDto = {
        state: OrderState.Delivered,
      };

      await request(app.getHttpServer())
        .patch(`/orders/${testOrderId}`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send(updateOrderDto)
        .expect(403);
    });
  });

  describe('DELETE /orders/:id', () => {
    it('should cancel order', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/orders/${testOrderId}`)
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(200);

      expect(response.body.message).toContain('cancelled successfully');
    });

    it('should not allow cancellation of delivered orders', async () => {
      // First update order to delivered
      await request(app.getHttpServer())
        .patch(`/orders/${testOrderId}`)
        .set('Authorization', `Bearer ${deliveryToken}`)
        .send({ state: OrderState.Delivered });

      // Try to cancel
      await request(app.getHttpServer())
        .delete(`/orders/${testOrderId}`)
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(400);
    });
  });
}); 