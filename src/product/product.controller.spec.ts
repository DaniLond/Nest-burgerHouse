import { Test, TestingModule } from '@nestjs/testing';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { ProductCategories } from './enums/valid-categories.enum';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { PaginationDto } from '../commons/dto/pagination.dto';
import { Auth } from '../user/decorators/auth.decorator';
import { ValidRoles } from '../user/enums/valid-roles.enum';
import { PassportModule } from '@nestjs/passport';

describe('ProductController', () => {
  let controller: ProductController;
  let service: ProductService;

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

  const mockPaginationDto: PaginationDto = {
    limit: 10,
    offset: 0,
  };

  const mockProductService = {
    create: jest.fn().mockResolvedValue(mockProduct),
    findAll: jest.fn().mockResolvedValue([mockProduct]),
    findOne: jest.fn().mockImplementation((name) => {
      if (name === 'Classic Burger') {
        return Promise.resolve(mockProduct);
      }
      return Promise.reject(
        new NotFoundException(`Product with name ${name} not found`),
      );
    }),
    update: jest.fn().mockImplementation((name, updateDto) => {
      if (name === 'Classic Burger') {
        return Promise.resolve({
          ...mockProduct,
          ...updateDto,
        });
      }
      return Promise.reject(
        new NotFoundException(`Product with name ${name} not found`),
      );
    }),
    remove: jest.fn().mockImplementation((name) => {
      if (name === 'Classic Burger') {
        return Promise.resolve({
          message: `Product ${name} deleted successfully`,
        });
      }
      return Promise.reject(
        new NotFoundException(`Product with name ${name} not found`),
      );
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
      controllers: [ProductController],
      providers: [
        {
          provide: ProductService,
          useValue: mockProductService,
        },
      ],
    }).compile();

    controller = module.get<ProductController>(ProductController);
    service = module.get<ProductService>(ProductService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new product', async () => {
      const result = await controller.create(mockCreateProductDto);

      expect(service.create).toHaveBeenCalledWith(mockCreateProductDto);
      expect(result).toEqual(mockProduct);
    });

    it('should throw BadRequestException when product creation fails', async () => {
      jest
        .spyOn(service, 'create')
        .mockRejectedValueOnce(
          new BadRequestException('Product already exists'),
        );

      await expect(controller.create(mockCreateProductDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAll', () => {
    it('should return an array of products', async () => {
      const result = await controller.findAll(mockPaginationDto);

      expect(service.findAll).toHaveBeenCalledWith(mockPaginationDto);
      expect(result).toEqual([mockProduct]);
    });
  });

  describe('findOne', () => {
    it('should return a single product by name', async () => {
      const result = await controller.findOne('Classic Burger');

      expect(service.findOne).toHaveBeenCalledWith('Classic Burger');
      expect(result).toEqual(mockProduct);
    });

    it('should throw NotFoundException if product not found', async () => {
      await expect(controller.findOne('Nonexistent Burger')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a product', async () => {
      const result = await controller.update(
        'Classic Burger',
        mockUpdateProductDto,
      );

      expect(service.update).toHaveBeenCalledWith(
        'Classic Burger',
        mockUpdateProductDto,
      );
      expect(result).toEqual({
        ...mockProduct,
        ...mockUpdateProductDto,
      });
    });

    it('should throw NotFoundException if product to update not found', async () => {
      await expect(
        controller.update('Nonexistent Burger', mockUpdateProductDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should deactivate a product', async () => {
      const result = await controller.remove('Classic Burger');

      expect(service.remove).toHaveBeenCalledWith('Classic Burger');
      expect(result).toEqual({
        message: 'Product Classic Burger deleted successfully',
      });
    });

    it('should throw NotFoundException if product to delete not found', async () => {
      await expect(controller.remove('Nonexistent Burger')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
