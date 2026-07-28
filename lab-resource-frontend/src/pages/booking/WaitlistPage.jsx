import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { bookingApi, equipmentApi } from '../../api/api';
import toast from 'react-hot-toast';
import { Clock, Users, X, ChevronRight } from 'lucide-react';

export default function WaitlistPage() {
  const { user } = useAuth();
  const [waitlistEntries, setWaitlistEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [equipmentMap, setEquipmentMap] = useState({});

  useEffect(() => {
    fetchWaitlistData();
  }, []);

  const fetchWaitlistData = async () => {
    setLoading(true);
    try {
      const equipRes = await equipmentApi.getAll({ page: 0, size: 100 });
      const equipment = equipRes.data?.content || [];
      const eqMap = {};
      equipment.forEach(eq => { eqMap[eq.id] = eq; });
      setEquipmentMap(eqMap);

      const allEntries = [];
      for (const eq of equipment) {
        try {
          const bookingsRes = await bookingApi.getAll({ page: 0, size: 200 });
          const bookings = bookingsRes.data?.content || [];
          const waitlisted = bookings.filter(b =>
            b.equipmentId === eq.id && b.status === 'PENDING_APPROVAL'
          );
          waitlisted.forEach(b => {
            allEntries.push({
              ...b,
              equipmentName: eq.equipmentName,
              equipmentCode: eq.equipmentCode,
            });
          });
        } catch {}
      }
      setWaitlistEntries(allEntries);
    } catch (err) {
      toast.error('Failed to load waitlist data');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Cancel this waitlisted booking?')) return;
    try {
      await bookingApi.cancel(bookingId);
      toast.success('Booking cancelled');
      fetchWaitlistData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel');
    }
  };

  const stats = {
    total: waitlistEntries.length,
    own: waitlistEntries.filter(b => b.userId === user?.userId).length,
    equipment: [...new Set(waitlistEntries.map(b => b.equipmentId))].length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Waitlist Management</h1>
        <p className="text-gray-500 mt-1">View and manage pending booking requests across equipment</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg"><Clock size={20} className="text-blue-600" /></div>
            <div><p className="text-sm text-gray-500">Total Pending</p><p className="text-xl font-bold">{stats.total}</p></div>
          </div>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-100 rounded-lg"><Users size={20} className="text-primary-600" /></div>
            <div><p className="text-sm text-gray-500">My Pending</p><p className="text-xl font-bold text-primary-600">{stats.own}</p></div>
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
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Equipment</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Requested By</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Purpose</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">Loading...</td></tr>
            ) : waitlistEntries.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">No pending bookings in waitlist</td></tr>
            ) : waitlistEntries.map((entry) => (
              <tr key={entry.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="text-sm font-medium text-gray-900">{entry.equipmentName}</div>
                  <div className="text-xs text-gray-500">{entry.equipmentCode}</div>
                </td>
                <td className="px-4 py-3">
                  <div className="text-sm text-gray-900">{entry.userFullName}</div>
                  <div className="text-xs text-gray-500">{entry.userRole?.replace('_', ' ')}</div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">{entry.bookingDate}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{entry.startTime} - {entry.endTime}</td>
                <td className="px-4 py-3 text-sm text-gray-700 max-w-[200px] truncate">{entry.purpose || '—'}</td>
                <td className="px-4 py-3">
                  <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                    {entry.status?.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  {entry.userId === user?.userId && (
                    <button onClick={() => handleCancel(entry.id)} className="p-1 text-red-500 hover:bg-red-50 rounded" title="Cancel">
                      <X size={14} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
