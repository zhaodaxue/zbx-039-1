# 第一阶段：构建前端和后端
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# 第二阶段：生产镜像
FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=build /app/dist ./dist
COPY --from=build /app/api/dist ./api/dist
COPY --from=build /app/shared ./shared

RUN mkdir -p /app/api/data

EXPOSE 3001

CMD ["node", "api/dist/api/server.js"]
