# Stage 1: Build React app
FROM node:18-alpine AS build
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client .
RUN npm run build

# Stage 2: Build server
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
COPY --from=build /app/client/build ./build
EXPOSE 3000
CMD ["node", "server.js"]
