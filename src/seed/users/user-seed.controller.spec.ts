import { Test, TestingModule } from '@nestjs/testing';
import { UserSeedController } from './user-seed.controller';
import { UserSeedService } from './user-seed.service';

describe('UserSeedController', () => {
  let controller: UserSeedController;
  let service: UserSeedService;

  const mockUserSeedService = {
    runUserSeed: jest.fn().mockResolvedValue('User seed executed'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserSeedController],
      providers: [
        {
          provide: UserSeedService,
          useValue: mockUserSeedService,
        },
      ],
    }).compile();

    controller = module.get<UserSeedController>(UserSeedController);
    service = module.get<UserSeedService>(UserSeedService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('runUserSeed', () => {
    it('should call service.runUserSeed and return its result', async () => {
      const expectedResult = 'User seed executed';
      jest.spyOn(service, 'runUserSeed').mockResolvedValue(expectedResult);

      const result = await controller.runUserSeed();

      expect(service.runUserSeed).toHaveBeenCalled();
      expect(result).toBe(expectedResult);
    });

    it('should handle errors if the service throws an exception', async () => {
      const errorMessage = 'Database connection error';
      jest
        .spyOn(service, 'runUserSeed')
        .mockRejectedValue(new Error(errorMessage));

      await expect(controller.runUserSeed()).rejects.toThrow(errorMessage);
      expect(service.runUserSeed).toHaveBeenCalled();
    });
  });
});
