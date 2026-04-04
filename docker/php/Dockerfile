FROM php:8.4-fpm

COPY php.ini /usr/local/etc/php/

RUN apt update && apt install -y \
    default-mysql-client \
    zlib1g-dev \
    libzip-dev \
    libpng-dev \
    unzip \
    curl \
    gnupg \
    && apt clean

RUN docker-php-ext-install pdo_mysql zip bcmath gd

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www