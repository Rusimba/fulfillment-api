import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { RedisService } from 'src/redis/redis.service';
import {
  CACHE_KEY_METADATA,
  CACHE_TTL_METADATA,
} from '../decorators/cache.decoractor';

@Injectable()
export class CacheInterceptor implements NestInterceptor {
  constructor(
    private readonly redisService: RedisService,
    private readonly reflector: Reflector,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const cacheKey = this.reflector.get<string>(
      CACHE_KEY_METADATA,
      context.getHandler(),
    );
    const cacheTtl =
      this.reflector.get<number>(CACHE_TTL_METADATA, context.getHandler()) ||
      60;
    if (!cacheKey) {
      return next.handle();
    }
    const ttl = cacheTtl ?? 300;
    const cachedData = await this.redisService.get(cacheKey);
    if (cachedData) {
      const parsedData = JSON.parse(cachedData);
      return of(parsedData);
    }
    return next.handle().pipe(
      tap((data) => {
        const stringData = JSON.stringify(data);
        this.redisService.setWithTtl(cacheKey, stringData, ttl).catch((err) => {
          // Логируем ошибку, но не ломаем ответ клиенту
          console.error('Ошибка записи в Redis: ${cacheKey}:', err.message);
        });
      }),
    );
  }
}
