import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Auth extends Document {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  token: string;

  @Prop({ default: false })
  isRevoked: boolean;

  @Prop()
  expiresAt: Date;
}

export const AuthSchema = SchemaFactory.createForClass(Auth);