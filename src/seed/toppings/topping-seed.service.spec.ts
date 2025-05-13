import { Test, TestingModule } from '@nestjs/testing';
import { ToppingSeedService } from './topping-seed.service';
import { ToppingService } from '../../topping/topping.service';
import { initialToppingData } from './data/seed-topping-data';
import { Logger } from '@nestjs/common';
import { Topping } from '../../topping/entities/topping.entity';

const mockLogger = {
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

const mockToppingService = {
  create: jest.fn(),
};

describe('ToppingSeedService', () => {
  let service: ToppingSeedService;
  let toppingService: ToppingService;

  beforeEach(async () => {
    jest.clearAllMocks();
    

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ToppingSeedService,
        { provide: ToppingService, useValue: mockToppingService },
      ],
    }).compile();

    jest.spyOn(Logger.prototype, 'log').mockImplementation(mockLogger.log);
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(mockLogger.warn);
    jest.spyOn(Logger.prototype, 'error').mockImplementation(mockLogger.error);

    service = module.get<ToppingSeedService>(ToppingSeedService);
    toppingService = module.get<ToppingService>(ToppingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('runToppingSeed', () => {
    it('should call insertToppings and return success message', async () => {
     
      const insertToppingsSpy = jest.spyOn(service as any, 'insertToppings').mockResolvedValueOnce(undefined);
      
      const result = await service.runToppingSeed();
      
      expect(insertToppingsSpy).toHaveBeenCalledTimes(1);
      expect(result).toBe('Topping seed executed');
    });

    it('should handle exceptions during execution', async () => {
     
      jest.spyOn(service as any, 'insertToppings').mockRejectedValueOnce(new Error('Test error'));
      
      await expect(service.runToppingSeed()).rejects.toThrow('Test error');
    });
  });

  describe('insertToppings', () => {
    it('should create all toppings successfully', async () => {
      
      const mockTopping: Topping = {
        id: '1',
        name: 'Queso extra',
        price: 1.0,
        maximumAmount: 10,
        isActive: true,
        productToppings: [],
        checkFieldsBeforeInsert: jest.fn(),
        checkFieldsBeforeUpdate: jest.fn(),
      };
      mockToppingService.create.mockResolvedValue(mockTopping);
      
      await (service as any).insertToppings();
      
      
      expect(mockToppingService.create).toHaveBeenCalledTimes(initialToppingData.toppings.length);
      
     
      expect(mockLogger.log).toHaveBeenCalledWith(
        `Successfully seeded ${initialToppingData.toppings.length} out of ${initialToppingData.toppings.length} toppings`
      );

      initialToppingData.toppings.forEach((topping) => {
        expect(mockLogger.log).toHaveBeenCalledWith(
          `Topping ${topping.name} created successfully`
        );
      });
    });

    it('should handle failed topping creation (null result)', async () => {
      
      const mockTopping: Topping = {
        id: '1',
        name: 'Queso extra',
        price: 1.0,
        maximumAmount: 10,
        isActive: true,
        productToppings: [],
        checkFieldsBeforeInsert: jest.fn(),
        checkFieldsBeforeUpdate: jest.fn(),
      };
      
      mockToppingService.create
        .mockResolvedValueOnce(null)
        .mockResolvedValue(mockTopping);
      
      await (service as any).insertToppings();
      
      
      expect(mockLogger.warn).toHaveBeenCalledWith(
        `Failed to create topping ${initialToppingData.toppings[0].name}`
      );
      
    
      const successfulCount = initialToppingData.toppings.length - 1;
      expect(mockLogger.log).toHaveBeenCalledWith(
        `Successfully seeded ${successfulCount} out of ${initialToppingData.toppings.length} toppings`
      );
    });

    it('should handle errors during topping creation', async () => {
      const testError = new Error('Test error');
      const mockTopping: Topping = {
        id: '1',
        name: 'Queso extra',
        price: 1.0,
        maximumAmount: 10,
        isActive: true,
        productToppings: [],
        checkFieldsBeforeInsert: jest.fn(),
        checkFieldsBeforeUpdate: jest.fn(),
      };
      
      
      mockToppingService.create
        .mockRejectedValueOnce(testError)
        .mockResolvedValue(mockTopping);
      
      await (service as any).insertToppings();
      

      expect(mockLogger.error).toHaveBeenCalledWith(
        `Error creating topping ${initialToppingData.toppings[0].name}: ${testError.message}`
      );
      
      const successfulCount = initialToppingData.toppings.length - 1;
      expect(mockLogger.log).toHaveBeenCalledWith(
        `Successfully seeded ${successfulCount} out of ${initialToppingData.toppings.length} toppings`
      );
    });
  });
});