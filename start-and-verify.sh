#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 Sahara Application Startup & Verification"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Step 1: Check MongoDB
echo "📦 Step 1: Checking MongoDB..."
if brew services list | grep -q "mongodb-community.*started"; then
    echo -e "   ${GREEN}✅ MongoDB is running${NC}"
else
    echo -e "   ${YELLOW}⚠️  MongoDB is not running. Starting...${NC}"
    brew services start mongodb-community@7.0
    sleep 3
    if brew services list | grep -q "mongodb-community.*started"; then
        echo -e "   ${GREEN}✅ MongoDB started successfully${NC}"
    else
        echo -e "   ${RED}❌ Failed to start MongoDB${NC}"
        exit 1
    fi
fi
echo ""

# Step 2: Check environment files
echo "📝 Step 2: Checking environment files..."

if [ ! -f "backend/.env" ]; then
    echo -e "   ${RED}❌ backend/.env not found${NC}"
    echo "   Creating from example..."
    cp backend/env.example backend/.env
    echo -e "   ${YELLOW}⚠️  Please edit backend/.env with your configuration${NC}"
    exit 1
else
    echo -e "   ${GREEN}✅ backend/.env exists${NC}"
fi

if [ ! -f "frontend/.env.local" ]; then
    echo -e "   ${YELLOW}⚠️  frontend/.env.local not found. Creating...${NC}"
    cat > frontend/.env.local << 'EOF'
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:5000

# Google OAuth Client ID (optional)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=
EOF
    echo -e "   ${GREEN}✅ frontend/.env.local created${NC}"
else
    echo -e "   ${GREEN}✅ frontend/.env.local exists${NC}"
fi
echo ""

# Step 3: Check dependencies
echo "📦 Step 3: Checking dependencies..."

if [ ! -d "backend/node_modules" ]; then
    echo -e "   ${YELLOW}⚠️  Installing backend dependencies...${NC}"
    cd backend && npm install && cd ..
fi
echo -e "   ${GREEN}✅ Backend dependencies ready${NC}"

if [ ! -d "frontend/node_modules" ]; then
    echo -e "   ${YELLOW}⚠️  Installing frontend dependencies...${NC}"
    cd frontend && npm install && cd ..
fi
echo -e "   ${GREEN}✅ Frontend dependencies ready${NC}"
echo ""

# Step 4: Build check
echo "🔨 Step 4: Verifying builds..."

echo "   Building backend..."
cd backend
if npm run build > /dev/null 2>&1; then
    echo -e "   ${GREEN}✅ Backend builds successfully${NC}"
else
    echo -e "   ${RED}❌ Backend build failed${NC}"
    npm run build
    exit 1
fi
cd ..

echo "   Building frontend..."
cd frontend
if npm run build > /dev/null 2>&1; then
    echo -e "   ${GREEN}✅ Frontend builds successfully${NC}"
else
    echo -e "   ${RED}❌ Frontend build failed${NC}"
    npm run build
    exit 1
fi
cd ..
echo ""

# Step 5: Kill existing processes on ports
echo "🔄 Step 5: Cleaning up existing processes..."

if lsof -i :5000 > /dev/null 2>&1; then
    echo "   Stopping process on port 5000..."
    lsof -ti :5000 | xargs kill -9 2>/dev/null
    sleep 1
fi

if lsof -i :3000 > /dev/null 2>&1; then
    echo "   Stopping process on port 3000..."
    lsof -ti :3000 | xargs kill -9 2>/dev/null
    sleep 1
fi
echo -e "   ${GREEN}✅ Ports cleared${NC}"
echo ""

# Step 6: Start backend
echo "🔧 Step 6: Starting backend..."
cd backend
npm run dev > ../backend.log 2>&1 &
BACKEND_PID=$!
cd ..
echo "   Backend starting (PID: $BACKEND_PID)..."
sleep 5

# Check if backend started
if lsof -i :5000 > /dev/null 2>&1; then
    echo -e "   ${GREEN}✅ Backend is running on http://localhost:5000${NC}"
else
    echo -e "   ${RED}❌ Backend failed to start${NC}"
    echo "   Check backend.log for errors:"
    tail -20 backend.log
    exit 1
fi
echo ""

# Step 7: Start frontend
echo "🎨 Step 7: Starting frontend..."
cd frontend
npm run dev > ../frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..
echo "   Frontend starting (PID: $FRONTEND_PID)..."
sleep 5

# Check if frontend started
if lsof -i :3000 > /dev/null 2>&1; then
    echo -e "   ${GREEN}✅ Frontend is running on http://localhost:3000${NC}"
else
    echo -e "   ${RED}❌ Frontend failed to start${NC}"
    echo "   Check frontend.log for errors:"
    tail -20 frontend.log
    exit 1
fi
echo ""

# Step 8: Health checks
echo "🏥 Step 8: Running health checks..."

# Backend health check
echo "   Checking backend health..."
sleep 2
HEALTH_RESPONSE=$(curl -s http://localhost:5000/health 2>/dev/null)
if echo "$HEALTH_RESPONSE" | grep -q '"status":"ok"'; then
    echo -e "   ${GREEN}✅ Backend health check passed${NC}"
    echo "   Response: $HEALTH_RESPONSE"
else
    echo -e "   ${YELLOW}⚠️  Backend health check returned unexpected response${NC}"
    echo "   Response: $HEALTH_RESPONSE"
fi
echo ""

# Frontend check
echo "   Checking frontend..."
FRONTEND_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 2>/dev/null)
if [ "$FRONTEND_RESPONSE" = "200" ]; then
    echo -e "   ${GREEN}✅ Frontend is accessible${NC}"
else
    echo -e "   ${YELLOW}⚠️  Frontend returned status: $FRONTEND_RESPONSE${NC}"
fi
echo ""

# Step 9: Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✅ Sahara Application is Running!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🌐 Access your application:"
echo "   Frontend:  http://localhost:3000"
echo "   Backend:   http://localhost:5000"
echo "   Health:    http://localhost:5000/health"
echo ""
echo "📊 Process Information:"
echo "   Backend PID:  $BACKEND_PID"
echo "   Frontend PID: $FRONTEND_PID"
echo ""
echo "📝 Logs:"
echo "   Backend:  tail -f backend.log"
echo "   Frontend: tail -f frontend.log"
echo ""
echo "🛑 To stop the application:"
echo "   kill $BACKEND_PID $FRONTEND_PID"
echo "   or press Ctrl+C in the terminals"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✨ Ready to use! Open http://localhost:3000 in your browser"
echo ""
