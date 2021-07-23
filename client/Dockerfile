FROM node:12
LABEL description="Base Docker script for the frontend react app"

# app directory
WORKDIR /usr/src/app

COPY package.json ./
COPY package-lock.json ./

RUN npm install 
COPY . ./

EXPOSE 3000

CMD ["npm", "start"]

