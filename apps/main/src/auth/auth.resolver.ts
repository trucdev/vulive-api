import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { UserInputError } from 'apollo-server-express';
import { AuthService } from './auth.service';
import { LoginInput } from './dto/create-user.input';
import { JWT } from './entities/JWT.entity';
import { I18nRequestScopeService } from 'nestjs-i18n';

@Resolver(() => JWT)
export class AuthResolver {
  constructor(
    private readonly authService: AuthService,
    private readonly i18n: I18nRequestScopeService,
  ) {}

  @Mutation(() => JWT)
  async login(@Args('input') loginInput: LoginInput) {
    const user = await this.authService.validateUser(
      loginInput.email,
      loginInput.password,
    );

    if (!user) {
      const message = await this.i18n.translate('auth.INVALID_CREDENTIALS');
      throw new UserInputError(message);
    }

    const f5Token = await this.authService.createRefreshToken(user.id, '', '');

    return this.authService.makeAccessToken({ uid: user.id }, f5Token);
  }
}
