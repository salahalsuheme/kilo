# syntax=docker/dockerfile:1

FROM mcr.microsoft.com/playwright:v1.61.1-noble AS build

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.json ./
COPY artifacts ./artifacts
COPY lib ./lib
COPY scripts ./scripts

RUN pnpm install --frozen-lockfile
RUN pnpm --filter @workspace/kilo-app run build
RUN pnpm --filter @workspace/api-server exec playwright install chromium

FROM mcr.microsoft.com/playwright:v1.61.1-noble AS runtime

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV NODE_ENV=production

RUN corepack enable

WORKDIR /app

COPY --from=build /app /app

RUN mkdir -p /data/uploads

ENV UPLOADS_DIR=/data/uploads
EXPOSE 8080

CMD ["pnpm", "--filter", "@workspace/api-server", "start"]
