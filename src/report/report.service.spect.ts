import { Test, TestingModule } from '@nestjs/testing';
import { ReportService } from './report.service';
import { OrderService } from '../Order/order.service';
import { OrderState } from '../Order/enums/valid-state.enums';
import * as moment from 'moment';

describe('ReportService', () => {
  let service: ReportService;
  let mockOrderService: Partial<OrderService> & { findByDateRange: jest.Mock };
  const mockProduct1 = {
    id: '123e4567-e89b-12d3-a456-426614174001',
    title: 'Product 1',
    price: 25.99,
  };

  const mockProduct2 = {
    id: '123e4567-e89b-12d3-a456-426614174002',
    title: 'Product 2',
    price: 15.50,
  };

  const mockOrders = [
    {
      id: '123e4567-e89b-12d3-a456-426614174101',
      date: new Date('2023-05-01T10:00:00Z'),
      total: 25.99,
      state: OrderState.Delivered,
      products: [mockProduct1],
    },
    {
      id: '123e4567-e89b-12d3-a456-426614174102',
      date: new Date('2023-05-01T14:00:00Z'),
      total: 41.49,
      state: OrderState.Delivered,
      products: [mockProduct1, mockProduct2],
    },
    {
      id: '123e4567-e89b-12d3-a456-426614174103',
      date: new Date('2023-05-02T09:00:00Z'),
      total: 15.50,
      state: OrderState.Ready,
      products: [mockProduct2],
    },
    {
      id: '123e4567-e89b-12d3-a456-426614174104',
      date: new Date('2023-05-03T16:00:00Z'),
      total: 25.99,
      state: OrderState.Pending, 
      products: [mockProduct1],
    },
  ];

  beforeEach(async () => {
    mockOrderService = {
      findByDateRange: jest.fn().mockImplementation((startDate, endDate, states) => {
        return mockOrders.filter(order => {
          const orderDate = new Date(order.date);
          const isInDateRange = orderDate >= startDate && orderDate <= endDate;
          const isInStates = states ? states.includes(order.state) : true;
          return isInDateRange && isInStates;
        });
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportService,
        {
          provide: OrderService,
          useValue: mockOrderService,
        },
      ],
    }).compile();

    service = module.get<ReportService>(ReportService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getSalesReport', () => {
    it('should return sales report for a date range', async () => {
      const startDate = new Date('2023-05-01T00:00:00Z');
      const endDate = new Date('2023-05-02T23:59:59Z');

      const result = await service.getSalesReport(startDate, endDate);

      expect(mockOrderService.findByDateRange).toHaveBeenCalledWith(
        startDate, 
        endDate,
        [OrderState.Delivered, OrderState.Ready]
      );
      
      expect(result).toEqual({
        startDate,
        endDate,
        totalSales: 82.98, 
        totalOrders: 3,
        averageOrderValue: 27.66, 
        orders: expect.any(Array),
      });
    });
  });

  describe('getDailySalesReport', () => {
    it('should return sales report for a specific day', async () => {
      jest.spyOn(service, 'getSalesReport').mockResolvedValue({
        startDate: expect.any(Date),
        endDate: expect.any(Date),
        totalSales: 67.48,
        totalOrders: 2,
        averageOrderValue: 33.74,
        orders: mockOrders.slice(0, 2),
      });

      const date = new Date('2023-05-01T12:00:00Z');
      
      const result = await service.getDailySalesReport(date);
      
      expect(service.getSalesReport).toHaveBeenCalledWith(
        moment(date).startOf('day').toDate(),
        moment(date).endOf('day').toDate()
      );
      
      expect(result.totalOrders).toBe(2);
    });
  });

  describe('getTopSellingProducts', () => {
    it('should return top selling products for a date range', async () => {
      const startDate = new Date('2023-05-01T00:00:00Z');
      const endDate = new Date('2023-05-02T23:59:59Z');

      const result = await service.getTopSellingProducts(startDate, endDate, 5) as { topProducts: Array<{ id: string; count: number }> };

      expect(mockOrderService.findByDateRange).toHaveBeenCalledWith(
        startDate, 
        endDate,
        [OrderState.Delivered, OrderState.Ready]
      );
      
      expect(result.topProducts).toHaveLength(2);
      expect(result.topProducts[0].id).toBe(mockProduct1.id); 
      expect(result.topProducts[0].count).toBe(2);
      expect(result.topProducts[1].id).toBe(mockProduct2.id); 
      
      expect(result.topProducts[1].count).toBe(2);
    });
  });

  describe('getSalesTrends', () => {
    it('should return sales trends grouped by day', async () => {
      const startDate = new Date('2023-05-01T00:00:00Z');
      const endDate = new Date('2023-05-02T23:59:59Z');

      const result = await service.getSalesTrends(startDate, endDate, 'day') as {
        trendData: Array<{ period: string; totalSales: number; orderCount: number }>;
      };

      expect(mockOrderService.findByDateRange).toHaveBeenCalledWith(
        startDate, 
        endDate,
        [OrderState.Delivered, OrderState.Ready]
      );
      
      expect(result.trendData).toHaveLength(2); 
      expect(result.trendData[0].period).toBe('2023-05-01');
      expect(result.trendData[0].totalSales).toBe(67.48); 
      expect(result.trendData[0].orderCount).toBe(2);
      
      expect(result.trendData[1].period).toBe('2023-05-02');
      expect(result.trendData[1].totalSales).toBe(15.50);
      expect(result.trendData[1].orderCount).toBe(1);
    });
  });
});