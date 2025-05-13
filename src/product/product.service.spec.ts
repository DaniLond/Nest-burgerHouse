import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from './product.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductCategories } from './enums/valid-categories.enum';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PaginationDto } from '../commons/dto/pagination.dto';

describe('ProductService', () => {
  let service: ProductService;
  let productRepository: Repository<Product>;

  const mockProduct: Product = {
    id: 'cd533345-f1f3-48c9-a62e-7dc2da50c8f8',
    name: 'Classic Burger',
    description:
      'Delicious beef burger with lettuce, tomato, and special sauce',
    price: 20.0,
    isActive: true,
    category: ProductCategories.burgers,
    productToppings: [],
    checkFieldsBeforeInsert: jest.fn(),
    checkFieldsBeforeUpdate: jest.fn(),
  };

  const mockProductResponse = {
    ...mockProduct,
  };

  const mockCreateProductDto: CreateProductDto = {
    name: 'Classic Burger',
    description:
      'Delicious beef burger with lettuce, tomato, and special sauce',
    price: 20.0,
    category: ProductCategories.burgers,
  };

  const mockUpdateProductDto: UpdateProductDto = {
    name: 'Updated Burger',
    description: 'Updated description',
    price: 25.0,
    isActive: false,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        {
          provide: getRepositoryToken(Product),
          useValue: {
            create: jest.fn().mockResolvedValue(mockProduct),
            save: jest.fn().mockResolvedValue(mockProduct),
            find: jest.fn().mockResolvedValue([mockProduct]),
            findOneBy: jest.fn().mockResolvedValue(mockProduct),
            update: jest.fn().mockResolvedValue({ affected: 1 }),
            delete: jest.fn().mockResolvedValue({ affected: 1 }),
          },
        },
      ],
    }).compile();

    service = module.get<ProductService>(ProductService);
    productRepository = module.get<Repository<Product>>(
      getRepositoryToken(Product),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new product', async () => {
      const result = await service.create(mockCreateProductDto);

      expect(productRepository.create).toHaveBeenCalledWith(
        mockCreateProductDto,
      );
      expect(productRepository.save).toHaveBeenCalled();
      expect(result).toEqual(mockProductResponse);
    });

    it('should throw BadRequestException when product creation fails', async () => {
      jest.spyOn(productRepository, 'save').mockRejectedValueOnce({
        code: '23505',
        detail: 'Product already exists',
      });

      await expect(service.create(mockCreateProductDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAll', () => {
    it('should return an array of active products', async () => {
      const paginationDto: PaginationDto = { limit: 10, offset: 0 };
      const result = await service.findAll(paginationDto);

      expect(productRepository.find).toHaveBeenCalledWith({
        take: 10,
        skip: 0,
        where: { isActive: true },
      });
      expect(result).toEqual([mockProductResponse]);
    });
  });

  describe('findOne', () => {
    it('should return a single product by name', async () => {
      const result = await service.findOne('Classic Burger');

      expect(productRepository.findOneBy).toHaveBeenCalledWith({
        name: 'Classic Burger',
        isActive: true,
      });
      expect(result).toEqual(mockProductResponse);
    });

    it('should throw NotFoundException if product not found', async () => {
      jest.spyOn(productRepository, 'findOneBy').mockResolvedValueOnce(null);

      await expect(service.findOne('Nonexistent Burger')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a product', async () => {
      const result = await service.update(
        'Classic Burger',
        mockUpdateProductDto,
      );

      expect(productRepository.findOneBy).toHaveBeenCalledWith({
        name: 'Classic Burger',
        isActive: true,
      });
      expect(productRepository.update).toHaveBeenCalledWith(
        { name: 'Classic Burger' },
        mockUpdateProductDto,
      );
      expect(result).toEqual({
        ...mockProduct,
        ...mockUpdateProductDto,
      });
    });

    it('should throw NotFoundException if product to update not found', async () => {
      jest.spyOn(productRepository, 'findOneBy').mockResolvedValueOnce(null);

      await expect(
        service.update('Nonexistent Burger', mockUpdateProductDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should deactivate a product (soft delete)', async () => {
      const result = await service.remove('Classic Burger');

      expect(productRepository.findOneBy).toHaveBeenCalledWith({
        name: 'Classic Burger',
        isActive: true,
      });
      expect(productRepository.update).toHaveBeenCalledWith(
        { name: 'Classic Burger' },
        { isActive: false },
      );
      expect(result).toEqual({
        message: 'Product Classic Burger deleted successfully',
      });
    });

    it('should throw NotFoundException if product to delete not found', async () => {
      jest.spyOn(productRepository, 'findOneBy').mockResolvedValueOnce(null);

      await expect(service.remove('Nonexistent Burger')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
