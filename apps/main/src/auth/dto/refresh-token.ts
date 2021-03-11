import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class RefreshTokenInput {
  @Field({ description: 'Input refresh token', nullable: false })
  refreshToken: string;

  @Field({
    description: 'old access token, accept expired token',
    nullable: false,
  })
  accessToken: string;
}
