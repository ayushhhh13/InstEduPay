import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

class StudentInfo {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  id: string;

  @Prop({ required: true })
  email: string;
}

@Schema({ timestamps: true })
export class Order extends Document {
  @Prop({ type: Types.ObjectId, required: true })
  school_id: string;

  @Prop({ type: Types.ObjectId, required: true })
  trustee_id: string;

  @Prop({ type: Object, required: true })
  student_info: StudentInfo;

  @Prop({ required: true })
  gateway_name: string;
  
  @Prop({ default: null })
  custom_order_id: string;
}

export const OrderSchema = SchemaFactory.createForClass(Order);