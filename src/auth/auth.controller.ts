import { Controller, Post, Body, UseGuards, Get, Request} from '@nestjs/common'; // <-- Добавили Request
import { AuthService } from './auth.service';
import { AuthGuard } from './guards/auth/auth.guard';
// PrismaService здесь можно убрать из импортов, он в контроллере не используется
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  // Путь будет /auth/profile (слово get в пути писать не принято, так как метод GET уже об этом говорит)
  @Get('profile')
  @UseGuards(AuthGuard)
  getProfile(@Request() req){// <-- Ловим весь объект запроса
    // Вышибала пропустил запрос и положил расшифрованный токен в req.user.
    // Просто возвращаем его клиенту!
    return req.user; 
  }
}
