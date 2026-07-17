import {
  IsArray,
  ValidateNested,
  IsNumber,
  Min,
  IsInt,
  ArrayNotEmpty,
  ValidatorConstraintInterface,
  ValidationArguments,
  ValidatorConstraint,
  registerDecorator,
  ValidationOptions,
} from 'class-validator';
import { Type } from 'class-transformer';

@ValidatorConstraint({ name: 'ArrayNoDuplicate', async: false }) // логика castom decorator
export class IsArrayNoDuplicateConstraint implements ValidatorConstraintInterface {
  validate(value: OrderItemDto[], args: ValidationArguments) {
    if (!Array.isArray(value)) return true;
    const arrayProducts = value.map((val) => val.productId);
    return new Set(arrayProducts).size === value.length;
  }
  defaultMessage(args: ValidationArguments) {
    return 'Заказ с дубликатами';
  }
}
// функция обертка для вызова
export function IsArrayNoDuplicate(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsArrayNoDuplicateConstraint,
    });
  };
}
// 1. Описываем, как должен выглядеть один товар в массиве
class OrderItemDto {
  @IsInt({ message: 'Id должно быть целым числом' })
  @Min(1, { message: 'Айди не может быть орицательным' })
  productId: number;

  @IsInt({ message: 'Количество должно быть целым числом' })
  @Min(1, { message: 'Минимальное кол во 1' })
  quantity: number;
}

// 2. Описываем сам DTO
export class CreateOrderDto {
  @IsArray() // Проверяем, что это массив
  @ArrayNotEmpty({ message: 'Где товары?' })
  @ValidateNested({ each: true }) // Говорим NestJS провалидировать каждый элемент внутри массива
  @IsArrayNoDuplicate()
  @Type(() => OrderItemDto) // Превращаем сырой JSON в объекты класса OrderItemDto
  items: OrderItemDto[];
}
