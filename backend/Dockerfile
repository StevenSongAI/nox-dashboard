FROM node:20-alpine

WORKDIR /app

# Copy package files (works from root context)
COPY backend/package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code (works from root context)
COPY backend/src/ ./src/

# Expose port
EXPOSE 3000

# Start the app
CMD ["npm", "start"]
