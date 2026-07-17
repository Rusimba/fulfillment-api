import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { ProductsService } from 'src/products/products.service';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private productsService: ProductsService,
  ) {}

  async create(createOrderDto: CreateOrderDto, userId: number) {
    const productIds = createOrderDto.items.map((item) => item.productId);
    const order = await this.prisma.$transaction(async (prisma) => {
      // 1. Получаем товары из БД
      const dbProducts = await prisma.product.findMany({
        where: { id: { in: productIds } },
      });
      const productsMap = new Map(dbProducts.map((p) => [p.id, p]));
      const orderItems = createOrderDto.items.map((item) => {
        const realProduct = productsMap.get(item.productId);

        // Проверка существования
        if (!realProduct) {
          throw new BadRequestException(
            `Товар с ID ${item.productId} не найден`,
          );
        }

        // Проверка остатков
        if (realProduct.stock < item.quantity) {
          throw new BadRequestException(
            `Недостаточно товара "${realProduct.name}". ` +
              `Хотите ${item.quantity}, в наличии ${realProduct.stock} шт.`,
          );
        }

        return {
          quantity: item.quantity,
          price: realProduct.price,
          product: {
            connect: { id: item.productId },
          },
        };
      });

      const createOrder = await prisma.order.create({
        data: {
          userId,
          status: 'PENDING',
          items: {
            create: orderItems,
          },
        },
        include: {
          items: {
            include: {
              product: {
                select: { id: true, name: true },
              },
            },
          },
        },
      });

      // 5. Параллельно уменьшаем stock
      await Promise.all(
        createOrderDto.items.map((item) =>
          prisma.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } },
          }),
        ),
      );
      return createOrder;
    });
    await this.productsService.invalidateProductsCache(productIds);
    return order;
  }

  findMyOrders(userId: number) {
    return this.prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: { product: true },
        },
      },
      orderBy: { id: 'desc' },
    });
  }

  findOne(id: number) {
    return this.prisma.order.findUnique({
      where: { id },
      include: {
        items: { include: { product: true } },
        user: {
          select: { id: true, email: true, name: true },
        },
      },
    });
  }

  async update(id: number, updateOrderDto: any) {
    return this.prisma.order.update({
      where: { id },
      data: updateOrderDto,
    });
  }

  async remove(id: number) {
    return this.prisma.order.delete({ where: { id } });
  }
}
