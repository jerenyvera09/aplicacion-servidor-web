FROM node:20-bookworm-slim
WORKDIR /app
ENV npm_config_build_from_source=true \
    npm_config_prebuild_download=false
RUN apt-get update \
    && apt-get install -y --no-install-recommends build-essential python3 python3-pip python3-setuptools sqlite3 libsqlite3-dev \
    && rm -rf /var/lib/apt/lists/*
COPY package*.json ./
RUN npm ci \
    && npm rebuild sqlite3 --build-from-source
COPY . .
RUN npm run build
CMD ["npm", "run", "start:prod"]
