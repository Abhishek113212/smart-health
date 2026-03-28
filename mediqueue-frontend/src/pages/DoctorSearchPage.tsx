import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '@/lib/api';
import { Search, Star, MapPin, Clock, IndianRupee, Filter, ChevronDown } from 'lucide-react';

export default function DoctorSearchPage() {
  const [doctors, setDoctors] = useState<Record<string, unknown>[]>([]);
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [hospitals, setHospitals] = useState<Record<string, unknown>[]>([]);
  const [search, setSearch] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [hospitalId, setHospitalId] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    Promise.all([api.getSpecialties(), api.getHospitals()]).then(([s, h]) => {
      setSpecialties(s.specialties);
      setHospitals(h.hospitals);
    });
  }, []);

  useEffect(() => {
    setLoading(true);
    const params: Record<string, string> = {};
    if (search) params.search = search;
    if (specialty) params.specialty = specialty;
    if (hospitalId) params.hospital_id = hospitalId;
    if (sortBy) params.sort_by = sortBy;
    api.getDoctors(params).then(d => { setDoctors(d.doctors); setLoading(false); });
  }, [search, specialty, hospitalId, sortBy]);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`h-3.5 w-3.5 ${i < Math.round(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
    ));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Find Doctors</h1>
        <p className="text-gray-500">Search by name, specialty, hospital and view ratings</p>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-4">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search doctors by name or specialty..."
              className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
          <button onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2.5 border rounded-lg hover:bg-gray-50 text-gray-700">
            <Filter className="h-4 w-4" /> Filters <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>
        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t">
            <select value={specialty} onChange={e => setSpecialty(e.target.value)}
              className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm">
              <option value="">All Specialties</option>
              {specialties.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={hospitalId} onChange={e => setHospitalId(e.target.value)}
              className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm">
              <option value="">All Hospitals</option>
              {hospitals.map(h => <option key={h.id as string} value={h.id as string}>{h.name as string}</option>)}
            </select>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)}
              className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm">
              <option value="">Sort By</option>
              <option value="rating">Highest Rating</option>
              <option value="experience">Most Experience</option>
              <option value="fee_low">Fee: Low to High</option>
              <option value="fee_high">Fee: High to Low</option>
            </select>
          </div>
        )}
      </div>

      {/* Results */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading doctors...</div>
      ) : doctors.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No doctors found matching your criteria</div>
      ) : (
        <div className="grid gap-4">
          {doctors.map(doc => (
            <Link key={doc.id as string} to={`/doctors/${doc.id as string}`}
              className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg hover:border-blue-200 transition-all">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white text-xl font-bold">
                    {doc.avatar as string}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{doc.name as string}</h3>
                      <p className="text-blue-600 font-medium text-sm">{doc.specialty as string}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="flex">{renderStars(doc.rating as number)}</div>
                      <span className="text-sm font-semibold text-gray-900 ml-1">{doc.rating as number}</span>
                      <span className="text-xs text-gray-500">({doc.total_ratings as number})</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-1">{doc.bio as string}</p>
                  <div className="flex flex-wrap gap-3 mt-3 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" /> {doc.hospital_name as string}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" /> {doc.experience as number} yrs exp
                    </span>
                    <span className="flex items-center gap-1">
                      <IndianRupee className="h-3.5 w-3.5" /> {doc.fee as number}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
