FROM node:20-alpine

# Set environment variables
ENV DB_HOST=8.215.44.147
ENV DB_USER=root
ENV DB_PASSWORD=50p4y5ky0v0!
ENV DB_NAME=skybillingdb
ENV ACCESS_TOKEN_SECRET=90091c6db732c4119b8c56a54c31e560
ENV REFRESH_TOKEN_SECRET=b356a21e77ca808ee38a383991f61d4a

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Install PM2 globally
RUN npm install -g pm2

# Copy the rest of the application code
COPY . .

# Expose the application port
EXPOSE 3008

# Start the application using PM2
CMD ["pm2-runtime", "start", "npm", "--", "start"]
