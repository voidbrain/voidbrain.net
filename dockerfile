# Stage 1: Build Angular app
FROM node:20-alpine AS build

WORKDIR /app

# Install Angular CLI
RUN npm install -g @angular/cli@latest

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy source code
COPY . .

# Build both locales
RUN ng build --configuration=en
RUN ng build --configuration=it

# Stage 2: Serve static files
FROM node:20-alpine

WORKDIR /app

# Install lightweight static server
RUN npm install -g http-server

# Copy built files from build stage
COPY --from=build /app/dist/voidbrain.net /app/dist

# Expose port
EXPOSE 4220

# Serve static files
CMD ["sh", "-c", "http-server /app/dist -p 4220 -c-1"]
