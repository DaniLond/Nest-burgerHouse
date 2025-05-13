import { Test, TestingModule } from '@nestjs/testing';
import { ToppingController } from './topping.controller';
import { ToppingService } from './topping.service';
import { CreateToppingDto } from './dto/create-topping.dto';
import { UpdateToppingDto } from './dto/update-topping.dto';
import { CreateProductToppingDto } from './dto/create-product-topping.dto';
import { Topping } from './entities/topping.entity';
import { ProductTopping } from './entities/product-topping.entity';
import { PaginationDto } from '../commons/dto/pagination.dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';

describe('ToppingController', () => {
  let controller: ToppingController;
  let service: ToppingService;

  const mockTopping: Topping = {
    id: 'cd533345-f1f3-48c9-a62e-7dc2da50c8f8',
    name: 'Extra Cheese',
    price: 5000,
    maximumAmount: 3,
    isActive: true,
    productToppings: [],
    checkFieldsBeforeInsert: jest.fn(),
    checkFieldsBeforeUpdate: jest.fn(),
  };

  const mockProductTopping: ProductTopping = {
    id: 'cd533345-f1f3-48c9-a62e-7dc2da50c8f7',
    product_id: 'cd533345-f1f3-48c9-a62e-7dc2da50c8f9',
    topping_id: mockTopping.id,
    quantity: 2,
    product: {} as any,
    topping: mockTopping,
  };

  const mockCreateToppingDto: CreateToppingDto = {
    name: 'Extra Cheese',
    price: 5000,
    maximumAmount: 3,
  };

  const mockUpdateToppingDto: UpdateToppingDto = {
    name: 'Double Cheese',
    price: 7000,
    maximumAmount: 5,
    isActive: false,
  };

  const mockCreateProductToppingDto: CreateProductToppingDto = {
    product_id: 'cd533345-f1f3-48c9-a62e-7dc2da50c8f9',
    topping_id: 'cd533345-f1f3-48c9-a62e-7dc2da50c8f8',
    quantity: 2,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
      controllers: [ToppingController],
      providers: [
        {
          provide: ToppingService,
          useValue: {
            create: jest.fn().mockResolvedValue(mockTopping),
            findAll: jest.fn().mockResolvedValue([mockTopping]),
            findOne: jest.fn().mockResolvedValue(mockTopping),
            update: jest.fn().mockResolvedValue({
              ...mockTopping,
              ...mockUpdateToppingDto,
            }),
            remove: jest.fn().mockResolvedValue({
              message: 'Topping Extra Cheese deleted successfully',
            }),
            addToppingToProduct: jest
              .fn()
              .mockResolvedValue(mockProductTopping),
            removeToppingFromProduct: jest.fn().mockResolvedValue({
              message: 'Product-Topping relationship deleted successfully',
            }),
            getToppingsByProduct: jest
              .fn()
              .mockResolvedValue([mockProductTopping]),
          },
        },
      ],
    }).compile();

    controller = module.get<ToppingController>(ToppingController);
    service = module.get<ToppingService>(ToppingService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create()', () => {
    it('should create a new topping', async () => {
      const result = await controller.create(mockCreateToppingDto);

      expect(service.create).toHaveBeenCalledWith(mockCreateToppingDto);
      expect(result).toEqual(mockTopping);
    });

    it('should throw BadRequestException when service throws it', async () => {
      jest
        .spyOn(service, 'create')
        .mockRejectedValueOnce(new BadRequestException());
      await expect(controller.create(mockCreateToppingDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAll()', () => {
    it('should return an array of toppings', async () => {
      const paginationDto: PaginationDto = { limit: 10, offset: 0 };
      const result = await controller.findAll(paginationDto);

      expect(service.findAll).toHaveBeenCalledWith(paginationDto);
      expect(result).toEqual([mockTopping]);
    });

    it('should return empty array when no toppings exist', async () => {
      jest.spyOn(service, 'findAll').mockResolvedValueOnce([]);
      const paginationDto: PaginationDto = { limit: 10, offset: 0 };
      const result = await controller.findAll(paginationDto);

      expect(result).toEqual([]);
    });
  });

  describe('findOne()', () => {
    it('should return a single topping by name', async () => {
      const result = await controller.findOne('Extra Cheese');

      expect(service.findOne).toHaveBeenCalledWith('Extra Cheese');
      expect(result).toEqual(mockTopping);
    });

    it('should throw NotFoundException when topping does not exist', async () => {
      jest
        .spyOn(service, 'findOne')
        .mockRejectedValueOnce(new NotFoundException());
      await expect(controller.findOne('Nonexistent Topping')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update()', () => {
    it('should update a topping', async () => {
      const result = await controller.update(
        'Extra Cheese',
        mockUpdateToppingDto,
      );

      expect(service.update).toHaveBeenCalledWith(
        'Extra Cheese',
        mockUpdateToppingDto,
      );
      expect(result).toEqual({
        ...mockTopping,
        ...mockUpdateToppingDto,
      });
    });

    it('should throw NotFoundException when topping to update does not exist', async () => {
      jest
        .spyOn(service, 'update')
        .mockRejectedValueOnce(new NotFoundException());
      await expect(
        controller.update('Nonexistent', mockUpdateToppingDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove()', () => {
    it('should delete a topping', async () => {
      const result = await controller.remove('Extra Cheese');

      expect(service.remove).toHaveBeenCalledWith('Extra Cheese');
      expect(result).toEqual({
        message: 'Topping Extra Cheese deleted successfully',
      });
    });

    it('should throw NotFoundException when topping to delete does not exist', async () => {
      jest
        .spyOn(service, 'remove')
        .mockRejectedValueOnce(new NotFoundException());
      await expect(controller.remove('Nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('addToppingToProduct()', () => {
    it('should add a topping to a product', async () => {
      const result = await controller.addToppingToProduct(
        mockCreateProductToppingDto,
      );

      expect(service.addToppingToProduct).toHaveBeenCalledWith(
        mockCreateProductToppingDto,
      );
      expect(result).toEqual(mockProductTopping);
    });

    it('should throw BadRequestException when quantity exceeds maximum', async () => {
      jest
        .spyOn(service, 'addToppingToProduct')
        .mockRejectedValueOnce(new BadRequestException());
      await expect(
        controller.addToppingToProduct(mockCreateProductToppingDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException when product or topping does not exist', async () => {
      jest
        .spyOn(service, 'addToppingToProduct')
        .mockRejectedValueOnce(new NotFoundException());
      await expect(
        controller.addToppingToProduct(mockCreateProductToppingDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('removeToppingFromProduct()', () => {
    it('should remove a topping from a product', async () => {
      const result =
        await controller.removeToppingFromProduct('relationship-id');

      expect(service.removeToppingFromProduct).toHaveBeenCalledWith(
        'relationship-id',
      );
      expect(result).toEqual({
        message: 'Product-Topping relationship deleted successfully',
      });
    });

    it('should throw NotFoundException when relationship does not exist', async () => {
      jest
        .spyOn(service, 'removeToppingFromProduct')
        .mockRejectedValueOnce(new NotFoundException());
      await expect(
        controller.removeToppingFromProduct('nonexistent-id'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getToppingsByProduct()', () => {
    it('should return toppings for a specific product', async () => {
      const result = await controller.getToppingsByProduct('product-id');

      expect(service.getToppingsByProduct).toHaveBeenCalledWith('product-id');
      expect(result).toEqual([mockProductTopping]);
    });

    it('should throw NotFoundException when product does not exist', async () => {
      jest
        .spyOn(service, 'getToppingsByProduct')
        .mockRejectedValueOnce(new NotFoundException());
      await expect(
        controller.getToppingsByProduct('nonexistent-id'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should return empty array when product has no toppings', async () => {
      jest.spyOn(service, 'getToppingsByProduct').mockResolvedValueOnce([]);
      const result = await controller.getToppingsByProduct(
        'product-without-toppings',
      );
      expect(result).toEqual([]);
    });
  });
});
