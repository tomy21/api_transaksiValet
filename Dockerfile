FROM node:18-alpine

ENV DB_HOST=8.215.44.147
ENV DB_USER=root
ENV DB_PASSWORD=50p4y5ky0v0!
ENV DB_NAME=skybillingdb
ENV ACCESS_TOKEN_SECRET=90091c6db732c4119b8c56a54c31e560
ENV REFRESH_TOKEN_SECRET=b356a21e77ca808ee38a383991f61d4a

WORKDIR /app

COPY package*.json ./

RUN npm install
RUN npm ci --only=production
RUN npm install cookie-parser

COPY . .

EXPOSE 3008

CMD ["npm", "start"]