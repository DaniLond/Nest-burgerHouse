import { Test, TestingModule } from '@nestjs/testing';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { User } from 'src/user/entities/user.entity';
import { ValidRoles } from 'src/user/enums/valid-roles.enum';
import { OrderState } from './enums/valid-state.enums';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';

describe('OrderController', () => {
  let controller: OrderController;
  let mockOrderService: Partial<OrderService>;

  const mockUser: User = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@example.com',
    fullName: 'Test User',
    roles: ['user'],
    isActive: true,
  } as User;

  const mockAdminUser: User = {
    id: '123e4567-e89b-12d3-a456-426614174999',
    email: 'admin@example.com',
    fullName: 'Admin User',
    roles: [ValidRoles.admin],
    isActive: true,
  } as User;
  
  const mockCreateOrderDto: CreateOrderDto = {
    total: 45.99,
    userId: mockUser.id,
    productIds: ['product-uuid-1', 'product-uuid-2'],
    state: OrderState.Pending,
  };

  const mockUpdateOrderDto: UpdateOrderDto = {
    state: OrderState.Preparing,
  };

  const mockOrder = {
    id: 'order-uuid',
    ...mockCreateOrderDto,
    date: new Date(),
    user: mockUser,
    products: [
      { id: 'product-uuid-1', title: 'Product 1', price: 20.99 },
      { id: 'product-uuid-2', title: 'Product 2', price: 25.00 },
    ]
  };

  beforeEach(async () => {
    mockOrderService = {
      create: jest.fn().mockResolvedValue({ id: 'order-uuid', ...mockCreateOrderDto }),
      findAll: jest.fn().mockResolvedValue([mockOrder]),
      findByUser: jest.fn().mockResolvedValue([mockOrder]),
      findOne: jest.fn().mockResolvedValue(mockOrder),
      update: jest.fn().mockResolvedValue({ id: 'order-uuid', ...mockUpdateOrderDto }),
      remove: jest.fn().mockResolvedValue({ message: 'Order with ID order-uuid has been cancelled successfully' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
      controllers: [OrderController],
      providers: [
        {
          provide: OrderService,
          useValue: mockOrderService,
        },
      ],
    }).compile();

    controller = module.get<OrderController>(OrderController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create an order successfully', async () => {
      const result = await controller.create(mockCreateOrderDto, mockUser);
      
      expect(mockOrderService.create).toHaveBeenCalledWith(mockCreateOrderDto, mockUser);
      expect(result).toEqual(expect.objectContaining({
        id: 'order-uuid',
        ...mockCreateOrderDto,
      }));
    });

    it('should handle errors when order creation fails', async () => {
      mockOrderService.create = jest.fn().mockRejectedValue(new BadRequestException('Invalid products'));
      
      await expect(controller.create(mockCreateOrderDto, mockUser)).rejects.toThrow(BadRequestException);
      expect(mockOrderService.create).toHaveBeenCalledWith(mockCreateOrderDto, mockUser);
    });
  });

  describe('findAll', () => {
    it('should return an array of all orders with pagination', async () => {
      const paginationDto = { limit: 10, offset: 0 };
      const result = await controller.findAll(paginationDto);
      
      expect(mockOrderService.findAll).toHaveBeenCalledWith(paginationDto);
      expect(result).toEqual([mockOrder]);
    });

    it('should handle empty array when no orders exist', async () => {
      mockOrderService.findAll = jest.fn().mockResolvedValue([]);
      
      const result = await controller.findAll({ limit: 10, offset: 0 });
      
      expect(result).toEqual([]);
    });
  });

  describe('findByUser', () => {
    it('should return orders for the current user with pagination', async () => {
      const paginationDto = { limit: 10, offset: 0 };
      const result = await controller.findByUser(mockUser, paginationDto);
      
      expect(mockOrderService.findByUser).toHaveBeenCalledWith(mockUser.id, paginationDto);
      expect(result).toEqual([mockOrder]);
    });

    it('should return empty array when user has no orders', async () => {
      mockOrderService.findByUser = jest.fn().mockResolvedValue([]);
      
      const result = await controller.findByUser(mockUser, { limit: 10, offset: 0 });
      
      expect(mockOrderService.findByUser).toHaveBeenCalledWith(mockUser.id, { limit: 10, offset: 0 });
      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a single order as customer', async () => {
      const customer = {
        id: mockUser.id,
        roles: ['customer'],
      } as User;

      const result = await controller.findOne('order-uuid', customer);
      
      expect(mockOrderService.findOne).toHaveBeenCalledWith('order-uuid', customer);
      expect(result).toEqual(mockOrder);
    });

    it('should return a single order as admin', async () => {
      const result = await controller.findOne('order-uuid', mockAdminUser);
      
      expect(mockOrderService.findOne).toHaveBeenCalledWith('order-uuid', mockAdminUser);
      expect(result).toEqual(mockOrder);
    });

    it('should handle error when order not found', async () => {
      mockOrderService.findOne = jest.fn().mockRejectedValue(
        new NotFoundException('Order with ID not-found not found')
      );
      
      await expect(controller.findOne('not-found', mockUser)).rejects.toThrow(NotFoundException);
      expect(mockOrderService.findOne).toHaveBeenCalledWith('not-found', mockUser);
    });
  });

  describe('update', () => {
    it('should update an order successfully', async () => {
      const updatedOrder = { ...mockOrder, ...mockUpdateOrderDto };
      mockOrderService.update = jest.fn().mockResolvedValue(updatedOrder);
      
      const result = await controller.update('order-uuid', mockUpdateOrderDto, mockUser);
      
      expect(mockOrderService.update).toHaveBeenCalledWith('order-uuid', mockUpdateOrderDto, mockUser);
      expect(result).toEqual(updatedOrder);
    });

    it('should handle unauthorized update attempts', async () => {
      mockOrderService.update = jest.fn().mockRejectedValue(
        new ForbiddenException('User not authorized to update this order')
      );
      
      await expect(controller.update('order-uuid', mockUpdateOrderDto, mockUser)).rejects.toThrow(ForbiddenException);
      expect(mockOrderService.update).toHaveBeenCalledWith('order-uuid', mockUpdateOrderDto, mockUser);
    });

    it('should handle not found order during update', async () => {
      mockOrderService.update = jest.fn().mockRejectedValue(
        new NotFoundException('Order with ID not-found not found')
      );
      
      await expect(controller.update('not-found', mockUpdateOrderDto, mockUser)).rejects.toThrow(NotFoundException);
      expect(mockOrderService.update).toHaveBeenCalledWith('not-found', mockUpdateOrderDto, mockUser);
    });
  });

  describe('remove', () => {
    it('should cancel an order successfully', async () => {
      const result = await controller.remove('order-uuid', mockUser);
      
      expect(mockOrderService.remove).toHaveBeenCalledWith('order-uuid', mockUser);
      expect(result).toEqual({ message: 'Order with ID order-uuid has been cancelled successfully' });
    });

    it('should handle not found order during removal', async () => {
      mockOrderService.remove = jest.fn().mockRejectedValue(
        new NotFoundException('Order with ID not-found not found')
      );
      
      await expect(controller.remove('not-found', mockUser)).rejects.toThrow(NotFoundException);
      expect(mockOrderService.remove).toHaveBeenCalledWith('not-found', mockUser);
    });

    it('should handle unauthorized removal attempts', async () => {
      mockOrderService.remove = jest.fn().mockRejectedValue(
        new ForbiddenException('User not authorized to cancel this order')
      );
      
      await expect(controller.remove('order-uuid', mockUser)).rejects.toThrow(ForbiddenException);
      expect(mockOrderService.remove).toHaveBeenCalledWith('order-uuid', mockUser);
    });
  });
});