import { Test, TestingModule } from '@nestjs/testing';
import { ToppingSeedController } from './topping-seed.controller';
import { ToppingSeedService } from './topping-seed.service';

describe('ToppingSeedController', () => {
  let controller: ToppingSeedController;
  let service: ToppingSeedService;

  const mockToppingSeedService = {
    runToppingSeed: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ToppingSeedController],
      providers: [
        { provide: ToppingSeedService, useValue: mockToppingSeedService },
      ],
    }).compile();

    controller = module.get<ToppingSeedController>(ToppingSeedController);
    service = module.get<ToppingSeedService>(ToppingSeedService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('runToppingSeed', () => {
    it('should call service.runToppingSeed and return the result', async () => {
      
      const expectedResult = 'Topping seed executed';
      mockToppingSeedService.runToppingSeed.mockResolvedValue(expectedResult);
      
     
      const result = await controller.runToppingSeed();
      
    
      expect(mockToppingSeedService.runToppingSeed).toHaveBeenCalledTimes(1);
      
     
      expect(result).toBe(expectedResult);
    });

    it('should propagate errors from the service', async () => {
    
      const testError = new Error('Service failure');
      mockToppingSeedService.runToppingSeed.mockRejectedValue(testError);
      
     
      await expect(controller.runToppingSeed()).rejects.toThrow(testError);
      
      
      expect(mockToppingSeedService.runToppingSeed).toHaveBeenCalledTimes(1);
    });
  });
});