const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Request failed' }));
    throw new Error(err.detail || 'Request failed');
  }
  return res.json();
}

export const api = {
  // Auth
  login: (email: string, password: string, role: string) =>
    request<{ success: boolean; user: Record<string, unknown> }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, role }),
    }),
  register: (data: Record<string, unknown>) =>
    request<{ success: boolean; user: Record<string, unknown> }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Doctors
  getDoctors: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<{ doctors: Record<string, unknown>[] }>(`/api/doctors${query}`);
  },
  getDoctor: (id: string) =>
    request<{ doctor: Record<string, unknown>; reviews: Record<string, unknown>[] }>(`/api/doctors/${id}`),
  getSlots: (doctorId: string, date: string) =>
    request<{ slots: string[]; all_slots: string[]; booked_slots: string[] }>(
      `/api/doctors/${doctorId}/slots?date=${date}`
    ),
  getSpecialties: () => request<{ specialties: string[] }>('/api/specialties'),
  getHospitals: () => request<{ hospitals: Record<string, unknown>[] }>('/api/hospitals'),

  // Appointments
  createAppointment: (data: Record<string, unknown>) =>
    request<{ success: boolean; appointment: Record<string, unknown> }>('/api/appointments', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getAppointments: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<{ appointments: Record<string, unknown>[] }>(`/api/appointments${query}`);
  },
  updateAppointment: (id: string, status: string) =>
    request<{ success: boolean }>(`/api/appointments/${id}?status=${status}`, { method: 'PATCH' }),

  // Queue
  getQueue: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<{ queue: Record<string, unknown>[] }>(`/api/queue${query}`);
  },
  checkIn: (appointmentId: string) =>
    request<{ success: boolean; queue_entry: Record<string, unknown> }>(`/api/queue/checkin/${appointmentId}`, {
      method: 'POST',
    }),
  updateQueue: (queueId: string, status: string) =>
    request<{ success: boolean }>(`/api/queue/${queueId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  // Reviews
  createReview: (data: Record<string, unknown>) =>
    request<{ success: boolean }>('/api/reviews', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getReviews: (doctorId: string) =>
    request<{ reviews: Record<string, unknown>[] }>(`/api/reviews/${doctorId}`),

  // Medical Records
  getMedicalRecords: (patientId: string, hospitalId?: string) => {
    const query = hospitalId ? `?hospital_id=${hospitalId}` : '';
    return request<{ records: Record<string, unknown>[]; hospitals_visited: string[]; total_records: number }>(
      `/api/medical-records/${patientId}${query}`
    );
  },
  getPatientRecordsForDoctor: (doctorId: string, patientId: string) =>
    request<{
      patient: Record<string, unknown>;
      records: Record<string, unknown>[];
      total_visits: number;
      hospitals_visited: string[];
    }>(`/api/medical-records/doctor/${doctorId}/patient/${patientId}`),

  // Admin
  getAdminStats: () => request<Record<string, number>>('/api/admin/stats'),
  createDoctor: (data: Record<string, unknown>) =>
    request<{ success: boolean }>('/api/admin/doctors', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  deleteDoctor: (id: string) =>
    request<{ success: boolean }>(`/api/admin/doctors/${id}`, { method: 'DELETE' }),
  getAllAppointments: () =>
    request<{ appointments: Record<string, unknown>[] }>('/api/admin/appointments'),
  getPatients: () => request<{ patients: Record<string, unknown>[] }>('/api/patients'),
};
