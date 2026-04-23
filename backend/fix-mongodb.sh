#!/bin/bash

echo "🔧 MongoDB Connection Fix Script"
echo "================================"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ .env file not found!"
    echo "Creating .env from env.example..."
    cp env.example .env
fi

echo "Current MONGODB_URI:"
grep MONGODB_URI .env
echo ""

echo "Choose an option:"
echo "1. Use Local MongoDB (mongodb://localhost:27017/sahara-db)"
echo "2. Enter MongoDB Atlas connection string"
echo "3. Test current connection"
echo ""
read -p "Enter choice (1-3): " choice

case $choice in
    1)
        echo "Setting up local MongoDB..."
        sed -i.bak 's|MONGODB_URI=.*|MONGODB_URI=mongodb://localhost:27017/sahara-db|' .env
        echo "✅ Updated to local MongoDB"
        echo ""
        echo "Make sure MongoDB is running:"
        echo "  macOS: brew services start mongodb-community"
        echo "  Linux: sudo systemctl start mongod"
        echo "  Windows: MongoDB should start automatically"
        ;;
    2)
        echo ""
        read -p "Enter your MongoDB Atlas connection string: " mongo_uri
        sed -i.bak "s|MONGODB_URI=.*|MONGODB_URI=$mongo_uri|" .env
        echo "✅ Updated MongoDB URI"
        ;;
    3)
        echo "Testing connection..."
        node -e "const mongoose = require('mongoose'); require('dotenv').config(); mongoose.connect(process.env.MONGODB_URI).then(() => { console.log('✅ Connection successful!'); process.exit(0); }).catch(err => { console.error('❌ Connection failed:', err.message); process.exit(1); });"
        ;;
    *)
        echo "Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "Current .env file:"
cat .env
echo ""
echo "To start the backend: npm run dev"
