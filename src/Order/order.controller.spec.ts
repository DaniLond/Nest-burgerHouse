import { Test, TestingModule } from '@nestjs/testing';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { User } from 'src/user/entities/user.entity';
import { ValidRoles } from 'src/user/enums/valid-roles.enum';
import { OrderState } from './enums/valid-state.enums';

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

  const mockCreateOrderDto: CreateOrderDto = {
    total: 45.99,
    userId: mockUser.id,
    productIds: ['product-uuid-1', 'product-uuid-2'],
    state: OrderState.Pending,
  };

  const mockUpdateOrderDto: UpdateOrderDto = {
    state: OrderState.Preparing,
  };

  beforeEach(async () => {
    mockOrderService = {
      create: jest.fn().mockResolvedValue({ id: 'order-uuid', ...mockCreateOrderDto }),
      findAll: jest.fn().mockResolvedValue([]),
      findByUser: jest.fn().mockResolvedValue([]),
      findOne: jest.fn().mockResolvedValue({ id: 'order-uuid', ...mockCreateOrderDto }),
      update: jest.fn().mockResolvedValue({ id: 'order-uuid', ...mockUpdateOrderDto }),
      remove: jest.fn().mockResolvedValue({ message: 'Order cancelled' }),
    };

    const module: TestingModule = await Test.createTestingModule({
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
    it('should create an order', async () => {
      const result = await controller.create(mockCreateOrderDto, mockUser);
      expect(mockOrderService.create).toHaveBeenCalledWith(mockCreateOrderDto, mockUser);
      expect(result).toEqual(expect.objectContaining({
        id: 'order-uuid',
        ...mockCreateOrderDto,
      }));
    });
  });

  describe('findAll', () => {
    it('should return an array of orders', async () => {
      const result = await controller.findAll({ limit: 10, offset: 0 });
      expect(mockOrderService.findAll).toHaveBeenCalledWith({ limit: 10, offset: 0 });
      expect(result).toEqual([]);
    });
  });

  describe('findByUser', () => {
    it('should return orders for the current user', async () => {
      const result = await controller.findByUser(mockUser, { limit: 10, offset: 0 });
      expect(mockOrderService.findByUser).toHaveBeenCalledWith(mockUser.id, { limit: 10, offset: 0 });
      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a single order', async () => {
      const result = await controller.findOne('order-uuid');
      expect(mockOrderService.findOne).toHaveBeenCalledWith('order-uuid');
      expect(result).toEqual(expect.objectContaining({
        id: 'order-uuid',
        ...mockCreateOrderDto,
      }));
    });
  });

  describe('update', () => {
    it('should update an order', async () => {
      const result = await controller.update('order-uuid', mockUpdateOrderDto, mockUser);
      expect(mockOrderService.update).toHaveBeenCalledWith('order-uuid', mockUpdateOrderDto, mockUser);
      expect(result).toEqual(expect.objectContaining({
        id: 'order-uuid',
        ...mockUpdateOrderDto,
      }));
    });
  });

  describe('remove', () => {
    it('should cancel an order', async () => {
      const result = await controller.remove('order-uuid');
      expect(mockOrderService.remove).toHaveBeenCalledWith('order-uuid');
      expect(result).toEqual({ message: 'Order cancelled' });
    });
  });
});