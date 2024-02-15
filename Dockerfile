FROM node:alpine

WORKDIR /app

COPY package* .

RUN npm i --silent

COPY . .

EXPOSE 8000