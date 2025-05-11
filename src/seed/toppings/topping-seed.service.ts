import { Injectable, Logger } from '@nestjs/common';
import { initialToppingData } from './data/seed-topping-data';
import { ToppingService } from '../../topping/topping.service';
import { Topping } from '../../topping/entities/topping.entity';

@Injectable()
export class ToppingSeedService {
  private readonly logger = new Logger('ToppingSeedService');

  constructor(private readonly toppingService: ToppingService) {}

  async runToppingSeed() {
    await this.insertToppings();
    return 'Topping seed executed';
  }

  private async insertToppings() {
    const seedToppings = initialToppingData.toppings;
    const insertPromises: Promise<Topping | null>[] = [];

    for (const topping of seedToppings) {
      try {
        const result = await this.toppingService.create(topping);

        if (result) {
          insertPromises.push(Promise.resolve(result));
          this.logger.log(`Topping ${topping.name} created successfully`);
        } else {
          this.logger.warn(`Failed to create topping ${topping.name}`);
          insertPromises.push(Promise.resolve(null));
        }
      } catch (error) {
        this.logger.error(
          `Error creating topping ${topping.name}: ${error.message}`,
        );
        insertPromises.push(Promise.resolve(null));
      }
    }

    const results = await Promise.all(insertPromises);
    const successful = results.filter((t) => t !== null);

    this.logger.log(
      `Successfully seeded ${successful.length} out of ${seedToppings.length} toppings`,
    );
  }
}
