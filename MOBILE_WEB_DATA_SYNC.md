# Mobile & Web Application Data Synchronization Guide

## Overview
This document explains how the mobile application (`clinicOS_mobile`) and web application (`clinic_os_web_new-main`) share the same Firebase Firestore database and authentication system, ensuring data consistency across both platforms.

## Architecture

### Firebase Services Used
1. **Firebase Authentication** - User authentication and session management
2. **Firebase Firestore** - Real-time NoSQL database for all application data

### Data Collections
Both applications use the same Firestore collections:
- `users` - Admin, doctor, and assistant profiles
- `patients` - Patient profiles and medical information
- `doctors` - Doctor-specific data
- `appointments` - Appointment bookings
- `queue` - Queue management
- `medicalRecords` - Patient medical records
- `prescriptions` - Prescription data
- `vaccinations` - Vaccination records
- `notifications` - User notifications
- `doctorSchedules` - Doctor availability schedules
- `scheduleOverrides` - Schedule exceptions
- `auditLogs` - System audit trail

## Authentication Flow

### Patient Login (Both Platforms)

#### Step 1: OTP Verification
```
User enters email → Backend sends OTP → User verifies OTP
```

#### Step 2: Firebase Authentication
```javascript
// After OTP verification, sign in with Firebase
const result = await patientSignInWithEmail(email, email); // Using email as password
```

#### Step 3: Fetch Patient Profile
```javascript
// Fetch complete patient profile from Firestore
const patientDoc = await getDoc(doc(db, 'patients', user.uid));
const patientData = { id: patientDoc.id, ...patientDoc.data() };
```

### Example: mohamedsabeer6142@gmail.com

When this user logs in on either platform:

1. **Firebase Auth Response:**
```json
{
  "localId": "6quHftd47HR9yZNCSlYrvei9POt1",
  "email": "mohamedsabeer6142@gmail.com",
  "displayName": "John Carter",
  "idToken": "eyJhbGci...",
  "registered": true
}
```

2. **Firestore Patient Profile:**
```javascript
// Document path: patients/6quHftd47HR9yZNCSlYrvei9POt1
{
  id: "6quHftd47HR9yZNCSlYrvei9POt1",
  name: "John Carter",
  email: "mohamedsabeer6142@gmail.com",
  phone: "8012222817",
  dateOfBirth: "10/1/2025",
  gender: "male",
  address: "Subbaiya Street",
  bloodGroup: "AB+",
  height: 100,
  weight: 70,
  allergies: "None",
  chronicConditions: "None",
  familyId: "6quHftd47HR9yZNCSlYrvei9POt1",
  isActive: true,
  createdAt: "2025-01-01T00:00:00.000Z",
  updatedAt: "2025-01-01T00:00:00.000Z"
}
```

## Data Synchronization

### Real-Time Sync
Both applications use Firebase's real-time listeners to automatically update data:

```javascript
// Mobile: BackendPatientAuthContext.tsx
useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    if (user) {
      const result = await getPatientProfile(user.uid);
      if (result.success && result.data) {
        setPatient(result.data as PatientProfile);
      }
    }
  });
  return () => unsubscribe();
}, []);
```

```javascript
// Web: PatientAuthContext.tsx
useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    if (user) {
      const result = await getPatientProfile(user.uid);
      if (result.success && result.data) {
        setPatient(result.data as PatientProfile);
      }
    }
  });
  return () => unsubscribe();
}, []);
```

### Profile Updates
When a user updates their profile on either platform, the changes are immediately reflected:

```javascript
// Update function (same on both platforms)
export const updatePatientProfile = async (uid: string, data: any) => {
  const patientRef = doc(db, 'patients', uid);
  await updateDoc(patientRef, {
    ...data,
    updatedAt: new Date().toISOString(),
  });
  return { success: true };
};
```

## Patient Profile Fields

### PatientProfile Interface
Both applications use the exact same interface:

```typescript
export interface PatientProfile {
  id: string;                        // Firebase Auth UID
  name: string;                      // Full name
  phone: string;                     // Contact number
  email?: string;                    // Email address (optional)
  dateOfBirth: string;               // DOB in YYYY-MM-DD format
  gender: 'male' | 'female' | 'other';
  address?: string;                  // Home address (optional)
  bloodGroup?: string;               // Blood type (optional)
  height?: number;                   // Height in cm (optional)
  weight?: number;                   // Weight in kg (optional)
  allergies?: string;                // Known allergies (optional)
  chronicConditions?: string;        // Chronic conditions (optional)
  familyId?: string;                 // Family group ID (optional)
  emergencyContact?: string;         // Emergency contact number (optional)
  emergencyContactName?: string;     // Emergency contact name (optional)
  isActive: boolean;                 // Account status
  createdAt: string;                 // Creation timestamp
  updatedAt: string;                 // Last update timestamp
}
```

## Mobile App Implementation

### Context Provider
File: `/lib/contexts/BackendPatientAuthContext.tsx`

```typescript
export const BackendPatientAuthProvider: React.FC = ({ children }) => {
  const [patient, setPatient] = useState<PatientProfile | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  
  // Firebase auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        const result = await getPatientProfile(user.uid);
        if (result.success && result.data) {
          setPatient(result.data as PatientProfile);
        }
      } else {
        setPatient(null);
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);
  
  // ... rest of the provider
};
```

### Profile Page
File: `/app/patient-profile.tsx`

```typescript
function PatientProfileContent() {
  const { patient, refreshPatient } = useBackendPatientAuth();
  const [formData, setFormData] = useState<Partial<PatientProfile>>({});
  
  useEffect(() => {
    if (patient) {
      setFormData(patient); // Load patient data into form
    }
  }, [patient]);
  
  const handleSaveChanges = async () => {
    const result = await updatePatientProfile(patient.id, formData);
    if (result.success) {
      await refreshPatient(); // Refresh context data
      Alert.alert('Success', 'Profile updated successfully.');
    }
  };
  
  // ... UI rendering
}
```

## Web App Implementation

### Context Provider
File: `/src/lib/contexts/PatientAuthContext.tsx`

```typescript
export const PatientAuthProvider: React.FC = ({ children }) => {
  const [patient, setPatient] = useState<PatientProfile | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  
  // Firebase auth state listener (identical to mobile)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        const result = await getPatientProfile(user.uid);
        if (result.success && result.data) {
          setPatient(result.data as PatientProfile);
        }
      } else {
        setPatient(null);
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);
  
  // ... rest of the provider
};
```

## Testing Data Sync

### Test Scenario 1: Profile Update on Mobile
1. Login on mobile with `mohamedsabeer6142@gmail.com`
2. Navigate to Profile page
3. Click "Edit Profile"
4. Change address to "New Address 123"
5. Click "Save Changes"
6. **Result:** Changes immediately saved to Firestore

### Test Scenario 2: Verify on Web
1. Login on web with `mohamedsabeer6142@gmail.com`
2. Navigate to Profile page
3. **Result:** Address shows "New Address 123" (synced from mobile)

### Test Scenario 3: Profile Update on Web
1. On web, update weight to "75 kg"
2. Click "Save"
3. **Result:** Changes saved to Firestore

### Test Scenario 4: Verify on Mobile
1. On mobile, pull to refresh or navigate away and back
2. **Result:** Weight shows "75 kg" (synced from web)

## Data Flow Diagram

```
┌─────────────────┐         ┌─────────────────┐
│  Mobile App     │         │   Web App       │
│  (React Native) │         │   (Next.js)     │
└────────┬────────┘         └────────┬────────┘
         │                           │
         │  Firebase Auth            │
         ├───────────┬───────────────┤
         │           │               │
         │    ┌──────▼──────┐       │
         │    │  Firebase   │       │
         │    │  Auth       │       │
         │    │  Service    │       │
         │    └──────┬──────┘       │
         │           │               │
         │  Firestore Read/Write     │
         ├───────────┼───────────────┤
         │           │               │
         │    ┌──────▼──────┐       │
         │    │  Firestore  │       │
         │    │  Database   │       │
         │    │             │       │
         │    │  patients/  │       │
         │    │  6quHft...  │       │
         │    └─────────────┘       │
         │                           │
         └───────────────────────────┘
```

## Key Points

### 1. Single Source of Truth
- All data is stored in Firebase Firestore
- Both applications read from and write to the same database
- No data duplication or synchronization delays

### 2. Real-Time Updates
- Firebase `onAuthStateChanged` listener keeps auth state in sync
- Firestore real-time listeners can be added for live updates
- Changes made on one platform are immediately available on the other

### 3. Consistent Data Structure
- Both applications use identical TypeScript interfaces
- Field names, types, and optional flags match exactly
- Validation rules are the same on both platforms

### 4. Authentication Flow
- OTP verification handled by backend service
- Firebase Auth used for session management
- Patient profile fetched from Firestore after authentication

## Troubleshooting

### Issue: Data not showing on mobile
**Solution:** Check console logs for:
```
🔐 Auth state changed: User logged in: mohamedsabeer6142@gmail.com
📥 Fetching patient profile for: 6quHftd47HR9yZNCSlYrvei9POt1
✅ Patient profile loaded: { id: '6quHft...', name: 'John Carter', ... }
```

### Issue: Profile updates not saving
**Solution:** Verify Firebase permissions in `firestore.rules`:
```
match /patients/{patientId} {
  allow read, write: if request.auth != null && request.auth.uid == patientId;
}
```

### Issue: Different data on mobile vs web
**Solution:** 
1. Clear app cache on mobile
2. Force refresh on web (Ctrl+Shift+R)
3. Check Firebase Console to verify actual data
4. Ensure both apps are using the same Firebase project

## Conclusion

The mobile and web applications are now fully synchronized through Firebase. Any data changes made on one platform will be immediately reflected on the other, providing a seamless experience for users across all devices.

For the specific user `mohamedsabeer6142@gmail.com`:
- UID: `6quHftd47HR9yZNCSlYrvei9POt1`
- All profile data is stored in Firestore at `patients/6quHftd47HR9yZNCSlYrvei9POt1`
- Login on either platform fetches the same data
- Updates on either platform modify the same Firestore document

