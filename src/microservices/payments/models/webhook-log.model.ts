import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class WebhookLog extends Document {
  @Prop({ required: true })
  collect_id: string;

  @Prop({ type: Object, required: true })
  payload: Record<string, any>;

  @Prop()
  response: string;

  @Prop()
  error: string;

  @Prop({ default: false })
  processed: boolean;
}

export const WebhookLogSchema = SchemaFactory.createForClass(WebhookLog);