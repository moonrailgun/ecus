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

RUN mkdir app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/app/package.json ./app
COPY --from=builder /app/app/.next ./app/.next
COPY --from=builder /app/app/node_modules ./app/node_modules
COPY --from=builder /app/app/public ./app/public

WORKDIR /ecus/app

CMD ["node_modules/.bin/next", "start"]

EXPOSE 5433
