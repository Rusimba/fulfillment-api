import { IsArray, ValidateNested, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

// 1. Описываем, как должен выглядеть один товар в массиве
class OrderItemDto {
  @IsNumber()
  productId: number;

  @IsNumber()
  quantity: number;
}

// 2. Описываем сам DTO
export class CreateOrderDto {
  @IsArray() // Проверяем, что это массив
  @ValidateNested({ each: true }) // Говорим NestJS провалидировать каждый элемент внутри массива
  @Type(() => OrderItemDto) // Превращаем сырой JSON в объекты класса OrderItemDto
  items: OrderItemDto[];
}