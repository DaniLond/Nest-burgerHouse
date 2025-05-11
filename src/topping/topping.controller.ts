import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiResponse, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';

import { ToppingService } from './topping.service';
import { CreateToppingDto } from './dto/create-topping.dto';
import { UpdateToppingDto } from './dto/update-topping.dto';
import { CreateProductToppingDto } from './dto/create-product-topping.dto';
import { Topping } from './entities/topping.entity';
import { ProductTopping } from './entities/product-topping.entity';
import { PaginationDto } from 'src/commons/dto/pagination.dto';
import { Auth } from 'src/user/decorators/auth.decorator';
import { ValidRoles } from 'src/user/enums/valid-roles.enum';

@ApiTags('Toppings')
@Controller('toppings')
export class ToppingController {
  constructor(private readonly toppingService: ToppingService) {}

  @Post()
  @Auth(ValidRoles.admin)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new topping' })
  @ApiResponse({
    status: 201,
    description: 'Topping has been successfully created',
    type: Topping,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  create(@Body() createToppingDto: CreateToppingDto) {
    return this.toppingService.create(createToppingDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all toppings' })
  @ApiResponse({
    status: 200,
    description: 'Returns all active toppings',
    type: [Topping],
  })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.toppingService.findAll(paginationDto);
  }

  @Get(':name')
  @ApiOperation({ summary: 'Get topping by name' })
  @ApiParam({ name: 'name', description: 'Name of the topping to search for' })
  @ApiResponse({
    status: 200,
    description: 'Returns the topping',
    type: Topping,
  })
  @ApiResponse({ status: 404, description: 'Topping not found' })
  findOne(@Param('name') name: string) {
    return this.toppingService.findOne(name);
  }

  @Patch(':name')
  @Auth(ValidRoles.admin)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update a topping' })
  @ApiParam({ name: 'name', description: 'Name of the topping to be updated' })
  @ApiResponse({
    status: 200,
    description: 'Topping has been successfully updated',
    type: Topping,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Topping not found' })
  update(
    @Param('name') name: string,
    @Body() updateToppingDto: UpdateToppingDto,
  ) {
    return this.toppingService.update(name, updateToppingDto);
  }

  @Delete(':name')
  @Auth(ValidRoles.admin)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Delete a topping (soft delete)' })
  @ApiParam({ name: 'name', description: 'name of the topping to delete' })
  @ApiResponse({
    status: 200,
    description: 'Topping has been successfully deactivated',
  })
  @ApiResponse({ status: 404, description: 'Topping not found' })
  remove(@Param('name') name: string) {
    return this.toppingService.remove(name);
  }

  @Post('add-topping')
  @ApiOperation({ summary: 'Add a topping to a product' })
  @ApiResponse({
    status: 201,
    description: 'Topping has been successfully added to product',
    type: ProductTopping,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request or quantity exceeds maximum amount',
  })
  @ApiResponse({ status: 404, description: 'Product or topping not found' })
  addToppingToProduct(
    @Body() createProductToppingDto: CreateProductToppingDto,
  ) {
    return this.toppingService.addToppingToProduct(createProductToppingDto);
  }

  @Delete('remove-topping/:id')
  @ApiOperation({ summary: 'Remove a topping from a product' })
  @ApiParam({ name: 'id', description: 'id of the product-topping to delete' })
  @ApiResponse({
    status: 200,
    description: 'Topping has been successfully removed from product',
  })
  @ApiResponse({ status: 404, description: 'Relationship not found' })
  removeToppingFromProduct(@Param('id', ParseUUIDPipe) id: string) {
    return this.toppingService.removeToppingFromProduct(id);
  }

  @Get('by-product/:productId')
  @ApiOperation({ summary: 'Get all toppings for a specific product' })
  @ApiParam({
    name: 'productId',
    description: 'product id to search for all its toppings',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns all toppings for the product',
    type: [ProductTopping],
  })
  @ApiResponse({ status: 404, description: 'Product not found' })
  getToppingsByProduct(@Param('productId', ParseUUIDPipe) productId: string) {
    return this.toppingService.getToppingsByProduct(productId);
  }
}
