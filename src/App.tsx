import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { RoleHeaderBanner } from './components/RoleHeaderBanner';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { HodDashboard } from './components/hod/HodDashboard';
import { StaffDashboard } from './components/staff/StaffDashboard';
import { TechnicianDashboard } from './components/technician/TechnicianDashboard';
import { StudentDashboard } from './components/student/StudentDashboard';
import { MaintenanceDashboard } from './components/maintenance/MaintenanceDashboard';
import { EquipmentCatalog } from './components/equipment/EquipmentCatalog';
import { EquipmentDetailModal } from './components/equipment/EquipmentDetailModal';
import { BookingModal } from './components/booking/BookingModal';
import { RaiseTicketModal } from './components/maintenance/RaiseTicketModal';
import { CalibrationModal } from './components/technician/CalibrationModal';
import { SafetyCheckModal } from './components/technician/SafetyCheckModal';
import { AiLabAssistantModal } from './components/ai/AiLabAssistantModal';
import { Equipment } from './types';
import { Building2, Layers, Cpu, HeartHandshake } from 'lucide-react';

function DashboardContent() {
  const { currentRole } = useApp();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'role_console' | 'catalog'>('role_console');

  // Modals state
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [showDetailModal, setShowDetailModal] = useState<boolean>(false);
  const [showBookingModal, setShowBookingModal] = useState<boolean>(false);
  const [bookingEquipment, setBookingEquipment] = useState<Equipment | null>(null);
  const [showTicketModal, setShowTicketModal] = useState<boolean>(false);
  const [ticketEquipment, setTicketEquipment] = useState<Equipment | null>(null);
  const [showCalibrationModal, setShowCalibrationModal] = useState<boolean>(false);
  const [showSafetyCheckModal, setShowSafetyCheckModal] = useState<boolean>(false);
  const [showAiModal, setShowAiModal] = useState<boolean>(false);

  const handleOpenDetail = (eq: Equipment) => {
    setSelectedEquipment(eq);
    setShowDetailModal(true);
  };

  const handleOpenBooking = (eq?: Equipment) => {
    if (eq) setBookingEquipment(eq);
    else setBookingEquipment(null);
    setShowBookingModal(true);
  };

  const handleOpenTicket = (eq?: Equipment) => {
    if (eq) setTicketEquipment(eq);
    else setTicketEquipment(null);
    setShowTicketModal(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-indigo-500 selection:text-white pb-12">
      
      {/* Top Navigation */}
      <Navbar
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q);
          if (q.trim()) setActiveTab('catalog');
        }}
        onOpenAiModal={() => setShowAiModal(true)}
        onOpenBookingModal={() => handleOpenBooking()}
        onOpenTicketModal={() => handleOpenTicket()}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        
        {/* Role Explanation Banner */}
        <RoleHeaderBanner />

        {/* Console View Mode Switcher (Role Console vs Full Catalog) */}
        <div className="mb-6 border-b border-slate-800 flex items-center gap-4">
          <button
            onClick={() => setActiveTab('role_console')}
            className={`pb-3 text-xs font-bold uppercase tracking-wider border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'role_console'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Role Workspace ({currentRole.toUpperCase().replace('_', ' ')})</span>
          </button>

          <button
            onClick={() => setActiveTab('catalog')}
            className={`pb-3 text-xs font-bold uppercase tracking-wider border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'catalog'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>Full University Equipment Catalog</span>
          </button>
        </div>

        {/* Active Workspace View */}
        {activeTab === 'catalog' ? (
          <EquipmentCatalog
            searchQuery={searchQuery}
            onSelectEquipment={handleOpenDetail}
            onOpenBookingModal={handleOpenBooking}
          />
        ) : (
          <div>
            {currentRole === 'admin' && <AdminDashboard />}

            {currentRole === 'hod' && <HodDashboard />}

            {currentRole === 'staff' && (
              <StaffDashboard
                onOpenBookingModal={() => handleOpenBooking()}
                onOpenTicketModal={() => handleOpenTicket()}
              />
            )}

            {currentRole === 'lab_technician' && (
              <TechnicianDashboard
                onOpenCalibrationModal={() => setShowCalibrationModal(true)}
                onOpenSafetyCheckModal={() => setShowSafetyCheckModal(true)}
                onOpenTicketModal={() => handleOpenTicket()}
              />
            )}

            {currentRole === 'student' && (
              <StudentDashboard
                onOpenBookingModal={() => handleOpenBooking()}
              />
            )}

            {currentRole === 'maintenance' && (
              <MaintenanceDashboard
                onOpenTicketModal={() => handleOpenTicket()}
              />
            )}
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-slate-800/80 pt-6 pb-8 text-center text-xs text-slate-500 max-w-7xl mx-auto px-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-indigo-400" />
            <span className="font-semibold text-slate-300">University Lab Resource Utilization Platform</span>
          </div>
          <p>
            ISO/IEC 17025 Compliant Calibration Tracking & Inter-Department Resource Sharing
          </p>
        </div>
      </footer>

      {/* Modals */}
      {showDetailModal && (
        <EquipmentDetailModal
          equipment={selectedEquipment}
          onClose={() => setShowDetailModal(false)}
          onBook={handleOpenBooking}
          onRaiseTicket={handleOpenTicket}
        />
      )}

      {showBookingModal && (
        <BookingModal
          initialEquipment={bookingEquipment}
          onClose={() => setShowBookingModal(false)}
        />
      )}

      {showTicketModal && (
        <RaiseTicketModal
          initialEquipment={ticketEquipment}
          onClose={() => setShowTicketModal(false)}
        />
      )}

      {showCalibrationModal && (
        <CalibrationModal
          onClose={() => setShowCalibrationModal(false)}
        />
      )}

      {showSafetyCheckModal && (
        <SafetyCheckModal
          onClose={() => setShowSafetyCheckModal(false)}
        />
      )}

      {showAiModal && (
        <AiLabAssistantModal
          onClose={() => setShowAiModal(false)}
        />
      )}

    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <DashboardContent />
    </AppProvider>
  );
}
