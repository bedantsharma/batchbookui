# ─────────────────────────────────────────────────────────────────
#  BatchBook — Frontend Dockerfile (multi-stage: dev + prod)
#  Build context: batchbookui/
# ─────────────────────────────────────────────────────────────────

# ── Shared base ───────────────────────────────────────────────────
FROM node:22-alpine AS base

WORKDIR /app

# Copy manifests first for layer-cache efficiency
COPY package.json package-lock.json ./

# ── Dev stage ─────────────────────────────────────────────────────
FROM base AS dev

# --mount=type=cache keeps npm's download cache on the host between builds.
# Packages that haven't changed are served from the cache, not the network.
RUN --mount=type=cache,target=/root/.npm \
    npm ci --cache /root/.npm

# Source code is volume-mounted at runtime, not baked in.
# node_modules is kept inside the container via an anonymous volume
# (declared in docker-compose.dev.yml) so the host mount doesn't clobber it.

EXPOSE 5173
# --host 0.0.0.0 makes Vite reachable from outside the container
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# ── Builder stage (prod only) ─────────────────────────────────────
FROM base AS builder

# VITE_API_URL is baked in at build time — override via docker-compose build.args
ARG VITE_API_URL=http://localhost:8000
ENV VITE_API_URL=$VITE_API_URL

RUN --mount=type=cache,target=/root/.npm \
    npm ci --cache /root/.npm

COPY . .
RUN npm run build

# ── Prod stage ────────────────────────────────────────────────────
FROM nginx:alpine AS prod

# SPA static files
COPY --from=builder /app/dist /usr/share/nginx/html

# nginx config: SPA routing + optional API proxy
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
