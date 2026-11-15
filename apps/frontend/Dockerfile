FROM node:22-alpine AS builder
WORKDIR /app
COPY package.json ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/frontend/package.json ./apps/frontend/
RUN npm install
COPY packages/shared ./packages/shared
COPY apps/frontend ./apps/frontend
RUN npm run build --workspace=packages/shared && npm run build --workspace=apps/frontend

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/shared ./packages/shared
COPY --from=builder /app/apps/frontend ./apps/frontend
WORKDIR /app/apps/frontend
EXPOSE 3000
CMD ["npm", "run", "start"]
