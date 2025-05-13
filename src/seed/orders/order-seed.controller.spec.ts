import { Test, TestingModule } from '@nestjs/testing';
import { OrderSeedController } from './order-seed.controller';
import { OrderSeedService } from './order-seed.service';

describe('OrderSeedController', () => {
  let controller: OrderSeedController;
  let service: OrderSeedService;

  // Creamos un mock del servicio
  const mockOrderSeedService = {
    runOrderSeed: jest.fn().mockResolvedValue('Order seed executed'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderSeedController],
      providers: [
        {
          provide: OrderSeedService,
          useValue: mockOrderSeedService,
        },
      ],
    }).compile();

    controller = module.get<OrderSeedController>(OrderSeedController);
    service = module.get<OrderSeedService>(OrderSeedService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('runOrderSeed', () => {
    it('should call service.runOrderSeed and return its result', async () => {
      // Arrange
      const expectedResult = 'Order seed executed';
      jest.spyOn(service, 'runOrderSeed').mockResolvedValue(expectedResult);

      // Act
      const result = await controller.runOrderSeed();

      // Assert
      expect(service.runOrderSeed).toHaveBeenCalled();
      expect(result).toBe(expectedResult);
    });

    it('should handle errors if the service throws an exception', async () => {
      // Arrange
      const errorMessage = 'Database connection error';
      jest.spyOn(service, 'runOrderSeed').mockRejectedValue(new Error(errorMessage));

      // Act & Assert
      await expect(controller.runOrderSeed()).rejects.toThrow(errorMessage);
      expect(service.runOrderSeed).toHaveBeenCalled();
    });
  });
});