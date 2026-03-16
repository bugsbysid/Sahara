# Sahara - Stray Dog Bite Reporting & Emergency Response System

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

### 1. Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure Environment

**Backend** - Setup environment variables:

```bash
cd backend
npm run setup:env
# Then edit the created .env file with your values
```

**Required environment variables:**
```env
MONGODB_URI=your-mongodb-connection-string
JWT_SECRET=your-secret-key-min-32-characters  # Generate: openssl rand -base64 32
FRONTEND_URL=http://localhost:3000
PORT=5000
```

**Frontend** - Create `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### 3. Start Development

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

Visit http://localhost:3000

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
- **[Project Structure](PROJECT_STRUCTURE.md)** - Architecture overview
- **[Auth Setup](docs/AUTH_SETUP.md)** - Authentication configuration

## 🤝 Contributing

This project aims to save lives by improving emergency response to dog bite incidents. Contributions are welcome!

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details.

---

**Built with ❤️ to address India's stray dog crisis and prevent rabies deaths**
