import { Test, TestingModule } from '@nestjs/testing';
import { ProductSeedController } from './product-seed.controller';
import { ProductSeedService } from './product-seed.service';

describe('ProductSeedController', () => {
  let controller: ProductSeedController;
  let service: ProductSeedService;

  const mockProductSeedService = {
    runProductSeed: jest.fn().mockResolvedValue('Product seed executed'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductSeedController],
      providers: [
        {
          provide: ProductSeedService,
          useValue: mockProductSeedService,
        },
      ],
    }).compile();

    controller = module.get<ProductSeedController>(ProductSeedController);
    service = module.get<ProductSeedService>(ProductSeedService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('runProductSeed', () => {
    it('should call service.runProductSeed and return its result', async () => {
      const expectedResult = 'Product seed executed';
      jest.spyOn(service, 'runProductSeed').mockResolvedValue(expectedResult);

      const result = await controller.runProductSeed();

      expect(service.runProductSeed).toHaveBeenCalled();
      expect(result).toBe(expectedResult);
    });

    it('should handle errors if the service throws an exception', async () => {
      const errorMessage = 'Database connection error';
      jest
        .spyOn(service, 'runProductSeed')
        .mockRejectedValue(new Error(errorMessage));

      await expect(controller.runProductSeed()).rejects.toThrow(errorMessage);
      expect(service.runProductSeed).toHaveBeenCalled();
    });
  });
});
