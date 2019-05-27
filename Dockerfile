FROM ubuntu:xenial

RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    default-jdk-headless \
    git

RUN curl -sL https://deb.nodesource.com/setup_8.x | bash -
RUN apt-get update && apt-get install -y nodejs

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
COPY .docker/local-development.js ./config/

EXPOSE 8080
CMD npx migrate-mongo up && npm start
