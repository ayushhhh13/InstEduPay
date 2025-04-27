import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    UseGuards,
    Query,
  } from '@nestjs/common';
  import { CreateOrderDto } from '../../dtos/create-order.dto';
  import { UpdateOrderDto } from '../../dtos/update-order.dto';
  import { AuthGuard } from '@nestjs/passport';
import { OrdersService } from '../../services/orders/orders.service';
  
  @Controller('orders')
  @UseGuards(AuthGuard('jwt'))
  export class OrdersController {
    constructor(private readonly ordersService: OrdersService) {}
  
    @Get()
    findAll() {
      return this.ordersService.findAll();
    }
  
    @Get(':id')
    findOne(@Param('id') id: string) {
      return this.ordersService.findOne(id);
    }
  
    @Post()
    create(@Body() createOrderDto: CreateOrderDto) {
      return this.ordersService.create(createOrderDto);
    }
  
    @Put(':id')
    update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
      return this.ordersService.update(id, updateOrderDto);
    }
  
    @Delete(':id')
    remove(@Param('id') id: string) {
      return this.ordersService.remove(id);
    }
  }