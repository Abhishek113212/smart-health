import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import {
  Plus, Trash2, Star, MapPin, X, Clock, IndianRupee
} from 'lucide-react';

export default function AdminDoctorsPage() {
  const [doctors, setDoctors] = useState<Record<string, unknown>[]>([]);
  const [hospitals, setHospitals] = useState<Record<string, unknown>[]>([]);
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    name: '', specialty: '', hospital_id: '', experience: '', fee: '',
    bio: '', education: '', email: '',
    available_days: [] as string[], slots: ['09:00', '10:00', '11:00', '14:00', '15:00']
  });

  useEffect(() => {
    Promise.all([api.getDoctors(), api.getHospitals(), api.getSpecialties()]).then(([d, h, s]) => {
      setDoctors(d.doctors);
      setHospitals(h.hospitals);
      setSpecialties(s.specialties);
      setLoading(false);
    });
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createDoctor({
        ...form,
        experience: parseInt(form.experience),
        fee: parseInt(form.fee),
      });
      const d = await api.getDoctors();
      setDoctors(d.doctors);
      setShowAdd(false);
      setForm({ name: '', specialty: '', hospital_id: '', experience: '', fee: '', bio: '', education: '', email: '', available_days: [], slots: ['09:00', '10:00', '11:00', '14:00', '15:00'] });
    } catch {
      alert('Failed to add doctor');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this doctor?')) return;
    await api.deleteDoctor(id);
    setDoctors(prev => prev.filter(d => d.id !== id));
  };

  const toggleDay = (day: string) => {
    setForm(prev => ({
      ...prev,
      available_days: prev.available_days.includes(day)
        ? prev.available_days.filter(d => d !== day)
        : [...prev.available_days, day]
    }));
  };

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  if (loading) return <div className="text-center py-12 text-gray-500">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Doctors</h1>
          <p className="text-gray-500">{doctors.length} doctors registered</p>
        </div>
        <button onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
          {showAdd ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showAdd ? 'Cancel' : 'Add Doctor'}
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleAdd} className="bg-white rounded-xl border p-6 space-y-4">
          <h3 className="font-semibold text-gray-900">Add New Doctor</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input type="text" placeholder="Full Name (e.g., Dr. Name)" value={form.name}
              onChange={e => setForm({...form, name: e.target.value})}
              className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required />
            <input type="email" placeholder="Email" value={form.email}
              onChange={e => setForm({...form, email: e.target.value})}
              className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required />
            <select value={form.specialty} onChange={e => setForm({...form, specialty: e.target.value})}
              className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required>
              <option value="">Select Specialty</option>
              {specialties.map(s => <option key={s}>{s}</option>)}
            </select>
            <select value={form.hospital_id} onChange={e => setForm({...form, hospital_id: e.target.value})}
              className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required>
              <option value="">Select Hospital</option>
              {hospitals.map(h => <option key={h.id as string} value={h.id as string}>{h.name as string}</option>)}
            </select>
            <input type="number" placeholder="Experience (years)" value={form.experience}
              onChange={e => setForm({...form, experience: e.target.value})}
              className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required />
            <input type="number" placeholder="Fee (INR)" value={form.fee}
              onChange={e => setForm({...form, fee: e.target.value})}
              className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required />
          </div>
          <input type="text" placeholder="Education" value={form.education}
            onChange={e => setForm({...form, education: e.target.value})}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required />
          <textarea placeholder="Bio / Description" value={form.bio}
            onChange={e => setForm({...form, bio: e.target.value})}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none h-20 resize-none" required />
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Available Days</p>
            <div className="flex flex-wrap gap-2">
              {days.map(day => (
                <button key={day} type="button" onClick={() => toggleDay(day)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                    form.available_days.includes(day)
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'border-gray-300 text-gray-600 hover:border-blue-400'
                  }`}>
                  {day}
                </button>
              ))}
            </div>
          </div>
          <button type="submit"
            className="px-6 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700">
            Add Doctor
          </button>
        </form>
      )}

      <div className="space-y-3">
        {doctors.map(doc => (
          <div key={doc.id as string} className="bg-white rounded-xl border p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold">
                {doc.avatar as string}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{doc.name as string}</h3>
                <div className="flex flex-wrap gap-2 text-sm text-gray-500">
                  <span className="text-blue-600 font-medium">{doc.specialty as string}</span>
                  <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {doc.hospital_name as string}</span>
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {doc.experience as number}y</span>
                  <span className="flex items-center gap-1"><IndianRupee className="h-3 w-3" /> {doc.fee as number}</span>
                  <span className="flex items-center gap-1"><Star className="h-3 w-3 fill-yellow-400 text-yellow-400" /> {doc.rating as number}</span>
                </div>
              </div>
            </div>
            <button onClick={() => handleDelete(doc.id as string)}
              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
