FROM node:20-slim

# Install build dependencies for better-sqlite3
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files first for layer caching
COPY package*.json ./

# Install dependencies (including native build for better-sqlite3)
RUN npm ci

# Copy source files
COPY . .

# Build the app
RUN npm run build

# Expose port
EXPOSE 10000

# Create data directory for SQLite
RUN mkdir -p /data

ENV NODE_ENV=production
ENV PORT=10000

CMD ["npm", "start"]
