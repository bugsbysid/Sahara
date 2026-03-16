# Project Structure - Sahara

This document outlines the structure of the Sahara dog bite reporting and emergency response system.

## 📁 Directory Structure

```
├── backend/
│   ├── src/
│   │   ├── config/          # Configuration files
│   │   │   ├── database.ts   # MongoDB connection
│   │   │   ├── index.ts      # Environment variables & config
│   │   │   └── passport.ts   # OAuth setup (optional)
│   │   ├── middleware/       # Express middleware
│   │   │   ├── auth.ts       # JWT authentication & role-based access
│   │   │   ├── errorHandler.ts
│   │   │   ├── rateLimiter.ts
│   │   │   └── notFound.ts
│   │   ├── models/          # Database models
│   │   │   ├── User.ts       # User schema (with roles)
│   │   │   ├── Incident.ts   # Dog bite incident reports (coming soon)
│   │   │   ├── Hospital.ts   # Hospital/clinic data (coming soon)
│   │   │   └── Vaccine.ts    # Vaccination records (coming soon)
│   │   ├── routes/          # API routes
│   │   │   ├── auth.ts       # Authentication routes
│   │   │   ├── incidents.ts  # Incident reporting (coming soon)
│   │   │   ├── hospitals.ts  # Hospital management (coming soon)
│   │   │   └── index.ts      # Route aggregator
│   │   ├── services/        # Business logic
│   │   │   ├── authService.ts
│   │   │   ├── emailService.ts
│   │   │   ├── tokenService.ts
│   │   │   ├── incidentService.ts (coming soon)
│   │   │   └── notificationService.ts (coming soon)
│   │   ├── validators/      # Input validation
│   │   │   ├── authValidator.ts
│   │   │   └── incidentValidator.ts (coming soon)
│   │   ├── types/           # TypeScript types
│   │   │   └── errors.ts    # Error type definitions
│   │   └── index.ts         # Server entry point
│   ├── env.example          # Environment variables template
│   └── package.json
│
├── frontend/
│   ├── app/                 # Next.js App Router
│   │   ├── page.tsx         # Landing page (problem statement & solution)
│   │   ├── login/           # Login page
│   │   ├── signup/          # Signup page (with role selection)
│   │   ├── home/            # Role-based dashboard
│   │   ├── profile/         # User profile page
│   │   ├── report/          # Incident reporting form (coming soon)
│   │   ├── incidents/       # Incident list & details (coming soon)
│   │   ├── map/             # Hotspot map view (coming soon)
│   │   ├── hospitals/       # Hospital finder (coming soon)
│   │   ├── vaccines/        # Vaccination tracking (coming soon)
│   │   ├── forgot-password/ # Password reset request
│   │   ├── reset-password/  # Password reset form
│   │   ├── auth/            # OAuth callback
│   │   └── layout.tsx       # Root layout
│   ├── components/          # React components
│   │   ├── ProtectedRoute.tsx
│   │   ├── ToastProvider.tsx
│   │   ├── RoleBasedRoute.tsx (coming soon)
│   │   └── ui/              # UI components
│   │       ├── Button.tsx
│   │       ├── Input.tsx
│   │       ├── PasswordInput.tsx
│   │       ├── Toast.tsx
│   │       ├── Map.tsx (coming soon)
│   │       └── IncidentCard.tsx (coming soon)
│   ├── contexts/            # React contexts
│   │   └── AuthContext.tsx  # Authentication state
│   ├── lib/                 # Utilities & API
│   │   ├── api-client.ts    # Axios instance
│   │   ├── auth-api.ts      # Auth API calls
│   │   ├── incident-api.ts  # Incident API calls (coming soon)
│   │   ├── hospital-api.ts  # Hospital API calls (coming soon)
│   │   └── auth-utils.ts    # Auth utilities
│   └── types/               # TypeScript types
│       ├── auth.ts          # Auth types
│       ├── incident.ts      # Incident types (coming soon)
│       ├── hospital.ts      # Hospital types (coming soon)
│       └── errors.ts        # Error types
│
├── docs/                    # Documentation
│   ├── AUTH_SETUP.md       # Authentication setup guide
│   └── PROBLEM_STATEMENT.md # Detailed problem analysis (coming soon)
│
├── README.md                # Main documentation
├── SETUP_GUIDE.md          # Setup instructions
└── PROJECT_STRUCTURE.md    # This file
```

## 🎯 Key Features by Module

### Authentication & User Management
- **Multi-role support**: Citizen, Hospital Staff, Animal Control, NGO, Authority
- **Secure authentication**: JWT tokens, password hashing
- **Profile management**: Update user information
- **Password recovery**: Email-based reset flow

### Incident Reporting (Coming Soon)
- **Quick reporting**: Citizens report dog bites with location
- **Photo upload**: Attach images of incident/injury
- **Real-time alerts**: Notify nearby hospitals and animal control
- **Status tracking**: Monitor incident resolution progress

### Hospital Management (Coming Soon)
- **Vaccine inventory**: Track anti-rabies vaccine availability
- **Patient records**: Manage vaccination schedules
- **Emergency alerts**: Receive nearby incident notifications
- **Reporting**: Generate statistics for authorities

### Analytics & Mapping (Coming Soon)
- **Hotspot identification**: Map high-incident areas
- **Trend analysis**: Track patterns over time
- **Resource allocation**: Optimize vaccine distribution
- **Impact metrics**: Measure response times and outcomes

## 🔐 User Roles & Permissions

### 1. Citizen
- Report dog bite incidents
- View own incident history
- Find nearby hospitals
- Track vaccination schedule
- View public hotspot maps

### 2. Hospital Staff
- View assigned incidents
- Update patient records
- Manage vaccine inventory
- Mark incidents as treated
- Generate reports

### 3. Animal Control
- View all incidents in jurisdiction
- Track stray dog populations
- Plan sterilization drives
- Update incident status
- Coordinate with NGOs

### 4. NGO Worker
- View incidents requiring support
- Track rescue operations
- Coordinate with hospitals
- Manage rehabilitation cases
- Report stray dog sightings

### 5. Authority (Admin)
- View all system data
- Generate analytics reports
- Manage user accounts
- Configure system settings
- Export data for policy making

## 🚀 Application Flow

### For Citizens:
1. **Sign Up** → Select "Citizen" role
2. **Report Incident** → Fill form with location, details, photos
3. **Get Alerts** → Receive nearby hospital info and directions
4. **Track Vaccination** → Follow-up reminders and schedule
5. **View Map** → Check stray dog hotspots in area

### For Hospital Staff:
1. **Sign Up** → Select "Hospital Staff" role, verify credentials
2. **Receive Alerts** → Get notified of nearby incidents
3. **Manage Cases** → Update patient treatment status
4. **Track Inventory** → Monitor vaccine stock levels
5. **Generate Reports** → Submit data to health authorities

### For Animal Control:
1. **Sign Up** → Select "Animal Control" role, verify credentials
2. **Monitor Incidents** → View all reports in jurisdiction
3. **Plan Interventions** → Identify hotspots for action
4. **Coordinate Drives** → Schedule sterilization/vaccination
5. **Update Status** → Mark areas as addressed

## 📊 Data Models

### User
- Basic info (name, email, phone)
- Role (citizen, hospital, animal_control, ngo, authority)
- Location/jurisdiction
- Verification status

### Incident (Coming Soon)
- Reporter details
- Location (GPS coordinates)
- Incident time
- Severity level
- Photos/evidence
- Status (reported, assigned, treated, closed)
- Assigned hospital/staff

### Hospital (Coming Soon)
- Name and location
- Contact information
- Vaccine availability
- Operating hours
- Staff members

### Vaccination Record (Coming Soon)
- Patient details
- Incident reference
- Vaccine doses (schedule)
- Follow-up dates
- Completion status

## 🔧 Technical Architecture

### Backend
- **Clean Architecture**: Separation of concerns
- **Type Safety**: Full TypeScript support
- **Error Handling**: Centralized middleware
- **Validation**: Input validation for all endpoints
- **Security**: JWT auth, role-based access control
- **Scalability**: Modular design for easy expansion

### Frontend
- **Modern Stack**: Next.js 16 App Router, React 19
- **Responsive Design**: Mobile-first approach
- **Real-time Updates**: WebSocket support (planned)
- **Offline Support**: PWA capabilities (planned)
- **Accessibility**: WCAG compliant components

## 📝 Code Quality Standards

- ✅ TypeScript strict mode
- ✅ Consistent code style
- ✅ Comprehensive error handling
- ✅ Input validation and sanitization
- ✅ Security best practices
- ✅ Clean, documented code
- ✅ Reusable components
- ✅ Separation of concerns

## 🎯 Development Roadmap

### Phase 1: Foundation (Current)
- ✅ User authentication system
- ✅ Role-based access control
- ✅ Basic profile management
- ✅ Project structure and documentation

### Phase 2: Core Features (Next)
- 🔄 Incident reporting system
- 🔄 Hospital management module
- 🔄 Real-time notifications
- 🔄 Location services integration

### Phase 3: Analytics & Optimization
- 📋 Hotspot mapping and visualization
- 📋 Analytics dashboard
- 📋 Reporting and insights
- 📋 Performance optimization

### Phase 4: Advanced Features
- 📋 Mobile app (React Native)
- 📋 SMS/WhatsApp integration
- 📋 AI-powered predictions
- 📋 Multi-language support

---

**This structure is designed to scale and address India's stray dog crisis effectively.**

