import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { GraphQLModule } from '@nestjs/graphql';
import { join } from 'path';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { I18nModule, I18nJsonParser, HeaderResolver } from 'nestjs-i18n';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      parser: I18nJsonParser,
      parserOptions: {
        path: join(process.cwd(), '/locales/'),
        watch: true,
      },
      resolvers: [new HeaderResolver(['x-lang'])],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    GraphQLModule.forRoot({
      autoSchemaFile: join(process.cwd(), 'schema.gql'),
      context: ({ req, connection }) => {
        return connection ? { req: connection.context } : { req };
      },
      debug: true,
      tracing: true,
      playground: true,
      sortSchema: true,
    }),
    AuthModule,
  ],
})
export class AppModule {}
