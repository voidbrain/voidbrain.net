# Stage 1: Build Angular app with both locales
FROM node:20-alpine AS build

WORKDIR /app

# Install Angular CLI
RUN npm install -g @angular/cli@latest

# Copy package files and install dependencies (including devDependencies)
COPY package.json package-lock.json ./
RUN npm i

# Copy source code
COPY . .

# Build both language versions
RUN ng build --configuration=en
RUN ng build --configuration=it

# Stage 2: Serve static files with language routing
FROM nginx:alpine AS final

# Remove default nginx configuration
RUN rm /etc/nginx/conf.d/default.conf

# Remove nginx default files and copy built files for different locales
RUN rm -rf /usr/share/nginx/html/*
COPY --from=build /app/dist/voidbrain.net/en/browser/en/ /usr/share/nginx/html/en/
COPY --from=build /app/dist/voidbrain.net/it/browser/it/ /usr/share/nginx/html/it/

# Copy English as default (for root path /)
COPY --from=build /app/dist/voidbrain.net/en/browser/en/ /usr/share/nginx/html/

# Configure nginx for language routing
RUN echo $'server {\n\
    listen 4220;\n\
    server_name localhost;\n\
    root /usr/share/nginx/html;\n\
    index index.html;\n\
    \n\
    # SPA fallback for root\n\
    location / {\n\
        try_files $uri $uri/ /index.html;\n\
    }\n\
    \n\
    # English version\n\
    location /en/ {\n\
        alias /usr/share/nginx/html/en/;\n\
        try_files $uri $uri/ /index.html;\n\
    }\n\
    \n\
    # Italian version\n\
    location /it/ {\n\
        alias /usr/share/nginx/html/it/;\n\
        try_files $uri $uri/ /index.html;\n\
    }\n\
    \n\
    # Disable access to .ht* files\n\
    location ~ /\.ht {\n\
        deny all;\n\
    }\n\
}' > /etc/nginx/conf.d/default.conf

EXPOSE 4220

CMD ["nginx", "-g", "daemon off;"]
