FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./

COPY frontend/package.json ./frontend/package.json
COPY backend/package.json ./backend/package.json

RUN npm ci

COPY backend ./backend

RUN npm run build --workspace backend


FROM node:22-alpine

WORKDIR /app

ENV NODE_ENV=production

COPY package.json package-lock.json ./

COPY frontend/package.json ./frontend/package.json
COPY backend/package.json ./backend/package.json

RUN npm ci --omit=dev --workspace backend --include-workspace-root=false

COPY --from=builder /app/backend/dist ./backend/dist

EXPOSE 3000

CMD ["node", "backend/dist/server.js"]