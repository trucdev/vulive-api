import { Injectable } from '@nestjs/common';
import { UserDocument } from '../users/schemas/user.schema';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}

  validatePassword(password: string, comparePassword: string) {
    return password === comparePassword;
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findUserByEmail(email);
    if (user && this.validatePassword(user.password, password)) {
      return user;
    }
  }

  /**
   *
   * @param user
   * @returns
   */
  async makeJwt(user: UserDocument) {
    return {
      token: 'todo:',
      refreshToken: 'todo:',
      expiresAt: Math.round(Date.now() / 1000) + 600,
      refreshTokenExpiresAt: Math.round(Date.now() / 1000) + 6000,
    };
  }
}
