# Frontend Dockerfile (React 19 + CRACO)
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
# Allow peer mismatch (React 19 with libs pinned to React 18); can drop when Stripe/peers support React 19
RUN npm ci --no-audit --no-fund --legacy-peer-deps

FROM node:20-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Build production assets; for dev use compose `npm start`
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
# Serve build via a lightweight static server
RUN npm i -g serve@14
COPY --from=build /app/build ./build
EXPOSE 3000
CMD ["serve", "-s", "build", "-l", "3000"]
