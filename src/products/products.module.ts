import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { RedisModule } from 'src/redis/redis.module';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService, RedisModule], // <-- Добавили PrismaService в providers
})
export class ProductsModule {}
