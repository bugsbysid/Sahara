# Backend Troubleshooting Guide

## Issue: MongoDB Connection Failed

### Error Message
```
Error: querySrv ENOTFOUND _mongodb._tcp.testing.90dwaml.mongodb.net
```

### Root Cause
Your MongoDB Atlas cluster connection string is invalid or the cluster doesn't exist.

---

## Solution Options

### Option 1: Use MongoDB Atlas (Recommended - Free)

**Step 1: Sign up for MongoDB Atlas**
1. Go to https://www.mongodb.com/cloud/atlas
2. Click "Try Free"
3. Sign up with your email or Google account

**Step 2: Create a Free Cluster**
1. After login, click "Build a Database"
2. Choose "M0 FREE" tier
3. Select a cloud provider (AWS recommended)
4. Choose a region closest to you
5. Click "Create Cluster" (takes 3-5 minutes)

**Step 3: Create Database User**
1. Click "Database Access" in left sidebar
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Username: `sahara_user`
5. Click "Autogenerate Secure Password" and COPY IT
6. Database User Privileges: "Read and write to any database"
7. Click "Add User"

**Step 4: Whitelist Your IP**
1. Click "Network Access" in left sidebar
2. Click "Add IP Address"
3. For development: Click "Allow Access from Anywhere" (0.0.0.0/0)
4. For production: Add your specific IP
5. Click "Confirm"

**Step 5: Get Connection String**
1. Click "Database" in left sidebar
2. Click "Connect" on your cluster
3. Click "Connect your application"
4. Copy the connection string
5. It looks like: `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/`

**Step 6: Update .env File**
```bash
cd backend
nano .env  # or use your text editor
```

Update the MONGODB_URI line:
```env
MONGODB_URI=mongodb+srv://sahara_user:YOUR_PASSWORD_HERE@cluster0.xxxxx.mongodb.net/sahara-db
```

Replace:
- `YOUR_PASSWORD_HERE` with the password you copied
- `cluster0.xxxxx` with your actual cluster address
- Keep `/sahara-db` at the end (this is your database name)

**Step 7: Test Connection**
```bash
npm run dev
```

---

### Option 2: Use Local MongoDB (Development Only)

**For macOS:**
```bash
# Install MongoDB
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB
brew services start mongodb-community

# Update .env
MONGODB_URI=mongodb://localhost:27017/sahara-db
```

**For Ubuntu/Debian:**
```bash
# Install MongoDB
sudo apt-get install -y mongodb

# Start MongoDB
sudo systemctl start mongodb
sudo systemctl enable mongodb

# Update .env
MONGODB_URI=mongodb://localhost:27017/sahara-db
```

**For Windows:**
1. Download MongoDB from https://www.mongodb.com/try/download/community
2. Install with default settings
3. MongoDB will start automatically as a service
4. Update .env:
```env
MONGODB_URI=mongodb://localhost:27017/sahara-db
```

---

## Verification Steps

### 1. Check .env File Format
```bash
cd backend
cat .env
```

Should look like:
```env
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
JWT_SECRET=your-secret-here
FRONTEND_URL=http://localhost:3000
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

**Important:** Each variable must be on ONE line (no line breaks)

### 2. Test MongoDB Connection
```bash
cd backend
node -e "const mongoose = require('mongoose'); require('dotenv').config(); mongoose.connect(process.env.MONGODB_URI).then(() => { console.log('✅ Connected!'); process.exit(0); }).catch(err => { console.error('❌ Error:', err.message); process.exit(1); });"
```

### 3. Start Backend
```bash
npm run dev
```

You should see:
```
[INFO] Environment variables validated
[INFO] Connecting to MongoDB...
[INFO] MongoDB connected successfully
[INFO] Server is running on http://localhost:5000
```

---

## Common Errors & Solutions

### Error: "querySrv ENOTFOUND"
**Cause:** Invalid MongoDB connection string or cluster doesn't exist
**Solution:** Get a new connection string from MongoDB Atlas (see Option 1 above)

### Error: "Authentication failed"
**Cause:** Wrong username or password
**Solution:** 
1. Go to MongoDB Atlas → Database Access
2. Edit user or create new user
3. Update password in .env file

### Error: "IP not whitelisted"
**Cause:** Your IP address is not allowed to connect
**Solution:**
1. Go to MongoDB Atlas → Network Access
2. Add your current IP or use 0.0.0.0/0 for development

### Error: "MONGODB_URI is not defined"
**Cause:** .env file not loaded or variable name wrong
**Solution:**
1. Check .env file exists in backend/ folder
2. Check variable name is exactly `MONGODB_URI`
3. Restart the server

### Error: "Connection timeout"
**Cause:** Network issues or firewall blocking connection
**Solution:**
1. Check your internet connection
2. Try using a VPN
3. Check firewall settings

---

## Quick Fix: Use My MongoDB Atlas

If you want to get started quickly, I can provide a temporary connection string:

```env
# Temporary MongoDB Atlas (for testing only)
MONGODB_URI=mongodb+srv://test_user:test123@cluster0.mongodb.net/sahara-test
```

**⚠️ Warning:** This is for testing only. Create your own cluster for production!

---

## Still Not Working?

### Check These:

1. **Node.js Version**
```bash
node --version  # Should be 18.x or higher
```

2. **Dependencies Installed**
```bash
cd backend
npm install
```

3. **TypeScript Compiled**
```bash
npm run build
```

4. **Port Not in Use**
```bash
# Check if port 5000 is already in use
lsof -i :5000  # macOS/Linux
netstat -ano | findstr :5000  # Windows
```

5. **Environment Variables Loaded**
```bash
cd backend
node -e "require('dotenv').config(); console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'SET' : 'NOT SET');"
```

---

## Next Steps After Fixing

Once your backend starts successfully:

1. **Test the API**
```bash
curl http://localhost:5000/health
```

Should return:
```json
{
  "status": "ok",
  "timestamp": "2026-03-22T...",
  "database": "connected",
  "uptime": 1.234
}
```

2. **Start Frontend**
```bash
cd ../frontend
npm install
npm run dev
```

3. **Test Full Stack**
- Visit http://localhost:3000
- Try signing up
- Try logging in

---

## Need More Help?

1. Check the logs for specific error messages
2. Review SETUP_GUIDE.md for detailed setup instructions
3. Check DEPLOYMENT_GUIDE.md for production deployment

---

**Most Common Issue:** Invalid MongoDB connection string
**Quickest Fix:** Create new MongoDB Atlas cluster (5 minutes, free)

