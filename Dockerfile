# syntax=docker/dockerfile:1

# ---------- ① Base build image ----------
ARG NODE_VERSION=22.14.0
FROM node:${NODE_VERSION}-alpine AS build

# Environment
ENV NODE_ENV=development
ENV NGROK_AUTOINSTALL=false

# Working directory
WORKDIR /usr/src/app

# Copy dependency files first (to leverage Docker cache)
COPY package.json yarn.lock ./

# Install all dependencies (including devDeps for build)
RUN yarn install --frozen-lockfile --production=false --ignore-scripts

# Copy the rest of the application
COPY . .

# Build TypeScript project
RUN yarn build


# ---------- ② Final production image ----------
FROM node:${NODE_VERSION}-alpine AS production

# Set working directory
WORKDIR /usr/src/app

# Set environment to production
ENV NODE_ENV=production
ENV NGROK_AUTOINSTALL=false

# Copy compiled output and minimal files
COPY --from=build /usr/src/app/dist ./dist
COPY package.json yarn.lock ./
COPY src/mikro-orm.config.ts ./src/mikro-orm.config.ts

# Install only production dependencies
RUN yarn install --frozen-lockfile --production=true --ignore-scripts

# Use non-root user for security
USER node

# Expose port
EXPOSE 4000

# Start the app
CMD ["node", "dist/index.js"]
