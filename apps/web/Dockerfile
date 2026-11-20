FROM node:24-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ENV VITE_API_PROXY_TARGET=http://api:3001
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]