import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type AuthDocument = HydratedDocument<Auth>;
@Schema({ timestamps: true })
export class Auth {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ default: null })
  publicKey: string;

  @Prop({ default: null })
  privateKey: string;

  @Prop({ default: 0 })
  loginAttempts: number;

  id: any;
}

export const AuthSchema = SchemaFactory.createForClass(Auth);
