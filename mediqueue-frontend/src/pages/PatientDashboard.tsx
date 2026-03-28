import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import {
  FileText, Building2, Calendar, Heart, Droplets, Phone,
  Mail, User, AlertTriangle, ChevronDown, ChevronUp
} from 'lucide-react';

export default function PatientDashboard() {
  const { user } = useAuth();
  const [records, setRecords] = useState<Record<string, unknown>[]>([]);
  const [hospitals, setHospitals] = useState<string[]>([]);
  const [filterHospital, setFilterHospital] = useState('');
  const [expandedRecord, setExpandedRecord] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    api.getMedicalRecords(user.id).then(d => {
      setRecords(d.records);
      setHospitals(d.hospitals_visited);
      setLoading(false);
    });
  }, [user]);

  useEffect(() => {
    if (!user) return;
    if (filterHospital) {
      const hospitalData = [
        { id: 'h1', name: 'City General Hospital' },
        { id: 'h2', name: 'Apollo Medical Center' },
        { id: 'h3', name: 'Fortis Healthcare' },
        { id: 'h4', name: 'Max Super Specialty' },
      ];
      const h = hospitalData.find(h => h.name === filterHospital);
      if (h) {
        api.getMedicalRecords(user.id, h.id).then(d => setRecords(d.records));
      }
    } else {
      api.getMedicalRecords(user.id).then(d => setRecords(d.records));
    }
  }, [filterHospital, user]);

  if (loading) return <div className="text-center py-12 text-gray-500">Loading...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Patient Dashboard</h1>
        <p className="text-gray-500">Your health profile and medical records across hospitals</p>
      </div>

      {/* Patient Info */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
            {(user?.name as string)?.charAt(0)}
          </div>
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600">{user?.name as string}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600">{user?.email}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600">{user?.phone as string}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Droplets className="h-4 w-4 text-red-400" />
              <span className="text-gray-600">Blood: {user?.blood_group as string}</span>
            </div>
          </div>
        </div>
        {((user?.allergies as string[])?.length > 0 || (user?.chronic_conditions as string[])?.length > 0) && (
          <div className="mt-4 pt-4 border-t flex flex-wrap gap-2">
            {(user?.allergies as string[])?.map(a => (
              <span key={a} className="flex items-center gap-1 text-xs bg-red-50 text-red-700 px-2 py-1 rounded-full">
                <AlertTriangle className="h-3 w-3" /> Allergy: {a}
              </span>
            ))}
            {(user?.chronic_conditions as string[])?.map(c => (
              <span key={c} className="flex items-center gap-1 text-xs bg-orange-50 text-orange-700 px-2 py-1 rounded-full">
                <Heart className="h-3 w-3" /> {c}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Cross-Hospital Records Highlight */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-5 border border-purple-100">
        <div className="flex items-center gap-3 mb-3">
          <Building2 className="h-6 w-6 text-purple-600" />
          <div>
            <h3 className="font-semibold text-gray-900">Cross-Hospital Medical Records</h3>
            <p className="text-sm text-gray-600">
              Your complete medical history from {hospitals.length} hospital{hospitals.length !== 1 ? 's' : ''} in one place
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setFilterHospital('')}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              !filterHospital ? 'bg-purple-600 text-white' : 'bg-white text-gray-700 border hover:bg-gray-50'
            }`}>
            All Hospitals ({records.length})
          </button>
          {hospitals.map(h => (
            <button key={h} onClick={() => setFilterHospital(h)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filterHospital === h ? 'bg-purple-600 text-white' : 'bg-white text-gray-700 border hover:bg-gray-50'
              }`}>
              {h}
            </button>
          ))}
        </div>
      </div>

      {/* Medical Records */}
      <div className="space-y-3">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <FileText className="h-5 w-5 text-blue-600" /> Medical Records
        </h3>
        {records.length === 0 ? (
          <div className="text-center py-8 bg-white rounded-xl border text-gray-500">No medical records found</div>
        ) : (
          records.map(rec => (
            <div key={rec.id as string} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <button
                onClick={() => setExpandedRecord(expandedRecord === rec.id as string ? null : rec.id as string)}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-900">{rec.diagnosis as string}</span>
                    <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">{rec.specialty as string}</span>
                  </div>
                  <div className="flex flex-wrap gap-3 text-sm text-gray-500">
                    <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {rec.date as string}</span>
                    <span>{rec.doctor_name as string}</span>
                    <span className="flex items-center gap-1"><Building2 className="h-3.5 w-3.5" /> {rec.hospital_name as string}</span>
                  </div>
                </div>
                {expandedRecord === rec.id ? <ChevronUp className="h-5 w-5 text-gray-400" /> : <ChevronDown className="h-5 w-5 text-gray-400" />}
              </button>
              {expandedRecord === rec.id && (
                <div className="px-4 pb-4 border-t space-y-3 pt-3">
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1">PRESCRIPTION</p>
                    <p className="text-sm text-gray-800 bg-green-50 p-2 rounded">{rec.prescription as string}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1">NOTES</p>
                    <p className="text-sm text-gray-700">{rec.notes as string}</p>
                  </div>
                  {rec.vitals ? (
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-1">VITALS</p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {Object.entries(rec.vitals as Record<string, string>).map(([k, v]) => (
                          <div key={k} className="bg-gray-50 p-2 rounded text-center">
                            <p className="text-xs text-gray-500 uppercase">{k}</p>
                            <p className="text-sm font-semibold text-gray-900">{v}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
