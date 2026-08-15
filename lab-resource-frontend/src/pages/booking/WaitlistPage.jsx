import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { bookingApi, equipmentApi } from '../../api/api';
import toast from 'react-hot-toast';
import { Clock, ChevronRight, UserPlus, Trash2, X, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useConfirm from '../../hooks/useConfirm';

export default function WaitlistPage() {
  const { user, isManager, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { confirm, confirmModal } = useConfirm();
  const [waitlistEntries, setWaitlistEntries] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  const isPrivileged = isManager || isAdmin;

  useEffect(() => {
    fetchWaitlistData();
    if (!isPrivileged) fetchRecommendations();
  }, []);

  const fetchWaitlistData = async () => {
    setLoading(true);
    try {
      const res = await bookingApi.getWaitlist();
      const all = res.data || [];
      setWaitlistEntries(isPrivileged ? all : all.filter(e => e.userId === user?.userId));
    } catch {
      toast.error('Failed to load waitlist data');
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendations = async () => {
    try {
      const res = await equipmentApi.getRecommendations();
      setRecommendations((res.data || []).slice(0, 3));
    } catch { /* optional */ }
  };

  const handleLeave = async (id) => {
    const ok = await confirm({
      title: 'Leave Waitlist',
      message: 'Are you sure you want to remove yourself from this waitlist?',
      confirmText: 'Leave',
      variant: 'danger',
    });
    if (!ok) return;
    try {
      await bookingApi.removeFromWaitlist(id);
      toast.success('Removed from waitlist');
      fetchWaitlistData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove');
    }
  };

  const handlePromote = async (id) => {
    const ok = await confirm({
      title: 'Promote from Waitlist',
      message: 'Promote this user to a confirmed booking? This will move them out of the waitlist.',
      confirmText: 'Promote',
      variant: 'success',
    });
    if (!ok) return;
    try {
      await bookingApi.promoteFromWaitlist(id);
      toast.success('User promoted from waitlist');
      fetchWaitlistData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to promote');
    }
  };

  const myEntries = waitlistEntries.filter(e => e.userId === user?.userId);

  // RESEARCHER / STUDENT VIEW
  if (!isPrivileged) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Waitlist</h1>
          <p className="text-gray-500 mt-1">Equipment slots you are waiting for</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl border p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg"><Clock size={20} className="text-blue-600" /></div>
              <div><p className="text-sm text-gray-500">Slots I'm Waiting For</p><p className="text-xl font-bold">{myEntries.length}</p></div>
            </div>
          </div>
          <div className="bg-white rounded-xl border p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg"><ChevronRight size={20} className="text-purple-600" /></div>
              <div>
                <p className="text-sm text-gray-500">Best Position</p>
                <p className="text-xl font-bold text-primary-600">
                  {myEntries.length > 0 ? `#${Math.min(...myEntries.map(e => e.position))}` : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Position</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Equipment</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined On</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-500">Loading...</td></tr>
              ) : myEntries.length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-500">You are not on any waitlist yet.</td></tr>
              ) : myEntries.map((entry) => (
                <tr key={entry.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3"><span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary-100 text-primary-700 font-bold text-sm">#{entry.position}</span></td>
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-gray-900">{entry.equipmentName}</div>
                    <div className="text-xs text-gray-500">{entry.equipmentCode}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{entry.createdAt ? new Date(entry.createdAt).toLocaleDateString() : '\u2014'}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => handleLeave(entry.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded" title="Leave waitlist"><X size={14} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {recommendations.length > 0 && (
          <div className="bg-white rounded-xl border p-5">
            <div className="flex items-center gap-2 mb-4">
              <Star size={18} className="text-yellow-500" />
              <h2 className="font-semibold text-gray-900">Recommended Equipment For You</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recommendations.map(eq => (
                <div key={eq.id} className="border rounded-lg p-3 hover:shadow-sm cursor-pointer transition" onClick={() => navigate(`/equipment/${eq.id}`)}>
                  <p className="font-medium text-gray-900 text-sm">{eq.equipmentName}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{eq.categoryName} \u2022 {eq.status}</p>
                  <span className={`mt-2 inline-block text-xs px-2 py-0.5 rounded-full ${eq.status === 'AVAILABLE' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{eq.status}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {confirmModal}
      </div>
    );
  }

  // ADMIN / MANAGER VIEW
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Waitlist Management</h1>
        <p className="text-gray-500 mt-1">View and manage all equipment waitlist entries</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg"><Clock size={20} className="text-blue-600" /></div>
            <div><p className="text-sm text-gray-500">Total Waiting</p><p className="text-xl font-bold">{waitlistEntries.length}</p></div>
          </div>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-100 rounded-lg"><UserPlus size={20} className="text-primary-600" /></div>
            <div><p className="text-sm text-gray-500">My Position</p>
              <p className="text-xl font-bold text-primary-600">{myEntries.length > 0 ? `#${myEntries[0].position}` : 'N/A'}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg"><ChevronRight size={20} className="text-purple-600" /></div>
            <div><p className="text-sm text-gray-500">Equipment with Waitlist</p>
              <p className="text-xl font-bold">{[...new Set(waitlistEntries.map(e => e.equipmentId))].length}</p>
            </div>
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
              <tr key={entry.id} className={`hover:bg-gray-50 ${entry.userId === user?.userId ? 'bg-blue-50' : ''}`}>
                <td className="px-4 py-3"><span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary-100 text-primary-700 font-bold text-sm">#{entry.position}</span></td>
                <td className="px-4 py-3">
                  <div className="text-sm font-medium text-gray-900">{entry.equipmentName}</div>
                  <div className="text-xs text-gray-500">{entry.equipmentCode}</div>
                </td>
                <td className="px-4 py-3">
                  <div className="text-sm text-gray-900">{entry.userFullName}</div>
                  <div className="text-xs text-gray-500">{entry.userEmail}</div>
                </td>
                <td className="px-4 py-3"><span className="text-xs text-gray-600">{entry.userRole?.replace(/_/g, ' ')}</span></td>
                <td className="px-4 py-3 text-sm text-gray-700">{entry.createdAt ? new Date(entry.createdAt).toLocaleDateString() : '\u2014'}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => handlePromote(entry.id)} className="p-1.5 text-green-600 hover:bg-green-50 rounded" title="Promote to booking"><UserPlus size={14} /></button>
                    <button onClick={() => handleLeave(entry.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded" title="Remove from waitlist"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {confirmModal}
    </div>
  );
}
