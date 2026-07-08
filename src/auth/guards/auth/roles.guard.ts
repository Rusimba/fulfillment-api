import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../../../common/decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Если @Roles нет — доступ открыт (для всех авторизованных)
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user) {
      throw new ForbiddenException('Не авторизован');
    }

    // Проверяем, есть ли у пользователя нужная роль
    if (!requiredRoles.includes(user.role)) {
      throw new ForbiddenException(
        `Требуются роли: ${requiredRoles.join(', ')}`,
      );
    }

    return true;
  }
}
