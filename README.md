# 🚚 Mini-Fulfillment API

Backend-система для управления складом и заказами с JWT-аутентификацией, атомарными транзакциями и полной API-документацией.

**Стек:** Node.js 22, NestJS 11, TypeScript 5.7, PostgreSQL, Prisma, JWT

**Frontend:** React + Vite + TypeScript ([fullfillment-client](https://github.com/Rusimba/fullfillment-client))

![CI](https://github.com/Rusimba/fulfillment-api/actions/workflows/ci.yml/badge.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

---

## ✨ Возможности

### 🔐 Аутентификация (JWT)
- Регистрация и вход пользователей
- Защищённые endpoints через кастомный `AuthGuard`
- Получение профиля текущего пользователя
- Хэширование паролей через `bcrypt`

### 👤 Пользователи
- Полный CRUD (создание, чтение, обновление, удаление)
- Ролевая модель (поле `role` в БД)

### 📦 Товары
- Создание и получение списка товаров
- Управление остатками на складе (поле `stock`)
- Защищённые endpoints

### 🛒 Заказы
- Создание заказа с несколькими товарами
- **Атомарные транзакции** — одновременное создание заказа и списание остатков
- История заказов текущего пользователя (`GET /orders/my`)
- Статусы заказов: `PENDING`, `PAID`, `SHIPPED`, `CANCELLED`
- **Фиксация цены на момент покупки** (поле `price` в `OrderItem`) — защита от последующих изменений цены товара

---

## 🛠 Стек технологий

![NestJS](https://img.shields.io/badge/NestJS_11-E0234E?logo=nestjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript_5.7-3178C6?logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js_22-339933?logo=node.js&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?logo=prisma&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?logo=jsonwebtokens&logoColor=white)
![Swagger](https://img.shields.io/badge/Swagger-85EA2D?logo=swagger&logoColor=white)
![Jest](https://img.shields.io/badge/Jest-C21325?logo=jest&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?logo=docker&logoColor=white)

### Backend
- **Runtime:** Node.js 22+
- **Framework:** NestJS 11
- **Language:** TypeScript 5.7
- **ORM:** Prisma 5.15
- **Validation:** class-validator + class-transformer
- **Auth:** JWT + bcrypt

### Database
- **PostgreSQL 14+** — основная БД
- **Prisma Migrations** — управление схемой
- **Продуманная схема** — `OrderItem.price` фиксируется на момент заказа (защита от изменения цены товара)

### Security
- **JWT** — аутентификация через `AuthGuard`
- **bcrypt** — хэширование паролей
- **CORS** — настроен для интеграции с фронтендом
- **ValidationPipe** — автоматическая валидация всех входных данных

### Quality
- **Swagger** — автогенерация API-документации на `/api`
- **Jest** — unit и e2e тесты
- **ESLint + Prettier** — единый стиль кода
- **Docker** — production-ready multi-stage build

---

## 📁 Структура проекта

```text
src/
├── auth/                    # Аутентификация
│   ├── dto/                 # LoginDto
│   ├── guards/auth/         # JWT AuthGuard
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── auth.module.ts
│   └── auth.service.spec.ts # Unit-тесты
├── users/                   # Пользователи (CRUD)
│   ├── dto/                 # CreateUserDto, UpdateUserDto
│   ├── entities/
│   ├── users.controller.ts
│   ├── users.service.ts
│   ├── users.module.ts
│   └── users.service.spec.ts
├── products/                # Товары
│   ├── dto/
│   ├── entities/
│   ├── products.controller.ts
│   ├── products.service.ts
│   ├── products.module.ts
│   └── products.service.spec.ts
├── orders/                  # Заказы + транзакции
│   ├── dto/                 # CreateOrderDto
│   ├── entities/
│   ├── orders.controller.ts
│   ├── orders.service.ts
│   ├── orders.module.ts
│   └── orders.service.spec.ts
├── prisma.service.ts        # Prisma как NestJS сервис
├── app.module.ts            # Корневой модуль
└── main.ts                  # Точка входа + Swagger + CORS + ValidationPipe
```

**Архитектурные принципы:**
- **Модульная структура** — каждый домен в отдельном модуле
- **Dependency Injection** — слабая связанность через IoC-контейнер NestJS
- **DTO pattern** — валидация входных данных через class-validator
- **Three-layer architecture** — Controller → Service → Prisma

---

## 📚 API Endpoints

**📖 Интерактивная документация:** `http://localhost:3000/api` (Swagger UI)

### 🔐 Authentication
| Метод | Путь | Описание | Авторизация |
|-------|------|----------|-------------|
| `POST` | `/auth/register` | Регистрация нового пользователя | ❌ |
| `POST` | `/auth/login` | Вход, возвращает JWT токен | ❌ |
| `GET` | `/auth/profile` | Профиль текущего пользователя | ✅ JWT |

### 👤 Users (полный CRUD)
| Метод | Путь | Описание | Авторизация |
|-------|------|----------|-------------|
| `POST` | `/users` | Создать пользователя | ❌ |
| `GET` | `/users` | Список всех пользователей | ❌ |
| `GET` | `/users/:id` | Получить пользователя | ❌ |
| `PATCH` | `/users/:id` | Обновить пользователя | ❌ |
| `DELETE` | `/users/:id` | Удалить пользователя | ❌ |

### 📦 Products
| Метод | Путь | Описание | Авторизация |
|-------|------|----------|-------------|
| `POST` | `/products` | Создать товар | ✅ JWT |
| `GET` | `/products` | Список товаров | ✅ JWT |

### 🛒 Orders
| Метод | Путь | Описание | Авторизация |
|-------|------|----------|-------------|
| `POST` | `/orders` | Создать заказ (списывает остатки) | ✅ JWT |
| `GET` | `/orders/my` | История заказов текущего пользователя | ✅ JWT |

---

## 🏗 Архитектурные решения

### 1. Атомарные транзакции при создании заказа

Используется `prisma.$transaction()` для гарантии консистентности данных:

```typescript
async createOrder(userId: number, dto: CreateOrderDto) {
  return this.prisma.$transaction(async (tx) => {
    const products = await tx.product.findMany({
      where: { id: { in: dto.items.map(i => i.productId) } }
    });
    
    for (const item of dto.items) {
      const product = products.find(p => p.id === item.productId);
      if (!product || product.stock < item.quantity) {
        throw new BadRequestException(`Недостаточно товара ${item.productId}`);
      }
    }
    
    const order = await tx.order.create({
      data: {
        userId,
        status: 'PENDING',
        items: {
          create: dto.items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: products.find(p => p.id === item.productId)!.price,
          })),
        },
      },
    });
    
    await Promise.all(
      dto.items.map(item =>
        tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        })
      )
    );
    
    return order;
  });
}
```

**Почему это важно:**
- Если списание остатков упадёт — заказ тоже откатится (и наоборот)
- Предотвращает race conditions при параллельных заказах
- Цена фиксируется на момент покупки — защита от изменения цены товара

### 2. Dependency Injection через IoC-контейнер

```typescript
@Controller('orders')
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
  ) {}
}
```

**Преимущества:**
- Слабая связанность между компонентами
- Лёгкое тестирование (моки сервисов)
- Следует принципу Dependency Inversion (SOLID)

### 3. DTO + автоматическая валидация

Глобальный `ValidationPipe` в `main.ts`:

```typescript
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  })
);
```

**Результат:** автоматический возврат `400 Bad Request` с деталями ошибок при невалидных данных.

### 4. Guards для защиты endpoints

Кастомный `AuthGuard` проверяет JWT токен и добавляет расшифрованные данные в `request.user`:

```typescript
@UseGuards(AuthGuard)
@Get('profile')
getProfile(@Request() req) {
  return req.user;
}
```

---

## 📊 Схема базы данных (Prisma)

```prisma
model User {
  id       Int      @id @default(autoincrement())
  email    String   @unique
  password String
  name     String?
  role     String   @default("CUSTOMER")
  orders   Order[]
}

model Product {
  id          Int         @id @default(autoincrement())
  name        String
  description String?
  price       Float
  stock       Int
  orderItems  OrderItem[]
}

model Order {
  id        Int      @id @default(autoincrement())
  createdAt DateTime @default(now())
  status    String   @default("PENDING")
  userId    Int
  user      User     @relation(fields: [userId], references: [id])
  items     OrderItem[]
}

model OrderItem {
  id        Int     @id @default(autoincrement())
  quantity  Int
  price     Float
  orderId   Int
  order     Order   @relation(fields: [orderId], references: [id])
  productId Int
  product   Product @relation(fields: [productId], references: [id])
}
```

**Ключевое решение:** `OrderItem.price` — копия цены товара на момент покупки.

---

## 🐳 Docker

**Dockerfile** оптимизирован для production:
- **Multi-stage build** — финальный образ ~200 MB (вместо ~800 MB)
- **Кэширование зависимостей** — stage `deps` пересобирается только при изменении `package.json`
- **Непривилегированный пользователь** — безопасность
- **Healthcheck** — автоматическая проверка работоспособности

```bash
docker-compose up --build
```

---

## 🚀 Локальная разработка

```bash
git clone https://github.com/Rusimba/fulfillment-api.git
cd fulfillment-api
npm install
cp .env.example .env
npx prisma migrate dev
npm run start:dev
```

---

## 🗺 Roadmap

- [x] Docker Compose с PostgreSQL
- [x] Multi-stage Dockerfile
- [x] Трёхуровневая авторизация (Auth + Roles + IDOR Guards)
- [ ] Redis для кэширования горячих данных
- [ ] RabbitMQ для event-driven архитектуры
- [ ] CI/CD через GitHub Actions

---

**Автор:** Rusimba  
**GitHub:** [github.com/Rusimba](https://github.com/Rusimba)  
**Backend:** [fulfillment-api](https://github.com/Rusimba/fulfillment-api)  
**Frontend:** [fullfillment-client](https://github.com/Rusimba/fullfillment-client)