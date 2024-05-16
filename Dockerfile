FROM node:16-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install
RUN npm ci --only=production

COPY . .

EXPOSE 3008

CMD ["npm", "start"]