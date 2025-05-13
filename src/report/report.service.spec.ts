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
    name: 'Product 1',
    price: 25.99,
  };

  const mockProduct2 = {
    id: '123e4567-e89b-12d3-a456-426614174002',
    name: 'Product 2',
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
        totalSales: 82.98, // Sum of totals for the 3 orders in the date range with valid states
        totalOrders: 3,
        averageOrderValue: 27.66, 
        orders: expect.any(Array),
      });
    });

    it('should handle empty orders result', async () => {
      mockOrderService.findByDateRange.mockReturnValueOnce([]);
      
      const startDate = new Date('2023-06-01T00:00:00Z');
      const endDate = new Date('2023-06-02T23:59:59Z');

      const result = await service.getSalesReport(startDate, endDate);

      expect(result).toEqual({
        startDate,
        endDate,
        totalSales: 0,
        totalOrders: 0,
        averageOrderValue: 0,
        orders: [],
      });
    });
  });

  describe('getDailySalesReport', () => {
    it('should return sales report for a specific day', async () => {
      const date = new Date('2023-05-01T12:00:00Z');
      
      const result = await service.getDailySalesReport(date);
      
      const startOfDay = moment(date).startOf('day').toDate();
      const endOfDay = moment(date).endOf('day').toDate();
      
      expect(mockOrderService.findByDateRange).toHaveBeenCalledWith(
        startOfDay,
        endOfDay,
        [OrderState.Delivered, OrderState.Ready]
      );
      
      expect(result).toEqual({
        startDate: startOfDay,
        endDate: endOfDay,
        totalSales: 67.48, 
        totalOrders: 2,
        averageOrderValue: 33.74, 
        orders: expect.any(Array),
      });
    });
  });

  describe('getWeeklySalesReport', () => {
    it('should return sales report for a specific week', async () => {
      const date = new Date('2023-05-01T12:00:00Z');
      
      const result = await service.getWeeklySalesReport(date);
      
      const startOfWeek = moment(date).startOf('week').toDate();
      const endOfWeek = moment(date).endOf('week').toDate();
      
      expect(mockOrderService.findByDateRange).toHaveBeenCalledWith(
        startOfWeek,
        endOfWeek,
        [OrderState.Delivered, OrderState.Ready]
      );
      
      expect(result.startDate).toEqual(startOfWeek);
      expect(result.endDate).toEqual(endOfWeek);
    });
  });

  describe('getMonthlySalesReport', () => {
    it('should return sales report for a specific month', async () => {
      const date = new Date('2023-05-15T12:00:00Z'); 
      
      const result = await service.getMonthlySalesReport(date);
      
      const startOfMonth = moment(date).startOf('month').toDate();
      const endOfMonth = moment(date).endOf('month').toDate();
      
      expect(mockOrderService.findByDateRange).toHaveBeenCalledWith(
        startOfMonth,
        endOfMonth,
        [OrderState.Delivered, OrderState.Ready]
      );
      
      expect(result.startDate).toEqual(startOfMonth);
      expect(result.endDate).toEqual(endOfMonth);
    });
  });

  describe('getTopSellingProducts', () => {

    it('should limit the number of top products returned', async () => {
      const startDate = new Date('2023-05-01T00:00:00Z');
      const endDate = new Date('2023-05-02T23:59:59Z');

      const result = await service.getTopSellingProducts(startDate, endDate, 1);
      
      expect(Array.isArray(result.topProducts)).toBe(true);
      const topProducts = result.topProducts as Array<{ id: string }>;
      expect(topProducts).toHaveLength(1);
      expect(topProducts[0].id).toBe(mockProduct1.id);
    });
  });

  describe('getDailyTopSellingProducts', () => {
    it('should return top selling products for a specific day', async () => {
      const date = new Date('2023-05-01T12:00:00Z');
      
      const result = await service.getDailyTopSellingProducts(date, 5);
      
      const startOfDay = moment(date).startOf('day').toDate();
      const endOfDay = moment(date).endOf('day').toDate();
      
      expect(mockOrderService.findByDateRange).toHaveBeenCalledWith(
        startOfDay,
        endOfDay,
        [OrderState.Delivered, OrderState.Ready]
      );
      
      expect(result.startDate).toEqual(startOfDay);
      expect(result.endDate).toEqual(endOfDay);
      expect(result.topProducts).toHaveLength(2);
    });
  });

  describe('getWeeklyTopSellingProducts', () => {
    it('should return top selling products for a specific week', async () => {
      const date = new Date('2023-05-01T12:00:00Z');
      
      const result = await service.getWeeklyTopSellingProducts(date, 5);
      
      const startOfWeek = moment(date).startOf('week').toDate();
      const endOfWeek = moment(date).endOf('week').toDate();
      
      expect(mockOrderService.findByDateRange).toHaveBeenCalledWith(
        startOfWeek,
        endOfWeek,
        [OrderState.Delivered, OrderState.Ready]
      );
      
      expect(result.startDate).toEqual(startOfWeek);
      expect(result.endDate).toEqual(endOfWeek);
    });
  });

  describe('getMonthlyTopSellingProducts', () => {
    it('should return top selling products for a specific month', async () => {
      const date = new Date('2023-05-15T12:00:00Z');
      
      const result = await service.getMonthlyTopSellingProducts(date, 5);
      
      const startOfMonth = moment(date).startOf('month').toDate();
      const endOfMonth = moment(date).endOf('month').toDate();
      
      expect(mockOrderService.findByDateRange).toHaveBeenCalledWith(
        startOfMonth,
        endOfMonth,
        [OrderState.Delivered, OrderState.Ready]
      );
      
      expect(result.startDate).toEqual(startOfMonth);
      expect(result.endDate).toEqual(endOfMonth);
    });
  });

  describe('getSalesTrends', () => {
    it('should return sales trends grouped by day', async () => {
      const startDate = new Date('2023-05-01T00:00:00Z');
      const endDate = new Date('2023-05-02T23:59:59Z');

      const result = await service.getSalesTrends(startDate, endDate, 'day');

      expect(mockOrderService.findByDateRange).toHaveBeenCalledWith(
        startDate, 
        endDate,
        [OrderState.Delivered, OrderState.Ready]
      );
      
      expect(result).toEqual({
        startDate,
        endDate,
        groupBy: 'day',
        trendData: [
          {
            period: '2023-05-01',
            totalSales: 67.48,
            orderCount: 2
          },
          {
            period: '2023-05-02',
            totalSales: 15.50,
            orderCount: 1
          }
        ]
      });
    });

    it('should return sales trends grouped by week', async () => {
      const startDate = new Date('2023-05-01T00:00:00Z');
      const endDate = new Date('2023-05-14T23:59:59Z'); 
      

      const weekTwoOrders = [
        {
          id: '123e4567-e89b-12d3-a456-426614174105',
          date: new Date('2023-05-08T10:00:00Z'), 
          total: 40.00,
          state: OrderState.Delivered,
          products: [mockProduct1, mockProduct2],
        },
      ];
      
      mockOrderService.findByDateRange.mockReturnValueOnce([
        ...mockOrders.filter(o => 
          o.date >= startDate && 
          o.date <= endDate && 
          [OrderState.Delivered, OrderState.Ready].includes(o.state)
        ),
        ...weekTwoOrders
      ]);

      const result = await service.getSalesTrends(startDate, endDate, 'week');
      
      expect(result.groupBy).toBe('week');
      expect(result.trendData).toHaveLength(2); 
    });

    it('should return sales trends grouped by month', async () => {
      const startDate = new Date('2023-04-01T00:00:00Z');
      const endDate = new Date('2023-05-31T23:59:59Z');
      
      
      const aprilOrders = [
        {
          id: '123e4567-e89b-12d3-a456-426614174106',
          date: new Date('2023-04-15T10:00:00Z'),
          total: 30.00,
          state: OrderState.Delivered,
          products: [mockProduct1],
        },
      ];
      
      mockOrderService.findByDateRange.mockReturnValueOnce([
        ...mockOrders.filter(o => 
          o.date >= startDate && 
          o.date <= endDate && 
          [OrderState.Delivered, OrderState.Ready].includes(o.state)
        ),
        ...aprilOrders
      ]);

      const result = await service.getSalesTrends(startDate, endDate, 'month');
      
      expect(result.groupBy).toBe('month');
      expect(result.trendData).toHaveLength(2); 
    });
  });
});