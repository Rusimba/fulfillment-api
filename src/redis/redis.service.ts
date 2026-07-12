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
    return this.redisClient.get(key);
  }
  async setWithTtl(key: string, value: string, ttl: number) {
    return this.redisClient.set(key, value, 'EX', ttl);
  }
  async del(key:string){
    return this.redisClient.del(key);
  }
}
