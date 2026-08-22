# syntax=docker/dockerfile:1



FROM node:24-bookworm-slim AS build



WORKDIR /app

ENV PNPM_HOME=/pnpm

ENV PATH=$PNPM_HOME:$PATH



RUN corepack enable && corepack prepare pnpm@10.4.1 --activate



COPY package.json pnpm-lock.yaml ./

COPY patches ./patches

RUN pnpm install --frozen-lockfile



COPY . .

RUN pnpm run build && pnpm prune --prod



FROM node:24-bookworm-slim AS runtime



WORKDIR /app

ENV NODE_ENV=production

ENV PORT=8080



RUN useradd --system --uid 10001 --create-home appuser



COPY --from=build --chown=appuser:appuser /app/dist ./dist

COPY --from=build --chown=appuser:appuser /app/node_modules ./node_modules



USER appuser

EXPOSE 8080



CMD ["node", "dist/index.js"]

