import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { PrismaService } from '../prisma.service'; // <-- Добавили импорт

@Module({
  controllers: [ProductsController],
  providers: [ProductsService, PrismaService], // <-- Добавили PrismaService в providers
})
export class ProductsModule {}
