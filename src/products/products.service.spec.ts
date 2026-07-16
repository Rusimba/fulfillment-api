import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from 'src/redis/redis.service';

// 1. Создаем "поддельный" Prisma Service
const mockPrismaService = {
  product: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

// 2. Создаем "поддельный" Redis Service
const mockRedisService = {
  get: jest.fn(),
  setWithTtl: jest.fn(),
  del: jest.fn(),
};

describe('ProductsService', () => {
  let service: ProductsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        // 3. Подменяем настоящие сервисы на наши моки
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: RedisService, useValue: mockRedisService },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
  });

  // Этот тест теперь пройдет успешно!
  it('должен быть определен (should be defined)', () => {
    expect(service).toBeDefined();
  });
});
