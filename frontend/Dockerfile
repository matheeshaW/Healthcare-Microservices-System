FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
ENV npm_config_fetch_retries=5 \
	npm_config_fetch_retry_maxtimeout=120000 \
	npm_config_fetch_retry_mintimeout=20000
RUN npm install --no-audit --no-fund
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]