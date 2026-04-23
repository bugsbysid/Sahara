#!/bin/bash

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🍃 MongoDB Installation Script for Sahara"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if brew is installed
if ! command -v brew &> /dev/null; then
    echo "❌ Homebrew is not installed"
    echo "Install it from: https://brew.sh"
    exit 1
fi

echo "✓ Homebrew found"
echo ""

# Check if MongoDB is already installed
if command -v mongod &> /dev/null; then
    echo "✓ MongoDB is already installed"
    echo ""
    
    # Check if it's running
    if brew services list | grep mongodb-community | grep started &> /dev/null; then
        echo "✓ MongoDB is already running"
    else
        echo "⚠️  MongoDB is installed but not running"
        echo "Starting MongoDB..."
        brew services start mongodb-community@7.0
        sleep 2
        
        if brew services list | grep mongodb-community | grep started &> /dev/null; then
            echo "✓ MongoDB started successfully"
        else
            echo "❌ Failed to start MongoDB"
            exit 1
        fi
    fi
else
    echo "📦 Installing MongoDB..."
    echo ""
    
    # Add MongoDB tap
    brew tap mongodb/brew
    
    # Install MongoDB
    brew install mongodb-community@7.0
    
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install MongoDB"
        exit 1
    fi
    
    echo ""
    echo "✓ MongoDB installed successfully"
    echo ""
    
    # Start MongoDB
    echo "🚀 Starting MongoDB service..."
    brew services start mongodb-community@7.0
    sleep 2
    
    if brew services list | grep mongodb-community | grep started &> /dev/null; then
        echo "✓ MongoDB started successfully"
    else
        echo "❌ Failed to start MongoDB"
        exit 1
    fi
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ MongoDB Setup Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "MongoDB Status:"
brew services list | grep mongodb-community
echo ""
echo "Next steps:"
echo "  1. cd Sahara/backend"
echo "  2. npm run dev"
echo ""
echo "To stop MongoDB later:"
echo "  brew services stop mongodb-community@7.0"
echo ""
