import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';

@Injectable()
export class UserAccessGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user; // Текущий авторизованный пользователь
    const targetUserId = Number(request.params.id); // ID пользователя из URL

    if (!user) {
      throw new ForbiddenException('Не авторизован');
    }

    if (user.role === 'ADMIN') {
      return true;
    }

    if (sub !== targetUserId) {
      throw new ForbiddenException('Недостаточно прав для этого действия');
    }

    return true;
  }
}
