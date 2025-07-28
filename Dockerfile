# Development Dockerfile with hot reload
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY bun.lockb ./

# Install dependencies
RUN npm install

# Copy source code (will be overridden by volume mount in development)
COPY . .

# Expose development port (matching vite.config.ts)
EXPOSE 8080

# Start development server with hot reload and host binding
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "8080"]