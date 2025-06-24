FROM node:20-alpine

WORKDIR /app

COPY ./turbo.json ./
COPY ./pnpm-lock.yaml ./
COPY ./package.json ./
COPY pnpm-workspace.yaml ./

COPY ./packages ./packages
COPY ./apps/worker ./apps/worker

RUN corepack enable && pnpm install --frozen-lockfile

RUN pnpm --filter=db exec prisma generate

WORKDIR /app/apps/worker

RUN pnpm --filter=worker run build

CMD ["pnpm", "start"]