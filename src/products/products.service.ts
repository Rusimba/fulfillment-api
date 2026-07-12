import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from 'src/redis/redis.service';
import { CacheKey } from 'src/common/decorators/cache.decoractor';

@Injectable()
export class ProductsService {
  // Внедряем Присму в класс
  constructor(
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
  ) {}

  // Метод создания товара
  create(createProductDto: CreateProductDto) {
    return this.prisma.product.create({
      data: createProductDto,
    });
  }

  findAll() {
    return this.prisma.product.findMany();
  }

  async findOne(id: number) {
    const cacheKey = 'product:' + id;

    // 1. Проверяем кэш
    const cachedData = await this.redisService.get(cacheKey);
    if (cachedData) {
      return JSON.parse(cachedData); // Нашли? Сразу отдаем и завершаем функцию!
    }

    // 2. Идем в базу
    const product = await this.prisma.product.findUnique({
      where: {
        id: +id,
      },
    });

    if (!product) {
      throw new NotFoundException('Товар не найден');
    }

    // 3. Сохраняем в кэш (передаем cacheKey без кавычек и стрингифицируем объект)
    await this.redisService.setWithTtl(cacheKey, JSON.stringify(product), 3600);

    // 4. Возвращаем оригинальный объект клиенту
    return product;
  }

 async update(id: number, updateProductDto: UpdateProductDto) {
    const cacheKey = 'product:' + id;

    // 1. Обновляем товар в базе данных
    const updatedProduct = await this.prisma.product.update({
      where: { id: +id },
      data: updateProductDto,
    });

    // 2. Сбрасываем кэш конкретного товара
    await this.redisService.del(cacheKey);

    // 3. Сбрасываем кэш общего списка (ведь товар изменился!)
    await this.redisService.del('products:all');

    // 4. Возвращаем обновленный товар
    return updatedProduct;
  }

  async remove(id: number) {
    const cacheKey = 'product:' + id;
    const deleteProduct = await this.prisma.product.delete({
      where: {id: +id},
    });
    await this.redisService.del(cacheKey);
    await this.redisService.del('products:all');
    return deleteProduct;
  }
}
