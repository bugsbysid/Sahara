#!/bin/bash

echo "🔍 Comprehensive Error Diagnosis"
echo "================================"
echo ""

cd "$(dirname "$0")"

# Check TypeScript compilation
echo "1️⃣ Checking TypeScript compilation..."
cd backend
if npm run build > /tmp/backend-build.log 2>&1; then
    echo "   ✅ Backend compiles successfully"
else
    echo "   ❌ Backend compilation errors:"
    cat /tmp/backend-build.log
fi
cd ..

cd frontend
if npm run build > /tmp/frontend-build.log 2>&1; then
    echo "   ✅ Frontend compiles successfully"
else
    echo "   ❌ Frontend compilation errors:"
    cat /tmp/frontend-build.log
fi
cd ..
echo ""

# Check environment files
echo "2️⃣ Checking environment files..."
if [ -f "backend/.env" ]; then
    echo "   ✅ backend/.env exists"
    if grep -q "MONGODB_URI=" backend/.env; then
        echo "   ✅ MONGODB_URI is set"
    else
        echo "   ❌ MONGODB_URI is missing"
    fi
    if grep -q "JWT_SECRET=" backend/.env; then
        echo "   ✅ JWT_SECRET is set"
    else
        echo "   ❌ JWT_SECRET is missing"
    fi
else
    echo "   ❌ backend/.env is missing"
fi

if [ -f "frontend/.env.local" ]; then
    echo "   ✅ frontend/.env.local exists"
else
    echo "   ❌ frontend/.env.local is missing"
fi
echo ""

# Check MongoDB
echo "3️⃣ Checking MongoDB..."
if brew services list | grep -q "mongodb-community.*started"; then
    echo "   ✅ MongoDB is running"
    if mongosh --eval "db.version()" > /dev/null 2>&1; then
        echo "   ✅ MongoDB is accessible"
    else
        echo "   ⚠️  MongoDB running but not accessible"
    fi
else
    echo "   ❌ MongoDB is not running"
    echo "   Run: brew services start mongodb-community@7.0"
fi
echo ""

# Check dependencies
echo "4️⃣ Checking dependencies..."
if [ -d "backend/node_modules" ]; then
    echo "   ✅ Backend dependencies installed"
else
    echo "   ❌ Backend dependencies missing"
    echo "   Run: cd backend && npm install"
fi

if [ -d "frontend/node_modules" ]; then
    echo "   ✅ Frontend dependencies installed"
else
    echo "   ❌ Frontend dependencies missing"
    echo "   Run: cd frontend && npm install"
fi
echo ""

# Check ports
echo "5️⃣ Checking ports..."
if lsof -i :5000 > /dev/null 2>&1; then
    echo "   ⚠️  Port 5000 is in use"
    lsof -i :5000 | grep LISTEN
else
    echo "   ✅ Port 5000 is available"
fi

if lsof -i :3000 > /dev/null 2>&1; then
    echo "   ⚠️  Port 3000 is in use"
    lsof -i :3000 | grep LISTEN
else
    echo "   ✅ Port 3000 is available"
fi
echo ""

# Check for common issues
echo "6️⃣ Checking for common issues..."

# Check Node version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -ge 18 ]; then
    echo "   ✅ Node.js version is compatible ($NODE_VERSION)"
else
    echo "   ❌ Node.js version too old ($NODE_VERSION). Need 18+"
fi

# Check npm version
NPM_VERSION=$(npm -v | cut -d'.' -f1)
if [ "$NPM_VERSION" -ge 9 ]; then
    echo "   ✅ npm version is compatible ($NPM_VERSION)"
else
    echo "   ⚠️  npm version is old ($NPM_VERSION). Recommended 9+"
fi
echo ""

echo "================================"
echo "Diagnosis complete!"
echo ""
echo "If you see any ❌ or ⚠️  above, those need to be fixed."
echo ""
