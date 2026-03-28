import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '@/lib/api';
import {
  Stethoscope, Users, Calendar, Clock, Building2, Star,
  Activity, ArrowRight
} from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getAdminStats().then(d => { setStats(d); setLoading(false); });
  }, []);

  if (loading) return <div className="text-center py-12 text-gray-500">Loading...</div>;

  const statCards = [
    { label: 'Total Doctors', value: stats.total_doctors, icon: Stethoscope, color: 'blue' },
    { label: 'Total Patients', value: stats.total_patients, icon: Users, color: 'green' },
    { label: 'Total Appointments', value: stats.total_appointments, icon: Calendar, color: 'purple' },
    { label: "Today's Appointments", value: stats.todays_appointments, icon: Activity, color: 'orange' },
    { label: 'Active Queue', value: stats.active_queue, icon: Clock, color: 'red' },
    { label: 'Hospitals', value: stats.total_hospitals, icon: Building2, color: 'indigo' },
    { label: 'Specialties', value: stats.specialties_count, icon: Stethoscope, color: 'teal' },
    { label: 'Total Reviews', value: stats.total_reviews, icon: Star, color: 'yellow' },
  ];

  const colorMap: Record<string, string> = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600',
    red: 'bg-red-100 text-red-600',
    indigo: 'bg-indigo-100 text-indigo-600',
    teal: 'bg-teal-100 text-teal-600',
    yellow: 'bg-yellow-100 text-yellow-600',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500">Overview of MediQueue platform</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(s => (
          <div key={s.label} className="bg-white rounded-xl border p-5">
            <div className={`w-10 h-10 rounded-lg ${colorMap[s.color]} flex items-center justify-center mb-3`}>
              <s.icon className="h-5 w-5" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            <p className="text-sm text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link to="/admin/doctors" className="bg-blue-50 rounded-xl p-5 border border-blue-200 hover:bg-blue-100 transition-colors group">
          <Stethoscope className="h-6 w-6 text-blue-600 mb-2" />
          <h3 className="font-semibold text-gray-900 flex items-center gap-1">
            Manage Doctors <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
          </h3>
          <p className="text-sm text-gray-600">Add, view, and remove doctors</p>
        </Link>
        <Link to="/admin/appointments" className="bg-purple-50 rounded-xl p-5 border border-purple-200 hover:bg-purple-100 transition-colors group">
          <Calendar className="h-6 w-6 text-purple-600 mb-2" />
          <h3 className="font-semibold text-gray-900 flex items-center gap-1">
            All Appointments <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
          </h3>
          <p className="text-sm text-gray-600">View all platform appointments</p>
        </Link>
        <Link to="/admin/patients" className="bg-green-50 rounded-xl p-5 border border-green-200 hover:bg-green-100 transition-colors group">
          <Users className="h-6 w-6 text-green-600 mb-2" />
          <h3 className="font-semibold text-gray-900 flex items-center gap-1">
            All Patients <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
          </h3>
          <p className="text-sm text-gray-600">View registered patients</p>
        </Link>
      </div>
    </div>
  );
}
