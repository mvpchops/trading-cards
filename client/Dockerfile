FROM nginx:alpine

# Copy the static files for the React app
COPY react/dist /usr/share/nginx/html/react

# Copy the static files for the Vanilla JS app
COPY vanilla/dist /usr/share/nginx/html/vanilla

# Copy the custom NGINX configuration file
COPY nginx.conf /etc/nginx/conf.d/default.conf

