FROM node:20-alpine

WORKDIR /app

# Copy all files
COPY . .

# Install dependencies
RUN npm install && \
    cd client && npm install && \
    cd ../server && npm install

# Build client and server
RUN cd client && npm run build && \
    cd ../server && npm run build

# Set environment
ENV NODE_ENV=production

EXPOSE 3001

# Run migrations, seed data (ignore errors if already seeded), and start server
CMD cd server && npm run db:push && (npm run db:seed || true) && cd .. && node server/dist/index.js
