import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './microservices/auth/auth.module';
import { UsersModule } from './microservices/users/users.module';
import { OrdersModule } from './microservices/orders/orders.module';
import { PaymentsModule } from './microservices/payments/payments.module';
import { GatewayModule } from './gateway/gateway.module';
import configuration from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('mongodb.uri'),
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    OrdersModule,
    PaymentsModule,
    GatewayModule,
  ],
})
export class AppModule {}

