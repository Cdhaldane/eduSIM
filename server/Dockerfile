FROM node:12
LABEL description="Base Docker script for the backend node app"

# app directory
WORKDIR /usr/src/app

COPY package.json ./
COPY package-lock.json ./

RUN npm install 
COPY . .

EXPOSE 5050

CMD ["npm", "run","server"]

