import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Order, OrderSchema } from '../orders/models/order.model';
import { OrderStatus, OrderStatusSchema } from '../orders/models/order-status.model';
import { WebhookLog, WebhookLogSchema } from './models/webhook-log.model';
import { OrdersModule } from '../orders/orders.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PaymentsController } from './controllers/payments/payments.controller';
import { PaymentsService } from './services/payments/payments.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: OrderStatus.name, schema: OrderStatusSchema },
      { name: WebhookLog.name, schema: WebhookLogSchema },
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('paymentGateway.pgKey'),
        signOptions: {
          expiresIn: '1h',
        },
      }),
      inject: [ConfigService],
    }),
    OrdersModule,
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService],
})
export class PaymentsModule {}