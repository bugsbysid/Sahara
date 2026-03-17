#!/bin/bash

# Sahara Development Startup Script
# This script starts both backend and frontend servers

echo "🚀 Starting Sahara Development Servers..."
echo ""

# Check if .env files exist
if [ ! -f "backend/.env" ]; then
    echo "⚠️  Warning: backend/.env not found!"
    echo "   Please copy backend/env.example to backend/.env and configure it."
    echo ""
fi

if [ ! -f "frontend/.env.local" ]; then
    echo "⚠️  Warning: frontend/.env.local not found!"
    echo "   Please copy frontend/.env.local.example to frontend/.env.local"
    echo ""
fi

# Check if node_modules exist
if [ ! -d "backend/node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    cd backend && npm install && cd ..
fi

if [ ! -d "frontend/node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    cd frontend && npm install && cd ..
fi

echo ""
echo "✅ Starting servers..."
echo "   Backend: http://localhost:5000"
echo "   Frontend: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Start both servers
cd backend && npm run dev &
BACKEND_PID=$!

cd ../frontend && npm run dev &
FRONTEND_PID=$!

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
