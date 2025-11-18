FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --omit=dev --legacy-peer-deps

# Copy source code
COPY . .

# Create upload directory
RUN mkdir -p uploads

# Expose port
EXPOSE 5000

# Start server
CMD ["npm", "start"]
