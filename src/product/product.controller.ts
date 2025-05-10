import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiResponse,
  ApiOperation,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from '../commons/dto/pagination.dto';
import { Product } from './entities/product.entity';
import { Auth } from 'src/user/decorators/auth.decorator';
import { ValidRoles } from 'src/user/enums/valid-roles.enum';

@ApiTags('Products')
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @Auth(ValidRoles.admin)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new product' })
  @ApiResponse({
    status: 201,
    description: 'Product has been successfully created',
    type: Product,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 403, description: 'Forbidden. Token related' })
  create(@Body() createProductDto: CreateProductDto) {
    return this.productService.create(createProductDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all products' })
  @ApiResponse({
    status: 200,
    description: 'Returns all active products',
    type: [Product],
  })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.productService.findAll(paginationDto);
  }

  @Get(':name')
  @ApiOperation({ summary: 'Get product by name' })
  @ApiParam({ name: 'name', description: 'Name of the product to search for' })
  @ApiResponse({
    status: 200,
    description: 'Returns the product',
    type: Product,
  })
  @ApiResponse({ status: 404, description: 'Product not found' })
  findOne(@Param('name') name: string) {
    return this.productService.findOne(name);
  }

  @Patch(':name')
  @Auth(ValidRoles.admin)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update a product' })
  @ApiParam({ name: 'name', description: 'Name of the product to be updated' })
  @ApiResponse({
    status: 200,
    description: 'Product has been successfully updated',
    type: Product,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  update(
    @Param('name') name: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productService.update(name, updateProductDto);
  }

  @Delete(':name')
  @Auth(ValidRoles.admin)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete a product (soft delete)' })
  @ApiParam({ name: 'name', description: 'name of the product to delete' })
  @ApiResponse({
    status: 200,
    description: 'Product has been successfully deactivated',
  })
  @ApiResponse({ status: 404, description: 'Product not found' })
  remove(@Param('name') name: string) {
    return this.productService.remove(name);
  }
}
