export type UserRole = 
  | 'admin'
  | 'hod'
  | 'staff'
  | 'lab_technician'
  | 'student'
  | 'maintenance';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  departmentId: string;
  departmentName: string;
  institutionId: string;
  institutionName: string;
  avatarUrl?: string;
  phone?: string;
  title?: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  hodId: string;
  hodName: string;
  totalLabs: number;
  totalEquipment: number;
  studentCount: number;
  facultyCount: number;
  technicianCount: number;
  utilizationRate: number; // 0-100
}

export interface Lab {
  id: string;
  name: string;
  code: string;
  departmentId: string;
  departmentName: string;
  institutionId: string;
  institutionName: string;
  building: string;
  roomNumber: string;
  technicianId: string;
  technicianName: string;
  capacity: number;
  condition: 'Operational' | 'Under Maintenance' | 'Calibrating' | 'Degraded';
  safetyScore: number; // 0-100
  lastSafetyAuditDate: string;
  subjects: string[];
}

export type EquipmentStatus = 
  | 'Available' 
  | 'Booked' 
  | 'Under Maintenance' 
  | 'Out of Service' 
  | 'Retired';

export type EquipmentCondition = 
  | 'Excellent' 
  | 'Good' 
  | 'Fair' 
  | 'Needs Calibration' 
  | 'Faulty';

export interface Equipment {
  id: string;
  name: string;
  modelNumber: string;
  serialNumber: string;
  category: string;
  labId: string;
  labName: string;
  departmentId: string;
  departmentName: string;
  institutionId: string;
  institutionName: string;
  status: EquipmentStatus;
  condition: EquipmentCondition;
  purchaseCost: number;
  hourlyRate: number;
  lastCalibrationDate: string;
  nextCalibrationDueDate: string;
  calibrationCertificateNo: string;
  specifications: Record<string, string>;
  assignedCourse?: string;
  requiresTechnicianSupervision: boolean;
  imageUrl?: string;
}

export type BookingStatus = 
  | 'Pending Approval' 
  | 'Confirmed' 
  | 'Assigned Slot' 
  | 'In Use' 
  | 'Completed' 
  | 'Cancelled' 
  | 'Rejected';

export interface Booking {
  id: string;
  equipmentId: string;
  equipmentName: string;
  labId: string;
  labName: string;
  departmentId: string;
  departmentName: string;
  institutionId: string;
  institutionName: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  userEmail: string;
  userInstitutionId?: string;
  userInstitutionName?: string;
  subjectCode?: string;
  subjectName?: string;
  purpose: string;
  bookingDate: string;
  requestedStartTime: string;
  requestedEndTime: string;
  allocatedStartTime?: string;
  allocatedEndTime?: string;
  status: BookingStatus;
  rejectionReason?: string;
  allocatedByTechnicianId?: string;
  allocatedByTechnicianName?: string;
  createdAt: string;
  grantReference?: string;
}

export type TicketIssueType = 
  | 'Hardware Defect' 
  | 'Calibration Drift' 
  | 'Power/Electrical' 
  | 'Software Error' 
  | 'Physical Damage' 
  | 'Routine Service';

export type TicketPriority = 'Critical' | 'High' | 'Medium' | 'Low';

export type TicketStatus = 'Open' | 'In Progress' | 'Spare Parts Needed' | 'Resolved' | 'Closed';

export interface MaintenanceTicket {
  id: string;
  ticketNumber: string;
  equipmentId: string;
  equipmentName: string;
  labId: string;
  labName: string;
  departmentId: string;
  departmentName: string;
  raisedByUserId: string;
  raisedByUserName: string;
  raisedByUserRole: UserRole;
  issueType: TicketIssueType;
  priority: TicketPriority;
  status: TicketStatus;
  description: string;
  assignedTechnician?: string;
  createdAt: string;
  resolvedAt?: string;
  repairCost?: number;
  resolutionNotes?: string;
}

export interface CalibrationRecord {
  id: string;
  equipmentId: string;
  equipmentName: string;
  calibrationDate: string;
  nextDueDate: string;
  agency: string;
  technicianName: string;
  certificateNumber: string;
  result: 'Passed' | 'Passed with Adjustments' | 'Failed';
  notes: string;
}

export interface SafetyChecklist {
  id: string;
  labId: string;
  labName: string;
  date: string;
  checkedBy: string;
  fireExtinguisherChecked: boolean;
  firstAidKitStocked: boolean;
  emergencyStopFunctional: boolean;
  ppeAvailable: boolean;
  ventilationOK: boolean;
  hazardousWasteDisposed: boolean;
  passed: boolean;
  notes: string;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  departmentId: string;
  departmentName: string;
  institutionId: string;
  institutionName: string;
  action: string;
  category: 'Booking' | 'Equipment' | 'Maintenance' | 'Calibration' | 'User Management' | 'System';
  details: string;
}

export interface NotificationItem {
  id: string;
  timestamp: string;
  targetRole?: UserRole;
  targetUserId?: string;
  title: string;
  message: string;
  type: 'booking' | 'maintenance' | 'calibration' | 'schedule' | 'info';
  read: boolean;
}

export interface MaintenanceSchedule {
  id: string;
  equipmentId: string;
  equipmentName: string;
  labId: string;
  labName: string;
  scheduledDate: string;
  scheduledTime: string;
  technicianName: string;
  description: string;
  type: 'Preventive' | 'Calibration Check' | 'Routine Servicing';
  status: 'Scheduled' | 'Completed' | 'Cancelled';
  estimatedDurationHours: number;
  estimatedCost: number;
}

