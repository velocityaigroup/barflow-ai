# ============================================================
# BarFlow Frontend — Multi-stage Dockerfile
# Build context: MONOREPO ROOT  (e.g. docker build -f apps/frontend/Dockerfile .)
# Requires Next.js `output: 'standalone'` in next.config.js
# ============================================================

# ── Stage 1: Dependency installer ─────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app

COPY package.json yarn.lock ./
COPY apps/frontend/package.json ./apps/frontend/package.json

RUN yarn install --frozen-lockfile --network-timeout 300000

# ── Stage 2: Next.js builder ──────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules

COPY package.json yarn.lock ./
COPY apps/frontend ./apps/frontend

# Build args injected at image build time (CI/CD passes these)
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_WS_URL
ARG NEXT_PUBLIC_VENUE_NAME
ARG NEXT_PUBLIC_BUSINESS_ID
ARG NEXT_PUBLIC_CURRENCY
ARG NEXT_PUBLIC_TIMEZONE

ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL \
    NEXT_PUBLIC_WS_URL=$NEXT_PUBLIC_WS_URL \
    NEXT_PUBLIC_VENUE_NAME=$NEXT_PUBLIC_VENUE_NAME \
    NEXT_PUBLIC_BUSINESS_ID=$NEXT_PUBLIC_BUSINESS_ID \
    NEXT_PUBLIC_CURRENCY=$NEXT_PUBLIC_CURRENCY \
    NEXT_PUBLIC_TIMEZONE=$NEXT_PUBLIC_TIMEZONE \
    NEXT_TELEMETRY_DISABLED=1

RUN yarn workspace @barflow/frontend build

# ── Stage 3: Production runner ────────────────────────────────
FROM node:20-alpine AS production
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1

# Next.js standalone includes its own server; copy only what's needed
COPY --from=builder /app/apps/frontend/.next/standalone ./
COPY --from=builder /app/apps/frontend/.next/static ./apps/frontend/.next/static
COPY --from=builder /app/apps/frontend/public ./apps/frontend/public

# Non-root user
RUN addgroup -S barflow && adduser -S barflow -G barflow
USER barflow

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget -qO- http://localhost:3000/api/health || exit 1

# next.config.js `output: standalone` emits server.js at this path
CMD ["node", "apps/frontend/server.js"]
