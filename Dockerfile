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

COPY backend/package*.json ./
RUN npm install

COPY backend/ ./
RUN npm run build

# ==========================================
# STAGE 3: Production Runner Image
# ==========================================
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy root dataset files
COPY candidates.json ./candidates.json
COPY curriculum.json ./curriculum.json
COPY technical-spec.md ./technical-spec.md

# Copy built backend
COPY backend/package*.json ./backend/
RUN cd backend && npm install --only=production

COPY --from=backend-builder /app/backend/dist ./backend/dist
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

EXPOSE 3000

CMD ["node", "backend/dist/index.js"]
