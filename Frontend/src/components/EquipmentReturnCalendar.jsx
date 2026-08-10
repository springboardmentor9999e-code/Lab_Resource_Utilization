import React, { useState, useEffect, useCallback } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

export default function EquipmentReturnCalendar({ user, getAuthHeaders, triggerToast }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [returningId, setReturningId] = useState(null);

  const fetchMyBookings = useCallback(() => {
    setLoading(true);
    fetch('http://localhost:8080/api/bookings/my', {
      headers: getAuthHeaders()
    })
    .then(res => res.ok ? res.json() : [])
    .then(data => {
      setBookings(Array.isArray(data) ? data : []);
    })
    .catch(err => {
      triggerToast(err.message || 'Could not load your equipment return schedule');
      setBookings([]);
    })
    .finally(() => setLoading(false));
  }, [getAuthHeaders, triggerToast]);

  useEffect(() => {
    fetchMyBookings();
  }, [fetchMyBookings]);

  const handleReturnEquipment = (bookingId) => {
    if (!bookingId) return;
    setReturningId(bookingId);
    fetch(`http://localhost:8080/api/bookings/${bookingId}/return`, {
      method: 'POST',
      headers: getAuthHeaders()
    })
    .then(async res => {
      if (!res.ok) {
        let errStr = 'Failed to submit return request';
        try {
          const json = await res.json();
          errStr = json.message || json.error || errStr;
        } catch {
          const text = await res.text().catch(() => '');
          if (text) errStr = text;
        }
        throw new Error(errStr);
      }
      return res.json();
    })
    .then(() => {
      triggerToast('Return request submitted successfully! Waiting for lab manager approval.');
      setSelectedEvent(null);
      fetchMyBookings();
    })
    .catch(err => triggerToast(err.message || 'Return request failed'))
    .finally(() => setReturningId(null));
  };

  // Filter active return bookings (only equipment currently checked out or pending return)
  const activeReturnBookings = bookings.filter(b => {
    if (!b || !b.status) return false;
    const s = String(b.status).trim();
    // Exclude completed, returned, cancelled, or rejected bookings
    if (
      s === 'Completed' ||
      s === 'Returned' ||
      s === 'Approved Successfully' ||
      s === 'CANCELLED' ||
      s === 'Cancelled' ||
      s === 'REJECTED' ||
      s === 'Rejected'
    ) {
      return false;
    }
    // Include only active checked out equipment or items pending return approval
    return (
      s === 'In Use' ||
      s === 'IN_USE' ||
      s === 'Approved' ||
      s === 'Pending Return Approval' ||
      s === 'Pending Return'
    );
  });

  // Convert active bookings into FullCalendar events
  const calendarEvents = activeReturnBookings.map(b => {
    const now = new Date();
    const end = b.endTime ? new Date(b.endTime) : null;
    const isOverdue = end && end < now && (b.status === 'In Use' || b.status === 'IN_USE' || b.status === 'Approved');
    const isPendingReturn = b.status === 'Pending Return Approval' || b.status === 'Pending Return';

    let bg = '#68b1d5'; // default cyan blue
    let border = '#0369a1';

    if (isOverdue) {
      bg = '#c65a72'; // rose red
      border = '#be123c';
    } else if (isPendingReturn) {
      bg = '#896ccc'; // purple
      border = '#6d28d9';
    } else if (end && (end - now) < (24 * 60 * 60 * 1000)) {
      bg = '#e2b870'; // amber warning (due within 24h)
      border = '#d97706';
    }

    const eqName = b.equipment?.name || 'Equipment Item';
    const titleText = isOverdue ? `🚨 OVERDUE: Return ${eqName}` : `📦 Return ${eqName}`;

    return {
      id: String(b.bookingId),
      title: titleText,
      start: b.startTime ? new Date(b.startTime).toISOString() : new Date().toISOString(),
      end: b.endTime ? new Date(b.endTime).toISOString() : new Date().toISOString(),
      backgroundColor: bg,
      borderColor: border,
      textColor: '#ffffff',
      extendedProps: {
        bookingId: b.bookingId,
        equipmentName: eqName,
        category: b.equipment?.category || 'General',
        labName: b.equipment?.labName || b.equipment?.lab?.name || 'Assigned Lab',
        location: b.equipment?.location || 'Main Storage',
        serialNumber: b.equipment?.serialNumber || 'N/A',
        startTime: b.startTime,
        endTime: b.endTime,
        status: b.status,
        purpose: b.purpose || 'Research & Lab Work',
        isOverdue,
        isPendingReturn
      }
    };
  });

  const handleEventClick = (info) => {
    setSelectedEvent(info.event.extendedProps);
  };

  return (
    <div className="space-y-6 text-left animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border shadow-sm">
        <div>
          <h3 className="text-2xl font-bold text-slate-800 font-serif flex items-center gap-2">
            📅 Equipment Return Calendar Schedule
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Track exact dates, times, and deadlines for returning checked-out laboratory equipment.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchMyBookings}
            disabled={loading}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 px-3.5 rounded-xl text-xs transition flex items-center gap-1.5 border shadow-sm disabled:opacity-50"
          >
            <svg className={`w-4 h-4 text-slate-600 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {loading ? 'Refreshing...' : 'Refresh Calendar'}
          </button>
        </div>
      </div>

      {/* Color Guide / Legend */}
      <div className="bg-white p-4 rounded-xl border shadow-sm flex flex-wrap gap-4 items-center text-xs font-semibold text-slate-700">
        <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Legend:</span>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-cyan-600 inline-block shadow-sm"></span>
          <span>Upcoming Return</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-amber-500 inline-block shadow-sm"></span>
          <span>Due Within 24 Hours</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-rose-600 inline-block shadow-sm"></span>
          <span>🚨 Overdue Return</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-purple-600 inline-block shadow-sm"></span>
          <span>Pending Return Approval</span>
        </div>
      </div>

      {/* FullCalendar Wrapper */}
      <div className="bg-white p-6 rounded-2xl border shadow-sm fc-custom-theme">
        <style>{`
          .fc-custom-theme .fc-event {
            cursor: pointer;
            border-radius: 6px;
            padding: 2px 4px;
            font-size: 11px;
            box-shadow: 0 1px 2px rgba(0,0,0,0.05);
          }
          .fc-custom-theme .fc-event-title {
            font-weight: 700;
            white-space: normal;
            word-break: break-word;
            line-height: 1.25;
          }
          .fc-custom-theme .fc-timegrid-event {
            min-height: 32px !important;
            padding: 4px 6px !important;
          }
          .fc-custom-theme .fc-timegrid-slot {
            height: 2.75rem !important;
          }
          .fc-custom-theme .fc-toolbar-title {
            font-size: 1.125rem !important;
            font-weight: 800 !important;
            color: #1e293b;
          }
          .fc-custom-theme .fc-button-primary {
            background-color: #0891b2 !important;
            border-color: #0891b2 !important;
            font-size: 0.75rem !important;
            font-weight: 700 !important;
            border-radius: 0.5rem !important;
            padding: 0.4rem 0.75rem !important;
            box-shadow: 0 1px 2px rgba(0,0,0,0.05);
          }
          .fc-custom-theme .fc-button-primary:hover {
            background-color: #0e7490 !important;
            border-color: #0e7490 !important;
          }
          .fc-custom-theme .fc-daygrid-event {
            padding: 4px 6px !important;
            border-radius: 6px !important;
            margin-top: 2px !important;
            margin-bottom: 2px !important;
            color: #ffffff !important;
          }
          .fc-custom-theme .fc-daygrid-event .fc-event-main {
            color: #ffffff !important;
          }
          .fc-custom-theme .fc-daygrid-dot-event {
            background-color: transparent !important;
          }
        `}</style>
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          eventDisplay="block"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
          }}
          views={{
            dayGridMonth: {
              displayEventTime: false,
              eventDisplay: 'block'
            },
            timeGridWeek: {
              displayEventTime: true,
              slotMinTime: '07:00:00',
              slotMaxTime: '21:00:00',
              expandRows: true
            },
            timeGridDay: {
              displayEventTime: true,
              slotMinTime: '07:00:00',
              slotMaxTime: '21:00:00',
              expandRows: true
            }
          }}
          events={calendarEvents}
          eventClick={handleEventClick}
          height="auto"
          aspectRatio={1.5}
          editable={false}
          selectable={true}
        />
      </div>

      {/* Interactive Modal for Selected Event */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl border shadow-2xl max-w-md w-full overflow-hidden text-left">
            <div className={`p-5 border-b flex justify-between items-center ${
              selectedEvent.isOverdue ? 'bg-rose-50 border-rose-100' : 'bg-slate-50 border-slate-100'
            }`}>
              <div>
                <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                  selectedEvent.isOverdue
                    ? 'bg-rose-600 text-white'
                    : selectedEvent.isPendingReturn
                    ? 'bg-purple-600 text-white'
                    : 'bg-cyan-600 text-white'
                }`}>
                  {selectedEvent.isOverdue ? 'Overdue Return' : selectedEvent.status}
                </span>
                <h4 className="font-bold text-lg text-slate-800 font-serif mt-1">{selectedEvent.equipmentName}</h4>
              </div>
              <button
                type="button"
                onClick={() => setSelectedEvent(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Category</span>
                  <span className="font-semibold text-slate-800">{selectedEvent.category}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Serial Number</span>
                  <span className="font-mono text-slate-800">{selectedEvent.serialNumber}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Lab</span>
                  <span className="font-semibold text-slate-800">{selectedEvent.labName}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Location</span>
                  <span className="font-semibold text-slate-800">{selectedEvent.location}</span>
                </div>
              </div>

              {/* Exact Date & Return Time Schedule */}
              <div className="bg-cyan-50 border border-cyan-200 p-3.5 rounded-xl space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-bold text-cyan-900">Checkout Time:</span>
                  <span className="font-mono font-semibold text-cyan-950">
                    {selectedEvent.startTime ? new Date(selectedEvent.startTime).toLocaleString() : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center border-t border-cyan-200/60 pt-2">
                  <span className="text-[11px] font-bold text-rose-700 flex items-center gap-1">
                    ⏰ Return Due Deadline:
                  </span>
                  <span className="font-mono font-bold text-rose-800 text-sm">
                    {selectedEvent.endTime ? new Date(selectedEvent.endTime).toLocaleString() : 'N/A'}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Booking Purpose</span>
                <p className="text-slate-700 bg-slate-50 p-2.5 rounded-lg border font-mono text-[11px]">
                  {selectedEvent.purpose}
                </p>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t">
                <button
                  type="button"
                  onClick={() => setSelectedEvent(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition"
                >
                  Close
                </button>
                {selectedEvent.status !== 'Pending Return Approval' && (
                  <button
                    type="button"
                    disabled={returningId === selectedEvent.bookingId}
                    onClick={() => handleReturnEquipment(selectedEvent.bookingId)}
                    className="px-4 py-2 text-xs font-bold bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition shadow flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {returningId === selectedEvent.bookingId && <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
                    Request Equipment Return
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
