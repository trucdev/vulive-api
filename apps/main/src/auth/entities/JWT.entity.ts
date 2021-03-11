import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class JWT {
  @Field({ nullable: false })
  token: string;

  @Field({ nullable: false })
  refreshToken: string;

  @Field(() => Int, {})
  expiresAt: number;

  @Field(() => Int, {})
  refreshTokenExpiresAt: number;
}
