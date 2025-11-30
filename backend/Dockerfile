# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Install dependencies (including devDeps for build step)
RUN npm ci

# Copy source code
COPY . .

# Build the application (fail the image build if this fails)
RUN npm run build

# Runtime stage
FROM node:18-alpine

WORKDIR /app

# Copy only production files
COPY --from=builder /app/build ./build
COPY --from=builder /app/package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Expose port
EXPOSE 5000

# Start the application
CMD ["npm", "start"]
