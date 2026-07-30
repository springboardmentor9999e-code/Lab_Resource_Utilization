import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Share2, Plus, Edit, Trash2, XCircle, CheckCircle, Building2, Cpu,
  Handshake, FileText, DollarSign, Clock, Filter, Pause,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { sharingApi, institutionApi } from '../../api/api';
import { useAuth } from '../../context/AuthContext';

const STATUS_COLORS = {
  ACTIVE: 'bg-green-100 text-green-700',
  INACTIVE: 'bg-red-100 text-red-700',
  PENDING: 'bg-yellow-100 text-yellow-700',
  APPROVED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
};

export default function ResourceSharingDashboard() {
  const queryClient = useQueryClient();
  const { isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('equipment');
  const [equipmentStatusFilter, setEquipmentStatusFilter] = useState('');
  const [bookingStatusFilter, setBookingStatusFilter] = useState('');
  const [partnershipStatusFilter, setPartnershipStatusFilter] = useState('');
  const [equipmentModal, setEquipmentModal] = useState(null);
  const [partnershipModal, setPartnershipModal] = useState(null);
  const [bookingModal, setBookingModal] = useState(null);
  const [equipmentForm, setEquipmentForm] = useState({ equipmentId: '', hourlyRate: '', dailyRate: '', securityDeposit: '' });
  const [partnershipForm, setPartnershipForm] = useState({ institutionAId: '', institutionBId: '', agreementStart: '', agreementEnd: '' });
  const [bookingForm, setBookingForm] = useState({ sharedEquipmentId: '', requestingInstitutionId: '', bookingDate: '', startTime: '', endTime: '', purpose: '' });
  const [editingEquipment, setEditingEquipment] = useState(null);
  const [editingPartnership, setEditingPartnership] = useState(null);

  const { data: institutions = [] } = useQuery({
    queryKey: ['institutions'],
    queryFn: async () => { const res = await institutionApi.getAll(); return res.data; },
  });

  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['sharing-analytics'],
    queryFn: async () => { const res = await sharingApi.getAnalytics(); return res.data; },
  });

  const { data: sharedEquipment = [], isLoading: equipmentLoading } = useQuery({
    queryKey: ['shared-equipment'],
    queryFn: async () => { const res = await sharingApi.getAllSharedEquipment(); return res.data; },
  });

  const { data: partnerships = [], isLoading: partnershipsLoading } = useQuery({
    queryKey: ['partnerships'],
    queryFn: async () => { const res = await sharingApi.getAllPartnerships(); return res.data; },
  });

  const { data: externalBookings = [], isLoading: bookingsLoading } = useQuery({
    queryKey: ['external-bookings'],
    queryFn: async () => { const res = await sharingApi.getAllExternalBookings(); return res.data; },
  });

  // Mutations
  const shareEquipmentMutation = useMutation({
    mutationFn: (data) => sharingApi.shareEquipment(data),
    onSuccess: () => { toast.success('Equipment shared successfully'); queryClient.invalidateQueries(['shared-equipment']); setEquipmentModal(null); resetEquipmentForm(); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to share equipment'),
  });

  const updateEquipmentMutation = useMutation({
    mutationFn: ({ id, data }) => sharingApi.updateSharedEquipment(id, data),
    onSuccess: () => { toast.success('Equipment updated'); queryClient.invalidateQueries(['shared-equipment']); setEquipmentModal(null); resetEquipmentForm(); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to update equipment'),
  });

  const stopSharingMutation = useMutation({
    mutationFn: (id) => sharingApi.stopSharing(id),
    onSuccess: () => { toast.success('Sharing stopped'); queryClient.invalidateQueries(['shared-equipment']); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to stop sharing'),
  });

  const createPartnershipMutation = useMutation({
    mutationFn: (data) => sharingApi.createPartnership(data),
    onSuccess: () => { toast.success('Partnership created'); queryClient.invalidateQueries(['partnerships']); setPartnershipModal(null); resetPartnershipForm(); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to create partnership'),
  });

  const updatePartnershipMutation = useMutation({
    mutationFn: ({ id, data }) => sharingApi.updatePartnership(id, data),
    onSuccess: () => { toast.success('Partnership updated'); queryClient.invalidateQueries(['partnerships']); setPartnershipModal(null); resetPartnershipForm(); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to update partnership'),
  });

  const deletePartnershipMutation = useMutation({
    mutationFn: (id) => sharingApi.deletePartnership(id),
    onSuccess: () => { toast.success('Partnership deleted'); queryClient.invalidateQueries(['partnerships']); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to delete partnership'),
  });

  const createBookingMutation = useMutation({
    mutationFn: (data) => sharingApi.createExternalBooking(data),
    onSuccess: () => { toast.success('Booking request created'); queryClient.invalidateQueries(['external-bookings']); setBookingModal(null); resetBookingForm(); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to create booking request'),
  });

  const approveBookingMutation = useMutation({
    mutationFn: (id) => sharingApi.approveExternalBooking(id),
    onSuccess: () => { toast.success('Booking approved'); queryClient.invalidateQueries(['external-bookings']); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to approve booking'),
  });

  const rejectBookingMutation = useMutation({
    mutationFn: (id) => sharingApi.rejectExternalBooking(id),
    onSuccess: () => { toast.success('Booking rejected'); queryClient.invalidateQueries(['external-bookings']); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to reject booking'),
  });

  const resetEquipmentForm = () => { setEquipmentForm({ equipmentId: '', hourlyRate: '', dailyRate: '', securityDeposit: '' }); setEditingEquipment(null); };
  const resetPartnershipForm = () => { setPartnershipForm({ institutionAId: '', institutionBId: '', agreementStart: '', agreementEnd: '' }); setEditingPartnership(null); };
  const resetBookingForm = () => setBookingForm({ sharedEquipmentId: '', requestingInstitutionId: '', bookingDate: '', startTime: '', endTime: '', purpose: '' });

  const handleEquipmentSubmit = () => {
    if (!equipmentForm.equipmentId || !equipmentForm.hourlyRate) {
      toast.error('Equipment ID and hourly rate are required');
      return;
    }
    const payload = {
      equipmentId: parseInt(equipmentForm.equipmentId),
      hourlyRate: parseFloat(equipmentForm.hourlyRate),
      dailyRate: equipmentForm.dailyRate ? parseFloat(equipmentForm.dailyRate) : null,
      securityDeposit: equipmentForm.securityDeposit ? parseFloat(equipmentForm.securityDeposit) : null,
    };
    if (editingEquipment) {
      updateEquipmentMutation.mutate({ id: editingEquipment.id, data: payload });
    } else {
      shareEquipmentMutation.mutate(payload);
    }
  };

  const handlePartnershipSubmit = () => {
    if (!partnershipForm.institutionAId || !partnershipForm.institutionBId || !partnershipForm.agreementStart || !partnershipForm.agreementEnd) {
      toast.error('Both institutions, start date, and end date are required');
      return;
    }
    if (partnershipForm.institutionAId === partnershipForm.institutionBId) {
      toast.error('Institutions must be different');
      return;
    }
    const payload = {
      institutionAId: parseInt(partnershipForm.institutionAId),
      institutionBId: parseInt(partnershipForm.institutionBId),
      agreementStart: partnershipForm.agreementStart,
      agreementEnd: partnershipForm.agreementEnd,
    };
    if (editingPartnership) {
      updatePartnershipMutation.mutate({ id: editingPartnership.id, data: payload });
    } else {
      createPartnershipMutation.mutate(payload);
    }
  };

  const handleBookingSubmit = () => {
    if (!bookingForm.sharedEquipmentId || !bookingForm.requestingInstitutionId || !bookingForm.bookingDate || !bookingForm.startTime || !bookingForm.endTime) {
      toast.error('All fields except purpose are required');
      return;
    }
    createBookingMutation.mutate({
      sharedEquipmentId: parseInt(bookingForm.sharedEquipmentId),
      requestingInstitutionId: parseInt(bookingForm.requestingInstitutionId),
      bookingDate: bookingForm.bookingDate,
      startTime: bookingForm.startTime,
      endTime: bookingForm.endTime,
      purpose: bookingForm.purpose,
    });
  };

  const filteredEquipment = sharedEquipment.filter((e) => !equipmentStatusFilter || e.sharingStatus === equipmentStatusFilter);
  const filteredBookings = externalBookings.filter((b) => !bookingStatusFilter || b.status === bookingStatusFilter);
  const filteredPartnerships = partnerships.filter((p) => !partnershipStatusFilter || p.status === partnershipStatusFilter);

  const statCards = [
    { label: 'Total Shared Equipment', value: analytics?.totalSharedEquipment ?? sharedEquipment.length, icon: Cpu, color: 'bg-blue-100 text-blue-700' },
    { label: 'Active Partnerships', value: analytics?.activePartnerships ?? partnerships.filter(p => p.status === 'ACTIVE').length, icon: Handshake, color: 'bg-green-100 text-green-700' },
    { label: 'Pending Requests', value: analytics?.pendingRequests ?? externalBookings.filter(b => b.status === 'PENDING').length, icon: Clock, color: 'bg-yellow-100 text-yellow-700' },
    { label: 'Total Revenue', value: `₹${(analytics?.totalRevenue ?? 0).toLocaleString()}`, icon: DollarSign, color: 'bg-purple-100 text-purple-700' },
  ];

  const tabs = [
    { id: 'equipment', label: 'Shared Equipment', icon: Cpu },
    { id: 'partnerships', label: 'Partnerships', icon: Handshake },
    { id: 'bookings', label: 'External Bookings', icon: FileText },
  ];

  if (analyticsLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Resource Sharing</h1>
          <p className="text-gray-600 mt-1">Manage equipment sharing, partnerships, and external bookings.</p>
        </div>
      </div>

      {/* Analytics Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat) => (
          <div key={stat.label} className="card flex items-start gap-3">
            <div className={`p-2.5 rounded-xl ${stat.color}`}>
              <stat.icon size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Shared Equipment */}
      {activeTab === 'equipment' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Filter size={16} className="text-gray-400" />
                <select className="input-field" value={equipmentStatusFilter} onChange={(e) => setEquipmentStatusFilter(e.target.value)}>
                  <option value="">All Status</option>
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>
            </div>
            {isAdmin && (
            <button onClick={() => { resetEquipmentForm(); setEquipmentModal('create'); }} className="btn-primary flex items-center gap-2">
              <Plus size={16} /> Share Equipment
            </button>
            )}
          </div>

          {equipmentLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : filteredEquipment.length === 0 ? (
            <div className="card text-center py-12">
              <Cpu size={48} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">No shared equipment found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredEquipment.map((item) => (
                <div key={item.id} className="card hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Cpu size={20} className="text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">{item.equipmentName || `Equipment #${item.equipmentId}`}</h3>
                        <p className="text-xs text-gray-500">{item.equipmentCode || `EQ-${item.equipmentId}`}</p>
                      </div>
                    </div>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${STATUS_COLORS[item.sharingStatus] || 'bg-gray-100 text-gray-700'}`}>
                      {item.sharingStatus}
                    </span>
                  </div>
                  <div className="space-y-2 mb-4">
                    {item.labName && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Building2 size={14} className="text-gray-400" />
                        {item.labName}{item.institutionName ? ` — ${item.institutionName}` : ''}
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <DollarSign size={14} className="text-gray-400" />
                      ₹{item.hourlyRate ?? 0}/hr{item.dailyRate != null ? ` | ₹${item.dailyRate}/day` : ''}
                    </div>
                    {item.securityDeposit != null && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <FileText size={14} className="text-gray-400" />
                        Security Deposit: ₹{item.securityDeposit.toLocaleString()}
                      </div>
                    )}
                  </div>
                  {isAdmin && (
                  <div className="flex gap-2 border-t pt-3">
                    <button onClick={() => {
                      setEquipmentForm({
                        equipmentId: item.equipmentId || '',
                        hourlyRate: item.hourlyRate || '',
                        dailyRate: item.dailyRate || '',
                        securityDeposit: item.securityDeposit || '',
                      });
                      setEditingEquipment(item);
                      setEquipmentModal('edit');
                    }} className="flex-1 flex items-center justify-center gap-1 p-2 text-sm text-gray-600 hover:bg-gray-100 rounded transition-colors">
                      <Edit size={14} /> Edit
                    </button>
                    {item.sharingStatus === 'ACTIVE' && (
                    <button onClick={() => {
                      if (window.confirm('Stop sharing this equipment?')) stopSharingMutation.mutate(item.id);
                    }} className="flex-1 flex items-center justify-center gap-1 p-2 text-sm text-red-600 hover:bg-red-50 rounded transition-colors">
                      <Pause size={14} /> Stop Sharing
                    </button>
                    )}
                  </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Partnerships */}
      {activeTab === 'partnerships' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Filter size={16} className="text-gray-400" />
                <select className="input-field" value={partnershipStatusFilter} onChange={(e) => setPartnershipStatusFilter(e.target.value)}>
                  <option value="">All Status</option>
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>
            </div>
            {isAdmin && (
            <button onClick={() => { resetPartnershipForm(); setPartnershipModal('create'); }} className="btn-primary flex items-center gap-2">
              <Plus size={16} /> Create Partnership
            </button>
            )}
          </div>

          {partnershipsLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : filteredPartnerships.length === 0 ? (
            <div className="card text-center py-12">
              <Handshake size={48} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">No partnerships found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPartnerships.map((p) => (
                <div key={p.id} className="card hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Handshake size={20} className="text-green-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{p.institutionAName || `Institution #${p.institutionAId}`}</p>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <Share2 size={10} /> linked to
                        </p>
                        <p className="font-semibold text-gray-800">{p.institutionBName || `Institution #${p.institutionBId}`}</p>
                      </div>
                    </div>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${STATUS_COLORS[p.status] || 'bg-gray-100 text-gray-700'}`}>
                      {p.status}
                    </span>
                  </div>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Building2 size={14} className="text-gray-400" />
                      {p.institutionAName || `Institution #${p.institutionAId}`} &harr; {p.institutionBName || `Institution #${p.institutionBId}`}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock size={14} className="text-gray-400" />
                      {p.agreementStart || 'N/A'}{p.agreementEnd ? ` — ${p.agreementEnd}` : ' — Ongoing'}
                    </div>
                  </div>
                  {isAdmin && (
                  <div className="flex gap-2 border-t pt-3">
                    <button onClick={() => {
                      setPartnershipForm({
                        institutionAId: p.institutionAId || '',
                        institutionBId: p.institutionBId || '',
                        agreementStart: p.agreementStart || '',
                        agreementEnd: p.agreementEnd || '',
                      });
                      setEditingPartnership(p);
                      setPartnershipModal('edit');
                    }} className="flex-1 flex items-center justify-center gap-1 p-2 text-sm text-gray-600 hover:bg-gray-100 rounded transition-colors">
                      <Edit size={14} /> Edit
                    </button>
                    <button onClick={() => {
                      if (window.confirm('Delete this partnership?')) deletePartnershipMutation.mutate(p.id);
                    }} className="flex-1 flex items-center justify-center gap-1 p-2 text-sm text-red-600 hover:bg-red-50 rounded transition-colors">
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: External Bookings */}
      {activeTab === 'bookings' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Filter size={16} className="text-gray-400" />
                <select className="input-field" value={bookingStatusFilter} onChange={(e) => setBookingStatusFilter(e.target.value)}>
                  <option value="">All Status</option>
                  <option value="PENDING">Pending</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>
            </div>
            {isAdmin && (
            <button onClick={() => { resetBookingForm(); setBookingModal('create'); }} className="btn-primary flex items-center gap-2">
              <Plus size={16} /> New Request
            </button>
            )}
          </div>

          <div className="card">
            {bookingsLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            ) : filteredBookings.length === 0 ? (
              <div className="text-center py-12">
                <FileText size={48} className="mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500">No external bookings found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Equipment</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Requesting Institution</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Requested By</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Date</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Time</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Purpose</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Status</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBookings.map((booking) => (
                      <tr key={booking.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <p className="font-medium text-gray-800">{booking.equipmentName || `EQ-${booking.sharedEquipmentId}`}</p>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">{booking.requestingInstitution || 'N/A'}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">{booking.requestedBy || 'N/A'}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">{booking.bookingDate || 'N/A'}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">{booking.startTime && booking.endTime ? `${booking.startTime} — ${booking.endTime}` : 'N/A'}</td>
                        <td className="py-3 px-4 text-sm text-gray-600 max-w-[150px] truncate" title={booking.purpose}>{booking.purpose || '—'}</td>
                        <td className="py-3 px-4">
                          <span className={`text-xs font-medium px-2 py-1 rounded-full ${STATUS_COLORS[booking.status] || 'bg-gray-100 text-gray-700'}`}>
                            {booking.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-1 justify-end">
                            {booking.status === 'PENDING' && (
                              <>
                                <button onClick={() => approveBookingMutation.mutate(booking.id)}
                                  className="p-1.5 hover:bg-green-100 rounded text-green-600" title="Approve">
                                  <CheckCircle size={14} />
                                </button>
                                <button onClick={() => rejectBookingMutation.mutate(booking.id)}
                                  className="p-1.5 hover:bg-red-100 rounded text-red-600" title="Reject">
                                  <XCircle size={14} />
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
            )}
          </div>
        </div>
      )}

      {/* Share/Edit Equipment Modal */}
      {equipmentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{editingEquipment ? 'Edit Shared Equipment' : 'Share Equipment'}</h3>
              <button onClick={() => { setEquipmentModal(null); resetEquipmentForm(); }} className="p-1 hover:bg-gray-100 rounded">
                <XCircle size={18} className="text-gray-500" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Equipment ID *</label>
                <input className="input-field w-full" type="number" placeholder="e.g. 42"
                  value={equipmentForm.equipmentId}
                  onChange={(e) => setEquipmentForm({ ...equipmentForm, equipmentId: e.target.value })}
                  disabled={!!editingEquipment} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hourly Rate (₹) *</label>
                <input className="input-field w-full" type="number" step="0.01" placeholder="e.g. 500"
                  value={equipmentForm.hourlyRate}
                  onChange={(e) => setEquipmentForm({ ...equipmentForm, hourlyRate: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Daily Rate (₹)</label>
                <input className="input-field w-full" type="number" step="0.01" placeholder="e.g. 3000"
                  value={equipmentForm.dailyRate}
                  onChange={(e) => setEquipmentForm({ ...equipmentForm, dailyRate: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Security Deposit (₹)</label>
                <input className="input-field w-full" type="number" step="0.01" placeholder="e.g. 10000"
                  value={equipmentForm.securityDeposit}
                  onChange={(e) => setEquipmentForm({ ...equipmentForm, securityDeposit: e.target.value })} />
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-6">
              <button onClick={() => { setEquipmentModal(null); resetEquipmentForm(); }} className="btn-secondary">Cancel</button>
              <button onClick={handleEquipmentSubmit} className="btn-primary"
                disabled={shareEquipmentMutation.isPending || updateEquipmentMutation.isPending}>
                {editingEquipment ? 'Update' : 'Share Equipment'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Partnership Modal */}
      {partnershipModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{editingPartnership ? 'Edit Partnership' : 'Create Partnership'}</h3>
              <button onClick={() => { setPartnershipModal(null); resetPartnershipForm(); }} className="p-1 hover:bg-gray-100 rounded">
                <XCircle size={18} className="text-gray-500" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Institution A *</label>
                <select className="input-field w-full" value={partnershipForm.institutionAId}
                  onChange={(e) => setPartnershipForm({ ...partnershipForm, institutionAId: e.target.value })}>
                  <option value="">Select Institution</option>
                  {institutions.map((inst) => (
                    <option key={inst.id} value={inst.id}>{inst.institutionName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Institution B *</label>
                <select className="input-field w-full" value={partnershipForm.institutionBId}
                  onChange={(e) => setPartnershipForm({ ...partnershipForm, institutionBId: e.target.value })}>
                  <option value="">Select Institution</option>
                  {institutions.map((inst) => (
                    <option key={inst.id} value={inst.id}>{inst.institutionName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
                <input className="input-field w-full" type="date" value={partnershipForm.agreementStart}
                  onChange={(e) => setPartnershipForm({ ...partnershipForm, agreementStart: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input className="input-field w-full" type="date" value={partnershipForm.agreementEnd}
                  onChange={(e) => setPartnershipForm({ ...partnershipForm, agreementEnd: e.target.value })} />
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-6">
              <button onClick={() => { setPartnershipModal(null); resetPartnershipForm(); }} className="btn-secondary">Cancel</button>
              <button onClick={handlePartnershipSubmit} className="btn-primary"
                disabled={createPartnershipMutation.isPending || updatePartnershipMutation.isPending}>
                {editingPartnership ? 'Update' : 'Create Partnership'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New External Booking Modal */}
      {bookingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">New External Booking Request</h3>
              <button onClick={() => { setBookingModal(null); resetBookingForm(); }} className="p-1 hover:bg-gray-100 rounded">
                <XCircle size={18} className="text-gray-500" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Shared Equipment *</label>
                <select className="input-field w-full" value={bookingForm.sharedEquipmentId}
                  onChange={(e) => setBookingForm({ ...bookingForm, sharedEquipmentId: e.target.value })}>
                  <option value="">Select Equipment</option>
                  {sharedEquipment.filter((e) => e.sharingStatus === 'ACTIVE').map((eq) => (
                    <option key={eq.id} value={eq.id}>
                      {eq.equipmentName || `EQ-${eq.equipmentId}`} — ₹{eq.hourlyRate}/hr
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Requesting Institution *</label>
                <select className="input-field w-full" value={bookingForm.requestingInstitutionId}
                  onChange={(e) => setBookingForm({ ...bookingForm, requestingInstitutionId: e.target.value })}>
                  <option value="">Select Institution</option>
                  {institutions.map((inst) => (
                    <option key={inst.id} value={inst.id}>{inst.institutionName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Booking Date *</label>
                <input className="input-field w-full" type="date" value={bookingForm.bookingDate}
                  onChange={(e) => setBookingForm({ ...bookingForm, bookingDate: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Time *</label>
                  <input className="input-field w-full" type="time" value={bookingForm.startTime}
                    onChange={(e) => setBookingForm({ ...bookingForm, startTime: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Time *</label>
                  <input className="input-field w-full" type="time" value={bookingForm.endTime}
                    onChange={(e) => setBookingForm({ ...bookingForm, endTime: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Purpose</label>
                <textarea className="input-field w-full" rows={3} placeholder="Brief description of the purpose..."
                  value={bookingForm.purpose}
                  onChange={(e) => setBookingForm({ ...bookingForm, purpose: e.target.value })} />
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-6">
              <button onClick={() => { setBookingModal(null); resetBookingForm(); }} className="btn-secondary">Cancel</button>
              <button onClick={handleBookingSubmit} className="btn-primary" disabled={createBookingMutation.isPending}>
                Submit Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
