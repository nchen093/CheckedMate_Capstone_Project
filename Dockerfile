FROM python:3.9.18-alpine3.18

# Install dependencies
RUN apk add --no-cache build-base postgresql-dev gcc python3-dev musl-dev

# Set environment variables
ARG FLASK_APP
ARG FLASK_ENV
ARG DATABASE_URL
ARG SCHEMA
ARG SECRET_KEY

WORKDIR /var/www

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install -r requirements.txt
RUN pip install psycopg2

# Copy application code
COPY . .

# Run migrations and seed data when the container starts
CMD flask db upgrade && flask seed all && gunicorn --worker-class eventlet -w 1 app:app
