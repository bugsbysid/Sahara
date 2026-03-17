# Deployment Guide - Sahara

## Prerequisites

- Node.js 18+ installed
- MongoDB 6+ (local or Atlas)
- npm or yarn package manager
- Git (for version control)

## Local Development Setup

### 1. Clone and Install

```bash
# Clone the repository
git clone <repository-url>
cd Sahara

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure Backend Environment

Create `backend/.env` file:

```bash
cd backend
cp env.example .env
```

Edit `backend/.env` with your values:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database (REQUIRED)
MONGODB_URI=mongodb://localhost:27017/sahara-db

# JWT Secret (REQUIRED) - Generate with: openssl rand -base64 32
JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-characters
JWT_EXPIRES_IN=7d

# Session Secret (Optional - defaults to JWT_SECRET)
SESSION_SECRET=your-session-secret-key

# Frontend URL (REQUIRED)
FRONTEND_URL=http://localhost:3000

# Email Configuration (REQUIRED for password reset)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password
EMAIL_FROM=noreply@sahara-app.com

# Optional: Password reset token expiry (default: 1 hour)
RESET_TOKEN_EXPIRY_MS=3600000

# Optional: Additional allowed origins (comma-separated)
ALLOWED_ORIGINS=
```

### 3. Configure Frontend Environment

Create `frontend/.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### 4. Start Development Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Access the application:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Production Deployment

### Option 1: Deploy to Render (Recommended)

#### Backend Deployment

1. **Create Render Account**: Sign up at https://render.com

2. **Create Web Service**:
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     - Name: `sahara-backend`
     - Environment: `Node`
     - Build Command: `cd backend && npm install`
     - Start Command: `cd backend && npm start`
     - Instance Type: Free or Starter

3. **Add Environment Variables** in Render Dashboard:
   ```
   NODE_ENV=production
   MONGODB_URI=<your-mongodb-atlas-uri>
   JWT_SECRET=<generate-secure-secret>
   SESSION_SECRET=<generate-secure-secret>
   FRONTEND_URL=<your-frontend-url>
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=<your-email>
   EMAIL_PASS=<your-app-password>
   EMAIL_FROM=noreply@sahara-app.com
   ```

4. **Deploy**: Render will automatically deploy

#### Frontend Deployment

1. **Create Static Site** on Render:
   - Click "New +" → "Static Site"
   - Connect your GitHub repository
   - Configure:
     - Name: `sahara-frontend`
     - Build Command: `cd frontend && npm install && npm run build`
     - Publish Directory: `frontend/out`

2. **Add Environment Variable**:
   ```
   NEXT_PUBLIC_API_URL=<your-backend-url>
   ```

3. **Update Backend FRONTEND_URL**: Update backend environment variable with your frontend URL

### Option 2: Deploy to Vercel (Frontend) + Render (Backend)

#### Backend on Render
Follow the backend deployment steps from Option 1.

#### Frontend on Vercel

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Deploy**:
   ```bash
   cd frontend
   vercel
   ```

3. **Add Environment Variable** in Vercel Dashboard:
   ```
   NEXT_PUBLIC_API_URL=<your-backend-url>
   ```

4. **Update Backend**: Set FRONTEND_URL to your Vercel URL

### Option 3: Deploy to Railway

1. **Create Railway Account**: Sign up at https://railway.app

2. **Create New Project**:
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Connect repository

3. **Add Services**:
   - Add MongoDB service (or use MongoDB Atlas)
   - Add Backend service
   - Add Frontend service

4. **Configure Backend**:
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Add environment variables

5. **Configure Frontend**:
   - Root Directory: `frontend`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Add environment variables

## Database Setup

### Option 1: MongoDB Atlas (Recommended for Production)

1. **Create Account**: Sign up at https://www.mongodb.com/cloud/atlas

2. **Create Cluster**:
   - Choose FREE tier (M0)
   - Select region closest to your users
   - Create cluster

3. **Create Database User**:
   - Database Access → Add New User
   - Username: `sahara-admin`
   - Password: Generate secure password
   - Database User Privileges: Read and write to any database

4. **Whitelist IP**:
   - Network Access → Add IP Address
   - For development: Add Current IP
   - For production: Add `0.0.0.0/0` (allow from anywhere)

5. **Get Connection String**:
   - Click "Connect" → "Connect your application"
   - Copy connection string
   - Replace `<password>` with your password
   - Replace `<dbname>` with `sahara-db`

### Option 2: Local MongoDB

```bash
# Install MongoDB
# macOS
brew install mongodb-community

# Ubuntu
sudo apt-get install mongodb

# Start MongoDB
mongod

# Connection string
MONGODB_URI=mongodb://localhost:27017/sahara-db
```

## Email Configuration

### Gmail Setup (Development)

1. **Enable 2-Step Verification**:
   - Go to Google Account Security
   - Enable 2-Step Verification

2. **Generate App Password**:
   - Go to App Passwords
   - Select "Mail" and "Other"
   - Generate password
   - Copy 16-character password

3. **Add to .env**:
   ```env
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=xxxx-xxxx-xxxx-xxxx
   ```

### SendGrid Setup (Production Recommended)

1. **Create SendGrid Account**: https://sendgrid.com

2. **Create API Key**:
   - Settings → API Keys
   - Create API Key
   - Copy key

3. **Add to .env**:
   ```env
   EMAIL_HOST=smtp.sendgrid.net
   EMAIL_PORT=587
   EMAIL_USER=apikey
   EMAIL_PASS=<your-sendgrid-api-key>
   EMAIL_FROM=noreply@yourdomain.com
   ```

## Security Checklist

### Before Production Deployment

- [ ] Generate strong JWT_SECRET (min 32 characters)
- [ ] Generate strong SESSION_SECRET
- [ ] Use MongoDB Atlas with authentication
- [ ] Whitelist only necessary IPs in MongoDB
- [ ] Use environment variables (never commit secrets)
- [ ] Enable HTTPS (automatic on Render/Vercel)
- [ ] Set NODE_ENV=production
- [ ] Configure CORS with specific origins
- [ ] Use secure email service (SendGrid)
- [ ] Review and test all API endpoints
- [ ] Test authentication flows
- [ ] Test role-based access control

## Environment Variables Summary

### Backend (Required)
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=<mongodb-connection-string>
JWT_SECRET=<min-32-chars-secret>
FRONTEND_URL=<frontend-url>
EMAIL_USER=<email-address>
EMAIL_PASS=<email-password>
```

### Frontend (Required)
```env
NEXT_PUBLIC_API_URL=<backend-api-url>
```

## Testing Deployment

### 1. Test Backend API

```bash
# Health check
curl https://your-backend-url.com/health

# API root
curl https://your-backend-url.com/api

# Register user
curl -X POST https://your-backend-url.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"Test123!@#","role":"citizen"}'
```

### 2. Test Frontend

1. Visit your frontend URL
2. Sign up with a new account
3. Login with credentials
4. Report an incident
5. View incidents list
6. Check incident details

### 3. Test Email

1. Use "Forgot Password" feature
2. Check email for reset link
3. Verify email delivery

## Monitoring

### Backend Logs

**Render:**
- Dashboard → Your Service → Logs

**Railway:**
- Project → Service → Deployments → View Logs

### Frontend Logs

**Vercel:**
- Dashboard → Project → Deployments → View Function Logs

**Render:**
- Dashboard → Your Service → Logs

## Troubleshooting

### Backend Won't Start

1. Check environment variables are set
2. Verify MongoDB connection string
3. Check logs for errors
4. Ensure PORT is not in use

### Frontend Can't Connect to Backend

1. Verify NEXT_PUBLIC_API_URL is correct
2. Check CORS configuration in backend
3. Ensure backend is running
4. Check browser console for errors

### Database Connection Failed

1. Verify MongoDB URI is correct
2. Check IP whitelist in MongoDB Atlas
3. Verify database user credentials
4. Test connection with MongoDB Compass

### Email Not Sending

1. Verify EMAIL_USER and EMAIL_PASS
2. Check email service logs
3. For Gmail, ensure App Password is used
4. For SendGrid, verify API key is valid

## Backup and Maintenance

### Database Backup

**MongoDB Atlas:**
- Automatic backups enabled on paid tiers
- Manual export: Database → Collections → Export

**Local MongoDB:**
```bash
mongodump --db sahara-db --out ./backup
```

### Restore Database

```bash
mongorestore --db sahara-db ./backup/sahara-db
```

## Scaling Considerations

### When to Scale

- Response time > 2 seconds
- Database queries slow
- High CPU/memory usage
- Increased user traffic

### Scaling Options

1. **Vertical Scaling**: Upgrade instance size
2. **Horizontal Scaling**: Add more instances
3. **Database Scaling**: Upgrade MongoDB tier
4. **CDN**: Use Cloudflare for static assets
5. **Caching**: Implement Redis for sessions

## Support

For issues or questions:
1. Check logs for error messages
2. Review environment variables
3. Test API endpoints individually
4. Check database connectivity
5. Verify email configuration

---

**Deployment Checklist Complete! Your Sahara application is ready for production.**
