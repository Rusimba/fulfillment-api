import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from './orders.service';
import { PrismaService } from '../../prisma/prisma.service';
import { BadRequestException } from '@nestjs/common';

describe('OrdersService', () => {
  let ordersService: OrdersService;

  const mockPrismaService = {
    $transaction: jest.fn(),
    product: {
      findMany: jest.fn(),
      update: jest.fn(),
    },
    order: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    ordersService = module.get<OrdersService>(OrdersService);

    // Настраиваем $transaction так, чтобы он просто вызывал callback
    mockPrismaService.$transaction.mockImplementation(async (callback) => {
      return await callback(mockPrismaService);
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create order successfully', async () => {
      const createOrderDto = {
        items: [
          { productId: 1, quantity: 2 },
          { productId: 2, quantity: 1 },
        ],
      };

      const userId = 1;

      const mockProducts = [
        { id: 1, name: 'Product 1', price: 100, stock: 10 },
        { id: 2, name: 'Product 2', price: 200, stock: 5 },
      ];

      const mockOrder = {
        id: 1,
        userId: 1,
        items: [
          { id: 1, quantity: 2, price: 100, productId: 1 },
          { id: 2, quantity: 1, price: 200, productId: 2 },
        ],
      };

      mockPrismaService.product.findMany.mockResolvedValue(mockProducts);
      mockPrismaService.order.create.mockResolvedValue(mockOrder);
      mockPrismaService.product.update.mockResolvedValue({});

      const result = await ordersService.create(createOrderDto, userId);

      expect(result).toEqual(mockOrder);
      expect(mockPrismaService.product.findMany).toHaveBeenCalledWith({
        where: { id: { in: [1, 2] } },
      });
      expect(mockPrismaService.order.create).toHaveBeenCalled();
      expect(mockPrismaService.product.update).toHaveBeenCalledTimes(2);
    });

    it('should throw BadRequestException if product not found', async () => {
      const createOrderDto = {
        items: [{ productId: 999, quantity: 1 }],
      };

      const userId = 1;

      mockPrismaService.product.findMany.mockResolvedValue([]);

      await expect(
        ordersService.create(createOrderDto, userId),
      ).rejects.toThrow(BadRequestException);

      expect(mockPrismaService.order.create).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if insufficient stock', async () => {
      const createOrderDto = {
        items: [{ productId: 1, quantity: 100 }],
      };

      const userId = 1;

      const mockProducts = [{ id: 1, name: 'Product 1', price: 100, stock: 5 }];

      mockPrismaService.product.findMany.mockResolvedValue(mockProducts);

      await expect(
        ordersService.create(createOrderDto, userId),
      ).rejects.toThrow(BadRequestException);

      expect(mockPrismaService.order.create).not.toHaveBeenCalled();
    });
  });

  describe('findMyOrders', () => {
    it('should return user orders with items and products', async () => {
      const userId = 1;

      const mockOrders = [
        {
          id: 1,
          userId: 1,
          items: [
            {
              id: 1,
              quantity: 2,
              price: 100,
              product: { id: 1, name: 'Product 1' },
            },
          ],
        },
      ];

      mockPrismaService.order.findMany.mockResolvedValue(mockOrders);

      const result = await ordersService.findMyOrders(userId);

      expect(result).toEqual(mockOrders);
      expect(mockPrismaService.order.findMany).toHaveBeenCalledWith({
        where: { userId: 1 },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
        orderBy: {
          id: 'desc',
        },
      });
    });
  });
});
