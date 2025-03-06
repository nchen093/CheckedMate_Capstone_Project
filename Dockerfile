# Use official Python runtime as the base image
FROM python:3.9.18-alpine3.18

# Set working directory
WORKDIR /var/www

# Install system dependencies (SQLite specific)
RUN apk add --no-cache libsqlite3

# Copy requirements first for better layer caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Set environment variables (override .env for container)
ENV FLASK_APP=app.py
ENV FLASK_ENV=production
ENV DATABASE_URL=sqlite:////var/www/instance/prod.db
ENV SCHEMA=check_mate

# Ensure instance directory exists
RUN mkdir -p instance

# Command to run Flask migrations and start server
CMD flask db upgrade && flask seed all && \
    gunicorn --bind 0.0.0.0:$PORT app:app