# Production Deployment Checklist

Use this checklist to deploy Sahara to production.

## ✅ Pre-Deployment Checklist

### 1. Environment Setup

#### MongoDB Atlas
- [ ] Create MongoDB Atlas account at https://www.mongodb.com/cloud/atlas
- [ ] Create a new cluster (FREE M0 tier available)
- [ ] Create database user with read/write permissions
- [ ] Whitelist IP addresses (0.0.0.0/0 for production)
- [ ] Copy connection string

#### Email Service
Choose one:

**Option A: Gmail (Quick Setup)**
- [ ] Enable 2-Step Verification on Google Account
- [ ] Generate App Password (Google Account → Security → App Passwords)
- [ ] Copy 16-character app password

**Option B: SendGrid (Recommended for Production)**
- [ ] Create SendGrid account at https://sendgrid.com
- [ ] Verify sender email address
- [ ] Create API key with Mail Send permissions
- [ ] Copy API key

#### Generate Secrets
Run these commands to generate secure secrets:

```bash
# JWT Secret (copy output)
openssl rand -base64 32

# Session Secret (copy output)
openssl rand -base64 32
```

### 2. Backend Deployment (Render)

- [ ] Sign up at https://render.com
- [ ] Click "New +" → "Web Service"
- [ ] Connect GitHub repository
- [ ] Configure service:
  - Name: `sahara-backend`
  - Environment: `Node`
  - Build Command: `cd backend && npm install`
  - Start Command: `cd backend && npm start`
  - Instance Type: Free or Starter

- [ ] Add environment variables in Render dashboard:

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=<your-mongodb-atlas-connection-string>
JWT_SECRET=<generated-secret-from-step-1>
SESSION_SECRET=<generated-secret-from-step-1>
FRONTEND_URL=<will-add-after-frontend-deployment>
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=<your-email@gmail.com>
EMAIL_PASS=<your-app-password>
EMAIL_FROM=noreply@sahara-app.com
```

- [ ] Click "Create Web Service"
- [ ] Wait for deployment to complete
- [ ] Copy backend URL (e.g., https://sahara-backend.onrender.com)

### 3. Frontend Deployment (Vercel)

- [ ] Sign up at https://vercel.com
- [ ] Click "New Project"
- [ ] Import GitHub repository
- [ ] Configure project:
  - Framework Preset: Next.js
  - Root Directory: `frontend`
  - Build Command: `npm run build`
  - Output Directory: `.next`

- [ ] Add environment variable:

```env
NEXT_PUBLIC_API_URL=<your-backend-url-from-step-2>
```

- [ ] Click "Deploy"
- [ ] Wait for deployment to complete
- [ ] Copy frontend URL (e.g., https://sahara-app.vercel.app)

### 4. Update Backend Configuration

- [ ] Go back to Render dashboard
- [ ] Update `FRONTEND_URL` environment variable with your Vercel URL
- [ ] Redeploy backend service

### 5. Post-Deployment Testing

#### Test Backend API
- [ ] Visit `<backend-url>/health` - should return "OK"
- [ ] Visit `<backend-url>/api` - should return API info

#### Test Frontend
- [ ] Visit your frontend URL
- [ ] Sign up with a new account
- [ ] Verify email is sent (check spam folder)
- [ ] Login with credentials
- [ ] Update profile
- [ ] Report a test incident (allow GPS location)
- [ ] View incidents list
- [ ] View incident details
- [ ] Test password reset flow

#### Test All User Roles
- [ ] Create account as Citizen
- [ ] Create account as Hospital Staff
- [ ] Create account as Animal Control
- [ ] Create account as NGO Worker
- [ ] Create account as Authority
- [ ] Verify role-specific features work

### 6. Security Verification

- [ ] Verify HTTPS is enabled (automatic on Render/Vercel)
- [ ] Test CORS - frontend can access backend
- [ ] Test rate limiting on login endpoint
- [ ] Verify JWT tokens expire correctly
- [ ] Test password reset token expiry
- [ ] Verify no secrets in client-side code
- [ ] Check MongoDB IP whitelist

### 7. Performance Check

- [ ] Test API response times (should be < 2s)
- [ ] Test frontend load times (should be < 3s)
- [ ] Test with multiple incidents (create 10+ test incidents)
- [ ] Test pagination on incidents list
- [ ] Test nearby hospitals query

### 8. Monitoring Setup

- [ ] Set up error monitoring (Render logs)
- [ ] Set up uptime monitoring (UptimeRobot or similar)
- [ ] Configure email alerts for downtime
- [ ] Monitor database usage in MongoDB Atlas
- [ ] Check backend logs regularly

## 🚀 Alternative Deployment Options

### Option 2: Railway

**Backend + Frontend on Railway:**
1. Sign up at https://railway.app
2. Create new project from GitHub
3. Add MongoDB service (or use Atlas)
4. Configure environment variables
5. Deploy both services

### Option 3: Render (Both Services)

**Backend + Frontend on Render:**
1. Deploy backend as Web Service (as above)
2. Deploy frontend as Static Site:
   - Build Command: `cd frontend && npm install && npm run build`
   - Publish Directory: `frontend/out`

## 📊 Post-Launch Checklist

### Week 1
- [ ] Monitor error logs daily
- [ ] Check database performance
- [ ] Verify email delivery rates
- [ ] Collect user feedback
- [ ] Fix critical bugs

### Week 2-4
- [ ] Analyze usage patterns
- [ ] Optimize slow queries
- [ ] Improve response times
- [ ] Add monitoring dashboards
- [ ] Plan feature enhancements

## 🆘 Troubleshooting

### Backend Won't Start
1. Check Render logs for errors
2. Verify all environment variables are set
3. Test MongoDB connection string locally
4. Check if PORT is configured correctly

### Frontend Can't Connect
1. Verify NEXT_PUBLIC_API_URL is correct
2. Check CORS settings in backend
3. Verify backend is running (visit /health endpoint)
4. Check browser console for errors

### Database Connection Failed
1. Verify MongoDB URI format
2. Check IP whitelist (should include 0.0.0.0/0)
3. Verify database user credentials
4. Test connection with MongoDB Compass

### Email Not Sending
1. Verify EMAIL_USER and EMAIL_PASS
2. For Gmail: ensure App Password is used (not regular password)
3. For SendGrid: verify API key is valid
4. Check email service logs
5. Test with a simple email first

### Slow Performance
1. Check database indexes are created
2. Monitor API response times in logs
3. Upgrade instance size if needed
4. Consider adding Redis caching
5. Optimize database queries

## 📞 Support Resources

- **Render Docs**: https://render.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **MongoDB Atlas Docs**: https://docs.atlas.mongodb.com
- **SendGrid Docs**: https://docs.sendgrid.com

## ✅ Deployment Complete!

Once all items are checked:
- ✅ Your Sahara application is live in production
- ✅ Users can access it via your frontend URL
- ✅ All features are functional
- ✅ Monitoring is in place

**Next Steps:**
1. Share the URL with stakeholders
2. Gather user feedback
3. Monitor usage and performance
4. Plan Phase 4 enhancements (optional)

---

**Congratulations! Sahara is now helping address India's stray dog crisis! 🎉**
