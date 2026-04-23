# 🐕 Dog Feeding Management System - Design Document

**Project:** Sahara Extension - Dog Feeding Module  
**Date:** March 22, 2026  
**Version:** 1.0.0  
**Status:** Design Phase

---

## Executive Summary

A location-based dog feeding management system that extends Sahara's existing infrastructure to track and manage stray dog feeding activities. The system uses biometric verification (paw pictures), location-based feeder assignment, and anomaly detection to ensure consistent care for stray dogs.

### Key Features
- 🔐 Multi-role authentication (Feeder, Admin)
- 📍 Location-based feeder assignment
- 🐾 Biometric dog identification (paw pictures)
- 📸 Photo upload during feeding
- ⏰ Feeding time tracking and updates
- 🚨 Anomaly detection (missed feedings, irregular activity)
- 👤 Dog profiles with images and details
- 🔗 Feeder-dog linkage by locality
- 📊 Admin dashboard for management

---

## Table of Contents

1. System Architecture
2. Database Models
3. API Endpoints
4. User Roles & Permissions
5. Features & Workflows
6. Biometric Verification
7. Anomaly Detection
8. Location-Based Assignment
9. Frontend Pages
10. Integration with Existing Sahara
11. Implementation Plan
12. Security Considerations



---

## 1. System Architecture

### 1.1 Technology Stack (Extends Existing Sahara)

**Backend:**
- Express.js + TypeScript (existing)
- MongoDB + Mongoose (existing)
- JWT Authentication (existing)
- Image Processing: Sharp, TensorFlow.js (new)
- Cloud Storage: AWS S3 / Cloudinary (new)

**Frontend:**
- Next.js 16 + React 19 (existing)
- Tailwind CSS v4 (existing)
- Camera integration for photo capture (new)
- Geolocation API (existing)

**New Services:**
- Image recognition service for paw biometrics
- Anomaly detection service
- Notification service (email/SMS)

### 1.2 System Components

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (Next.js)                       │
├─────────────────────────────────────────────────────────────┤
│  Feeder App  │  Admin Dashboard  │  Dog Profiles  │  Maps   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   API Gateway (Express.js)                   │
├─────────────────────────────────────────────────────────────┤
│  Auth  │  Feeding  │  Dogs  │  Feeders  │  Anomaly  │ Admin │
└─────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
┌──────────────┐  ┌──────────────────┐  ┌──────────────┐
│   MongoDB    │  │  Image Storage   │  │  ML Service  │
│   Database   │  │  (S3/Cloudinary) │  │  (Biometric) │
└──────────────┘  └──────────────────┘  └──────────────┘
```



---

## 2. Database Models

### 2.1 Dog Model

```typescript
interface IDog {
  // Basic Information
  dogId: string;                    // Unique identifier
  name?: string;                    // Optional name
  tagNumber?: string;               // Physical tag if available
  
  // Physical Characteristics
  breed?: string;
  color: string;
  size: 'small' | 'medium' | 'large';
  age?: number;                     // Estimated age
  gender?: 'male' | 'female';
  
  // Biometric Data
  pawPrints: {
    imageUrl: string;               // S3/Cloudinary URL
    features: number[];             // ML feature vector
    capturedAt: Date;
    capturedBy: ObjectId;           // Feeder who captured
  }[];
  
  // Location
  primaryLocation: {
    type: 'Point';
    coordinates: [number, number];  // [longitude, latitude]
    address: string;
    locality: string;
    city: string;
    state: string;
  };
  
  // Health & Status
  healthStatus: 'healthy' | 'sick' | 'injured' | 'unknown';
  isVaccinated: boolean;
  vaccinationDate?: Date;
  isSterilized: boolean;
  sterilizationDate?: Date;
  specialNeeds?: string;
  
  // Feeding Information
  assignedFeeders: ObjectId[];      // Array of feeder IDs
  feedingSchedule: {
    morning: string;                // e.g., "08:00"
    evening: string;                // e.g., "18:00"
  };
  lastFedAt?: Date;
  lastFedBy?: ObjectId;
  
  // Photos & Documentation
  photos: {
    url: string;
    uploadedBy: ObjectId;
    uploadedAt: Date;
    type: 'profile' | 'feeding' | 'health';
  }[];
  
  // Behavior & Notes
  temperament?: 'friendly' | 'shy' | 'aggressive' | 'neutral';
  behaviorNotes?: string;
  
  // Status
  isActive: boolean;
  isAdopted: boolean;
  adoptionDate?: Date;
  
  // Metadata
  registeredBy: ObjectId;
  registeredAt: Date;
  lastUpdatedBy: ObjectId;
  updatedAt: Date;
}
```

### 2.2 Feeder Model (Extends User)

```typescript
interface IFeeder {
  // Inherits from User model
  userId: ObjectId;                 // Reference to User
  
  // Feeder-specific Information
  feederId: string;                 // Unique feeder ID
  role: 'feeder';                   // User role
  
  // Location Assignment
  assignedLocalities: {
    locality: string;
    city: string;
    state: string;
    coordinates: {
      type: 'Polygon';
      coordinates: number[][][];    // GeoJSON polygon
    };
  }[];
  
  // Assigned Dogs
  assignedDogs: ObjectId[];         // Array of dog IDs
  
  // Activity Tracking
  totalFeedings: number;
  lastFeedingAt?: Date;
  activeStatus: 'active' | 'inactive' | 'on_leave';
  
  // Verification
  isVerified: boolean;
  verifiedBy?: ObjectId;            // Admin who verified
  verifiedAt?: Date;
  
  // Contact & Availability
  phone: string;
  alternatePhone?: string;
  availableHours: {
    morning: boolean;
    afternoon: boolean;
    evening: boolean;
  };
  
  // Performance Metrics
  feedingStreak: number;            // Consecutive days
  missedFeedings: number;
  reliability: number;              // 0-100 score
  
  // Metadata
  joinedAt: Date;
  lastActiveAt: Date;
}
```



### 2.3 Feeding Record Model

```typescript
interface IFeedingRecord {
  // Basic Information
  recordId: string;
  dogId: ObjectId;
  feederId: ObjectId;
  
  // Feeding Details
  feedingTime: Date;
  scheduledTime: Date;              // Expected feeding time
  isOnTime: boolean;                // Within 30 min window
  
  // Location Verification
  location: {
    type: 'Point';
    coordinates: [number, number];
    address: string;
  };
  distanceFromDogLocation: number;  // In meters
  
  // Food Details
  foodType: 'dry' | 'wet' | 'mixed' | 'other';
  quantity: number;                 // In grams
  waterProvided: boolean;
  
  // Photo Documentation
  photos: {
    url: string;
    type: 'before' | 'during' | 'after' | 'paw';
    capturedAt: Date;
  }[];
  
  // Dog Condition
  dogCondition: {
    appetite: 'good' | 'poor' | 'none';
    activity: 'active' | 'lethargic' | 'normal';
    healthConcerns?: string;
  };
  
  // Verification
  pawVerified: boolean;             // Biometric match
  verificationScore?: number;       // 0-100
  
  // Notes
  notes?: string;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
}
```

### 2.4 Anomaly Model

```typescript
interface IAnomaly {
  // Identification
  anomalyId: string;
  type: 'missed_feeding' | 'late_feeding' | 'location_mismatch' | 
        'health_concern' | 'feeder_inactive' | 'irregular_pattern';
  
  // Related Entities
  dogId?: ObjectId;
  feederId?: ObjectId;
  feedingRecordId?: ObjectId;
  
  // Anomaly Details
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  detectedAt: Date;
  
  // Context
  expectedBehavior: string;
  actualBehavior: string;
  
  // Resolution
  status: 'open' | 'acknowledged' | 'resolved' | 'false_positive';
  acknowledgedBy?: ObjectId;
  acknowledgedAt?: Date;
  resolvedBy?: ObjectId;
  resolvedAt?: Date;
  resolutionNotes?: string;
  
  // Notifications
  notificationsSent: {
    recipient: ObjectId;
    type: 'email' | 'sms' | 'push';
    sentAt: Date;
  }[];
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
}
```



---

## 3. API Endpoints

### 3.1 Authentication & User Management

```
POST   /api/auth/register-feeder      # Register as feeder
POST   /api/auth/login                # Login (existing)
GET    /api/auth/me                   # Get current user (existing)
PUT    /api/auth/profile              # Update profile (existing)
```

### 3.2 Dog Management

```
POST   /api/dogs                      # Register new dog (feeder/admin)
GET    /api/dogs                      # List dogs (filtered by locality)
GET    /api/dogs/:id                  # Get dog details
PUT    /api/dogs/:id                  # Update dog information
DELETE /api/dogs/:id                  # Remove dog (admin only)
POST   /api/dogs/:id/photos           # Upload dog photos
POST   /api/dogs/:id/paw-print        # Upload paw print for biometric
GET    /api/dogs/:id/feeding-history  # Get feeding history
GET    /api/dogs/nearby               # Get dogs near location
```

### 3.3 Feeding Management

```
POST   /api/feedings                  # Record feeding activity
GET    /api/feedings                  # List feeding records
GET    /api/feedings/:id              # Get feeding details
PUT    /api/feedings/:id              # Update feeding record
POST   /api/feedings/verify-paw       # Verify dog by paw print
GET    /api/feedings/my-schedule      # Get feeder's schedule
GET    /api/feedings/upcoming         # Get upcoming feedings
```

### 3.4 Feeder Management

```
GET    /api/feeders                   # List feeders (admin)
GET    /api/feeders/:id               # Get feeder details
PUT    /api/feeders/:id               # Update feeder info
POST   /api/feeders/:id/assign-dogs   # Assign dogs to feeder (admin)
POST   /api/feeders/:id/assign-locality # Assign locality (admin)
GET    /api/feeders/:id/performance   # Get performance metrics
PUT    /api/feeders/:id/status        # Update active status
```

### 3.5 Anomaly Detection

```
GET    /api/anomalies                 # List anomalies (admin)
GET    /api/anomalies/:id             # Get anomaly details
PUT    /api/anomalies/:id/acknowledge # Acknowledge anomaly
PUT    /api/anomalies/:id/resolve     # Resolve anomaly
GET    /api/anomalies/dashboard       # Get anomaly dashboard
```

### 3.6 Admin Operations

```
GET    /api/admin/dashboard           # Admin dashboard stats
GET    /api/admin/feeders             # Manage feeders
GET    /api/admin/dogs                # Manage dogs
GET    /api/admin/analytics           # System analytics
POST   /api/admin/assign-feeder       # Auto-assign feeder
GET    /api/admin/reports             # Generate reports
```



---

## 4. User Roles & Permissions

### 4.1 Feeder Role

**Capabilities:**
- ✅ Register and create account
- ✅ View assigned dogs
- ✅ Record feeding activities
- ✅ Upload photos during feeding
- ✅ Update feeding time
- ✅ Upload paw prints for verification
- ✅ View feeding schedule
- ✅ Update dog condition notes
- ✅ View own performance metrics
- ❌ Cannot delete dogs
- ❌ Cannot assign other feeders
- ❌ Cannot access admin dashboard

**Permissions:**
```typescript
const feederPermissions = {
  dogs: {
    create: true,              // Can register new dogs
    read: 'assigned',          // Only assigned dogs
    update: 'assigned',        // Only assigned dogs
    delete: false,
  },
  feedings: {
    create: true,              // Can record feedings
    read: 'own',               // Only own feedings
    update: 'own',             // Only own feedings
    delete: false,
  },
  feeders: {
    read: 'self',              // Only own profile
    update: 'self',            // Only own profile
  },
  anomalies: {
    read: 'related',           // Only related to them
    acknowledge: true,
  },
};
```

### 4.2 Admin Role

**Capabilities:**
- ✅ Full system access
- ✅ Manage all feeders
- ✅ Manage all dogs
- ✅ Assign feeders to localities
- ✅ Assign dogs to feeders
- ✅ View all feeding records
- ✅ Manage anomalies
- ✅ Generate reports
- ✅ View analytics dashboard
- ✅ Verify feeders
- ✅ Delete records

**Permissions:**
```typescript
const adminPermissions = {
  dogs: {
    create: true,
    read: 'all',
    update: 'all',
    delete: true,
  },
  feedings: {
    create: true,
    read: 'all',
    update: 'all',
    delete: true,
  },
  feeders: {
    create: true,
    read: 'all',
    update: 'all',
    delete: true,
    verify: true,
    assign: true,
  },
  anomalies: {
    read: 'all',
    acknowledge: true,
    resolve: true,
    delete: true,
  },
  admin: {
    dashboard: true,
    analytics: true,
    reports: true,
  },
};
```



---

## 5. Features & Workflows

### 5.1 Feeder Registration Workflow

```
1. User visits registration page
2. Selects "Register as Feeder"
3. Fills registration form:
   - Name, email, password
   - Phone number
   - Location/locality
   - Available hours
   - Experience with dogs
4. Submits registration
5. System creates feeder account (pending verification)
6. Admin receives notification
7. Admin verifies feeder credentials
8. Feeder receives approval notification
9. Feeder can start feeding activities
```

### 5.2 Dog Registration Workflow

```
1. Feeder encounters new dog
2. Opens "Register Dog" form
3. Captures current location (GPS)
4. Takes photos of dog (multiple angles)
5. Takes paw print photo
6. Fills dog details:
   - Physical characteristics
   - Health status
   - Temperament
   - Location details
7. Submits registration
8. System processes paw print (ML feature extraction)
9. Dog profile created
10. Dog automatically assigned to feeder based on locality
```

### 5.3 Feeding Activity Workflow

```
1. Feeder opens app at feeding time
2. Views list of assigned dogs
3. Selects dog to feed
4. System verifies location (near dog's location)
5. Feeder feeds the dog
6. Takes photos during feeding
7. Optional: Takes paw print photo for verification
8. System runs biometric verification
9. Feeder updates:
   - Food type and quantity
   - Water provided
   - Dog condition (appetite, activity)
   - Notes
10. Submits feeding record
11. System updates dog's lastFedAt
12. System checks for anomalies
13. Feeder receives confirmation
```

### 5.4 Biometric Verification Workflow

```
1. Feeder captures paw print photo
2. Image uploaded to cloud storage
3. ML service extracts features:
   - Paw pad patterns
   - Toe arrangement
   - Size measurements
4. System compares with registered paw prints
5. Calculates similarity score
6. If score > 80%: Match confirmed
7. If score 60-80%: Possible match (manual review)
8. If score < 60%: No match
9. Result returned to app
10. Feeding record marked with verification status
```



---

## 6. Biometric Verification System

### 6.1 Paw Print Recognition

**Technology Stack:**
- TensorFlow.js / PyTorch for ML models
- OpenCV for image processing
- AWS Rekognition / Custom ML model

**Process:**

```typescript
interface PawPrintVerification {
  // Image Processing
  preprocessImage(image: Buffer): ProcessedImage {
    // 1. Resize to standard dimensions (224x224)
    // 2. Convert to grayscale
    // 3. Apply contrast enhancement
    // 4. Detect paw region (crop)
    // 5. Normalize lighting
    return processedImage;
  }
  
  // Feature Extraction
  extractFeatures(image: ProcessedImage): FeatureVector {
    // 1. Detect paw pads (main pad + toe pads)
    // 2. Measure pad sizes and distances
    // 3. Extract texture patterns
    // 4. Calculate pad angles
    // 5. Generate 128-dimensional feature vector
    return featureVector;
  }
  
  // Matching
  matchPawPrint(
    newFeatures: FeatureVector,
    registeredPrints: PawPrint[]
  ): MatchResult {
    // 1. Compare with all registered prints
    // 2. Calculate cosine similarity
    // 3. Find best match
    // 4. Return match score (0-100)
    return {
      matched: boolean,
      dogId: string,
      confidence: number,
      matchedPrintId: string,
    };
  }
}
```

**Accuracy Considerations:**
- Multiple paw prints per dog (front left, front right, etc.)
- Minimum 3 reference images for reliable matching
- Regular updates as dog grows
- Environmental factors (wet/dry, muddy)
- Fallback to visual confirmation by feeder

### 6.2 Alternative Identification Methods

**If paw print fails:**
1. **Visual Recognition:** Face/body pattern matching
2. **Tag Number:** Physical collar tag
3. **Location + Time:** Expected dog at location
4. **Feeder Confirmation:** Manual verification
5. **Unique Markings:** Scars, spots, distinctive features



---

## 7. Anomaly Detection System

### 7.1 Detection Rules

**Missed Feeding Detection:**
```typescript
// Check every hour
async function detectMissedFeedings() {
  const now = new Date();
  const dogs = await Dog.find({ isActive: true });
  
  for (const dog of dogs) {
    const lastFed = dog.lastFedAt;
    const schedule = dog.feedingSchedule;
    
    // Check morning feeding (8 AM)
    if (now.getHours() > 10 && 
        (!lastFed || !isSameDay(lastFed, now))) {
      createAnomaly({
        type: 'missed_feeding',
        dogId: dog._id,
        severity: 'high',
        description: `Dog ${dog.name} missed morning feeding`,
      });
    }
    
    // Check evening feeding (6 PM)
    if (now.getHours() > 20 && 
        (!lastFed || getHours(lastFed) < 18)) {
      createAnomaly({
        type: 'missed_feeding',
        dogId: dog._id,
        severity: 'high',
        description: `Dog ${dog.name} missed evening feeding`,
      });
    }
  }
}
```

**Late Feeding Detection:**
```typescript
async function detectLateFeedings() {
  const records = await FeedingRecord.find({
    feedingTime: { $gte: startOfDay(new Date()) },
  });
  
  for (const record of records) {
    const delay = differenceInMinutes(
      record.feedingTime,
      record.scheduledTime
    );
    
    if (delay > 30) {
      createAnomaly({
        type: 'late_feeding',
        feedingRecordId: record._id,
        severity: delay > 120 ? 'high' : 'medium',
        description: `Feeding delayed by ${delay} minutes`,
      });
    }
  }
}
```

**Feeder Inactivity Detection:**
```typescript
async function detectInactiveFeeders() {
  const feeders = await Feeder.find({ 
    activeStatus: 'active' 
  });
  
  for (const feeder of feeders) {
    const daysSinceLastFeeding = differenceInDays(
      new Date(),
      feeder.lastFeedingAt
    );
    
    if (daysSinceLastFeeding > 3) {
      createAnomaly({
        type: 'feeder_inactive',
        feederId: feeder._id,
        severity: daysSinceLastFeeding > 7 ? 'critical' : 'medium',
        description: `Feeder inactive for ${daysSinceLastFeeding} days`,
      });
    }
  }
}
```

**Health Concern Detection:**
```typescript
async function detectHealthConcerns() {
  const records = await FeedingRecord.find({
    createdAt: { $gte: startOfDay(new Date()) },
  });
  
  for (const record of records) {
    const condition = record.dogCondition;
    
    // Poor appetite for 2+ consecutive feedings
    if (condition.appetite === 'poor' || condition.appetite === 'none') {
      const recentRecords = await FeedingRecord.find({
        dogId: record.dogId,
        createdAt: { $gte: subDays(new Date(), 2) },
      });
      
      const poorAppetiteCount = recentRecords.filter(
        r => r.dogCondition.appetite !== 'good'
      ).length;
      
      if (poorAppetiteCount >= 2) {
        createAnomaly({
          type: 'health_concern',
          dogId: record.dogId,
          severity: 'high',
          description: 'Dog showing poor appetite for multiple feedings',
        });
      }
    }
    
    // Lethargic behavior
    if (condition.activity === 'lethargic') {
      createAnomaly({
        type: 'health_concern',
        dogId: record.dogId,
        severity: 'high',
        description: 'Dog showing lethargic behavior',
      });
    }
  }
}
```

### 7.2 Notification System

```typescript
async function sendAnomalyNotifications(anomaly: IAnomaly) {
  // Notify assigned feeders
  if (anomaly.dogId) {
    const dog = await Dog.findById(anomaly.dogId);
    const feeders = await Feeder.find({
      _id: { $in: dog.assignedFeeders },
    });
    
    for (const feeder of feeders) {
      await sendEmail({
        to: feeder.email,
        subject: `Alert: ${anomaly.description}`,
        template: 'anomaly-notification',
        data: { anomaly, dog, feeder },
      });
      
      await sendSMS({
        to: feeder.phone,
        message: `Alert: ${anomaly.description}`,
      });
    }
  }
  
  // Notify admins for critical anomalies
  if (anomaly.severity === 'critical') {
    const admins = await User.find({ role: 'admin' });
    
    for (const admin of admins) {
      await sendEmail({
        to: admin.email,
        subject: `Critical Alert: ${anomaly.description}`,
        template: 'critical-anomaly',
        data: { anomaly },
      });
    }
  }
}
```

