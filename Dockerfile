FROM node:20-alpine

WORKDIR /app

COPY package* .

RUN npx express-generator -y
RUN npm install

COPY . .

EXPOSE 3008

CMD ["npm", "start"]