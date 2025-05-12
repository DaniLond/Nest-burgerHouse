  import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from '../commons/dto/pagination.dto';

@Injectable()
export class ProductService {
  
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async create(createProductDto: CreateProductDto){
    try {
      const product = this.productRepository.create(createProductDto);
      return await this.productRepository.save(product);
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findAll(paginationDto: PaginationDto){
    const { limit = 10, offset = 0 } = paginationDto;
    
    return this.productRepository.find({
      take: limit,
      skip: offset,
      where: { isActive: true },
    });
  }

  async findOne(name: string){
    const product = await this.productRepository.findOneBy({ name, isActive: true });
    
    if (!product) {
      throw new NotFoundException(`Product with name ${name} not found`);
    }
    
    return product;
  }

    async findOneById(id: string){
    const product = await this.productRepository.findOneBy({ id, isActive: true });
    
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    
    return product;
  }

  async update(name: string, updateProductDto: UpdateProductDto){
    const product = await this.findOne(name);
    
    try {
      await this.productRepository.update({ name }, updateProductDto);
      return {
        ...product,
        ...updateProductDto
      }
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async remove(name: string){
    const product = await this.findOne(name);

    await this.productRepository.update( { name }, { isActive: false });
    return {
      message: `Product ${product.name} deleted successfully`
    };
  }

  private handleDBExceptions(error: any){
    if (error.code === '23505') {
      throw new BadRequestException(error.detail);
    }
    
    console.log(error);
    throw new BadRequestException('Unexpected error, check server logs');
  }
}
