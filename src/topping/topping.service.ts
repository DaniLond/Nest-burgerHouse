import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Topping } from './entities/topping.entity';
import { Product } from '../product/entities/product.entity';
import { ProductTopping } from './entities/product-topping.entity';
import { CreateToppingDto } from './dto/create-topping.dto';
import { UpdateToppingDto } from './dto/update-topping.dto';
import { CreateProductToppingDto } from './dto/create-product-topping.dto';
import { PaginationDto } from '../commons/dto/pagination.dto';

@Injectable()   
export class ToppingService {
  constructor(
    @InjectRepository(Topping)
    private readonly toppingRepository: Repository<Topping>,

    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(ProductTopping)
    private readonly productToppingRepository: Repository<ProductTopping>,
  ) {}

  async create(createToppingDto: CreateToppingDto){
    try {
      const topping = this.toppingRepository.create(createToppingDto);
      return await this.toppingRepository.save(topping);
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findAll(paginationDto: PaginationDto){
    const { limit = 10, offset = 0 } = paginationDto;

    return this.toppingRepository.find({
      take: limit,
      skip: offset,
      where: { isActive: true },
    });
  }

  async findOne(name: string){
    const topping = await this.toppingRepository.findOneBy({
      name,
      isActive: true,
    });

    if (!topping) {
      throw new NotFoundException(`Topping with id ${name} not found`);
    }

    return topping;
  }

  async update(
    name: string,
    updateToppingDto: UpdateToppingDto,
  ){
    const topping= await this.findOne(name);

    try {
      await this.toppingRepository.update({ name }, updateToppingDto);
      return {
        ...topping,
        ...updateToppingDto
      };
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async remove(name: string){
    const topping= await this.findOne(name);
    await this.toppingRepository.update({ name }, { isActive: false });
    return {
      message: `Product ${topping.name} deleted successfully`,
    };
  }

  async addToppingToProduct(
    createProductToppingDto: CreateProductToppingDto,
  ){
    const { product_id, topping_id, quantity } = createProductToppingDto;

    const product = await this.productRepository.findOneBy({
      id: product_id,
      isActive: true,
    });
    if (!product) {
      throw new NotFoundException(`Product with id ${product_id} not found`);
    }

    const topping = await this.toppingRepository.findOneBy({
      id: topping_id,
      isActive: true,
    });
    if (!topping) {
      throw new NotFoundException(`Topping with id ${topping_id} not found`);
    }

    if (quantity > topping.maximumAmount) {
      throw new BadRequestException(
        `Quantity exceeds maximum allowed amount of ${topping.maximumAmount} for this topping`,
      );
    }

    const existingProductTopping = await this.productToppingRepository.findOne({
      where: {
        product_id,
        topping_id,
      },
    });

    if (existingProductTopping) {
      throw new BadRequestException(`This product already has this topping`);
    }

    try {
      const productTopping = this.productToppingRepository.create({
        product_id,
        topping_id,
        quantity,
      });

      return await this.productToppingRepository.save(productTopping);
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async removeToppingFromProduct(productToppingId: string){
    const productTopping = await this.productToppingRepository.findOneBy({
      id: productToppingId,
    });

    if (!productTopping) {
      throw new NotFoundException(
        `Product-Topping relationship with id ${productToppingId} not found`,
      );
    }

    await this.productToppingRepository.remove(productTopping);
    return {
      message: `Product ${productToppingId} deleted successfully`,
    };
    
  }

  async getToppingsByProduct(productId: string){
    const product = await this.productRepository.findOneBy({
      id: productId,
      isActive: true,
    });

    if (!product) {
      throw new NotFoundException(`Product with id ${productId} not found`);
    }

    return this.productToppingRepository.find({
      where: { product_id: productId },
      relations: ['topping'],
    });
  }

  private handleDBExceptions(error: any): never {
    if (error.code === '23505') {
      throw new BadRequestException(error.detail);
    }

    console.log(error);
    throw new BadRequestException('Unexpected error, check server logs');
  }
}
