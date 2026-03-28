import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Calendar, Clock, MapPin, User, Stethoscope } from 'lucide-react';

export default function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getAllAppointments().then(d => { setAppointments(d.appointments); setLoading(false); });
  }, []);

  const statusColors: Record<string, string> = {
    confirmed: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
    completed: 'bg-gray-100 text-gray-600',
  };

  if (loading) return <div className="text-center py-12 text-gray-500">Loading...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">All Appointments</h1>
        <p className="text-gray-500">{appointments.length} total appointments</p>
      </div>

      {appointments.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border text-gray-500">No appointments</div>
      ) : (
        <div className="bg-white rounded-xl border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Patient</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Doctor</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Date & Time</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Hospital</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {appointments.map(apt => (
                  <tr key={apt.id as string} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">{apt.patient_name as string}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Stethoscope className="h-4 w-4 text-gray-400" />
                        <div>
                          <span className="font-medium">{apt.doctor_name as string}</span>
                          <p className="text-xs text-blue-600">{apt.specialty as string}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-gray-600">
                        <Calendar className="h-3.5 w-3.5" /> {apt.date as string}
                        <Clock className="h-3.5 w-3.5 ml-2" /> {apt.time as string}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-gray-600">
                        <MapPin className="h-3.5 w-3.5" /> {apt.hospital_name as string}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[apt.status as string] || 'bg-gray-100'}`}>
                        {apt.status as string}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
