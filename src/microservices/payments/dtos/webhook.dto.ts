import { IsNotEmpty, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class OrderInfoDto {
  @IsNotEmpty()
  order_id: string;

  @IsNotEmpty()
  order_amount: number;

  @IsNotEmpty()
  transaction_amount: number;

  @IsNotEmpty()
  gateway: string;

  @IsNotEmpty()
  bank_reference: string;

  @IsNotEmpty()
  status: string;

  @IsNotEmpty()
  payment_mode: string;

  @IsNotEmpty()
  payment_details: string;

  @IsNotEmpty()
  payment_message: string;

  @IsNotEmpty()
  payment_time: Date;

  @IsNotEmpty()
  error_message: string;
}

export class WebhookDto {
  @IsNotEmpty()
  status: number;

  @IsObject()
  @ValidateNested()
  @Type(() => OrderInfoDto)
  order_info: OrderInfoDto;
}