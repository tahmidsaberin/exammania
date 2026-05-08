# ─── Stage 1: deps ───────────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app
# Install OpenSSL so Prisma can detect the SSL version
RUN apk add --no-cache openssl openssl-dev libc6-compat
COPY package*.json ./
COPY prisma ./prisma
RUN npm install
RUN npx prisma generate

# ─── Stage 2: build ──────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app
RUN apk add --no-cache openssl openssl-dev libc6-compat
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/prisma ./prisma
COPY . .
RUN npm run build

# ─── Stage 3: production ─────────────────────────────────
FROM node:20-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
# OpenSSL is required at runtime for Prisma
RUN apk add --no-cache openssl openssl-dev libc6-compat
COPY package*.json ./
COPY prisma ./prisma
RUN npm install --omit=dev && npx prisma generate
COPY --from=builder /app/dist ./dist
EXPOSE 4000
CMD ["sh", "-c", "npx prisma migrate deploy && node --no-deprecation dist/index.js"]
