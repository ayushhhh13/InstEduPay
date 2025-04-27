import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class OrderStatus extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Order', required: true })
  collect_id: Types.ObjectId;

  @Prop({ required: true })
  order_amount: number;

  @Prop({ default: 0 })
  transaction_amount: number;

  @Prop({ default: null })
  payment_mode: string;

  @Prop({ default: null })
  payment_details: string;

  @Prop({ default: null })
  bank_reference: string;

  @Prop({ default: null })
  payment_message: string;

  @Prop({ enum: ['pending', 'success', 'failed'], default: 'pending' })
  status: string;

  @Prop({ default: null })
  error_message: string;

  @Prop({ type: Date, default: null })
  payment_time: Date;
}

export const OrderStatusSchema = SchemaFactory.createForClass(OrderStatus);