import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { AuthGuard } from '../auth/guards/auth/auth.guard';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CacheInterceptor } from '../common/interceptors/cache.interceptor';
import { CacheKey, CacheTTL } from '../common/decorators/cache.decoractor';
import { CreateProductDto } from './dto/create-product.dto';

@ApiTags('Товары (Products)')
@ApiBearerAuth('JWT-auth')
@UseInterceptors(CacheInterceptor)
@UseGuards(AuthGuard) // <-- Охранник на весь каталог
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  async create(@Body() createProductDto: CreateProductDto) {
    const createProfuct = await this.productsService.create(createProductDto);
    return createProfuct;
  }

  @Get()
  @CacheKey('products:all')
  @CacheTTL(600)
  findAll() {
    return this.productsService.findAll(); // Этот метод ждет React
  }
}
