import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common'; // <-- Проверь, что импортирован Get
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { AuthGuard } from '../auth/guards/auth/auth.guard';

@ApiTags('Заказы (Orders)')
@ApiBearerAuth('JWT-auth')
@UseGuards(AuthGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @ApiOperation({ summary: 'Оформление нового заказа' })
  // ... твои декораторы @ApiResponse
  @Post()
  create(@Body() createOrderDto: CreateOrderDto, @Request() req) {
    return this.ordersService.create(createOrderDto, req.user.sub);
  }

  // 👇 Добавляем новый маршрут
  @ApiOperation({ summary: 'Получить историю заказов текущего пользователя' })
  @Get('my')
  findMyOrders(@Request() req) {
    // req.user.sub — это ID пользователя, который Вышибала (AuthGuard) достал из токена
    return this.ordersService.findMyOrders(req.user.sub);
  }
}
