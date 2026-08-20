FROM node:20-alpine

WORKDIR /app

# Copy package definition files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm install

# Generate Prisma client
RUN npx prisma generate

# Copy application code
COPY . .

# Expose port
EXPOSE 5000

# Start server
CMD ["npm", "run", "dev"]
