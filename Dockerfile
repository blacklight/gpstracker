# Build image
FROM node:23-alpine AS build

WORKDIR /app

# Copy backend source files
COPY LICENSE \
     README.md \
     package.json \
     package-lock.json \
     tsconfig.json \
     Makefile \
     ./

COPY src ./src

# Copy frontend source files
RUN mkdir -p ./frontend
COPY frontend/package.json \
     frontend/package-lock.json \
     frontend/tsconfig.json \
     frontend/tsconfig.app.json \
     frontend/tsconfig.node.json \
     frontend/vite.config.ts \
     frontend/env.d.ts \
     frontend/index.html \
     frontend/Makefile \
     ./frontend/

COPY frontend/src ./frontend/src
COPY frontend/public ./frontend/public

# Install system dependencies
RUN apk add --no-cache typescript make

# Build all
RUN make

# Web image
FROM node:23-alpine AS web

WORKDIR /app

# Copy built files
COPY --from=build \
     /app/package.json \
     /app/LICENSE \
     /app/README.md \
     ./

COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules

# Copy frontend built files
COPY --from=build /app/frontend/dist ./frontend/dist
COPY --from=build /app/frontend/node_modules ./frontend/node_modules
COPY --from=build /app/frontend/public ./frontend/public
COPY --from=build \
     /app/frontend/package.json \
     /app/frontend/package-lock.json \
     /app/frontend/index.html \
     /app/frontend/

# Run the app
CMD ["npm", "run", "start"]
