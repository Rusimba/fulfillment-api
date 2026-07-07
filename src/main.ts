import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // 1. Включаем CORS, чтобы в будущем наш React-фронтенд мог спокойно делать запросы
  app.enableCors();

  // 2. Конфигурируем Swagger
  const config = new DocumentBuilder()
    .setTitle('Mini-Fulfillment API')
    .setDescription(
      'Интерактивная документация REST API для системы управления заказами и складом',
    )
    .setVersion('1.0')
    // Настраиваем авторизацию через JWT токена для Swagger
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Введите JWT токен',
        in: 'header',
      },
      'JWT-auth', // Уникальное имя схемы авторизации
    )
    .build();

  // 3. Создаем документ и разворачиваем его по пути /api
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // 4. Запускаем сервер на 3000 порту
  await app.listen(3000);
  console.log(`🚀 Сервер успешно запущен!`);
  console.log(
    `📝 Документация Swagger доступна по адресу: http://localhost:3000/api`,
  );
}
bootstrap();
