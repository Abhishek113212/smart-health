import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { Calendar, Clock, Users, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function DoctorDashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Record<string, unknown>[]>([]);
  const [queue, setQueue] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      api.getAppointments({ doctor_id: user.id }),
      api.getQueue({ doctor_id: user.id }),
    ]).then(([a, q]) => {
      setAppointments(a.appointments);
      setQueue(q.queue);
      setLoading(false);
    });
  }, [user]);

  if (loading) return <div className="text-center py-12 text-gray-500">Loading...</div>;

  const today = new Date().toISOString().split('T')[0];
  const todaysAppointments = appointments.filter(a => a.date === today);
  const activeQueue = queue.filter(q => q.status === 'waiting' || q.status === 'in_progress');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome, {user?.name as string}</h1>
        <p className="text-gray-500">{user?.specialty as string} | {user?.hospital_name as string}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border p-5">
          <Calendar className="h-8 w-8 text-blue-500 mb-2" />
          <p className="text-2xl font-bold text-gray-900">{todaysAppointments.length}</p>
          <p className="text-sm text-gray-500">Today&apos;s Appointments</p>
        </div>
        <div className="bg-white rounded-xl border p-5">
          <Clock className="h-8 w-8 text-orange-500 mb-2" />
          <p className="text-2xl font-bold text-gray-900">{activeQueue.length}</p>
          <p className="text-sm text-gray-500">In Queue</p>
        </div>
        <div className="bg-white rounded-xl border p-5">
          <Users className="h-8 w-8 text-green-500 mb-2" />
          <p className="text-2xl font-bold text-gray-900">{appointments.length}</p>
          <p className="text-sm text-gray-500">Total Appointments</p>
        </div>
        <div className="bg-white rounded-xl border p-5">
          <Star className="h-8 w-8 text-yellow-500 mb-2" />
          <p className="text-2xl font-bold text-gray-900">{user?.rating as number}</p>
          <p className="text-sm text-gray-500">Rating ({user?.total_ratings as number} reviews)</p>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link to="/doctor/appointments"
          className="bg-blue-50 rounded-xl p-5 border border-blue-200 hover:bg-blue-100 transition-colors">
          <Calendar className="h-6 w-6 text-blue-600 mb-2" />
          <h3 className="font-semibold text-gray-900">View Appointments</h3>
          <p className="text-sm text-gray-600">Manage your patient appointments</p>
        </Link>
        <Link to="/doctor/queue"
          className="bg-orange-50 rounded-xl p-5 border border-orange-200 hover:bg-orange-100 transition-colors">
          <Clock className="h-6 w-6 text-orange-600 mb-2" />
          <h3 className="font-semibold text-gray-900">Queue Management</h3>
          <p className="text-sm text-gray-600">View and manage patient queue</p>
        </Link>
      </div>

      {/* Today's Appointments */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Today&apos;s Appointments</h3>
        {todaysAppointments.length === 0 ? (
          <div className="text-center py-6 bg-white rounded-xl border text-gray-500">No appointments today</div>
        ) : (
          <div className="space-y-2">
            {todaysAppointments.map(apt => (
              <div key={apt.id as string} className="bg-white rounded-xl border p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{apt.patient_name as string}</p>
                  <div className="flex gap-3 text-sm text-gray-500 mt-1">
                    <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {apt.time as string}</span>
                    <span>{apt.reason as string}</span>
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                  apt.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                }`}>
                  {apt.status as string}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
