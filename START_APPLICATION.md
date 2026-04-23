# 🚀 Start Sahara Application

## Quick Start (3 Commands)

### Option 1: With Local MongoDB

```bash
# Terminal 1: Start MongoDB
brew services start mongodb-community

# Terminal 2: Start Backend
cd Sahara/backend && npm run dev

# Terminal 3: Start Frontend
cd Sahara/frontend && npm run dev
```

Then visit: **http://localhost:3000**

---

### Option 2: With MongoDB Atlas

**First time setup (5 minutes):**
1. Go to https://www.mongodb.com/cloud/atlas/register
2. Create free M0 cluster
3. Create database user and copy password
4. Get connection string
5. Update `backend/.env`:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/sahara-db
   ```

**Then start:**
```bash
# Terminal 1: Start Backend
cd Sahara/backend && npm run dev

# Terminal 2: Start Frontend
cd Sahara/frontend && npm run dev
```

Then visit: **http://localhost:3000**

---

## First Time Setup

If you haven't installed dependencies:

```bash
# Install backend dependencies
cd Sahara/backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

---

## Verify Everything Works

### 1. Check Backend
```bash
curl http://localhost:5000/health
```

Should return:
```json
{
  "status": "ok",
  "database": "connected",
  "uptime": 1.234
}
```

### 2. Check Frontend
Visit: http://localhost:3000

You should see the Sahara landing page.

### 3. Test Full Flow
1. Click "Get Started"
2. Register as Citizen
3. Login
4. Report an incident
5. View incidents list

---

## Troubleshooting

### Backend won't start?
- Check MongoDB is running: `brew services list | grep mongodb`
- Check .env file exists: `ls backend/.env`
- Check logs for errors

### Frontend won't start?
- Check backend is running first
- Check port 3000 is not in use
- Try: `rm -rf .next && npm run dev`

### Can't connect to MongoDB?
- **Local:** `brew services restart mongodb-community`
- **Atlas:** Check connection string in .env
- See: BACKEND_TROUBLESHOOTING.md

---

## Production Deployment

Once everything works locally:

```bash
# Follow the deployment checklist
open PRODUCTION_DEPLOYMENT_CHECKLIST.md
```

Or deploy now:
1. Deploy backend to Render
2. Deploy frontend to Vercel
3. Takes ~30 minutes total

---

## What You'll See

### Landing Page
- Problem statement (26.7 lakh dog bite cases)
- Features overview
- Sign up / Sign in buttons

### After Login
- Role-specific dashboard
- Quick actions
- Report incident button
- View incidents button

### Incident Reporting
- GPS location capture
- Incident details form
- Dog description
- Nearby hospitals display

### Incidents List
- All your incidents
- Filter by status
- Click to view details

---

## Default Test Users

After first signup, you can create test users:

**Citizen:**
- Email: citizen@test.com
- Password: Test123!@#

**Hospital:**
- Email: hospital@test.com
- Password: Test123!@#
- Organization: City Hospital

**Admin:**
- Email: admin@test.com
- Password: Test123!@#
- Role: Authority

---

## Features Available

✅ User registration and login  
✅ Password reset via email  
✅ Profile management  
✅ Incident reporting with GPS  
✅ Nearby hospital discovery  
✅ Incident tracking  
✅ Status updates  
✅ Vaccination tracking  
✅ Role-based access control  
✅ Responsive design  

---

## Need Help?

- **Setup Issues:** SETUP_GUIDE.md
- **MongoDB Issues:** BACKEND_TROUBLESHOOTING.md
- **Deployment:** PRODUCTION_DEPLOYMENT_CHECKLIST.md
- **Features:** CURRENT_STATUS.md

---

**Ready to start? Run the commands above! 🚀**

