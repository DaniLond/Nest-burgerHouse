import { Injectable, Logger } from '@nestjs/common';
import { initialData } from './data/seed-data';
import { UserService } from '../../user/user.service';
import { User } from '../../user/entities/user.entity';

@Injectable()
export class UserSeedService {
  private readonly logger = new Logger('UserSeedService');
  
  constructor(private readonly userService: UserService) {}

  async runUserSeed() {
    await this.insertUsers();
    return 'User seed executed';
  }

  private async insertUsers() {
    const seedUsers = initialData.users;
    const insertPromises: Promise<User | null>[] = [];

    for (const seedUser of seedUsers) {
      try {
        
        // Pass the correctly typed DTO to the service
        const result = await this.userService.create(seedUser);
        
        // Make sure result exists before accessing its properties
        if (result && result.user) {
          insertPromises.push(Promise.resolve(result.user));
          this.logger.log(`User ${seedUser.email} created successfully`);
        } else {
          this.logger.warn(`Failed to create user ${seedUser.email}: Result was undefined`);
          insertPromises.push(Promise.resolve(null));
        }
      } catch (error) {
        this.logger.error(`Error creating user ${seedUser.email}: ${error.message}`);
        insertPromises.push(Promise.resolve(null));
      }
    }

    const results = await Promise.all(insertPromises);
    const successfulUsers = results.filter(user => user !== null);
    
    this.logger.log(`Successfully seeded ${successfulUsers.length} out of ${seedUsers.length} users`);
  }
}