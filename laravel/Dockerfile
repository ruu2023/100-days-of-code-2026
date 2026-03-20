FROM php:8.4-fpm

# 必要なパッケージインストール
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

# PHP拡張
RUN docker-php-ext-install pdo pdo_pgsql zip pcntl

WORKDIR /var/www/html
COPY . .

RUN composer install --no-dev --optimize-autoloader

RUN php artisan config:cache && php artisan route:cache

EXPOSE 8080
CMD ["php", "-S", "0.0.0.0:8080", "-t", "public"]
