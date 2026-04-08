FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .
RUN npx prisma generate
RUN yarn build

FROM node:20-alpine AS runner

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/prisma ./prisma

ARG SERVICE_ENTRY=dist/index.js
ENV SERVICE_ENTRY=${SERVICE_ENTRY}

EXPOSE 3000 3003 3004 3005

CMD ["sh", "-c", "npx prisma migrate deploy && node ${SERVICE_ENTRY}"]
