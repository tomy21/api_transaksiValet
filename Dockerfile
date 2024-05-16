FROM node:18-alpine

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package*.json /usr/src/app

RUN npm install
RUN npm ci --only=production

COPY . /usr/src/app

EXPOSE 3008

CMD ["npm", "start"]