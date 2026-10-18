FROM node:22.23.3-bookworm-slim@sha256:43ac6c60b8f89723f746e8a92ce91abd5017e627ce1ddfe4238355d3a30b772c AS base
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

FROM base AS dependencies
COPY package.json package-lock.json ./
RUN npm ci

FROM dependencies AS builder
COPY . .
# Only a syntactically valid local URL; building must never query a database.
ENV DATABASE_URL=postgresql://build:build@127.0.0.1:1/build
RUN npx --no-install prisma generate && npm run build

FROM builder AS production-dependencies
RUN npm prune --omit=dev

FROM base AS runtime
ARG VCS_REF
ARG APP_VERSION
LABEL org.opencontainers.image.source="https://github.com/JojoShine/tbtparent-me" \
      org.opencontainers.image.revision=$VCS_REF \
      org.opencontainers.image.version=$APP_VERSION \
      org.opencontainers.image.licenses="NOASSERTION"
ENV NODE_ENV=production PORT=8080 HOSTNAME=0.0.0.0
COPY --from=production-dependencies --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/.next/standalone/server.js ./server.js
COPY --from=builder --chown=node:node /app/.next/standalone/package.json ./package.json
COPY --from=builder --chown=node:node /app/.next/standalone/.next ./.next
COPY --from=builder --chown=node:node /app/.next/static ./.next/static
COPY --from=builder --chown=node:node /app/public ./public
COPY --from=builder --chown=node:node /app/prisma ./prisma
COPY --chown=node:node bin ./bin
USER node
EXPOSE 8080
HEALTHCHECK --interval=10s --timeout=5s --start-period=15s --retries=12 CMD ["/app/bin/healthcheck"]
CMD ["node", "server.js"]
