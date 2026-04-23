# How to Start Sahara Application

## ✅ Prerequisites Check

Before starting, ensure you have:
- ✅ Node.js 18+ installed
- ✅ MongoDB installed and running
- ✅ npm installed

---

## 🚀 Quick Start (Recommended)

### Option 1: Automated Startup (Easiest)

```bash
cd ~/Dogs/Sahara
./start-and-verify.sh
```

This script will:
1. Check MongoDB status
2. Verify environment files
3. Install dependencies if needed
4. Build both projects
5. Start backend and frontend
6. Run health checks
7. Show you the URLs

**Wait for:** "✅ Sahara Application is Running!"

Then open: **http://localhost:3000**

---

### Option 2: Manual Startup

**Terminal 1 - Backend:**
```bash
cd ~/Dogs/Sahara/backend
npm run dev
```

Wait for: `[INFO] Server is running on http://localhost:5000`

**Terminal 2 - Frontend:**
```bash
cd ~/Dogs/Sahara/frontend
npm run dev
```

Wait for: `✓ Ready in X.Xs`

Then open: **http://localhost:3000**

---

## 🔍 Verify It's Working

### Quick Check:
1. Open browser: http://localhost:3000
2. You should see the Sahara landing page
3. Click "Sign Up" to create an account

### Health Check:
```bash
curl http://localhost:5000/health
```

Should return:
```json
{
  "status": "ok",
  "database": "connected",
  "timestamp": "..."
}
```

---

## 🛑 How to Stop

### If using start-and-verify.sh:
```bash
# The script shows PIDs at the end
kill <BACKEND_PID> <FRONTEND_PID>
```

### If running manually:
- Press `Ctrl+C` in each terminal

### Force stop all:
```bash
# Kill processes on ports
lsof -ti :5000 | xargs kill -9
lsof -ti :3000 | xargs kill -9
```

---

## 🐛 Troubleshooting

### MongoDB Not Running
```bash
brew services start mongodb-community@7.0
```

### Port Already in Use
```bash
# Kill process on port 5000 (backend)
lsof -ti :5000 | xargs kill -9

# Kill process on port 3000 (frontend)
lsof -ti :3000 | xargs kill -9
```

### Backend Won't Start
```bash
cd backend
npm install
npm run build
npm run dev
```

Check `backend.log` for errors.

### Frontend Won't Start
```bash
cd frontend
npm install
npm run build
npm run dev
```

Check `frontend.log` for errors.

### Database Connection Error
Check `backend/.env`:
```env
MONGODB_URI=mongodb://127.0.0.1:27017/sahara-db
```

Make sure MongoDB is running:
```bash
brew services list | grep mongodb
```

---

## 📝 Environment Files

### Backend (.env)
Location: `backend/.env`

Required variables:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/sahara-db
JWT_SECRET=your-secret-key-here
FRONTEND_URL=http://localhost:3000
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### Frontend (.env.local)
Location: `frontend/.env.local`

Required variables:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=
```

---

## 🎯 First Time Setup

1. **Install MongoDB:**
   ```bash
   brew tap mongodb/brew
   brew install mongodb-community@7.0
   brew services start mongodb-community@7.0
   ```

2. **Install Dependencies:**
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```

3. **Create Environment Files:**
   ```bash
   # Backend
   cp backend/env.example backend/.env
   # Edit backend/.env with your values
   
   # Frontend
   cp frontend/.env.local.example frontend/.env.local
   # Default values should work
   ```

4. **Start Application:**
   ```bash
   ./start-and-verify.sh
   ```

---

## 🌐 URLs

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000
- **Health Check:** http://localhost:5000/health
- **API Docs:** http://localhost:5000/api

---

## ✨ What to Do Next

1. **Sign Up:** Create a new account (choose "Citizen" role)
2. **Login:** Use your credentials
3. **Report Incident:** Click "Report Incident" and fill the form
4. **View Incidents:** See your reported incidents
5. **Update Profile:** Manage your account

---

## 📊 Check Status Anytime

```bash
./check-status.sh
```

Shows:
- MongoDB status
- Backend status
- Frontend status
- Health check response

---

## 🆘 Need Help?

1. Check logs:
   ```bash
   tail -f backend.log
   tail -f frontend.log
   ```

2. Run diagnostics:
   ```bash
   ./check-status.sh
   ```

3. Restart everything:
   ```bash
   # Stop all
   lsof -ti :5000 :3000 | xargs kill -9
   
   # Start again
   ./start-and-verify.sh
   ```

---

## ✅ Success Indicators

You'll know it's working when:
- ✅ Backend shows: `[INFO] Server is running on http://localhost:5000`
- ✅ Frontend shows: `✓ Ready in X.Xs`
- ✅ Browser shows Sahara landing page at http://localhost:3000
- ✅ Health check returns `{"status":"ok"}`

---

**Ready to start? Run:** `./start-and-verify.sh`
