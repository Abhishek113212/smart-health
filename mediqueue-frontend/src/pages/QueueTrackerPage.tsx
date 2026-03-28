import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { Clock, Users, RefreshCw, MapPin, Activity } from 'lucide-react';

export default function QueueTrackerPage() {
  const { user } = useAuth();
  const [queue, setQueue] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const fetchQueue = useCallback(() => {
    if (!user) return;
    const params: Record<string, string> = {};
    if (user.role === 'patient') params.patient_id = user.id;
    if (user.role === 'doctor') params.doctor_id = user.id;
    api.getQueue(params).then(d => {
      setQueue(d.queue);
      setLoading(false);
      setLastRefresh(new Date());
    });
  }, [user]);

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 10000);
    return () => clearInterval(interval);
  }, [fetchQueue]);

  const statusConfig: Record<string, { color: string; label: string; pulse: boolean }> = {
    in_progress: { color: 'bg-green-100 text-green-700 border-green-200', label: 'In Progress', pulse: true },
    waiting: { color: 'bg-yellow-100 text-yellow-700 border-yellow-200', label: 'Waiting', pulse: false },
    completed: { color: 'bg-gray-100 text-gray-600 border-gray-200', label: 'Completed', pulse: false },
  };

  if (loading) return <div className="text-center py-12 text-gray-500">Loading queue...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Live Queue Tracker</h1>
          <p className="text-gray-500">Real-time waiting status updates every 10 seconds</p>
        </div>
        <button onClick={fetchQueue}
          className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg text-sm font-medium hover:bg-gray-50">
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>

      <div className="flex items-center gap-2 text-sm text-gray-500 bg-blue-50 px-4 py-2 rounded-lg">
        <Activity className="h-4 w-4 text-blue-500" />
        <span>Auto-refreshing | Last updated: {lastRefresh.toLocaleTimeString()}</span>
      </div>

      {queue.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border">
          <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No active queue entries</p>
          <p className="text-sm text-gray-400 mt-1">Check in to an appointment to see your queue status</p>
        </div>
      ) : (
        <div className="space-y-4">
          {queue.map(q => {
            const status = statusConfig[q.status as string] || statusConfig.waiting;
            return (
              <div key={q.id as string}
                className={`bg-white rounded-xl border-2 p-6 transition-all ${
                  q.status === 'in_progress' ? 'border-green-300 shadow-lg shadow-green-50' :
                  q.status === 'waiting' ? 'border-yellow-200' : 'border-gray-200'
                }`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold ${
                        q.status === 'in_progress' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        #{q.position as number}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{q.doctor_name as string}</h3>
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" /> {q.hospital_name as string}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 mt-3">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border ${status.color}`}>
                        {status.pulse && <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />}
                        {status.label}
                      </span>
                      <span className="flex items-center gap-1 text-sm text-gray-600">
                        <Clock className="h-3.5 w-3.5" /> Est. wait: {q.estimated_time as string}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Checked in at</p>
                    <p className="text-lg font-semibold text-gray-900">{q.check_in_time as string}</p>
                  </div>
                </div>
                {q.status === 'in_progress' && (
                  <div className="mt-4 p-3 bg-green-50 rounded-lg text-sm text-green-700 font-medium">
                    You are being seen now! Please proceed to the doctor&#39;s office.
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
