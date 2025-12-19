
FROM node:20-bookworm-slim AS builder
WORKDIR /app
ENV npm_config_build_from_source=true \
    npm_config_prebuild_download=false
RUN apt-get update \
    && apt-get install -y --no-install-recommends build-essential python3 python3-pip python3-setuptools sqlite3 libsqlite3-dev \
    && rm -rf /var/lib/apt/lists/*
COPY package*.json ./
RUN rm -rf node_modules
RUN npm ci --build-from-source
COPY . .
RUN npm run build

FROM node:20-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
RUN apt-get update \
    && apt-get install -y --no-install-recommends sqlite3 libsqlite3-dev \
    && rm -rf /var/lib/apt/lists/*
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.env* ./
EXPOSE 3000
CMD ["npm", "run", "start:prod"]
