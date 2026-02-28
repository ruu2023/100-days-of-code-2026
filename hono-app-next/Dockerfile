# Cloud Run Deployment
# Build: docker build -t hono-app-next .
# Run:   docker run -p 8080:8080 hono-app-next

FROM node:22-alpine AS base

# ── Build stage ──────────────────────────────────────────────────────────────
FROM base AS builder
WORKDIR /app

COPY package*.json ./
RUN npm install --no-audit

COPY . .

# Hardcode the hono-api URL so Next.js bakes it into the bundle at build time.
# NEXT_PUBLIC_* vars must be set BEFORE `npm run build` to be embedded in client/edge bundles.
ENV NEXT_PUBLIC_API_URL=https://hono-api.ruu2023.workers.dev

RUN npm run build

# ── Production stage ─────────────────────────────────────────────────────────
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
# Cloud Run serves on PORT env var (default 8080)
ENV PORT=8080
ENV HOSTNAME="0.0.0.0"

# Non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs

EXPOSE 8080

CMD ["node", "server.js"]
