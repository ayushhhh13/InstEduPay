import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Order, OrderSchema } from './models/order.model';
import { OrderStatus, OrderStatusSchema } from './models/order-status.model';
import { OrdersController } from './controllers/orders/orders.controller';
import { OrdersService } from './services/orders/orders.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: OrderStatus.name, schema: OrderStatusSchema },
    ]),
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}