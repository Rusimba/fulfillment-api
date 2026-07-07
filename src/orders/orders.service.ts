import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async create(createOrderDto: CreateOrderDto, userId: number) {
    return await this.prisma.$transaction(async (prisma) => {
    // 1. Получаем товары С БЛОКИРОВКОЙ (FOR UPDATE)
      const productIds = createOrderDto.items.map(item => item.productId);
      const dbProducts = await prisma.product.findMany({
        where: { id: { in: productIds } },
      });

      // 2. Проверяем наличие и stock
      for (const item of createOrderDto.items) {
        const realProduct = dbProducts.find(p => p.id === item.productId);
        if (!realProduct) {
          throw new BadRequestException(
            `Товар с ID ${item.productId} не найден`,
          );
        }
        if (realProduct.stock < item.quantity) {
          throw new BadRequestException(
            `Недостаточно товара "${realProduct.name}". Вы хотите ${item.quantity}, а в наличии всего ${realProduct.stock} шт.`,
          );
        }
      }

      // 3. Создаём заказ
      const order = await prisma.order.create({
      data: {
          userId: userId,
          items: {
            create: createOrderDto.items.map((item) => {
              const realProduct = dbProducts.find(
                (p) => p.id === item.productId,
              );
              return {
                quantity: item.quantity,
                price: realProduct.price,
                product: {
                  connect: { id: item.productId },
                },
              };
            }),
          },
        },
      });

      // 4. Уменьшаем stock
      for (const item of createOrderDto.items) {
        await prisma.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      return order;
    });
  }
  findMyOrders(userId: number) {
    return this.prisma.order.findMany({
      where: {
        userId: userId
      },
      include: {
        // Сначала достаем все позиции (items) в этом заказе
        items: {
          include: {
            // А затем для каждой позиции просим подтянуть сам товар
            product: true,
          }
        }
      },
      orderBy: {
        id: 'desc'
      }
    });
  }
  findOne(id: number) { return `This action returns a #${id} order`; }
  update(id: number, updateOrderDto: any) { return `This action updates a #${id} order`; }
  remove(id: number) { return `This action removes a #${id} order`; }
}
