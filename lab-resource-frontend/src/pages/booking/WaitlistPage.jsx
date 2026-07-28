import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { bookingApi } from '../../api/api';
import toast from 'react-hot-toast';
import { Clock, Users, X, ChevronRight, UserPlus, Trash2 } from 'lucide-react';

export default function WaitlistPage() {
  const { user, isManager } = useAuth();
  const [waitlistEntries, setWaitlistEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWaitlistData();
  }, []);

  const fetchWaitlistData = async () => {
    setLoading(true);
    try {
      const res = await bookingApi.getWaitlist();
      setWaitlistEntries(res.data || []);
    } catch (err) {
      toast.error('Failed to load waitlist data');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (id) => {
    if (!window.confirm('Remove this entry from the waitlist?')) return;
    try {
      await bookingApi.removeFromWaitlist(id);
      toast.success('Removed from waitlist');
      fetchWaitlistData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove');
    }
  };

  const handlePromote = async (id) => {
    if (!window.confirm('Promote this user from the waitlist?')) return;
    try {
      await bookingApi.promoteFromWaitlist(id);
      toast.success('User promoted from waitlist');
      fetchWaitlistData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to promote');
    }
  };

  const stats = {
    total: waitlistEntries.length,
    own: waitlistEntries.filter(e => e.userId === user?.userId).length,
    equipment: [...new Set(waitlistEntries.map(e => e.equipmentId))].length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Waitlist Management</h1>
        <p className="text-gray-500 mt-1">View and manage equipment waitlist entries</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg"><Clock size={20} className="text-blue-600" /></div>
            <div><p className="text-sm text-gray-500">Total Waiting</p><p className="text-xl font-bold">{stats.total}</p></div>
          </div>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-100 rounded-lg"><Users size={20} className="text-primary-600" /></div>
            <div><p className="text-sm text-gray-500">My Position</p><p className="text-xl font-bold text-primary-600">{stats.own > 0 ? waitlistEntries.find(e => e.userId === user?.userId)?.position || '-' : 'N/A'}</p></div>
          </div>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg"><ChevronRight size={20} className="text-purple-600" /></div>
            <div><p className="text-sm text-gray-500">Equipment with Waitlist</p><p className="text-xl font-bold">{stats.equipment}</p></div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Position</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Equipment</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">Loading...</td></tr>
            ) : waitlistEntries.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">No active waitlist entries</td></tr>
            ) : waitlistEntries.map((entry) => (
              <tr key={entry.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary-100 text-primary-700 font-bold text-sm">
                    #{entry.position}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="text-sm font-medium text-gray-900">{entry.equipmentName}</div>
                  <div className="text-xs text-gray-500">{entry.equipmentCode}</div>
                </td>
                <td className="px-4 py-3">
                  <div className="text-sm text-gray-900">{entry.userFullName}</div>
                  <div className="text-xs text-gray-500">{entry.userEmail}</div>
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs text-gray-600">{entry.userRole?.replace('_', ' ')}</span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  {entry.createdAt ? new Date(entry.createdAt).toLocaleDateString() : '—'}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    {entry.userId === user?.userId && (
                      <button onClick={() => handleRemove(entry.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded" title="Leave waitlist">
                        <X size={14} />
                      </button>
                    )}
                    {isManager && entry.userId !== user?.userId && (
                      <>
                        <button onClick={() => handlePromote(entry.id)} className="p-1.5 text-green-600 hover:bg-green-50 rounded" title="Promote">
                          <UserPlus size={14} />
                        </button>
                        <button onClick={() => handleRemove(entry.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded" title="Remove">
                          <Trash2 size={14} />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
