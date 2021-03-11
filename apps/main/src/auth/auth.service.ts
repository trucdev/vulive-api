import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import * as moment from 'moment';
import { Model, Types } from 'mongoose';
import { UsersService } from '../users/users.service';
import {
  RefreshToken,
  RefreshTokenDocument,
} from './schemas/refresh.token.schema';
import { AuthErrors } from './types/enum';
import { AccessTokenJwtData } from './types/jwt';

// import does not work
// eslint-disable-next-line @typescript-eslint/no-var-requires
const ms = require('ms');
@Injectable()
export class AuthService {
  /**
   * time to expire in seconds
   */
  private refreshTokenTTL: number;
  private accessTokenTTL: number;

  // todo: move this to redis
  private blockedUserToken: {
    [userId: string]: {
      /**
       * Date to expires
       */
      [token: string]: Date;
    };
  };

  constructor(
    @InjectModel(RefreshToken.name)
    private refreshTokenModel: Model<RefreshTokenDocument>,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    const strRefreshTokenExpireIn = configService.get<string>(
      'AUTH_REFRESH_TOKEN_EXPIRES_IN',
    );
    this.refreshTokenTTL = ms(strRefreshTokenExpireIn) / 1000;

    const strAccessTokenTTL = configService.get<string>('AUTH_JWT_EXPIRES_IN');
    this.accessTokenTTL = ms(strAccessTokenTTL) / 1000;

    // todo: move this to redis
    this.blockedUserToken = {};
  }

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
   * If refresh token is expired
   * in change password case
   * in refresh token case
   * we need to define access from old token
   * @param accessTokenJwtData
   * @returns
   */
  async validateAccessTokenData(accessTokenJwtData: AccessTokenJwtData) {
    return !(
      this.blockedUserToken[accessTokenJwtData.uid] &&
      this.blockedUserToken[accessTokenJwtData.uid][accessTokenJwtData.tokenId]
    );
  }

  /**
   *
   * @param user
   * @returns
   */
  async makeAccessToken(
    user: { uid: string },
    refreshToken: RefreshTokenDocument,
  ) {
    const tokenData: AccessTokenJwtData = {
      uid: user.uid,
      tokenId: refreshToken._id.toString(),
    };

    const token = this.jwtService.sign(tokenData);

    return {
      token: token,
      refreshToken: refreshToken._id.toString(),
      expiresAt: Math.floor(Date.now() / 1000) + this.accessTokenTTL,
      refreshTokenExpiresAt: Math.floor(
        refreshToken.expiresAt.getTime() / 1000,
      ),
    };
  }

  async getAccessTokenFromRefreshToken(
    accessToken: string,
    refreshToken: string,
    clientId?: string,
    ipAddress?: string,
  ): Promise<{
    token: string;
    expiresAt: number;
    refreshToken: string;
    refreshTokenExpiresAt: number;
  }> {
    // old accessToken
    const oldData: AccessTokenJwtData = await this.jwtService.verifyAsync(
      accessToken,
      {
        ignoreExpiration: true,
      },
    );

    if (oldData.tokenId !== refreshToken) {
      throw new Error(AuthErrors.TOKENS_PROVIDED_NOT_MATCH);
    }

    // check refreshToken in database
    const token = await this.refreshTokenModel.findOne({
      _id: Types.ObjectId(refreshToken),
    });

    if (!token) {
      throw new Error(AuthErrors.REFRESH_TOKEN_NOTFOUND);
    }

    const currentDate = new Date();
    if (token.expiresAt < currentDate) {
      throw new Error(AuthErrors.REFRESH_TOKEN_EXPIRED);
    }

    // delete this token
    await this.refreshTokenModel.deleteOne({
      _id: Types.ObjectId(refreshToken),
    });

    // to expire access tokens that pair with the refresh token
    this.blockUserToken(refreshToken, oldData.uid);

    // make new tokens
    const newRefreshToken = await this.createRefreshToken(
      oldData.uid,
      ipAddress,
      clientId,
    );
    const newAccessToken = this.makeAccessToken(
      { uid: oldData.uid },
      newRefreshToken,
    );

    return newAccessToken;
  }

  async createRefreshToken(
    userId: string,
    ipAddress?: string,
    clientId?: string,
  ): Promise<RefreshTokenDocument> {
    const newRefreshToken = await this.refreshTokenModel.create({
      userId,
      ipAddress,
      clientId,
      expiresAt: moment().add(this.refreshTokenTTL, 's').toDate(),
    });
    return newRefreshToken;
  }

  async blockUserToken(tokenId: string, userId: string) {
    this.blockedUserToken = {
      ...this.blockedUserToken,
      [userId]: {
        [tokenId]: moment().add(this.accessTokenTTL, 's').toDate(),
      },
    };
  }
}
