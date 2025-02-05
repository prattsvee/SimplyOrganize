# Dockerfile
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all files
COPY . .

# Expose the port your Vite app runs on
EXPOSE 5174

# Start the app
CMD ["npm", "run", "dev", "--", "--host"]