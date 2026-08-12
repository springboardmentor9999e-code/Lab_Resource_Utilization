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
import { AuthScreen } from './components/auth/AuthScreen';
import { ChatSpace } from './components/chat/ChatSpace';
import { AddEquipmentModal } from './components/equipment/AddEquipmentModal';
import { Equipment } from './types';
import { Building2, Layers, Cpu, HeartHandshake, MessageSquare, Globe, Calendar, TrendingUp } from 'lucide-react';
import { InterInstitutionHub } from './components/collaboration/InterInstitutionHub';
import { MaintenancePlanner } from './components/maintenance/MaintenancePlanner';
import { AnalyticsDashboard } from './components/admin/AnalyticsDashboard';
import { AccessDenied } from './components/auth/AccessDenied';

function DashboardContent() {
  const { currentRole, isAuthenticated, authLoading } = useApp();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'role_console' | 'catalog' | 'collaboration' | 'planner' | 'analytics' | 'chat'>('role_console');

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
  const [showAddEquipmentModal, setShowAddEquipmentModal] = useState<boolean>(false);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-100">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-xs text-slate-400 font-medium">Restoring encrypted session...</p>
      </div>
    );
  }

  if (!isAuthenticated || !currentRole) {
    return <AuthScreen />;
  }

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
        
        {/* Console View Mode Switcher (Role Console vs Full Catalog vs Chat Room) */}
        <div className="mb-8 bg-slate-900/60 border border-slate-800/80 backdrop-blur-md rounded-2xl p-1.5 flex flex-wrap items-center gap-1 shadow-lg shadow-slate-950/20">
          <button
            onClick={() => setActiveTab('role_console')}
            className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider flex items-center gap-2 rounded-xl transition-all duration-200 cursor-pointer ${
              activeTab === 'role_console'
                ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md shadow-indigo-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Layers className="w-4 h-4 shrink-0" />
            <span>Role Workspace ({currentRole.toUpperCase().replace('_', ' ')})</span>
          </button>

          <button
            onClick={() => setActiveTab('catalog')}
            className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider flex items-center gap-2 rounded-xl transition-all duration-200 cursor-pointer ${
              activeTab === 'catalog'
                ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md shadow-indigo-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Cpu className="w-4 h-4 shrink-0" />
            <span>Full Catalog</span>
          </button>

          {['admin', 'hod', 'lab_technician', 'staff', 'student', 'maintenance'].includes(currentRole || '') && (
            <button
              onClick={() => setActiveTab('collaboration')}
              className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider flex items-center gap-2 rounded-xl transition-all duration-200 cursor-pointer ${
                activeTab === 'collaboration'
                  ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md shadow-indigo-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Globe className="w-4 h-4 shrink-0" />
              <span>Inter-Institution Hub</span>
            </button>
          )}

          {['admin', 'lab_technician', 'maintenance'].includes(currentRole || '') && (
            <button
              onClick={() => setActiveTab('planner')}
              className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider flex items-center gap-2 rounded-xl transition-all duration-200 cursor-pointer ${
                activeTab === 'planner'
                  ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md shadow-indigo-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Calendar className="w-4 h-4 shrink-0" />
              <span>Maintenance Planner</span>
            </button>
          )}

          {['admin', 'hod'].includes(currentRole || '') && (
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider flex items-center gap-2 rounded-xl transition-all duration-200 cursor-pointer ${
                activeTab === 'analytics'
                  ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md shadow-indigo-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <TrendingUp className="w-4 h-4 shrink-0" />
              <span>Analytics Dashboard</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('chat')}
            className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider flex items-center gap-2 rounded-xl transition-all duration-200 cursor-pointer ${
              activeTab === 'chat'
                ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md shadow-indigo-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <MessageSquare className="w-4 h-4 shrink-0" />
            <span>Chat Space</span>
          </button>
        </div>

        {/* Active Workspace View */}
        {(() => {
          // Tab authorization checker helper
          const isTabAllowed = (tab: typeof activeTab, role: typeof currentRole): boolean => {
            if (tab === 'collaboration') return ['admin', 'hod', 'lab_technician', 'staff', 'student', 'maintenance'].includes(role || '');
            if (tab === 'planner') return ['admin', 'lab_technician', 'maintenance'].includes(role || '');
            if (tab === 'analytics') return ['admin', 'hod'].includes(role || '');
            return true;
          };

          if (!isTabAllowed(activeTab, currentRole)) {
            return <AccessDenied onBackToConsole={() => setActiveTab('role_console')} />;
          }

          if (activeTab === 'catalog') {
            return (
              <EquipmentCatalog
                searchQuery={searchQuery}
                onSelectEquipment={handleOpenDetail}
                onOpenBookingModal={handleOpenBooking}
              />
            );
          }
          if (activeTab === 'collaboration') {
            return <InterInstitutionHub />;
          }
          if (activeTab === 'planner') {
            return <MaintenancePlanner onOpenCalibrationModal={() => setShowCalibrationModal(true)} />;
          }
          if (activeTab === 'analytics') {
            return <AnalyticsDashboard />;
          }
          if (activeTab === 'chat') {
            return <ChatSpace />;
          }

          return (
            <div>
              {currentRole === 'admin' && (
                <AdminDashboard 
                  onOpenAddEquipmentModal={() => setShowAddEquipmentModal(true)} 
                />
              )}

              {currentRole === 'hod' && (
                <HodDashboard 
                  onOpenAddEquipmentModal={() => setShowAddEquipmentModal(true)} 
                />
              )}

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
                  onOpenAddEquipmentModal={() => setShowAddEquipmentModal(true)}
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
          );
        })()}

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

      {showAddEquipmentModal && (
        <AddEquipmentModal
          onClose={() => setShowAddEquipmentModal(false)}
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
