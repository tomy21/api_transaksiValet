FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install
RUN npm ci --only=production
RUN npm install cookie-parser

COPY . .

EXPOSE 3008

CMD ["npm", "start"]