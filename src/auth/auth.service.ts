import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt'; // <-- 1. Импорт

@Injectable()
export class AuthService {
  // 2. Внедряем JwtService
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    // 1. Ищем пользователя в базе
    const user = await this.prisma.user.findUnique({
      where: {
        email: loginDto.email,
      },
    });

    // 2. Если пользователя нет (вернулся null) — выгоняем!
    // UnauthorizedException автоматически создаст красивую ошибку 401 для клиента
    if (!user) {
      throw new UnauthorizedException('Неверный email или пароль');
    }

    // 3. Проверяем пароль.
    // bcrypt.compare берет обычный текст (из DTO) и хеш (из базы) и сверяет их. Возвращает true или false.
    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);

    // 4. Если пароли не совпали (false) — выгоняем!
    if (!isPasswordValid) {
      throw new UnauthorizedException('Неверный email или пароль');
    }

    const payload = {
      sub: user.id, // В JWT принято называть id словом 'sub' (subject)
      email: user.email,
      role: user.role,
    };

    // 6. Печатаем токен
    const token = await this.jwtService.signAsync(payload);

    // 7. Возвращаем токен клиенту
    return {
      access_token: token,
    };
  }
}
