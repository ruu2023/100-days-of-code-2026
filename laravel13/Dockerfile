# --- Node.js ステージ (アセットビルド用) ---
FROM node:22 AS node-builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# --- PHP ステージ ---
FROM php:8.4-fpm

# 必要なシステムパッケージのインストール
RUN apt-get update && apt-get install -y \
    curl \
    git \
    unzip \
    libpq-dev \
    libzip-dev \
    ffmpeg \
    python3 \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# composer インストール
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

# yt-dlp インストール
RUN curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp \
    && chmod a+rx /usr/local/bin/yt-dlp \
    && ln -sf /usr/local/bin/yt-dlp /usr/bin/yt-dlp

# PHP拡張のインストール
RUN docker-php-ext-install pdo pdo_pgsql zip pcntl

WORKDIR /var/www/html

# ソースコードのコピー
COPY . .

# ディレクトリ作成を保証してから、Node ステージからビルド済みアセットをコピー
RUN mkdir -p public/build
COPY --from=node-builder /app/public/build ./public/build

# PHP依存関係のインストール
RUN composer install --no-dev --optimize-autoloader

EXPOSE 8080
CMD ["sh", "-c", "touch database/database.sqlite && php artisan migrate --force && php artisan config:cache && php artisan route:cache && php artisan view:cache && php -S 0.0.0.0:8080 -t public"]

