import { Module } from '@nestjs/common';
import { GatewayController } from './controllers/gateway/gateway.controller';
import { AuthModule } from '../microservices/auth/auth.module';
import { UsersModule } from '../microservices/users/users.module';
import { OrdersModule } from '../microservices/orders/orders.module';
import { PaymentsModule } from '../microservices/payments/payments.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    OrdersModule,
    PaymentsModule,
  ],
  controllers: [GatewayController],
})
export class GatewayModule {}