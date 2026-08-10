import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Plus } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { equipmentApi, bookingApi } from '../../api/api';

const timeOptions = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30', '18:00',
];

const statusColors = {
  CONFIRMED: '#10b981',
  APPROVED: '#22c55e',
  PENDING_APPROVAL: '#f59e0b',
  IN_USE: '#3b82f6',
  COMPLETED: '#6b7280',
  REJECTED: '#ef4444',
  CANCELLED: '#9ca3af',
  EXPIRED: '#d1d5db',
  NO_SHOW: '#dc2626',
  DRAFT: '#a78bfa',
};

const today = new Date().toISOString().split('T')[0];
const maxDate = (() => { const d = new Date(); d.setDate(d.getDate() + 30); return d.toISOString().split('T')[0]; })();

export default function BookingCalendarPage() {
  const queryClient = useQueryClient();
  const location = useLocation();
  const [selectedEquipmentId, setSelectedEquipmentId] = useState('');
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState(today);
  const [bookingForm, setBookingForm] = useState({
    startTime: '',
    endTime: '',
    purpose: '',
    recurrencePattern: '',
    recurrenceEndDate: '',
  });

  useEffect(() => {
    const eqId = location.state?.equipmentId;
    if (eqId) {
      setSelectedEquipmentId(eqId.toString());
      setShowBookingForm(true);
    }
  }, []);

  const { data: equipment = [] } = useQuery({
    queryKey: ['equipment'],
    queryFn: async () => {
      const res = await equipmentApi.getAll();
      return res.data.content || [];
    },
  });

  const { data: allBookings = [] } = useQuery({
    queryKey: ['allBookings'],
    queryFn: async () => {
      const res = await bookingApi.getAll();
      return res.data.content || [];
    },
  });

  const createBookingMutation = useMutation({
    mutationFn: (data) => bookingApi.create(data),
    onSuccess: () => {
      toast.success('Booking request submitted successfully');
      queryClient.invalidateQueries(['allBookings']);
      setShowBookingForm(false);
      setBookingForm({ startTime: '', endTime: '', purpose: '' });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to create booking');
    },
  });

  const handleCreateBooking = () => {
    if (!selectedEquipmentId) {
      toast.error('Please select equipment');
      return;
    }
    if (!selectedDate) {
      toast.error('Please select a booking date');
      return;
    }
    if (selectedDate < today) {
      toast.error('Booking date cannot be in the past');
      return;
    }
    if (selectedDate > maxDate) {
      toast.error('Booking date must be within 30 days');
      return;
    }
    if (!bookingForm.startTime) {
      toast.error('Please select a start time');
      return;
    }
    if (!bookingForm.endTime) {
      toast.error('Please select an end time');
      return;
    }
    if (bookingForm.endTime <= bookingForm.startTime) {
      toast.error('End time must be after start time');
      return;
    }
    createBookingMutation.mutate({
      equipment: { id: parseInt(selectedEquipmentId) },
      bookingDate: selectedDate,
      startTime: bookingForm.startTime,
      endTime: bookingForm.endTime,
      purpose: bookingForm.purpose,
      recurrencePattern: bookingForm.recurrencePattern || null,
      recurrenceEndDate: bookingForm.recurrenceEndDate || null,
    });
  };

  const calendarEvents = allBookings
    .filter(b => b.status !== 'CANCELLED')
    .map(b => {
      const statusColor = statusColors[b.status] || '#6b7280';
      const roleDisplay = (b.userRole || '').replace(/_/g, ' ');
      return {
        id: b.id.toString(),
        title: `${b.equipmentName || 'Equipment'} — ${b.userFullName || 'Unknown'} [${roleDisplay}]`,
        start: `${b.bookingDate}T${b.startTime?.substring(0, 5)}`,
        end: `${b.bookingDate}T${b.endTime?.substring(0, 5)}`,
        allDay: false,
        backgroundColor: statusColor,
        borderColor: statusColor,
        extendedProps: {
          status: b.status,
          purpose: b.purpose,
          equipmentName: b.equipmentName,
          userFullName: b.userFullName,
          userRole: roleDisplay,
          userInstitutionName: b.userInstitutionName,
          userDepartmentName: b.userDepartmentName,
        },
      };
    });

  const handleDateClick = (info) => {
    const clickedDate = info.dateStr;
    if (clickedDate >= today && clickedDate <= maxDate) {
      setSelectedDate(clickedDate);
      setShowBookingForm(true);
    }
  };

  const handleEventClick = (info) => {
    const { status, purpose, equipmentName, userFullName, userRole, userInstitutionName, userDepartmentName } = info.event.extendedProps;
    const lines = [
      `Equipment: ${equipmentName}`,
      `Booked by: ${userFullName || 'Unknown'}`,
      `Role: ${userRole || 'N/A'}`,
      userInstitutionName && `Institution: ${userInstitutionName}`,
      userDepartmentName && `Department: ${userDepartmentName}`,
      `Status: ${status?.replace(/_/g, ' ')}`,
      purpose && `Purpose: ${purpose}`,
    ].filter(Boolean);
    toast(lines.join('\n'), { icon: '📋', duration: 5000 });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Booking Calendar</h1>
          <p className="text-gray-600 mt-1">View equipment availability and make bookings</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            className="input-field w-64"
            value={selectedEquipmentId}
            onChange={(e) => setSelectedEquipmentId(e.target.value)}
          >
            <option value="">Filter by Equipment</option>
            {equipment.filter(e => e.status === 'AVAILABLE').map(eq => (
              <option key={eq.id} value={eq.id}>
                {eq.equipmentName} ({eq.equipmentCode})
              </option>
            ))}
          </select>
          <button
            onClick={() => setShowBookingForm(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={18} /> New Booking
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="card mb-4">
        <div className="flex flex-wrap gap-4 text-sm">
          {Object.entries(statusColors).filter(([k]) => ['CONFIRMED', 'APPROVED', 'PENDING_APPROVAL', 'IN_USE', 'REJECTED', 'CANCELLED'].includes(k)).map(([status, color]) => (
            <div key={status} className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: color }} />
              <span className="text-gray-600">{status.replace(/_/g, ' ')}</span>
            </div>
          ))}
        </div>
      </div>

      {/* FullCalendar */}
      <div className="card">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay',
          }}
          events={calendarEvents}
          dateClick={handleDateClick}
          eventClick={handleEventClick}
          height="auto"
          contentHeight={600}
          dayMaxEvents={4}
          weekends={true}
          validRange={{ start: today, end: maxDate }}
          slotMinTime="08:00:00"
          slotMaxTime="18:00:00"
          slotLabelFormat={{
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          }}
          eventDisplay="block"
          nowIndicator={true}
        />
      </div>

      {/* Booking Form Modal */}
      {showBookingForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Create Booking</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Equipment *</label>
                <select
                  className="input-field"
                  value={selectedEquipmentId}
                  onChange={(e) => setSelectedEquipmentId(e.target.value)}
                >
                  <option value="">Select Equipment</option>
                  {equipment.filter(e => e.status === 'AVAILABLE').map(eq => (
                    <option key={eq.id} value={eq.id}>
                      {eq.equipmentName} ({eq.equipmentCode})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Booking Date *</label>
                <input
                  type="date"
                  className="input-field"
                  value={selectedDate}
                  min={today}
                  max={maxDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
                <p className="text-xs text-gray-400 mt-1">Up to 30 days ahead</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Time *</label>
                  <select
                    className="input-field"
                    value={bookingForm.startTime}
                    onChange={(e) => setBookingForm({ ...bookingForm, startTime: e.target.value, endTime: '' })}
                  >
                    <option value="">-- Select --</option>
                    {timeOptions.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Time *</label>
                  <select
                    className="input-field"
                    value={bookingForm.endTime}
                    onChange={(e) => setBookingForm({ ...bookingForm, endTime: e.target.value })}
                    disabled={!bookingForm.startTime}
                  >
                    <option value="">-- Select --</option>
                    {bookingForm.startTime && timeOptions.filter(t => t > bookingForm.startTime).map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Purpose</label>
                <textarea
                  className="input-field"
                  rows={3}
                  placeholder="Describe the purpose of this booking..."
                  value={bookingForm.purpose}
                  onChange={(e) => setBookingForm({ ...bookingForm, purpose: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Repeat</label>
                  <select
                    className="input-field"
                    value={bookingForm.recurrencePattern}
                    onChange={(e) => setBookingForm({ ...bookingForm, recurrencePattern: e.target.value })}
                  >
                    <option value="">No repeat</option>
                    <option value="DAILY">Daily</option>
                    <option value="WEEKLY">Weekly</option>
                    <option value="BIWEEKLY">Biweekly</option>
                    <option value="MONTHLY">Monthly</option>
                  </select>
                </div>
                {bookingForm.recurrencePattern && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Repeat Until</label>
                    <input
                      type="date"
                      className="input-field"
                      value={bookingForm.recurrenceEndDate}
                      min={selectedDate}
                      onChange={(e) => setBookingForm({ ...bookingForm, recurrenceEndDate: e.target.value })}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={() => { setShowBookingForm(false); setBookingForm({ startTime: '', endTime: '', purpose: '', recurrencePattern: '', recurrenceEndDate: '' }); }}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateBooking}
                className="btn-primary"
                disabled={createBookingMutation.isPending}
              >
                {createBookingMutation.isPending ? 'Submitting...' : 'Submit Booking'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
