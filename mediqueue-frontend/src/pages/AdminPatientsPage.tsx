import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { User, Mail, Phone, Droplets, Calendar } from 'lucide-react';

export default function AdminPatientsPage() {
  const [patients, setPatients] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getPatients().then(d => { setPatients(d.patients); setLoading(false); });
  }, []);

  if (loading) return <div className="text-center py-12 text-gray-500">Loading...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">All Patients</h1>
        <p className="text-gray-500">{patients.length} registered patients</p>
      </div>

      {patients.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border text-gray-500">No patients registered</div>
      ) : (
        <div className="grid gap-4">
          {patients.map(p => (
            <div key={p.id as string} className="bg-white rounded-xl border p-5">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                  {(p.name as string).charAt(0)}
                </div>
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-gray-400" />
                    <span className="font-medium text-gray-900">{p.name as string}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="h-4 w-4 text-gray-400" />
                    {p.email as string}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="h-4 w-4 text-gray-400" />
                    {p.phone as string}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Droplets className="h-4 w-4 text-red-400" />
                    {p.blood_group as string} | Age: {p.age as number} | {p.gender as string}
                  </div>
                </div>
                <div className="flex items-center gap-1 text-sm bg-blue-50 text-blue-700 px-3 py-1 rounded-full">
                  <Calendar className="h-3.5 w-3.5" />
                  {p.total_appointments as number} appts
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
