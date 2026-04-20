# ── Build stage ──────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json yarn.lock* ./
RUN yarn install --frozen-lockfile
COPY . .
RUN yarn build

# ── Production stage ─────────────────────────────────────────
FROM node:20-alpine AS production
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s CMD wget -qO- http://localhost:3000 || exit 1

CMD ["node", "server.js"]
