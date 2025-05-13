# ─── 1. Build ─────────────────────────────────────────────────────
FROM node:23.11.0-alpine AS builder
WORKDIR /app

# install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# build the app
COPY . .
RUN npm run build

# ─── 2. Run ────────────────────────────────────────────────────────
FROM node:23.11.0
WORKDIR /app

# only prod deps
COPY package.json package-lock.json ./
RUN npm ci --production

# copy compiled output
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/data ./data

ENV NODE_ENV=production
ENV DATA_FILE=../../data/products-small.json
ENV PORT=80
EXPOSE 80

CMD ["node", "dist/main"]