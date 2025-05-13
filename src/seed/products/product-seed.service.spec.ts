import { Test, TestingModule } from '@nestjs/testing';
import { ProductSeedService } from './product-seed.service';
import { ProductService } from '../../product/product.service';
import { Logger } from '@nestjs/common';
import { Product } from '../../product/entities/product.entity';
import { initialProductData } from './data/seed-product-data';
import { ProductCategories } from '../../product/enums/valid-categories.enum';

describe('ProductSeedService', () => {
  let service: ProductSeedService;
  let productService: ProductService;
  let loggerSpy: jest.SpyInstance;

  const mockProduct = {
    id: '1',
    name: 'Classic Burger',
    price: 20000,
    category: ProductCategories.burgers,
  } as Product;

  beforeEach(async () => {
    const mockProductService = {
      create: jest.fn().mockResolvedValue(mockProduct),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductSeedService,
        {
          provide: ProductService,
          useValue: mockProductService,
        },
      ],
    }).compile();

    service = module.get<ProductSeedService>(ProductSeedService);
    productService = module.get<ProductService>(ProductService);

    loggerSpy = jest
      .spyOn(Logger.prototype, 'log')
      .mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('runProductSeed', () => {
    it('should call insertProducts and return success message', async () => {
      const insertProductsSpy = jest
        .spyOn(service as any, 'insertProducts')
        .mockResolvedValue(undefined);

      const result = await service.runProductSeed();

      expect(insertProductsSpy).toHaveBeenCalled();
      expect(result).toBe('Product seed executed');
    });
  });

  describe('insertProducts', () => {
    it('should create products using productService', async () => {
      await (service as any).insertProducts();

      expect(productService.create).toHaveBeenCalledTimes(
        initialProductData.products.length,
      );
      expect(loggerSpy).toHaveBeenCalled();
    });

    it('should log success for each product created', async () => {
      await (service as any).insertProducts();

      initialProductData.products.forEach((product) => {
        expect(loggerSpy).toHaveBeenCalledWith(
          `Product ${product.name} created successfully`,
        );
      });

      expect(loggerSpy).toHaveBeenCalledWith(
        `Successfully seeded ${initialProductData.products.length} out of ${initialProductData.products.length} products`,
      );
    });

    it('should handle failed product creation', async () => {
      const warnSpy = jest.spyOn(Logger.prototype, 'warn');
      jest.spyOn(productService, 'create').mockResolvedValueOnce(undefined);

      await (service as any).insertProducts();

      expect(warnSpy).toHaveBeenCalledWith(
        `Failed to create product ${initialProductData.products[0].name}`,
      );
    });

    it('should handle errors during product creation', async () => {
      const errorMessage = 'Create product failed';
      const errorSpy = jest.spyOn(Logger.prototype, 'error');
      jest
        .spyOn(productService, 'create')
        .mockRejectedValueOnce(new Error(errorMessage));

      await (service as any).insertProducts();

      expect(errorSpy).toHaveBeenCalledWith(
        `Error creating product ${initialProductData.products[0].name}: ${errorMessage}`,
      );
    });

    it('should create remaining products even if some fail', async () => {
      jest
        .spyOn(productService, 'create')
        .mockRejectedValueOnce(new Error('Failed'))
        .mockResolvedValue(mockProduct);

      await (service as any).insertProducts();

      expect(productService.create).toHaveBeenCalledTimes(
        initialProductData.products.length,
      );

      expect(loggerSpy).toHaveBeenCalledWith(
        `Successfully seeded ${initialProductData.products.length - 1} out of ${initialProductData.products.length} products`,
      );
    });
  });
});
