import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class AuthGuard implements CanActivate {
  // 1. Внедряем нашу машинку для работы с токенами (JwtService)
  constructor(
    private jwtService: JwtService,
    private redisService: RedisService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Получаем объект самого HTTP-запроса (в нем лежат заголовки, тело и т.д.)
    const request = context.switchToHttp().getRequest();
    // 2. Ищем браслет с помощью вспомогательной функции (написана ниже)
    const token = this.extractTokenFromHeader(request);

    // Если браслета нет — сразу прогоняем
    if (!token) {
      throw new UnauthorizedException('Доступ запрещен: нет токена');
    }
    const isBlacklisted = await this.redisService.get('blacklist:' + token);
    if (isBlacklisted != null) {
      throw new UnauthorizedException('Токен отозван');
    }
    try {
      // 3. Светим на браслет ультрафиолетом! 
      // verifyAsync расшифрует токен и проверит его срок годности и подпись
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET // Должно совпадать с тем, что в auth.module!
        });

      // 4. САМОЕ ВАЖНОЕ: Кладем расшифрованные данные Ивана прямо в запрос.
      // Теперь любой Контроллер, к которому пойдет запрос дальше, будет знать, кто это!
      request['user'] = payload;
    } catch {
      // Если токен поддельный, или срок годности (1d) истек — выгоняем
      throw new UnauthorizedException('Доступ запрещен: недействительный токен');
    }

    // 5. Дверь открыта! Пропускаем клиента к Контроллеру
    return true;
  }

  // Вспомогательная функция, которая достает токен из заголовка "Authorization: Bearer <token>"
  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
