import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop(String)
  email: string;

  @Prop(String)
  password: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
