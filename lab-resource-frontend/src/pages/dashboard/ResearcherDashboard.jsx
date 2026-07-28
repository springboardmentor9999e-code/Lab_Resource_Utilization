import { useAuth } from '../../context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { Cpu, Calendar, Clock, Megaphone, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { equipmentApi, bookingApi, announcementApi } from '../../api/api';

export default function ResearcherDashboard() {
  const { user } = useAuth();

  const { data: equipment = [] } = useQuery({
    queryKey: ['equipment'],
    queryFn: async () => {
      const res = await equipmentApi.getAll();
      return res.data.content || [];
    },
  });

  const { data: myBookings = [] } = useQuery({
    queryKey: ['myBookings'],
    queryFn: async () => {
      const res = await bookingApi.getMyBookings();
      return res.data;
    },
  });

  const { data: announcements = [] } = useQuery({
    queryKey: ['activeAnnouncements'],
    queryFn: async () => {
      const res = await announcementApi.getActive({});
      return res.data;
    },
  });

  const availableCount = equipment.filter(e => e.status === 'AVAILABLE').length;
  const upcomingBookings = myBookings.filter(b =>
    b.status === 'APPROVED' || b.status === 'CONFIRMED' || b.status === 'PENDING_APPROVAL'
  ).slice(0, 5);
  const pendingCount = myBookings.filter(b => b.status === 'PENDING_APPROVAL').length;
  const completedCount = myBookings.filter(b => b.status === 'COMPLETED').length;

  const stats = [
    { label: 'Available Equipment', value: availableCount, icon: Cpu, color: 'bg-green-100 text-green-700' },
    { label: 'My Bookings', value: myBookings.length, icon: Calendar, color: 'bg-blue-100 text-blue-700' },
    { label: 'Upcoming', value: upcomingBookings.length, icon: Clock, color: 'bg-yellow-100 text-yellow-700' },
    { label: 'Pending Approvals', value: pendingCount, icon: AlertTriangle, color: 'bg-orange-100 text-orange-700' },
  ];

  const statusConfig = {
    'PENDING_APPROVAL': { color: 'badge-warning', label: 'Pending' },
    'APPROVED': { color: 'badge-success', label: 'Approved' },
    'CONFIRMED': { color: 'badge-success', label: 'Confirmed' },
    'IN_USE': { color: 'badge-info', label: 'In Use' },
    'COMPLETED': { color: 'badge-info', label: 'Completed' },
    'CANCELLED': { color: 'badge-danger', label: 'Cancelled' },
    'REJECTED': { color: 'badge-danger', label: 'Rejected' },
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Welcome back, {user?.fullName}!</h1>
        <p className="text-gray-600 mt-1">Here's an overview of your lab resources.</p>
      </div>

      {announcements.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <Megaphone size={20} className="text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-800">Announcements</h2>
          </div>
          <div className="space-y-3">
            {announcements.slice(0, 3).map((ann) => (
              <div key={ann.id} className={`card border-l-4 ${
                ann.priority === 'CRITICAL' ? 'border-l-red-500 bg-red-50' :
                ann.priority === 'HIGH' ? 'border-l-orange-500 bg-orange-50' :
                ann.priority === 'MEDIUM' ? 'border-l-yellow-500 bg-yellow-50' :
                'border-l-blue-500 bg-blue-50'
              }`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-800">{ann.title}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        ann.priority === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                        ann.priority === 'HIGH' ? 'bg-orange-100 text-orange-700' :
                        ann.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>{ann.priority}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">
                        {ann.announcementType}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{ann.content}</p>
                    {ann.expiresAt && (
                      <p className="text-xs text-gray-400 mt-1">
                        Expires: {new Date(ann.expiresAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="card flex items-center gap-4">
            <div className={`p-3 rounded-xl ${stat.color}`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">My Upcoming Bookings</h3>
            <Link to="/bookings/my" className="text-sm text-primary-600 hover:text-primary-700">View All</Link>
          </div>
          {upcomingBookings.length === 0 ? (
            <p className="text-gray-500 text-center py-6">No upcoming bookings</p>
          ) : (
            <div className="space-y-3">
              {upcomingBookings.map((booking) => {
                const config = statusConfig[booking.status] || { color: 'badge-info', label: booking.status };
                return (
                  <div key={booking.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{booking.equipmentName || 'Equipment'}</p>
                      <p className="text-sm text-gray-500">
                        {booking.bookingDate} | {booking.startTime} - {booking.endTime}
                      </p>
                    </div>
                    <span className={config.color}>{config.label}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Available Equipment</h3>
            <Link to="/equipment" className="text-sm text-primary-600 hover:text-primary-700">Browse All</Link>
          </div>
          {equipment.filter(e => e.status === 'AVAILABLE').slice(0, 5).length === 0 ? (
            <p className="text-gray-500 text-center py-6">No available equipment</p>
          ) : (
            <div className="space-y-3">
              {equipment.filter(e => e.status === 'AVAILABLE').slice(0, 5).map((eq) => (
                <Link key={eq.id} to={`/equipment/${eq.id}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                  <div>
                    <p className="font-medium">{eq.equipmentName}</p>
                    <p className="text-sm text-gray-500">{eq.laboratoryName || 'N/A'}</p>
                  </div>
                  <span className="badge-success">Available</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
