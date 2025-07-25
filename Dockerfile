FROM ubuntu:20.04

# 1. Make all apt installs non-interactive
ENV DEBIAN_FRONTEND=noninteractive

# 2. Predefine a timezone so tzdata won’t prompt you
ENV TZ=Etc/UTC
RUN ln -fs /usr/share/zoneinfo/$TZ /etc/localtime \
 && echo $TZ > /etc/timezone

# Install dependencies and MongoDB
RUN apt-get update \
    && DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends  wget gnupg curl ca-certificates \
    && wget -qO - https://www.mongodb.org/static/pgp/server-4.4.asc | apt-key add - \
    && echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/4.4 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-4.4.list \
    && apt-get update \
    && apt-get install -y  --no-install-recommends mongodb-org nodejs npm \
    && rm -rf /var/lib/apt/lists/*

# Set up NodeGoat app
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install --production
COPY . .

RUN mkdir -p /data/db

EXPOSE 4000

CMD mongod --fork --logpath /var/log/mongodb.log --dbpath /data/db && node artifacts/db-reset.js && npm start

