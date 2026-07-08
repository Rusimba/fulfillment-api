import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductsModule } from './products/products.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { OrdersModule } from './orders/orders.module';
import { PrismaModule } from '../prisma/prisma.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { CustomThrottlerGuard } from './common/guards/custom-throttler.guards';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    ProductsModule,
    UsersModule,
    AuthModule,
    OrdersModule,
    PrismaModule,
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 60 секунд
        limit: 10, // 10 запросов с IP
      },
    ]),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: CustomThrottlerGuard, // Используем наш кастомный ThrottlerGuard,
    },
  ],
})
export class AppModule {}
