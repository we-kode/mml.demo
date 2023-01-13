FROM node:19-alpine

EXPOSE 3001
RUN mkdir -p /app
WORKDIR /app

COPY . /app
RUN npm i
ENTRYPOINT ["npm", "run", "dev"]