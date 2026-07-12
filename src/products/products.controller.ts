import { Controller, Get, Post, Body, UseGuards, UseInterceptors } from '@nestjs/common';
import { ProductsService } from './products.service';
import { AuthGuard } from '../auth/guards/auth/auth.guard';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CacheInterceptor } from '../common/interceptors/cache.interceptor';
import { CacheKey, CacheTTL } from '../common/decorators/cache.decoractor';
import { RedisService } from 'src/redis/redis.service';

@ApiTags('Товары (Products)')
@ApiBearerAuth('JWT-auth')
@UseInterceptors(CacheInterceptor)
@UseGuards(AuthGuard) // <-- Охранник на весь каталог
@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly redisService: RedisService,
  ) {}

  @Post()
  async create(@Body() createProductDto: any) {
    const createProfuct = await this.productsService.create(createProductDto);
    await this.redisService.del('products:all');
    return createProfuct;
  }

  @Get()
  @CacheKey('products:all')
  @CacheTTL(600)
  findAll() {
    return this.productsService.findAll(); // Этот метод ждет React
  }
}
