#!/bin/bash

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 Sahara Application Status Check"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check MongoDB
echo "📦 MongoDB Status:"
if brew services list | grep -q "mongodb-community.*started"; then
    echo "   ✅ MongoDB is running"
else
    echo "   ❌ MongoDB is NOT running"
    echo "   → Start with: brew services start mongodb-community@7.0"
fi
echo ""

# Check Backend (port 5000)
echo "🔧 Backend Status (port 5000):"
if lsof -i :5000 > /dev/null 2>&1; then
    echo "   ✅ Backend is running"
    echo "   → Health check: curl http://localhost:5000/health"
    
    # Try health check
    if command -v curl > /dev/null 2>&1; then
        echo ""
        echo "   Health Check Response:"
        curl -s http://localhost:5000/health | python3 -m json.tool 2>/dev/null || echo "   (Could not parse JSON)"
    fi
else
    echo "   ❌ Backend is NOT running"
    echo "   → Start with: cd backend && npm run dev"
fi
echo ""

# Check Frontend (port 3000)
echo "🎨 Frontend Status (port 3000):"
if lsof -i :3000 > /dev/null 2>&1; then
    echo "   ✅ Frontend is running"
    echo "   → Visit: http://localhost:3000"
else
    echo "   ❌ Frontend is NOT running"
    echo "   → Start with: cd frontend && npm run dev"
fi
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Summary:"
echo ""

MONGO_OK=$(brew services list | grep -q "mongodb-community.*started" && echo "1" || echo "0")
BACKEND_OK=$(lsof -i :5000 > /dev/null 2>&1 && echo "1" || echo "0")
FRONTEND_OK=$(lsof -i :3000 > /dev/null 2>&1 && echo "1" || echo "0")

if [ "$MONGO_OK" = "1" ] && [ "$BACKEND_OK" = "1" ] && [ "$FRONTEND_OK" = "1" ]; then
    echo "   ✅ All services are running!"
    echo ""
    echo "   🌐 Access your app:"
    echo "      Frontend:  http://localhost:3000"
    echo "      Backend:   http://localhost:5000"
    echo "      Health:    http://localhost:5000/health"
else
    echo "   ⚠️  Some services are not running:"
    [ "$MONGO_OK" = "0" ] && echo "      - MongoDB"
    [ "$BACKEND_OK" = "0" ] && echo "      - Backend"
    [ "$FRONTEND_OK" = "0" ] && echo "      - Frontend"
    echo ""
    echo "   🚀 Start all services:"
    echo "      ./start-dev.sh"
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
