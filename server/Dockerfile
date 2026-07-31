# VINCI Restaurant API
FROM node:20-alpine AS base
WORKDIR /app
ENV NODE_ENV=production

# Install production dependencies
COPY package*.json ./
RUN npm ci --omit=dev || npm install --omit=dev

# Copy source
COPY src ./src

EXPOSE 5000
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s \
  CMD wget -qO- http://localhost:5000/api/v1/health || exit 1

USER node
CMD ["node", "src/index.js"]
