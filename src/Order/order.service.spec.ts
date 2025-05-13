import { Test, TestingModule } from '@nestjs/testing';
import { OrderService } from './order.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Order } from './entities/order-entity';
import { DataSource, Repository } from 'typeorm';
import { ProductService } from '../product/product.service';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { User } from '../user/entities/user.entity';
import { Product } from '../product/entities/product.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { ValidRoles } from '../user/enums/valid-roles.enum';
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

  const mockDeliveryUser: User = {
    id: '123e4567-e89b-12d3-a456-426614174111',
    email: 'delivery@example.com',
    password: 'hashedpassword',
    fullName: 'Delivery User',
    isActive: true,
    roles: [ValidRoles.delivery],
  } as User;

  const mockAdminUser: User = {
    id: '123e4567-e89b-12d3-a456-426614174999',
    email: 'admin@example.com',
    password: 'hashedpassword',
    fullName: 'Admin User',
    isActive: true,
    roles: [ValidRoles.admin, ValidRoles.customer],
  } as User;

  const mockProduct1: Product = {
    id: '123e4567-e89b-12d3-a456-426614174001',
    name: 'Test Product 1',
    price: 25.99,
  } as Product;

  const mockProduct2: Product = {
    id: '123e4567-e89b-12d3-a456-426614174002',
    name: 'Test Product 2',
    price: 19.99,
  } as Product;

  const mockOrder: Order = {
    id: '123e4567-e89b-12d3-a456-426614174003',
    total: 45.98,
    date: new Date(),
    userId: mockUser.id,
    state: OrderState.Pending,
    user: mockUser,
    products: [mockProduct1, mockProduct2],
  } as Order;

  const mockCreateOrderDto: CreateOrderDto = {
    productIds: [mockProduct1.id, mockProduct2.id],
    state: OrderState.Pending,
    total: mockOrder.total,
    userId: mockUser.id
  };

  const mockUpdateOrderDto: UpdateOrderDto = {
    state: OrderState.Preparing
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
      create: jest.fn().mockImplementation((dto) => ({ ...dto })),
      save: jest.fn().mockImplementation((order) => Promise.resolve({ ...order, id: mockOrder.id })),
      find: jest.fn().mockResolvedValue([mockOrder]),
      findOne: jest.fn().mockImplementation(({ where }) => {
        if (where.id === mockOrder.id) {
          return Promise.resolve({ ...mockOrder });
        }
        return Promise.resolve(null);
      }),
      update: jest.fn().mockResolvedValue({ affected: 1 }),
      createQueryBuilder: jest.fn().mockReturnValue({
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockOrder]),
      }),
    };

    productService = {
      findOneById: jest.fn().mockImplementation((id) => {
        if (id === mockProduct1.id) return Promise.resolve(mockProduct1);
        if (id === mockProduct2.id) return Promise.resolve(mockProduct2);
        return Promise.reject(new NotFoundException(`Product with id ${id} not found`));
      }),
      findOne: jest.fn().mockImplementation((id) => {
        if (id === mockProduct1.id) return Promise.resolve(mockProduct1);
        if (id === mockProduct2.id) return Promise.resolve(mockProduct2);
        return Promise.reject(new NotFoundException(`Product with id ${id} not found`));
      }),
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

  describe('findAll', () => {
    it('should return an array of orders with pagination', async () => {
      const paginationDto = { limit: 10, offset: 0 };
      const result = await service.findAll(paginationDto);
      
      expect(orderRepository.find).toHaveBeenCalledWith({
        take: 10,
        skip: 0,
        relations: ['user', 'products'],
      });
      expect(result).toEqual([mockOrder]);
    });

    it('should return an empty array when no orders exist', async () => {
      orderRepository.find = jest.fn().mockResolvedValue([]);
      
      const result = await service.findAll({ limit: 10, offset: 0 });
      
      expect(result).toEqual([]);
    });
  });

  describe('findByUser', () => {
    it('should return orders for a specific user with pagination', async () => {
      const paginationDto = { limit: 10, offset: 0 };
      const result = await service.findByUser(mockUser.id, paginationDto);
      
      expect(orderRepository.find).toHaveBeenCalledWith({
        where: { userId: mockUser.id },
        take: 10,
        skip: 0,
        relations: ['products'],
      });
      expect(result).toEqual([mockOrder]);
    });

    it('should return empty array when user has no orders', async () => {
      orderRepository.find = jest.fn().mockResolvedValue([]);
      
      const result = await service.findByUser(mockUser.id, { limit: 10, offset: 0 });
      
      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a single order by id', async () => {
      const result = await service.findOne(mockOrder.id, mockUser);
      
      expect(orderRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockOrder.id },
        relations: ['user', 'products'],
      });
      expect(result).toEqual(mockOrder);
    });

    it('should throw NotFoundException when order not found', async () => {
      orderRepository.findOne = jest.fn().mockResolvedValue(null);
      
      await expect(service.findOne('non-existent-id', mockUser)).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when user is not authorized', async () => {
      const differentUser = { ...mockUser, id: 'different-user-id' };
      const orderWithDifferentUser = { 
        ...mockOrder, 
        userId: 'different-owner-id',
        user: { ...mockUser, id: 'different-owner-id' }
      };
      
      orderRepository.findOne = jest.fn().mockResolvedValue(orderWithDifferentUser);
      
      await expect(service.findOne(mockOrder.id, differentUser as User)).rejects.toThrow(ForbiddenException);
    });

    it('should allow admin to access any order', async () => {
      const orderWithDifferentUser = { 
        ...mockOrder, 
        userId: 'different-owner-id',
        user: { ...mockUser, id: 'different-owner-id' }
      };
      
      orderRepository.findOne = jest.fn().mockResolvedValue(orderWithDifferentUser);
      
      const result = await service.findOne(mockOrder.id, mockAdminUser);
      
      expect(result).toEqual(orderWithDifferentUser);
    });
  });

  describe('create', () => {

    it('should create an order successfully for a valid user and products', async () => {
  mockQueryRunner.commitTransaction = jest.fn().mockResolvedValue(undefined);

  const result = await service.create(mockCreateOrderDto, mockUser);

  expect(result).toHaveProperty('id', mockOrder.id);
  expect(mockQueryRunner.startTransaction).toHaveBeenCalled();
  expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
  expect(mockQueryRunner.release).toHaveBeenCalled();
});
it('should throw ForbiddenException if user is delivery', async () => {
    const deliveryUser = { id: 'user-id', roles: ['delivery'] } as any;
    const dto = { productIds: ['prod-1'] } as CreateOrderDto;

    await expect(service.create(dto, deliveryUser)).rejects.toThrow(ForbiddenException);
  });
    
    it('should throw ForbiddenException if delivery user tries to create order', async () => {
      await expect(service.create(mockCreateOrderDto, mockDeliveryUser))
        .rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException if no productIds are provided', async () => {
      const dtoWithoutProducts = { ...mockCreateOrderDto, productIds: [] };

      await expect(service.create(dtoWithoutProducts, mockUser)).rejects.toThrow(BadRequestException);
    });

    it('should rollback transaction if save fails', async () => {
      orderRepository.save = jest.fn().mockRejectedValue(new Error('DB error'));

      await expect(service.create(mockCreateOrderDto, mockUser)).rejects.toThrow(BadRequestException);

      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
    });

    it('should rollback if commitTransaction fails', async () => {
      mockQueryRunner.commitTransaction = jest.fn().mockRejectedValue(new Error('Commit error'));

      await expect(service.create(mockCreateOrderDto, mockUser)).rejects.toThrow(BadRequestException);

      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    
    it('should throw NotFoundException if order does not exist', async () => {
      orderRepository.findOne = jest.fn().mockResolvedValue(null);

      await expect(service.update('non-existent-id', mockUpdateOrderDto, mockUser))
        .rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user is not the owner', async () => {
      const differentUser = { ...mockUser, id: 'different-user-id' };
      const orderWithDifferentUser = { 
        ...mockOrder, 
        userId: 'different-owner-id',
        user: { id: 'different-owner-id' } as User
      };
      
      orderRepository.findOne = jest.fn().mockResolvedValue(orderWithDifferentUser);
      
      await expect(service.update(mockOrder.id, mockUpdateOrderDto, differentUser as User))
        .rejects.toThrow(ForbiddenException);
    });


    it('should restrict delivery users to only update state', async () => {
      orderRepository.findOne = jest.fn().mockResolvedValue(mockOrder);
      
      await expect(service.update(
        mockOrder.id, 
        { 
          state: OrderState.OnTheWay,
          productIds: [mockProduct1.id]  
        }, 
        mockDeliveryUser
      )).rejects.toThrow(ForbiddenException);
    });

 
  });

  describe('remove', () => {
    it('should cancel an order by setting state to Cancelled', async () => {
      const result = await service.remove(mockOrder.id, mockUser);
      
      expect(orderRepository.findOne).toHaveBeenCalled();
      expect(orderRepository.update).toHaveBeenCalledWith(mockOrder.id, { 
        state: OrderState.Cancelled 
      });
      expect(result).toEqual({
        message: `Order with ID ${mockOrder.id} has been cancelled successfully`
      });
    });

    it('should throw BadRequestException if order is OnTheWay or Delivered', async () => {
  const order = { id: '1', userId: 'user1', state: OrderState.OnTheWay } as Order;
  const user = { id: 'user1', roles: ['customer'] } as User;

  jest.spyOn(orderRepository, 'findOne').mockResolvedValue(order);

  await expect(service.remove('1', user)).rejects.toThrow(BadRequestException);
});


    it('should throw NotFoundException when order not found', async () => {
      orderRepository.findOne = jest.fn().mockResolvedValue(null);
      
      await expect(service.remove('non-existent-id', mockUser)).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when user is not authorized', async () => {
      const differentUser = { ...mockUser, id: 'different-user-id' };
      const orderWithDifferentUser = { 
        ...mockOrder, 
        userId: 'different-owner-id',
        user: { ...mockUser, id: 'different-owner-id' }
      };
      
      orderRepository.findOne = jest.fn().mockResolvedValue(orderWithDifferentUser);
      
      await expect(service.remove(mockOrder.id, differentUser as User)).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException if order is already delivered or on the way', async () => {
      const deliveredOrder = { 
        ...mockOrder, 
        state: OrderState.Delivered 
      };
      
      orderRepository.findOne = jest.fn().mockResolvedValue(deliveredOrder);
      
      await expect(service.remove(mockOrder.id, mockUser)).rejects.toThrow(BadRequestException);
    });

    it('should allow admin to cancel any order', async () => {
      const orderWithDifferentUser = { 
        ...mockOrder, 
        userId: 'different-owner-id',
        user: { ...mockUser, id: 'different-owner-id' }
      };
      
      orderRepository.findOne = jest.fn().mockResolvedValue(orderWithDifferentUser);
      
      const result = await service.remove(mockOrder.id, mockAdminUser);
      
      expect(orderRepository.update).toHaveBeenCalledWith(mockOrder.id, { 
        state: OrderState.Cancelled 
      });
      expect(result).toEqual({
        message: `Order with ID ${mockOrder.id} has been cancelled successfully`
      });
    });
  });
  
  describe('findByDateRange', () => {
    it('should find orders between dates', async () => {
      const startDate = new Date('2023-01-01');
      const endDate = new Date('2023-12-31');
      
      const result = await service.findByDateRange(startDate, endDate);
      
      expect(result).toEqual([mockOrder]);
      expect(orderRepository.createQueryBuilder).toHaveBeenCalled();
    });

    it('should call query without state filter if states are not provided', async () => {
  const mockQuery = {
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    getMany: jest.fn().mockResolvedValue([]),
  };

  jest.spyOn(orderRepository, 'createQueryBuilder').mockReturnValue(mockQuery as any);

  await service.findByDateRange(new Date(), new Date(), undefined);

  expect(mockQuery.where).toHaveBeenCalled();
  expect(mockQuery.getMany).toHaveBeenCalled();
});

    
    it('should filter by states if provided', async () => {
      const startDate = new Date('2023-01-01');
      const endDate = new Date('2023-12-31');
      const states = [OrderState.Pending, OrderState.Preparing];
      
      const result = await service.findByDateRange(startDate, endDate, states);
      
      expect(result).toEqual([mockOrder]);
    });
  });
});
