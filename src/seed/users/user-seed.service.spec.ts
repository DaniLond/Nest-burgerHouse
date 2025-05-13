import { Test, TestingModule } from '@nestjs/testing';
import { UserSeedService } from './user-seed.service';
import { UserService } from '../../user/user.service';
import { Logger } from '@nestjs/common';
import { User } from '../../user/entities/user.entity';
import { initialData } from './data/seed-user-data';

describe('UserSeedService', () => {
  let service: UserSeedService;
  let userService: UserService;
  let loggerSpy: jest.SpyInstance;

  const mockUserResult = {
    user: { id: '1', email: 'test@example.com', fullName: 'Test User' },
    token: 'mock-jwt-token',
  };

  beforeEach(async () => {
    const mockUserService = {
      create: jest.fn().mockResolvedValue(mockUserResult),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserSeedService,
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    service = module.get<UserSeedService>(UserSeedService);
    userService = module.get<UserService>(UserService);

    loggerSpy = jest
      .spyOn(Logger.prototype, 'log')
      .mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});

    jest.mock('./data/seed-user-data', () => ({
      initialData: {
        users: [
          {
            email: 'test1@gmail.com',
            fullName: 'Test User 1',
            password: 'password1',
          },
          {
            email: 'test2@gmail.com',
            fullName: 'Test User 2',
            password: 'password2',
          },
        ],
      },
    }));
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('runUserSeed', () => {
    it('should call insertUsers and return success message', async () => {
      const insertUsersSpy = jest
        .spyOn(service as any, 'insertUsers')
        .mockResolvedValue(undefined);

      const result = await service.runUserSeed();

      expect(insertUsersSpy).toHaveBeenCalled();
      expect(result).toBe('User seed executed');
    });
  });

  describe('insertUsers', () => {
    it('should create users from initial data', async () => {
      const userCount = initialData.users.length;

      await (service as any).insertUsers();

      expect(userService.create).toHaveBeenCalledTimes(userCount);
      expect(loggerSpy).toHaveBeenCalled();
    });

    it('should handle successful user creation', async () => {
      await (service as any).insertUsers();

      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringContaining('created successfully'),
      );
    });

    it('should handle undefined result from user service', async () => {
      jest.spyOn(userService, 'create').mockResolvedValueOnce(undefined as any);
      const warnSpy = jest.spyOn(Logger.prototype, 'warn');

      await (service as any).insertUsers();

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to create user'),
      );
    });

    it('should handle null user from user service', async () => {
      jest.spyOn(userService, 'create').mockResolvedValueOnce({
        user: null,
        token: 'mock-token',
      } as any);
      const warnSpy = jest.spyOn(Logger.prototype, 'warn');

      await (service as any).insertUsers();

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to create user'),
      );
    });

    it('should handle errors during user creation', async () => {
      const errorMessage = 'Create user failed';
      jest
        .spyOn(userService, 'create')
        .mockRejectedValueOnce(new Error(errorMessage));
      const errorSpy = jest.spyOn(Logger.prototype, 'error');

      await (service as any).insertUsers();

      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining(errorMessage),
      );
    });

    it('should log summary of seeded users', async () => {
      const logSpy = jest.spyOn(Logger.prototype, 'log');

      await (service as any).insertUsers();

      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('Successfully seeded'),
      );
    });
  });
});
