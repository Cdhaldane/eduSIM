FROM node:12
LABEL description="Base Docker script for the frontend react app"

# app directory
WORKDIR /usr/src/app

COPY package.json ./
COPY package-lock.json ./

RUN npm install --legacy-peer-deps
COPY . ./

RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "prod"]

