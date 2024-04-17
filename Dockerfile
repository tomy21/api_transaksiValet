FROM node:18-alpine

WORKDIR /app

COPY package* .

RUN npm cache clean --force
RUN npm install --silent

COPY . .

EXPOSE 3001

CMD ["npm", "start"]
