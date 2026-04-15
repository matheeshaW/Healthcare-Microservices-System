FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
ENV npm_config_fetch_retries=5 \
	npm_config_fetch_retry_maxtimeout=120000 \
	npm_config_fetch_retry_mintimeout=20000
RUN npm ci --no-audit --no-fund
COPY . .
EXPOSE 5002
CMD ["npm", "run", "dev"]