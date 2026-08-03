import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User, 
  UserRole, 
  Department, 
  Lab, 
  Equipment, 
  EquipmentStatus,
  EquipmentCondition,
  Booking, 
  BookingStatus,
  MaintenanceTicket, 
  TicketStatus,
  TicketPriority,
  TicketIssueType,
  CalibrationRecord, 
  SafetyChecklist, 
  ActivityLog, 
  NotificationItem 
} from '../types';

import { 
  initialUsers, 
  initialDepartments, 
  initialLabs, 
  initialEquipment, 
  initialBookings, 
  initialTickets, 
  initialCalibrations, 
  initialSafetyChecklists, 
  initialActivityLogs, 
  initialNotifications 
} from '../data/initialData';

interface AppContextType {
  currentUser: User;
  currentRole: UserRole;
  switchUserRole: (role: UserRole) => void;
  users: User[];
  departments: Department[];
  labs: Lab[];
  equipment: Equipment[];
  bookings: Booking[];
  tickets: MaintenanceTicket[];
  calibrations: CalibrationRecord[];
  safetyChecklists: SafetyChecklist[];
  activityLogs: ActivityLog[];
  notifications: NotificationItem[];
  
  // Actions
  addBooking: (bookingData: Omit<Booking, 'id' | 'createdAt' | 'status'>) => void;
  assignSlot: (bookingId: string, startTime: string, endTime: string, technicianName: string) => void;
  rejectBooking: (bookingId: string, reason: string) => void;
  updateEquipmentStatus: (equipmentId: string, status: EquipmentStatus, condition?: EquipmentCondition) => void;
  raiseMaintenanceTicket: (ticketData: Omit<MaintenanceTicket, 'id' | 'ticketNumber' | 'createdAt' | 'status'>) => void;
  updateTicketStatus: (ticketId: string, status: TicketStatus, resolutionNotes?: string, repairCost?: number) => void;
  recordCalibration: (calData: Omit<CalibrationRecord, 'id'>) => void;
  submitSafetyCheck: (checkData: Omit<SafetyChecklist, 'id'>) => void;
  markNotificationRead: (id: string) => void;
  clearAllNotifications: () => void;
  askAiAdvisor: (prompt: string, context?: any) => Promise<string>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users] = useState<User[]>(initialUsers);
  const [currentRole, setCurrentRole] = useState<UserRole>('admin');
  const [currentUser, setCurrentUser] = useState<User>(
    initialUsers.find(u => u.role === 'admin') || initialUsers[0]
  );

  const [departments] = useState<Department[]>(initialDepartments);
  const [labs, setLabs] = useState<Lab[]>(initialLabs);
  const [equipment, setEquipment] = useState<Equipment[]>(initialEquipment);
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [tickets, setTickets] = useState<MaintenanceTicket[]>(initialTickets);
  const [calibrations, setCalibrations] = useState<CalibrationRecord[]>(initialCalibrations);
  const [safetyChecklists, setSafetyChecklists] = useState<SafetyChecklist[]>(initialSafetyChecklists);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(initialActivityLogs);
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);

  const switchUserRole = (role: UserRole) => {
    setCurrentRole(role);
    const matchedUser = users.find(u => u.role === role) || users[0];
    setCurrentUser(matchedUser);

    addActivityLog(
      matchedUser.id,
      matchedUser.name,
      role,
      matchedUser.departmentId,
      matchedUser.departmentName,
      `Switched Active Session View to ${role.toUpperCase()}`,
      'System',
      `User navigated to ${role} role console.`
    );
  };

  const addActivityLog = (
    userId: string,
    userName: string,
    userRole: UserRole,
    departmentId: string,
    departmentName: string,
    action: string,
    category: ActivityLog['category'],
    details: string
  ) => {
    const newLog: ActivityLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId,
      userName,
      userRole,
      departmentId,
      departmentName,
      action,
      category,
      details,
    };
    setActivityLogs(prev => [newLog, ...prev]);
  };

  const addNotification = (
    title: string,
    message: string,
    type: NotificationItem['type'],
    targetRole?: UserRole,
    targetUserId?: string
  ) => {
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      timestamp: new Date().toISOString(),
      targetRole,
      targetUserId,
      title,
      message,
      type,
      read: false,
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  // Add Booking Request
  const addBooking = (bookingData: Omit<Booking, 'id' | 'createdAt' | 'status'>) => {
    const newBooking: Booking = {
      ...bookingData,
      id: `bk-${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: 'Pending Approval',
    };

    setBookings(prev => [newBooking, ...prev]);

    addActivityLog(
      currentUser.id,
      currentUser.name,
      currentUser.role,
      currentUser.departmentId,
      currentUser.departmentName,
      'Requested Equipment Slot Booking',
      'Booking',
      `Requested slot for ${bookingData.equipmentName} on ${bookingData.bookingDate} (${bookingData.requestedStartTime} - ${bookingData.requestedEndTime})`
    );

    addNotification(
      'New Slot Request',
      `${currentUser.name} requested slot for ${bookingData.equipmentName}`,
      'booking',
      'lab_technician'
    );
  };

  // Assign Slot & Confirm
  const assignSlot = (bookingId: string, startTime: string, endTime: string, technicianName: string) => {
    setBookings(prev =>
      prev.map(b => {
        if (b.id === bookingId) {
          const updated = {
            ...b,
            allocatedStartTime: startTime,
            allocatedEndTime: endTime,
            status: 'Assigned Slot' as BookingStatus,
            allocatedByTechnicianName: technicianName,
          };

          addActivityLog(
            currentUser.id,
            currentUser.name,
            currentUser.role,
            currentUser.departmentId,
            currentUser.departmentName,
            'Allocated Lab Slot & Confirmed Booking',
            'Booking',
            `Assigned slot ${startTime} - ${endTime} for ${b.userName} on ${b.equipmentName}`
          );

          addNotification(
            'Lab Slot Allocated',
            `Your slot for ${b.equipmentName} has been scheduled (${startTime} - ${endTime}) by ${technicianName}`,
            'schedule',
            undefined,
            b.userId
          );

          return updated;
        }
        return b;
      })
    );
  };

  // Reject Booking
  const rejectBooking = (bookingId: string, reason: string) => {
    setBookings(prev =>
      prev.map(b => {
        if (b.id === bookingId) {
          addActivityLog(
            currentUser.id,
            currentUser.name,
            currentUser.role,
            currentUser.departmentId,
            currentUser.departmentName,
            'Rejected Equipment Booking',
            'Booking',
            `Booking for ${b.equipmentName} rejected. Reason: ${reason}`
          );

          addNotification(
            'Booking Request Declined',
            `Your request for ${b.equipmentName} was declined: ${reason}`,
            'booking',
            undefined,
            b.userId
          );

          return {
            ...b,
            status: 'Rejected' as BookingStatus,
            rejectionReason: reason,
          };
        }
        return b;
      })
    );
  };

  // Update Equipment Status
  const updateEquipmentStatus = (equipmentId: string, status: EquipmentStatus, condition?: EquipmentCondition) => {
    setEquipment(prev =>
      prev.map(eq => {
        if (eq.id === equipmentId) {
          const updated = {
            ...eq,
            status,
            ...(condition ? { condition } : {}),
          };

          addActivityLog(
            currentUser.id,
            currentUser.name,
            currentUser.role,
            currentUser.departmentId,
            currentUser.departmentName,
            `Updated Equipment Status to ${status}`,
            'Equipment',
            `${eq.name} status updated to ${status}`
          );

          return updated;
        }
        return eq;
      })
    );
  };

  // Raise Maintenance Ticket
  const raiseMaintenanceTicket = (ticketData: Omit<MaintenanceTicket, 'id' | 'ticketNumber' | 'createdAt' | 'status'>) => {
    const tktCount = tickets.length + 100;
    const newTicket: MaintenanceTicket = {
      ...ticketData,
      id: `tkt-${Date.now()}`,
      ticketNumber: `TKT-2026-${String(tktCount).padStart(4, '0')}`,
      createdAt: new Date().toISOString(),
      status: 'Open',
    };

    setTickets(prev => [newTicket, ...prev]);

    // Automatically set equipment status to 'Under Maintenance'
    updateEquipmentStatus(ticketData.equipmentId, 'Under Maintenance', 'Faulty');

    addActivityLog(
      currentUser.id,
      currentUser.name,
      currentUser.role,
      currentUser.departmentId,
      currentUser.departmentName,
      'Raised Maintenance Ticket',
      'Maintenance',
      `Ticket ${newTicket.ticketNumber} created for ${ticketData.equipmentName} (${ticketData.priority} Priority).`
    );

    addNotification(
      'New Maintenance Ticket',
      `Ticket ${newTicket.ticketNumber} raised for ${ticketData.equipmentName}`,
      'maintenance',
      'maintenance'
    );
  };

  // Update Ticket Status
  const updateTicketStatus = (ticketId: string, status: TicketStatus, resolutionNotes?: string, repairCost?: number) => {
    setTickets(prev =>
      prev.map(t => {
        if (t.id === ticketId) {
          const isResolved = status === 'Resolved' || status === 'Closed';
          const updated: MaintenanceTicket = {
            ...t,
            status,
            ...(resolutionNotes ? { resolutionNotes } : {}),
            ...(repairCost ? { repairCost } : {}),
            ...(isResolved ? { resolvedAt: new Date().toISOString() } : {}),
          };

          if (isResolved) {
            // Restore equipment to Available & Good condition
            updateEquipmentStatus(t.equipmentId, 'Available', 'Good');
          }

          addActivityLog(
            currentUser.id,
            currentUser.name,
            currentUser.role,
            currentUser.departmentId,
            currentUser.departmentName,
            `Updated Maintenance Ticket Status to ${status}`,
            'Maintenance',
            `Ticket ${t.ticketNumber} updated to ${status}.`
          );

          addNotification(
            'Ticket Status Update',
            `Maintenance ticket ${t.ticketNumber} for ${t.equipmentName} is now ${status}.`,
            'maintenance'
          );

          return updated;
        }
        return t;
      })
    );
  };

  // Record Calibration
  const recordCalibration = (calData: Omit<CalibrationRecord, 'id'>) => {
    const newRecord: CalibrationRecord = {
      ...calData,
      id: `cal-${Date.now()}`,
    };

    setCalibrations(prev => [newRecord, ...prev]);

    // Update equipment calibration dates
    setEquipment(prev =>
      prev.map(eq => {
        if (eq.id === calData.equipmentId) {
          return {
            ...eq,
            lastCalibrationDate: calData.calibrationDate,
            nextCalibrationDueDate: calData.nextDueDate,
            calibrationCertificateNo: calData.certificateNumber,
            condition: calData.result === 'Passed' ? 'Excellent' : 'Good',
            status: eq.status === 'Under Maintenance' ? 'Available' : eq.status,
          };
        }
        return eq;
      })
    );

    addActivityLog(
      currentUser.id,
      currentUser.name,
      currentUser.role,
      currentUser.departmentId,
      currentUser.departmentName,
      'Recorded Equipment Calibration',
      'Calibration',
      `Calibrated ${calData.equipmentName}. Result: ${calData.result}. Next Due: ${calData.nextDueDate}`
    );
  };

  // Submit Safety Check
  const submitSafetyCheck = (checkData: Omit<SafetyChecklist, 'id'>) => {
    const newCheck: SafetyChecklist = {
      ...checkData,
      id: `safe-${Date.now()}`,
    };

    setSafetyChecklists(prev => [newCheck, ...prev]);

    // Update lab safety score
    const totalPassed = [
      checkData.fireExtinguisherChecked,
      checkData.firstAidKitStocked,
      checkData.emergencyStopFunctional,
      checkData.ppeAvailable,
      checkData.ventilationOK,
      checkData.hazardousWasteDisposed,
    ].filter(Boolean).length;

    const score = Math.round((totalPassed / 6) * 100);

    setLabs(prev =>
      prev.map(l => {
        if (l.id === checkData.labId) {
          return {
            ...l,
            safetyScore: score,
            lastSafetyAuditDate: checkData.date,
            condition: score > 90 ? 'Operational' : score > 75 ? 'Degraded' : 'Under Maintenance',
          };
        }
        return l;
      })
    );

    addActivityLog(
      currentUser.id,
      currentUser.name,
      currentUser.role,
      currentUser.departmentId,
      currentUser.departmentName,
      'Submitted Lab Safety Inspection',
      'System',
      `Safety audit submitted for ${checkData.labName}. Safety Score: ${score}%`
    );
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // Call Server-Side Gemini API
  const askAiAdvisor = async (prompt: string, context?: any): Promise<string> => {
    try {
      const res = await fetch('/api/ai/advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, context }),
      });
      const data = await res.json();
      if (data.error) {
        throw new Error(data.error);
      }
      return data.reply;
    } catch (err: any) {
      console.error('AI Advisor call failed:', err);
      return `AI Advisor offline or failed: ${err.message || 'Unknown error'}`;
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        currentRole,
        switchUserRole,
        users,
        departments,
        labs,
        equipment,
        bookings,
        tickets,
        calibrations,
        safetyChecklists,
        activityLogs,
        notifications,
        addBooking,
        assignSlot,
        rejectBooking,
        updateEquipmentStatus,
        raiseMaintenanceTicket,
        updateTicketStatus,
        recordCalibration,
        submitSafetyCheck,
        markNotificationRead,
        clearAllNotifications,
        askAiAdvisor,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
