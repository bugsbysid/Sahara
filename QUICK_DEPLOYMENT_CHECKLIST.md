# 🚀 Quick Deployment Checklist

**Estimated Time:** 45 minutes  
**Difficulty:** Easy  
**Prerequisites:** MongoDB Atlas, Email service, Render/Vercel accounts

---

## ⚠️ BEFORE YOU START

**CRITICAL:** You must rotate all credentials before deploying to production.

Your current `.env` file contains exposed credentials that must be changed:
- Weak JWT secret
- Exposed MongoDB credentials
- Exposed email credentials

**See SECURITY_RECOMMENDATIONS.md for detailed instructions.**

---

## Phase 1: Security Setup (15 minutes)

### Step 1: Generate New JWT Secret (2 minutes)
```bash
# On macOS/Linux
openssl rand -base64 32

# On Windows PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

**Copy the output** - you'll need it for Step 4.

- [ ] JWT secret generated

### Step 2: Set Up MongoDB Atlas (5 minutes)

1. Go to https://cloud.mongodb.com
2. Sign up or log in
3. Create new cluster (FREE M0 tier)
4. Go to "Database Access"
5. Click "Add New Database User"
   - Username: `sahara_prod_user`
   - Password: Click "Autogenerate Secure Password" (copy it!)
   - Database User Privileges: "Read and write to any database"
6. Go to "Network Access"
7. Click "Add IP Address"
   - For now: "Allow Access from Anywhere" (0.0.0.0/0)
   - Later: Whitelist specific IPs
8. Go to "Database" → "Connect" → "Connect your application"
9. Copy connection string
10. Replace `<password>` with your password
11. Replace `<dbname>` with `sahara-db`

**Example:**
```
mongodb+srv://sahara_prod_user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/sahara-db
```

- [ ] MongoDB Atlas cluster created
- [ ] Database user created
- [ ] Connection string copied

### Step 3: Set Up Email Service (5 minutes)

**Option A: Gmail (Quick, for testing)**
1. Go to Google Account → Security
2. Enable 2-Step Verification
3. Go to App Passwords
4. Generate new app password for "Mail"
5. Copy the 16-character password

- [ ] Gmail app password generated

**Option B: SendGrid (Recommended for production)**
1. Go to https://sendgrid.com
2. Sign up (free tier: 100 emails/day)
3. Go to Settings → API Keys
4. Create API Key
5. Copy the API key

- [ ] SendGrid API key generated

### Step 4: Update Local .env File (3 minutes)

Edit `backend/.env`:

```env
PORT=5000
MONGODB_URI=<paste-your-mongodb-connection-string>
JWT_SECRET=<paste-your-generated-jwt-secret>
FRONTEND_URL=http://localhost:3000
EMAIL_USER=<your-email-or-apikey>
EMAIL_PASS=<your-app-password-or-api-key>
```

**For SendGrid:**
```env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASS=<your-sendgrid-api-key>
```

- [ ] .env file updated with new credentials

### Step 5: Test Locally (5 minutes)

```bash
# Terminal 1 - Backend
cd backend
npm install
npm run dev

# Terminal 2 - Frontend
cd frontend
npm install
npm run dev
```

Visit http://localhost:3000 and test:
- [ ] Sign up works
- [ ] Login works
- [ ] Report incident works
- [ ] View incidents works

---

## Phase 2: Backend Deployment (15 minutes)

### Step 6: Deploy to Render (10 minutes)

1. Go to https://render.com
2. Sign up or log in
3. Click "New +" → "Web Service"
4. Connect your GitHub repository
5. Configure:
   - **Name:** `sahara-backend`
   - **Environment:** `Node`
   - **Region:** Choose closest to your users
   - **Branch:** `main` or `master`
   - **Root Directory:** `backend`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Instance Type:** Free

6. Click "Advanced" → "Add Environment Variable"

Add these variables:
```
NODE_ENV=production
PORT=5000
MONGODB_URI=<your-mongodb-atlas-connection-string>
JWT_SECRET=<your-generated-jwt-secret>
SESSION_SECRET=<your-generated-jwt-secret>
FRONTEND_URL=<will-add-after-frontend-deployment>
EMAIL_HOST=smtp.gmail.com (or smtp.sendgrid.net)
EMAIL_PORT=587
EMAIL_USER=<your-email-or-apikey>
EMAIL_PASS=<your-app-password-or-api-key>
EMAIL_FROM=noreply@sahara-app.com
```

7. Click "Create Web Service"
8. Wait for deployment (5-10 minutes)
9. Copy your backend URL (e.g., `https://sahara-backend.onrender.com`)

- [ ] Backend deployed to Render
- [ ] Backend URL copied

### Step 7: Test Backend API (2 minutes)

```bash
# Test health endpoint
curl https://your-backend-url.onrender.com/health

# Should return: {"status":"ok","timestamp":"...","database":"connected"}
```

- [ ] Backend health check passes

---

## Phase 3: Frontend Deployment (10 minutes)

### Step 8: Deploy to Vercel (8 minutes)

1. Go to https://vercel.com
2. Sign up or log in
3. Click "Add New..." → "Project"
4. Import your GitHub repository
5. Configure:
   - **Framework Preset:** Next.js
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `.next`

6. Click "Environment Variables"
7. Add:
   ```
   NEXT_PUBLIC_API_URL=<your-backend-url-from-step-6>
   ```
   Example: `https://sahara-backend.onrender.com`

8. Click "Deploy"
9. Wait for deployment (3-5 minutes)
10. Copy your frontend URL (e.g., `https://sahara.vercel.app`)

- [ ] Frontend deployed to Vercel
- [ ] Frontend URL copied

### Step 9: Update Backend FRONTEND_URL (2 minutes)

1. Go back to Render dashboard
2. Select your backend service
3. Go to "Environment"
4. Update `FRONTEND_URL` with your Vercel URL
5. Click "Save Changes"
6. Wait for automatic redeploy

- [ ] Backend FRONTEND_URL updated

---

## Phase 4: Final Testing (5 minutes)

### Step 10: Test Production Application

Visit your frontend URL and test:

1. **Landing Page**
   - [ ] Page loads correctly
   - [ ] Sign Up button works
   - [ ] Sign In button works

2. **Sign Up**
   - [ ] Can create new account
   - [ ] Receives success message
   - [ ] Redirects to dashboard

3. **Login**
   - [ ] Can log in with credentials
   - [ ] Redirects to dashboard
   - [ ] Shows user information

4. **Report Incident**
   - [ ] Can access report form
   - [ ] GPS location capture works
   - [ ] Form submission works
   - [ ] Shows nearby hospitals

5. **View Incidents**
   - [ ] Can view incidents list
   - [ ] Can view incident details
   - [ ] Can update status (if authorized)

6. **Password Reset**
   - [ ] Can request password reset
   - [ ] Receives email
   - [ ] Can reset password

---

## Phase 5: Post-Deployment (Optional)

### Step 11: Set Up Custom Domain (Optional)

**Vercel (Frontend):**
1. Go to Project Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions

**Render (Backend):**
1. Go to Service Settings → Custom Domain
2. Add your custom domain
3. Follow DNS configuration instructions

- [ ] Custom domain configured (optional)

### Step 12: Set Up Monitoring (Recommended)

**Uptime Monitoring:**
1. Go to https://uptimerobot.com
2. Add monitor for your backend URL
3. Add monitor for your frontend URL

**Error Tracking:**
1. Go to https://sentry.io
2. Create new project
3. Follow integration instructions

- [ ] Uptime monitoring set up
- [ ] Error tracking set up

---

## ✅ Deployment Complete!

Congratulations! Your Sahara application is now live and ready to help address India's stray dog crisis.

### Your URLs
- **Frontend:** `https://your-app.vercel.app`
- **Backend:** `https://your-backend.onrender.com`

### Next Steps
1. Share the application with users
2. Monitor logs for errors
3. Gather user feedback
4. Plan feature enhancements

### Important Notes
- **Free tier limitations:**
  - Render: May sleep after 15 minutes of inactivity
  - MongoDB Atlas: 512 MB storage limit
  - SendGrid: 100 emails/day limit

- **Upgrade when needed:**
  - More users → Upgrade Render instance
  - More data → Upgrade MongoDB tier
  - More emails → Upgrade SendGrid plan

---

## 🆘 Troubleshooting

### Backend won't start
- Check environment variables are set correctly
- Verify MongoDB connection string
- Check Render logs for errors

### Frontend can't connect to backend
- Verify NEXT_PUBLIC_API_URL is correct
- Check CORS configuration in backend
- Verify backend is running

### Database connection failed
- Verify MongoDB URI is correct
- Check IP whitelist in MongoDB Atlas
- Verify database user credentials

### Email not sending
- Verify EMAIL_USER and EMAIL_PASS
- For Gmail, ensure App Password is used
- For SendGrid, verify API key is valid

---

## 📚 Additional Resources

- **Full Documentation:** See README.md
- **Detailed Deployment Guide:** See DEPLOYMENT_GUIDE.md
- **Security Guide:** See SECURITY_RECOMMENDATIONS.md
- **Project Analysis:** See PROJECT_ANALYSIS_REPORT.md

---

## 🎉 Success!

Your application is now live and making a difference in addressing India's stray dog crisis!

**Total Time:** ~45 minutes  
**Status:** ✅ Deployed and Running

