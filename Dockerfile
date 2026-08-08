# ==========================================
# STAGE 1: Build Frontend Assets
# ==========================================
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm install

COPY frontend/ ./
COPY candidates.json ../candidates.json
COPY curriculum.json ../curriculum.json
RUN npm run build

# ==========================================
# STAGE 2: Build Backend Server
# ==========================================
FROM node:20-alpine AS backend-builder
WORKDIR /app/backend

# Install OpenSSL for Prisma engine compatibility on Alpine
RUN apk add --no-cache openssl

COPY backend/package*.json ./
RUN npm install

COPY backend/ ./
RUN npx prisma generate
RUN npm run build

# ==========================================
# STAGE 3: Production Runner Image
# ==========================================
FROM node:20-alpine AS runner
WORKDIR /app

# Install OpenSSL for Prisma engine compatibility on Alpine
RUN apk add --no-cache openssl

ENV NODE_ENV=production
ENV PORT=3000
ENV CURRICULUM_PATH=/app/curriculum.json
ENV DATABASE_URL=file:/app/backend/prisma/dev.db

# Copy root dataset files
COPY candidates.json ./candidates.json
COPY curriculum.json ./curriculum.json
COPY technical-spec.md ./technical-spec.md
COPY README.md ./README.md

# Copy backend source & dependencies
COPY backend/package*.json ./backend/
COPY backend/prisma ./backend/prisma
RUN cd backend && npm install --omit=dev && npx prisma generate

# Copy built artifacts
COPY --from=backend-builder /app/backend/dist ./backend/dist
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

EXPOSE 3000

# Push database schema if needed and launch server
CMD ["sh", "-c", "cd backend && npx prisma db push --skip-generate && node dist/index.js"]
