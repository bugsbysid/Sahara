#!/bin/bash

echo "🚀 Starting Sahara Application..."
echo ""

cd "$(dirname "$0")"

# Check MongoDB
if ! brew services list | grep -q "mongodb-community.*started"; then
    echo "Starting MongoDB..."
    brew services start mongodb-community@7.0
    sleep 2
fi

# Kill any existing processes on our ports
echo "Cleaning up ports..."
lsof -ti :5001 2>/dev/null | xargs kill -9 