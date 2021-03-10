import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class User {
  @Field({ description: 'Example field (placeholder)' })
  email: string;
}
