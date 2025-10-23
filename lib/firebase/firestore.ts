// Firestore database utilities for React Native
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    onSnapshot,
    orderBy,
    query,
    Timestamp,
    updateDoc,
    where
} from 'firebase/firestore';
import { db } from './config';

// Collection references
export const collections = {
  users: 'users',
  patients: 'patients',
  doctors: 'doctors',
  assistants: 'assistants',
  appointments: 'appointments',
  queue: 'queue',
  medicalRecords: 'medicalRecords',
  prescriptions: 'prescriptions',
  vaccinations: 'vaccinations',
  notifications: 'notifications',
  doctorSchedules: 'doctorSchedules',
  scheduleOverrides: 'scheduleOverrides',
  auditLogs: 'auditLogs'
};

// Generic CRUD operations
export const createDocument = async (collectionName: string, data: any) => {
  try {
    const docRef = await addDoc(collection(db, collectionName), {
      ...data,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    return { success: true, id: docRef.id };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// Create appointment with token generation (matching web app)
export const createAppointment = async (appointmentData: any) => {
  try {
    console.log('🔄 Creating appointment with data:', appointmentData);
    
    // Generate token number if not provided
    let tokenNumber = appointmentData.tokenNumber;
    
    if (!tokenNumber) {
      console.log('🔄 No token provided, generating new token...');
      
      // Get existing appointments for the same doctor and date
      const existingAppointmentsQuery = query(
        collection(db, collections.appointments),
        where('doctorId', '==', appointmentData.doctorId),
        where('appointmentDate', '==', appointmentData.appointmentDate)
      );
      
      const existingAppointmentsSnapshot = await getDocs(existingAppointmentsQuery);
      const existingAppointments = existingAppointmentsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      console.log(`📅 Found ${existingAppointments.length} existing appointments for doctor ${appointmentData.doctorId} on ${appointmentData.appointmentDate}`);
      
      // Generate next token number
      const maxToken = existingAppointments.reduce((max, apt) => {
        const token = parseInt(apt.tokenNumber || '0');
        return token > max ? token : max;
      }, 0);
      
      tokenNumber = (maxToken + 1).toString().padStart(3, '0');
      console.log(`🎫 Generated token: ${tokenNumber}`);
    } else {
      console.log(`🎫 Using provided token: ${tokenNumber}`);
    }
    
    const appointmentsRef = collection(db, collections.appointments);
    const newAppointment = {
      ...appointmentData,
      tokenNumber,
      status: 'scheduled',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    
    const docRef = await addDoc(appointmentsRef, newAppointment);
    
    // Create audit log
    await addDoc(collection(db, collections.auditLogs), {
      action: 'appointment_created',
      userId: appointmentData.createdBy || 'mobile_app',
      entityType: 'appointment',
      entityId: docRef.id,
      timestamp: Timestamp.now(),
      details: `Appointment created for patient ${appointmentData.patientId} (Token: ${tokenNumber})`
    });
    
    console.log('✅ Appointment created successfully with ID:', docRef.id);
    
    return {
      success: true,
      data: { id: docRef.id, ...newAppointment }
    };
  } catch (error: any) {
    console.error('❌ Create appointment error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Create patient (matching web app)
export const createPatient = async (patientData: any) => {
  try {
    console.log('🔄 Creating patient with data:', patientData);
    
    const patientsRef = collection(db, collections.patients);
    const newPatient = {
      ...patientData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    
    const docRef = await addDoc(patientsRef, newPatient);
    
    console.log('✅ Patient created successfully with ID:', docRef.id);
    
    return docRef.id;
  } catch (error: any) {
    console.error('❌ Create patient error:', error);
    return null;
  }
};

export const updatePatientProfile = async (uid: string, data: any) => {
  try {
    const patientRef = doc(db, 'patients', uid);
    await updateDoc(patientRef, {
      ...data,
      updatedAt: new Date().toISOString(),
    });
    return { success: true };
  } catch (error: any) {
    console.error('Error updating patient profile:', error);
    return { success: false, error: error.message };
  }
};

export const getDocument = async (collectionName: string, docId: string) => {
  try {
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { success: true, data: { id: docSnap.id, ...docSnap.data() } };
    } else {
      return { success: false, error: 'Document not found' };
    }
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// Get patient profile by UID (matching web app)
export const getPatientProfile = async (uid: string) => {
  try {
    console.log('getPatientProfile: Fetching patient profile for UID:', uid);
    const patientDoc = await getDoc(doc(db, collections.patients, uid));
    
    if (patientDoc.exists()) {
      const patientData = { id: patientDoc.id, ...patientDoc.data() };
      console.log('getPatientProfile: Found patient profile:', patientData);
      return { success: true, data: patientData };
    } else {
      console.log('getPatientProfile: Patient profile not found for UID:', uid);
      return { success: false, error: 'Patient profile not found' };
    }
  } catch (error: any) {
    console.error('getPatientProfile error:', error);
    return { success: false, error: error.message };
  }
};

export const updateDocument = async (collectionName: string, docId: string, data: any) => {
  try {
    const docRef = doc(db, collectionName, docId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: Timestamp.now()
    });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const deleteDocument = async (collectionName: string, docId: string) => {
  try {
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const getDocuments = async (collectionName: string, constraints: any[] = []) => {
  try {
    const q = query(collection(db, collectionName), ...constraints);
    const querySnapshot = await getDocs(q);
    const documents = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    return { success: true, data: documents };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

// Get all doctors with user data (matching web app implementation)
export const getAllDoctors = async () => {
  try {
    console.log('getAllDoctors: Starting fetch...');
    const doctorsRef = collection(db, collections.doctors);
    const querySnapshot = await getDocs(doctorsRef);
    
    console.log(`getAllDoctors: Found ${querySnapshot.docs.length} doctor documents`);
    
    // Fetch user data for each doctor
    const doctors = await Promise.all(
      querySnapshot.docs.map(async (docSnapshot) => {
        const doctorData = docSnapshot.data();
        console.log(`Doctor ${docSnapshot.id}:`, doctorData);
        
        // Fetch associated user profile using userId as document ID
        let userData = null;
        if (doctorData.userId) {
          try {
            console.log(`Fetching user for doctor ${docSnapshot.id}, userId: ${doctorData.userId}`);
            const userDoc = await getDoc(doc(db, collections.users, doctorData.userId));
            if (userDoc.exists()) {
              userData = {
                id: userDoc.id,
                ...userDoc.data()
              };
              console.log(`Found user directly:`, userData);
            } else {
              console.log(`User not found by doc ID, trying query...`);
              // Fallback: try querying by id field for old documents
              const usersRef = collection(db, collections.users);
              const userQuery = query(usersRef, where('id', '==', doctorData.userId));
              const userSnapshot = await getDocs(userQuery);
              
              if (!userSnapshot.empty) {
                const oldUserDoc = userSnapshot.docs[0];
                userData = {
                  id: oldUserDoc.id,
                  ...oldUserDoc.data()
                };
                console.log(`Found user via query:`, userData);
              } else {
                console.warn(`No user found for userId: ${doctorData.userId}`);
              }
            }
          } catch (userError) {
            console.warn(`Failed to fetch user for doctor ${docSnapshot.id}:`, userError);
          }
        } else {
          console.warn(`Doctor ${docSnapshot.id} has no userId!`);
        }
        
        return {
          id: docSnapshot.id,
          ...doctorData,
          user: userData
        };
      })
    );
    
    console.log('getAllDoctors: Returning doctors:', doctors);
    
    return {
      success: true,
      data: doctors
    };
  } catch (error: any) {
    console.error('Get doctors error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Real-time listeners
export const subscribeToCollection = (
  collectionName: string, 
  callback: (docs: any[]) => void,
  constraints: any[] = []
) => {
  const q = query(collection(db, collectionName), ...constraints);
  return onSnapshot(q, (querySnapshot) => {
    const documents = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(documents);
  });
};

export const subscribeToDocument = (
  collectionName: string, 
  docId: string, 
  callback: (doc: any) => void
) => {
  const docRef = doc(db, collectionName, docId);
  return onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      callback({ id: docSnap.id, ...docSnap.data() });
    } else {
      callback(null);
    }
  });
};

// Specific queries for your clinic app
export const getAppointmentsByPatient = async (patientId: string) => {
  return getDocuments(collections.appointments, [
    where('patientId', '==', patientId),
    orderBy('appointmentDate', 'desc')
  ]);
};

export const getAppointmentsByDoctor = async (doctorId: string) => {
  return getDocuments(collections.appointments, [
    where('doctorId', '==', doctorId),
    orderBy('appointmentDate', 'desc')
  ]);
};

export const getQueueByPatient = async (patientId: string) => {
  return getDocuments(collections.queue, [
    where('patientId', '==', patientId),
    orderBy('createdAt', 'desc')
  ]);
};

export const getMedicalRecordsByPatient = async (patientId: string) => {
  return getDocuments(collections.medicalRecords, [
    where('patientId', '==', patientId),
    orderBy('createdAt', 'desc')
  ]);
};

// Schedule Overrides functions
export const getScheduleOverrides = async (doctorId: string) => {
  try {
    console.log('getScheduleOverrides: Starting fetch for doctor:', doctorId);
    const overridesRef = collection(db, collections.scheduleOverrides);
    
    // Query only by doctorId to avoid composite index requirement
    // We'll filter isActive and sort by date in memory
    const q = query(
      overridesRef,
      where('doctorId', '==', doctorId)
    );
    const querySnapshot = await getDocs(q);
    
    console.log(`getScheduleOverrides: Found ${querySnapshot.docs.length} override documents`);
    
    // Filter and sort in memory to avoid composite index requirement
    const overrides = querySnapshot.docs
      .map(docSnapshot => ({
        id: docSnapshot.id,
        ...docSnapshot.data()
      }))
      .filter(override => override.isActive === true)
      .sort((a, b) => {
        // Sort by date descending (newest first)
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateB.getTime() - dateA.getTime();
      });
    
    console.log('getScheduleOverrides: Returning overrides:', overrides);
    
    return {
      success: true,
      data: overrides
    };
  } catch (error: any) {
    console.error('Get schedule overrides error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Alternative function that uses composite index (if you create the index)
export const getScheduleOverridesWithIndex = async (doctorId: string) => {
  try {
    console.log('getScheduleOverridesWithIndex: Starting fetch for doctor:', doctorId);
    const overridesRef = collection(db, collections.scheduleOverrides);
    
    // This query requires a composite index:
    // doctorId (Ascending), isActive (Ascending), date (Ascending), __name__ (Ascending)
    const q = query(
      overridesRef,
      where('doctorId', '==', doctorId),
      where('isActive', '==', true),
      orderBy('date', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    console.log(`getScheduleOverridesWithIndex: Found ${querySnapshot.docs.length} override documents`);
    
    const overrides = querySnapshot.docs.map(docSnapshot => ({
      id: docSnapshot.id,
      ...docSnapshot.data()
    }));
    
    console.log('getScheduleOverridesWithIndex: Returning overrides:', overrides);
    
    return {
      success: true,
      data: overrides
    };
  } catch (error: any) {
    console.error('Get schedule overrides with index error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export const createScheduleOverride = async (overrideData: any) => {
  try {
    console.log('createScheduleOverride: Creating override:', overrideData);
    
    const overrideDoc = {
      ...overrideData,
      isActive: true,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const docRef = await addDoc(collection(db, collections.scheduleOverrides), overrideDoc);
    
    console.log('createScheduleOverride: Created override with ID:', docRef.id);
    
    return {
      success: true,
      id: docRef.id
    };
  } catch (error: any) {
    console.error('Create schedule override error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export const updateScheduleOverride = async (overrideId: string, updateData: any) => {
  try {
    console.log('updateScheduleOverride: Updating override:', overrideId, updateData);
    
    const overrideRef = doc(db, collections.scheduleOverrides, overrideId);
    const updateDocData = {
      ...updateData,
      updatedAt: Timestamp.now(),
    };
    
    await updateDoc(overrideRef, updateDocData);
    
    console.log('updateScheduleOverride: Updated override successfully');
    
    return {
      success: true
    };
  } catch (error: any) {
    console.error('Update schedule override error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export const deleteScheduleOverride = async (overrideId: string) => {
  try {
    console.log('deleteScheduleOverride: Deleting override:', overrideId);
    
    const overrideRef = doc(db, collections.scheduleOverrides, overrideId);
    await deleteDoc(overrideRef);
    
    console.log('deleteScheduleOverride: Deleted override successfully');
    
    return {
      success: true
    };
  } catch (error: any) {
    console.error('Delete schedule override error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Doctor management functions
export const updateDoctor = async (doctorId: string, doctorData: any) => {
  try {
    console.log('updateDoctor: Updating doctor:', doctorId, doctorData);
    
    // Get the doctor document to find the userId
    const doctorRef = doc(db, collections.doctors, doctorId);
    const doctorDoc = await getDoc(doctorRef);
    
    if (!doctorDoc.exists()) {
      return {
        success: false,
        error: 'Doctor not found'
      };
    }
    
    const doctor = doctorDoc.data();
    const userId = doctor.userId;
    
    if (!userId) {
      return {
        success: false,
        error: 'Doctor user ID not found'
      };
    }
    
    // Update user document
    const userRef = doc(db, collections.users, userId);
    const userUpdateData = {
      name: doctorData.name,
      email: doctorData.email,
      phone: doctorData.phone,
      updatedAt: Timestamp.now()
    };
    
    await updateDoc(userRef, userUpdateData);
    console.log('updateDoctor: Updated user document');
    
    // Update doctor document
    const doctorUpdateData = {
      specialty: doctorData.specialty,
      consultationDuration: parseInt(doctorData.slotDuration),
      schedule: doctorData.schedule || 'Mon-Fri, 9:00 AM - 5:00 PM',
      startTime: doctorData.startTime,
      endTime: doctorData.endTime,
      room: doctorData.room,
      status: doctorData.status,
      updatedAt: Timestamp.now()
    };
    
    await updateDoc(doctorRef, doctorUpdateData);
    console.log('updateDoctor: Updated doctor document');
    
    // Create audit log
    await addDoc(collection(db, collections.auditLogs), {
      action: 'doctor_updated',
      userId: 'mobile_app',
      entityType: 'doctor',
      entityId: doctorId,
      timestamp: Timestamp.now(),
      details: `Doctor profile updated: ${doctorData.name}`
    });
    
    console.log('updateDoctor: Doctor updated successfully');
    
    return {
      success: true
    };
  } catch (error: any) {
    console.error('Update doctor error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export const deleteDoctor = async (doctorId: string) => {
  try {
    console.log('deleteDoctor: Deleting doctor:', doctorId);
    
    // Get the doctor document to find the userId
    const doctorRef = doc(db, collections.doctors, doctorId);
    const doctorDoc = await getDoc(doctorRef);
    
    if (!doctorDoc.exists()) {
      return {
        success: false,
        error: 'Doctor not found'
      };
    }
    
    const doctor = doctorDoc.data();
    const userId = doctor.userId;
    
    // Delete doctor document
    await deleteDoc(doctorRef);
    console.log('deleteDoctor: Deleted doctor document');
    
    // Delete user document if userId exists
    if (userId) {
      const userRef = doc(db, collections.users, userId);
      await deleteDoc(userRef);
      console.log('deleteDoctor: Deleted user document');
    }
    
    // Create audit log
    await addDoc(collection(db, collections.auditLogs), {
      action: 'doctor_deleted',
      userId: 'mobile_app',
      entityType: 'doctor',
      entityId: doctorId,
      timestamp: Timestamp.now(),
      details: `Doctor deleted: ${doctor.user?.name || 'Unknown'}`
    });
    
    console.log('deleteDoctor: Doctor deleted successfully');
    
    return {
      success: true
    };
  } catch (error: any) {
    console.error('Delete doctor error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export const updateDoctorStatus = async (doctorId: string, status: 'active' | 'break' | 'offline') => {
  try {
    console.log('updateDoctorStatus: Updating status for doctor:', doctorId, 'to', status);
    
    const doctorRef = doc(db, collections.doctors, doctorId);
    
    // Map status values
    const statusMap = {
      'active': 'In',
      'break': 'Break',
      'offline': 'Out'
    };
    
    const updateData = {
      status: statusMap[status],
      updatedAt: Timestamp.now()
    };
    
    await updateDoc(doctorRef, updateData);
    
    // Create audit log
    await addDoc(collection(db, collections.auditLogs), {
      action: 'doctor_status_updated',
      userId: 'mobile_app',
      entityType: 'doctor',
      entityId: doctorId,
      timestamp: Timestamp.now(),
      details: `Doctor status changed to: ${statusMap[status]}`
    });
    
    console.log('updateDoctorStatus: Doctor status updated successfully');
    
    return {
      success: true
    };
  } catch (error: any) {
    console.error('Update doctor status error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Schedule management functions
export const getDoctorSchedule = async (doctorId: string) => {
  try {
    console.log('getDoctorSchedule: Fetching schedule for doctor:', doctorId);
    
    const schedulesRef = collection(db, collections.doctorSchedules);
    // Query only by doctorId to avoid composite index requirement
    // We'll sort by dayOfWeek in memory
    const q = query(
      schedulesRef,
      where('doctorId', '==', doctorId)
    );
    
    const querySnapshot = await getDocs(q);
    
    console.log(`getDoctorSchedule: Found ${querySnapshot.docs.length} schedule documents`);
    
    // Sort by dayOfWeek in memory to avoid composite index requirement
    const schedules = querySnapshot.docs
      .map(docSnapshot => ({
        id: docSnapshot.id,
        ...docSnapshot.data()
      }))
      .sort((a, b) => (a.dayOfWeek || 0) - (b.dayOfWeek || 0));
    
    console.log('getDoctorSchedule: Returning schedules:', schedules);
    
    return {
      success: true,
      data: schedules
    };
  } catch (error: any) {
    console.error('Get doctor schedule error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export const createDoctorSchedule = async (doctorId: string, scheduleData: any) => {
  try {
    console.log('createDoctorSchedule: Creating schedule for doctor:', doctorId, scheduleData);
    
    const scheduleDoc = {
      doctorId,
      ...scheduleData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };

    const docRef = await addDoc(collection(db, collections.doctorSchedules), scheduleDoc);
    
    // Create audit log
    await addDoc(collection(db, collections.auditLogs), {
      action: 'schedule_created',
      userId: 'mobile_app',
      entityType: 'schedule',
      entityId: docRef.id,
      timestamp: Timestamp.now(),
      details: `Schedule created for doctor ${doctorId}, day ${scheduleData.dayOfWeek}`
    });
    
    console.log('createDoctorSchedule: Created schedule with ID:', docRef.id);
    
    return {
      success: true,
      id: docRef.id
    };
  } catch (error: any) {
    console.error('Create doctor schedule error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export const updateDoctorSchedule = async (doctorId: string, scheduleId: string, scheduleData: any) => {
  try {
    console.log('updateDoctorSchedule: Updating schedule:', scheduleId, scheduleData);
    
    const scheduleRef = doc(db, collections.doctorSchedules, scheduleId);
    const updateData = {
      ...scheduleData,
      updatedAt: Timestamp.now()
    };
    
    await updateDoc(scheduleRef, updateData);
    
    // Create audit log
    await addDoc(collection(db, collections.auditLogs), {
      action: 'schedule_updated',
      userId: 'mobile_app',
      entityType: 'schedule',
      entityId: scheduleId,
      timestamp: Timestamp.now(),
      details: `Schedule updated for doctor ${doctorId}, day ${scheduleData.dayOfWeek}`
    });
    
    console.log('updateDoctorSchedule: Updated schedule successfully');
    
    return {
      success: true
    };
  } catch (error: any) {
    console.error('Update doctor schedule error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export const deleteDoctorSchedule = async (doctorId: string, scheduleId: string) => {
  try {
    console.log('deleteDoctorSchedule: Deleting schedule:', scheduleId);
    
    const scheduleRef = doc(db, collections.doctorSchedules, scheduleId);
    await deleteDoc(scheduleRef);
    
    // Create audit log
    await addDoc(collection(db, collections.auditLogs), {
      action: 'schedule_deleted',
      userId: 'mobile_app',
      entityType: 'schedule',
      entityId: scheduleId,
      timestamp: Timestamp.now(),
      details: `Schedule deleted for doctor ${doctorId}`
    });
    
    console.log('deleteDoctorSchedule: Deleted schedule successfully');
    
    return {
      success: true
    };
  } catch (error: any) {
    console.error('Delete doctor schedule error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};
