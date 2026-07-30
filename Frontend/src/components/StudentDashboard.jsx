import React, { useState, useEffect } from "react";
import Skeleton from "react-loading-skeleton";
import { usePermissions } from "../context/PermissionsContext";
import microscope from "../assets/microscope.png";

export default function StudentDashboard({ user, onLogout }) {
  const { hasPermission } = usePermissions();

  // Loading states
  const [loadingEquipments, setLoadingEquipments] = useState(true);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [loadingWaitlists, setLoadingWaitlists] = useState(true);

  // Tabs states
  const [activeTab, setActiveTab] = useState("home"); // 'home' | 'booking' | 'account' | 'settings'

  // Lists states
  const [equipments, setEquipments] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [waitlists, setWaitlists] = useState([]);
  const [activeNotifications, setActiveNotifications] = useState([]);

  // Views states
  const [viewedEquipment, setViewedEquipment] = useState(null);

  // Filters & Sorting states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState("name");

  // Modals / Toast states
  const [toastMessage, setToastMessage] = useState("");
  const [selectedEquipment, setSelectedEquipment] = useState(null); // For booking modal
  const [selectedWaitlistEquipment, setSelectedWaitlistEquipment] = useState(null); // For waitlist join modal

  // Form values
  const [bookingPurpose, setBookingPurpose] = useState("");
  const [bookingDate, setBookingDate] = useState("2026-07-21");
  const [bookingStart, setBookingStart] = useState("09:00");
  const [bookingEnd, setBookingEnd] = useState("11:00");

  const [waitlistDate, setWaitlistDate] = useState("2026-07-21");
  const [waitlistStart, setWaitlistStart] = useState("09:00");
  const [waitlistEnd, setWaitlistEnd] = useState("11:00");

  useEffect(() => {
    setViewedEquipment(null);
  }, [activeTab]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return token
      ? {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        }
      : {
          "Content-Type": "application/json",
        };
  };

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 4000);
  };

  const loadEquipment = () => {
    setLoadingEquipments(true);
    fetch("http://localhost:8080/api/equipment/search", {
      headers: getAuthHeaders(),
    })
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => setEquipments(data))
      .catch(() => {
        setEquipments([]);
      })
      .finally(() => setLoadingEquipments(false));
  };

  const loadBookings = () => {
    setLoadingBookings(true);
    fetch("http://localhost:8080/api/bookings/my", {
      headers: getAuthHeaders(),
    })
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => setBookings(data))
      .catch(() => {
        setBookings([]);
      })
      .finally(() => setLoadingBookings(false));
  };

  const loadWaitlists = () => {
    setLoadingWaitlists(true);
    fetch("http://localhost:8080/api/waitlist/my", {
      headers: getAuthHeaders(),
    })
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => setWaitlists(data))
      .catch(() => {
        setWaitlists([]);
      })
      .finally(() => setLoadingWaitlists(false));
  };

  const loadActiveNotifications = () => {
    fetch("http://localhost:8080/api/waitlist/active-notifications", {
      headers: getAuthHeaders(),
    })
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => setActiveNotifications(data))
      .catch(() => {
        setActiveNotifications([]);
      });
  };

  useEffect(() => {
    loadEquipment();
    loadBookings();
    loadWaitlists();
    loadActiveNotifications();
  }, [user]);

  // Poll for live notifications and equipment status every 10 seconds
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => {
      loadActiveNotifications();
      loadWaitlists();
      loadEquipment();
    }, 10000);
    return () => clearInterval(interval);
  }, [user]);

  const filteredEquipments = equipments
    .filter((eq) => {
      const eqIdStr = (eq.equipmentId || eq.id || "").toString().toLowerCase();
      const matchesSearch =
        eq.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        eqIdStr.includes(searchQuery.toLowerCase()) ||
        eq.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === "All" || eq.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "status") return a.status.localeCompare(b.status);
      if (sortBy === "cost") return (a.cost || 0) - (b.cost || 0);
      return 0;
    });

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case "Operational":
        return "bg-green-100 text-green-700 font-semibold border-green-200";
      case "Calibration Required":
        return "bg-amber-100 text-amber-700 font-semibold border-amber-200";
      case "Maintenance Due":
        return "bg-rose-100 text-rose-700 font-semibold border-rose-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const handleConfirmBooking = (e) => {
    e.preventDefault();
    if (!selectedEquipment) return;

    const payload = {
      equipmentId: selectedEquipment.equipmentId || selectedEquipment.id,
      startTime: `${bookingDate}T${bookingStart}:00Z`,
      endTime: `${bookingDate}T${bookingEnd}:00Z`,
      purpose: bookingPurpose || "General Student Lab Research run",
    };

    fetch("http://localhost:8080/api/bookings", {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => {
        setBookings([data, ...bookings]);
        triggerToast(`Booking submitted for ${selectedEquipment.name}!`);
        setSelectedEquipment(null);
      })
      .catch(() => {
        const newBooking = {
          bookingId: `BK-${Math.floor(1000 + Math.random() * 9000)}`,
          equipment: selectedEquipment,
          startTime: `${bookingDate}T${bookingStart}:00Z`,
          endTime: `${bookingDate}T${bookingEnd}:00Z`,
          purpose: bookingPurpose || "General Student Lab Research run",
          status: "Pending Approval",
        };
        setBookings([newBooking, ...bookings]);
        triggerToast(
          `Booking submitted (mock fallback) for ${selectedEquipment.name}!`,
        );
        setSelectedEquipment(null);
      });
  };

  const handleConfirmWaitlist = (e) => {
    e.preventDefault();
    if (!selectedWaitlistEquipment) return;

    const startISO = `${waitlistDate}T${waitlistStart}:00Z`;
    const endISO = `${waitlistDate}T${waitlistEnd}:00Z`;
    const eqId = selectedWaitlistEquipment.equipmentId || selectedWaitlistEquipment.id;

    fetch(`http://localhost:8080/api/waitlist/join?equipmentId=${eqId}&startTime=${startISO}&endTime=${endISO}`, {
      method: "POST",
      headers: getAuthHeaders(),
    })
      .then(async (res) => {
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.message || "Failed to join waitlist queue.");
        }
        return res.json();
      })
      .then(() => {
        triggerToast(`Successfully joined waitlist queue for ${selectedWaitlistEquipment.name}!`);
        setSelectedWaitlistEquipment(null);
        loadWaitlists();
      })
      .catch((err) => {
        triggerToast(err.message || "Failed to join waitlist.");
      });
  };

  const handleReturnRequest = (bookingId) => {
    fetch(`http://localhost:8080/api/bookings/${bookingId}/return`, {
      method: "POST",
      headers: getAuthHeaders(),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(() => {
        setBookings(
          bookings.map((b) =>
            b.bookingId === bookingId
              ? { ...b, status: "Returned (Pending Approval)" }
              : b,
          ),
        );
        triggerToast("Return request submitted.");
      })
      .catch(() => {
        setBookings(
          bookings.map((b) =>
            b.bookingId === bookingId
              ? { ...b, status: "Returned (Pending Approval)" }
              : b,
          ),
        );
        triggerToast("Return request submitted (mock fallback).");
      });
  };

  const handleCardClick = (e, eq) => {
    if (e.target.closest("button")) return;
    setViewedEquipment(eq);
  };

  const handleJoinWaitlist = (eq) => {
    const eqId = eq.equipmentId || eq.id;
    const alreadyWaitlisted = waitlists.some((w) => (w.equipmentId || w.id) === eqId && (w.status === "Waiting" || w.status === "Notified"));
    if (alreadyWaitlisted) {
      triggerToast(`${eq.name} is already in your active waitlist queue.`);
      return;
    }
    setSelectedWaitlistEquipment(eq);
  };

  const handleCancelWaitlist = (wlId) => {
    fetch(`http://localhost:8080/api/waitlist/${wlId}/cancel`, {
      method: "POST",
      headers: getAuthHeaders(),
    })
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(() => {
        triggerToast("Waitlist request cancelled successfully.");
        loadWaitlists();
        loadActiveNotifications();
      })
      .catch(() => {
        triggerToast("Failed to cancel waitlist entry.");
      });
  };

  const handleQuickBook = (notif) => {
    const eq = equipments.find((e) => (e.equipmentId || e.id) === notif.equipmentId);
    if (!eq) {
      triggerToast("Error finding equipment details.");
      return;
    }
    const startInstant = new Date(notif.requestedStart);
    const dateStr = startInstant.toISOString().split("T")[0];
    const startTimeStr = startInstant.toTimeString().substring(0, 5);
    const endInstant = new Date(notif.requestedEnd);
    const endTimeStr = endInstant.toTimeString().substring(0, 5);

    setBookingDate(dateStr);
    setBookingStart(startTimeStr);
    setBookingEnd(endTimeStr);
    setBookingPurpose("Waitlist Priority Fulfillment");
    setSelectedEquipment(eq);
  };

  const renderEquipmentDetailView = (eq) => {
    return (
      <div className="space-y-6 animate-fadeIn">
        <button
          onClick={() => setViewedEquipment(null)}
          className="text-xs font-bold text-primary hover:underline flex items-center gap-1.5"
        >
          &larr; Back to Assets
        </button>

        <div className="bg-white border border-outline-variant/30 rounded-2xl overflow-hidden shadow-sm grid grid-cols-1 md:grid-cols-2 gap-8 p-6 md:p-8">
          {/* Left Column: Image */}
          <div className="h-64 md:h-[400px] rounded-xl overflow-hidden bg-slate-50 border relative">
            <img
              src={eq.imageUrl}
              alt={eq.name}
              className="w-full h-full object-cover"
            />
            <span className={`absolute top-4 left-4 px-3 py-1 text-[10px] uppercase font-bold tracking-wider rounded-full border shadow-sm ${getStatusBadgeStyle(eq.status)}`}>
              {eq.status}
            </span>
          </div>

          {/* Right Column: Details & Actions */}
          <div className="flex flex-col justify-between space-y-6 text-left">
            <div className="space-y-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-widest text-primary-container bg-primary-container/10 px-2 py-0.5 rounded">
                  {eq.category}
                </span>
                <h2 className="text-3xl font-bold text-on-surface font-serif mt-2 leading-tight">
                  {eq.name}
                </h2>
                <p className="text-xs text-on-surface-variant font-mono mt-1">
                  Asset ID: {eq.equipmentId || eq.id} &bull; Model: {eq.model || "Axiolab 5"}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
                <div className="bg-slate-50 p-3 rounded-lg border">
                  <span className="text-[9px] text-slate-500 block uppercase font-bold">Manufacturer</span>
                  <span className="text-sm font-semibold mt-0.5 block">{eq.manufacturer || 'Zeiss Instruments'}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border">
                  <span className="text-[9px] text-slate-500 block uppercase font-bold">Serial Number</span>
                  <span className="text-sm font-semibold mt-0.5 block">{eq.serialNumber || 'SN-88902-X'}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border">
                  <span className="text-[9px] text-slate-500 block uppercase font-bold">Purchase Date</span>
                  <span className="text-sm font-semibold mt-0.5 block">{eq.purchaseDate || '2026-07-18'}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border">
                  <span className="text-[9px] text-slate-500 block uppercase font-bold">Asset Cost</span>
                  <span className="text-sm font-semibold mt-0.5 block text-green-700">${eq.purchaseCost || '12000'}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border">
                  <span className="text-[9px] text-slate-500 block uppercase font-bold">Hourly Rate</span>
                  <span className="text-sm font-semibold mt-0.5 block text-[#00a2c0] font-bold">${eq.cost || 'N/A'}/hr</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border">
                  <span className="text-[9px] text-slate-500 block uppercase font-bold">Location</span>
                  <span className="text-sm font-semibold mt-0.5 block">{eq.location}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border col-span-2">
                  <span className="text-[9px] text-slate-500 block uppercase font-bold">Quantity Available</span>
                  <span className="text-sm font-semibold mt-0.5 block text-primary">{eq.amount ?? 'N/A'}</span>
                </div>

                <div className="bg-blue-50/70 border border-blue-200 p-3.5 rounded-xl flex items-center justify-between col-span-2 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 text-primary rounded-lg">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <div>
                      <span className="text-[10px] text-primary/80 uppercase font-bold block tracking-wider">User & Technical Manual</span>
                      <span className="text-xs font-bold text-slate-800 block mt-0.5">
                        {eq.manual ? "Official Operating Documentation" : "Manual Link Placeholder"}
                      </span>
                    </div>
                  </div>
                  {eq.manual ? (
                    <a
                      href={eq.manual}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-primary hover:bg-primary-light text-white text-xs font-bold py-2 px-3.5 rounded-lg transition inline-flex items-center gap-1.5 shadow-sm hover:shadow"
                    >
                      <span>Open Manual</span>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  ) : (
                    <span className="text-xs text-slate-400 font-medium italic border border-slate-200 bg-white px-3 py-1.5 rounded-lg">
                      Manual Placeholder
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Description</span>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  {eq.description || 'No operational description provided.'}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-4 border-t">
              {eq.status === 'Available' ? (
                <button
                  onClick={() => setSelectedEquipment(eq)}
                  className="flex-1 bg-primary hover:bg-primary-light text-white font-bold py-3 px-6 rounded-xl text-sm tracking-wider transition shadow-sm hover:shadow active:scale-95 text-center"
                >
                  Book Now
                </button>
              ) : (
                <button
                  disabled
                  className="flex-1 bg-surface-dim text-on-surface-variant/60 border border-outline-variant/30 font-bold py-3 px-6 rounded-xl text-sm tracking-wider cursor-not-allowed text-center"
                >
                  Unavailable
                </button>
              )}

              <button
                onClick={() => handleJoinWaitlist(eq)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-3 px-6 rounded-xl text-sm tracking-wider transition border text-center"
              >
                Join Waitlist
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderWaitlistTab = () => {
    return (
      <div className="space-y-6 animate-fadeIn">
        <div>
          <h2 className="text-4xl font-bold text-primary font-serif">Waitlist Queue</h2>
          <p className="text-sm text-on-surface-variant mt-1">Trace statuses of your queued lab assets.</p>
        </div>

        {loadingWaitlists ? (
          <div className="bg-white border border-outline-variant/30 rounded-xl p-6 space-y-4">
            <Skeleton height={28} width="30%" />
            <Skeleton count={4} height={52} borderRadius={8} />
          </div>
        ) : waitlists.length === 0 ? (
          <div className="bg-white border border-outline-variant/30 rounded-xl p-10 text-center space-y-4">
            <svg className="w-12 h-12 text-outline mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7"></path>
            </svg>
            <p className="text-sm text-on-surface-variant font-semibold">Your waitlist queue is currently empty.</p>
          </div>
        ) : (
          <div className="bg-white border border-outline-variant/30 rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-low border-b border-outline-variant/30 text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                    <th className="py-4 px-6">Equipment</th>
                    <th className="py-4 px-6">Lab Location</th>
                    <th className="py-4 px-6">Queue Position</th>
                    <th className="py-4 px-6">Time Window Requested</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20 text-sm">
                  {waitlists.map((w) => {
                    const idVal = w.waitlistId || w.id;
                    return (
                      <tr key={idVal} className="hover:bg-surface-low/50 transition">
                        <td className="py-4 px-6">
                          <span className="font-semibold block text-primary">{w.equipmentName}</span>
                          <span className="text-xs text-on-surface-variant font-mono">Asset ID: {w.equipmentId}</span>
                        </td>
                        <td className="py-4 px-6 font-semibold">{w.labName || "Unknown Lab"}</td>
                        <td className="py-4 px-6 font-bold text-[#00a2c0]">
                          {w.status === "Waiting" && w.queuePosition != null ? `Position #${w.queuePosition}` : "—"}
                        </td>
                        <td className="py-4 px-6 text-xs text-on-surface-variant font-semibold">
                          <div>Start: {new Date(w.requestedStart).toLocaleString()}</div>
                          <div className="mt-0.5">End: {new Date(w.requestedEnd).toLocaleString()}</div>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`px-2.5 py-1 text-[10px] font-mono border rounded-full uppercase font-bold tracking-wider ${
                            w.status === "Fulfilled"
                              ? "bg-green-50 text-green-700 border-green-200"
                              : w.status === "Notified"
                                ? "bg-amber-100 text-amber-700 border-amber-300 animate-pulse"
                                : w.status === "Waiting"
                                  ? "bg-blue-50 text-blue-700 border-blue-200"
                                  : "bg-slate-50 text-slate-500 border-slate-200"
                          }`}>
                            {w.status}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          {(w.status === "Waiting" || w.status === "Notified") ? (
                            <button
                              onClick={() => handleCancelWaitlist(idVal)}
                              className="text-rose-600 hover:text-rose-700 hover:underline font-bold text-xs py-1.5 px-3 transition"
                            >
                              Cancel Queue
                            </button>
                          ) : (
                            <span className="text-xs text-on-surface-variant/60 font-bold">Closed</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-surface-bg text-on-surface flex flex-col font-sans relative">
      {/* Toast Notifications */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-primary text-white px-5 py-3.5 rounded-lg shadow-xl flex items-center gap-3 border border-primary-light animate-bounce">
          <svg
            className="w-5 h-5 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-outline-variant/30 bg-white/80 backdrop-blur-md px-6 py-4 flex flex-col justify-between md:flex-row justify-between items-center gap-2">
        <div className="flex items-center w-min">
          <div>
            <div className="flex items-center">
              <img className="w-[25%] mr-5" src={microscope} alt="logo" />
              <h1 className="text-2xl font-bold text-primary logo-font leading-none tracking-tight">
                LabMaintain
              </h1>
            </div>

            
          </div>
        </div>

        <div className="w-full max-w-sm relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <svg
              className="w-5 h-5 text-outline"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              ></path>
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search equipment category, name, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface-container-low border border-outline-variant rounded-full pl-11 pr-4 py-2 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
          />
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-sm uppercase">
              {user && user.email ? user.email[0].toUpperCase() : "S"}
            </div>
            <div className="text-left hidden md:block">
              <span className="text-xs font-bold block text-on-surface leading-tight">
                {user?.name || "Student"}
              </span>
              <span className="text-[10px] text-on-surface-variant block uppercase font-bold">
                Researcher / Student
              </span>
            </div>
            <button
              onClick={onLogout}
              className="text-xs font-bold text-rose-600  transition border px-2 py-2 shadow-sm rounded-xl  bg-gray-100 hover:text-rose-700 hover:shadow-md"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 max-w-[1440px] mx-auto w-full mb-20">
        {activeTab === "home" && (
          <div className="space-y-8 animate-fadeIn">
            {viewedEquipment ? (
              renderEquipmentDetailView(viewedEquipment)
            ) : (
              <>
                {/* Active Waitlist Notifications Banner */}
                {activeNotifications.map((notif) => {
                  const notifiedTime = new Date(notif.notifiedAt).getTime();
                  const expireTime = notifiedTime + 10 * 60 * 1000;
                  const timeLeftMs = expireTime - Date.now();
                  const timeLeftMins = Math.max(0, Math.ceil(timeLeftMs / 1000 / 60));

                  return (
                    <div key={notif.waitlistId} className="bg-gradient-to-r from-amber-50 to-amber-100/60 border border-amber-300 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fadeIn">
                      <div className="flex items-start gap-3.5">
                        <span className="text-2xl mt-0.5">📢</span>
                        <div className="text-left">
                          <h4 className="text-sm font-black text-amber-900 font-serif">Equipment Available & Reserved!</h4>
                          <p className="text-xs text-amber-800 font-semibold mt-1">
                            Your waitlisted item <strong className="text-primary">{notif.equipmentName}</strong> (Lab: {notif.labName}) is now available.
                            You have a priority booking window that expires in <span className="underline font-bold">{timeLeftMins} mins</span>.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 self-end md:self-auto flex-shrink-0">
                        <button
                          onClick={() => handleQuickBook(notif)}
                          className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold py-2 px-4 rounded-xl shadow-sm transition active:scale-95 flex items-center gap-1.5"
                        >
                          <span>⚡</span> Quick Book
                        </button>
                        <button
                          onClick={() => handleCancelWaitlist(notif.waitlistId)}
                          className="bg-transparent hover:bg-amber-100 text-amber-800 text-xs font-bold py-2 px-4 rounded-xl border border-amber-300 transition active:scale-95"
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  );
                })}

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h2 className="text-4xl font-bold text-primary font-serif">
                      Available Lab Assets
                    </h2>
                    <p className="text-sm text-on-surface-variant mt-1.5">
                      Select and book high-precision equipment for your project
                      work.
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 bg-white border border-outline-variant px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm">
                      <span className="text-outline">Filter:</span>
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="focus:outline-none bg-transparent cursor-pointer font-semibold text-primary"
                      >
                        <option value="All">All Statuses</option>
                        <option value="Operational">Operational</option>
                        <option value="Calibration Required">
                          Calibration Required
                        </option>
                        <option value="Maintenance Due">Maintenance Due</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-1.5 bg-white border border-outline-variant px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm">
                      <span className="text-outline">Sort:</span>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="focus:outline-none bg-transparent cursor-pointer font-semibold text-primary"
                      >
                        <option value="name">Name</option>
                        <option value="status">Status</option>
                        <option value="cost">Cost</option>
                      </select>
                    </div>
                  </div>
                </div>

                {loadingEquipments ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((idx) => (
                      <div key={idx} className="bg-white border border-outline-variant/30 rounded-xl overflow-hidden shadow-sm flex flex-col h-[480px] p-5 space-y-4">
                        <Skeleton height={176} borderRadius={12} />
                        <div className="space-y-2">
                          <Skeleton height={24} width="70%" />
                          <Skeleton height={16} width="40%" />
                          <Skeleton count={2} height={14} />
                        </div>
                        <div className="mt-auto space-y-3 pt-4 border-t border-outline-variant/20">
                          <Skeleton height={16} width="90%" />
                          <div className="flex gap-2">
                            <Skeleton height={42} containerClassName="flex-1" borderRadius={12} />
                            <Skeleton height={42} containerClassName="flex-1" borderRadius={12} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredEquipments.map((eq) => (
                    <div
                      key={eq.id}
                      onClick={(e) => handleCardClick(e, eq)}
                      className="bg-white border border-outline-variant/30 rounded-xl overflow-hidden shadow-sm hover:shadow-md hover:border-primary/20 transition flex flex-col h-[480px] cursor-pointer"
                    >
                      <div className="h-44 relative overflow-hidden bg-surface-container-low">
                        <img
                          src={eq.imageUrl}
                          alt={eq.name}
                          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                        />
                        <div className="absolute top-3 left-3">
                          <span
                            className={`px-3 py-1 text-[10px] uppercase font-bold tracking-wider rounded-full border shadow-sm ${getStatusBadgeStyle(eq.status)}`}
                          >
                            {eq.status}
                          </span>
                        </div>
                      </div>

                      <div className="p-5 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start gap-2">
                            <h3 className="text-lg font-bold text-on-surface font-serif leading-snug line-clamp-1">
                              {eq.name}
                            </h3>
                            <span className="bg-surface-container-low text-on-surface-variant text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-outline-variant/40 whitespace-nowrap">
                              ID: {eq.id}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-primary-container bg-primary-container/10 px-2 py-0.5 rounded">
                              {eq.category}
                            </span>
                            <span className="text-[10px] text-slate-500 font-bold">
                              Mfg: {eq.manufacturer || "Zeiss Instruments"}
                            </span>
                            {eq.manual ? (
                              <a
                                href={eq.manual}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="text-[10px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2 py-0.5 rounded flex items-center gap-1 transition"
                                title="Open Equipment Manual"
                              >
                                <span>Manual</span>
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                              </a>
                            ) : (
                              <span className="text-[10px] text-slate-400 font-medium italic bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded">
                                Manual Placeholder
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-on-surface-variant line-clamp-2 mt-3 leading-relaxed">
                            {eq.description ||
                              "No operational description provided."}
                          </p>

                          <div className="flex items-center gap-4 text-[11px] text-on-surface-variant mt-4 font-semibold flex-wrap">
                            <div className="flex items-center gap-1">
                              <svg
                                className="w-3.5 h-3.5 text-outline"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2.2"
                                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                ></path>
                              </svg>
                              <span>Maint: {eq.maintenanceDate || "Regular"}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <svg
                                className="w-3.5 h-3.5 text-outline"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2.2"
                                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                ></path>
                              </svg>
                              <span>{eq.location}</span>
                            </div>
                            <div className="flex items-center gap-1 text-[#00a2c0]">
                              <svg
                                className="w-3.5 h-3.5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                strokeWidth="2.5"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                              <span>${eq.cost || "N/A"}/hr</span>
                            </div>
                            <div className="flex items-center gap-1 text-slate-500">
                              <svg
                                className="w-3.5 h-3.5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                strokeWidth="2"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                                />
                              </svg>
                              <span>Qty: {eq.amount ?? "N/A"}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between border-t border-outline-variant/20 pt-4 mt-4">
                          {eq.status === "Available" || eq.status === "Operational" ? (
                            <button
                              onClick={() => setSelectedEquipment(eq)}
                              className="bg-primary hover:bg-primary-light text-white font-bold py-2 px-4 rounded-lg text-xs tracking-wider transition shadow-sm hover:shadow active:scale-95"
                            >
                              Book Now
                            </button>
                          ) : (
                            <button
                              disabled
                              className="bg-surface-dim text-on-surface-variant/60 border border-outline-variant/30 font-bold py-2 px-4 rounded-lg text-xs tracking-wider cursor-not-allowed"
                            >
                              Unavailable
                            </button>
                          )}

                          <button
                            onClick={() => handleJoinWaitlist(eq)}
                            className="text-on-surface-variant hover:text-primary font-bold text-xs tracking-wider py-2 px-3 transition hover:underline"
                          >
                            Join Waitlist
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              </>
            )}
          </div>
        )}

        {/* TAB 2: ACTIVE RESERVATIONS */}
        {activeTab === "booking" && (
          <div className="space-y-6 animate-fadeIn max-w-4xl mx-auto">
            <div>
              <h2 className="text-4xl font-bold text-primary font-serif">
                Your Reservations
              </h2>
              <p className="text-sm text-on-surface-variant mt-1">
                Trace statuses of your lab checkouts and waitlist queue
                rankings.
              </p>
            </div>

            {bookings.length === 0 ? (
              <div className="bg-white border border-outline-variant/30 rounded-xl p-10 text-center space-y-4">
                <svg
                  className="w-12 h-12 text-outline mx-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  ></path>
                </svg>
                <p className="text-sm text-on-surface-variant font-semibold">
                  No active reservations at the moment.
                </p>
              </div>
            ) : (
              <div className="bg-white border border-outline-variant/30 rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-surface-low border-b border-outline-variant/30 text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                        <th className="py-4 px-6">Reservation ID</th>
                        <th className="py-4 px-6">Equipment</th>
                        <th className="py-4 px-6">Time Window</th>
                        <th className="py-4 px-6">Status</th>
                        <th className="py-4 px-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/20 text-sm">
                      {bookings.map((bk) => (
                        <tr
                          key={bk.bookingId || bk.id}
                          className="hover:bg-surface-low/50 transition"
                        >
                          <td className="py-4 px-6 font-mono font-bold text-primary">
                            {bk.bookingId || `BK-${bk.id}`}
                          </td>
                          <td className="py-4 px-6">
                            <span className="font-semibold block text-primary">
                              {bk.equipment?.name || bk.equipmentName || "Unknown Asset"}
                            </span>
                            <span className="text-xs text-on-surface-variant font-mono text-primary">
                              ID: {bk.equipment?.equipmentId || bk.equipmentId || "N/A"}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-xs text-on-surface-variant font-semibold">
                            <div>
                              Start: {new Date(bk.startTime).toLocaleString()}
                            </div>
                            <div className="mt-0.5">
                              End: {new Date(bk.endTime).toLocaleString()}
                            </div>
                          </td>
                          <td className="py-4 px-5">
                            <span
                              className={`px-2.5 py-1 text-[10px] font-mono border rounded-full uppercase font-bold tracking-wider ${
                                bk.status === "Approved" || bk.status === "Confirmed" || bk.status === "Completed" || bk.status === "In Use"
                                  ? "bg-green-50 text-green-700 border-green-200"
                                  : bk.status === "Pending Approval" || bk.status === "Pending Return Approval" || bk.status === "Returned (Pending Approval)"
                                    ? "bg-amber-50 text-amber-700 border-amber-200"
                                    : "bg-slate-50 text-slate-600 border-slate-200"
                              }`}
                            >
                              {bk.status}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-right">
                            {bk.status === "In Use" || bk.status === "Approved" ? (
                              <button
                                onClick={() =>
                                  handleReturnRequest(bk.bookingId || bk.id)
                                }
                                className="bg-secondary/10 hover:bg-secondary text-secondary hover:text-white font-bold py-1.5 px-3 rounded-lg text-xs transition border border-secondary"
                              >
                                Return Asset
                              </button>
                            ) : bk.status === "Pending Approval" ? (
                              <button
                                onClick={() => {
                                  setBookings(
                                    bookings.filter(
                                      (b) =>
                                        (b.bookingId || b.id) !==
                                        (bk.bookingId || bk.id),
                                    ),
                                  );
                                  triggerToast("Booking request cancelled.");
                                }}
                                className="text-rose-600 hover:text-rose-700 hover:underline font-bold text-xs py-1.5 px-3 transition"
                              >
                                Cancel Request
                              </button>
                            ) : (
                              <span className="text-xs text-on-surface-variant font-bold">
                                No Actions
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: ACCOUNT */}
        {activeTab === "account" && (
          <div className="max-w-xl mx-auto space-y-6 animate-fadeIn">
            <div>
              <h2 className="text-4xl font-bold text-primary font-serif">
                Student Profile
              </h2>
              <p className="text-sm text-on-surface-variant mt-1">
                Verified user credentials and access tokens.
              </p>
            </div>

            <div className="bg-white border border-outline-variant/30 rounded-xl p-6 shadow-sm space-y-6">
              <div className="flex items-center gap-4 border-b border-outline-variant/20 pb-6">
                <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-3xl border border-primary/20">
                  {user && user.email ? user.email[0].toUpperCase() : "S"}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-on-surface font-serif">
                    {user?.name || "Student"}
                  </h3>
                  <span className="text-xs text-primary font-bold uppercase tracking-wider font-mono">
                    Researcher / Student
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-sm">
                <div className="bg-surface-low/50 p-4 border border-outline-variant/20 rounded-lg">
                  <span className="text-[10px] text-on-surface-variant block uppercase font-bold tracking-wider">
                    Email Address
                  </span>
                  <span className="font-semibold block mt-1 text-on-surface">
                    {user?.email || "student@institution.edu"}
                  </span>
                </div>
                <div className="bg-surface-low/50 p-4 border border-outline-variant/20 rounded-lg">
                  <span className="text-[10px] text-on-surface-variant block uppercase font-bold tracking-wider">
                    Verification Status
                  </span>
                  <span className="font-bold block mt-1 text-green-700 uppercase tracking-wide">
                    {user?.status || "ACTIVE"}
                  </span>
                </div>
                
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: SETTINGS */}
        {activeTab === "settings" && (
          <div className="max-w-xl mx-auto space-y-6 animate-fadeIn">
            <div>
              <h2 className="text-4xl font-bold text-primary font-serif">
                Portal Settings
              </h2>
              <p className="text-sm text-on-surface-variant mt-1">
                Configure notification preferences and device checkouts.
              </p>
            </div>

            <div className="bg-white border border-outline-variant/30 rounded-xl p-6 shadow-sm space-y-6">
              <div className="space-y-5">
                <div className="flex justify-between items-center border-b border-outline-variant/20 pb-4">
                  <div>
                    <h4 className="text-sm font-bold text-on-surface">
                      Email Notifications
                    </h4>
                    <p className="text-xs text-on-surface-variant mt-0.5">
                      Receive reminders before booking start/end times.
                    </p>
                  </div>
                  <div className="w-12 h-6 bg-primary/20 border border-primary/40 rounded-full p-0.5 cursor-pointer flex justify-end">
                    <div className="w-5 h-5 bg-primary rounded-full shadow-sm"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "waitlist" && renderWaitlistTab()}
      </main>

      {/* Booking Modal */}
      {selectedEquipment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white border border-outline-variant/30 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative animate-scaleIn space-y-6">
            <button
              onClick={() => setSelectedEquipment(null)}
              className="absolute top-4 right-4 text-on-surface-variant hover:text-primary transition"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </button>

            <div>
              <span className="text-[10px] uppercase font-bold text-primary tracking-widest font-sans">
                Equipment Checkout
              </span>
              <h3 className="text-2xl font-bold text-on-surface font-serif mt-1">
                {selectedEquipment.name}
              </h3>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Asset ID: {selectedEquipment.id} &bull; Location:{" "}
                {selectedEquipment.location}
              </p>
            </div>

            <form onSubmit={handleConfirmBooking} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase text-on-surface-variant">
                  Reservation Date
                </label>
                <input
                  type="date"
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="w-full border border-outline rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition font-semibold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase text-on-surface-variant">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={bookingStart}
                    onChange={(e) => setBookingStart(e.target.value)}
                    className="w-full border border-outline rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition font-semibold"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase text-on-surface-variant">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={bookingEnd}
                    onChange={(e) => setBookingEnd(e.target.value)}
                    className="w-full border border-outline rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition font-semibold"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase text-on-surface-variant">
                  Usage Purpose
                </label>
                <textarea
                  placeholder="Explain the project or research scope..."
                  value={bookingPurpose}
                  onChange={(e) => setBookingPurpose(e.target.value)}
                  className="w-full border border-outline rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition font-semibold h-20"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedEquipment(null)}
                  className="text-on-surface-variant hover:text-primary font-bold text-xs tracking-wider py-2 px-4 border border-outline hover:border-primary rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-primary hover:bg-primary-light text-white font-bold py-2.5 px-5 rounded-lg text-xs tracking-wider transition shadow"
                >
                  Confirm Reservation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Waitlist Join Modal */}
      {selectedWaitlistEquipment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white border border-outline-variant/30 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative animate-scaleIn space-y-6">
            <button
              onClick={() => setSelectedWaitlistEquipment(null)}
              className="absolute top-4 right-4 text-on-surface-variant hover:text-primary transition"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>

            <div>
              <span className="text-[10px] uppercase font-bold text-amber-600 tracking-widest font-sans">
                Join Equipment Waitlist Queue
              </span>
              <h3 className="text-2xl font-bold text-on-surface font-serif mt-1">
                {selectedWaitlistEquipment.name}
              </h3>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Location: {selectedWaitlistEquipment.location}
              </p>
            </div>

            <form onSubmit={handleConfirmWaitlist} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase text-on-surface-variant">
                  Requested Start Date
                </label>
                <input
                  type="date"
                  value={waitlistDate}
                  onChange={(e) => setWaitlistDate(e.target.value)}
                  className="w-full border border-outline rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition font-semibold font-sans"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase text-on-surface-variant">
                    Requested Start Time
                  </label>
                  <input
                    type="time"
                    value={waitlistStart}
                    onChange={(e) => setWaitlistStart(e.target.value)}
                    className="w-full border border-outline rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition font-semibold"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase text-on-surface-variant">
                    Requested End Time
                  </label>
                  <input
                    type="time"
                    value={waitlistEnd}
                    onChange={(e) => setWaitlistEnd(e.target.value)}
                    className="w-full border border-outline rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition font-semibold"
                    required
                  />
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-800 font-semibold leading-relaxed animate-pulse">
                ℹ️ You will be placed in a First-In-First-Out (FIFO) queue. When this equipment becomes available, you will have a 10-minute priority window to complete your reservation.
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedWaitlistEquipment(null)}
                  className="text-on-surface-variant hover:text-primary font-bold text-xs tracking-wider py-2 px-4 border border-outline hover:border-primary rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-2.5 px-5 rounded-lg text-xs tracking-wider transition shadow active:scale-95"
                >
                  Join Waitlist Queue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Bottom Navigation bar */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-white/95 border border-outline-variant/50 shadow-2xl rounded-full px-6 py-2 flex items-center justify-around gap-6 md:gap-10 backdrop-blur-md">
        <button
          onClick={() => setActiveTab("home")}
          className={`flex flex-col items-center gap-1 transition-all ${activeTab === "home" ? "text-primary scale-105" : "text-on-surface-variant hover:text-primary"}`}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={activeTab === "home" ? 2.5 : 2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
          <span className="text-[10px] font-bold tracking-wider">Home</span>
        </button>

        <button
          onClick={() => setActiveTab("booking")}
          className={`flex flex-col items-center gap-1 transition-all ${activeTab === "booking" ? "text-primary scale-105" : "text-on-surface-variant hover:text-primary"}`}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={activeTab === "booking" ? 2.5 : 2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8 7V3m8 3V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span className="text-[10px] font-bold tracking-wider">Booking</span>
        </button>


       

        <button
          onClick={() => setActiveTab("account")}
          className={`flex flex-col items-center gap-1 transition-all ${activeTab === "account" ? "text-primary scale-105" : "text-on-surface-variant hover:text-primary"}`}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={activeTab === "account" ? 2.5 : 2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
          <span className="text-[10px] font-bold tracking-wider">Account</span>
        </button>

         <button
          onClick={() => setActiveTab("waitlist")}
          className={`flex flex-col items-center gap-1 transition-all ${activeTab === "waitlist" ? "text-primary scale-105" : "text-on-surface-variant hover:text-primary"}`}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={activeTab === "waitlist" ? 2.5 : 2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h7"
            />
          </svg>
          <span className="text-[10px] font-bold tracking-wider">Waitlist</span>
        </button>

        <button
          onClick={() => setActiveTab("settings")}
          className={`flex flex-col items-center gap-1 transition-all ${activeTab === "settings" ? "text-primary scale-105" : "text-on-surface-variant hover:text-primary"}`}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={activeTab === "settings" ? 2.5 : 2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <span className="text-[10px] font-bold tracking-wider">Settings</span>
        </button>
      </div>
    </div>
  );
}
