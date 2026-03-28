import React, { useState, useEffect, createContext, useContext } from 'react';
import { 
  Search, Calendar, Clock, User, LogOut, Activity, 
  FileText, Star, MapPin, ChevronRight, AlertCircle,
  CheckCircle2, Users, Hospital as HospitalIcon, TrendingUp,
  Menu, X, Bell, Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { io, Socket } from 'socket.io-client';
import { 
  User as UserType, Doctor, Hospital, Appointment, 
  MedicalRecord, QueueStatus 
} from './types';

// --- Context & State Management ---
interface AuthContextType {
  user: UserType | null;
  login: (email: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

// --- API Helpers ---
const API_BASE = "/api";

const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem("token");
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { "Authorization": `Bearer ${token}` } : {}),
    ...options.headers,
  };
  const res = await fetch(`${API_BASE}${url}`, { ...options, headers });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

// --- Components ---

const Navbar = ({ onNavigate }: { onNavigate: (page: string) => void }) => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="glass sticky top-0 z-50 px-6 py-4 flex items-center justify-between border-b border-slate-200">
      <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate('dashboard')}>
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
          <Activity size={24} />
        </div>
        <div>
          <h1 className="font-bold text-xl tracking-tight text-slate-900">SmartHealth</h1>
          <p className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">Queue Management</p>
        </div>
      </div>

      <div className="hidden md:flex items-center gap-8">
        <button onClick={() => onNavigate('dashboard')} className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Dashboard</button>
        {user?.role === 'patient' && (
          <button onClick={() => onNavigate('search')} className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Find Doctors</button>
        )}
        <button onClick={() => onNavigate('records')} className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Medical Records</button>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden md:flex flex-col items-end">
          <span className="text-sm font-bold text-slate-900">{user?.name}</span>
          <span className="text-[10px] uppercase font-bold text-slate-400">{user?.role}</span>
        </div>
        <button onClick={logout} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
          <LogOut size={20} />
        </button>
      </div>
    </nav>
  );
};

const QueueCard = ({ doctorId, doctorName }: { doctorId: string, doctorName: string }) => {
  const [status, setStatus] = useState<QueueStatus | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const s = io();
    setSocket(s);

    fetch(`/api/queue/${doctorId}`).then(r => r.json()).then(setStatus);

    s.on(`queue-update-${doctorId}`, (newStatus: QueueStatus) => {
      setStatus(newStatus);
    });

    return () => { s.disconnect(); };
  }, [doctorId]);

  if (!status) return <div className="animate-pulse h-48 bg-slate-100 rounded-xl"></div>;

  const waitTime = status.waiting * 15; // 15 mins per patient
  const waitColor = waitTime > 60 ? 'text-red-500' : waitTime > 30 ? 'text-orange-500' : 'text-green-500';

  return (
    <div className="card p-6 flex flex-col gap-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-bold text-slate-900">{doctorName}</h3>
          <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Live Queue Tracker</p>
        </div>
        <div className={`badge ${waitTime > 60 ? 'badge-red' : 'badge-green'}`}>
          {waitTime} min wait
        </div>
      </div>

      <div className="flex items-center justify-between py-4 border-y border-slate-100">
        <div className="text-center">
          <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Serving Now</p>
          <p className="queue-number text-blue-600">#{status.activeToken || '-'}</p>
        </div>
        <div className="w-px h-12 bg-slate-100"></div>
        <div className="text-center">
          <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">In Waiting</p>
          <p className="queue-number text-slate-900">{status.waiting}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
        <Clock size={14} />
        <span>Estimated wait time: <span className={waitColor}>{waitTime} minutes</span></span>
      </div>
    </div>
  );
};

const DoctorSearch = ({ onBook }: { onBook: (doc: Doctor) => void }) => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [search, setSearch] = useState("");
  const [specialization, setSpecialization] = useState("All");

  useEffect(() => {
    fetchWithAuth("/doctors").then(setDoctors);
  }, []);

  const filtered = doctors.filter(d => 
    (d.name.toLowerCase().includes(search.toLowerCase()) || d.specialization.toLowerCase().includes(search.toLowerCase())) &&
    (specialization === "All" || d.specialization === specialization)
  );

  const specializations = ["All", ...new Set(doctors.map(d => d.specialization))];

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Find a Specialist</h2>
        <p className="text-slate-500">Search across hospitals for the best medical care.</p>
      </header>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Search by name or specialization..." 
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
          {specializations.map(s => (
            <button 
              key={s}
              onClick={() => setSpecialization(s)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${specialization === s ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(doc => (
          <motion.div 
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            key={doc.id} 
            className="card p-6 flex flex-col gap-4 hover:border-blue-300 transition-colors group"
          >
            <div className="flex justify-between items-start">
              <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-blue-600 group-hover:bg-blue-50 transition-colors">
                <User size={24} />
              </div>
              <div className="flex items-center gap-1 text-yellow-500 font-bold text-sm">
                <Star size={16} fill="currentColor" />
                {doc.rating}
              </div>
            </div>
            
            <div>
              <h3 className="font-bold text-lg text-slate-900">{doc.name}</h3>
              <p className="text-sm text-blue-600 font-medium">{doc.specialization}</p>
              <div className="flex items-center gap-1 text-xs text-slate-400 mt-1">
                <HospitalIcon size={12} />
                <span>{doc.hospital}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mt-2">
              {doc.availability.slice(0, 3).map(time => (
                <span key={time} className="text-[10px] font-bold px-2 py-1 bg-slate-50 text-slate-500 rounded uppercase">{time}</span>
              ))}
              {doc.availability.length > 3 && <span className="text-[10px] font-bold px-2 py-1 text-slate-400">+{doc.availability.length - 3} more</span>}
            </div>

            <button 
              onClick={() => onBook(doc)}
              className="btn-primary w-full mt-2 flex items-center justify-center gap-2"
            >
              Book Appointment
              <ChevronRight size={16} />
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const BookingModal = ({ doctor, onClose, onComplete }: { doctor: Doctor, onClose: () => void, onComplete: () => void }) => {
  const [selectedTime, setSelectedTime] = useState("");
  const [loading, setLoading] = useState(false);

  const handleBook = async () => {
    if (!selectedTime) return;
    setLoading(true);
    try {
      await fetchWithAuth("/appointments", {
        method: "POST",
        body: JSON.stringify({
          doctorId: doctor.id,
          date: new Date().toISOString().split('T')[0],
          time: selectedTime
        })
      });
      onComplete();
    } catch (err) {
      alert("Booking failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
      >
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-bold text-xl text-slate-900">Book Appointment</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors"><X size={20} /></button>
        </div>

        <div className="p-6 flex flex-col gap-6">
          <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-xl">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center text-blue-600 shadow-sm">
              <User size={24} />
            </div>
            <div>
              <p className="font-bold text-slate-900">{doctor.name}</p>
              <p className="text-xs text-blue-600 font-medium">{doctor.specialization} • {doctor.hospital}</p>
            </div>
          </div>

          <div>
            <p className="text-sm font-bold text-slate-900 mb-3">Select Available Time</p>
            <div className="grid grid-cols-3 gap-2">
              {doctor.availability.map(time => (
                <button 
                  key={time}
                  onClick={() => setSelectedTime(time)}
                  className={`py-2 rounded-lg text-sm font-bold transition-all ${selectedTime === time ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl flex items-start gap-3">
            <AlertCircle className="text-blue-600 mt-0.5" size={18} />
            <p className="text-xs text-slate-500 leading-relaxed">
              Booking will generate a unique token number. Please arrive 15 minutes before your scheduled time.
            </p>
          </div>
        </div>

        <div className="p-6 bg-slate-50 flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button 
            onClick={handleBook} 
            disabled={!selectedTime || loading}
            className="btn-primary flex-1 disabled:opacity-50"
          >
            {loading ? "Booking..." : "Confirm Booking"}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWithAuth("/appointments").then(setAppointments).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-96"><Activity className="animate-spin text-blue-600" size={48} /></div>;

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Welcome back, {user?.name.split(' ')[0]}!</h2>
          <p className="text-slate-500">Here's what's happening with your health today.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-center gap-3 shadow-sm">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-green-600">
              <TrendingUp size={20} />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">Health Score</p>
              <p className="font-bold text-slate-900">92/100</p>
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-slate-900">Upcoming Appointments</h3>
              <button className="text-sm font-bold text-blue-600 hover:underline">View All</button>
            </div>
            <div className="flex flex-col gap-4">
              {appointments.length === 0 ? (
                <div className="p-12 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-400">
                  <Calendar size={48} className="mb-4 opacity-20" />
                  <p className="font-medium">No upcoming appointments</p>
                  <p className="text-sm">Book a doctor to get started.</p>
                </div>
              ) : (
                appointments.map(app => (
                  <div key={app.id} className="card p-5 flex items-center justify-between group hover:border-blue-200 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-slate-50 rounded-xl flex flex-col items-center justify-center text-slate-900 border border-slate-100">
                        <span className="text-[10px] uppercase font-bold text-slate-400">Token</span>
                        <span className="text-xl font-bold">#{app.tokenNumber}</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900">{app.doctorName}</h4>
                        <p className="text-xs text-slate-500">{app.hospitalName} • {app.date}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-50 text-blue-600 rounded uppercase">{app.time}</span>
                          <span className="badge badge-green">Confirmed</span>
                        </div>
                      </div>
                    </div>
                    <button className="p-2 text-slate-300 group-hover:text-blue-600 transition-colors">
                      <ChevronRight size={24} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </section>

          <section>
            <h3 className="font-bold text-lg text-slate-900 mb-4">Recent Medical History</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="card p-5 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                    <FileText size={20} />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400">15 MAR 2024</span>
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">General Checkup</h4>
                  <p className="text-xs text-slate-500">Dr. Alice Smith • City General</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Diagnosis</p>
                  <p className="text-xs font-medium text-slate-700">Mild Hypertension</p>
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="flex flex-col gap-6">
          <h3 className="font-bold text-lg text-slate-900">Live Queue Tracking</h3>
          {appointments.length > 0 ? (
            <QueueCard doctorId={appointments[0].doctorId} doctorName={appointments[0].doctorName} />
          ) : (
            <div className="card p-6 bg-slate-50 border-dashed flex flex-col items-center justify-center text-center gap-3">
              <Users size={32} className="text-slate-300" />
              <p className="text-sm font-medium text-slate-500">Book an appointment to track your queue status in real-time.</p>
            </div>
          )}

          <div className="card p-6 bg-blue-600 text-white shadow-xl shadow-blue-200">
            <h4 className="font-bold text-lg mb-2">Health Tip of the Day</h4>
            <p className="text-sm text-blue-100 leading-relaxed mb-4">
              Drinking 8 glasses of water daily improves kidney function and keeps your skin glowing.
            </p>
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest opacity-60">
              <Activity size={12} />
              AI Suggestion
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const MedicalRecords = () => {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWithAuth("/medical-records").then(setRecords).finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col gap-8">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Centralized Records</h2>
          <p className="text-slate-500">Your medical history, accessible across all partner hospitals.</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Bell size={18} />
          Request Access
        </button>
      </header>

      <div className="card overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-6 py-4 text-[10px] uppercase font-bold text-slate-400 tracking-wider">Date</th>
              <th className="px-6 py-4 text-[10px] uppercase font-bold text-slate-400 tracking-wider">Hospital</th>
              <th className="px-6 py-4 text-[10px] uppercase font-bold text-slate-400 tracking-wider">Diagnosis</th>
              <th className="px-6 py-4 text-[10px] uppercase font-bold text-slate-400 tracking-wider">Prescription</th>
              <th className="px-6 py-4 text-[10px] uppercase font-bold text-slate-400 tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {records.map(r => (
              <tr key={r.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4 font-bold text-slate-900 text-sm">{r.date}</td>
                <td className="px-6 py-4 text-sm text-slate-600">{r.hospital}</td>
                <td className="px-6 py-4 text-sm font-medium text-slate-900">{r.diagnosis}</td>
                <td className="px-6 py-4 text-sm text-slate-500 italic">{r.prescription}</td>
                <td className="px-6 py-4">
                  <button className="text-blue-600 hover:text-blue-800 font-bold text-xs uppercase tracking-wider">Download PDF</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const Login = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState("patient@example.com");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email);
    } catch (err) {
      alert("Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="card w-full max-w-md p-8 flex flex-col gap-8"
      >
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-200 mx-auto mb-4">
            <Activity size={32} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">SmartHealth Login</h2>
          <p className="text-slate-500 text-sm mt-1">Access your healthcare dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
            <input 
              type="email" 
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Password</label>
            <input 
              type="password" 
              defaultValue="password"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="btn-primary w-full py-4 text-lg mt-2 disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="text-center">
          <p className="text-xs text-slate-400 font-medium">Demo accounts:</p>
          <div className="flex justify-center gap-4 mt-2">
            <button onClick={() => setEmail("patient@example.com")} className="text-[10px] font-bold text-blue-600 uppercase hover:underline">Patient Demo</button>
            <button onClick={() => setEmail("doctor@example.com")} className="text-[10px] font-bold text-blue-600 uppercase hover:underline">Doctor Demo</button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// --- Main App Wrapper ---

export default function App() {
  const [user, setUser] = useState<UserType | null>(null);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [bookingDoc, setBookingDoc] = useState<Doctor | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  const login = async (email: string) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password: "password" })
    });
    const data = await res.json();
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  if (!user) {
    return (
      <AuthContext.Provider value={{ user, login, logout }}>
        <Login />
      </AuthContext.Provider>
    );
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      <div className="min-h-screen flex flex-col">
        <Navbar onNavigate={setCurrentPage} />
        
        <main className="flex-1 max-w-7xl mx-auto w-full p-6 md:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              {currentPage === 'dashboard' && <Dashboard />}
              {currentPage === 'search' && <DoctorSearch onBook={setBookingDoc} />}
              {currentPage === 'records' && <MedicalRecords />}
            </motion.div>
          </AnimatePresence>
        </main>

        {bookingDoc && (
          <BookingModal 
            doctor={bookingDoc} 
            onClose={() => setBookingDoc(null)} 
            onComplete={() => {
              setBookingDoc(null);
              setCurrentPage('dashboard');
            }}
          />
        )}

        <footer className="p-8 border-t border-slate-200 text-center">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">
            © 2026 SmartHealth Systems • Secure Centralized Healthcare
          </p>
        </footer>
      </div>
    </AuthContext.Provider>
  );
}
