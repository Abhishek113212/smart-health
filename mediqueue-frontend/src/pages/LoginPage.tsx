import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { Heart, Mail, Lock, User, Stethoscope, Shield, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'patient' | 'doctor' | 'admin'>('patient');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await api.login(email, password, role);
      login(data.user as { id: string; name: string; email: string; role: 'patient' | 'doctor' | 'admin' });
      if (role === 'admin') navigate('/admin');
      else if (role === 'doctor') navigate('/doctor');
      else navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const demoLogins = {
    patient: { email: 'rahul@example.com', password: 'password123' },
    doctor: { email: 'priya@hospital.com', password: 'doctor123' },
    admin: { email: 'admin@mediqueue.com', password: 'admin123' },
  };

  const fillDemo = (r: 'patient' | 'doctor' | 'admin') => {
    setRole(r);
    setEmail(demoLogins[r].email);
    setPassword(demoLogins[r].password);
  };

  const roles = [
    { value: 'patient' as const, label: 'Patient', icon: User, color: 'blue' },
    { value: 'doctor' as const, label: 'Doctor', icon: Stethoscope, color: 'green' },
    { value: 'admin' as const, label: 'Admin', icon: Shield, color: 'purple' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl mb-4">
            <Heart className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">MediQueue</h1>
          <p className="text-gray-500 mt-1">Smart Hospital Queue Management</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="flex gap-2 mb-6">
            {roles.map((r) => (
              <button
                key={r.value}
                onClick={() => fillDemo(r.value)}
                className={`flex-1 flex flex-col items-center gap-1 py-3 px-2 rounded-xl border-2 transition-all text-sm font-medium ${
                  role === r.value
                    ? r.color === 'blue'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : r.color === 'green'
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-purple-500 bg-purple-50 text-purple-700'
                    : 'border-gray-200 text-gray-500 hover:border-gray-300'
                }`}
              >
                <r.icon className="h-5 w-5" />
                {r.label}
              </button>
            ))}
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 mb-4 bg-red-50 text-red-700 rounded-lg text-sm">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-4 text-center text-sm text-gray-500">
            New patient?{' '}
            <Link to="/register" className="text-blue-600 hover:underline font-medium">
              Register here
            </Link>
          </div>

          <div className="mt-6 p-3 bg-amber-50 rounded-lg border border-amber-200">
            <p className="text-xs font-medium text-amber-800 mb-1">Demo Credentials (click role above to auto-fill):</p>
            <div className="text-xs text-amber-700 space-y-0.5">
              <p>Patient: rahul@example.com / password123</p>
              <p>Doctor: priya@hospital.com / doctor123</p>
              <p>Admin: admin@mediqueue.com / admin123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
