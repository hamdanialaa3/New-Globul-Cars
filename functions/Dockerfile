# Firebase Functions Dockerfile (Node.js)
# This is a base container for local dev (not for GCF deploy)
FROM node:20-alpine
WORKDIR /workspace/functions
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
# Expose emulator default port when running locally
EXPOSE 5001
# Default: just list functions; use docker-compose overrides to run emulator
CMD ["npm", "run", "build"]
