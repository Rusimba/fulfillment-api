import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async create(createOrderDto: CreateOrderDto, userId: number) {
    return await this.prisma.$transaction(async (prisma) => {
      // 1. Получаем товары из БД
      const productIds = createOrderDto.items.map((item) => item.productId);
      const dbProducts = await prisma.product.findMany({
        where: { id: { in: productIds } },
      });

      // 2. Создаём Map для быстрого доступа O(1)
      const productsMap = new Map(dbProducts.map((p) => [p.id, p]));

      // 3. ОДИН проход: проверяем И создаём orderItems
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

        // Возвращаем данные для OrderItem
        return {
          quantity: item.quantity,
          price: realProduct.price, // ← теперь TypeScript знает, что realProduct существует
          product: {
            connect: { id: item.productId },
          },
        };
      });

      // 4. Создаём заказ с готовым массивом orderItems
      const order = await prisma.order.create({
        data: {
          userId,
          status: 'PENDING',
          items: {
            create: orderItems, // ← используем готовый массив
          },
        },
        include: {
          items: {
            include: { product: true },
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

      return order;
    });
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
        user: true,
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
