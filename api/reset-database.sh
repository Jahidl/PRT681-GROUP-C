#!/bin/bash

# Script to reset the database for development
echo "Resetting database..."

# Stop the containers
docker-compose down

# Remove the SQL Server volume to completely reset the database
docker volume rm prt681-group-c_sqlserver_data 2>/dev/null || echo "Volume doesn't exist or already removed"

# Start the containers again
docker-compose up --build

echo "Database reset complete!"
