FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY server ./server
COPY tsconfig.server.json ./

RUN npm run server:build

ENV PORT=8787
EXPOSE 8787

CMD ["node", "dist-server/index.js"]
