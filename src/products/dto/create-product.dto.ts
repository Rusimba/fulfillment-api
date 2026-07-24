import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateProductDto {
  @IsString()
  name: string;
  @IsOptional()
  @IsString()
  description?: string;
  @IsNumber()
  price: number;
  @IsNumber()
  stock: number;
}
