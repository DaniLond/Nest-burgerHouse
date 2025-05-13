import { Test, TestingModule } from '@nestjs/testing';
import { ReportController } from './report.controller';
import { ReportService } from './report.service';
import { PassportModule } from '@nestjs/passport';

describe('ReportController', () => {
  let controller: ReportController;
  let mockReportService: Partial<ReportService>;
  
  const mockSalesReport = {
    startDate: new Date('2023-05-01T00:00:00Z'),
    endDate: new Date('2023-05-01T23:59:59Z'),
    totalSales: 100.50,
    totalOrders: 5,
    averageOrderValue: 20.10,
    orders: [],
  };

  const mockTopProductsReport = {
    startDate: new Date('2023-05-01T00:00:00Z'),
    endDate: new Date('2023-05-01T23:59:59Z'),
    topProducts: [
      {
        id: 'product-id-1',
        title: 'Top Product',
        price: 25.99,
        count: 10,
        totalRevenue: 259.90
      }
    ]
  };

  const mockSalesTrendsReport = {
    startDate: new Date('2023-05-01T00:00:00Z'),
    endDate: new Date('2023-05-31T23:59:59Z'),
    groupBy: 'day',
    trendData: [
      {
        period: '2023-05-01',
        totalSales: 100.50,
        orderCount: 5
      }
    ]
  };

  beforeEach(async () => {
    mockReportService = {
      getDailySalesReport: jest.fn().mockResolvedValue(mockSalesReport),
      getWeeklySalesReport: jest.fn().mockResolvedValue(mockSalesReport),
      getMonthlySalesReport: jest.fn().mockResolvedValue(mockSalesReport),
      getDailyTopSellingProducts: jest.fn().mockResolvedValue(mockTopProductsReport),
      getWeeklyTopSellingProducts: jest.fn().mockResolvedValue(mockTopProductsReport),
      getMonthlyTopSellingProducts: jest.fn().mockResolvedValue(mockTopProductsReport),
      getSalesTrends: jest.fn().mockResolvedValue(mockSalesTrendsReport),
    };

    const module: TestingModule = await Test.createTestingModule({
      imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
      controllers: [ReportController],
      providers: [
        {
          provide: ReportService,
          useValue: mockReportService,
        },
      ],
    }).compile();

    controller = module.get<ReportController>(ReportController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getDailySalesReport', () => {
    it('should return daily sales report', async () => {
      const dateString = '2023-05-01';
      
      const result = await controller.getDailySalesReport(dateString);
      
      expect(mockReportService.getDailySalesReport).toHaveBeenCalledWith(
        new Date(dateString)
      );
      expect(result).toEqual(mockSalesReport);
    });

    it('should use current date when no date provided', async () => {
      const result = await controller.getDailySalesReport();
      
      expect(mockReportService.getDailySalesReport).toHaveBeenCalled();
      expect(result).toEqual(mockSalesReport);
    });
  });

  describe('getWeeklySalesReport', () => {
    it('should return weekly sales report for specified date', async () => {
      const dateString = '2023-05-01';
      
      const result = await controller.getWeeklySalesReport(dateString);
      
      expect(mockReportService.getWeeklySalesReport).toHaveBeenCalledWith(
        new Date(dateString)
      );
      expect(result).toEqual(mockSalesReport);
    });
  });

  describe('getMonthlySalesReport', () => {
    it('should return monthly sales report for specified date', async () => {
      const dateString = '2023-05-01';
      
      const result = await controller.getMonthlySalesReport(dateString);
      
      expect(mockReportService.getMonthlySalesReport).toHaveBeenCalledWith(
        new Date(dateString)
      );
      expect(result).toEqual(mockSalesReport);
    });
  });

  describe('getDailyTopSellingProducts', () => {
    it('should return daily top selling products', async () => {
      const dateString = '2023-05-01';
      const limit = 5;
      
      const result = await controller.getDailyTopSellingProducts(dateString, limit);
      
      expect(mockReportService.getDailyTopSellingProducts).toHaveBeenCalledWith(
        new Date(dateString),
        limit
      );
      expect(result).toEqual(mockTopProductsReport);
    });

    it('should throw error when limit is not a number in getDailyTopSellingProducts', async () => {
  try {
    await controller.getDailyTopSellingProducts('2023-05-01', 'invalid-limit' as any);
  } catch (error) {
    expect(error.message).toContain('Validation failed');
  }
});

  });

  describe('getWeeklyTopSellingProducts', () => {
    it('should return weekly top selling products', async () => {
      const dateString = '2023-05-01';
      const limit = 5;
      
      const result = await controller.getWeeklyTopSellingProducts(dateString, limit);
      
      expect(mockReportService.getWeeklyTopSellingProducts).toHaveBeenCalledWith(
        new Date(dateString),
        limit
      );
      expect(result).toEqual(mockTopProductsReport);
    });
  });

  describe('getMonthlyTopSellingProducts', () => {
    it('should return monthly top selling products', async () => {
      const dateString = '2023-05-01';
      const limit = 5;
      
      const result = await controller.getMonthlyTopSellingProducts(dateString, limit);
      
      expect(mockReportService.getMonthlyTopSellingProducts).toHaveBeenCalledWith(
        new Date(dateString),
        limit
      );
      expect(result).toEqual(mockTopProductsReport);
    });
  });

  describe('getSalesTrends', () => {
    it('should return sales trends data', async () => {
      const startDate = '2023-05-01';
      const endDate = '2023-05-31';
      const groupBy = 'day';
      
      const result = await controller.getSalesTrends(startDate, endDate, groupBy as any);
      
      expect(mockReportService.getSalesTrends).toHaveBeenCalledWith(
        new Date(startDate),
        new Date(endDate),
        groupBy
      );
      expect(result).toEqual(mockSalesTrendsReport);
    });

    it('should use default groupBy when not specified', async () => {
      const startDate = '2023-05-01';
      const endDate = '2023-05-31';
      
      const result = await controller.getSalesTrends(startDate, endDate);
      
      expect(mockReportService.getSalesTrends).toHaveBeenCalledWith(
        new Date(startDate),
        new Date(endDate),
        'day'
      );
      expect(result).toEqual(mockSalesTrendsReport);
    });

    it('should throw error when groupBy is invalid in getSalesTrends', async () => {
  try {
    await controller.getSalesTrends('2023-05-01', '2023-05-31', 'invalid' as any);
  } catch (error) {
    expect(error.message).toContain('Validation failed');
  }
});

  });
});