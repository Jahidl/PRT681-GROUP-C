# build
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .                      # <-- brings in src, tailwind configs, etc.
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN npm run build

# serve
FROM nginx:alpine AS runner
# DELETE this line:
# COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80

