FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY src ./src
COPY tsconfig.json ./
EXPOSE 4100
CMD ["npm", "start"]
