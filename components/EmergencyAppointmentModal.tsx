import { Picker } from '@react-native-picker/picker';
import { addDoc, collection, doc, getDocs, query, serverTimestamp, setDoc, where } from 'firebase/firestore';
import { AlertCircle, Calendar, Mail, Phone, User, X } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { db } from '../lib/firebase/config';
import { useScheduleOverrides } from '../lib/hooks/useScheduleOverrides';
import { getNextAvailableSlot } from '../lib/utils/slotAssignmentHelper';

interface Doctor {
    id: string;
    user?: {
        name: string;
    };
    name?: string; // Fallback if user.name not structured like web
    specialty: string;
    morningTime?: string;
    eveningTime?: string;
    morningStartTime?: string;
    morningEndTime?: string;
    eveningStartTime?: string;
    eveningEndTime?: string;
    availableSlots?: string[];
    startTime?: string;
    endTime?: string;
    consultationDuration?: number;
}

interface EmergencyAppointmentModalProps {
    visible: boolean;
    onClose: () => void;
    doctors: Doctor[];
    onAppointmentCreated?: () => void;
}

export default function EmergencyAppointmentModal({
    visible,
    onClose,
    doctors,
    onAppointmentCreated
}: EmergencyAppointmentModalProps) {
    const [formData, setFormData] = useState({
        patientName: '',
        phone: '+91 ',
        email: '',
        doctor: '',
        date: '',
        session: '',
        reason: ''
    });

    const [actionLoading, setActionLoading] = useState(false);
    const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
    const [sessionTime, setSessionTime] = useState('');

    // Force re-render to update session availability based on current time
    const [currentTime, setCurrentTime] = useState(new Date());

    // Schedule overrides for checking doctor availability
    const { fetchOverrides, overrides } = useScheduleOverrides();

    // Initialize date to today
    useEffect(() => {
        if (visible && !formData.date) {
            const today = new Date();
            const dateStr = today.getFullYear() + '-' +
                String(today.getMonth() + 1).padStart(2, '0') + '-' +
                String(today.getDate()).padStart(2, '0');
            setFormData(prev => ({ ...prev, date: dateStr }));
        }
    }, [visible]);

    // Update current time every minute
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(new Date());
        }, 60000);

        return () => clearInterval(interval);
    }, []);

    // Update selected doctor when doctor changes
    useEffect(() => {
        if (formData.doctor) {
            const doctor = doctors.find(d => d.id === formData.doctor);
            if (doctor) {
                setSelectedDoctor(doctor);
                fetchOverrides(formData.doctor);
            }
        } else {
            setSelectedDoctor(null);
            setSessionTime('');
        }
    }, [formData.doctor, doctors, fetchOverrides]);

    const formatTimeForDisplay = (time24: string | undefined, defaultTime: string): string => {
        if (!time24) return defaultTime;
        if (/^\d{2}:\d{2}$/.test(time24)) {
            const [hours, minutes] = time24.split(':').map(Number);
            const period = hours >= 12 ? 'PM' : 'AM';
            const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
            return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
        }
        return time24;
    };

    const normalizeTime = (time: string | undefined, defaultTime: string): string => {
        if (!time) return defaultTime;
        if (/^\d{2}:\d{2}$/.test(time)) return time;
        if (/^\d{2}:\d{2}:\d{2}/.test(time)) return time.substring(0, 5);
        try {
            const match = time.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
            if (match) {
                let hours = parseInt(match[1]);
                const minutes = match[2];
                const meridiem = match[3]?.toUpperCase();
                if (meridiem === 'PM' && hours !== 12) hours += 12;
                if (meridiem === 'AM' && hours === 12) hours = 0;
                return `${hours.toString().padStart(2, '0')}:${minutes}`;
            }
        } catch (e) {
            console.warn('Error parsing time:', time, e);
        }
        return defaultTime;
    };

    // Update session time display
    useEffect(() => {
        if (selectedDoctor && formData.session) {
            const session = formData.session as 'morning' | 'evening';
            if (session === 'morning') {
                const startTime = selectedDoctor.morningStartTime
                    ? formatTimeForDisplay(selectedDoctor.morningStartTime, '9:00 AM')
                    : (selectedDoctor.morningTime ? selectedDoctor.morningTime.split(' - ')[0] : '9:00 AM');
                const endTime = selectedDoctor.morningEndTime
                    ? formatTimeForDisplay(selectedDoctor.morningEndTime, '1:00 PM')
                    : (selectedDoctor.morningTime ? selectedDoctor.morningTime.split(' - ')[1] : '1:00 PM');
                setSessionTime(`${startTime} - ${endTime}`);
            } else {
                const startTime = selectedDoctor.eveningStartTime
                    ? formatTimeForDisplay(selectedDoctor.eveningStartTime, '2:00 PM')
                    : (selectedDoctor.eveningTime ? selectedDoctor.eveningTime.split(' - ')[0] : '2:00 PM');
                const endTime = selectedDoctor.eveningEndTime
                    ? formatTimeForDisplay(selectedDoctor.eveningEndTime, '6:00 PM')
                    : (selectedDoctor.eveningTime ? selectedDoctor.eveningTime.split(' - ')[1] : '6:00 PM');
                setSessionTime(`${startTime} - ${endTime}`);
            }
        } else {
            setSessionTime('');
        }
    }, [formData.session, selectedDoctor]);

    const formatDateForAPI = (dateString: string): string => {
        // Basic validation to ensure YYYY-MM-DD
        return dateString;
    };

    const isDoctorOnLeave = (date: string, session: 'morning' | 'evening'): { onLeave: boolean; reason?: string } => {
        if (!formData.doctor || !overrides.length || !date) {
            return { onLeave: false };
        }

        const dateStr = formatDateForAPI(date);

        const dateOverrides = overrides.filter(override => {
            const overrideDate = override.date.includes('T')
                ? override.date.split('T')[0]
                : override.date;

            const normalizedOverrideDate = overrideDate.substring(0, 10);
            const normalizedSelectedDate = dateStr.substring(0, 10);

            const isHoliday = override.type === 'holiday' ||
                (override as any).displayType === 'holiday' ||
                (override as any).displayType === 'special-event';

            return normalizedOverrideDate === normalizedSelectedDate && isHoliday;
        });

        if (dateOverrides.length === 0) {
            return { onLeave: false };
        }

        for (const override of dateOverrides) {
            if (!override.startTime || !override.endTime) {
                return {
                    onLeave: true,
                    reason: `Doctor is on leave: ${override.reason}`
                };
            }

            const overrideStartHour = parseInt(override.startTime.split(':')[0]);
            const overrideEndHour = parseInt(override.endTime.split(':')[0]);

            if (session === 'morning') {
                if (overrideStartHour === 9 && overrideEndHour === 12) {
                    return {
                        onLeave: true,
                        reason: `Doctor is on leave: ${override.reason}`
                    };
                }
            } else if (session === 'evening') {
                if (overrideStartHour === 14 && overrideEndHour === 18) {
                    return {
                        onLeave: true,
                        reason: `Doctor is on leave: ${override.reason}`
                    };
                }
            }
        }

        return { onLeave: false };
    };

    const resetForm = () => {
        setFormData({
            patientName: '',
            phone: '+91 ',
            email: '',
            doctor: '',
            date: '',
            session: '',
            reason: ''
        });
        setSelectedDoctor(null);
        setSessionTime('');
    };

    const handleInputChange = (name: string, value: string) => {
        if (name === 'date' && formData.session) {
            // Logic for changing date could potentially clear session if validation fails, 
            // but for emergency we allow flexibility.
        }
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePhoneChange = (text: string) => {
        let value = text;
        if (!value.startsWith('+91 ')) {
            // If user deleted part of prefix, restore it
            if (value.startsWith('+91')) {
                // Probably typed backspace on space
                value = '+91 ';
            } else {
                value = '+91 ';
            }
        }

        const numberPart = value.slice(4).replace(/\D/g, '');
        const limitedNumber = numberPart.slice(0, 10);
        const formattedValue = '+91 ' + limitedNumber;

        setFormData(prev => ({ ...prev, phone: formattedValue }));
    };

    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validDomains = [
        'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com',
        'protonmail.com', 'aol.com', 'live.com', 'msn.com', 'yandex.com',
        'zoho.com', 'mail.com', 'gmx.com', 'web.de', 'tutanota.com'
    ];

    const isValidDomain = (email: string) => {
        const domain = email.split('@')[1]?.toLowerCase();
        return validDomains.includes(domain);
    };

    const validateRequiredFields = () => {
        const { patientName, phone, doctor, date, session } = formData;

        if (!patientName.trim()) {
            Alert.alert('Error', 'Patient Name is required');
            return false;
        }
        if (phone === '+91 ' || phone.length < 14) { // +91 + 10 digits
            Alert.alert('Error', 'Phone number must be exactly 10 digits');
            return false;
        }
        if (!doctor) {
            Alert.alert('Error', 'Please select a doctor');
            return false;
        }
        if (!date) {
            Alert.alert('Error', 'Please select date');
            return false;
        }
        if (!session) {
            Alert.alert('Error', 'Please select a session');
            return false;
        }

        if (formData.email && formData.email.trim() !== '') {
            if (!validateEmail(formData.email)) {
                Alert.alert('Error', 'Please enter a valid email format');
                return false;
            }
            if (!isValidDomain(formData.email)) {
                Alert.alert('Error', 'Please use a valid email provider');
                return false;
            }
        }
        return true;
    };

    const generateTokenNumber = async (date: string, doctorId: string, session: string) => {
        try {
            const appointmentsRef = collection(db, 'appointments');
            const q = query(
                appointmentsRef,
                where('appointmentDate', '==', date),
                where('doctorId', '==', doctorId),
                where('session', '==', session),
                where('status', 'in', ['scheduled', 'confirmed', 'approved'])
            );

            const querySnapshot = await getDocs(q);
            return querySnapshot.size + 1;
        } catch (error) {
            console.error('Error generating token number:', error);
            return 1;
        }
    };

    const savePatient = async () => {
        try {
            const phoneId = formData.phone.replace(/\s/g, '').replace('+', '');

            const patientData = {
                name: formData.patientName.trim(),
                phone: formData.phone.trim(),
                email: formData.email.trim() || null,
                updatedAt: serverTimestamp()
            };

            const patientsRef = collection(db, 'patients');
            const q = query(patientsRef, where('phone', '==', formData.phone.trim()));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                const existingPatientDoc = querySnapshot.docs[0];
                await setDoc(doc(db, 'patients', existingPatientDoc.id), patientData, { merge: true });
            } else {
                const patientRef = doc(db, 'patients', phoneId);
                await setDoc(patientRef, {
                    ...patientData,
                    createdAt: serverTimestamp()
                });
            }
        } catch (error) {
            console.error('Error saving patient:', error);
        }
    };

    const checkSlotAvailability = async () => {
        try {
            const appointmentsRef = collection(db, 'appointments');
            const q = query(
                appointmentsRef,
                where('doctorId', '==', formData.doctor),
                where('appointmentDate', '==', formData.date),
                where('session', '==', formData.session),
                where('status', 'in', ['scheduled', 'confirmed'])
            );

            const querySnapshot = await getDocs(q);
            const maxAppointmentsPerSession = 20;

            if (querySnapshot.size >= maxAppointmentsPerSession) {
                Alert.alert('Unavailable', `This ${formData.session} session is fully booked.`);
                return false;
            }

            return true;
        } catch (error) {
            console.error('Error checking slot availability:', error);
            return true;
        }
    };

    const getSessionStartTime = () => {
        if (!selectedDoctor) return '09:00';

        if (formData.session === 'morning') {
            return normalizeTime(selectedDoctor.morningStartTime, '09:00');
        } else {
            return normalizeTime(selectedDoctor.eveningStartTime, '14:00');
        }
    };

    const handleSubmit = async () => {
        if (!validateRequiredFields()) return;

        if (formData.date && formData.session) {
            const leaveCheck = isDoctorOnLeave(formData.date, formData.session as 'morning' | 'evening');
            if (leaveCheck.onLeave) {
                Alert.alert('Doctor Unavailable', leaveCheck.reason || 'Doctor is on leave for this session');
                return;
            }
        }

        setActionLoading(true);

        try {
            const isAvailable = await checkSlotAvailability();
            if (!isAvailable) {
                setActionLoading(false);
                return;
            }

            await savePatient();

            const doctor = doctors.find(d => d.id === formData.doctor);
            if (!doctor) {
                Alert.alert('Error', 'Doctor not found');
                setActionLoading(false);
                return;
            }

            const appointmentsRef = collection(db, 'appointments');
            const q = query(
                appointmentsRef,
                where('doctorId', '==', formData.doctor),
                where('appointmentDate', '==', formData.date)
            );
            const snapshot = await getDocs(q);
            const existingAppointments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));

            const bookedSlots = existingAppointments
                .filter((apt: any) => {
                    if (apt.appointmentDate !== formData.date) return false;
                    const aptTime = apt.appointmentTime || '';
                    const aptTime24 = aptTime.includes(':') ? aptTime : '';
                    if (!aptTime24) return false;
                    const hour = parseInt(aptTime24.split(':')[0]);
                    const aptSession = hour < 13 ? 'morning' : 'evening';
                    return aptSession === formData.session;
                })
                .map((apt: any) => apt.appointmentTime);

            const tokenNumber = await generateTokenNumber(formData.date, formData.doctor, formData.session);

            const doctorData = {
                availableSlots: doctor.availableSlots || [],
                startTime: doctor.startTime,
                endTime: doctor.endTime,
                consultationDuration: doctor.consultationDuration,
                morningStartTime: doctor.morningStartTime,
                morningEndTime: doctor.morningEndTime,
                eveningStartTime: doctor.eveningStartTime,
                eveningEndTime: doctor.eveningEndTime
            };

            const appointmentTime = getNextAvailableSlot(
                doctorData,
                formData.date,
                formData.session as 'morning' | 'evening',
                bookedSlots
            ) || getSessionStartTime();

            const appointmentData = {
                tokenNumber: tokenNumber,
                patientId: '',
                patientName: formData.patientName.trim(),
                patientPhone: formData.phone.trim(),
                patientEmail: formData.email.trim() || null,
                doctorId: formData.doctor,
                doctorName: doctor.user?.name || doctor.name || 'Unknown',
                doctorSpecialty: doctor.specialty || '',
                appointmentDate: formData.date,
                session: formData.session,
                appointmentTime: appointmentTime,
                sessionDisplay: sessionTime,
                reason: formData.reason.trim() || null,
                status: 'scheduled',
                acceptanceStatus: 'pending',
                source: 'web', // Keeping source web to match existing logic, or could be 'mobile'
                duration: doctor.consultationDuration || 20,
                isEmergency: true,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                checkedInAt: null,
                completedAt: null,
                cancelledAt: null
            };

            await addDoc(appointmentsRef, appointmentData);

            Alert.alert(
                'Success',
                `Emergency appointment created successfully!\nToken #${tokenNumber} for ${formData.session === 'morning' ? 'Morning' : 'Evening'} session`
            );

            resetForm();
            onClose();

            if (onAppointmentCreated) {
                onAppointmentCreated();
            }

        } catch (error) {
            console.error('Error creating emergency appointment:', error);
            Alert.alert('Error', 'Failed to create emergency appointment. Please try again.');
        } finally {
            setActionLoading(false);
        }
    };

    if (!visible) return null;

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.centeredView}
            >
                <TouchableOpacity
                    style={styles.overlay}
                    activeOpacity={1}
                    onPress={onClose}
                />
                <View style={styles.modalView}>
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.headerTitleContainer}>
                            <AlertCircle size={24} color="#7F1D1D" />
                            <View style={styles.headerTextContainer}>
                                <Text style={styles.headerTitle}>Emergency Appointment</Text>
                                <Text style={styles.headerSubtitle}>Create an emergency appointment (available 24/7)</Text>
                            </View>
                        </View>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <X size={24} color="#DC2626" />
                        </TouchableOpacity>
                    </View>

                    {/* Info Banner */}
                    <View style={styles.banner}>
                        <View style={styles.bannerContent}>
                            <AlertCircle size={16} color="#D97706" style={styles.bannerIcon} />
                            <Text style={styles.bannerText}>
                                <Text style={{ fontWeight: 'bold' }}>Emergency appointments</Text> can be booked at any time.
                            </Text>
                        </View>
                    </View>

                    <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
                        {/* Patient Name */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Patient Name <Text style={styles.required}>*</Text></Text>
                            <View style={styles.inputWrapper}>
                                <User size={20} color="#9CA3AF" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    value={formData.patientName}
                                    onChangeText={(text) => handleInputChange('patientName', text)}
                                    placeholder="Enter patient name"
                                />
                            </View>
                        </View>

                        {/* Phone */}
                        <View style={styles.row}>
                            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                                <Text style={styles.label}>Phone Number <Text style={styles.required}>*</Text></Text>
                                <View style={styles.inputWrapper}>
                                    <Phone size={20} color="#9CA3AF" style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.input}
                                        value={formData.phone}
                                        onChangeText={handlePhoneChange}
                                        placeholder="+91 9876543210"
                                        keyboardType="phone-pad"
                                        maxLength={14}
                                    />
                                </View>
                            </View>
                        </View>

                        {/* Email */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Email</Text>
                            <View style={styles.inputWrapper}>
                                <Mail size={20} color="#9CA3AF" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    value={formData.email}
                                    onChangeText={(text) => handleInputChange('email', text)}
                                    placeholder="patient@example.com (optional)"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />
                            </View>
                        </View>

                        {/* Doctor */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Select Doctor <Text style={styles.required}>*</Text></Text>
                            <View style={styles.pickerWrapper}>
                                <Picker
                                    selectedValue={formData.doctor}
                                    onValueChange={(itemValue) => handleInputChange('doctor', itemValue)}
                                    style={styles.picker}
                                >
                                    <Picker.Item label="Choose a doctor" value="" />
                                    {doctors.map((doctor) => (
                                        <Picker.Item
                                            key={doctor.id}
                                            label={`${doctor.user?.name || doctor.name || 'Unknown'} - ${doctor.specialty}`}
                                            value={doctor.id}
                                        />
                                    ))}
                                </Picker>
                            </View>
                        </View>

                        {/* Date */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Date (YYYY-MM-DD) <Text style={styles.required}>*</Text></Text>
                            <View style={styles.inputWrapper}>
                                <Calendar size={20} color="#9CA3AF" style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    value={formData.date}
                                    onChangeText={(text) => handleInputChange('date', text)}
                                    placeholder="YYYY-MM-DD"
                                />
                            </View>
                        </View>

                        {/* Session */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Session <Text style={styles.required}>*</Text></Text>
                            <View style={styles.pickerWrapper}>
                                <Picker
                                    selectedValue={formData.session}
                                    onValueChange={(itemValue) => handleInputChange('session', itemValue)}
                                    style={styles.picker}
                                >
                                    <Picker.Item label="Select Session" value="" />
                                    <Picker.Item label="Morning" value="morning" />
                                    <Picker.Item label="Evening" value="evening" />
                                </Picker>
                            </View>
                        </View>

                        {sessionTime ? (
                            <Text style={styles.sessionTimeText}>Session Time: {sessionTime}</Text>
                        ) : null}

                        {/* Reason */}
                        {/* Not adding reason field explicitly in UI as per checking web UI, wait, web has it in state but maybe I missed it in UI view.
               Checked web scan again: line 48 in state, but lines 669-720 don't show reason input.
               I will skip reason input in UI to valid field count match, or add if it was missed in my read window.
               Actually lines 667-800 show inputs. I didn't see reason input in the first 800 lines. 
               Wait, let me double check the "Reason" field in web.
               Ah, the view_file truncated at 800 lines. The form might continue.
               But the prompt said "exactly like a web".
               I should probably add it just in case, or stick to what I saw.
               Since I saw `reason` in `formData` state (line 48) and `appointmentData` (line 588), I'll add it.
            */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Reason (Optional)</Text>
                            <View style={styles.inputWrapper}>
                                <TextInput
                                    style={styles.input}
                                    value={formData.reason}
                                    onChangeText={(text) => handleInputChange('reason', text)}
                                    placeholder="Reason for visit"
                                />
                            </View>
                        </View>

                        <View style={{ height: 20 }} />
                    </ScrollView>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <TouchableOpacity
                            style={[styles.button, styles.cancelButton]}
                            onPress={onClose}
                            disabled={actionLoading}
                        >
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.button, styles.submitButton]}
                            onPress={handleSubmit}
                            disabled={actionLoading}
                        >
                            {actionLoading ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text style={styles.submitButtonText}>Create Appointment</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalView: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        width: '90%',
        maxHeight: '90%',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#FEF2F2', // red-50
        borderBottomWidth: 1,
        borderBottomColor: '#FECACA', // red-200
    },
    headerTitleContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerTextContainer: {
        marginLeft: 10,
        flex: 1,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#7F1D1D', // red-900
    },
    headerSubtitle: {
        fontSize: 12,
        color: '#B91C1C', // red-700
    },
    closeButton: {
        padding: 5,
    },
    banner: {
        padding: 12,
        margin: 20,
        marginBottom: 10,
        backgroundColor: '#FFFBEB', // amber-50
        borderWidth: 1,
        borderColor: '#FDE68A', // amber-200
        borderRadius: 8,
    },
    bannerContent: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    bannerIcon: {
        marginTop: 2,
        marginRight: 8,
    },
    bannerText: {
        fontSize: 12,
        color: '#92400E', // amber-800
        flex: 1,
    },
    formContainer: {
        paddingHorizontal: 20,
    },
    inputGroup: {
        marginBottom: 16,
    },
    row: {
        flexDirection: 'row',
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    required: {
        color: '#EF4444',
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 8,
        paddingHorizontal: 12,
        backgroundColor: '#fff',
    },
    inputIcon: {
        marginRight: 8,
    },
    input: {
        flex: 1,
        paddingVertical: 12,
        fontSize: 16,
        color: '#111827',
    },
    pickerWrapper: {
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 8,
        backgroundColor: '#fff',
        overflow: 'hidden',
    },
    picker: {
        height: 50,
        width: '100%',
    },
    sessionTimeText: {
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 16,
        fontStyle: 'italic',
    },
    footer: {
        flexDirection: 'row',
        padding: 20,
        gap: 12,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        backgroundColor: 'white',
    },
    button: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelButton: {
        backgroundColor: '#F3F4F6',
    },
    cancelButtonText: {
        color: '#374151',
        fontWeight: '600',
    },
    submitButton: {
        backgroundColor: '#DC2626',
    },
    submitButtonText: {
        color: 'white',
        fontWeight: '600',
    },
});
