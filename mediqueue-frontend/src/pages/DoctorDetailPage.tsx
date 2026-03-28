import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import {
  Star, MapPin, Clock, IndianRupee, GraduationCap, Calendar,
  ArrowLeft, Send, AlertCircle
} from 'lucide-react';

export default function DoctorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState<Record<string, unknown> | null>(null);
  const [doctorReviews, setDoctorReviews] = useState<Record<string, unknown>[]>([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [slots, setSlots] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [reason, setReason] = useState('');
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'book' | 'reviews'>('book');

  useEffect(() => {
    if (!id) return;
    api.getDoctor(id).then(data => {
      setDoctor(data.doctor);
      setDoctorReviews(data.reviews);
      setLoading(false);
    });
  }, [id]);

  useEffect(() => {
    if (!id || !selectedDate) return;
    api.getSlots(id, selectedDate).then(data => {
      setSlots(data.slots);
      setBookedSlots(data.booked_slots);
      setSelectedSlot('');
    });
  }, [id, selectedDate]);

  const handleBook = async () => {
    if (!user || !id || !selectedDate || !selectedSlot) return;
    setBooking(true);
    try {
      await api.createAppointment({
        patient_id: user.id,
        doctor_id: id,
        date: selectedDate,
        time: selectedSlot,
        reason: reason || 'General consultation',
      });
      setBookingSuccess(true);
      setTimeout(() => navigate('/appointments'), 2000);
    } catch {
      alert('Failed to book appointment');
    } finally {
      setBooking(false);
    }
  };

  const handleReview = async () => {
    if (!user || !id) return;
    setSubmittingReview(true);
    try {
      await api.createReview({
        patient_id: user.id,
        doctor_id: id,
        rating: reviewRating,
        comment: reviewComment,
      });
      setReviewSuccess(true);
      setReviewComment('');
      const data = await api.getDoctor(id);
      setDoctor(data.doctor);
      setDoctorReviews(data.reviews);
    } catch {
      alert('Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];
  const maxDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  if (loading) return <div className="text-center py-12 text-gray-500">Loading...</div>;
  if (!doctor) return <div className="text-center py-12 text-gray-500">Doctor not found</div>;

  return (
    <div className="space-y-6">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-gray-600 hover:text-gray-900 text-sm">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      {/* Doctor Info Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-5">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
            {doctor.avatar as string}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{doctor.name as string}</h1>
            <p className="text-blue-600 font-semibold">{doctor.specialty as string}</p>
            <p className="text-sm text-gray-600 mt-2">{doctor.bio as string}</p>
            <div className="flex flex-wrap gap-4 mt-3">
              <div className="flex items-center gap-1.5">
                <div className="flex">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star key={i} className={`h-4 w-4 ${i < Math.round(doctor.rating as number) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                  ))}
                </div>
                <span className="font-bold text-gray-900">{doctor.rating as number}</span>
                <span className="text-sm text-gray-500">({doctor.total_ratings as number} reviews)</span>
              </div>
              <span className="flex items-center gap-1 text-sm text-gray-600">
                <MapPin className="h-4 w-4" /> {doctor.hospital_name as string}
              </span>
              <span className="flex items-center gap-1 text-sm text-gray-600">
                <Clock className="h-4 w-4" /> {doctor.experience as number} years
              </span>
              <span className="flex items-center gap-1 text-sm text-gray-600">
                <IndianRupee className="h-4 w-4" /> {doctor.fee as number}
              </span>
              <span className="flex items-center gap-1 text-sm text-gray-600">
                <GraduationCap className="h-4 w-4" /> {doctor.education as string}
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {(doctor.available_days as string[]).map(day => (
                <span key={day} className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full">{day}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        <button onClick={() => setActiveTab('book')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'book' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>
          <Calendar className="h-4 w-4 inline mr-1.5" />Book Appointment
        </button>
        <button onClick={() => setActiveTab('reviews')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'reviews' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>
          <Star className="h-4 w-4 inline mr-1.5" />Reviews ({doctorReviews.length})
        </button>
      </div>

      {activeTab === 'book' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          {bookingSuccess ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Appointment Booked!</h3>
              <p className="text-gray-500 mt-1">Redirecting to your appointments...</p>
            </div>
          ) : user?.role !== 'patient' ? (
            <div className="flex items-center gap-2 p-4 bg-amber-50 text-amber-700 rounded-lg">
              <AlertCircle className="h-5 w-5" /> Please login as a patient to book appointments.
            </div>
          ) : (
            <>
              <h3 className="text-lg font-semibold">Select Date & Time</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)}
                  min={today} max={maxDate}
                  className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              {selectedDate && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Available Slots</label>
                  {slots.length === 0 ? (
                    <p className="text-gray-500 text-sm">No available slots for this date</p>
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                      {(doctor.slots as string[]).map(slot => {
                        const isBooked = bookedSlots.includes(slot);
                        const isSelected = selectedSlot === slot;
                        return (
                          <button key={slot} disabled={isBooked}
                            onClick={() => setSelectedSlot(slot)}
                            className={`py-2 px-3 rounded-lg text-sm font-medium border transition-all ${
                              isBooked ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed line-through' :
                              isSelected ? 'bg-blue-600 text-white border-blue-600' :
                              'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                            }`}>
                            {slot}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
              {selectedSlot && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Visit</label>
                    <input type="text" value={reason} onChange={e => setReason(e.target.value)}
                      placeholder="e.g., General checkup, Follow-up..."
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                  <button onClick={handleBook} disabled={booking}
                    className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50">
                    {booking ? 'Booking...' : `Book for ${selectedDate} at ${selectedSlot}`}
                  </button>
                </>
              )}
            </>
          )}
        </div>
      )}

      {activeTab === 'reviews' && (
        <div className="space-y-4">
          {/* Write Review */}
          {user?.role === 'patient' && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-3">
              <h3 className="font-semibold text-gray-900">Write a Review</h3>
              {reviewSuccess ? (
                <div className="p-3 bg-green-50 text-green-700 rounded-lg text-sm">Review submitted successfully!</div>
              ) : (
                <>
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }, (_, i) => (
                      <button key={i} onClick={() => setReviewRating(i + 1)}>
                        <Star className={`h-6 w-6 ${i < reviewRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                      </button>
                    ))}
                  </div>
                  <textarea value={reviewComment} onChange={e => setReviewComment(e.target.value)}
                    placeholder="Share your experience..."
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none h-20 resize-none" />
                  <button onClick={handleReview} disabled={submittingReview || !reviewComment}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
                    <Send className="h-4 w-4" /> {submittingReview ? 'Submitting...' : 'Submit Review'}
                  </button>
                </>
              )}
            </div>
          )}
          {/* Reviews List */}
          {doctorReviews.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No reviews yet</div>
          ) : (
            doctorReviews.map(review => (
              <div key={review.id as string} className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm font-bold text-gray-600">
                      {(review.patient_name as string).charAt(0)}
                    </div>
                    <span className="font-medium text-gray-900">{review.patient_name as string}</span>
                  </div>
                  <span className="text-xs text-gray-500">{review.date as string}</span>
                </div>
                <div className="flex gap-0.5 mb-2">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star key={i} className={`h-3.5 w-3.5 ${i < (review.rating as number) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                  ))}
                </div>
                <p className="text-sm text-gray-700">{review.comment as string}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
