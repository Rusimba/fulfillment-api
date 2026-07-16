import Redis from 'ioredis';
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private redisClient: Redis;
  onModuleInit() {
    this.redisClient = new Redis({
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
    });
  }
  onModuleDestroy() {
    this.redisClient.quit();
  }
  async get(key: string) {
    try {
      return await this.redisClient.get(key);
    } catch (error) {
      console.error('get error:', key, error);
    }
  }
  async setWithTtl(key: string, value: string, ttl: number) {
    try {
      return await this.redisClient.set(key, value, 'EX', ttl);
    } catch (error) {
      console.error('setTTl error:', key, error);
    }
  }
  async del(key: string) {
    try {
      return await this.redisClient.del(key);
    } catch (error) {
      console.error('del error:', key, error);
    }
  }
}
