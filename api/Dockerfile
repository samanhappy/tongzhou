FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN apk add --no-cache --virtual .build-deps python3 make g++ \
    && npm ci \
    && apk del .build-deps
COPY src ./src
COPY tsconfig.json ./
EXPOSE 4100
CMD ["npm", "start"]
