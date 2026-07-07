# ============================================
# STAGE 1: Установка зависимостей
# ============================================
FROM node:22-alpine AS deps
WORKDIR /app
RUN apk add --no-cache openssl

# Копируем только файлы зависимостей (для кэширования слоёв!)
COPY package*.json ./
COPY prisma ./prisma/

# Устанавливаем ВСЕ зависимости (и prod, и dev)
RUN npm ci

# Генерируем Prisma client
RUN npx prisma generate

# ============================================
# STAGE 2: Сборка проекта
# ============================================
FROM node:22-alpine AS builder
WORKDIR /app

# Копируем node_modules из предыдущего этапа
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Собираем проект
RUN npm run build

# ============================================
# STAGE 3: Production образ (МИНИМАЛЬНЫЙ)
# ============================================
FROM node:22-alpine AS runner
WORKDIR /app

# Безопасность: создаём непривилегированного пользователя
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

# Устанавливаем openssl для Prisma
RUN apk add --no-cache openssl

# Копируем только необходимое из builder
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/package*.json ./
COPY --from=builder --chown=nestjs:nodejs /app/prisma ./prisma

# Переключаемся на непривилегированного пользователя
USER nestjs

# Открываем порт
EXPOSE 3000

# Healthcheck — Docker проверит, что приложение живое
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Запуск production-сборки
CMD ["node", "dist/main.js"]