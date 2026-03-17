# Sahara - Stray Dog Bite Reporting & Emergency Response System

> **New to this project?** Start with [START_HERE.md](START_HERE.md) for a guided introduction!

A unified platform addressing India's stray dog crisis by streamlining dog bite reporting, emergency response coordination, and rabies prevention.

## 🚨 Problem Statement

India's stray dog crisis is worsening with **26.7 lakh dog bite cases in 2025**, driven by:
- **Fragmented reporting systems** causing delayed emergency response
- **Poor coordination** between hospitals, animal control, and authorities
- **Preventable rabies deaths** despite available vaccines

## 💡 Solution

Sahara provides a centralized platform that:
- ✅ **Instant Reporting** - Citizens can report dog bites immediately via web/mobile
- ✅ **Emergency Response** - Real-time alerts to nearby hospitals and animal control
- ✅ **Vaccine Tracking** - Monitor rabies vaccination status and follow-ups
- ✅ **Data Analytics** - Identify hotspots and patterns for preventive action
- ✅ **Multi-stakeholder Coordination** - Connect citizens, hospitals, NGOs, and authorities

## ✨ Key Features

### For Citizens
- 🆘 Quick dog bite incident reporting with location
- 📍 Find nearest hospitals with anti-rabies vaccines
- 📱 Track vaccination schedule and reminders
- 📊 View stray dog hotspot maps in their area

### For Hospitals
- 🏥 Receive real-time bite incident alerts
- 💉 Manage vaccine inventory and availability
- 📋 Track patient vaccination records
- 📈 Generate reports for health authorities

### For Animal Control & NGOs
- 🐕 Track stray dog populations and locations
- 🎯 Prioritize sterilization and vaccination drives
- 📍 Map high-incident areas for intervention
- 🤝 Coordinate with hospitals and authorities

### For Authorities
- 📊 Real-time dashboard of incidents across regions
- 🗺️ Identify hotspots requiring immediate action
- 📈 Track response times and outcomes
- 📋 Generate policy reports and insights

## 🛠️ Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4
- **Backend**: Express.js, TypeScript, MongoDB (Mongoose)
- **Auth**: JWT, bcrypt, role-based access control
- **Maps**: Integration-ready for location services
- **Notifications**: Real-time alerts system

## 🚀 Quick Start

> **Ready to Deploy?** See [READY_TO_DEPLOY.md](READY_TO_DEPLOY.md) for production deployment!

### Prerequisites
- Node.js 18+ and npm
- MongoDB (local or Atlas account)

### 1. Clone and Install

```bash
git clone <repository-url>
cd Sahara

# Install all dependencies
cd backend && npm install
cd ../frontend && npm install
```

### 2. Configure Environment

**Backend** - Create `.env` file:

```bash
cd backend
cp env.example .env
```

Edit `backend/.env` with your values:
```env
MONGODB_URI=mongodb://localhost:27017/sahara-db
JWT_SECRET=<generate-with-openssl-rand-base64-32>
FRONTEND_URL=http://localhost:3000
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password
```

**Frontend** - Create `.env.local` file:

```bash
cd frontend
cp .env.local.example .env.local
```

The default values should work for local development.

### 3. Start Development Servers

```bash
# Terminal 1 - Backend (from Sahara/backend)
npm run dev

# Terminal 2 - Frontend (from Sahara/frontend)
npm run dev
```

Visit http://localhost:3000

### 4. First Steps
1. Sign up with a new account (choose your role)
2. Login with your credentials
3. Explore the dashboard
4. Report a test incident (GPS location required)

For detailed setup instructions, see [SETUP_GUIDE.md](SETUP_GUIDE.md)

For deployment instructions, see [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)

## 📁 Project Structure

```
├── frontend/
│   ├── app/              # Next.js App Router
│   │   ├── page.tsx      # Landing page
│   │   ├── login/        # Login page
│   │   ├── signup/       # Signup page
│   │   ├── home/         # Dashboard (role-based)
│   │   ├── profile/      # User profile
│   │   ├── report/       # Incident reporting (coming soon)
│   │   └── map/          # Hotspot map (coming soon)
│   ├── components/        # Reusable components
│   ├── contexts/          # React contexts
│   ├── lib/              # Utilities & API
│   └── types/            # TypeScript types
│
└── backend/
    └── src/
        ├── models/       # Database models (User, Incident, Hospital, etc.)
        ├── routes/       # API routes
        ├── services/     # Business logic
        ├── middleware/   # Express middleware
        ├── config/       # Configuration
        └── validators/   # Input validation
```

## 🎯 User Roles

1. **Citizen** - Report incidents, track vaccinations
2. **Hospital Staff** - Manage cases, vaccine inventory
3. **Animal Control** - Track stray dogs, coordinate drives
4. **NGO Worker** - Support rescue and rehabilitation
5. **Authority** - Monitor and analyze data

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register user with role
- `POST /api/auth/login` - Login user
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password
- `GET /api/auth/me` - Get current user (protected)
- `PUT /api/auth/profile` - Update user profile

### Incidents (Coming Soon)
- `POST /api/incidents` - Report dog bite incident
- `GET /api/incidents` - List incidents (role-based)
- `GET /api/incidents/:id` - Get incident details
- `PUT /api/incidents/:id` - Update incident status

### Hospitals (Coming Soon)
- `GET /api/hospitals/nearby` - Find nearby hospitals
- `GET /api/hospitals/:id/vaccines` - Check vaccine availability

## 📊 Impact Metrics (Target)

- ⚡ **50% reduction** in emergency response time
- 💉 **80% increase** in timely rabies vaccination
- 📍 **100% coverage** of incident reporting
- 🎯 **60% reduction** in repeat incidents through targeted interventions

## 📚 Documentation

- **[Setup Guide](SETUP_GUIDE.md)** - Complete setup instructions
- **[Deployment Guide](DEPLOYMENT_GUIDE.md)** - Production deployment steps
- **[Deployment Checklist](PRODUCTION_DEPLOYMENT_CHECKLIST.md)** - Step-by-step deployment checklist
- **[Production Ready](PRODUCTION_READY.md)** - Production readiness verification
- **[Project Structure](PROJECT_STRUCTURE.md)** - Architecture overview
- **[Current Status](CURRENT_STATUS.md)** - Development progress
- **[Problem Statement](docs/PROBLEM_STATEMENT.md)** - Detailed problem analysis

## 🛠️ Development Scripts

**Backend:**
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server

**Frontend:**
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server

**Quick Start:**
- `./start-dev.sh` (Linux/Mac) or `start-dev.bat` (Windows) - Start both servers

## 🤝 Contributing

This project aims to save lives by improving emergency response to dog bite incidents. Contributions are welcome!

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details.

---

**Built with ❤️ to address India's stray dog crisis and prevent rabies deaths**
