import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiResponse,
  ApiOperation,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { PaginationDto } from '../commons/dto/pagination.dto';
import { Order } from './entities/order-entity';
import { Auth } from 'src/user/decorators/auth.decorator';
import { ValidRoles } from 'src/user/enums/valid-roles.enum';
import { GetUser } from 'src/user/decorators/get-user.decorator';
import { User } from 'src/user/entities/user.entity';
import { OrderState } from './enums/valid-state.enums';

@ApiTags('Orders')
@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @Auth()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new order' })
  @ApiResponse({
    status: 201,
    description: 'Order has been successfully created',
    type: Order,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 403, description: 'Forbidden. Token related' })
  create(
    @Body() createOrderDto: CreateOrderDto,
    @GetUser() user: User,
  ) {
    return this.orderService.create(createOrderDto, user);
  }

  @Get()
  @Auth(ValidRoles.admin, ValidRoles.delivery)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get all orders' })
  @ApiResponse({
    status: 200,
    description: 'Returns all orders',
    type: [Order],
  })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.orderService.findAll(paginationDto);
  }

  @Get('user')
  @Auth(ValidRoles.customer, ValidRoles.admin)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get orders by current user' })
  @ApiResponse({
    status: 200,
    description: 'Returns all orders for the current user',
    type: [Order],
  })
  findByUser(
    @GetUser() user: User,
    @Query() paginationDto: PaginationDto
  ) {
    return this.orderService.findByUser(user.id, paginationDto);
  }

  @Get(':id')
  @Auth(ValidRoles.admin, ValidRoles.customer)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get order by ID' })
  @ApiParam({ name: 'id', description: 'ID of the order to search for' })
  @ApiResponse({
    status: 200,
    description: 'Returns the order',
    type: Order,
  })
  @ApiResponse({ status: 404, description: 'Order not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string,  @GetUser() user: User) {
    return this.orderService.findOne(id, user);
  }

  @Patch(':id')
  @Auth()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update an order' })
  @ApiParam({ name: 'id', description: 'ID of the order to be updated' })
  @ApiResponse({
    status: 200,
    description: 'Order has been successfully updated',
    type: Order,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateOrderDto: UpdateOrderDto,
    @GetUser() user: User,
  ) {
    return this.orderService.update(id, updateOrderDto, user);
  }

  @Delete(':id')
  @Auth()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Cancel an order' })
  @ApiParam({ name: 'id', description: 'ID of the order to cancel' })
  @ApiResponse({
    status: 200,
    description: 'Order has been successfully cancelled',
  })
  @ApiResponse({ status: 404, description: 'Order not found' })
  remove(@Param('id', ParseUUIDPipe) id: string, @GetUser() user: User) {
    return this.orderService.remove(id, user);
  }
}