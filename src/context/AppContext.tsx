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
  NotificationItem,
  MaintenanceSchedule
} from '../types';

import { 
  initialDepartments
} from '../data/initialData';

interface AppContextType {
  currentUser: User | null;
  realUser: User | null;
  currentRole: UserRole | null;
  isAuthenticated: boolean;
  token: string | null;
  authLoading: boolean;
  authError: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (userData: any) => Promise<boolean>;
  logout: () => void;
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
  schedules: MaintenanceSchedule[];
  
  // Actions
  addEquipment: (eqData: Omit<Equipment, 'id' | 'status' | 'condition' | 'lastCalibrationDate' | 'nextCalibrationDueDate' | 'calibrationCertificateNo'>) => void;
  updateEquipment: (id: string, eqData: Equipment) => Promise<void>;
  deleteEquipment: (id: string) => Promise<void>;
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
  scheduleMaintenance: (sData: Omit<MaintenanceSchedule, 'id' | 'status'>) => Promise<void>;
  updateScheduleStatus: (id: string, status: MaintenanceSchedule['status']) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [token, setToken] = useState<string | null>(localStorage.getItem('labsync_token'));
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [realUser, setRealUser] = useState<User | null>(null);
  const [currentRole, setCurrentRole] = useState<UserRole | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const [departments] = useState<Department[]>(initialDepartments);
  const [labs, setLabs] = useState<Lab[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [tickets, setTickets] = useState<MaintenanceTicket[]>([]);
  const [calibrations, setCalibrations] = useState<CalibrationRecord[]>([]);
  const [safetyChecklists, setSafetyChecklists] = useState<SafetyChecklist[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [schedules, setSchedules] = useState<MaintenanceSchedule[]>([]);

  // Fetch all database records for this session
  const fetchInitialData = async (authToken: string) => {
    try {
      const headers = { 'Authorization': `Bearer ${authToken}` };
      const [
        usersRes,
        labsRes,
        eqRes,
        bookingsRes,
        ticketsRes,
        calRes,
        safetyRes,
        logsRes,
        notifRes,
        schedulesRes
      ] = await Promise.all([
        fetch('/api/users', { headers }),
        fetch('/api/labs', { headers }),
        fetch('/api/equipment', { headers }),
        fetch('/api/bookings', { headers }),
        fetch('/api/tickets', { headers }),
        fetch('/api/calibrations', { headers }),
        fetch('/api/safety', { headers }),
        fetch('/api/logs', { headers }),
        fetch('/api/notifications', { headers }),
        fetch('/api/schedules', { headers })
      ]);

      if (usersRes.ok) {
        const d = await usersRes.json();
        if (d.users) setUsers(d.users);
      }
      if (labsRes.ok) {
        const d = await labsRes.json();
        if (d.labs) setLabs(d.labs);
      }
      if (eqRes.ok) {
        const d = await eqRes.json();
        if (d.equipment) setEquipment(d.equipment);
      }
      if (bookingsRes.ok) {
        const d = await bookingsRes.json();
        if (d.bookings) setBookings(d.bookings);
      }
      if (ticketsRes.ok) {
        const d = await ticketsRes.json();
        if (d.tickets) setTickets(d.tickets);
      }
      if (calRes.ok) {
        const d = await calRes.json();
        if (d.calibrations) setCalibrations(d.calibrations);
      }
      if (safetyRes.ok) {
        const d = await safetyRes.json();
        if (d.checklists) setSafetyChecklists(d.checklists);
      }
      if (logsRes.ok) {
        const d = await logsRes.json();
        if (d.logs) setActivityLogs(d.logs);
      }
      if (notifRes.ok) {
        const d = await notifRes.json();
        if (d.notifications) setNotifications(d.notifications);
      }
      if (schedulesRes.ok) {
        const d = await schedulesRes.json();
        if (d.schedules) setSchedules(d.schedules);
      }
    } catch (err) {
      console.error('Failed to retrieve application database records:', err);
    }
  };

  // Restore authenticated session
  useEffect(() => {
    const loadUser = async () => {
      const storedToken = localStorage.getItem('labsync_token');
      if (!storedToken) {
        setAuthLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${storedToken}`
          }
        });
        
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            setCurrentUser(data.user);
            setRealUser(data.user);
            setCurrentRole(data.user.role);
            setToken(storedToken);
            await fetchInitialData(storedToken);
          } else {
            localStorage.removeItem('labsync_token');
            setToken(null);
          }
        } else {
          localStorage.removeItem('labsync_token');
          setToken(null);
        }
      } catch (err) {
        console.error('Failed to restore auth session:', err);
      } finally {
        setAuthLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.error) {
        setAuthError(data.error);
        return false;
      }

      localStorage.setItem('labsync_token', data.token);
      setToken(data.token);
      setCurrentUser(data.user);
      setRealUser(data.user);
      setCurrentRole(data.user.role);

      await fetchInitialData(data.token);

      addActivityLogDirectly(
        data.user.id,
        data.user.name,
        data.user.role,
        data.user.departmentId,
        data.user.departmentName,
        'User Logged In',
        'System',
        `${data.user.name} logged in successfully via JWT.`,
        data.token
      );

      return true;
    } catch (err: any) {
      setAuthError(err.message || 'Network error during login.');
      return false;
    } finally {
      setAuthLoading(false);
    }
  };

  const signup = async (userData: any): Promise<boolean> => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      const data = await res.json();
      if (data.error) {
        setAuthError(data.error);
        return false;
      }

      localStorage.setItem('labsync_token', data.token);
      setToken(data.token);
      setCurrentUser(data.user);
      setRealUser(data.user);
      setCurrentRole(data.user.role);

      await fetchInitialData(data.token);

      addActivityLogDirectly(
        data.user.id,
        data.user.name,
        data.user.role,
        data.user.departmentId,
        data.user.departmentName,
        'User Signed Up & Logged In',
        'System',
        `${data.user.name} registered and logged in successfully.`,
        data.token
      );

      return true;
    } catch (err: any) {
      setAuthError(err.message || 'Network error during signup.');
      return false;
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = () => {
    if (currentUser && token) {
      addActivityLogDirectly(
        currentUser.id,
        currentUser.name,
        currentUser.role,
        currentUser.departmentId,
        currentUser.departmentName,
        'User Logged Out',
        'System',
        `${currentUser.name} logged out.`,
        token
      );
    }
    localStorage.removeItem('labsync_token');
    setToken(null);
    setCurrentUser(null);
    setRealUser(null);
    setCurrentRole(null);
    setUsers([]);
    setLabs([]);
    setEquipment([]);
    setBookings([]);
    setTickets([]);
    setCalibrations([]);
    setSafetyChecklists([]);
    setActivityLogs([]);
    setNotifications([]);
    setSchedules([]);
  };

  const switchUserRole = (role: UserRole) => {
    setCurrentRole(role);
    const matchedUser = users.find(u => u.role === role) || users[0];
    if (matchedUser && token) {
      setCurrentUser(matchedUser);

      addActivityLogDirectly(
        matchedUser.id,
        matchedUser.name,
        role,
        matchedUser.departmentId,
        matchedUser.departmentName,
        `Simulated Session View to ${role.toUpperCase()}`,
        'System',
        `Switched local workspace role simulation to ${role}.`,
        token
      );
    }
  };

  // Helper function to insert activity logs directly to API
  const addActivityLogDirectly = async (
    userId: string,
    userName: string,
    userRole: UserRole,
    departmentId: string,
    departmentName: string,
    action: string,
    category: ActivityLog['category'],
    details: string,
    sessionToken: string
  ) => {
    const loggedUser = users.find(u => u.id === userId) || currentUser;
    const newLog: ActivityLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId,
      userName,
      userRole,
      departmentId,
      departmentName,
      institutionId: loggedUser?.institutionId || 'inst-rit',
      institutionName: loggedUser?.institutionName || 'Rajalakshmi Institute of Technology (RIT), Poonamallee',
      action,
      category,
      details,
    };

    try {
      const res = await fetch('/api/logs', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToken}`
        },
        body: JSON.stringify(newLog)
      });
      if (res.ok) {
        setActivityLogs(prev => [newLog, ...prev]);
      }
    } catch (e) {
      console.error('Failed to log activity:', e);
    }
  };

  // Actions wrapped as REST operations
  const updateEquipment = async (id: string, eqData: Equipment) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/equipment/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(eqData)
      });
      if (res.ok) {
        setEquipment(prev => prev.map(e => e.id === id ? eqData : e));
        if (currentUser) {
          addActivityLogDirectly(
            currentUser.id,
            currentUser.name,
            currentUser.role,
            currentUser.departmentId,
            currentUser.departmentName,
            'Updated Equipment Details',
            'Equipment',
            `Updated equipment ${eqData.name} (${eqData.modelNumber}) in laboratory ${eqData.labName}.`,
            token
          );
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const deleteEquipment = async (id: string) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/equipment/${id}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}` 
        }
      });
      if (res.ok) {
        setEquipment(prev => prev.filter(e => e.id !== id));
        if (currentUser) {
          addActivityLogDirectly(
            currentUser.id,
            currentUser.name,
            currentUser.role,
            currentUser.departmentId,
            currentUser.departmentName,
            'Deleted Equipment Asset',
            'Equipment',
            `Deleted equipment asset ID: ${id}`,
            token
          );
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const addEquipment = async (eqData: Omit<Equipment, 'id' | 'status' | 'condition' | 'lastCalibrationDate' | 'nextCalibrationDueDate' | 'calibrationCertificateNo'>) => {
    if (!token) return;
    const newEq: Equipment = {
      ...eqData,
      id: `eq-${Date.now()}`,
      institutionId: eqData.institutionId || currentUser?.institutionId || 'inst-rit',
      institutionName: eqData.institutionName || currentUser?.institutionName || 'Rajalakshmi Institute of Technology (RIT), Poonamallee',
      status: 'Available',
      condition: 'Excellent',
      lastCalibrationDate: new Date().toISOString().split('T')[0],
      nextCalibrationDueDate: new Date(Date.now() + 180 * 86400000).toISOString().split('T')[0],
      calibrationCertificateNo: `CAL-${Date.now().toString().slice(-6)}`
    };

    try {
      const res = await fetch('/api/equipment', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(newEq)
      });
      if (res.ok) {
        setEquipment(prev => [newEq, ...prev]);
        if (currentUser) {
          addActivityLogDirectly(
            currentUser.id,
            currentUser.name,
            currentUser.role,
            currentUser.departmentId,
            currentUser.departmentName,
            'Registered New Equipment Asset',
            'Equipment',
            `Registered equipment ${newEq.name} (${newEq.modelNumber}) in laboratory ${newEq.labName}.`,
            token
          );
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const addBooking = async (bookingData: Omit<Booking, 'id' | 'createdAt' | 'status'>) => {
    if (!token || !currentUser) return;
    const newBooking: Booking = {
      ...bookingData,
      id: `bk-${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: 'Pending Approval',
    };

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(newBooking)
      });
      if (res.ok) {
        setBookings(prev => [newBooking, ...prev]);

        addActivityLogDirectly(
          currentUser.id,
          currentUser.name,
          currentUser.role,
          currentUser.departmentId,
          currentUser.departmentName,
          'Requested Equipment Slot Booking',
          'Booking',
          `Requested slot for ${bookingData.equipmentName} on ${bookingData.bookingDate} (${bookingData.requestedStartTime} - ${bookingData.requestedEndTime})`,
          token
        );

        // Notify technicians
        const newNotif: NotificationItem = {
          id: `notif-${Date.now()}`,
          timestamp: new Date().toISOString(),
          targetRole: 'lab_technician',
          title: 'New Slot Request',
          message: `${currentUser.name} requested slot for ${bookingData.equipmentName}`,
          type: 'booking',
          read: false,
        };
        await fetch('/api/notifications', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
          },
          body: JSON.stringify(newNotif)
        });
        setNotifications(prev => [newNotif, ...prev]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const assignSlot = async (bookingId: string, startTime: string, endTime: string, technicianName: string) => {
    if (!token || !currentUser) return;
    try {
      const res = await fetch(`/api/bookings/${bookingId}/assign`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ startTime, endTime, technicianName })
      });
      if (res.ok) {
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

              addActivityLogDirectly(
                currentUser.id,
                currentUser.name,
                currentUser.role,
                currentUser.departmentId,
                currentUser.departmentName,
                'Allocated Lab Slot & Confirmed Booking',
                'Booking',
                `Assigned slot ${startTime} - ${endTime} for ${b.userName} on ${b.equipmentName}`,
                token
              );

              // Notify requester
              const newNotif: NotificationItem = {
                id: `notif-${Date.now()}`,
                timestamp: new Date().toISOString(),
                targetUserId: b.userId,
                title: 'Lab Slot Allocated',
                message: `Your slot for ${b.equipmentName} has been scheduled (${startTime} - ${endTime}) by ${technicianName}`,
                type: 'schedule',
                read: false,
              };
              fetch('/api/notifications', {
                method: 'POST',
                headers: { 
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify(newNotif)
              });
              setNotifications(prev => [newNotif, ...prev]);

              return updated;
            }
            return b;
          })
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  const rejectBooking = async (bookingId: string, reason: string) => {
    if (!token || !currentUser) return;
    try {
      const res = await fetch(`/api/bookings/${bookingId}/reject`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ reason })
      });
      if (res.ok) {
        setBookings(prev =>
          prev.map(b => {
            if (b.id === bookingId) {
              addActivityLogDirectly(
                currentUser.id,
                currentUser.name,
                currentUser.role,
                currentUser.departmentId,
                currentUser.departmentName,
                'Rejected Equipment Booking',
                'Booking',
                `Booking for ${b.equipmentName} rejected. Reason: ${reason}`,
                token
              );

              // Notify requester
              const newNotif: NotificationItem = {
                id: `notif-${Date.now()}`,
                timestamp: new Date().toISOString(),
                targetUserId: b.userId,
                title: 'Booking Request Declined',
                message: `Your request for ${b.equipmentName} was declined: ${reason}`,
                type: 'booking',
                read: false,
              };
              fetch('/api/notifications', {
                method: 'POST',
                headers: { 
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify(newNotif)
              });
              setNotifications(prev => [newNotif, ...prev]);

              return {
                ...b,
                status: 'Rejected' as BookingStatus,
                rejectionReason: reason,
              };
            }
            return b;
          })
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  const updateEquipmentStatus = async (equipmentId: string, status: EquipmentStatus, condition?: EquipmentCondition) => {
    if (!token || !currentUser) return;
    try {
      const res = await fetch(`/api/equipment/${equipmentId}/status`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ status, condition })
      });
      if (res.ok) {
        setEquipment(prev =>
          prev.map(eq => {
            if (eq.id === equipmentId) {
              const updated = {
                ...eq,
                status,
                ...(condition ? { condition } : {}),
              };

              addActivityLogDirectly(
                currentUser.id,
                currentUser.name,
                currentUser.role,
                currentUser.departmentId,
                currentUser.departmentName,
                `Updated Equipment Status to ${status}`,
                'Equipment',
                `${eq.name} status updated to ${status}`,
                token
              );

              return updated;
            }
            return eq;
          })
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  const raiseMaintenanceTicket = async (ticketData: Omit<MaintenanceTicket, 'id' | 'ticketNumber' | 'createdAt' | 'status'>) => {
    if (!token || !currentUser) return;
    const tktCount = tickets.length + 100;
    const newTicket: MaintenanceTicket = {
      ...ticketData,
      id: `tkt-${Date.now()}`,
      ticketNumber: `TKT-2026-${String(tktCount).padStart(4, '0')}`,
      createdAt: new Date().toISOString(),
      status: 'Open',
    };

    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(newTicket)
      });
      if (res.ok) {
        setTickets(prev => [newTicket, ...prev]);
        await updateEquipmentStatus(ticketData.equipmentId, 'Under Maintenance', 'Faulty');

        addActivityLogDirectly(
          currentUser.id,
          currentUser.name,
          currentUser.role,
          currentUser.departmentId,
          currentUser.departmentName,
          'Raised Maintenance Ticket',
          'Maintenance',
          `Ticket ${newTicket.ticketNumber} created for ${ticketData.equipmentName} (${ticketData.priority} Priority).`,
          token
        );

        // Notify maintenance target
        const newNotif: NotificationItem = {
          id: `notif-${Date.now()}`,
          timestamp: new Date().toISOString(),
          targetRole: 'maintenance',
          title: 'New Maintenance Ticket',
          message: `Ticket ${newTicket.ticketNumber} raised for ${ticketData.equipmentName}`,
          type: 'maintenance',
          read: false,
        };
        await fetch('/api/notifications', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
          },
          body: JSON.stringify(newNotif)
        });
        setNotifications(prev => [newNotif, ...prev]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const updateTicketStatus = async (ticketId: string, status: TicketStatus, resolutionNotes?: string, repairCost?: number) => {
    if (!token || !currentUser) return;
    try {
      const res = await fetch(`/api/tickets/${ticketId}/status`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ status, notes: resolutionNotes, cost: repairCost })
      });
      if (res.ok) {
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
                updateEquipmentStatus(t.equipmentId, 'Available', 'Good');
              }

              addActivityLogDirectly(
                currentUser.id,
                currentUser.name,
                currentUser.role,
                currentUser.departmentId,
                currentUser.departmentName,
                `Updated Maintenance Ticket Status to ${status}`,
                'Maintenance',
                `Ticket ${t.ticketNumber} updated to ${status}.`,
                token
              );

              // Notify technicians
              const newNotif: NotificationItem = {
                id: `notif-${Date.now()}`,
                timestamp: new Date().toISOString(),
                targetRole: 'lab_technician',
                title: 'Ticket Status Update',
                message: `Maintenance ticket ${t.ticketNumber} for ${t.equipmentName} is now ${status}.`,
                type: 'maintenance',
                read: false,
              };
              fetch('/api/notifications', {
                method: 'POST',
                headers: { 
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify(newNotif)
              });
              setNotifications(prev => [newNotif, ...prev]);

              return updated;
            }
            return t;
          })
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  const recordCalibration = async (calData: Omit<CalibrationRecord, 'id'>) => {
    if (!token || !currentUser) return;
    const newRecord: CalibrationRecord = {
      ...calData,
      id: `cal-${Date.now()}`,
    };

    try {
      const res = await fetch('/api/calibrations', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(newRecord)
      });
      if (res.ok) {
        setCalibrations(prev => [newRecord, ...prev]);

        // Calibration endpoint updates equipment status automatically in DB. Sync in React.
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

        addActivityLogDirectly(
          currentUser.id,
          currentUser.name,
          currentUser.role,
          currentUser.departmentId,
          currentUser.departmentName,
          'Recorded Equipment Calibration',
          'Calibration',
          `Calibrated ${calData.equipmentName}. Result: ${calData.result}. Next Due: ${calData.nextDueDate}`,
          token
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  const submitSafetyCheck = async (checkData: Omit<SafetyChecklist, 'id'>) => {
    if (!token || !currentUser) return;
    const newCheck: SafetyChecklist = {
      ...checkData,
      id: `safe-${Date.now()}`,
    };

    try {
      const res = await fetch('/api/safety', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(newCheck)
      });
      if (res.ok) {
        setSafetyChecklists(prev => [newCheck, ...prev]);

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

        addActivityLogDirectly(
          currentUser.id,
          currentUser.name,
          currentUser.role,
          currentUser.departmentId,
          currentUser.departmentName,
          'Submitted Lab Safety Compliance Check',
          'System',
          `Completed safety audit for ${checkData.labName}. Score: ${score}% (${score > 90 ? 'Operational' : 'Action Required'})`,
          token
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  const markNotificationRead = async (id: string) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/notifications/${id}/read`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setNotifications(prev =>
          prev.map(n => n.id === id ? { ...n, read: true } : n)
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  const clearAllNotifications = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/notifications/clear', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setNotifications([]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Call Server-Side Gemini API - Attach JWT authorization header
  const askAiAdvisor = async (prompt: string, context?: any): Promise<string> => {
    try {
      const res = await fetch('/api/ai/advisor', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
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

  // Automatic Calibration Alert Engine
  useEffect(() => {
    if (!token || !currentUser || equipment.length === 0) return;

    const today = new Date('2026-08-05'); // Match current mock date
    
    const checkCalibrationReminders = async () => {
      const remindersToCreate: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>[] = [];

      equipment.forEach(eq => {
        if (!eq.nextCalibrationDueDate) return;
        const dueDate = new Date(eq.nextCalibrationDueDate);
        const diffTime = dueDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        const isOverdue = diffDays < 0;
        const isNear = diffDays >= 0 && diffDays <= 15;

        if (isOverdue || isNear) {
          const alarmTitle = isOverdue ? 'Calibration Overdue Alert' : 'Calibration Due Soon Reminder';
          const alarmMsg = isOverdue
            ? `${eq.name} (${eq.modelNumber}) calibration was due on ${eq.nextCalibrationDueDate} (Overdue).`
            : `${eq.name} (${eq.modelNumber}) calibration is due in ${diffDays} days (${eq.nextCalibrationDueDate}).`;

          // Check if notification already exists
          const exists = notifications.some(n => n.title === alarmTitle && n.message.includes(eq.modelNumber));

          if (!exists) {
            remindersToCreate.push({
              targetRole: 'lab_technician',
              title: alarmTitle,
              message: alarmMsg,
              type: 'calibration',
            });
          }
        }
      });

      // Insert new reminders
      for (const notif of remindersToCreate) {
        try {
          const fullNotif = {
            id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            timestamp: new Date().toISOString(),
            read: false,
            ...notif
          };
          const res = await fetch('/api/notifications', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify(fullNotif)
          });
          if (res.ok) {
            setNotifications(prev => [fullNotif, ...prev]);
          }
        } catch (e) {
          console.error('Failed to auto-create calibration notification:', e);
        }
      }
    };

    checkCalibrationReminders();
  }, [equipment, currentUser, token]);

  const scheduleMaintenance = async (sData: Omit<MaintenanceSchedule, 'id' | 'status'>) => {
    if (!token || !currentUser) return;
    const newSchedule: MaintenanceSchedule = {
      ...sData,
      id: `maint-${Date.now()}`,
      status: 'Scheduled',
    };

    try {
      const res = await fetch('/api/schedules', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(newSchedule)
      });
      if (res.ok) {
        setSchedules(prev => [...prev, newSchedule]);
        
        addActivityLogDirectly(
          currentUser.id,
          currentUser.name,
          currentUser.role,
          currentUser.departmentId,
          currentUser.departmentName,
          'Scheduled Maintenance Task',
          'Maintenance',
          `Scheduled ${newSchedule.type} for ${newSchedule.equipmentName} on ${newSchedule.scheduledDate} at ${newSchedule.scheduledTime}`,
          token
        );

        // Notify maintenance target
        const newNotif: NotificationItem = {
          id: `notif-${Date.now()}`,
          timestamp: new Date().toISOString(),
          targetRole: 'maintenance',
          title: 'New Maintenance Scheduled',
          message: `${newSchedule.type} scheduled for ${newSchedule.equipmentName} on ${newSchedule.scheduledDate}`,
          type: 'schedule',
          read: false,
        };
        await fetch('/api/notifications', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
          },
          body: JSON.stringify(newNotif)
        });
        setNotifications(prev => [newNotif, ...prev]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const updateScheduleStatus = async (id: string, status: MaintenanceSchedule['status']) => {
    if (!token || !currentUser) return;
    try {
      const res = await fetch(`/api/schedules/${id}/status`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        setSchedules(prev =>
          prev.map(s => {
            if (s.id === id) {
              const updated = { ...s, status };
              
              addActivityLogDirectly(
                currentUser.id,
                currentUser.name,
                currentUser.role,
                currentUser.departmentId,
                currentUser.departmentName,
                `Maintenance Schedule Status: ${status}`,
                'Maintenance',
                `Maintenance schedule ID ${id} for ${s.equipmentName} marked as ${status}.`,
                token
              );

              // If marked completed, update equipment status to Available & condition to Excellent
              if (status === 'Completed') {
                updateEquipmentStatus(s.equipmentId, 'Available', 'Excellent');

                // Log a calibration check automatically if type is Calibration Check
                if (s.type === 'Calibration Check') {
                  const nextDue = new Date(Date.now() + 180 * 86400000).toISOString().split('T')[0];
                  recordCalibration({
                    equipmentId: s.equipmentId,
                    equipmentName: s.equipmentName,
                    calibrationDate: s.scheduledDate,
                    nextDueDate: nextDue,
                    agency: 'Internal Lab Manager Audit',
                    technicianName: s.technicianName,
                    certificateNumber: `CAL-AUTO-${Date.now().toString().slice(-4)}`,
                    result: 'Passed',
                    notes: `Auto-generated calibration entry from completed schedule task. ${s.description}`,
                  });
                }
              }

              return updated;
            }
            return s;
          })
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        realUser,
        currentRole,
        isAuthenticated: !!token,
        token,
        authLoading,
        authError,
        login,
        signup,
        logout,
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
        schedules,
        addEquipment,
        updateEquipment,
        deleteEquipment,
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
        scheduleMaintenance,
        updateScheduleStatus,
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
