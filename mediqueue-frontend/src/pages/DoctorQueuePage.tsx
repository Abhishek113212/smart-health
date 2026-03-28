import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { Clock, Users, RefreshCw, CheckCircle, XCircle, Activity } from 'lucide-react';

export default function DoctorQueuePage() {
  const { user } = useAuth();
  const [queue, setQueue] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const fetchQueue = useCallback(() => {
    if (!user) return;
    api.getQueue({ doctor_id: user.id }).then(d => {
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

  const handleComplete = async (queueId: string) => {
    await api.updateQueue(queueId, 'completed');
    fetchQueue();
  };

  const handleNoShow = async (queueId: string) => {
    await api.updateQueue(queueId, 'no_show');
    fetchQueue();
  };

  if (loading) return <div className="text-center py-12 text-gray-500">Loading...</div>;

  const activeQueue = queue.filter(q => q.status === 'waiting' || q.status === 'in_progress');
  const completedQueue = queue.filter(q => q.status === 'completed' || q.status === 'no_show');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Queue Management</h1>
          <p className="text-gray-500">Manage your patient queue in real-time</p>
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

      {/* Active Queue */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Users className="h-5 w-5 text-blue-600" /> Active Queue ({activeQueue.length})
        </h3>
        {activeQueue.length === 0 ? (
          <div className="text-center py-6 bg-white rounded-xl border text-gray-500">No patients in queue</div>
        ) : (
          <div className="space-y-3">
            {activeQueue.map(q => (
              <div key={q.id as string}
                className={`bg-white rounded-xl border-2 p-5 ${
                  q.status === 'in_progress' ? 'border-green-300' : 'border-gray-200'
                }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold ${
                      q.status === 'in_progress' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      #{q.position as number}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{q.patient_name as string}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock className="h-3.5 w-3.5" />
                        <span>Checked in: {q.check_in_time as string}</span>
                        <span>| Est: {q.estimated_time as string}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleComplete(q.id as string)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700">
                      <CheckCircle className="h-4 w-4" /> Done
                    </button>
                    <button onClick={() => handleNoShow(q.id as string)}
                      className="flex items-center gap-1 px-3 py-1.5 border border-red-300 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50">
                      <XCircle className="h-4 w-4" /> No Show
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Completed */}
      {completedQueue.length > 0 && (
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">Completed ({completedQueue.length})</h3>
          <div className="space-y-2">
            {completedQueue.map(q => (
              <div key={q.id as string} className="bg-gray-50 rounded-xl border p-4 flex items-center justify-between">
                <p className="font-medium text-gray-600">{q.patient_name as string}</p>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                  q.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {q.status as string}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
