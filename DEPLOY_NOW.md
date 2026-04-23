# 🚀 Deploy Your Application NOW

## Fastest Deployment Options (5-10 minutes)

### Option 1: Vercel (Frontend) + Render (Backend) - RECOMMENDED ⭐

This is the easiest and fastest way to deploy with free tiers available.

#### Step 1: Deploy Backend to Render (3 minutes)

1. **Go to Render**: https://render.com (Sign up with GitHub)

2. **Click "New +" → "Web Service"**

3. **Connect your GitHub repository** (Sahara)

4. **Configure:**
   - Name: `sahara-backend`
   - Root Directory: `backend`
   - Environment: `Node`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Instance Type: `Free`

5. **Add Environment Variables** (click "Advanced" → "Add Environment Variable"):
   ```
   NODE_ENV=production
   PORT=5001
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/sahara-db
   JWT_SECRET=your-super-secret-jwt-key-min-32-chars-change-this
   FRONTEND_URL=https://your-app.vercel.app
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-gmail-app-password
   EMAIL_FROM=noreply@sahara-app.com
   ```

6. **Click "Create Web Service"** - Render will deploy automatically!

7. **Copy your backend URL** (e.g., `https://sahara-backend.onrender.com`)

#### Step 2: Setup MongoDB Atlas (2 minutes)

1. **Go to MongoDB Atlas**: https://cloud.mongodb.com (Sign up free)

2. **Create FREE Cluster:**
   - Click "Build a Database"
   - Choose "FREE" (M0)
   - Select region closest to you
   - Click "Create"

3. **Create Database User:**
   - Security → Database Access → Add New User
   - Username: `sahara-admin`
   - Password: Generate secure password (save it!)
   - Database User Privileges: "Read and write to any database"
   - Click "Add User"

4. **Whitelist All IPs:**
   - Security → Network Access → Add IP Address
   - Click "Allow Access from Anywhere" (0.0.0.0/0)
   - Click "Confirm"

5. **Get Connection String:**
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your password
   - Replace `myFirstDatabase` with `sahara-db`
   - Example: `mongodb+srv://sahara-admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/sahara-db?retryWrites=true&w=majority`

6. **Update Render:** Go back to Render → Your Service → Environment → Edit `MONGODB_URI` with your connection string

#### Step 3: Deploy Frontend to Vercel (2 minutes)

1. **Go to Vercel**: https://vercel.com (Sign up with GitHub)

2. **Click "Add New..." → "Project"**

3. **Import your GitHub repository** (Sahara)

4. **Configure:**
   - Framework Preset: `Next.js`
   - Root Directory: `frontend`
   - Build Command: `npm run build` (auto-detected)
   - Output Directory: `.next` (auto-detected)

5. **Add Environment Variable:**
   - Click "Environment Variables"
   - Name: `NEXT_PUBLIC_API_URL`
   - Value: `https://sahara-backend.onrender.com` (your Render backend URL)
   - Click "Add"

6. **Click "Deploy"** - Vercel will deploy in ~2 minutes!

7. **Copy your frontend URL** (e.g., `https://sahara.vercel.app`)

8. **Update Backend:** Go to Render → Your Service → Environment → Edit `FRONTEND_URL` with your Vercel URL

#### Step 4: Test Your Deployment (1 minute)

1. Visit your Vercel URL
2. Click "Sign Up"
3. Create an account
4. Login
5. Try reporting an incident

**🎉 DONE! Your app is live!**

---

### Option 2: Railway (All-in-One) - EASIEST 🚂

Deploy everything in one place with automatic configuration.

1. **Go to Railway**: https://railway.app (Sign up with GitHub)

2. **Click "New Project" → "Deploy from GitHub repo"**

3. **Select your Sahara repository**

4. **Railway will detect both services automatically!**

5. **Add MongoDB:**
   - Click "+ New"
   - Select "Database" → "MongoDB"
   - Railway will create and connect it automatically

6. **Configure Backend Service:**
   - Click on backend service
   - Go to "Variables" tab
   - Add:
     ```
     NODE_ENV=production
     JWT_SECRET=your-super-secret-jwt-key-min-32-chars
     EMAIL_USER=your-email@gmail.com
     EMAIL_PASS=your-gmail-app-password
     ```
   - Railway auto-configures: MONGODB_URI, PORT, FRONTEND_URL

7. **Configure Frontend Service:**
   - Click on frontend service
   - Go to "Variables" tab
   - Railway auto-configures NEXT_PUBLIC_API_URL

8. **Click "Deploy"** on both services

**🎉 DONE! Railway handles everything!**

---

### Option 3: Render (All-in-One) - FREE TIER 🆓

1. **Deploy Backend** (follow Option 1, Step 1)

2. **Deploy Frontend as Static Site:**
   - Click "New +" → "Static Site"
   - Connect repository
   - Root Directory: `frontend`
   - Build Command: `npm install && npm run build && npm run export`
   - Publish Directory: `frontend/out`
   - Add Environment Variable: `NEXT_PUBLIC_API_URL`

3. **Setup MongoDB Atlas** (follow Option 1, Step 2)

**🎉 DONE! All on Render!**

---

## Quick Setup Checklist

Before deploying, make sure you have:

- ✅ GitHub account (to connect repositories)
- ✅ Gmail account (for email service) OR SendGrid account
- ✅ Gmail App Password generated (if using Gmail)
  - Go to: https://myaccount.google.com/apppasswords
  - Generate password for "Mail" → "Other"

---

## Environment Variables Quick Reference

### Backend (Required)
```env
NODE_ENV=production
MONGODB_URI=<from-mongodb-atlas>
JWT_SECRET=<generate-with: openssl rand -base64 32>
FRONTEND_URL=<your-vercel-or-render-url>
EMAIL_USER=<your-gmail>
EMAIL_PASS=<gmail-app-password>
```

### Frontend (Required)
```env
NEXT_PUBLIC_API_URL=<your-backend-url>
```

---

## Generate Secure Secrets

Run these commands in your terminal:

```bash
# Generate JWT Secret
openssl rand -base64 32

# Or use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

## After Deployment

### Test Your Live App

1. **Backend Health Check:**
   ```bash
   curl https://your-backend-url.com/health
   ```

2. **Frontend:** Visit your frontend URL in browser

3. **Full Flow Test:**
   - Sign up with a new account
   - Login
   - Report an incident
   - Check if email works (forgot password)

---

## Troubleshooting

### Backend won't start?
- Check MongoDB connection string is correct
- Verify all environment variables are set
- Check Render/Railway logs for errors

### Frontend can't connect to backend?
- Verify `NEXT_PUBLIC_API_URL` is correct
- Update backend `FRONTEND_URL` with frontend URL
- Check CORS settings

### Email not working?
- Verify Gmail App Password (not regular password)
- Check EMAIL_USER and EMAIL_PASS are correct
- Try SendGrid instead (more reliable for production)

---

## Cost Breakdown

### Free Tier (Perfect for testing/small projects)
- **Vercel:** Free (Hobby plan)
- **Render:** Free (with limitations: sleeps after 15 min inactivity)
- **Railway:** $5 credit/month free
- **MongoDB Atlas:** Free (M0 cluster, 512MB storage)

### Paid Tier (For production)
- **Vercel:** $20/month (Pro plan)
- **Render:** $7/month (Starter plan, no sleep)
- **Railway:** Pay as you go (~$5-20/month)
- **MongoDB Atlas:** $9/month (M10 cluster)

---

## Need Help?

1. Check deployment logs in your platform dashboard
2. Review `DEPLOYMENT_GUIDE.md` for detailed instructions
3. Test locally first: `npm run dev` in both backend and frontend
4. Verify environment variables are set correctly

---

**Ready to deploy? Pick Option 1 (Vercel + Render) and follow the steps above!**

**Total time: ~10 minutes** ⏱️
