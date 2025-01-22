# Use official PostGIS image based on PostgreSQL
FROM postgis/postgis:15-3.3

# Environment variables are now in docker-compose.yml and .env
# They'll be passed to this container at runtime

# Copy initialization scripts that create tables and extensions
COPY ./init-scripts/ /docker-entrypoint-initdb.d/