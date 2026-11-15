FROM node:22-alpine AS builder
WORKDIR /app
COPY package.json ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/backend/package.json ./apps/backend/
RUN npm install
COPY packages/shared ./packages/shared
COPY apps/backend ./apps/backend
RUN npm run build --workspace=packages/shared && npm run build --workspace=apps/backend

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/shared ./packages/shared
COPY --from=builder /app/apps/backend/dist ./apps/backend/dist
COPY --from=builder /app/apps/backend/package.json ./apps/backend/package.json
COPY --from=builder /app/apps/backend/prisma ./apps/backend/prisma
WORKDIR /app/apps/backend
EXPOSE 4000
CMD ["node", "dist/main.js"]
