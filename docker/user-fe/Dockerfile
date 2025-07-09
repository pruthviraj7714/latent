FROM node:20-alpine

WORKDIR /app

COPY ./turbo.json ./
COPY ./pnpm-lock.yaml ./
COPY ./package.json ./
COPY pnpm-workspace.yaml ./

COPY ./packages ./packages
COPY ./apps/user-fe ./apps/user-fe

RUN corepack enable && pnpm install --frozen-lockfile

RUN pnpm --filter=db exec prisma generate

EXPOSE 3001

WORKDIR /app/apps/user-fe

RUN pnpm --filter=user-fe run build

CMD ["pnpm", "start"]