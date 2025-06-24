FROM node:20-alpine

WORKDIR /app

COPY ./turbo.json ./
COPY ./pnpm-lock.yaml ./
COPY ./package.json ./
COPY pnpm-workspace.yaml ./

COPY ./packages ./packages
COPY ./apps/http-backend ./apps/http-backend

RUN corepack enable && pnpm install --frozen-lockfile

RUN pnpm --filter=db exec prisma generate

EXPOSE 8080

WORKDIR /app/apps/http-backend

RUN pnpm --filter=http-backend run build

CMD ["pnpm", "start"]