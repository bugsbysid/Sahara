# Dog Feeding System - Implementation Guide

## Phase 1: Backend Implementation (Week 1-2)

### Step 1: Database Models (2 days)

Create new models in `backend/src/models/`:

**1. Dog.ts**
```typescript
import mongoose, { Document, Schema } from 'mongoose';

export interface IDog extends Document {
  dogId: string;
  name?: string;
  tagNumber?: string;
  breed?: string;
  color: string;
  size: 'small' | 'medium' | 'large';
  age?: number;
  gender?: 'male' | 'female';
  
  pawPrints: {
    imageUrl: string;
    features: number[];
    capturedAt: Date;
    capturedBy: mongoose.Types.ObjectId;
  }[];
  
  primaryLocation: {
    type: string;
    coordinates: [number, number];
    address: string;
    locality: string;
    city: string;
    state: string;
  };
  
  healthStatus: 'healthy' | 'sick' | 'injured' | 'unknown';
  isVaccinated: boolean;
  vaccinationDate?: Date;
  isSterilized: boolean;
  sterilizationDate?: Date;
  
  assignedFeeders: mongoose.Types.ObjectId[];
  feedingSchedule: {
    morning: string;
    evening: string;
  };
  lastFedAt?: Date;
  lastFedBy?: mongoose.Types.ObjectId;
  
  photos: {
    url: string;
    uploadedBy: mongoose.Types.ObjectId;
    uploadedAt: Date;
    type: 'profile' | 'feeding' | 'health';
  }[];
  
  temperament?: 'friendly' | 'shy' | 'aggressive' | 'neutral';
  behaviorNotes?: string;
  isActive: boolean;
  
  registeredBy: mongoose.Types.ObjectId;
  registeredAt: Date;
}

const DogSchema = new Schema<IDog>({
  dogId: { type: String, required: true, unique: true },
  name: String,
  tagNumber: String,
  breed: String,
  color: { type: String, required: true },
  size: { type: String, enum: ['small', 'medium', 'large'], required: true },
  age: Number,
  gender: { type: String, enum: ['male', 'female'] },
  
  pawPrints: [{
    imageUrl: { type: String, required: true },
    features: [Number],
    capturedAt: { type: Date, default: Date.now },
    capturedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  }],
  
  primaryLocation: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true },
    address: { type: String, required: true },
    locality: { type: String, required: true, index: true },
    city: { type: String, required: true, index: true },
    state: { type: String, required: true },
  },
  
  healthStatus: { 
    type: String, 
    enum: ['healthy', 'sick', 'injured', 'unknown'],
    default: 'unknown'
  },
  isVaccinated: { type: Boolean, default: false },
  vaccinationDate: Date,
  isSterilized: { type: Boolean, default: false },
  sterilizationDate: Date,
  
  assignedFeeders: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  feedingSchedule: {
    morning: { type: String, default: '08:00' },
    evening: { type: String, default: '18:00' },
  },
  lastFedAt: Date,
  lastFedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  
  photos: [{
    url: String,
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    uploadedAt: { type: Date, default: Date.now },
    type: { type: String, enum: ['profile', 'feeding', 'health'] },
  }],
  
  temperament: { type: String, enum: ['friendly', 'shy', 'aggressive', 'neutral'] },
  behaviorNotes: String,
  isActive: { type: Boolean, default: true },
  
  registeredBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  registeredAt: { type: Date, default: Date.now },
}, { timestamps: true });

// Geospatial index
DogSchema.index({ 'primaryLocation.coordinates': '2dsphere' });
DogSchema.index({ locality: 1, isActive: 1 });

export default mongoose.model<IDog>('Dog', DogSchema);
```



**2. FeedingRecord.ts**
```typescript
import mongoose, { Document, Schema } from 'mongoose';

export interface IFeedingRecord extends Document {
  recordId: string;
  dogId: mongoose.Types.ObjectId;
  feederId: mongoose.Types.ObjectId;
  feedingTime: Date;
  scheduledTime: Date;
  isOnTime: boolean;
  
  location: {
    type: string;
    coordinates: [number, number];
    address: string;
  };
  distanceFromDogLocation: number;
  
  foodType: 'dry' | 'wet' | 'mixed' | 'other';
  quantity: number;
  waterProvided: boolean;
  
  photos: {
    url: string;
    type: 'before' | 'during' | 'after' | 'paw';
    capturedAt: Date;
  }[];
  
  dogCondition: {
    appetite: 'good' | 'poor' | 'none';
    activity: 'active' | 'lethargic' | 'normal';
    healthConcerns?: string;
  };
  
  pawVerified: boolean;
  verificationScore?: number;
  notes?: string;
}

const FeedingRecordSchema = new Schema<IFeedingRecord>({
  recordId: { type: String, required: true, unique: true },
  dogId: { type: Schema.Types.ObjectId, ref: 'Dog', required: true, index: true },
  feederId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  feedingTime: { type: Date, required: true, default: Date.now },
  scheduledTime: { type: Date, required: true },
  isOnTime: { type: Boolean, default: true },
  
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true },
    address: String,
  },
  distanceFromDogLocation: { type: Number, default: 0 },
  
  foodType: { type: String, enum: ['dry', 'wet', 'mixed', 'other'], required: true },
  quantity: { type: Number, required: true },
  waterProvided: { type: Boolean, default: true },
  
  photos: [{
    url: { type: String, required: true },
    type: { type: String, enum: ['before', 'during', 'after', 'paw'] },
    capturedAt: { type: Date, default: Date.now },
  }],
  
  dogCondition: {
    appetite: { type: String, enum: ['good', 'poor', 'none'], default: 'good' },
    activity: { type: String, enum: ['active', 'lethargic', 'normal'], default: 'normal' },
    healthConcerns: String,
  },
  
  pawVerified: { type: Boolean, default: false },
  verificationScore: Number,
  notes: String,
}, { timestamps: true });

FeedingRecordSchema.index({ feedingTime: -1 });
FeedingRecordSchema.index({ dogId: 1, feedingTime: -1 });

export default mongoose.model<IFeedingRecord>('FeedingRecord', FeedingRecordSchema);
```



**3. Anomaly.ts**
```typescript
import mongoose, { Document, Schema } from 'mongoose';

export interface IAnomaly extends Document {
  anomalyId: string;
  type: 'missed_feeding' | 'late_feeding' | 'location_mismatch' | 
        'health_concern' | 'feeder_inactive' | 'irregular_pattern';
  dogId?: mongoose.Types.ObjectId;
  feederId?: mongoose.Types.ObjectId;
  feedingRecordId?: mongoose.Types.ObjectId;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  detectedAt: Date;
  expectedBehavior: string;
  actualBehavior: string;
  status: 'open' | 'acknowledged' | 'resolved' | 'false_positive';
  acknowledgedBy?: mongoose.Types.ObjectId;
  acknowledgedAt?: Date;
  resolvedBy?: mongoose.Types.ObjectId;
  resolvedAt?: Date;
  resolutionNotes?: string;
}

const AnomalySchema = new Schema<IAnomaly>({
  anomalyId: { type: String, required: true, unique: true },
  type: { 
    type: String, 
    enum: ['missed_feeding', 'late_feeding', 'location_mismatch', 
           'health_concern', 'feeder_inactive', 'irregular_pattern'],
    required: true,
    index: true,
  },
  dogId: { type: Schema.Types.ObjectId, ref: 'Dog', index: true },
  feederId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
  feedingRecordId: { type: Schema.Types.ObjectId, ref: 'FeedingRecord' },
  severity: { 
    type: String, 
    enum: ['low', 'medium', 'high', 'critical'],
    required: true,
    index: true,
  },
  description: { type: String, required: true },
  detectedAt: { type: Date, default: Date.now, index: true },
  expectedBehavior: String,
  actualBehavior: String,
  status: { 
    type: String, 
    enum: ['open', 'acknowledged', 'resolved', 'false_positive'],
    default: 'open',
    index: true,
  },
  acknowledgedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  acknowledgedAt: Date,
  resolvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  resolvedAt: Date,
  resolutionNotes: String,
}, { timestamps: true });

AnomalySchema.index({ status: 1, severity: -1, detectedAt: -1 });

export default mongoose.model<IAnomaly>('Anomaly', AnomalySchema);
```



### Step 2: Update User Model (1 day)

Extend existing `User.ts` to support feeder role:

```typescript
// Add to existing User model
export type UserRole = 'citizen' | 'hospital' | 'animal_control' | 'ngo' | 'authority' | 'feeder';

// Add feeder-specific fields
interface IUser extends Document {
  // ... existing fields ...
  
  // Feeder-specific fields
  feederId?: string;
  assignedLocalities?: {
    locality: string;
    city: string;
    state: string;
  }[];
  assignedDogs?: mongoose.Types.ObjectId[];
  totalFeedings?: number;
  lastFeedingAt?: Date;
  activeStatus?: 'active' | 'inactive' | 'on_leave';
  availableHours?: {
    morning: boolean;
    afternoon: boolean;
    evening: boolean;
  };
  feedingStreak?: number;
  missedFeedings?: number;
  reliability?: number;
}

// Update schema
const UserSchema = new Schema<IUser>({
  // ... existing fields ...
  
  role: {
    type: String,
    enum: ['citizen', 'hospital', 'animal_control', 'ngo', 'authority', 'feeder'],
    default: 'citizen',
    required: true,
  },
  
  // Feeder fields
  feederId: { type: String, sparse: true, unique: true },
  assignedLocalities: [{
    locality: String,
    city: String,
    state: String,
  }],
  assignedDogs: [{ type: Schema.Types.ObjectId, ref: 'Dog' }],
  totalFeedings: { type: Number, default: 0 },
  lastFeedingAt: Date,
  activeStatus: { 
    type: String, 
    enum: ['active', 'inactive', 'on_leave'],
    default: 'active',
  },
  availableHours: {
    morning: { type: Boolean, default: true },
    afternoon: { type: Boolean, default: false },
    evening: { type: Boolean, default: true },
  },
  feedingStreak: { type: Number, default: 0 },
  missedFeedings: { type: Number, default: 0 },
  reliability: { type: Number, default: 100, min: 0, max: 100 },
});
```



### Step 3: API Routes (3 days)

Create new route files in `backend/src/routes/`:

**1. dogs.ts**
```typescript
import express from 'express';
import { authenticate, authorize } from '../middleware/auth';
import * as dogController from '../controllers/dogController';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Dog management
router.post('/', authorize(['feeder', 'admin']), dogController.registerDog);
router.get('/', dogController.listDogs);
router.get('/nearby', dogController.getNearbyDogs);
router.get('/:id', dogController.getDogDetails);
router.put('/:id', authorize(['feeder', 'admin']), dogController.updateDog);
router.delete('/:id', authorize(['admin']), dogController.deleteDog);

// Photo management
router.post('/:id/photos', authorize(['feeder', 'admin']), dogController.uploadPhotos);
router.post('/:id/paw-print', authorize(['feeder', 'admin']), dogController.uploadPawPrint);

// Feeding history
router.get('/:id/feeding-history', dogController.getFeedingHistory);

export default router;
```

**2. feedings.ts**
```typescript
import express from 'express';
import { authenticate, authorize } from '../middleware/auth';
import * as feedingController from '../controllers/feedingController';

const router = express.Router();

router.use(authenticate);

// Feeding records
router.post('/', authorize(['feeder']), feedingController.recordFeeding);
router.get('/', feedingController.listFeedings);
router.get('/my-schedule', authorize(['feeder']), feedingController.getMySchedule);
router.get('/upcoming', authorize(['feeder']), feedingController.getUpcomingFeedings);
router.get('/:id', feedingController.getFeedingDetails);
router.put('/:id', authorize(['feeder', 'admin']), feedingController.updateFeeding);

// Biometric verification
router.post('/verify-paw', authorize(['feeder']), feedingController.verifyPawPrint);

export default router;
```

**3. feeders.ts**
```typescript
import express from 'express';
import { authenticate, authorize } from '../middleware/auth';
import * as feederController from '../controllers/feederController';

const router = express.Router();

router.use(authenticate);

// Feeder management (admin only)
router.get('/', authorize(['admin']), feederController.listFeeders);
router.get('/:id', feederController.getFeederDetails);
router.put('/:id', authorize(['admin']), feederController.updateFeeder);
router.post('/:id/assign-dogs', authorize(['admin']), feederController.assignDogs);
router.post('/:id/assign-locality', authorize(['admin']), feederController.assignLocality);
router.get('/:id/performance', feederController.getPerformanceMetrics);
router.put('/:id/status', authorize(['admin']), feederController.updateStatus);

export default router;
```

**4. anomalies.ts**
```typescript
import express from 'express';
import { authenticate, authorize } from '../middleware/auth';
import * as anomalyController from '../controllers/anomalyController';

const router = express.Router();

router.use(authenticate);

router.get('/', anomalyController.listAnomalies);
router.get('/dashboard', authorize(['admin']), anomalyController.getDashboard);
router.get('/:id', anomalyController.getAnomalyDetails);
router.put('/:id/acknowledge', anomalyController.acknowledgeAnomaly);
router.put('/:id/resolve', authorize(['admin']), anomalyController.resolveAnomaly);

export default router;
```



### Step 4: Services (4 days)

Create service files in `backend/src/services/`:

**1. dogService.ts**
```typescript
import Dog from '../models/Dog';
import User from '../models/User';
import { generateId } from '../utils/idGenerator';

export const registerDog = async (data: any, userId: string) => {
  const dogId = generateId('DOG');
  
  const dog = new Dog({
    dogId,
    ...data,
    registeredBy: userId,
    registeredAt: new Date(),
  });
  
  await dog.save();
  
  // Auto-assign to feeder based on locality
  await autoAssignFeeder(dog);
  
  return dog;
};

export const autoAssignFeeder = async (dog: any) => {
  const feeders = await User.find({
    role: 'feeder',
    activeStatus: 'active',
    'assignedLocalities.locality': dog.primaryLocation.locality,
    'assignedLocalities.city': dog.primaryLocation.city,
  });
  
  if (feeders.length > 0) {
    // Assign to feeder with least dogs
    const feederWithLeastDogs = feeders.reduce((prev, curr) => 
      (prev.assignedDogs?.length || 0) < (curr.assignedDogs?.length || 0) ? prev : curr
    );
    
    dog.assignedFeeders.push(feederWithLeastDogs._id);
    await dog.save();
    
    feederWithLeastDogs.assignedDogs = feederWithLeastDogs.assignedDogs || [];
    feederWithLeastDogs.assignedDogs.push(dog._id);
    await feederWithLeastDogs.save();
  }
};

export const getNearbyDogs = async (longitude: number, latitude: number, maxDistance: number = 5000) => {
  return Dog.find({
    isActive: true,
    'primaryLocation.coordinates': {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude],
        },
        $maxDistance: maxDistance,
      },
    },
  });
};
```

**2. feedingService.ts**
```typescript
import FeedingRecord from '../models/FeedingRecord';
import Dog from '../models/Dog';
import User from '../models/User';
import { generateId } from '../utils/idGenerator';
import { calculateDistance } from '../utils/geoUtils';

export const recordFeeding = async (data: any, feederId: string) => {
  const recordId = generateId('FEED');
  
  // Verify feeder is assigned to this dog
  const dog = await Dog.findById(data.dogId);
  if (!dog) throw new Error('Dog not found');
  
  if (!dog.assignedFeeders.includes(feederId)) {
    throw new Error('You are not assigned to this dog');
  }
  
  // Calculate distance from dog's location
  const distance = calculateDistance(
    data.location.coordinates,
    dog.primaryLocation.coordinates
  );
  
  // Check if on time (within 30 minutes of scheduled time)
  const scheduledTime = new Date(data.scheduledTime);
  const feedingTime = new Date(data.feedingTime);
  const timeDiff = Math.abs(feedingTime.getTime() - scheduledTime.getTime()) / 60000;
  const isOnTime = timeDiff <= 30;
  
  const record = new FeedingRecord({
    recordId,
    ...data,
    feederId,
    distanceFromDogLocation: distance,
    isOnTime,
  });
  
  await record.save();
  
  // Update dog's last fed info
  dog.lastFedAt = feedingTime;
  dog.lastFedBy = feederId;
  await dog.save();
  
  // Update feeder stats
  await User.findByIdAndUpdate(feederId, {
    $inc: { totalFeedings: 1 },
    lastFeedingAt: feedingTime,
  });
  
  return record;
};
```



**3. biometricService.ts**
```typescript
import axios from 'axios';
import Dog from '../models/Dog';

// Placeholder for ML service integration
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5001';

export const extractPawFeatures = async (imageUrl: string): Promise<number[]> => {
  try {
    // Call ML service to extract features
    const response = await axios.post(`${ML_SERVICE_URL}/extract-features`, {
      imageUrl,
    });
    
    return response.data.features;
  } catch (error) {
    console.error('Feature extraction failed:', error);
    // Return empty array if ML service fails
    return [];
  }
};

export const verifyPawPrint = async (imageUrl: string, dogId?: string): Promise<{
  matched: boolean;
  dogId?: string;
  confidence: number;
}> => {
  // Extract features from new image
  const newFeatures = await extractPawFeatures(imageUrl);
  
  if (newFeatures.length === 0) {
    return { matched: false, confidence: 0 };
  }
  
  // Get dogs to compare against
  const dogs = dogId 
    ? [await Dog.findById(dogId)]
    : await Dog.find({ isActive: true, 'pawPrints.0': { $exists: true } });
  
  let bestMatch = { dogId: '', confidence: 0 };
  
  for (const dog of dogs) {
    if (!dog) continue;
    
    for (const pawPrint of dog.pawPrints) {
      if (pawPrint.features.length === 0) continue;
      
      // Calculate cosine similarity
      const similarity = cosineSimilarity(newFeatures, pawPrint.features);
      const confidence = similarity * 100;
      
      if (confidence > bestMatch.confidence) {
        bestMatch = { dogId: dog._id.toString(), confidence };
      }
    }
  }
  
  // Match threshold: 80%
  return {
    matched: bestMatch.confidence >= 80,
    dogId: bestMatch.confidence >= 80 ? bestMatch.dogId : undefined,
    confidence: bestMatch.confidence,
  };
};

function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}
```

**4. anomalyService.ts**
```typescript
import Anomaly from '../models/Anomaly';
import Dog from '../models/Dog';
import User from '../models/User';
import FeedingRecord from '../models/FeedingRecord';
import { generateId } from '../utils/idGenerator';
import { sendEmail, sendSMS } from './notificationService';

export const detectMissedFeedings = async () => {
  const now = new Date();
  const dogs = await Dog.find({ isActive: true });
  
  for (const dog of dogs) {
    const lastFed = dog.lastFedAt;
    
    // Check if dog hasn't been fed today
    if (!lastFed || !isSameDay(lastFed, now)) {
      // Check if it's past morning feeding time (10 AM)
      if (now.getHours() >= 10) {
        await createAnomaly({
          type: 'missed_feeding',
          dogId: dog._id,
          severity: 'high',
          description: `Dog ${dog.name || dog.dogId} missed morning feeding`,
          expectedBehavior: 'Fed by 10:00 AM',
          actualBehavior: 'Not fed',
        });
      }
    }
    
    // Check evening feeding (8 PM)
    if (lastFed && now.getHours() >= 20) {
      const lastFedHour = lastFed.getHours();
      if (lastFedHour < 18) {
        await createAnomaly({
          type: 'missed_feeding',
          dogId: dog._id,
          severity: 'high',
          description: `Dog ${dog.name || dog.dogId} missed evening feeding`,
          expectedBehavior: 'Fed by 8:00 PM',
          actualBehavior: 'Not fed since morning',
        });
      }
    }
  }
};

export const createAnomaly = async (data: any) => {
  const anomalyId = generateId('ANOM');
  
  const anomaly = new Anomaly({
    anomalyId,
    ...data,
    detectedAt: new Date(),
    status: 'open',
  });
  
  await anomaly.save();
  
  // Send notifications
  await sendAnomalyNotifications(anomaly);
  
  return anomaly;
};

async function sendAnomalyNotifications(anomaly: any) {
  // Notify assigned feeders
  if (anomaly.dogId) {
    const dog = await Dog.findById(anomaly.dogId).populate('assignedFeeders');
    
    for (const feeder of dog.assignedFeeders) {
      await sendEmail({
        to: feeder.email,
        subject: `Alert: ${anomaly.description}`,
        text: `An anomaly has been detected for dog ${dog.name || dog.dogId}.\n\nDetails: ${anomaly.description}`,
      });
    }
  }
}

function isSameDay(date1: Date, date2: Date): boolean {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate();
}
```

