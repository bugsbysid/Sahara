# Sahara - Tech Stack Documentation

## Project Overview
**Sahara** is a dog bite reporting and emergency response system built with modern web technologies.

---

## Frontend Stack

### Core Framework
- **Next.js 16.0.5** - React framework with App Router
- **React 19.2.0** - UI library
- **TypeScript 5.x** - Type-safe JavaScript

### Styling
- **Tailwind CSS 4.x** - Utility-first CSS framework
- **PostCSS** - CSS processing

### HTTP & State Management
- **Axios 1.6.5** - HTTP client for API requests
- **js-cookie 3.0.5** - Cookie management for authentication

### Development Tools
- **ESLint 9.x** - Code linting
- **Next.js ESLint Config** - Next.js-specific linting rules

### Requirements
- Node.js >= 20.9.0
- npm >= 9.0.0

---

## Backend Stack

### Core Framework
- **Express 4.18.2** - Web application framework
- **Node.js** - JavaScript runtime
- **TypeScript 5.3.3** - Type-safe JavaScript

### Database
- **MongoDB** - NoSQL database
- **Mongoose 8.0.3** - MongoDB ODM (Object Data Modeling)

### Authentication & Security
- **Passport 0.7.0** - Authentication middleware
- **passport-google-oauth20 2.0.0** - Google OAuth strategy
- **bcryptjs 2.4.3** - Password hashing
- **jsonwebtoken 9.0.2** - JWT token generation/verification
- **express-session 1.18.0** - Session management
- **connect-mongo 5.1.0** - MongoDB session store
- **Helmet 8.1.0** - Security headers middleware

### API & Middleware
- **CORS 2.8.5** - Cross-Origin Resource Sharing
- **express-rate-limit 7.5.1** - Rate limiting for API protection
- **dotenv 16.3.1** - Environment variable management

### Email Services
- **Nodemailer 6.9.7** - Email sending (SMTP)
- **@sendgrid/mail 8.1.6** - SendGrid API integration

### Development Tools
- **tsx 4.7.0** - TypeScript execution and hot reload
- **ESLint 8.56.0** - Code linting
- **@typescript-eslint** - TypeScript-specific linting

### Requirements
- Node.js >= 18.0.0
- npm >= 9.0.0

---

## Architecture

### Frontend Architecture
```
Next.js App Router
├── app/                    # Pages and routes
│   ├── page.tsx           # Landing page
│   ├── login/             # Authentication pages
│   ├── signup/
│   ├── home/              # Dashboard
│   ├── report/            # Incident reporting
│   ├── incidents/         # Incident management
│   └── profile/           # User profile
├── components/            # Reusable components
│   ├── ui/               # UI components
│   └── ProtectedRoute.tsx
└── lib/                   # Utilities
    ├── api-client.ts     # API configuration
    ├── auth-api.ts       # Auth endpoints
    └── incident-api.ts   # Incident endpoints
```

### Backend Architecture
```
Express REST API
├── src/
│   ├── config/           # Configuration
│   │   ├── database.ts   # MongoDB connection
│   │   ├── passport.ts   # Auth strategies
│   │   └── index.ts      # Environment config
│   ├── models/           # Mongoose models
│   │   ├── User.ts
│   │   ├── Incident.ts
│   │   └── Hospital.ts
│   ├── routes/           # API routes
│   │   ├── auth.ts       # /api/auth/*
│   │   └── incidents.ts  # /api/incidents/*
│   ├── services/         # Business logic
│   │   ├── authService.ts
│   │   ├── incidentService.ts
│   │   ├── emailService.ts
│   │   └── tokenService.ts
│   ├── middleware/       # Express middleware
│   │   ├── auth.ts       # JWT verification
│   │   ├── errorHandler.ts
│   │   └── rateLimiter.ts
│   ├── validators/       # Input validation
│   └── utils/           # Utilities
│       └── logger.ts    # Logging system
└── index.ts             # Entry point
```

---

## Key Features Implemented

### Authentication
- JWT-based authentication
- Google OAuth 2.0 integration
- Password reset via email
- Session management with MongoDB store
- Secure password hashing with bcrypt

### Security
- Helmet for security headers
- CORS configuration
- Rate limiting on API endpoints
- Request ID tracking
- Input validation
- Environment variable validation

### Email System
- Nodemailer for SMTP
- SendGrid API support
- Password reset emails
- Welcome emails
- Configurable email templates

### Database
- MongoDB with Mongoose ODM
- User management
- Incident reporting and tracking
- Hospital/clinic database
- Vaccination records
- Geospatial queries for nearby hospitals

### API Features
- RESTful API design
- Error handling middleware
- Request logging
- Health check endpoints
- Graceful shutdown handling

---

## Development Tools

### Backend
- **tsx** - Fast TypeScript execution with hot reload
- **TypeScript** - Static type checking
- **ESLint** - Code quality and consistency

### Frontend
- **Next.js Dev Server** - Hot module replacement
- **TypeScript** - Type safety
- **Tailwind CSS** - Rapid UI development
- **ESLint** - Code quality

---

## Deployment Ready

### Backend
- Production build with TypeScript compilation
- Environment-based configuration
- MongoDB session store for production
- Graceful shutdown handling
- Health check endpoints
- Error logging and monitoring

### Frontend
- Next.js production build
- Static optimization
- Image optimization
- Code splitting
- SEO-friendly

---

## Environment Variables

### Backend (.env)
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/sahara-db
JWT_SECRET=your-secret-key
FRONTEND_URL=http://localhost:3000
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
GOOGLE_CLIENT_ID=optional
GOOGLE_CLIENT_SECRET=optional
```

### Frontend
```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

---

## Performance Features

- Connection pooling (MongoDB)
- Session caching (MongoDB store)
- Rate limiting to prevent abuse
- Efficient database queries with indexes
- Optimized Next.js builds
- Image optimization
- Code splitting

---

## Code Quality

- **TypeScript** throughout for type safety
- **ESLint** for code consistency
- **Error boundaries** in React
- **Comprehensive error handling** in Express
- **Input validation** on all endpoints
- **Logging system** for debugging

---

## Summary

**Modern Full-Stack Application**
- Frontend: Next.js 16 + React 19 + TypeScript + Tailwind CSS
- Backend: Express + TypeScript + MongoDB + Mongoose
- Auth: JWT + Passport + Google OAuth
- Security: Helmet + CORS + Rate Limiting
- Email: Nodemailer + SendGrid
- Production-ready with comprehensive error handling and logging

**Total Dependencies**: 40+ packages
**Lines of Code**: ~6,124 lines
**Files**: 85+ TypeScript files
**Status**: Production Ready ✅
