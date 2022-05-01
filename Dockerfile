# syntax=docker/dockerfile:1
FROM node:17.9.0-slim

RUN mkdir /app
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY ["package.json", "package-lock.json*", "./"]
RUN npm install --production

EXPOSE 3000

COPY . /app

CMD ["npm", "run", "start"]