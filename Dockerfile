FROM node:20-alpine AS builder
WORKDIR /app

RUN npm install -g pnpm

RUN pnpm config set registry https://registry.npmjs.org/

COPY package.json pnpm-lock.yaml ./

RUN pnpm install

COPY . .

RUN pnpm run build

FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NODE_OPTIONS="--require=crypto"

# Copier uniquement les fichiers nécessaires
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Exposer le port
EXPOSE 3000

# Passer en utilisateur non-root
USER node

# Lancer l'application
CMD ["node", "dist/main"]
    