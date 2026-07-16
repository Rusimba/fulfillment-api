import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Request,
} from '@nestjs/common'; // <-- Добавили Request
import { AuthService } from './auth.service';
import { AuthGuard } from './guards/auth/auth.guard';
// PrismaService здесь можно убрать из импортов, он в контроллере не используется
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RedisService } from 'src/redis/redis.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly redisService: RedisService,
  ) {}

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
  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }
@Post('logout')
@UseGuards(AuthGuard)
  async logout(@Request() req) {
    const token = req.headers.authorization.split(' ')[1];
    const exp = req.user.exp;
    const ttl = Math.max(Math.floor(exp - Date.now() / 1000), 1);
    await this.redisService.setWithTtl('blacklist:' + token, 'true', ttl);
    return { message: 'Logged out successfully' };
  }
}
