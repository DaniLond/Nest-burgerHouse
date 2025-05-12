import { Test, TestingModule } from '@nestjs/testing';
import { OrderService } from './order.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Order } from './entities/order-entity';
import { DataSource, Repository } from 'typeorm';
import { ProductService } from 'src/product/product.service';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { User } from 'src/user/entities/user.entity';
import { Product } from 'src/product/entities/product.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { ValidRoles } from 'src/user/enums/valid-roles.enum';
import { OrderState } from './enums/valid-state.enums';

describe('OrderService', () => {
  let service: OrderService;
  let orderRepository: Partial<Repository<Order>>;
  let productService: Partial<ProductService>;
  let dataSource: Partial<DataSource>;
  
  
  const mockUser: User = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@example.com',
    password: 'hashedpassword',
    fullName: 'Test User',
    isActive: true,
    roles: ['user'],
    
  } as User;

  const mockProduct: Product = {
    id: '123e4567-e89b-12d3-a456-426614174001',
    title: 'Test Product',
    price: 25.99,
    
  } as unknown as Product;

  const mockOrder: Order = {
    id: '123e4567-e89b-12d3-a456-426614174002',
    total: 25.99,
    date: new Date(),
    userId: mockUser.id,
    state: OrderState.Pending,
    user: mockUser,
    products: [mockProduct],

  };

  const mockOrderDto: CreateOrderDto = {
    total: 25.99,
    userId: mockUser.id,
    productIds: [mockProduct.id],
    state: OrderState.Pending
  };

  const mockQueryRunner = {
    connect: jest.fn(),
    startTransaction: jest.fn(),
    manager: {
      createQueryBuilder: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      into: jest.fn().mockReturnThis(),
      values: jest.fn().mockReturnThis(),
      execute: jest.fn().mockResolvedValue({}),
      delete: jest.fn().mockReturnThis(),
      from: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
    },
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
    release: jest.fn(),
  };

  beforeEach(async () => {
    orderRepository = {
      create: jest.fn().mockImplementation((dto) => dto),
      save: jest.fn().mockImplementation((order) => Promise.resolve({ ...order, id: mockOrder.id })),
      find: jest.fn().mockResolvedValue([mockOrder]),
      findOne: jest.fn().mockImplementation(() => Promise.resolve(mockOrder)),
      update: jest.fn().mockResolvedValue({ affected: 1 }),
    };

    productService = {
      findOne: jest.fn().mockResolvedValue(mockProduct),
    };

    dataSource = {
      createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        {
          provide: getRepositoryToken(Order),
          useValue: orderRepository,
        },
        {
          provide: DataSource,
          useValue: dataSource,
        },
        {
          provide: ProductService,
          useValue: productService,
        }
      ],
    }).compile();

    service = module.get<OrderService>(OrderService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new order successfully', async () => {
      const result = await service.create(mockOrderDto, mockUser);
      
      expect(productService.findOneById).toHaveBeenCalledWith(mockProduct.id);
      expect(orderRepository.create).toHaveBeenCalled();
      expect(orderRepository.save).toHaveBeenCalled();
      expect(mockQueryRunner.startTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
      expect(result).toEqual(mockOrder);
    });

    it('should throw BadRequestException when product service throws error', async () => {
      productService.findOneById = jest.fn().mockRejectedValue(new Error('Product not found'));
      
      await expect(service.create(mockOrderDto, mockUser)).rejects.toThrow(BadRequestException);
      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return an array of orders', async () => {
      const result = await service.findAll({ limit: 10, offset: 0 });
      
      expect(orderRepository.find).toHaveBeenCalledWith({
        take: 10,
        skip: 0,
        relations: ['user', 'products'],
      });
      expect(result).toEqual([mockOrder]);
    });
  });

  describe('findByUser', () => {
    it('should return orders for a specific user', async () => {
      const result = await service.findByUser(mockUser.id, { limit: 10, offset: 0 });
      
      expect(orderRepository.find).toHaveBeenCalledWith({
        where: { userId: mockUser.id },
        take: 10,
        skip: 0,
        relations: ['products'],
      });
      expect(result).toEqual([mockOrder]);
    });
  });

  describe('findOne', () => {
    it('should return a single order', async () => {
      const result = await service.findOne(mockOrder.id);
      
      expect(orderRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockOrder.id },
        relations: ['user', 'products'],
      });
      expect(result).toEqual(mockOrder);
    });

    it('should throw NotFoundException when order not found', async () => {
      orderRepository.findOne = jest.fn().mockResolvedValue(null);
      
      await expect(service.findOne('non-existent-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const updateDto: UpdateOrderDto = { state: OrderState.Preparing };
    
    it('should update an order when user is the owner', async () => {
      const result = await service.update(mockOrder.id, updateDto, mockUser);
      
      expect(orderRepository.update).toHaveBeenCalledWith(mockOrder.id, expect.objectContaining({ 
        state: OrderState.Preparing 
      }));
      expect(result).toEqual(mockOrder);
    });

    it('should update an order when user is admin', async () => {
      const adminUser = { ...mockUser, roles: [ValidRoles.admin] };
      mockOrder.userId = 'different-user-id';
      
      const result = await service.update(mockOrder.id, updateDto, adminUser as User);
      
      expect(orderRepository.update).toHaveBeenCalledWith(mockOrder.id, expect.objectContaining({ 
        state: OrderState.Preparing 
      }));
      expect(result).toEqual(mockOrder);
    });

    it('should throw ForbiddenException when user is not authorized', async () => {
      mockOrder.userId = 'different-user-id';
      
      await expect(service.update(mockOrder.id, updateDto, mockUser)).rejects.toThrow(ForbiddenException);
    });

    it('should update products when productIds are provided', async () => {
      const updateWithProductsDto: UpdateOrderDto = { 
        productIds: ['new-product-id'] 
      };
      
      await service.update(mockOrder.id, updateWithProductsDto, mockUser);
      
      expect(mockQueryRunner.manager.delete).toHaveBeenCalled();
      expect(mockQueryRunner.manager.insert).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should cancel an order by setting state to Cancelled', async () => {
      const result = await service.remove(mockOrder.id);
      
      expect(orderRepository.update).toHaveBeenCalledWith(mockOrder.id, { 
        state: OrderState.Cancelled 
      });
      expect(result).toEqual({
        message: `Order with ID ${mockOrder.id} has been cancelled successfully`
      });
    });
  });
});