# Dog Feeding System - Visual Diagrams

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (Next.js)                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │ Feeder App   │  │ Admin Panel  │  │ Dog Profiles │         │
│  ├──────────────┤  ├──────────────┤  ├──────────────┤         │
│  │ • Dashboard  │  │ • Feeders    │  │ • Details    │         │
│  │ • My Dogs    │  │ • Dogs       │  │ • Photos     │         │
│  │ • Record     │  │ • Anomalies  │  │ • History    │         │
│  │ • Schedule   │  │ • Analytics  │  │ • Health     │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│                                                                  │
└────────────────────────────┬─────────────────────────────────────┘
                             │ HTTPS/REST API
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND (Express.js)                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │   Auth   │  │   Dogs   │  │ Feedings │  │ Anomaly  │       │
│  │  Routes  │  │  Routes  │  │  Routes  │  │  Routes  │       │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘       │
│       │             │              │              │              │
│  ┌────▼─────┐  ┌───▼──────┐  ┌───▼──────┐  ┌───▼──────┐       │
│  │   Auth   │  │   Dog    │  │ Feeding  │  │ Anomaly  │       │
│  │ Service  │  │ Service  │  │ Service  │  │ Service  │       │
│  └──────────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘       │
│                     │              │              │              │
│                ┌────▼──────────────▼──────────────▼────┐        │
│                │      Biometric Service (ML)           │        │
│                │  • Feature Extraction                 │        │
│                │  • Paw Print Matching                 │        │
│                │  • Verification                       │        │
│                └───────────────────────────────────────┘        │
│                                                                  │
└────────────────────────────┬─────────────────────────────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   MongoDB    │    │ Cloud Storage│    │  Cron Jobs   │
│              │    │  (S3/Cloud)  │    │              │
│ • Dogs       │    │              │    │ • Anomaly    │
│ • Feedings   │    │ • Dog Photos │    │   Detection  │
│ • Feeders    │    │ • Paw Prints │    │ • Reminders  │
│ • Anomalies  │    │ • Feeding    │    │ • Reports    │
│              │    │   Photos     │    │              │
└──────────────┘    └──────────────┘    └──────────────┘
```

---

## Data Flow Diagram - Feeding Activity

```
┌─────────────┐
│   Feeder    │
│   Opens     │
│     App     │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  1. View Assigned Dogs                  │
│     GET /api/dogs?feederId=xxx          │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  2. Select Dog to Feed                  │
│     • Dog details displayed             │
│     • Last feeding time shown           │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  3. Verify Location                     │
│     • Capture GPS coordinates           │
│     • Check distance from dog location  │
│     • Alert if too far (>500m)          │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  4. Feed the Dog                        │
│     • Provide food and water            │
│     • Observe dog's condition           │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  5. Capture Photos                      │
│     • Take photos during feeding        │
│     • Optional: Capture paw print       │
│     • Upload to cloud storage           │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  6. Biometric Verification (Optional)   │
│     POST /api/feedings/verify-paw       │
│     • Extract paw features (ML)         │
│     • Compare with registered prints    │
│     • Return match score                │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  7. Fill Feeding Details                │
│     • Food type and quantity            │
│     • Water provided                    │
│     • Dog condition (appetite/activity) │
│     • Notes                             │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  8. Submit Feeding Record               │
│     POST /api/feedings                  │
│     • Create feeding record             │
│     • Update dog's lastFedAt            │
│     • Update feeder stats               │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  9. Anomaly Check                       │
│     • Check if on time                  │
│     • Check location match              │
│     • Check dog condition               │
│     • Create anomaly if needed          │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  10. Confirmation                       │
│      • Show success message             │
│      • Display next feeding time        │
│      • Update feeder dashboard          │
└─────────────────────────────────────────┘
```

---

## Biometric Verification Flow

```
┌─────────────────┐
│ Capture Paw     │
│ Print Photo     │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────┐
│ Upload to Cloud Storage             │
│ • Compress image                    │
│ • Generate unique filename          │
│ • Store in S3/Cloudinary            │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│ Image Preprocessing                 │
│ • Resize to 224x224                 │
│ • Convert to grayscale              │
│ • Enhance contrast                  │
│ • Detect paw region                 │
│ • Normalize lighting                │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│ Feature Extraction (ML)             │
│ • Detect paw pads (main + toes)     │
│ • Measure pad sizes                 │
│ • Calculate distances               │
│ • Extract texture patterns          │
│ • Generate 128-D feature vector     │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│ Matching Algorithm                  │
│ FOR each registered paw print:      │
│   • Load feature vector             │
│   • Calculate cosine similarity     │
│   • Track best match                │
│ END FOR                             │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│ Decision Logic                      │
│ IF similarity > 80%:                │
│   ✅ Match confirmed                │
│ ELSE IF similarity > 60%:           │
│   ⚠️  Possible match (review)       │
│ ELSE:                               │
│   ❌ No match                       │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│ Return Result                       │
│ {                                   │
│   matched: boolean,                 │
│   dogId: string,                    │
│   confidence: number,               │
│   matchedPrintId: string            │
│ }                                   │
└─────────────────────────────────────┘
```

---

## Anomaly Detection Flow

```
┌─────────────────────────────────────┐
│  Cron Job (Runs Every Hour)        │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  Get All Active Dogs                │
│  Dog.find({ isActive: true })       │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  FOR each dog:                      │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ Check Morning Feeding         │ │
│  │ IF time > 10 AM AND           │ │
│  │    not fed today:             │ │
│  │   CREATE missed_feeding       │ │
│  └───────────────────────────────┘ │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ Check Evening Feeding         │ │
│  │ IF time > 8 PM AND            │ │
│  │    not fed since morning:     │ │
│  │   CREATE missed_feeding       │ │
│  └───────────────────────────────┘ │
│                                     │
│  END FOR                            │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  Get All Active Feeders             │
│  User.find({ role: 'feeder' })      │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  FOR each feeder:                   │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ Check Last Activity           │ │
│  │ IF days since last > 3:       │ │
│  │   CREATE feeder_inactive      │ │
│  └───────────────────────────────┘ │
│                                     │
│  END FOR                            │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  Get Today's Feeding Records        │
│  FeedingRecord.find({ today })      │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  FOR each record:                   │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ Check Health Concerns         │ │
│  │ IF poor appetite OR           │ │
│  │    lethargic:                 │ │
│  │   CREATE health_concern       │ │
│  └───────────────────────────────┘ │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ Check Timing                  │ │
│  │ IF delay > 30 minutes:        │ │
│  │   CREATE late_feeding         │ │
│  └───────────────────────────────┘ │
│                                     │
│  END FOR                            │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  Send Notifications                 │
│  • Email to assigned feeders        │
│  • SMS for critical anomalies       │
│  • Push notifications               │
│  • Update admin dashboard           │
└─────────────────────────────────────┘
```

---

## Database Schema Relationships

```
┌──────────────────────────────────────────────────────────────┐
│                          User                                 │
├──────────────────────────────────────────────────────────────┤
│ _id: ObjectId                                                 │
│ name: String                                                  │
│ email: String                                                 │
│ role: 'feeder' | 'admin' | ...                               │
│ feederId: String                                              │
│ assignedLocalities: [{ locality, city, state }]              │
│ assignedDogs: [ObjectId] ────────────┐                       │
│ totalFeedings: Number                │                       │
│ lastFeedingAt: Date                  │                       │
└──────────────────────────────────────┼───────────────────────┘
                                       │
                                       │ references
                                       │
                                       ▼
┌──────────────────────────────────────────────────────────────┐
│                          Dog                                  │
├──────────────────────────────────────────────────────────────┤
│ _id: ObjectId                                                 │
│ dogId: String                                                 │
│ name: String                                                  │
│ color: String                                                 │
│ size: 'small' | 'medium' | 'large'                           │
│ primaryLocation: { coordinates, locality, city }             │
│ pawPrints: [{ imageUrl, features, capturedBy }]              │
│ assignedFeeders: [ObjectId] ──────────┐                      │
│ lastFedAt: Date                       │                      │
│ lastFedBy: ObjectId ──────────────────┼──┐                   │
│ photos: [{ url, uploadedBy, type }]   │  │                   │
└───────────────────────────────────────┼──┼───────────────────┘
                                        │  │
                        references      │  │ references
                                        │  │
                                        ▼  ▼
┌──────────────────────────────────────────────────────────────┐
│                     FeedingRecord                             │
├──────────────────────────────────────────────────────────────┤
│ _id: ObjectId                                                 │
│ recordId: String                                              │
│ dogId: ObjectId ──────────────────────┐                      │
│ feederId: ObjectId ───────────────────┼──┐                   │
│ feedingTime: Date                     │  │                   │
│ location: { coordinates, address }    │  │                   │
│ foodType: String                      │  │                   │
│ quantity: Number                      │  │                   │
│ photos: [{ url, type }]               │  │                   │
│ dogCondition: { appetite, activity }  │  │                   │
│ pawVerified: Boolean                  │  │                   │
│ verificationScore: Number             │  │                   │
└───────────────────────────────────────┼──┼───────────────────┘
                                        │  │
                        references      │  │ references
                                        │  │
                                        ▼  ▼
┌──────────────────────────────────────────────────────────────┐
│                       Anomaly                                 │
├──────────────────────────────────────────────────────────────┤
│ _id: ObjectId                                                 │
│ anomalyId: String                                             │
│ type: 'missed_feeding' | 'late_feeding' | ...                │
│ dogId: ObjectId (optional)                                    │
│ feederId: ObjectId (optional)                                 │
│ feedingRecordId: ObjectId (optional)                          │
│ severity: 'low' | 'medium' | 'high' | 'critical'             │
│ description: String                                           │
│ status: 'open' | 'acknowledged' | 'resolved'                 │
│ detectedAt: Date                                              │
│ resolvedBy: ObjectId                                          │
│ resolvedAt: Date                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## User Role Permissions Matrix

```
┌──────────────────┬─────────┬─────────┬─────────┬─────────┐
│   Feature        │ Feeder  │  Admin  │ Citizen │ Public  │
├──────────────────┼─────────┼─────────┼─────────┼─────────┤
│ Register Dog     │   ✅    │   ✅    │   ❌    │   ❌    │
│ View All Dogs    │   ❌    │   ✅    │   ❌    │   ❌    │
│ View Assigned    │   ✅    │   ✅    │   ❌    │   ❌    │
│ Update Dog       │   ✅*   │   ✅    │   ❌    │   ❌    │
│ Delete Dog       │   ❌    │   ✅    │   ❌    │   ❌    │
├──────────────────┼─────────┼─────────┼─────────┼─────────┤
│ Record Feeding   │   ✅    │   ✅    │   ❌    │   ❌    │
│ View All Feed    │   ❌    │   ✅    │   ❌    │   ❌    │
│ View Own Feed    │   ✅    │   ✅    │   ❌    │   ❌    │
│ Update Feeding   │   ✅*   │   ✅    │   ❌    │   ❌    │
│ Delete Feeding   │   ❌    │   ✅    │   ❌    │   ❌    │
├──────────────────┼─────────┼─────────┼─────────┼─────────┤
│ View Feeders     │   ❌    │   ✅    │   ❌    │   ❌    │
│ Assign Feeders   │   ❌    │   ✅    │   ❌    │   ❌    │
│ Verify Feeders   │   ❌    │   ✅    │   ❌    │   ❌    │
│ Update Status    │   ❌    │   ✅    │   ❌    │   ❌    │
├──────────────────┼─────────┼─────────┼─────────┼─────────┤
│ View Anomalies   │   ✅*   │   ✅    │   ❌    │   ❌    │
│ Acknowledge      │   ✅*   │   ✅    │   ❌    │   ❌    │
│ Resolve          │   ❌    │   ✅    │   ❌    │   ❌    │
│ Delete           │   ❌    │   ✅    │   ❌    │   ❌    │
├──────────────────┼─────────┼─────────┼─────────┼─────────┤
│ Dashboard        │   ✅    │   ✅    │   ❌    │   ❌    │
│ Analytics        │   ❌    │   ✅    │   ❌    │   ❌    │
│ Reports          │   ❌    │   ✅    │   ❌    │   ❌    │
└──────────────────┴─────────┴─────────┴─────────┴─────────┘

* Only for assigned/related entities
```

---

## Mobile App Screens (Future)

```
┌─────────────────────────────────────────────────────────────┐
│                    Feeder Mobile App                         │
└─────────────────────────────────────────────────────────────┘

┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   Dashboard  │  │   My Dogs    │  │   Schedule   │
│              │  │              │  │              │
│ • Today's    │  │ • List of    │  │ • Morning    │
│   feedings   │  │   assigned   │  │   feedings   │
│ • Upcoming   │  │   dogs       │  │ • Evening    │
│ • Alerts     │  │ • Search     │  │   feedings   │
│ • Stats      │  │ • Filter     │  │ • Overdue    │
└──────────────┘  └──────────────┘  └──────────────┘

┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ Record Feed  │  │  Dog Profile │  │   History    │
│              │  │              │  │              │
│ • Camera     │  │ • Photos     │  │ • Past       │
│ • Location   │  │ • Details    │  │   feedings   │
│ • Food type  │  │ • Health     │  │ • Filter     │
│ • Condition  │  │ • Schedule   │  │ • Export     │
│ • Submit     │  │ • History    │  │ • Stats      │
└──────────────┘  └──────────────┘  └──────────────┘
```

This comprehensive design provides everything needed to implement the dog feeding management system!

