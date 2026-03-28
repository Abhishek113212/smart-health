import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { Calendar, Clock, User, FileText, ChevronDown, ChevronUp, Building2 } from 'lucide-react';

export default function DoctorAppointments() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedPatient, setExpandedPatient] = useState<string | null>(null);
  const [patientRecords, setPatientRecords] = useState<{
    patient: Record<string, unknown>;
    records: Record<string, unknown>[];
    hospitals_visited: string[];
  } | null>(null);
  const [loadingRecords, setLoadingRecords] = useState(false);

  useEffect(() => {
    if (!user) return;
    api.getAppointments({ doctor_id: user.id }).then(d => {
      setAppointments(d.appointments);
      setLoading(false);
    });
  }, [user]);

  const viewPatientHistory = async (patientId: string) => {
    if (expandedPatient === patientId) {
      setExpandedPatient(null);
      setPatientRecords(null);
      return;
    }
    setExpandedPatient(patientId);
    setLoadingRecords(true);
    try {
      const data = await api.getPatientRecordsForDoctor(user!.id, patientId);
      setPatientRecords(data);
    } catch {
      setPatientRecords(null);
    } finally {
      setLoadingRecords(false);
    }
  };

  if (loading) return <div className="text-center py-12 text-gray-500">Loading...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Patient Appointments</h1>
        <p className="text-gray-500">View appointments and access patient medical histories across hospitals</p>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-blue-600" />
          <p className="text-sm text-blue-800 font-medium">
            Click &quot;View History&quot; to access patient medical records from ALL hospitals for better diagnosis.
          </p>
        </div>
      </div>

      {appointments.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border text-gray-500">No appointments found</div>
      ) : (
        <div className="space-y-3">
          {appointments.map(apt => (
            <div key={apt.id as string} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <User className="h-4 w-4 text-gray-400" />
                    <h3 className="font-semibold text-gray-900">{apt.patient_name as string}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      apt.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                      apt.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {apt.status as string}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-3 text-sm text-gray-500">
                    <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {apt.date as string}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {apt.time as string}</span>
                    <span>Reason: {apt.reason as string}</span>
                  </div>
                </div>
                <button onClick={() => viewPatientHistory(apt.patient_id as string)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-purple-50 text-purple-700 border border-purple-200 rounded-lg text-sm font-medium hover:bg-purple-100 transition-colors">
                  <FileText className="h-4 w-4" />
                  {expandedPatient === apt.patient_id ? 'Hide' : 'View'} History
                  {expandedPatient === apt.patient_id ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                </button>
              </div>

              {expandedPatient === apt.patient_id && (
                <div className="border-t bg-purple-50 p-4">
                  {loadingRecords ? (
                    <p className="text-sm text-gray-500">Loading patient records...</p>
                  ) : patientRecords ? (
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-4 text-sm">
                        <span><strong>Age:</strong> {patientRecords.patient.age as number}</span>
                        <span><strong>Gender:</strong> {patientRecords.patient.gender as string}</span>
                        <span><strong>Blood:</strong> {patientRecords.patient.blood_group as string}</span>
                        <span><strong>Phone:</strong> {patientRecords.patient.phone as string}</span>
                      </div>
                      {(patientRecords.patient.allergies as string[])?.length > 0 && (
                        <div className="flex gap-1">
                          {(patientRecords.patient.allergies as string[]).map(a => (
                            <span key={a} className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">Allergy: {a}</span>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm text-purple-700 font-medium">
                        <Building2 className="h-4 w-4" />
                        Records from {patientRecords.hospitals_visited.length} hospital(s): {patientRecords.hospitals_visited.join(', ')}
                      </div>
                      {patientRecords.records.length === 0 ? (
                        <p className="text-sm text-gray-500">No previous medical records</p>
                      ) : (
                        patientRecords.records.map(rec => (
                          <div key={rec.id as string} className="bg-white rounded-lg p-3 border border-purple-200">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium text-gray-900 text-sm">{rec.diagnosis as string}</span>
                              <span className="text-xs text-gray-500">{rec.date as string}</span>
                            </div>
                            <div className="text-xs text-gray-500 mb-1">
                              {rec.doctor_name as string} | {rec.hospital_name as string} | {rec.specialty as string}
                            </div>
                            <p className="text-xs text-gray-600 bg-gray-50 p-1.5 rounded">{rec.prescription as string}</p>
                          </div>
                        ))
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">Could not load patient records</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
