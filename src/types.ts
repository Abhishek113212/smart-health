export interface User {
  id: string;
  name: string;
  email: string;
  role: 'patient' | 'doctor' | 'admin';
  specialization?: string;
  hospitalId?: string;
}

export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  hospitalId: string;
  hospital: string;
  rating: number;
  reviews: number;
  availability: string[];
}

export interface Hospital {
  id: string;
  name: string;
  location: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  doctorName: string;
  hospitalName: string;
  date: string;
  time: string;
  tokenNumber: number;
  status: 'scheduled' | 'completed' | 'cancelled';
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  doctorId: string;
  date: string;
  diagnosis: string;
  prescription: string;
  hospital: string;
}

export interface QueueStatus {
  currentToken: number;
  waiting: number;
  activeToken: number | null;
}
