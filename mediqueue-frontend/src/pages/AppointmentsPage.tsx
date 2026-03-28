import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { Calendar, Clock, MapPin, CheckCircle, XCircle, AlertCircle, LogIn } from 'lucide-react';

export default function AppointmentsPage() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    api.getAppointments({ patient_id: user.id }).then(d => {
      setAppointments(d.appointments);
      setLoading(false);
    });
  }, [user]);

  const handleCancel = async (id: string) => {
    if (!confirm('Cancel this appointment?')) return;
    await api.updateAppointment(id, 'cancelled');
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'cancelled' } : a));
  };

  const handleCheckIn = async (id: string) => {
    await api.checkIn(id);
    alert('Checked in! View your queue status in the Queue Tracker.');
  };

  const statusColors: Record<string, string> = {
    confirmed: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
    completed: 'bg-gray-100 text-gray-600',
  };

  if (loading) return <div className="text-center py-12 text-gray-500">Loading...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Appointments</h1>
        <p className="text-gray-500">View and manage your booked appointments</p>
      </div>

      {appointments.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border">
          <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No appointments yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {appointments.map(apt => (
            <div key={apt.id as string} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900">{apt.doctor_name as string}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[apt.status as string] || 'bg-gray-100'}`}>
                      {apt.status as string}
                    </span>
                  </div>
                  <p className="text-sm text-blue-600 font-medium">{apt.specialty as string}</p>
                  <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-500">
                    <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {apt.date as string}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {apt.time as string}</span>
                    <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {apt.hospital_name as string}</span>
                  </div>
                  {apt.reason ? <p className="text-sm text-gray-600 mt-1">Reason: {apt.reason as string}</p> : null}
                </div>
                {apt.status === 'confirmed' && (
                  <div className="flex gap-2">
                    <button onClick={() => handleCheckIn(apt.id as string)}
                      className="flex items-center gap-1.5 px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700">
                      <LogIn className="h-4 w-4" /> Check In
                    </button>
                    <button onClick={() => handleCancel(apt.id as string)}
                      className="flex items-center gap-1.5 px-3 py-2 border border-red-300 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50">
                      <XCircle className="h-4 w-4" /> Cancel
                    </button>
                  </div>
                )}
                {apt.status === 'completed' && <CheckCircle className="h-6 w-6 text-green-500" />}
                {apt.status === 'cancelled' && <AlertCircle className="h-6 w-6 text-red-400" />}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
