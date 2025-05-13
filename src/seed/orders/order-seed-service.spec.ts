import { Test, TestingModule } from '@nestjs/testing';
import { OrderSeedService } from './order-seed.service';
import { OrderService } from '../../Order/order.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../../user/entities/user.entity';
import { Product } from '../../product/entities/product.entity';
import { Repository } from 'typeorm';
import { Logger } from '@nestjs/common';
import { Order } from '../../Order/entities/order-entity';
import { initialOrderData } from './data/seed-order-data';

describe('OrderSeedService', () => {
  let service: OrderSeedService;
  let orderService: OrderService;
  let userRepository: Repository<User>;
  let productRepository: Repository<Product>;
  let loggerSpy: jest.SpyInstance;

  const mockUsers = [
    { id: '1', fullName: 'User 1', email: 'user1@example.com' },
    { id: '2', fullName: 'User 2', email: 'user2@example.com' },
  ] as User[];

  const mockProducts = [
    { id: '1', name: 'Product 1', price: 100 },
    { id: '2', name: 'Product 2', price: 200 },
    { id: '3', name: 'Product 3', price: 300 },
    { id: '4', name: 'Product 4', price: 400 },
    { id: '5', name: 'Product 5', price: 500 },
  ] as Product[];

  const mockOrder = { id: '1', total: 600, state: 'pending' } as Order;

  beforeEach(async () => {
 
    const mockOrderService = {
      create: jest.fn().mockResolvedValue(mockOrder),
    };

    const mockUserRepository = {
      find: jest.fn().mockResolvedValue(mockUsers),
    };

    const mockProductRepository = {
      find: jest.fn().mockResolvedValue(mockProducts),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderSeedService,
        {
          provide: OrderService,
          useValue: mockOrderService,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(Product),
          useValue: mockProductRepository,
        },
      ],
    }).compile();

    service = module.get<OrderSeedService>(OrderSeedService);
    orderService = module.get<OrderService>(OrderService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    productRepository = module.get<Repository<Product>>(getRepositoryToken(Product));

    
    jest.spyOn(Math, 'random').mockImplementation(() => 0.5);

    
    loggerSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});

 
    jest.mock('./data/seed-order-data', () => ({
      initialOrderData: {
        orders: [
          { state: 'pending' },
          { state: 'completed' },
        ],
      },
    }));
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('runOrderSeed', () => {
    it('should call insertOrders and return success message', async () => {
    
      const insertOrdersSpy = jest.spyOn(service as any, 'insertOrders').mockResolvedValue(undefined);

     
      const result = await service.runOrderSeed();

    
      expect(insertOrdersSpy).toHaveBeenCalled();
      expect(result).toBe('Order seed executed');
    });
  });

  describe('insertOrders', () => {
    it('should create orders with random users and products', async () => {
    
      const orderCount = initialOrderData.orders.length || 2;  

    
      await (service as any).insertOrders();

  
      expect(userRepository.find).toHaveBeenCalled();
      expect(productRepository.find).toHaveBeenCalled();
      expect(orderService.create).toHaveBeenCalledTimes(orderCount);
      expect(loggerSpy).toHaveBeenCalled();
    });

    it('should warn and return if no users are found', async () => {
      
      jest.spyOn(userRepository, 'find').mockResolvedValueOnce([]);
      const warnSpy = jest.spyOn(Logger.prototype, 'warn');

 
      await (service as any).insertOrders();

     
      expect(userRepository.find).toHaveBeenCalled();
      expect(warnSpy).toHaveBeenCalledWith('No users found. Please run user seed first.');
      expect(orderService.create).not.toHaveBeenCalled();
    });

    it('should warn and return if no products are found', async () => {
   
      jest.spyOn(productRepository, 'find').mockResolvedValueOnce([]);
      const warnSpy = jest.spyOn(Logger.prototype, 'warn');

    
      await (service as any).insertOrders();

      
      expect(productRepository.find).toHaveBeenCalled();
      expect(warnSpy).toHaveBeenCalledWith('No products found. Please run product seed first.');
      expect(orderService.create).not.toHaveBeenCalled();
    });

    it('should handle errors during order creation', async () => {
    
      const errorMessage = 'Create order failed';
      jest.spyOn(orderService, 'create').mockRejectedValueOnce(new Error(errorMessage));
      const errorSpy = jest.spyOn(Logger.prototype, 'error');

    
      await (service as any).insertOrders();

    
      expect(errorSpy).toHaveBeenCalledWith(`Error creating order: ${errorMessage}`);
    });
  });
});