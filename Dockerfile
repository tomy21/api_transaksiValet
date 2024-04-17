FROM node:18-alpine

WORKDIR /app

COPY package* .

RUN npm i --silent

COPY . .

EXPOSE 3001

CMD ["npm", "start"]