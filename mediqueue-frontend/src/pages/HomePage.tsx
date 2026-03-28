import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
  Search, Calendar, Clock, Star, Shield, FileText,
  ArrowRight, Heart, Users, Building2, Stethoscope
} from 'lucide-react';

export default function HomePage() {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: Search, title: 'Find Doctors',
      desc: 'Search by specialty, hospital, and ratings. Find the perfect doctor for your needs.',
      color: 'blue', link: '/doctors'
    },
    {
      icon: Calendar, title: 'Book Appointments',
      desc: 'Select available time slots and book appointments instantly with your preferred doctor.',
      color: 'green', link: '/doctors'
    },
    {
      icon: Clock, title: 'Live Queue Tracker',
      desc: 'Track your real-time position in the queue. No more waiting in long hospital lines.',
      color: 'orange', link: '/queue'
    },
    {
      icon: Star, title: 'Rate & Review Doctors',
      desc: 'Share your experience and read reviews from other patients to make informed decisions.',
      color: 'yellow', link: '/doctors'
    },
    {
      icon: FileText, title: 'Cross-Hospital Records',
      desc: 'Access your complete medical history across all hospitals in one unified dashboard.',
      color: 'purple', link: '/dashboard'
    },
    {
      icon: Shield, title: 'Doctor Access to History',
      desc: 'Doctors can view patient medical records across hospitals for better diagnosis.',
      color: 'red', link: '/doctors'
    },
  ];

  const stats = [
    { icon: Stethoscope, value: '10+', label: 'Expert Doctors' },
    { icon: Building2, value: '4', label: 'Partner Hospitals' },
    { icon: Users, value: '1000+', label: 'Patients Served' },
    { icon: Star, value: '4.7', label: 'Average Rating' },
  ];

  const colorMap: Record<string, string> = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    orange: 'bg-orange-100 text-orange-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    purple: 'bg-purple-100 text-purple-600',
    red: 'bg-red-100 text-red-600',
  };

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <div className="text-center py-12">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium mb-6">
          <Heart className="h-4 w-4" />
          Smart Healthcare Queue Management
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Skip the Wait,<br />
          <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Not the Care
          </span>
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
          Book appointments, track your queue position in real-time, access medical records 
          across hospitals, and rate your doctors — all in one platform.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {isAuthenticated ? (
            <>
              <Link to="/doctors" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-200">
                Find a Doctor <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/dashboard" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-700 rounded-xl font-medium border border-gray-300 hover:bg-gray-50 transition-all">
                My Dashboard
              </Link>
            </>
          ) : (
            <>
              <Link to="/register" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-200">
                Get Started <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/login" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-700 rounded-xl font-medium border border-gray-300 hover:bg-gray-50 transition-all">
                Sign In
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl p-5 text-center border border-gray-200 shadow-sm">
            <stat.icon className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-sm text-gray-500">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Problem Statement Highlight */}
      <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl p-8 border border-red-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-3">The Problem We Solve</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-red-700 mb-2">Current Challenges</h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-1">&#x2022;</span>
                Patients wait 2-4 hours at hospitals due to inefficient appointment systems
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-1">&#x2022;</span>
                Doctors cannot access patient records from other hospitals
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-1">&#x2022;</span>
                No transparency in doctor quality — patients choose blindly
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-green-700 mb-2">MediQueue Solution</h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">&#x2022;</span>
                Real-time queue tracking eliminates blind waiting
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">&#x2022;</span>
                Unified medical records accessible across all partner hospitals
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">&#x2022;</span>
                Patient ratings and reviews for informed doctor selection
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Features */}
      <div>
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-2">Key Features</h2>
        <p className="text-center text-gray-500 mb-8">Everything you need for a seamless healthcare experience</p>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <Link key={f.title} to={isAuthenticated ? f.link : '/login'}
              className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg hover:border-blue-200 transition-all group">
              <div className={`w-12 h-12 rounded-xl ${colorMap[f.color]} flex items-center justify-center mb-4`}>
                <f.icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                {f.title}
              </h3>
              <p className="text-gray-600 text-sm">{f.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
