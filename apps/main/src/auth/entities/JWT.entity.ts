import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class JWT {
  @Field({ nullable: false })
  token: string;

  @Field({ nullable: false })
  refreshToken: string;
}
