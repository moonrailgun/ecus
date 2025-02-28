FROM node:20-alpine AS builder

WORKDIR /app

COPY . .

RUN npm install -g pnpm@9.7.1
RUN pnpm install --frozen-lockfile

RUN cd app && SKIP_ENV_VALIDATION=1 pnpm run build

# ------------------------------------------------

FROM node:20-alpine AS runner

WORKDIR /ecus

ENV NODE_ENV production
ENV PORT 5433

RUN mkdir app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/app/package.json ./app
COPY --from=builder /app/app/.next ./app/.next
COPY --from=builder /app/app/node_modules ./app/node_modules
COPY --from=builder /app/app/public ./app/public
COPY --from=builder /app/app/drizzle ./app/drizzle
COPY --from=builder /app/app/drizzle.config.ts ./app/drizzle.config.ts
COPY --from=builder /app/app/src/server/db/schema.ts ./app/src/server/db/schema.ts

WORKDIR /ecus/app

CMD ["npm", "run", "docker:start"]

EXPOSE 5433
