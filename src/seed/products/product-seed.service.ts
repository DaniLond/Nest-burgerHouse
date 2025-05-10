import { Injectable, Logger } from '@nestjs/common';
import { initialProductData } from './data/seed-product-data';
import { ProductService } from '../../product/product.service';
import { Product } from '../../product/entities/product.entity';

@Injectable()
export class ProductSeedService {
  private readonly logger = new Logger('ProductSeedService');

  constructor(private readonly productService: ProductService) {}

  async runProductSeed() {
    await this.insertProducts();
    return 'Product seed executed';
  }

  private async insertProducts() {
    const seedProducts = initialProductData.products;
    const insertPromises: Promise<Product | null>[] = [];

    for (const seedProduct of seedProducts) {
      try {
        const result = await this.productService.create(seedProduct);

        if (result) {
          insertPromises.push(Promise.resolve(result));
          this.logger.log(`Product ${seedProduct.name} created successfully`);
        } else {
          this.logger.warn(`Failed to create product ${seedProduct.name}`);
          insertPromises.push(Promise.resolve(null));
        }
      } catch (error) {
        this.logger.error(
          `Error creating product ${seedProduct.name}: ${error.message}`,
        );
        insertPromises.push(Promise.resolve(null));
      }
    }

    const results = await Promise.all(insertPromises);
    const successfulProducts = results.filter((product) => product !== null);

    this.logger.log(
      `Successfully seeded ${successfulProducts.length} out of ${seedProducts.length} products`,
    );
  }
}
