import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class LoginInput {
  @Field({ description: 'Input email to login', nullable: false })
  email: string;

  @Field({ description: 'Input email to login', nullable: false })
  password: string;
}
