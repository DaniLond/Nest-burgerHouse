import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('ReportController (e2e)', () => {
  let app: INestApplication;
  let adminToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Login as admin to get token
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'admin@example.com',
        password: 'Abc123',
      });
    adminToken = loginResponse.body.token;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /reports/sales/daily', () => {
    it('should get daily sales report', async () => {
      const response = await request(app.getHttpServer())
        .get('/reports/sales/daily')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('totalSales');
      expect(response.body).toHaveProperty('totalOrders');
      expect(response.body).toHaveProperty('averageOrderValue');
    });

    it('should get daily sales report for specific date', async () => {
      const response = await request(app.getHttpServer())
        .get('/reports/sales/daily?date=2023-05-01')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('totalSales');
      expect(response.body).toHaveProperty('totalOrders');
    });
  });

  describe('GET /reports/sales/weekly', () => {
    it('should get weekly sales report', async () => {
      const response = await request(app.getHttpServer())
        .get('/reports/sales/weekly')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('totalSales');
      expect(response.body).toHaveProperty('totalOrders');
    });
  });

  describe('GET /reports/sales/monthly', () => {
    it('should get monthly sales report', async () => {
      const response = await request(app.getHttpServer())
        .get('/reports/sales/monthly')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('totalSales');
      expect(response.body).toHaveProperty('totalOrders');
    });
  });

  describe('GET /reports/products/top-selling/daily', () => {
    it('should get daily top selling products', async () => {
      const response = await request(app.getHttpServer())
        .get('/reports/products/top-selling/daily')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('topProducts');
      expect(Array.isArray(response.body.topProducts)).toBe(true);
    });

    it('should respect limit parameter', async () => {
      const response = await request(app.getHttpServer())
        .get('/reports/products/top-selling/daily?limit=5')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.topProducts.length).toBeLessThanOrEqual(5);
    });
  });

  describe('GET /reports/sales/trends', () => {
    it('should get sales trends', async () => {
      const response = await request(app.getHttpServer())
        .get('/reports/sales/trends?startDate=2023-05-01&endDate=2023-05-31')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('trendData');
      expect(Array.isArray(response.body.trendData)).toBe(true);
    });

    it('should support different groupBy options', async () => {
      const response = await request(app.getHttpServer())
        .get('/reports/sales/trends?startDate=2023-05-01&endDate=2023-05-31&groupBy=week')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.groupBy).toBe('week');
    });
  });

  describe('Authorization', () => {
    it('should not allow non-admin access', async () => {
      // Login as customer
      const customerLoginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'customer@example.com',
          password: 'Abc123',
        });
      const customerToken = customerLoginResponse.body.token;

      await request(app.getHttpServer())
        .get('/reports/sales/daily')
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(403);
    });
  });
}); 