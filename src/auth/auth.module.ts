import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt'; // <-- 1. Импортируем модуль

@Module({
  imports: [
    // 2. Настраиваем печатный станок
    JwtModule.register({
      global: true, // Делаем его доступным везде в проекте
      secret: process.env.JWT_SECRET, // (В реальном проекте это прячут, но пока оставим так)
      signOptions: { expiresIn: '1d' }, // Токен "сгорит" через 1 день
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
