# Multi-stage build for Vite React app

# Stage 1: Build the application
FROM node:20-alpine AS builder

WORKDIR /app

# Copy all files first (including package.json and package-lock.json)
COPY . .

# Set npm to ignore SSL issues (Docker environment)
RUN npm config set strict-ssl false

# Install all dependencies (devDependencies needed for build)
RUN npm install

# Build the application
RUN npm run build

# Stage 2: Serve with nginx
FROM nginx:alpine

# Copy built files from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
