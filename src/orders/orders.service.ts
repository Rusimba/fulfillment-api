import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { PrismaService } from '../prisma.service';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async create(createOrderDto: CreateOrderDto, userId: number) {
    // 1. Вытаскиваем все ID товаров, которые хочет купить пользователь
    const productIds = createOrderDto.items.map(item => item.productId);

    // 2. Достаем эти товары ИЗ БАЗЫ ДАННЫХ (чтобы узнать их настоящую цену)
    const dbProducts = await this.prisma.product.findMany({
      where: { id: { in: productIds } }
    });
    for (const item of createOrderDto.items) {
      const realProduct = dbProducts.find(p => p.id === item.productId);
      if (!realProduct) {
        throw new BadRequestException(`Товар с ID ${item.productId} не найден`);
      }
      if (realProduct.stock < item.quantity) {
        throw new BadRequestException(
          `Недостаточно товара "${realProduct.name}". Вы хотите ${item.quantity}, а в наличии всего ${realProduct.stock} шт.`
        );
      }
    }

    // 3. Создаем заказ
    const order = await this.prisma.order.create({
      data: {
        userId: userId,
        items: {
          create: createOrderDto.items.map(item => {
            // Ищем настоящий товар в массиве, который мы только что достали из БД
            const realProduct = dbProducts.find(p => p.id === item.productId);
            if (!realProduct) {
              throw new BadRequestException(`Товар с ID ${item.productId} не найден`);
            }

            return {
              quantity: item.quantity,
              price: realProduct.price, // БЕРЕМ ЦЕНУ ИЗ БД, А НЕ ОТ ФРОНТЕНДА! 🔒
              product: {
                connect: { id: item.productId } // Правильный синтаксис связи Prisma 🔗
              }
            };
          })
        }
      }
    });

    // 4. Уменьшаем остатки на складе (stock) для каждого купленного товара
    for (const item of createOrderDto.items) {
      await this.prisma.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } }
      });
    }

    return order;
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
