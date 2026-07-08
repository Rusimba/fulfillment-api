import { Injectable, ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerRequest } from '@nestjs/throttler';

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  protected async handleRequest(requestProps: ThrottlerRequest): Promise<boolean> {
    const { context } = requestProps;
    const request = context.switchToHttp().getRequest();

    // GET-запросы не лимитируем (они идемпотентные и безопасные)
    if (request.method === 'GET') {
      return true;
    }

    // POST/PATCH/DELETE лимитируем (они меняют состояние)
    return super.canActivate(context);
  }
}
