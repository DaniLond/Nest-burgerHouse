import { Test, TestingModule } from '@nestjs/testing';
import { ToppingService } from './topping.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Topping } from './entities/topping.entity';
import { Product } from '../product/entities/product.entity';
import { ProductTopping } from './entities/product-topping.entity';
import { Repository } from 'typeorm';
import { CreateToppingDto } from './dto/create-topping.dto';
import { UpdateToppingDto } from './dto/update-topping.dto';
import { CreateProductToppingDto } from './dto/create-product-topping.dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PaginationDto } from '../commons/dto/pagination.dto';
import { ProductCategories } from 'src/product/enums/valid-categories.enum';

describe('ToppingService', () => {
  let service: ToppingService;
  let toppingRepository: Repository<Topping>;
  let productRepository: Repository<Product>;
  let productToppingRepository: Repository<ProductTopping>;

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

  const mockProduct: Product = {
    id: 'cd533345-f1f3-48c9-a62e-7dc2da50c8f9',
    name: 'Classic Burger',
    description: 'Delicious burger',
    price: 20000,
    isActive: true,
    category: ProductCategories.burgers,
    productToppings: [],
    checkFieldsBeforeInsert: jest.fn(),
    checkFieldsBeforeUpdate: jest.fn(),
  };

  const mockProductTopping: ProductTopping = {
    id: 'cd533345-f1f3-48c9-a62e-7dc2da50c8f7',
    product_id: mockProduct.id,
    topping_id: mockTopping.id,
    quantity: 2,
    product: mockProduct,
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
    product_id: mockProduct.id,
    topping_id: mockTopping.id,
    quantity: 2,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ToppingService,
        {
          provide: getRepositoryToken(Topping),
          useValue: {
            create: jest.fn().mockResolvedValue(mockTopping),
            save: jest.fn().mockResolvedValue(mockTopping),
            find: jest.fn().mockResolvedValue([mockTopping]),
            findOneBy: jest.fn().mockResolvedValue(mockTopping),
            update: jest.fn().mockResolvedValue({ affected: 1 }),
          },
        },
        {
          provide: getRepositoryToken(Product),
          useValue: {
            findOneBy: jest.fn().mockResolvedValue(mockProduct),
          },
        },
        {
          provide: getRepositoryToken(ProductTopping),
          useValue: {
            create: jest.fn().mockResolvedValue(mockProductTopping),
            save: jest.fn().mockResolvedValue(mockProductTopping),
            find: jest.fn().mockResolvedValue([mockProductTopping]),
            findOne: jest.fn().mockResolvedValue(null), // Por defecto no encuentra relaciones
            findOneBy: jest.fn().mockResolvedValue(mockProductTopping),
            remove: jest.fn().mockResolvedValue(mockProductTopping),
          },
        },
      ],
    }).compile();

    service = module.get<ToppingService>(ToppingService);
    toppingRepository = module.get<Repository<Topping>>(
      getRepositoryToken(Topping),
    );
    productRepository = module.get<Repository<Product>>(
      getRepositoryToken(Product),
    );
    productToppingRepository = module.get<Repository<ProductTopping>>(
      getRepositoryToken(ProductTopping),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new topping', async () => {
      const result = await service.create(mockCreateToppingDto);

      expect(toppingRepository.create).toHaveBeenCalledWith(
        mockCreateToppingDto,
      );
      expect(toppingRepository.save).toHaveBeenCalled();
      expect(result).toEqual(mockTopping);
    });

    it('should throw generic BadRequestException on unexpected DB error during create', async () => {
  jest.spyOn(toppingRepository, 'save').mockRejectedValueOnce(new Error('Unexpected error'));

  await expect(service.create(mockCreateToppingDto)).rejects.toThrow(BadRequestException);
});


    it('should throw BadRequestException when topping creation fails', async () => {
      jest.spyOn(toppingRepository, 'save').mockRejectedValueOnce({
        code: '23505',
        detail: 'Topping already exists',
      });

      await expect(service.create(mockCreateToppingDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAll', () => {
    it('should return an array of active toppings', async () => {
      const paginationDto: PaginationDto = { limit: 10, offset: 0 };
      const result = await service.findAll(paginationDto);

      expect(toppingRepository.find).toHaveBeenCalledWith({
        take: 10,
        skip: 0,
        where: { isActive: true },
      });
      expect(result).toEqual([mockTopping]);
    });
  });

  describe('findOne', () => {
    it('should return a single topping by name', async () => {
      const result = await service.findOne('Extra Cheese');

      expect(toppingRepository.findOneBy).toHaveBeenCalledWith({
        name: 'Extra Cheese',
        isActive: true,
      });
      expect(result).toEqual(mockTopping);
    });

    it('should throw NotFoundException if topping not found', async () => {
      jest.spyOn(toppingRepository, 'findOneBy').mockResolvedValueOnce(null);

      await expect(service.findOne('Nonexistent Topping')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a topping', async () => {
      const result = await service.update('Extra Cheese', mockUpdateToppingDto);

      expect(toppingRepository.findOneBy).toHaveBeenCalledWith({
        name: 'Extra Cheese',
        isActive: true,
      });
      expect(toppingRepository.update).toHaveBeenCalledWith(
        { name: 'Extra Cheese' },
        mockUpdateToppingDto,
      );
      expect(result).toEqual({
        ...mockTopping,
        ...mockUpdateToppingDto,
      });
    });

    it('should throw NotFoundException if topping to update not found', async () => {
      jest.spyOn(toppingRepository, 'findOneBy').mockResolvedValueOnce(null);

      await expect(
        service.update('Nonexistent Topping', mockUpdateToppingDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if update fails with DB error', async () => {
  jest.spyOn(toppingRepository, 'update').mockRejectedValueOnce({
    code: '23505',
    detail: 'Duplicate key',
  });

  await expect(
    service.update('Extra Cheese', mockUpdateToppingDto),
  ).rejects.toThrow(BadRequestException);
});

  });

  describe('remove', () => {
    it('should deactivate a topping (soft delete)', async () => {
      const result = await service.remove('Extra Cheese');

      expect(toppingRepository.findOneBy).toHaveBeenCalledWith({
        name: 'Extra Cheese',
        isActive: true,
      });
      expect(toppingRepository.update).toHaveBeenCalledWith(
        { name: 'Extra Cheese' },
        { isActive: false },
      );
      expect(result).toEqual({
        message: 'Product Extra Cheese deleted successfully',
      });
    });

    it('should throw NotFoundException if topping to delete not found', async () => {
      jest.spyOn(toppingRepository, 'findOneBy').mockResolvedValueOnce(null);

      await expect(service.remove('Nonexistent Topping')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('addToppingToProduct', () => {
    it('should add a topping to a product', async () => {
      
      jest
        .spyOn(productToppingRepository, 'findOne')
        .mockResolvedValueOnce(null);

      const result = await service.addToppingToProduct(
        mockCreateProductToppingDto,
      );

      expect(productRepository.findOneBy).toHaveBeenCalledWith({
        id: mockProduct.id,
        isActive: true,
      });
      expect(toppingRepository.findOneBy).toHaveBeenCalledWith({
        id: mockTopping.id,
        isActive: true,
      });
      expect(productToppingRepository.findOne).toHaveBeenCalledWith({
        where: {
          product_id: mockProduct.id,
          topping_id: mockTopping.id,
        },
      });
      expect(productToppingRepository.create).toHaveBeenCalledWith(
        mockCreateProductToppingDto,
      );
      expect(productToppingRepository.save).toHaveBeenCalled();
      expect(result).toEqual(mockProductTopping);
    });

    it('should throw generic BadRequestException if DB error during productTopping save', async () => {
  jest.spyOn(productToppingRepository, 'findOne').mockResolvedValueOnce(null);
  jest.spyOn(productToppingRepository, 'save').mockRejectedValueOnce(new Error('Unexpected error'));

  await expect(
    service.addToppingToProduct(mockCreateProductToppingDto),
  ).rejects.toThrow(BadRequestException);
});


    it('should throw NotFoundException if product not found', async () => {
      jest.spyOn(productRepository, 'findOneBy').mockResolvedValueOnce(null);

      await expect(
        service.addToppingToProduct(mockCreateProductToppingDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if topping not found', async () => {
      jest.spyOn(toppingRepository, 'findOneBy').mockResolvedValueOnce(null);

      await expect(
        service.addToppingToProduct(mockCreateProductToppingDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if quantity exceeds maximum amount', async () => {
      const invalidDto = { ...mockCreateProductToppingDto, quantity: 5 };

      await expect(service.addToppingToProduct(invalidDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if topping already added to product', async () => {
      // Sobreescribimos el mock solo para esta prueba
      jest
        .spyOn(productToppingRepository, 'findOne')
        .mockResolvedValueOnce(mockProductTopping);

      await expect(
        service.addToppingToProduct(mockCreateProductToppingDto),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('removeToppingFromProduct', () => {
    it('should remove a topping from a product', async () => {
      const result = await service.removeToppingFromProduct(
        mockProductTopping.id,
      );

      expect(productToppingRepository.findOneBy).toHaveBeenCalledWith({
        id: mockProductTopping.id,
      });
      expect(productToppingRepository.remove).toHaveBeenCalled();
      expect(result).toEqual({
        message: `Product ${mockProductTopping.id} deleted successfully`,
      });
    });

    it('should throw NotFoundException if product-topping relationship not found', async () => {
      jest
        .spyOn(productToppingRepository, 'findOneBy')
        .mockResolvedValueOnce(null);

      await expect(
        service.removeToppingFromProduct('nonexistent-id'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getToppingsByProduct', () => {
    it('should return toppings for a specific product', async () => {
      const result = await service.getToppingsByProduct(mockProduct.id);

      expect(productRepository.findOneBy).toHaveBeenCalledWith({
        id: mockProduct.id,
        isActive: true,
      });
      expect(productToppingRepository.find).toHaveBeenCalledWith({
        where: { product_id: mockProduct.id },
        relations: ['topping'],
      });
      expect(result).toEqual([mockProductTopping]);
    });

    it('should throw NotFoundException if product not found', async () => {
      jest.spyOn(productRepository, 'findOneBy').mockResolvedValueOnce(null);

      await expect(
        service.getToppingsByProduct('nonexistent-id'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
