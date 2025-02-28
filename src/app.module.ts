import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { ArticlesModule } from './articles/articles.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-store';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        store: await redisStore({
          socket: {
            host: configService.get('REDIS_HOST') || '127.0.0.1',
            port: parseInt(configService.get('REDIS_PORT') || '6379'),
          },
          ttl: 300000,
        }),
      }),
    }),
    DatabaseModule, 
    ArticlesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}