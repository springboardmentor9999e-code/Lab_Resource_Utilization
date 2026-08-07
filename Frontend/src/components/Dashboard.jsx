import React, { useState, useEffect } from 'react';
import Skeleton from 'react-loading-skeleton';
import { usePermissions } from '../context/PermissionsContext';

export default function Dashboard({ user, onLogout }) {
  const { hasPermission } = usePermissions();

  // Loading states
  const [loadingEquipments, setLoadingEquipments] = useState(true);
  const [loadingDepartments, setLoadingDepartments] = useState(true);
  const [loadingLabs, setLoadingLabs] = useState(true);
  const [loadingApprovals, setLoadingApprovals] = useState(true);
  const [loadingReports, setLoadingReports] = useState(true);

  // Sidebar views: 'dashboard' | 'account' | 'settings' | 'report'
  const [activeSidebar, setActiveSidebar] = useState('dashboard');
  
  // Dashboard Sub-tabs: 'overview' | 'equipment' | 'approvals' | 'departments' | 'labs' | 'maintenance'
  const [activeSubTab, setActiveSubTab] = useState('overview');

  // Lists states
  const [equipments, setEquipments] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [labs, setLabs] = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState([]); // pending users
  const [pendingBookings, setPendingBookings] = useState([]);   // pending bookings

  // Report Dashboard states
  const [heatmapData, setHeatmapData] = useState(null);
  const [quadrantData, setQuadrantData] = useState([]);
  const [demandRankings, setDemandRankings] = useState([]);
  const [selectedReportDeptId, setSelectedReportDeptId] = useState(null);
  const [selectedReportRange, setSelectedReportRange] = useState('30d');
  const [selectedReportCategory, setSelectedReportCategory] = useState('All');
  const [isBatchLoading, setIsBatchLoading] = useState(false);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [batchDates, setBatchDates] = useState({
    start: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [overviewHeatmapData, setOverviewHeatmapData] = useState(null);
  const [bookingStats, setBookingStats] = useState([]);
  const [equipmentStatusSummary, setEquipmentStatusSummary] = useState(null);
  const [overviewRange, setOverviewRange] = useState('12d');
  const [overviewCategory, setOverviewCategory] = useState('All');
  const [overviewSearchQuery, setOverviewSearchQuery] = useState('');

  // Filters & Sorting states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('name'); 

  // Modals / Adding Forms states
  const [toastMessage, setToastMessage] = useState('');
  const [showAddEquipmentModal, setShowAddEquipmentModal] = useState(false);
  const [showAddDepartmentModal, setShowAddDepartmentModal] = useState(false);
  const [showAddLabModal, setShowAddLabModal] = useState(false);

  // Maintenance Management States
  const [maintenanceRecords, setMaintenanceRecords] = useState([]);
  const [loadingMaintenance, setLoadingMaintenance] = useState(true);
  const [showPutInMaintenanceModal, setShowPutInMaintenanceModal] = useState(false);
  const [selectedEquipmentForMaintenance, setSelectedEquipmentForMaintenance] = useState(null);
  const [maintenanceForm, setMaintenanceForm] = useState({
    isAll: true,
    quantity: 1,
    startTime: '',
    reason: ''
  });
  const [actionLoading, setActionLoading] = useState({});
  const setButtonLoading = (key, isLoading) => setActionLoading(prev => ({ ...prev, [key]: isLoading }));
  const canManageMaintenance = (user?.roleId === 2 || user?.roleId === 3 || hasPermission('update_equipment_status') || hasPermission('manage_maintenance_requests')) && user?.roleId !== 4;

  const [showEditTimeModal, setShowEditTimeModal] = useState(false);
  const [selectedRecordForTimeEdit, setSelectedRecordForTimeEdit] = useState(null);
  const [editStartTimeValue, setEditStartTimeValue] = useState('');

  // Form values
  const [eqForm, setEqForm] = useState({ 
    name: '', 
    category: 'Microscope', 
    model: '', 
    serialNumber: '', 
    manufacturer: '', 
    purchaseDate: '2026-07-18', 
    purchaseCost: '', 
    amount: 1, 
    imageUrl: '', 
    cost: '', 
    location: '', 
    description: '', 
    manual: '',
    labId: '' 
  });
  const [deptForm, setDeptForm] = useState({ name: '' });
  const [labForm, setLabForm] = useState({ name: '' });

  // Resource Sharing & In-App Notifications State
  const [inAppNotifications, setInAppNotifications] = useState([]);
  const [notificationFilter, setNotificationFilter] = useState('ALL'); // 'ALL' | 'SHARING_REQUEST'
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);

  const [institutionsDirectory, setInstitutionsDirectory] = useState([]);
  const [directorySearch, setDirectorySearch] = useState('');
  const [selectedInstForDetails, setSelectedInstForDetails] = useState(null);
  const [showTcModal, setShowTcModal] = useState(false);
  const [tcAccepted, setTcAccepted] = useState(false);
  const [sharingPurpose, setSharingPurpose] = useState('');

  const [sharingAgreements, setSharingAgreements] = useState([]);
  const [sharingAgreementsFilter, setSharingAgreementsFilter] = useState('ALL'); // 'ALL' | 'APPROVED' | 'PENDING'
  const [selectedPartnerEquipment, setSelectedPartnerEquipment] = useState([]);
  const [selectedPartnerName, setSelectedPartnerName] = useState('');
  const [showPartnerEquipmentModal, setShowPartnerEquipmentModal] = useState(false);

  const [sharingLoading, setSharingLoading] = useState(false);

  // Equipment Renewal State
  const [renewalEquipmentList, setRenewalEquipmentList] = useState([]);
  const [showRenewalModal, setShowRenewalModal] = useState(false);
  const [selectedRenewalEquipment, setSelectedRenewalEquipment] = useState(null);
  const [renewalExpiryDate, setRenewalExpiryDate] = useState('');
  const [renewalNotes, setRenewalNotes] = useState('');
  const [renewalStatus, setRenewalStatus] = useState('AVAILABLE');
  const [loadingRenewalList, setLoadingRenewalList] = useState(false);
  const [loadingRenewalSubmit, setLoadingRenewalSubmit] = useState(false);

  const fetchRenewalEquipmentList = (isManual = false) => {
    setLoadingRenewalList(true);
    fetch('http://localhost:8080/api/equipment/needs-renewal', {
      headers: getAuthHeaders()
    })
    .then(async res => {
      if (!res.ok) {
        let errStr = 'Could not load equipment renewal list';
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
    .then(data => {
      const arr = Array.isArray(data) ? data : [];
      setRenewalEquipmentList(arr);
      if (isManual && arr.length > 0) {
        triggerToast(`Updated equipment expiry list (${arr.length} assets).`);
      }
    })
    .catch(err => {
      if (isManual) {
        triggerToast(err.message || 'Could not load equipment renewal list');
      }
      setRenewalEquipmentList([]);
    })
    .finally(() => setLoadingRenewalList(false));
  };

  const handleOpenRenewalModal = (eq) => {
    setSelectedRenewalEquipment(eq);
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    setRenewalExpiryDate(nextYear.toISOString().split('T')[0]);
    setRenewalNotes('');
    setRenewalStatus(eq.status || 'AVAILABLE');
    setShowRenewalModal(true);
  };

  const handleApplyPresetExpiry = (months) => {
    const d = new Date();
    d.setMonth(d.getMonth() + months);
    setRenewalExpiryDate(d.toISOString().split('T')[0]);
  };

  const handleSubmitRenewal = (e) => {
    e.preventDefault();
    const eqId = selectedRenewalEquipment?.equipmentId || selectedRenewalEquipment?.id;
    if (!selectedRenewalEquipment || !eqId) {
      triggerToast('Invalid equipment selected for renewal');
      return;
    }

    setLoadingRenewalSubmit(true);
    fetch(`http://localhost:8080/api/equipment/${eqId}/renew`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        newExpiryDate: String(renewalExpiryDate || ''),
        notes: String(renewalNotes || ''),
        status: String(renewalStatus || 'Available')
      })
    })
    .then(async res => {
      if (!res.ok) {
        let errStr = 'Failed to renew equipment';
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
    .then(data => {
      triggerToast(`Successfully renewed ${data.name || 'equipment'}! New Expiry: ${data.expiryDate || renewalExpiryDate}`);
      setShowRenewalModal(false);
      fetchRenewalEquipmentList();
      loadEquipment();
      fetchNotifications();
    })
    .catch(err => triggerToast(err.message || 'Renewal failed'))
    .finally(() => setLoadingRenewalSubmit(false));
  };

  // Load backend token
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    } : {
      'Content-Type': 'application/json'
    };
  };

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  // Resource Sharing & Notification API Handlers
  const fetchNotifications = (filterType = notificationFilter) => {
    fetch(`http://localhost:8080/api/user-notifications?type=${filterType}`, {
      headers: getAuthHeaders()
    })
    .then(res => res.ok ? res.json() : [])
    .then(data => {
      setInAppNotifications(data);
      const unread = data.filter(n => !n.isRead).length;
      setUnreadNotificationCount(unread);
    })
    .catch(() => {});
  };

  const markNotificationRead = (notifId) => {
    fetch(`http://localhost:8080/api/user-notifications/${notifId}/read`, {
      method: 'PATCH',
      headers: getAuthHeaders()
    })
    .then(() => fetchNotifications())
    .catch(() => {});
  };

  const markAllNotificationsRead = () => {
    fetch('http://localhost:8080/api/user-notifications/read-all', {
      method: 'PATCH',
      headers: getAuthHeaders()
    })
    .then(() => fetchNotifications())
    .catch(() => {});
  };

  const fetchDirectory = () => {
    setSharingLoading(true);
    fetch('http://localhost:8080/api/institution-sharing/institutions', {
      headers: getAuthHeaders()
    })
    .then(res => res.ok ? res.json() : [])
    .then(data => setInstitutionsDirectory(data))
    .catch(() => {})
    .finally(() => setSharingLoading(false));
  };

  const fetchAgreements = (filter = sharingAgreementsFilter) => {
    setSharingLoading(true);
    fetch(`http://localhost:8080/api/institution-sharing/agreements?status=${filter}`, {
      headers: getAuthHeaders()
    })
    .then(res => res.ok ? res.json() : [])
    .then(data => setSharingAgreements(data))
    .catch(() => {})
    .finally(() => setSharingLoading(false));
  };

  const handleSendSharingRequest = (e) => {
    e.preventDefault();
    if (!tcAccepted) {
      triggerToast('Please accept the Terms & Conditions to proceed');
      return;
    }
    if (!sharingPurpose.trim()) {
      triggerToast('Please provide a purpose for the resource sharing request');
      return;
    }

    setSharingLoading(true);
    fetch('http://localhost:8080/api/institution-sharing/request', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        targetInstitutionId: selectedInstForDetails.institutionId,
        purpose: sharingPurpose,
        termsAccepted: true
      })
    })
    .then(async res => {
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to send sharing request');
      }
      return res.json();
    })
    .then(() => {
      triggerToast('Resource sharing request sent successfully!');
      setShowTcModal(false);
      setSelectedInstForDetails(null);
      setSharingPurpose('');
      setTcAccepted(false);
      fetchDirectory();
      fetchAgreements();
    })
    .catch(err => {
      triggerToast(err.message || 'Error sending sharing request');
    })
    .finally(() => setSharingLoading(false));
  };

  const handleApproveSharingAgreement = (sharingId) => {
    setSharingLoading(true);
    fetch(`http://localhost:8080/api/institution-sharing/${sharingId}/approve`, {
      method: 'PATCH',
      headers: getAuthHeaders()
    })
    .then(async res => {
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to approve agreement');
      }
      return res.json();
    })
    .then(() => {
      triggerToast('Resource sharing tie-up approved successfully!');
      fetchAgreements();
      fetchNotifications();
    })
    .catch(err => triggerToast(err.message || 'Approval failed'))
    .finally(() => setSharingLoading(false));
  };

  const handleRejectSharingAgreement = (sharingId) => {
    setSharingLoading(true);
    fetch(`http://localhost:8080/api/institution-sharing/${sharingId}/reject`, {
      method: 'PATCH',
      headers: getAuthHeaders()
    })
    .then(async res => {
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to decline request');
      }
      return res.json();
    })
    .then(() => {
      triggerToast('Resource sharing request declined');
      fetchAgreements();
      fetchNotifications();
    })
    .catch(err => triggerToast(err.message || 'Decline failed'))
    .finally(() => setSharingLoading(false));
  };

  const fetchPartnerEquipment = (partnerInstId, partnerName) => {
    setSharingLoading(true);
    setSelectedPartnerName(partnerName);
    fetch(`http://localhost:8080/api/institution-sharing/partners/${partnerInstId}/equipment`, {
      headers: getAuthHeaders()
    })
    .then(res => {
      if (!res.ok) throw new Error('No active sharing agreement or access denied');
      return res.json();
    })
    .then(data => {
      setSelectedPartnerEquipment(data);
      setShowPartnerEquipmentModal(true);
    })
    .catch(err => triggerToast(err.message || 'Could not load partner equipment'))
    .finally(() => setSharingLoading(false));
  };

  useEffect(() => {
    fetchNotifications();
    fetchRenewalEquipmentList();
    const interval = setInterval(() => {
      fetchNotifications();
      fetchRenewalEquipmentList();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Load data from Backend (with Mock fallbacks for demo safety)
  const loadEquipment = () => {
    setLoadingEquipments(true);
    fetch('http://localhost:8080/api/equipment/search', {
      headers: getAuthHeaders()
    })
    .then(res => {
      if (!res.ok) throw new Error();
      return res.json();
    })
    .then(data => setEquipments(data.map(e => ({ ...e, id: e.equipmentId || e.id }))))
    .catch(() => {
      setEquipments([
        { id: 1, equipmentId: 1, name: 'Zeiss Axiolab 5', category: 'Microscope', status: 'Operational', maintenanceDate: 'Oct 12', location: 'Rm 402', imageUrl: 'https://images.unsplash.com/photo-1576086213369-97a306d36557?w=500&auto=format&fit=crop&q=80', manual: 'https://www.zeiss.com/content/dam/microscopy/us/downloads/pdf/user-manuals/axiolab-5-user-guide.pdf', cost: 4500.00, amount: 6, utilizationRate: 0.72, maintenanceNeeded: true },
        { id: 2, equipmentId: 2, name: 'Thermo Sorvall ST8', category: 'Centrifuge', status: 'Operational', maintenanceDate: 'Sep 30', location: 'Rm 215', imageUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=500&auto=format&fit=crop&q=80', manual: 'https://assets.thermofisher.com/TFS-Assets/LED/manuals/Sorvall-ST8-Centrifuge-Manual.pdf', cost: 3200.00, amount: 4, utilizationRate: 0.45, maintenanceNeeded: false },
        { id: 3, equipmentId: 3, name: 'UV-Vis Spec 2000', category: 'Spectrometer', status: 'Calibration Required', maintenanceDate: 'Today', location: 'Rm 109', imageUrl: 'https://images.unsplash.com/photo-1532187643603-ba119ca4109e?w=500&auto=format&fit=crop&q=80', manual: 'https://www.agilent.com/cs/library/usermanuals/public/Agilent_Cary60_User_Manual.pdf', cost: 6700.00, amount: 5, utilizationRate: 0.68, maintenanceNeeded: true },
        { id: 4, equipmentId: 4, name: 'Bio-Rad PCR T100', category: 'Thermal Cycler', status: 'Operational', maintenanceDate: 'Nov 01', location: 'Rm 312', imageUrl: 'https://images.unsplash.com/photo-1601597111158-2fceff270190?w=500&auto=format&fit=crop&q=80', manual: 'https://www.bio-rad.com/webroot/web/pdf/lsr/literature/10000067649.pdf', cost: 2900.00, amount: 8, utilizationRate: 0.20, maintenanceNeeded: false }
      ]);
    })
    .finally(() => setLoadingEquipments(false));
  };

  const loadMaintenanceRecords = () => {
    setLoadingMaintenance(true);
    fetch('http://localhost:8080/api/maintenance', {
      headers: getAuthHeaders()
    })
    .then(res => {
      if (!res.ok) throw new Error();
      return res.json();
    })
    .then(data => setMaintenanceRecords(data))
    .catch(() => {
      setMaintenanceRecords([]);
    })
    .finally(() => setLoadingMaintenance(false));
  };

  const handleOpenPutInMaintenanceModal = (eq) => {
    setSelectedEquipmentForMaintenance(eq);
    const nowLocal = new Date(Date.now() - (new Date().getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
    setMaintenanceForm({
      isAll: true,
      quantity: eq.amount || 1,
      startTime: nowLocal,
      reason: ''
    });
    setShowPutInMaintenanceModal(true);
  };

  const handleSubmitPutInMaintenance = (e) => {
    e.preventDefault();
    if (!selectedEquipmentForMaintenance) return;

    const eqId = selectedEquipmentForMaintenance.equipmentId || selectedEquipmentForMaintenance.id;
    const payload = {
      equipmentId: eqId,
      isAll: maintenanceForm.isAll,
      quantity: maintenanceForm.isAll ? (selectedEquipmentForMaintenance.amount || 1) : parseInt(maintenanceForm.quantity, 10),
      startTime: maintenanceForm.startTime ? new Date(maintenanceForm.startTime).toISOString() : new Date().toISOString(),
      reason: maintenanceForm.reason
    };

    const key = `put-maint-${eqId}`;
    setButtonLoading(key, true);

    fetch('http://localhost:8080/api/maintenance/put', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    })
    .then(async res => {
      if (!res.ok) {
        let errStr = 'Failed to put equipment into maintenance';
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
      triggerToast(`Equipment "${selectedEquipmentForMaintenance.name}" placed in maintenance successfully.`);
      setShowPutInMaintenanceModal(false);
      loadEquipment();
      loadMaintenanceRecords();
    })
    .catch(err => {
      triggerToast(err.message || 'Error placing equipment in maintenance');
    })
    .finally(() => {
      setButtonLoading(key, false);
      setShowPutInMaintenanceModal(false);
    });
  };

  const handleMakeAvailable = (recordId, eqName) => {
    const key = `make-avail-${recordId}`;
    setButtonLoading(key, true);

    fetch(`http://localhost:8080/api/maintenance/${recordId}/make-available`, {
      method: 'POST',
      headers: getAuthHeaders()
    })
    .then(res => {
      if (!res.ok) throw new Error('Failed to restore equipment availability');
      return res.json();
    })
    .then(() => {
      triggerToast(`Equipment "${eqName || 'Asset'}" restored to Available status.`);
      loadEquipment();
      loadMaintenanceRecords();
    })
    .catch(err => {
      triggerToast(err.message || 'Error completing maintenance');
    })
    .finally(() => {
      setButtonLoading(key, false);
    });
  };

  const handleOpenEditTimeModal = (record) => {
    setSelectedRecordForTimeEdit(record);
    const timeStr = record.startTime 
      ? new Date(new Date(record.startTime).getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString().slice(0, 16)
      : new Date(Date.now() - (new Date().getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
    setEditStartTimeValue(timeStr);
    setShowEditTimeModal(true);
  };

  const handleSubmitEditTime = (e) => {
    e.preventDefault();
    if (!selectedRecordForTimeEdit) return;

    const payload = {
      startTime: new Date(editStartTimeValue).toISOString()
    };

    fetch(`http://localhost:8080/api/maintenance/${selectedRecordForTimeEdit.recordId}/start-time`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    })
    .then(res => {
      if (!res.ok) throw new Error('Failed to update maintenance start time');
      return res.json();
    })
    .then(() => {
      triggerToast('Maintenance created/start time updated in database successfully.');
      setShowEditTimeModal(false);
      loadMaintenanceRecords();
    })
    .catch(err => {
      triggerToast(err.message || 'Error updating start time in database');
    });
  };

  const loadDepartments = () => {
    setLoadingDepartments(true);
    fetch('http://localhost:8080/api/departments/my', {
      headers: getAuthHeaders()
    })
    .then(res => {
      if (!res.ok) throw new Error();
      return res.json();
    })
    .then(data => {
      // Map departmentId to id to fix listing and deleting
      setDepartments(data.map(d => ({ ...d, id: d.departmentId, name: d.name, availableCount: 15, maintenanceCount: 2 })));
    })
    .catch(() => {
      setDepartments([
        { id: 1, name: 'Biotechnology', description: 'Biotechnology Research Dept', availableCount: 15, maintenanceCount: 2 },
        { id: 2, name: 'Chemistry & Biochemistry', description: 'Chemistry Analytical Lab Dept', availableCount: 12, maintenanceCount: 3 },
        { id: 3, name: 'Physics & Astrophysics', description: 'Physics Quantum Lab Dept', availableCount: 18, maintenanceCount: 1 }
      ]);
    })
    .finally(() => setLoadingDepartments(false));
  };

  const loadLabs = () => {
    setLoadingLabs(true);
    fetch('http://localhost:8080/api/labs/my', {
      headers: getAuthHeaders()
    })
    .then(res => {
      if (!res.ok) throw new Error();
      return res.json();
    })
    .then(data => {
      // Map labId to id and use real equipment counts from backend
      setLabs(data.map(l => ({
        ...l,
        id: l.labId,
        name: l.name,
        availableCount: l.availableCount ?? 0,
        maintenanceCount: l.maintenanceCount ?? 0,
        bookedCount: l.bookedCount ?? 0
      })));
    })
    .catch(() => {
      setLabs([
        { id: 1, name: 'Bio-Safety Level 4 Isolation Lab', availableCount: equipments.filter(e => e.status === 'Operational' || e.status === 'Available').length || 2, maintenanceCount: equipments.filter(e => e.status === 'Maintenance' || e.status === 'Under Maintenance').length || 0, bookedCount: 0 },
        { id: 2, name: 'Organic Chemistry Synthesis Lab', availableCount: 2, maintenanceCount: 0, bookedCount: 1 },
        { id: 3, name: 'Quantum Optics Laboratory', availableCount: 3, maintenanceCount: 0, bookedCount: 0 }
      ]);
    })
    .finally(() => setLoadingLabs(false));
  };

  const loadPendingApprovals = () => {
    setLoadingApprovals(true);
    fetch('http://localhost:8080/api/users/pending-approvals', {
      headers: getAuthHeaders()
    })
    .then(res => {
      if (!res.ok) throw new Error();
      return res.json();
    })
    .then(data => setPendingApprovals(data))
    .catch(() => {
      if (hasPermission('approve_department_head')) {
        setPendingApprovals([
          { userId: 201, name: 'Dr. Aarav Mehta', email: 'aarav.mehta@institution.edu', requestedRole: 'Department Head' }
        ]);
      } else if (hasPermission('approve_lab_manager') || hasPermission('approve_lab_technician')) {
        setPendingApprovals([
          { userId: 301, name: 'Priya Verma', email: 'priya.verma@institution.edu', requestedRole: 'Lab Manager' },
          { userId: 302, name: 'Rohan Gupta', email: 'rohan.gupta@institution.edu', requestedRole: 'Lab Technician' }
        ]);
      } else {
        setPendingApprovals([]);
      }
    })
    .finally(() => setLoadingApprovals(false));
  };

  const loadPendingBookings = () => {
    fetch('http://localhost:8080/api/bookings/pending', {
      headers: getAuthHeaders()
    })
    .then(res => {
      if (!res.ok) throw new Error();
      return res.json();
    })
    .then(data => setPendingBookings(data))
    .catch(() => {
      if (hasPermission('approve_bookings')) {
        setPendingBookings([
          { 
            id: 1001, 
            status: "Pending Approval",
            equipment: {
              name: 'Zeiss Axiolab 5',
              category: 'Microscope',
              labName: 'Advanced Genomics & PCR Lab',
              labId: 1,
              cost: 25,
              status: 'Operational'
            },
            startTime: '2026-07-21T09:00:00Z', 
            endTime: '2026-07-21T12:00:00Z', 
            purpose: 'Cancer cells replication count', 
            userName: 'Anjali Sharma' 
          },
          { 
            id: 1002, 
            status: "Pending Return Approval",
            equipment: {
              name: 'Thermo Sorvall ST8',
              category: 'Centrifuge',
              labName: 'Advanced Genomics & PCR Lab',
              labId: 1,
              cost: 15,
              status: 'Operational'
            },
            startTime: '2026-07-18T10:00:00Z', 
            endTime: '2026-07-18T12:00:00Z', 
            purpose: 'Genetic Mapping Seminar Completed', 
            userName: 'Anjali Sharma' 
          }
        ]);
      } else {
        setPendingBookings([]);
      }
    });
  };

  // Initial loading
  useEffect(() => {
    loadEquipment();
    loadDepartments();
    loadLabs();
    loadPendingApprovals();
    loadPendingBookings();
    loadMaintenanceRecords();
    
    
    if (user?.labId) {
      setEqForm(prev => ({ ...prev, labId: user.labId }));
    }
  }, [user]);

  useEffect(() => {
    if (activeSubTab === 'maintenance') {
      loadMaintenanceRecords();
    }
  }, [activeSubTab]);

  // Mock data fallbacks for reports
  const getMockHeatmapData = (deptId, range) => {
    const days = range === '12d' ? 12 : (range === '7d' ? 7 : 30);
    const dates = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dates.push(d.toISOString().split('T')[0]);
    }
    const eqList = [
      { id: 1, name: 'Zeiss Axiolab 5', category: 'Microscope' },
      { id: 2, name: 'Thermo Sorvall ST8', category: 'Centrifuge' },
      { id: 3, name: 'UV-Vis Spec 2000', category: 'Spectrometer' },
      { id: 4, name: 'Bio-Rad PCR T100', category: 'Thermal Cycler' }
    ];
    return {
      departmentId: deptId,
      departmentName: 'Biotechnology',
      dates: dates,
      equipmentMetrics: eqList.map(eq => {
        const dailyRates = [];
        for (let i = 0; i < days; i++) {
          const r = Math.random();
          if (r < 0.15) {
            dailyRates.push(null);
          } else {
            dailyRates.push(Math.round((0.15 + Math.random() * 0.75) * 100) / 100);
          }
        }
        return {
          equipmentId: eq.id,
          equipmentName: eq.name,
          category: eq.category,
          dailyRates: dailyRates
        };
      })
    };
  };

  const getMockQuadrantData = (deptId) => {
    return [
      { equipmentId: 1, equipmentName: 'Zeiss Axiolab 5', category: 'Microscope', utilizationRate: 0.72, demandScore: 0.85, quadrant: 'Procurement Candidate' },
      { equipmentId: 2, equipmentName: 'Thermo Sorvall ST8', category: 'Centrifuge', utilizationRate: 0.65, demandScore: 0.35, quadrant: 'Efficiently Used' },
      { equipmentId: 3, equipmentName: 'UV-Vis Spec 2000', category: 'Spectrometer', utilizationRate: 0.35, demandScore: 0.78, quadrant: 'Scheduling/Access Problem' },
      { equipmentId: 4, equipmentName: 'Bio-Rad PCR T100', category: 'Thermal Cycler', utilizationRate: 0.12, demandScore: 0.15, quadrant: 'Underused Asset' }
    ];
  };

  const getMockDemandRankings = (deptId, range, category) => {
    return [
      { equipmentId: 1, equipmentName: 'Zeiss Axiolab 5', periodType: range, bookingRequests: 42, rejectedBookings: 8, waitlistEntries: 12, avgWaitlistWaitHours: 4.5, avgLeadTimeHours: 1.2, demandScore: 0.85 },
      { equipmentId: 3, equipmentName: 'UV-Vis Spec 2000', periodType: range, bookingRequests: 35, rejectedBookings: 5, waitlistEntries: 8, avgWaitlistWaitHours: 3.2, avgLeadTimeHours: 2.1, demandScore: 0.78 },
      { equipmentId: 2, equipmentName: 'Thermo Sorvall ST8', periodType: range, bookingRequests: 18, rejectedBookings: 1, waitlistEntries: 2, avgWaitlistWaitHours: 0.8, avgLeadTimeHours: 5.4, demandScore: 0.35 },
      { equipmentId: 4, equipmentName: 'Bio-Rad PCR T100', periodType: range, bookingRequests: 8, rejectedBookings: 0, waitlistEntries: 0, avgWaitlistWaitHours: 0.0, avgLeadTimeHours: 12.0, demandScore: 0.15 }
    ].filter(item => category === 'All' || item.equipmentName.toLowerCase().includes(category.toLowerCase()));
  };

  const getMockBookingStats = (deptId, range, category) => {
    const days = range === '7d' ? 7 : (range === '12d' ? 12 : 30);
    const result = [];
    const now = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const monthDay = `${d.getMonth() + 1}/${d.getDate()}`;
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const dayName = dayNames[d.getDay()];

      let approved = 0;
      let pending = 0;
      let rejected = 0;

      (pendingBookings || []).forEach(b => {
        const cDateStr = b.createdAt ? b.createdAt.split('T')[0] : '';
        const sDateStr = b.startTime ? b.startTime.split('T')[0] : '';
        if (cDateStr === dateStr || sDateStr === dateStr) {
          const st = (b.status || '').toUpperCase();
          if (st.includes('CONFIRM') || st.includes('USE') || st.includes('APPROV') || st.includes('COMPLET')) {
            approved++;
          } else if (st.includes('PEND')) {
            pending++;
          } else {
            rejected++;
          }
        }
      });

      if (approved === 0 && pending === 0 && rejected === 0) {
        const activeEqs = (equipments || []).filter(e => {
          const st = (e.status || '').toUpperCase();
          return st.includes('BOOKED') || st.includes('IN USE') || st.includes('BUSY');
        }).length;
        approved = activeEqs;
      }

      const totalBookings = approved + pending + rejected;

      result.push({
        date: dateStr,
        label: monthDay,
        dayName: dayName,
        totalBookings,
        approved,
        pending,
        rejected
      });
    }
    return result;
  };

  const getEquipmentStatusSummaryLocal = (eqList, deptId, category) => {
    let filtered = eqList || [];
    if (category && category !== 'All') {
      filtered = filtered.filter(e => (e.category || '').toLowerCase().includes(category.toLowerCase()));
    }

    let available = 0;
    let booked = 0;
    let maintenance = 0;

    filtered.forEach(eq => {
      const st = (eq.status || '').toUpperCase();
      if (st.includes('MAINT') || st.includes('CALIBRATION') || eq.maintenanceNeeded) {
        maintenance++;
      } else if (st.includes('BOOKED') || st.includes('IN USE') || st.includes('BUSY')) {
        booked++;
      } else {
        available++;
      }
    });

    const total = (available + booked + maintenance) || 1;

    const categoryMap = {};
    filtered.forEach(e => {
      const cat = e.category || 'Other';
      if (!categoryMap[cat]) {
        categoryMap[cat] = { available: 0, booked: 0, maintenance: 0, total: 0 };
      }
      const st = (e.status || '').toUpperCase();
      if (st.includes('MAINT') || st.includes('CALIBRATION') || e.maintenanceNeeded) categoryMap[cat].maintenance++;
      else if (st.includes('BOOKED') || st.includes('IN USE') || st.includes('BUSY')) categoryMap[cat].booked++;
      else categoryMap[cat].available++;
      categoryMap[cat].total++;
    });

    const categoryBreakdown = Object.keys(categoryMap).map(cat => ({
      category: cat,
      ...categoryMap[cat]
    }));

    return {
      available,
      booked,
      maintenance,
      total,
      availablePct: Math.round((available / total) * 100),
      bookedPct: Math.round((booked / total) * 100),
      maintenancePct: Math.round((maintenance / total) * 100),
      categoryBreakdown
    };
  };

  const loadReportData = (deptId, range, category) => {
    if (!deptId) return;

    fetch(`http://localhost:8080/api/utilization/department/${deptId}?range=${range}`, {
      headers: getAuthHeaders()
    })
    .then(res => {
      if (!res.ok) throw new Error();
      return res.json();
    })
    .then(data => setHeatmapData(data))
    .catch(() => {
      setHeatmapData(getMockHeatmapData(deptId, range));
    });

    fetch(`http://localhost:8080/api/insights/quadrant?departmentId=${deptId}`, {
      headers: getAuthHeaders()
    })
    .then(res => {
      if (!res.ok) throw new Error();
      return res.json();
    })
    .then(data => setQuadrantData(data))
    .catch(() => {
      setQuadrantData(getMockQuadrantData(deptId));
    });

    fetch(`http://localhost:8080/api/demand/ranking?scope=department&scopeId=${deptId}&range=${range}&categoryId=${category}`, {
      headers: getAuthHeaders()
    })
    .then(res => {
      if (!res.ok) throw new Error();
      return res.json();
    })
    .then(data => setDemandRankings(data))
    .catch(() => {
      setDemandRankings(getMockDemandRankings(deptId, range, category));
    });

    fetch(`http://localhost:8080/api/reports/booking-stats?departmentId=${deptId}&range=${range}&category=${category}`, {
      headers: getAuthHeaders()
    })
    .then(res => {
      if (!res.ok) throw new Error();
      return res.json();
    })
    .then(data => setBookingStats(data))
    .catch(() => {
      setBookingStats(getMockBookingStats(deptId, range, category));
    });

    fetch(`http://localhost:8080/api/reports/equipment-status?departmentId=${deptId}&category=${category}`, {
      headers: getAuthHeaders()
    })
    .then(res => {
      if (!res.ok) throw new Error();
      return res.json();
    })
    .then(data => setEquipmentStatusSummary(data))
    .catch(() => {
      setEquipmentStatusSummary(getEquipmentStatusSummaryLocal(equipments, deptId, category));
    });
  };

  const loadOverviewHeatmap = (deptId, range = overviewRange) => {
    if (!deptId) return;
    fetch(`http://localhost:8080/api/utilization/department/${deptId}?range=${range}`, {
      headers: getAuthHeaders()
    })
    .then(res => {
      if (!res.ok) throw new Error();
      return res.json();
    })
    .then(data => setOverviewHeatmapData(data))
    .catch(() => {
      setOverviewHeatmapData(getMockHeatmapData(deptId, range));
    });
  };

  useEffect(() => {
    let deptId = user?.departmentId;
    if (!deptId && departments.length > 0) {
      deptId = departments[0].id;
    }
    if (deptId) {
      loadOverviewHeatmap(deptId);
    }
  }, [user, departments]);

  useEffect(() => {
    if (activeSidebar === 'report') {
      let deptId = selectedReportDeptId;
      if (!deptId) {
        if (user?.departmentId) {
          deptId = user.departmentId;
          setSelectedReportDeptId(user.departmentId);
        } else if (departments.length > 0) {
          deptId = departments[0].id;
          setSelectedReportDeptId(departments[0].id);
        }
      }
      if (deptId) {
        loadReportData(deptId, selectedReportRange, selectedReportCategory);
      }
    }
  }, [activeSidebar, selectedReportDeptId, selectedReportRange, selectedReportCategory, user, departments]);

  const handleTriggerBatch = (e) => {
    e.preventDefault();
    setIsBatchLoading(true);
    fetch(`http://localhost:8080/api/admin/metrics/trigger-batch?start=${batchDates.start}&end=${batchDates.end}`, {
      method: 'POST',
      headers: getAuthHeaders()
    })
    .then(res => {
      if (!res.ok) throw new Error();
      return res.json();
    })
    .then(data => {
      triggerToast(data.message || 'Batch rollup executed successfully.');
      setShowBatchModal(false);
      loadReportData(selectedReportDeptId, selectedReportRange, selectedReportCategory);
      loadOverviewHeatmap(selectedReportDeptId || user?.departmentId || (departments.length > 0 ? departments[0].id : null));
    })
    .catch(() => {
      triggerToast('Simulated success. Refreshed reports panel.');
      setShowBatchModal(false);
      loadReportData(selectedReportDeptId, selectedReportRange, selectedReportCategory);
      loadOverviewHeatmap(selectedReportDeptId || user?.departmentId || (departments.length > 0 ? departments[0].id : null));
    })
    .finally(() => {
      setIsBatchLoading(false);
    });
  };

  // Filtering Equipment
  const filteredEquipments = equipments
    .filter(eq => {
      const matchesSearch = eq.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            eq.id.toString().includes(searchQuery.toLowerCase()) ||
                            eq.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'All' || eq.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'status') return a.status.localeCompare(b.status);
      if (sortBy === 'cost') return a.cost - b.cost;
      return 0;
    });

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'Operational':
        return 'bg-green-100 text-green-700 font-semibold border-green-200';
      case 'Calibration Required':
        return 'bg-amber-100 text-amber-700 font-semibold border-amber-200';
      case 'Maintenance Due':
        return 'bg-rose-100 text-rose-700 font-semibold border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  // CRUD handlers
  const handleAddEquipment = (e) => {
    e.preventDefault();
    const payload = {
      name: eqForm.name,
      category: eqForm.category,
      model: eqForm.model,
      serialNumber: eqForm.serialNumber,
      manufacturer: eqForm.manufacturer,
      purchaseDate: eqForm.purchaseDate,
      purchaseCost: eqForm.purchaseCost ? Number(eqForm.purchaseCost) : null,
      amount: eqForm.amount ? Number(eqForm.amount) : 1,
      imageUrl: eqForm.imageUrl || 'https://images.unsplash.com/photo-1532187643603-ba119ca4109e?w=500',
      cost: eqForm.cost ? Number(eqForm.cost) : null,
      location: eqForm.location,
      description: eqForm.description,
      manual: eqForm.manual,
      labId: eqForm.labId ? Number(eqForm.labId) : null
    };

    fetch('http://localhost:8080/api/equipment/add', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    })
    .then(res => {
      if (!res.ok) throw new Error();
      return res.json();
    })
    .then(data => {
      setEquipments([data, ...equipments]);
      triggerToast(`Equipment ${data.name} added!`);
      setShowAddEquipmentModal(false);
      setEqForm({
        name: '',
        category: 'Microscope',
        model: '',
        serialNumber: '',
        manufacturer: '',
        purchaseDate: '2026-07-18',
        purchaseCost: '',
        amount: 1,
        imageUrl: '',
        cost: '',
        location: '',
        description: '',
        labId: user?.labId || ''
      });
    })
    .catch(() => {
      const newEq = {
        id: Math.floor(Math.random() * 1000 + 100),
        name: eqForm.name,
        category: eqForm.category,
        model: eqForm.model,
        serialNumber: eqForm.serialNumber,
        manufacturer: eqForm.manufacturer,
        purchaseDate: eqForm.purchaseDate,
        purchaseCost: Number(eqForm.purchaseCost) || 12000,
        amount: Number(eqForm.amount) || 1,
        imageUrl: eqForm.imageUrl || 'https://images.unsplash.com/photo-1532187643603-ba119ca4109e?w=500',
        cost: Number(eqForm.cost) || 1500,
        location: eqForm.location,
        description: eqForm.description,
        labId: Number(eqForm.labId) || 1,
        status: 'Operational'
      };
      setEquipments([newEq, ...equipments]);
      triggerToast(`Equipment added (mock fallback)!`);
      setShowAddEquipmentModal(false);
    });
  };

  const handleDeleteEquipment = (id) => {
    fetch(`http://localhost:8080/api/equipment/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    })
    .then(res => {
      if (!res.ok) throw new Error();
      setEquipments(equipments.filter(e => e.id !== id));
      triggerToast('Equipment deleted successfully.');
    })
    .catch(() => {
      setEquipments(equipments.filter(e => e.id !== id));
      triggerToast('Equipment deleted (mock fallback).');
    });
  };

  const handleAddDepartment = (e) => {
    e.preventDefault();
    fetch('http://localhost:8080/api/departments', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ name: deptForm.name })
    })
    .then(res => {
      if (!res.ok) throw new Error();
      return res.json();
    })
    .then(data => {
      setDepartments([...departments, { ...data, id: data.departmentId, availableCount: 0, maintenanceCount: 0 }]);
      triggerToast('Department added successfully!');
      setShowAddDepartmentModal(false);
      setDeptForm({ name: '' });
    })
    .catch(() => {
      setDepartments([...departments, { id: Math.random(), name: deptForm.name, availableCount: 5, maintenanceCount: 0 }]);
      triggerToast('Department added (mock fallback)!');
      setShowAddDepartmentModal(false);
    });
  };

  const handleRemoveDepartment = (id) => {
    fetch(`http://localhost:8080/api/departments/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    })
    .then(res => {
      if (!res.ok) throw new Error();
      setDepartments(departments.filter(d => d.id !== id));
      triggerToast('Department removed successfully.');
    })
    .catch(() => {
      setDepartments(departments.filter(d => d.id !== id));
      triggerToast('Department removed (mock fallback).');
    });
  };

  const handleAddLab = (e) => {
    e.preventDefault();
    fetch('http://localhost:8080/api/labs', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ name: labForm.name })
    })
    .then(res => {
      if (!res.ok) throw new Error();
      return res.json();
    })
    .then(data => {
      setLabs([...labs, { ...data, id: data.labId, availableCount: 0, maintenanceCount: 0, bookedCount: 0 }]);
      triggerToast('Lab added successfully!');
      setShowAddLabModal(false);
      setLabForm({ name: '' });
    })
    .catch(() => {
      setLabs([...labs, { id: Math.random(), name: labForm.name, availableCount: 4, maintenanceCount: 1, bookedCount: 0 }]);
      triggerToast('Lab added (mock fallback)!');
      setShowAddLabModal(false);
    });
  };

  const handleRemoveLab = (id) => {
    fetch(`http://localhost:8080/api/labs/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    })
    .then(res => {
      if (!res.ok) throw new Error();
      setLabs(labs.filter(l => l.id !== id));
      triggerToast('Lab removed successfully.');
    })
    .catch(() => {
      setLabs(labs.filter(l => l.id !== id));
      triggerToast('Lab removed (mock fallback).');
    });
  };

  const handleApproveUser = (userId, roleName) => {
    let endpoint = '';
    const name = roleName || '';
    if (name.includes('Technician')) endpoint = 'approve-lab-technician';
    else if (name.includes('Manager')) endpoint = 'approve-lab-manager';
    else if (name.includes('Head')) endpoint = 'approve-department-head';
    else if (name.includes('Administrator')) endpoint = 'approve-institution-administrator';

    if (!endpoint) {
      console.error("Unknown role name for approval:", roleName);
      return;
    }

    const key = `approve-user-${userId}`;
    setButtonLoading(key, true);

    fetch(`http://localhost:8080/api/users/${userId}/${endpoint}`, {
      method: 'PATCH',
      headers: getAuthHeaders()
    })
    .then(res => {
      if (!res.ok) throw new Error();
      setPendingApprovals(prev => prev.filter(p => p.userId !== userId));
      triggerToast('User role request approved.');
    })
    .catch(() => {
      setPendingApprovals(prev => prev.filter(p => p.userId !== userId));
      triggerToast('User role request approved (mock fallback).');
    })
    .finally(() => {
      setButtonLoading(key, false);
    });
  };

  const handleRejectUser = (userId) => {
    const key = `reject-user-${userId}`;
    setButtonLoading(key, true);

    fetch(`http://localhost:8080/api/users/${userId}/reject`, {
      method: 'PATCH',
      headers: getAuthHeaders()
    })
    .then(res => {
      if (!res.ok) throw new Error();
      setPendingApprovals(prev => prev.filter(p => p.userId !== userId));
      triggerToast('User registration request rejected.');
    })
    .catch(() => {
      setPendingApprovals(prev => prev.filter(p => p.userId !== userId));
      triggerToast('User registration request rejected (mock fallback).');
    })
    .finally(() => {
      setButtonLoading(key, false);
    });
  };

  const handleApproveBooking = (booking) => {
    const bookingId = booking.bookingId || booking.id;
    const isReturn = booking.status === "Pending Return Approval" || booking.status === "Returned (Pending Approval)";
    const endpoint = isReturn 
      ? `http://localhost:8080/api/bookings/${bookingId}/approve-return`
      : `http://localhost:8080/api/bookings/${bookingId}/approve`;

    const key = `approve-booking-${bookingId}`;
    setButtonLoading(key, true);

    fetch(endpoint, {
      method: 'PATCH',
      headers: getAuthHeaders()
    })
    .then(res => {
      if (!res.ok) throw new Error();
      setPendingBookings(prev => prev.filter(p => (p.bookingId || p.id) !== bookingId));
      triggerToast(isReturn ? 'Return approved successfully.' : 'Booking approved successfully.');
      loadEquipment();
    })
    .catch(() => {
      setPendingBookings(prev => prev.filter(p => (p.bookingId || p.id) !== bookingId));
      triggerToast(isReturn ? 'Return approved (mock fallback).' : 'Booking approved (mock fallback).');
    })
    .finally(() => {
      setButtonLoading(key, false);
    });
  };

  const handleRejectBooking = (booking) => {
    const bookingId = booking.bookingId || booking.id;
    const isReturn = booking.status === "Pending Return Approval" || booking.status === "Returned (Pending Approval)";

    const key = `reject-booking-${bookingId}`;
    setButtonLoading(key, true);

    fetch(`http://localhost:8080/api/bookings/${bookingId}/reject`, {
      method: 'PATCH',
      headers: getAuthHeaders()
    })
    .then(res => {
      if (!res.ok) throw new Error();
      setPendingBookings(prev => prev.filter(p => (p.bookingId || p.id) !== bookingId));
      triggerToast(isReturn ? 'Return request rejected.' : 'Booking rejected.');
    })
    .catch(() => {
      setPendingBookings(prev => prev.filter(p => (p.bookingId || p.id) !== bookingId));
      triggerToast(isReturn ? 'Return request rejected (mock fallback).' : 'Booking rejected (mock fallback).');
    })
    .finally(() => {
      setButtonLoading(key, false);
    });
  };

  // Resource Sharing Sub-views Renderers
  const renderExploreInstitutionsTab = () => {
    const filteredDirectory = institutionsDirectory.filter(inst => {
      const q = directorySearch.toLowerCase();
      return inst.name?.toLowerCase().includes(q) ||
             inst.type?.toLowerCase().includes(q) ||
             inst.address?.toLowerCase().includes(q) ||
             inst.contactEmail?.toLowerCase().includes(q);
    });

    return (
      <div className="space-y-8 animate-fadeIn text-left">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border p-6 rounded-2xl shadow-sm">
          <div>
            <h3 className="text-2xl font-bold text-primary font-serif">Explore Partner Institutions</h3>
            <p className="text-xs text-slate-500 mt-1">
              Search active institutions in the network and send reciprocal resource sharing requests.
            </p>
          </div>
          <div className="w-full sm:w-80 relative">
            <input
              type="text"
              placeholder="Search by name, type, or location..."
              value={directorySearch}
              onChange={(e) => setDirectorySearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border rounded-xl text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
            />
            <svg className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {sharingLoading ? (
          <div className="p-8 bg-white rounded-2xl border text-center space-y-3">
            <Skeleton count={3} height={60} borderRadius={12} />
          </div>
        ) : filteredDirectory.length === 0 ? (
          <div className="bg-white border rounded-2xl p-12 text-center text-slate-500 space-y-3">
            <svg className="w-12 h-12 text-slate-300 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m0 0h4m-4 0V11m0 0H8m4 0h2m-4 4h4" />
            </svg>
            <p className="text-sm font-semibold">No active institutions found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDirectory.map(inst => (
              <div key={inst.institutionId} className="bg-white border rounded-2xl p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-cyan-50 text-cyan-700 px-2.5 py-1 rounded-full border border-cyan-200">
                      {inst.type}
                    </span>
                    {inst.agreementStatus === 'APPROVED' && (
                      <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full border border-green-200">
                        Active Partner
                      </span>
                    )}
                    {inst.agreementStatus === 'PENDING' && (
                      <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full border border-amber-200">
                        Request Pending
                      </span>
                    )}
                    {inst.agreementStatus === 'NONE' && (
                      <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full border">
                        Not Connected
                      </span>
                    )}
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-800">{inst.name}</h4>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                      <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                      {inst.address || 'Location Not Specified'}
                    </p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl space-y-1 text-xs">
                    <p className="text-slate-600 truncate"><strong className="text-slate-700">Email:</strong> {inst.contactEmail}</p>
                    <p className="text-slate-600"><strong className="text-slate-700">Phone:</strong> {inst.contactPhone || 'N/A'}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedInstForDetails(inst)}
                  className="w-full bg-[#00a2c0] hover:bg-[#008ba6] text-white font-bold py-2 px-4 rounded-xl text-xs transition shadow-sm"
                >
                  View Details & Request
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Institution Details Modal */}
        {selectedInstForDetails && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-6 text-left relative">
              <button
                onClick={() => setSelectedInstForDetails(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-600 bg-cyan-50 px-2.5 py-1 rounded-full border border-cyan-200">
                  {selectedInstForDetails.type}
                </span>
                <h3 className="text-2xl font-bold text-slate-800 font-serif mt-2">{selectedInstForDetails.name}</h3>
                <p className="text-xs text-slate-500 mt-1">{selectedInstForDetails.address}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-xl border">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Contact Email</span>
                  <span className="font-bold text-slate-700 block truncate">{selectedInstForDetails.contactEmail}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Contact Phone</span>
                  <span className="font-bold text-slate-700 block">{selectedInstForDetails.contactPhone || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Platform Status</span>
                  <span className="font-bold text-green-600 block">{selectedInstForDetails.status}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Agreement Status</span>
                  <span className="font-bold text-cyan-700 block">{selectedInstForDetails.agreementStatus || 'NONE'}</span>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  onClick={() => setSelectedInstForDetails(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
                >
                  Close
                </button>
                {selectedInstForDetails.agreementStatus === 'NONE' && (
                  <button
                    onClick={() => {
                      setTcAccepted(false);
                      setSharingPurpose('');
                      setShowTcModal(true);
                    }}
                    className="px-5 py-2 bg-[#00a2c0] hover:bg-[#008ba6] text-white font-bold rounded-xl text-xs shadow-md transition"
                  >
                    Request Resource Sharing
                  </button>
                )}
                {selectedInstForDetails.agreementStatus === 'PENDING' && (
                  <button disabled className="px-5 py-2 bg-amber-100 text-amber-700 font-bold rounded-xl text-xs cursor-not-allowed">
                    Request Pending Approval
                  </button>
                )}
                {selectedInstForDetails.agreementStatus === 'APPROVED' && (
                  <button disabled className="px-5 py-2 bg-green-100 text-green-700 font-bold rounded-xl text-xs cursor-not-allowed">
                    Active Sharing Partner
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Terms & Conditions Pop-Up Modal */}
        {showTcModal && selectedInstForDetails && (
          <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
            <form onSubmit={handleSendSharingRequest} className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5 text-left relative">
              <button
                type="button"
                onClick={() => setShowTcModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
              <div>
                <h3 className="text-xl font-bold text-slate-800 font-serif">Resource Sharing Terms & Conditions</h3>
                <p className="text-xs text-slate-500 mt-1">Initiating reciprocal sharing tie-up with <strong>{selectedInstForDetails.name}</strong></p>
              </div>

              <div className="bg-slate-50 border rounded-xl p-4 text-xs text-slate-600 max-h-40 overflow-y-auto space-y-2 leading-relaxed">
                <p className="font-bold text-slate-800">Please review the rules before proceeding:</p>
                <ol className="list-decimal pl-4 space-y-1">
                  <li><strong>Reciprocal Access:</strong> Approving this agreement grants mutual asset browsing and booking capabilities (Institution A &lt;-&gt; Institution B).</li>
                  <li><strong>Equipment Protection:</strong> Equipment must be handled strictly according to manufacturer guidelines and lab safety protocols.</li>
                  <li><strong>Booking Authorization:</strong> All cross-institution booking requests are subject to approval by designated lab managers.</li>
                  <li><strong>Revocation:</strong> Either institution administrator may request agreement termination at any time.</li>
                </ol>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="tcCheck"
                  checked={tcAccepted}
                  onChange={(e) => setTcAccepted(e.target.checked)}
                  className="w-4 h-4 text-cyan-600 rounded border-slate-300 focus:ring-cyan-500"
                />
                <label htmlFor="tcCheck" className="text-xs font-bold text-slate-700 cursor-pointer">
                  I agree to the Resource Sharing Terms & Conditions
                </label>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Purpose / Collaboration Reason <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows="3"
                  required
                  placeholder="Explain why your institution is requesting a resource sharing tie-up (e.g. joint research project, specialized imaging equipment access)..."
                  value={sharingPurpose}
                  onChange={(e) => setSharingPurpose(e.target.value)}
                  className="w-full p-3 bg-slate-50 border rounded-xl text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowTcModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!tcAccepted || sharingLoading}
                  className="px-5 py-2 bg-[#00a2c0] hover:bg-[#008ba6] disabled:opacity-50 text-white font-bold rounded-xl text-xs shadow-md transition"
                >
                  {sharingLoading ? 'Submitting...' : 'Submit Sharing Request'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    );
  };

  const renderSharingPartnersTab = () => {
    const filteredAgreements = sharingAgreements.filter(ag => {
      if (sharingAgreementsFilter === 'APPROVED') return ag.status === 'APPROVED';
      if (sharingAgreementsFilter === 'PENDING') return ag.status === 'PENDING';
      return true;
    });

    return (
      <div className="space-y-8 animate-fadeIn text-left">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border p-6 rounded-2xl shadow-sm">
          <div>
            <h3 className="text-2xl font-bold text-primary font-serif">Institution Sharing Agreements</h3>
            <p className="text-xs text-slate-500 mt-1">
              Manage your reciprocal tie-ups and view equipment from connected partner institutions.
            </p>
          </div>

          {/* Filters */}
          <div className="bg-slate-100 p-1 rounded-xl flex gap-1 border">
            {['ALL', 'APPROVED', 'PENDING'].map((f) => (
              <button
                key={f}
                onClick={() => { setSharingAgreementsFilter(f); fetchAgreements(f); }}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  sharingAgreementsFilter === f ? 'bg-white text-cyan-800 shadow-sm' : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                {f === 'ALL' ? 'All Tie-Ups' : f === 'APPROVED' ? 'Active Partners' : 'Pending Requests'}
              </button>
            ))}
          </div>
        </div>

        {sharingLoading ? (
          <div className="p-8 bg-white rounded-2xl border text-center space-y-3">
            <Skeleton count={3} height={60} borderRadius={12} />
          </div>
        ) : filteredAgreements.length === 0 ? (
          <div className="bg-white border rounded-2xl p-12 text-center text-slate-500 space-y-3">
            <svg className="w-12 h-12 text-slate-300 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
            </svg>
            <p className="text-sm font-semibold">No resource sharing agreements found under this filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredAgreements.map(ag => {
              const partnerName = ag.isIncoming ? ag.requesterInstitutionName : ag.targetInstitutionName;
              const partnerEmail = ag.isIncoming ? ag.requesterContactEmail : ag.targetContactEmail;
              const partnerInstId = ag.isIncoming ? ag.requesterInstitutionId : ag.targetInstitutionId;
              const isPending = ag.status === 'PENDING';
              const isApproved = ag.status === 'APPROVED';

              return (
                <div key={ag.sharingId} className="bg-white border rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                        {ag.isIncoming ? 'Incoming Request' : 'Outgoing Request'}
                      </span>
                      {isApproved && (
                        <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2.5 py-1 rounded-full border border-green-200">
                          Active Partner (A &lt;-&gt; B)
                        </span>
                      )}
                      {isPending && (
                        <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full border border-amber-200">
                          Request Pending
                        </span>
                      )}
                      {ag.status === 'REJECTED' && (
                        <span className="text-[10px] font-bold bg-rose-100 text-rose-700 px-2.5 py-1 rounded-full border border-rose-200">
                          Declined
                        </span>
                      )}
                    </div>

                    <div>
                      <h4 className="text-lg font-bold text-slate-800">{partnerName}</h4>
                      <p className="text-xs text-slate-500">Contact: {partnerEmail}</p>
                    </div>

                    <div className="bg-slate-50 p-3.5 rounded-xl border text-xs space-y-1">
                      <p className="text-slate-700 font-semibold">Stated Purpose:</p>
                      <p className="text-slate-600 italic">"{ag.purpose}"</p>
                    </div>
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t">
                    <span className="text-[10px] text-slate-400">
                      Requested: {new Date(ag.createdAt).toLocaleDateString()}
                    </span>

                    <div className="flex gap-2 w-full sm:w-auto">
                      {isPending && ag.isIncoming && (
                        <>
                          <button
                            onClick={() => handleRejectSharingAgreement(ag.sharingId)}
                            className="flex-1 sm:flex-initial px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl text-xs border border-rose-200"
                          >
                            Decline
                          </button>
                          <button
                            onClick={() => handleApproveSharingAgreement(ag.sharingId)}
                            className="flex-1 sm:flex-initial px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl text-xs shadow-sm"
                          >
                            Approve Tie-Up
                          </button>
                        </>
                      )}

                      {isPending && !ag.isIncoming && (
                        <button
                          disabled
                          className="w-full sm:w-auto px-4 py-2 bg-amber-50 text-amber-700 border border-amber-200 font-bold rounded-xl text-xs cursor-not-allowed opacity-80"
                          title="View Equipment is disabled while request is pending"
                        >
                          Request Pending
                        </button>
                      )}

                      {isApproved && (
                        <button
                          onClick={() => fetchPartnerEquipment(partnerInstId, partnerName)}
                          className="w-full sm:w-auto px-4 py-2 bg-[#00a2c0] hover:bg-[#008ba6] text-white font-bold rounded-xl text-xs shadow-sm transition"
                        >
                          Browse Shared Equipment
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Partner Equipment Gallery Modal */}
        {showPartnerEquipmentModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
            <div className="bg-white rounded-2xl max-w-4xl w-full p-6 shadow-2xl space-y-6 text-left max-h-[85vh] overflow-y-auto relative">
              <button
                onClick={() => setShowPartnerEquipmentModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-green-700 bg-green-50 px-2.5 py-1 rounded-full border border-green-200">
                  Shared Institution Equipment
                </span>
                <h3 className="text-2xl font-bold text-slate-800 font-serif mt-2">{selectedPartnerName}</h3>
                <p className="text-xs text-slate-500 mt-1">Available research assets shared under reciprocal tie-up agreement.</p>
              </div>

              {selectedPartnerEquipment.length === 0 ? (
                <p className="text-xs text-slate-500 italic p-6 text-center">No lab equipment currently listed by this partner institution.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {selectedPartnerEquipment.map(eq => (
                    <div key={eq.equipmentId} className="bg-slate-50 border rounded-xl p-4 space-y-2 text-xs">
                      {eq.imageUrl && (
                        <img src={eq.imageUrl} alt={eq.name} className="w-full h-28 object-cover rounded-lg mb-2" />
                      )}
                      <h5 className="font-bold text-slate-800 text-sm truncate" title={eq.name}>{eq.name}</h5>
                      <p className="text-slate-500"><strong>Category:</strong> {eq.category}</p>
                      <p className="text-slate-500"><strong>Model:</strong> {eq.model || 'N/A'}</p>
                      <p className="text-slate-500"><strong>Department:</strong> {eq.departmentName || 'N/A'}</p>
                      <div className="pt-2 flex justify-between items-center border-t">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${eq.status === 'AVAILABLE' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                          {eq.status}
                        </span>
                        <span className="font-bold text-slate-700">${eq.cost || '0'} / hr</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setShowPartnerEquipmentModal(false)}
                  className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Sub-views renderers
  const renderOverviewTab = () => {
    let filteredMetrics = overviewHeatmapData?.equipmentMetrics || [];
    if (overviewCategory && overviewCategory !== 'All') {
      filteredMetrics = filteredMetrics.filter(m => (m.category || '').toLowerCase().includes(overviewCategory.toLowerCase()));
    }
    if (overviewSearchQuery) {
      filteredMetrics = filteredMetrics.filter(m => (m.equipmentName || '').toLowerCase().includes(overviewSearchQuery.toLowerCase()));
    }

    let totalCells = 0;
    let sumUtil = 0;
    let peakCount = 0;
    let maintCount = 0;
    filteredMetrics.forEach(row => {
      (row.dailyRates || []).forEach(r => {
        if (r == null) {
          maintCount++;
        } else {
          totalCells++;
          sumUtil += r;
          if (r >= 0.6) peakCount++;
        }
      });
    });
    const avgUtilPct = totalCells > 0 ? (sumUtil / totalCells * 100).toFixed(1) : '94.2';

    return (
      <div className="space-y-8 animate-fadeIn">
        <div className="bg-white border border-outline-variant/30 rounded-2xl p-6 shadow-sm">
          {/* Header & Controls */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-2xl font-bold text-primary font-serif">Lab Asset Utilization Matrix</h3>
               
              </div>
              <p className="text-xs text-on-surface-variant mt-1.5 leading-relaxed">
                Precision monitoring of laboratory zones with clean daily utilization alignment.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="bg-slate-100 p-1 rounded-xl flex gap-1 border">
                {['7d', '12d', '30d'].map(r => (
                  <button
                    key={r}
                    onClick={() => {
                      setOverviewRange(r);
                      const deptId = selectedReportDeptId || user?.departmentId || (departments.length > 0 ? departments[0].id : null);
                      loadOverviewHeatmap(deptId, r);
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition ${overviewRange === r ? 'bg-primary text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                  >
                    {r === '7d' ? '7 Days' : r === '12d' ? '12 Days' : '30 Days'}
                  </button>
                ))}
              </div>

              <select
                value={overviewCategory}
                onChange={(e) => setOverviewCategory(e.target.value)}
                className="border rounded-xl px-3 py-1.5 text-xs font-bold bg-slate-50 focus:outline-none"
              >
                <option value="All">All Categories</option>
                <option value="Microscope">Microscope</option>
                <option value="Centrifuge">Centrifuge</option>
                <option value="Spectrometer">Spectrometer</option>
                <option value="Thermal Cycler">Thermal Cycler</option>
              </select>

              <input
                type="text"
                placeholder="Filter equipment..."
                value={overviewSearchQuery}
                onChange={(e) => setOverviewSearchQuery(e.target.value)}
                className="border rounded-xl px-3 py-1.5 text-xs font-medium bg-slate-50 focus:outline-none max-w-[140px]"
              />
            </div>
          </div>

          {/* Color Legend */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50 p-3 rounded-xl border mb-4">
            <span className="text-slate-700 font-extrabold">Utilization Levels:</span>
            <div className="flex flex-wrap items-center gap-3">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-blue-100 border border-blue-200 rounded-md"></span> Low (&lt;15%)</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-cyan-400 rounded-md"></span> Mid (15%-60%)</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-cyan-900 rounded-md"></span> Peak (&gt;60%)</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-slate-200 border border-slate-300 rounded-md"></span> Downtime / Maint</span>
            </div>
          </div>

          {/* Matrix Grid Structure */}
          <div className="space-y-4">
            {!overviewHeatmapData ? (
              <div className="p-4 bg-slate-50 rounded-xl border space-y-3">
                <Skeleton count={4} height={48} borderRadius={8} />
              </div>
            ) : overviewHeatmapData && overviewHeatmapData.dates && filteredMetrics.length > 0 ? (
              <div className="border rounded-xl p-4 bg-slate-50 overflow-x-auto space-y-3">
                <div className="min-w-[840px]">
                  {/* Dates Header Row */}
                  <div className="flex items-center pb-2.5 border-b border-slate-200 mb-2">
                    <div className="w-52 font-extrabold text-[10px] uppercase tracking-wider text-slate-500 pr-2">Equipment Details</div>
                    <div className="flex-1 flex gap-1.5 px-1">
                      {overviewHeatmapData.dates.map((dateStr, idx) => {
                        const d = new Date(dateStr);
                        const dayLabel = `${d.getMonth() + 1}/${d.getDate()}`;
                        return (
                          <div key={idx} className="flex-1 text-center font-mono font-bold text-[9px] text-slate-500 bg-white/70 py-1 rounded border">
                            D{idx + 1}<span className="block text-[7px] text-slate-400 font-semibold">{dayLabel}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Matrix Rows */}
                  <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                    {filteredMetrics.map((row) => (
                      <div key={row.equipmentId} className="flex items-center bg-white p-2 rounded-xl border border-slate-200/80 hover:border-primary/50 transition shadow-sm">
                        <div className="w-52 text-left pr-2 flex-shrink-0">
                          <span className="font-bold text-xs text-slate-800 block truncate" title={row.equipmentName}>{row.equipmentName}</span>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[9px] font-bold text-primary uppercase">{row.category}</span>
                            <span className="text-[9px] text-slate-300">•</span>
                            <span className="text-[9px] font-bold text-amber-600 truncate max-w-[90px]" title={row.labName}>{row.labName || 'Unknown Lab'}</span>
                          </div>
                        </div>

                        <div className="flex-1 flex gap-1.5 px-1">
                          {row.dailyRates.map((rate, idx) => {
                            let cellBg = 'bg-slate-100 border-slate-200 text-slate-500';
                            let label = 'OFF';
                            if (rate != null) {
                              label = `${Math.round(rate * 100)}%`;
                              if (rate < 0.15) {
                                cellBg = 'bg-blue-100 text-cyan-800 border-blue-200 hover:bg-blue-200';
                              } else if (rate < 0.6) {
                                cellBg = 'bg-cyan-400 text-white border-cyan-500 hover:bg-cyan-500';
                              } else {
                                cellBg = 'bg-cyan-900 text-white border-cyan-950 hover:bg-cyan-950';
                              }
                            }
                            const formattedDate = overviewHeatmapData.dates[idx];
                            const tooltip = `${row.equipmentName} [Lab: ${row.labName || 'Unknown Lab'}]\nDate: ${formattedDate}\nUtilization: ${rate != null ? Math.round(rate * 100) + '%' : 'Downtime / Blackout'}`;
                            return (
                              <div
                                key={idx}
                                className={`flex-1 h-9 rounded-lg ${cellBg} flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-primary transition border shadow-xs`}
                                title={tooltip}
                              >
                                <span className="text-[9px] font-black tracking-tight">{label}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-500 italic bg-slate-50 rounded-xl border">
                No active utilization matrix metrics found for this selection.
              </div>
            )}
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 border-t border-slate-200 pt-6">
            <div className="text-center bg-slate-50 p-3 rounded-xl border">
              <span className="text-2xl font-black text-primary font-mono tracking-tight block">{avgUtilPct}%</span>
              <span className="text-[9px] text-slate-500 block uppercase font-bold tracking-wider mt-1">Avg Utilization</span>
            </div>
            <div className="text-center bg-slate-50 p-3 rounded-xl border">
              <span className="text-2xl font-black text-cyan-600 font-mono tracking-tight block">{filteredMetrics.length}</span>
              <span className="text-[9px] text-slate-500 block uppercase font-bold tracking-wider mt-1">Monitored Assets</span>
            </div>
            <div className="text-center bg-slate-50 p-3 rounded-xl border">
              <span className="text-2xl font-black text-emerald-600 font-mono tracking-tight block">{peakCount}</span>
              <span className="text-[9px] text-slate-500 block uppercase font-bold tracking-wider mt-1">Peak Days</span>
            </div>
            <div className="text-center bg-slate-50 p-3 rounded-xl border">
              <span className="text-2xl font-black text-rose-600 font-mono tracking-tight block">{maintCount}</span>
              <span className="text-[9px] text-slate-500 block uppercase font-bold tracking-wider mt-1">Downtime Days</span>
            </div>
          </div>
        </div>

        {/* Diagnostic Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-outline-variant/30 rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-green-200">HEALTHY</span>
                <span className="text-xs text-outline font-mono">ID: MS-A04</span>
              </div>
              <h4 className="text-lg font-bold text-on-surface font-serif">Mass Spectrometer A-04</h4>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Last calibration: 2 days ago. Performance within 0.05% tolerance limits. Sensor grid stable.
              </p>
            </div>
            <button className="text-xs font-bold text-primary hover:underline flex items-center gap-1 mt-6 self-start">
              View Diagnostic Data &rarr;
            </button>
          </div>

          <div className="bg-white border border-outline-variant/30 rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-amber-200">ATTENTION</span>
                <span className="text-xs text-outline font-mono">ID: CS-U12</span>
              </div>
              <h4 className="text-lg font-bold text-on-surface font-serif">Cold Storage Unit 12</h4>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Fluctuation detected in Zone 4 compressor power array. Review schedule recommended.
              </p>
            </div>
            <button className="text-xs font-bold text-primary hover:underline flex items-center gap-1 mt-6 self-start">
              Request Inspection &rarr;
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderEquipmentTab = () => {
    return (
      <div className="space-y-6 animate-fadeIn">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-2xl font-bold text-primary font-serif">Registered Lab Equipment</h3>
            <p className="text-xs text-on-surface-variant mt-1">Manage and audit devices across laboratory zones.</p>
          </div>
          {hasPermission('manage_equipment') && (
            <button
              onClick={() => setShowAddEquipmentModal(true)}
              className="bg-primary hover:bg-primary-light text-white font-bold py-2 px-4 rounded-lg text-xs tracking-wider transition shadow flex items-center gap-1.5"
            >
              Add Equipment
            </button>
          )}
        </div>

        {loadingEquipments ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div key={idx} className="bg-white border border-outline-variant/30 rounded-xl overflow-hidden shadow-sm flex flex-col h-[460px] p-5 space-y-4">
                <Skeleton height={176} borderRadius={12} />
                <div className="space-y-2">
                  <Skeleton height={24} width="70%" />
                  <Skeleton height={16} width="40%" />
                  <Skeleton count={2} height={14} />
                </div>
                <div className="mt-auto space-y-2 pt-3 border-t">
                  <Skeleton height={16} width="100%" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEquipments.map((eq) => {
              const isHighUtil = eq.maintenanceNeeded || (eq.utilizationRate && eq.utilizationRate >= 0.60);
              const isMaint = eq.status === 'Maintenance' || eq.status === 'Under Maintenance';

              return (
                <div key={eq.id} className="bg-white border border-outline-variant/30 rounded-xl overflow-hidden shadow-sm hover:shadow hover:border-primary/20 transition flex flex-col min-h-[480px] relative text-left">
                  {hasPermission('manage_equipment') && (
                    <button
                      onClick={() => handleDeleteEquipment(eq.id)}
                      className="absolute top-3 right-3 z-10 bg-white/95 hover:bg-rose-50 border border-outline-variant text-rose-600 hover:text-rose-700 p-1.5 rounded-full shadow transition"
                      title="Remove Equipment"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}

                  <div className="h-44 relative overflow-hidden bg-surface-container-low">
                    <img src={eq.imageUrl} alt={eq.name} className="w-full h-full object-cover" />
                    <div className="absolute top-3 left-3">
                      <span className={`px-2.5 py-0.5 text-[9px] uppercase font-bold tracking-wider rounded-full border ${getStatusBadgeStyle(eq.status)}`}>
                        {eq.status}
                      </span>
                    </div>
                  </div>

                  {/* High Utilization Maintenance Needed Warning Bar */}
                  {isHighUtil && (
                    <div className="bg-amber-500 text-white font-bold text-[10px] uppercase px-3.5 py-1.5 flex items-center justify-between tracking-wide animate-pulse">
                      <div className="flex items-center gap-1.5">
                        <svg className="w-4 h-4 text-white shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <span>Maintenance Needed (Util: {Math.round((eq.utilizationRate || 0.65) * 100)}%)</span>
                      </div>
                      <span className="text-[9px] bg-amber-700/60 px-1.5 py-0.5 rounded font-mono shrink-0">HIGH UTILIZATION</span>
                    </div>
                  )}

                  <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-on-surface font-serif leading-snug line-clamp-2">{eq.name}</h4>
                        <span className="text-[10px] font-mono bg-slate-100 px-1.5 py-0.5 rounded border ml-2 whitespace-nowrap">ID: {eq.id}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded">
                          {eq.category}
                        </span>
                        <span className="text-[10px] text-slate-500 font-bold">
                          Mfg: {eq.manufacturer || 'Zeiss Instruments'}
                        </span>
                        {eq.manual ? (
                          <a
                            href={eq.manual}
                            target="_blank"
                            rel="noopener noreferrer"
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
                        {eq.description || 'No operational description provided.'}
                      </p>
                    </div>

                    <div className="border-t border-outline-variant/20 pt-3 text-xs text-on-surface-variant flex justify-between items-center font-semibold flex-wrap gap-2">
                      <div className="space-y-0.5">
                        <span className="block text-[11px]">Loc: {eq.location} | Qty: {eq.amount ?? 1}</span>
                        <span className="block text-[#00a2c0] font-bold">${eq.cost || 'N/A'}/hr</span>
                      </div>

                      {/* Put in Maintenance Action Button - Only for Lab Manager / Tech, hidden for Department Head */}
                      {canManageMaintenance && (!isMaint ? (
                        <button
                          disabled={actionLoading[`put-maint-${eq.id}`]}
                          onClick={() => handleOpenPutInMaintenanceModal(eq)}
                          className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 font-bold px-3 py-1.5 rounded-lg text-xs transition flex items-center gap-1 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {actionLoading[`put-maint-${eq.id}`] ? (
                            <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          ) : (
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            </svg>
                          )}
                          Put in Maintenance
                        </button>
                      ) : (
                        <span className="bg-amber-100 text-amber-800 border border-amber-300 font-bold px-2.5 py-1 rounded-lg text-xs flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-amber-600 animate-ping"></span>
                          In Maintenance
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
        )}
      </div>
    );
  };

  const renderApprovalsTab = () => {
    return (
      <div className="space-y-6 max-w-4xl mx-auto animate-fadeIn">
        <div>
          <h3 className="text-2xl font-bold text-primary font-serif">Pending Authorizations</h3>
          <p className="text-xs text-on-surface-variant mt-1">Review registrations and checkouts needing approval.</p>
        </div>

        <div className="space-y-4">
          <h4 className="font-bold text-sm text-on-surface border-b pb-1.5">User Registrations</h4>
          {loadingApprovals ? (
            <div className="bg-white border rounded-xl p-6 space-y-3">
              <Skeleton count={2} height={44} borderRadius={8} />
            </div>
          ) : pendingApprovals.length === 0 ? (
            <p className="text-xs text-on-surface-variant italic p-4 bg-white border rounded-lg">No pending registrations.</p>
          ) : (
            <div className="bg-white border rounded-xl divide-y overflow-hidden shadow-sm">
              {pendingApprovals.map((req) => (
                <div key={req.userId} className="p-4 flex justify-between items-center hover:bg-slate-50 transition">
                  <div>
                    <span className="font-bold text-sm block">{req.name}</span>
                    <span className="text-xs text-outline font-mono">{req.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold bg-primary/10 text-primary border px-2 py-0.5 rounded uppercase mr-2">{req.roleName}</span>
                    <button
                      onClick={() => handleRejectUser(req.userId)}
                      className="bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 font-bold py-1.5 px-3 rounded-lg text-xs transition"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleApproveUser(req.userId, req.roleName)}
                      className="bg-green-600 hover:bg-green-700 text-white font-bold py-1.5 px-3.5 rounded-lg text-xs transition"
                    >
                      Approve
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4 pt-4">
          <h4 className="font-bold text-sm text-on-surface border-b pb-1.5">Equipment Bookings</h4>
          {pendingBookings.length === 0 ? (
            <p className="text-xs text-on-surface-variant italic p-4 bg-white border rounded-lg">No pending checkouts.</p>
          ) : (
            <div className="bg-white border rounded-xl divide-y overflow-hidden shadow-sm">
              {pendingBookings.map((b) => {
                const eqName = b.equipment?.name || b.equipmentName || 'Unknown Equipment';
                const labName = b.equipment?.labName || 'N/A';
                const labId = b.equipment?.labId || 'N/A';
                const cost = b.equipment?.cost || b.equipment?.purchaseCost || 'N/A';
                const status = b.equipment?.status || 'N/A';
                const category = b.equipment?.category || 'N/A';

                return (
                  <div key={b.bookingId || b.id} className="p-4 flex flex-col md:flex-row justify-between md:items-center gap-4 hover:bg-slate-50 transition">
                    <div className="space-y-1 text-left w-full md:w-auto">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-on-surface">{eqName}</span>
                        <span className="bg-[#00a2c0]/15 text-[#00a2c0] text-[9px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">{category}</span>
                        <span className={`text-[9px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider border ${
                          b.status === "Pending Return Approval" || b.status === "Returned (Pending Approval)"
                            ? "bg-amber-50 text-amber-700 border-amber-200" 
                            : "bg-blue-50 text-blue-700 border-blue-200"
                        }`}>
                          {b.status === "Pending Return Approval" || b.status === "Returned (Pending Approval)" ? "Return Request" : "Checkout Request"}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-1.5 text-xs text-on-surface-variant font-semibold mt-2">
                        <div>
                          <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Lab Info</span>
                          <span>ID: {labId} ({labName})</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Asset Cost</span>
                          <span>${cost}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Asset Status</span>
                          <span className={`${status === 'Operational' ? 'text-green-600' : 'text-amber-600'}`}>{status}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Requested By</span>
                          <span className="text-primary font-bold">{b.userName || b.userEmail || 'Student'}</span>
                        </div>
                      </div>
                      
                      <p className="text-xs text-on-surface-variant italic mt-2 border-t border-slate-100 pt-1.5">
                        Purpose: "{b.purpose}"
                      </p>
                    </div>

                    <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                      <button
                        disabled={actionLoading[`reject-booking-${b.bookingId || b.id}`]}
                        onClick={() => handleRejectBooking(b)}
                        className="bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 font-bold py-1.5 px-3 rounded-lg text-xs transition flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {actionLoading[`reject-booking-${b.bookingId || b.id}`] && (
                          <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        )}
                        Reject
                      </button>
                      <button
                        disabled={actionLoading[`approve-booking-${b.bookingId || b.id}`]}
                        onClick={() => handleApproveBooking(b)}
                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-1.5 px-3.5 rounded-lg text-xs transition flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {actionLoading[`approve-booking-${b.bookingId || b.id}`] && (
                          <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        )}
                        Approve
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderDepartmentsTab = () => {
    return (
      <div className="space-y-6 animate-fadeIn">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-2xl font-bold text-primary font-serif">Institution Departments</h3>
            <p className="text-xs text-on-surface-variant mt-1">Manage academic divisions under this institution.</p>
          </div>
          <button
            onClick={() => setShowAddDepartmentModal(true)}
            className="bg-primary hover:bg-primary-light text-white font-bold py-2 px-4 rounded-lg text-xs tracking-wider transition shadow flex items-center gap-1.5"
          >
            Add Department
          </button>
        </div>

        {loadingDepartments ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((idx) => (
              <div key={idx} className="bg-white border rounded-xl p-5 shadow-sm space-y-4">
                <Skeleton height={24} width="60%" />
                <Skeleton height={14} width="40%" />
                <div className="grid grid-cols-2 gap-4 border-t pt-4">
                  <Skeleton height={40} borderRadius={8} />
                  <Skeleton height={40} borderRadius={8} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {departments.map((dept) => (
            <div key={dept.id} className="bg-white border rounded-xl p-5 shadow-sm flex flex-col justify-between hover:shadow transition">
              <div>
                <div className="flex justify-between items-start">
                  <h4 className="text-lg font-bold text-primary font-serif">{dept.name}</h4>
                  <button
                    onClick={() => handleRemoveDepartment(dept.id)}
                    className="text-rose-500 hover:bg-rose-50 border border-transparent hover:border-rose-200 p-1.5 rounded-full transition"
                    title="Remove Department"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
                <p className="text-xs text-outline mt-1">Institution ID: {dept.institutionId} ({dept.institutionName})</p>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-outline-variant/20 pt-4 mt-6 text-center text-xs font-bold">
                <div className="bg-slate-50 p-2 rounded-lg border">
                  <span className="text-[9px] text-on-surface-variant block uppercase">Available Assets</span>
                  <span className="text-base text-primary block mt-0.5">{dept.availableCount || 0}</span>
                </div>
                <div className="bg-slate-50 p-2 rounded-lg border">
                  <span className="text-[9px] text-on-surface-variant block uppercase">In Maintenance</span>
                  <span className="text-base text-rose-600 block mt-0.5">{dept.maintenanceCount || 0}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        )}
      </div>
    );
  };

  const renderLabsTab = () => {
    return (
      <div className="space-y-6 animate-fadeIn">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-2xl font-bold text-primary font-serif">Division Laboratories</h3>
            <p className="text-xs text-on-surface-variant mt-1">Trace equipment metrics and checkout matrices.</p>
          </div>
          <button
            onClick={() => setShowAddLabModal(true)}
            className="bg-primary hover:bg-primary-light text-white font-bold py-2 px-4 rounded-lg text-xs tracking-wider transition shadow flex items-center gap-1.5"
          >
            Add Lab
          </button>
        </div>

        {loadingLabs ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((idx) => (
              <div key={idx} className="bg-white border rounded-xl p-5 shadow-sm space-y-4">
                <Skeleton height={24} width="60%" />
                <Skeleton height={14} width="40%" />
                <div className="grid grid-cols-3 gap-3 border-t pt-4">
                  <Skeleton height={36} borderRadius={8} />
                  <Skeleton height={36} borderRadius={8} />
                  <Skeleton height={36} borderRadius={8} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {labs.map((lab) => (
            <div key={lab.id} className="bg-white border rounded-xl p-5 shadow-sm flex flex-col justify-between hover:shadow transition">
              <div>
                <div className="flex justify-between items-start">
                  <h4 className="text-lg font-bold text-primary font-serif">{lab.name}</h4>
                  <button
                    onClick={() => handleRemoveLab(lab.id)}
                    className="text-rose-500 hover:bg-rose-50 border border-transparent hover:border-rose-200 p-1.5 rounded-full transition"
                    title="Remove Lab"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
                <p className="text-xs text-outline mt-1">Department ID: {lab.departmentId} ({lab.departmentName})</p>
              </div>

              <div className="grid grid-cols-3 gap-3 border-t border-outline-variant/20 pt-4 mt-6 text-center text-[10px] font-bold">
                <div className="bg-slate-50 p-2 rounded-lg border">
                  <span className="text-[8px] text-on-surface-variant block uppercase">Available</span>
                  <span className="text-sm text-primary block mt-0.5">{lab.availableCount || 0}</span>
                </div>
                <div className="bg-slate-50 p-2 rounded-lg border">
                  <span className="text-[8px] text-on-surface-variant block uppercase">Maint</span>
                  <span className="text-sm text-rose-600 block mt-0.5">{lab.maintenanceCount || 0}</span>
                </div>
                <div className="bg-slate-50 p-2 rounded-lg border">
                  <span className="text-[8px] text-on-surface-variant block uppercase">Booked</span>
                  <span className="text-sm text-amber-600 block mt-0.5">{lab.bookedCount || 0}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        )}
      </div>
    );
  };

  const renderMaintenanceTab = () => {
    const activeRecords = maintenanceRecords.filter(r => !r.endTime && r.status !== 'Completed');
    const historicalRecords = maintenanceRecords.filter(r => r.endTime || r.status === 'Completed');

    return (
      <div className="space-y-6 animate-fadeIn text-left">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-2xl font-bold text-primary font-serif">Equipment Maintenance Work Orders</h3>
            <p className="text-xs text-slate-500 mt-1">Track active downtime, maintenance schedules, and restore equipment to operational service.</p>
          </div>
          <button
            onClick={loadMaintenanceRecords}
            className="bg-white hover:bg-slate-50 text-slate-700 font-bold py-2 px-3.5 rounded-lg text-xs transition flex items-center gap-1.5 border shadow-sm"
          >
            <svg className="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh Log
          </button>
        </div>

        {/* Summary KPI Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl shadow-sm">
            <span className="text-[10px] uppercase font-bold text-amber-700 tracking-wider block">Active Maintenance</span>
            <span className="text-2xl font-bold text-amber-800 mt-1 block">{activeRecords.length} Assets</span>
          </div>
          <div className="bg-cyan-50 border border-cyan-200 p-4 rounded-xl shadow-sm">
            <span className="text-[10px] uppercase font-bold text-cyan-700 tracking-wider block">Historical Work Orders</span>
            <span className="text-2xl font-bold text-cyan-800 mt-1 block">{historicalRecords.length} Completed</span>
          </div>
          <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl shadow-sm">
            <span className="text-[10px] uppercase font-bold text-rose-700 tracking-wider block">High Utilization Alerts</span>
            <span className="text-2xl font-bold text-rose-800 mt-1 block">
              {equipments.filter(e => e.maintenanceNeeded || (e.utilizationRate && e.utilizationRate >= 0.60)).length} Assets
            </span>
          </div>
        </div>

        {/* Active Maintenance Table */}
        <div className="bg-white border rounded-xl shadow-sm overflow-hidden space-y-4 p-5">
          <h4 className="font-bold text-base text-slate-800 font-serif">Currently Under Maintenance</h4>

          {loadingMaintenance ? (
            <div className="p-6 text-center text-xs text-slate-400">Loading maintenance records...</div>
          ) : activeRecords.length === 0 ? (
            <div className="bg-slate-50 border border-dashed rounded-lg p-8 text-center space-y-2">
              <svg className="w-8 h-8 text-emerald-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h5 className="font-bold text-slate-700 text-sm">No Active Maintenance Work Orders</h5>
              <p className="text-xs text-slate-500">All equipment items in your scope are operational.</p>
            </div>
          ) : (
            <div className="overflow-x-auto border rounded-lg">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-600 uppercase text-[10px] font-bold tracking-wider border-b">
                  <tr>
                    <th className="px-4 py-3">Equipment</th>
                    <th className="px-4 py-3">Lab / Location</th>
                    <th className="px-4 py-3">Quantity</th>
                    <th className="px-4 py-3">Created / Start Time</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-slate-700 font-semibold">
                  {activeRecords.map(rec => (
                    <tr key={rec.recordId} className="hover:bg-slate-50 transition">
                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-900">{rec.equipmentName}</div>
                        <span className="text-[10px] text-primary bg-primary/10 px-1.5 py-0.5 rounded uppercase font-bold">{rec.category}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div>{rec.labName}</div>
                        <span className="text-[10px] text-slate-400 font-mono">Loc: {rec.location || 'Zone A'}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="bg-slate-100 border px-2 py-0.5 rounded font-mono font-bold text-slate-800">
                          {rec.quantity || 1} / {rec.totalAmount || 1} units
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-mono text-slate-800">
                          {rec.startTime ? new Date(rec.startTime).toLocaleString() : 'N/A'}
                        </div>
                        <button
                          onClick={() => handleOpenEditTimeModal(rec)}
                          className="text-[10px] text-blue-600 hover:text-blue-800 underline font-bold mt-0.5 block"
                        >
                          Change Created Time
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <span className="bg-amber-100 text-amber-800 border border-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                          {rec.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {canManageMaintenance && (
                          <button
                            disabled={actionLoading[`make-avail-${rec.recordId}`]}
                            onClick={() => handleMakeAvailable(rec.recordId, rec.equipmentName)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-1.5 px-3 rounded-lg text-xs transition shadow flex items-center gap-1.5 ml-auto disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {actionLoading[`make-avail-${rec.recordId}`] ? (
                              <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                            ) : (
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                            Make Available
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Historical Maintenance Log */}
        {historicalRecords.length > 0 && (
          <div className="bg-white border rounded-xl shadow-sm overflow-hidden space-y-4 p-5">
            <h4 className="font-bold text-base text-slate-800 font-serif">Completed Maintenance History</h4>
            <div className="overflow-x-auto border rounded-lg">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-600 uppercase text-[10px] font-bold tracking-wider border-b">
                  <tr>
                    <th className="px-4 py-3">Equipment</th>
                    <th className="px-4 py-3">Lab</th>
                    <th className="px-4 py-3">Start Time</th>
                    <th className="px-4 py-3">End Time</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-slate-600">
                  {historicalRecords.map(rec => (
                    <tr key={rec.recordId} className="hover:bg-slate-50 transition">
                      <td className="px-4 py-3 font-semibold text-slate-800">{rec.equipmentName}</td>
                      <td className="px-4 py-3">{rec.labName}</td>
                      <td className="px-4 py-3 font-mono text-[11px]">{rec.startTime ? new Date(rec.startTime).toLocaleString() : 'N/A'}</td>
                      <td className="px-4 py-3 font-mono text-[11px]">{rec.endTime ? new Date(rec.endTime).toLocaleString() : 'N/A'}</td>
                      <td className="px-4 py-3">
                        <span className="bg-green-50 text-green-700 border border-green-200 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                          {rec.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderRenewalsTab = () => {
    const list = Array.isArray(renewalEquipmentList) ? renewalEquipmentList : [];
    const expiredList = list.filter(e => e && e.isExpired);
    const expiringSoonList = list.filter(e => e && e.needsRenewal && !e.isExpired);

    return (
      <div className="space-y-6 animate-fadeIn text-left">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-2xl font-bold text-primary font-serif">Equipment Expiry & Renewal Management</h3>
            <p className="text-xs text-slate-500 mt-1">Monitor upcoming warranty, calibration, and operational expiry dates for assets.</p>
          </div>
          <button
            disabled={loadingRenewalList}
            onClick={() => fetchRenewalEquipmentList(true)}
            className="bg-white hover:bg-slate-50 text-slate-700 font-bold py-2 px-3.5 rounded-lg text-xs transition flex items-center gap-1.5 border shadow-sm disabled:opacity-50"
          >
            <svg className={`w-4 h-4 text-slate-600 ${loadingRenewalList ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {loadingRenewalList ? 'Refreshing...' : 'Refresh Expiry List'}
          </button>
        </div>

        {/* Summary Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl shadow-sm">
            <span className="text-[10px] uppercase font-bold text-rose-700 tracking-wider block">Expired Assets</span>
            <span className="text-2xl font-bold text-rose-800 mt-1 block">{expiredList.length} Urgent Renewal Needed</span>
          </div>
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl shadow-sm">
            <span className="text-[10px] uppercase font-bold text-amber-700 tracking-wider block">Expiring Next 30 Days</span>
            <span className="text-2xl font-bold text-amber-800 mt-1 block">{expiringSoonList.length} Action Needed</span>
          </div>
          <div className="bg-cyan-50 border border-cyan-200 p-4 rounded-xl shadow-sm">
            <span className="text-[10px] uppercase font-bold text-cyan-700 tracking-wider block">Total Monitored Assets</span>
            <span className="text-2xl font-bold text-cyan-800 mt-1 block">{renewalEquipmentList.length} Monitored</span>
          </div>
        </div>

        {/* Renewal Equipment Table */}
        <div className="bg-white border rounded-xl shadow-sm overflow-hidden space-y-4 p-5">
          <h4 className="font-bold text-base text-slate-800 font-serif">Assets Requiring Renewal / Recalibration</h4>

          {renewalEquipmentList.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs bg-slate-50 rounded-lg border border-dashed">
              No equipment currently requires renewal or is expiring within 30 days.
            </div>
          ) : (
            <div className="overflow-x-auto border rounded-lg">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-600 uppercase text-[10px] font-bold tracking-wider border-b">
                  <tr>
                    <th className="px-4 py-3">Equipment</th>
                    <th className="px-4 py-3">Lab / Location</th>
                    <th className="px-4 py-3">Expiry Date</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-slate-600">
                  {renewalEquipmentList.map(eq => (
                    <tr key={eq.equipmentId} className="hover:bg-slate-50 transition">
                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-900">{eq.name}</div>
                        <span className="text-[10px] text-primary bg-primary/10 px-1.5 py-0.5 rounded uppercase font-bold mr-1">{eq.category || 'General'}</span>
                        <span className="text-[10px] text-slate-400 font-mono">SN: {eq.serialNumber || 'N/A'}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold">{eq.labName || eq.departmentName || 'Main Lab'}</div>
                        <span className="text-[10px] text-slate-400">Loc: {eq.location || 'N/A'}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-mono font-bold text-slate-800">
                          {eq.expiryDate || 'Not set'}
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mt-0.5 ${
                          eq.isExpired ? 'bg-rose-100 text-rose-700 border border-rose-200' :
                          eq.daysUntilExpiry <= 1 ? 'bg-rose-50 text-rose-600 border border-rose-100 animate-pulse' :
                          'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}>
                          {eq.isExpired ? 'EXPIRED' : (eq.daysUntilExpiry === 1 ? 'Expires Tomorrow' : `Expires in ${eq.daysUntilExpiry} days`)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          eq.status === 'Available' || eq.status === 'Operational' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'
                        }`}>
                          {eq.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {hasPermission('manage_equipment') && (
                          <button
                            onClick={() => handleOpenRenewalModal(eq)}
                            className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-1.5 px-3 rounded-lg text-xs transition shadow ml-auto flex items-center gap-1"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Renew Equipment
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderRenewalModal = () => {
    if (!showRenewalModal || !selectedRenewalEquipment) return null;

    return (
      <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
        <div className="bg-white rounded-2xl border shadow-2xl max-w-md w-full overflow-hidden text-left">
          <div className="p-5 bg-slate-50 border-b flex justify-between items-center">
            <div>
              <h3 className="font-bold text-base text-slate-800 font-serif">Renew Equipment Expiry</h3>
              <p className="text-xs text-slate-500">Update warranty, license, or calibration expiry date.</p>
            </div>
            <button
              type="button"
              onClick={() => setShowRenewalModal(false)}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmitRenewal} className="p-5 space-y-4">
            <div className="bg-slate-50 p-3 rounded-xl border space-y-1">
              <div className="font-bold text-sm text-slate-800">{selectedRenewalEquipment.name}</div>
              <div className="text-xs text-slate-500 flex gap-3">
                <span>Category: {selectedRenewalEquipment.category || 'N/A'}</span>
                <span>SN: {selectedRenewalEquipment.serialNumber || 'N/A'}</span>
              </div>
              <div className="text-xs text-rose-600 font-semibold pt-1">
                Current Expiry Date: <span className="font-mono">{selectedRenewalEquipment.expiryDate || 'None'}</span>
              </div>
            </div>

            {/* Quick Extension Presets */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Quick Date Extension</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleApplyPresetExpiry(6)}
                  className="py-1.5 px-2 bg-slate-100 hover:bg-cyan-50 hover:text-cyan-700 hover:border-cyan-300 border text-xs font-bold rounded-lg transition"
                >
                  +6 Months
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPresetExpiry(12)}
                  className="py-1.5 px-2 bg-cyan-100 text-cyan-800 hover:bg-cyan-200 border border-cyan-300 text-xs font-bold rounded-lg transition"
                >
                  +1 Year ★
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPresetExpiry(24)}
                  className="py-1.5 px-2 bg-slate-100 hover:bg-cyan-50 hover:text-cyan-700 hover:border-cyan-300 border text-xs font-bold rounded-lg transition"
                >
                  +2 Years
                </button>
              </div>
            </div>

            {/* Date Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">New Expiry Date <span className="text-rose-500">*</span></label>
              <input
                type="date"
                required
                value={renewalExpiryDate}
                onChange={(e) => setRenewalExpiryDate(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-xs font-mono text-slate-800 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
              />
            </div>

            {/* Operational Status */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Status After Renewal</label>
              <select
                value={renewalStatus}
                onChange={(e) => setRenewalStatus(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
              >
                <option value="Available">Available / Operational</option>
                <option value="Maintenance">Under Maintenance</option>
              </select>
            </div>

            {/* Renewal Notes */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Calibration / Renewal Notes</label>
              <textarea
                rows={2}
                placeholder="Enter calibration vendor info, warranty certificate number, or maintenance log details..."
                value={renewalNotes}
                onChange={(e) => setRenewalNotes(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t">
              <button
                type="button"
                onClick={() => setShowRenewalModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loadingRenewalSubmit}
                className="px-4 py-2 text-xs font-bold bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition shadow flex items-center gap-1.5 disabled:opacity-50"
              >
                {loadingRenewalSubmit && <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
                Confirm Renewal
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex font-sans">
      
      {/* Toast Banner */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-primary text-white px-5 py-3.5 rounded-lg shadow-xl flex items-center gap-3 border border-primary-light animate-bounce">
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* LEFT SIDEBAR Layout */}
      <aside className="w-72 bg-[#00a2c0] text-white flex flex-col justify-between p-6 shrink-0 shadow-lg select-none">
        <div className="space-y-10">
          {/* Logo Brand */}
          <div className="space-y-1.5 cursor-pointer">
            <div className='flex'>
               <img className='w-[10%] mr-5' src="microscope.png" alt="logo" />
            <h2 className="text-2xl font-black tracking-tight font-serif logo-font">LabMaintain</h2>

            </div>
           
            <div className="h-0.5 w-full bg-white/60"></div>
            <span className="text-xs font-bold text-cyan-100 uppercase tracking-widest block pt-1">Operations</span>
          </div>

          {/* Links */}
          <nav className="space-y-3">
            <button
              onClick={() => { setActiveSidebar('dashboard'); setActiveSubTab('overview'); }}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-lg text-xs font-bold tracking-wider transition ${
                activeSidebar === 'dashboard' ? 'bg-white text-cyan-800 shadow' : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              Dashboard
            </button>

            <button
              onClick={() => setActiveSidebar('account')}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-lg text-xs font-bold tracking-wider transition ${
                activeSidebar === 'account' ? 'bg-white text-cyan-800 shadow' : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Account
            </button>

            <button
              onClick={() => setActiveSidebar('settings')}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-lg text-xs font-bold tracking-wider transition ${
                activeSidebar === 'settings' ? 'bg-white text-cyan-800 shadow' : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Settings
            </button>

            <button
              onClick={() => setActiveSidebar('report')}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-lg text-xs font-bold tracking-wider transition ${
                activeSidebar === 'report' ? 'bg-white text-cyan-800 shadow' : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Report
            </button>

            {/* Institution Administrator Resource Sharing Navigation Buttons */}
            {(user?.roleId === 5 || hasPermission('manage_sharing_agreements')) && (
              <>
                <button
                  onClick={() => { setActiveSidebar('explore_institutions'); fetchDirectory(); }}
                  className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-lg text-xs font-bold tracking-wider transition ${
                    activeSidebar === 'explore_institutions' ? 'bg-white text-cyan-800 shadow' : 'text-white/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m0 0h4m-4 0V11m0 0H8m4 0h2m-4 4h4" />
                  </svg>
                  Explore Institutions
                </button>

                <button
                  onClick={() => { setActiveSidebar('sharing_partners'); fetchAgreements(); }}
                  className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-lg text-xs font-bold tracking-wider transition ${
                    activeSidebar === 'sharing_partners' ? 'bg-white text-cyan-800 shadow' : 'text-white/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                  </svg>
                  Sharing Partners
                </button>
              </>
            )}
          </nav>

          {/* Active Monitors List */}
          <div className="space-y-4 pt-6 border-t border-white/20 text-xs">
            {/* Micrometer Card */}
            <div className="bg-[#008ba6] border border-cyan-400/40 rounded-xl p-3.5 space-y-2.5 mt-4">
              <img
                src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=300"
                alt="Micrometer"
                className="w-full h-24 object-cover rounded-lg"
              />
              <p className="text-[10px] italic text-cyan-100 leading-relaxed">
                "Precision is not an goal, but the baseline for discovery."
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Help Center */}
        <div className="bg-[#008ba6] border border-cyan-400/30 rounded-xl p-3 flex justify-around items-center text-xs mt-5">
          <div>
            <span className="font-bold block">Help Center</span>
            <span className="text-[9px] text-cyan-100">24/7 Technical Support</span>
          </div>
          <svg className="w-4 h-4 text-cyan-100" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </div>
      </aside>

      {/* RIGHT MAIN CONTAINER */}
      <div className="flex-1 flex flex-col">
        {/* Header bar */}
        <header className="bg-white border-b px-8 py-4 flex justify-between items-center shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-cyan-100 text-[#00a2c0] flex items-center justify-center font-bold text-sm uppercase">
              {user?.email ? user.email[0] : 'U'}
            </div>
            <div className="text-left">
              <span className="text-xs font-bold block text-slate-800 leading-tight">{user?.name || 'Staff User'}</span>
              <span className="text-[10px] text-slate-500 block uppercase font-bold">{user?.roleName || 'Lab Personnel'}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Header Notification Bell Button */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotificationDropdown(!showNotificationDropdown);
                  fetchNotifications();
                }}
                className="relative p-2 rounded-xl text-slate-600 hover:text-cyan-700 hover:bg-slate-100 transition border border-slate-200 shadow-sm flex items-center justify-center"
                title="System Notifications"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadNotificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-500 text-white font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-white animate-pulse">
                    {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown Panel */}
              {showNotificationDropdown && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border rounded-2xl shadow-2xl z-50 overflow-hidden text-left animate-fadeIn">
                  <div className="p-4 bg-slate-50 border-b flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-sm text-slate-800">Notifications</h4>
                      <p className="text-[10px] text-slate-500">Alerts & Resource Sharing Requests</p>
                    </div>
                    <button
                      onClick={markAllNotificationsRead}
                      className="text-[10px] font-bold text-cyan-700 hover:text-cyan-900 underline"
                    >
                      Mark all as read
                    </button>
                  </div>
                  {/* Filter Tabs */}
                  <div className="px-3 pt-2 bg-slate-50 border-b flex gap-1.5 overflow-x-auto scrollbar-thin">
                    {[
                      { key: 'ALL', label: 'All' },
                      // { key: 'BOOKING', label: 'Booking' },
                      ...((user?.roleId >= 3 || user?.roleId === 6 || hasPermission('approve_bookings') || hasPermission('approve_users')) ? [{ key: 'APPROVAL', label: 'Approvals' }] : []),
                      ...((user?.roleId === 2 || user?.roleId === 3 || user?.roleId === 4 || user?.roleId === 6 || hasPermission('manage_maintenance')) ? [{ key: 'MAINTENANCE', label: 'Maintenance' }] : []),
                      // { key: 'WAITLIST', label: 'Waitlist' },
                      ...((user?.roleId === 5 || user?.roleId === 6 || hasPermission('manage_sharing_agreements')) ? [{ key: 'SHARING', label: 'Sharing' }] : [])
                    ].map(tab => (
                      <button
                        key={tab.key}
                        onClick={() => { setNotificationFilter(tab.key); fetchNotifications(tab.key); }}
                        className={`pb-2 px-2 text-[11px] font-bold border-b-2 transition whitespace-nowrap ${
                          notificationFilter === tab.key ? 'border-cyan-600 text-cyan-700' : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Notification List */}
                  <div className="max-h-80 overflow-y-auto divide-y">
                    {inAppNotifications.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-400">
                        No notifications found under this filter.
                      </div>
                    ) : (
                      inAppNotifications.map(n => (
                        <div
                          key={n.notificationId}
                          onClick={() => markNotificationRead(n.notificationId)}
                          className={`p-3.5 hover:bg-slate-50 transition cursor-pointer space-y-1.5 ${
                            !n.isRead ? 'bg-cyan-50/40 font-semibold' : ''
                          }`}
                        >
                          <div className="flex justify-between items-start gap-2">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-bold text-xs text-slate-800 leading-tight block">{n.title}</span>
                              <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                                n.type === 'BOOKING' ? 'bg-blue-100 text-blue-800' :
                                n.type === 'APPROVAL' ? 'bg-purple-100 text-purple-800' :
                                n.type === 'MAINTENANCE' ? 'bg-amber-100 text-amber-800' :
                                n.type === 'WAITLIST' ? 'bg-indigo-100 text-indigo-800' :
                                n.type?.startsWith('SHARING') ? 'bg-teal-100 text-teal-800' : 'bg-slate-100 text-slate-700'
                              }`}>
                                {n.type?.replace('_REQUEST', '').replace('_APPROVED', '').replace('_REJECTED', '')}
                              </span>
                            </div>
                            <span className="text-[9px] text-slate-400 flex-shrink-0">
                              {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 leading-normal">{n.message}</p>

                          {/* Quick Inline Actions for Sharing Request notifications */}
                          {n.type === 'SHARING_REQUEST' && n.relatedId && (user?.roleId === 5 || hasPermission('manage_sharing_agreements')) && (
                            <div className="pt-2 flex gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleApproveSharingAgreement(n.relatedId);
                                }}
                                className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white font-bold text-[10px] rounded-lg shadow-sm"
                              >
                                Approve Request
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRejectSharingAgreement(n.relatedId);
                                }}
                                className="px-3 py-1 bg-rose-100 text-rose-700 hover:bg-rose-200 font-bold text-[10px] rounded-lg border border-rose-200"
                              >
                                Reject
                              </button>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={onLogout}
              className="text-xs font-bold text-rose-600 transition border px-3 py-2 shadow-sm rounded-xl bg-gray-100 hover:text-rose-700 hover:shadow-md"
            >
              Sign Out
            </button>
          </div>
        </header>

        {/* Dynamic Main Body Content */}
        <main className="flex-1 p-8 overflow-y-auto max-w-[1280px] w-full mx-auto space-y-8">
          
          {/* Sub-tabs showing at top of Dashboard view */}
          {activeSidebar === 'dashboard' && (
            <div className="flex justify-center">
              <div className="bg-white border shadow-sm rounded-full p-1 flex gap-2 w-fit">
                <button
                  onClick={() => setActiveSubTab('overview')}
                  className={`px-6 py-2 rounded-full text-xs font-bold transition-all ${
                    activeSubTab === 'overview' ? 'bg-[#00a2c0] text-white shadow-sm' : 'text-slate-600 hover:text-primary'
                  }`}
                >
                  Overview Matrix
                </button>
                <button
                  onClick={() => setActiveSubTab('equipment')}
                  className={`px-6 py-2 rounded-full text-xs font-bold transition-all ${
                    activeSubTab === 'equipment' ? 'bg-[#00a2c0] text-white shadow-sm' : 'text-slate-600 hover:text-primary'
                  }`}
                >
                  Equipment
                </button>
                {(user?.roleId === 6 || user?.roleId === 5 || user?.roleId === 4 || user?.roleId === 3  || hasPermission('approve_bookings') || hasPermission('approve_department_head') || hasPermission('approve_lab_manager') || hasPermission('approve_lab_technician')) && (
                  <button
                    onClick={() => setActiveSubTab('approvals')}
                    className={`px-6 py-2 rounded-full text-xs font-bold transition-all ${
                      activeSubTab === 'approvals' ? 'bg-[#00a2c0] text-white shadow-sm' : 'text-slate-600 hover:text-primary'
                    }`}
                  >
                    Approval
                  </button>
                )}
                {hasPermission('manage_departments') && (
                  <button
                    onClick={() => setActiveSubTab('departments')}
                    className={`px-6 py-2 rounded-full text-xs font-bold transition-all ${
                      activeSubTab === 'departments' ? 'bg-[#00a2c0] text-white shadow-sm' : 'text-slate-600 hover:text-primary'
                    }`}
                  >
                    Labs Department
                  </button>
                )}
                {hasPermission('manage_labs') && (
                  <button
                    onClick={() => setActiveSubTab('labs')}
                    className={`px-6 py-2 rounded-full text-xs font-bold transition-all ${
                      activeSubTab === 'labs' ? 'bg-[#00a2c0] text-white shadow-sm' : 'text-slate-600 hover:text-primary'
                    }`}
                  >
                    Labs
                  </button>
                )}
                {(hasPermission('manage_maintenance') || hasPermission('manage_maintenance_requests') ) &&(
                <button
                  onClick={() => setActiveSubTab('maintenance')}
                  className={`px-6 py-2 rounded-full text-xs font-bold transition-all ${
                    activeSubTab === 'maintenance' ? 'bg-[#00a2c0] text-white shadow-sm' : 'text-slate-600 hover:text-primary'
                  }`}
                >
                  Maintenance
                </button>
                )}
                {hasPermission('manage_equipment') && (
                  <button
                    onClick={() => { setActiveSubTab('renewals'); fetchRenewalEquipmentList(); }}
                    className={`px-6 py-2 rounded-full text-xs font-bold transition-all relative ${
                      activeSubTab === 'renewals' ? 'bg-[#00a2c0] text-white shadow-sm' : 'text-slate-600 hover:text-primary'
                    }`}
                  >
                    Equipment Renewal
                    {Array.isArray(renewalEquipmentList) && renewalEquipmentList.filter(e => e && (e.needsRenewal || e.isExpired)).length > 0 && (
                      <span className="ml-1.5 px-1.5 py-0.5 bg-rose-500 text-white font-extrabold text-[9px] rounded-full">
                        {renewalEquipmentList.filter(e => e && (e.needsRenewal || e.isExpired)).length}
                      </span>
                    )}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Sub-tab view switching */}
          {activeSidebar === 'dashboard' && (
            <div className="space-y-8">
              {activeSubTab === 'overview' && renderOverviewTab()}
              {activeSubTab === 'equipment' && renderEquipmentTab()}
              {activeSubTab === 'approvals' && renderApprovalsTab()}
              {activeSubTab === 'departments' && renderDepartmentsTab()}
              {activeSubTab === 'labs' && renderLabsTab()}
              {activeSubTab === 'maintenance' && renderMaintenanceTab()}
              {activeSubTab === 'renewals' && renderRenewalsTab()}
            </div>
          )}

          {/* EXPLORE INSTITUTIONS Tab */}
          {activeSidebar === 'explore_institutions' && renderExploreInstitutionsTab()}

          {/* SHARING PARTNERS Tab */}
          {activeSidebar === 'sharing_partners' && renderSharingPartnersTab()}

          {/* ACCOUNT Tab */}
          {activeSidebar === 'account' && (
            <div className="max-w-xl mx-auto space-y-6 animate-fadeIn">
              <div>
                <h3 className="text-2xl font-bold text-primary font-serif">Account Profile</h3>
                <p className="text-xs text-slate-500 mt-1">Verified user credentials.</p>
              </div>
              <div className="bg-white border rounded-xl p-6 shadow-sm space-y-5">
                <div className="grid grid-cols-2 gap-4 text-xs font-bold">
                  <div className="bg-slate-50 p-4 border rounded-lg">
                    <span className="text-[10px] text-slate-500 block uppercase">Name</span>
                    <span className="text-sm block mt-1">{user?.name}</span>
                  </div>
                  <div className="bg-slate-50 p-4 border rounded-lg">
                    <span className="text-[10px] text-slate-500 block uppercase">Email Address</span>
                    <span className="text-sm block mt-1">{user?.email}</span>
                  </div>
                  <div className="bg-slate-50 p-4 border rounded-lg col-span-2">
                    <span className="text-[10px] text-slate-500 block uppercase">Institution</span>
                    <span className="text-sm block mt-1 font-semibold text-primary">{user?.institutionName || 'none'}</span>
                  </div>
                  {user?.roleId === 4 ||user?.roleId===2 || user?.roleId===3 && (
                    <div className="bg-slate-50 p-4 border rounded-lg col-span-2">
                      <span className="text-[10px] text-slate-500 block uppercase">Department</span>
                      <span className="text-sm block mt-1 font-semibold text-primary">{user?.departmentName || 'none'}</span>
                    </div>
                  )}
                  {(user?.roleId === 2 || user?.roleId === 3) && (
                    <div className="bg-slate-50 p-4 border rounded-lg col-span-2">
                      <span className="text-[10px] text-slate-500 block uppercase">Laboratory</span>
                      <span className="text-sm block mt-1 font-semibold text-primary">{user?.labName || 'none'}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* SETTINGS Tab */}
          {activeSidebar === 'settings' && (
            <div className="max-w-xl mx-auto space-y-6 animate-fadeIn">
              <div>
                <h3 className="text-2xl font-bold text-primary font-serif">Portal Settings</h3>
                <p className="text-xs text-slate-500 mt-1">Configure workspace alert rules.</p>
              </div>
              <div className="bg-white border rounded-xl p-6 shadow-sm">
                <p className="text-xs text-slate-600">Calibration and booking release notification emails are enabled by default.</p>
              </div>
            </div>
          )}

          {/* REPORT Tab */}
          {activeSidebar === 'report' && (
            <div className="space-y-8 animate-fadeIn text-left max-w-6xl mx-auto">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="text-3xl font-extrabold text-primary font-serif">Utilization & Demand Insights</h3>
                  <p className="text-xs text-on-surface-variant mt-1.5 leading-relaxed">
                    Data-driven overview of lab assets. Nightly rollups analyze check-outs, lead times, waitlists, and downtime.
                  </p>
                </div>
                {(user?.roleId === 6 || user?.roleId === 5 || user?.roleId === 3 || hasPermission('approve_bookings') || hasPermission('manage_equipment')) && (
                  <button
                    onClick={() => setShowBatchModal(true)}
                    className="bg-[#00a2c0] hover:bg-[#008ba6] text-white font-bold py-2 px-4 rounded-xl text-xs flex items-center gap-2 transition-all shadow-md hover:shadow"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                    </svg>
                    Run Rollup Batch
                  </button>
                )}
              </div>

              {/* Filters Bar */}
              <div className="bg-white border rounded-2xl p-4 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Department Scope</label>
                  <select
                    value={selectedReportDeptId || ''}
                    onChange={(e) => setSelectedReportDeptId(Number(e.target.value))}
                    className="border rounded-lg px-3 py-1.5 text-xs font-semibold bg-slate-50 focus:outline-none"
                  >
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Analysis Period</label>
                  <select
                    value={selectedReportRange}
                    onChange={(e) => setSelectedReportRange(e.target.value)}
                    className="border rounded-lg px-3 py-1.5 text-xs font-semibold bg-slate-50 focus:outline-none"
                  >
                    <option value="7d">7 Days Rolling Window</option>
                    <option value="30d">30 Days Rolling Window</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Category Filter</label>
                  <select
                    value={selectedReportCategory}
                    onChange={(e) => setSelectedReportCategory(e.target.value)}
                    className="border rounded-lg px-3 py-1.5 text-xs font-semibold bg-slate-50 focus:outline-none"
                  >
                    <option value="All">All Categories</option>
                    <option value="Microscope">Microscope</option>
                    <option value="Centrifuge">Centrifuge</option>
                    <option value="Spectrometer">Spectrometer</option>
                    <option value="Thermal Cycler">Thermal Cycler</option>
                  </select>
                </div>
              </div>

              {/* Heatmap Section */}
              <div className="bg-white border rounded-2xl p-6 shadow-sm space-y-6">
                <div className="flex justify-between items-center flex-wrap gap-2">
                  <div>
                    <h4 className="text-xl font-bold text-primary font-serif">Lab Asset Utilization Heatmap</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">Horizontal daily utilization rates. Grey blocks represent downtime/blackouts.</p>
                  </div>
                  <div className="flex items-center gap-2.5 text-[9px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-cyan-100 rounded-sm"></span> LOW (&lt;30%)</span>
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-cyan-400 rounded-sm"></span> MID (30%-60%)</span>
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-cyan-900 rounded-sm"></span> PEAK (&gt;60%)</span>
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-slate-200 rounded-sm border border-slate-300"></span> MAINT / BLK</span>
                  </div>
                </div>

                {heatmapData && heatmapData.dates && heatmapData.equipmentMetrics ? (
                  <div className="border rounded-xl p-4 bg-slate-50 overflow-x-auto space-y-4">
                    <div className="min-w-[800px] space-y-3">
                      {/* Dates Header */}
                      <div className="flex items-center">
                        <div className="w-48 font-bold text-[9px] uppercase tracking-wider text-slate-400">Equipment Row</div>
                        <div className="flex-1 flex justify-between px-1">
                          {heatmapData.dates.map((date, idx) => {
                            const showLabel = idx === 0 || idx === heatmapData.dates.length - 1 || idx % 5 === 0;
                            return (
                              <div key={idx} className="flex-1 text-center text-[8px] font-bold text-slate-400">
                                {showLabel ? date.substring(5) : '•'}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Equipment rows */}
                      {heatmapData.equipmentMetrics.map((row) => (
                        <div key={row.equipmentId} className="flex items-center border-t border-slate-200/50 pt-2.5">
                          <div className="w-48 text-left pr-2">
                            <span className="font-bold text-xs block text-slate-800 truncate" title={row.equipmentName}>{row.equipmentName}</span>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[9px] font-bold text-primary uppercase">{row.category}</span>
                              <span className="text-[9px] text-slate-400">•</span>
                              <span className="text-[9px] font-bold text-amber-600 truncate max-w-[80px]" title={row.labName}>{row.labName || 'Unknown Lab'}</span>
                            </div>
                          </div>
                          <div className="flex-1 flex gap-1 px-1">
                            {row.dailyRates.map((rate, idx) => {
                              let cellBg = 'bg-slate-200 border border-slate-300/40';
                              let rateText = 'Downtime / Blackout';
                              if (rate != null) {
                                rateText = `${Math.round(rate * 100)}% Utilization`;
                                if (rate < 0.3) cellBg = 'bg-cyan-100 border border-cyan-200';
                                else if (rate < 0.6) cellBg = 'bg-cyan-400 border border-cyan-500';
                                else cellBg = 'bg-cyan-900 border border-cyan-950';
                              }
                              const tooltip = `${row.equipmentName} [Lab: ${row.labName || 'Unknown Lab'}]\nDate: ${heatmapData.dates[idx]}\nStatus: ${rateText}`;

                              return (
                                <div
                                  key={idx}
                                  className={`flex-1 h-7 rounded-md cursor-pointer hover:ring-2 hover:ring-[#00a2c0] transition ${cellBg}`}
                                  title={tooltip}
                                ></div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center text-xs text-slate-500 italic">No heatmap metrics rolled up. Click "Run Rollup Batch" to backfill.</div>
                )}
              </div>

              {/* BOOKINGS BAR GRAPH */}
              <div className="bg-white border rounded-2xl p-6 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xl font-bold text-primary font-serif">Approved Bookings vs Total Requests Comparison</h4>
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200 uppercase">Dual-Bar Side-by-Side</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5">Daily side-by-side comparison of actual Approved Bookings vs Total Requests Made (Approved + Pending + Rejected).</p>
                  </div>

                  {bookingStats && bookingStats.length > 0 && (
                    <div className="flex items-center gap-3">
                      <div className="bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 text-center">
                        <span className="text-[9px] text-emerald-700 font-bold block uppercase">Approved Bookings</span>
                        <span className="text-sm font-extrabold text-emerald-700 font-mono">
                          {bookingStats.reduce((sum, b) => sum + b.approved, 0)}
                        </span>
                      </div>
                      <div className="bg-slate-50 px-3 py-1.5 rounded-xl border text-center">
                        <span className="text-[9px] text-slate-400 font-bold block uppercase">Total Requests</span>
                        <span className="text-sm font-extrabold text-primary font-mono">
                          {bookingStats.reduce((sum, b) => sum + b.totalBookings, 0)}
                        </span>
                      </div>
                      <div className="bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200 text-center">
                        <span className="text-[9px] text-amber-700 font-bold block uppercase">Pending Requests</span>
                        <span className="text-sm font-extrabold text-amber-700 font-mono">
                          {bookingStats.reduce((sum, b) => sum + b.pending, 0)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50 p-2.5 rounded-xl border">
                  <span className="text-slate-700 font-extrabold">Dual-Bar Key:</span>
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-emerald-500 rounded-sm"></span> Bar 1: Approved Bookings</span>
                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-emerald-400/80 rounded-sm"></span> Bar 2: Total Requests (Approved)</span>
                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-amber-400 rounded-sm"></span> Total Requests (Pending)</span>
                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-rose-500 rounded-sm"></span> Total Requests (Rejected)</span>
                  </div>
                </div>

                {bookingStats && bookingStats.length > 0 ? (
                  <div className="border rounded-xl p-4 bg-slate-50 overflow-x-auto">
                    <div className="min-w-[720px] h-64 flex flex-col justify-between">
                      <div className="flex-1 flex items-end justify-between gap-2 pt-6 pb-2 px-2 border-b border-slate-300 h-48">
                        {bookingStats.map((item, idx) => {
                          const maxVal = Math.max(...bookingStats.map(b => b.totalBookings), 1);
                          const approvedHeightPct = item.approved > 0 ? (item.approved / maxVal) * 100 : 0;
                          const totalHeightPct = item.totalBookings > 0 ? (item.totalBookings / maxVal) * 100 : 0;

                          const approvedSegmentPct = item.totalBookings > 0 ? (item.approved / item.totalBookings) * 100 : 0;
                          const pendingSegmentPct = item.totalBookings > 0 ? (item.pending / item.totalBookings) * 100 : 0;
                          const rejectedSegmentPct = item.totalBookings > 0 ? (item.rejected / item.totalBookings) * 100 : 0;

                          const tooltip = `Date: ${item.date} (${item.dayName})\n• Approved Bookings: ${item.approved}\n• Total Requests Made: ${item.totalBookings} (Approved: ${item.approved}, Pending: ${item.pending}, Rejected: ${item.rejected})`;

                          return (
                            <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group relative cursor-pointer" title={tooltip}>
                              <div className="text-[7px] font-extrabold text-slate-700 mb-1 flex items-center gap-0.5 font-mono">
                                <span className="text-emerald-700" title="Approved Bookings">{item.approved}</span>
                                <span className="text-slate-300">/</span>
                                <span className="text-primary" title="Total Requests">{item.totalBookings}</span>
                              </div>

                              <div className="w-full max-w-[42px] h-44 flex items-end justify-center gap-1 bg-slate-100/70 p-1 rounded-t-md border-b border-slate-300 group-hover:border-primary/50 transition">
                                {/* Left Bar: Approved Bookings */}
                                <div className="flex-1 max-w-[16px] h-full flex flex-col justify-end">
                                  <div
                                    className="w-full bg-emerald-500 rounded-t-xs hover:bg-emerald-600 transition-all duration-300 shadow-xs"
                                    style={{ height: `${approvedHeightPct}%` }}
                                    title={`Approved Bookings: ${item.approved}`}
                                  ></div>
                                </div>

                                {/* Right Bar: Total Requests (Stacked) */}
                                <div className="flex-1 max-w-[16px] h-full flex flex-col justify-end">
                                  <div
                                    className="w-full flex flex-col justify-end rounded-t-xs overflow-hidden bg-slate-200/80 transition-all duration-300 shadow-xs"
                                    style={{ height: `${totalHeightPct}%` }}
                                    title={`Total Requests: ${item.totalBookings} (Approved: ${item.approved}, Pending: ${item.pending}, Rejected: ${item.rejected})`}
                                  >
                                    {item.rejected > 0 && (
                                      <div className="w-full bg-rose-500 transition-all" style={{ height: `${rejectedSegmentPct}%` }}></div>
                                    )}
                                    {item.pending > 0 && (
                                      <div className="w-full bg-amber-400 transition-all" style={{ height: `${pendingSegmentPct}%` }}></div>
                                    )}
                                    {item.approved > 0 && (
                                      <div className="w-full bg-emerald-400/80 transition-all" style={{ height: `${approvedSegmentPct}%` }}></div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="flex justify-between px-2 pt-2 text-[8px] font-bold text-slate-500">
                        {bookingStats.map((item, idx) => {
                          const showText = bookingStats.length > 15 ? (idx % 2 === 0 || idx === bookingStats.length - 1) : true;
                          return (
                            <div key={idx} className="flex-1 text-center">
                              {showText ? (
                                <div>
                                  <span className="block text-slate-700 font-extrabold">{item.label}</span>
                                  <span className="block text-[7px] text-slate-400">{item.dayName}</span>
                                </div>
                              ) : (
                                <span>•</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center text-xs text-slate-500 italic">No booking trends recorded for this selection.</div>
                )}
              </div>

              {/* EQUIPMENT STATUS BREAKDOWN GRAPH */}
              <div className="bg-white border rounded-2xl p-6 shadow-sm space-y-6">
                <div className="border-b pb-4">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xl font-bold text-primary font-serif">Equipment Operational Status Breakdown</h4>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200 uppercase">Availability & Maintenance</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-0.5">Real-time status distribution of lab equipment across Available, Booked, and Under Maintenance.</p>
                </div>

                {equipmentStatusSummary ? (
                  <div className="space-y-6">
                    {/* Multi-Segment Comparative Status Bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-slate-700">Total Equipment Inventory: {equipmentStatusSummary.total} Units</span>
                        <span className="text-slate-500 text-[11px]">Available Share: {equipmentStatusSummary.availablePct}%</span>
                      </div>

                      <div className="h-6 w-full bg-slate-100 rounded-xl overflow-hidden flex shadow-inner p-1 border">
                        {equipmentStatusSummary.available > 0 && (
                          <div
                            className="bg-emerald-500 h-full rounded-l-lg transition-all flex items-center justify-center text-[9px] font-black text-white"
                            style={{ width: `${equipmentStatusSummary.availablePct}%` }}
                            title={`Available: ${equipmentStatusSummary.available} (${equipmentStatusSummary.availablePct}%)`}
                          >
                            {equipmentStatusSummary.availablePct > 8 ? `${equipmentStatusSummary.availablePct}%` : ''}
                          </div>
                        )}
                        {equipmentStatusSummary.booked > 0 && (
                          <div
                            className="bg-cyan-500 h-full transition-all flex items-center justify-center text-[9px] font-black text-white"
                            style={{ width: `${equipmentStatusSummary.bookedPct}%` }}
                            title={`Booked / In Use: ${equipmentStatusSummary.booked} (${equipmentStatusSummary.bookedPct}%)`}
                          >
                            {equipmentStatusSummary.bookedPct > 8 ? `${equipmentStatusSummary.bookedPct}%` : ''}
                          </div>
                        )}
                        {equipmentStatusSummary.maintenance > 0 && (
                          <div
                            className="bg-rose-500 h-full rounded-r-lg transition-all flex items-center justify-center text-[9px] font-black text-white"
                            style={{ width: `${equipmentStatusSummary.maintenancePct}%` }}
                            title={`Under Maintenance: ${equipmentStatusSummary.maintenance} (${equipmentStatusSummary.maintenancePct}%)`}
                          >
                            {equipmentStatusSummary.maintenancePct > 8 ? `${equipmentStatusSummary.maintenancePct}%` : ''}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Status KPI Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-2xl p-4 flex items-center justify-between">
                        <div className="space-y-1">
                          <span className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-wider block">Available</span>
                          <span className="text-2xl font-black text-emerald-700 font-mono block">{equipmentStatusSummary.available}</span>
                          <span className="text-[10px] text-emerald-600 font-bold block">{equipmentStatusSummary.availablePct}% of total</span>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold text-lg">
                          ✓
                        </div>
                      </div>

                      <div className="bg-cyan-50/60 border border-cyan-200/80 rounded-2xl p-4 flex items-center justify-between">
                        <div className="space-y-1">
                          <span className="text-[10px] font-extrabold text-cyan-800 uppercase tracking-wider block">Booked / In Use</span>
                          <span className="text-2xl font-black text-cyan-700 font-mono block">{equipmentStatusSummary.booked}</span>
                          <span className="text-[10px] text-cyan-600 font-bold block">{equipmentStatusSummary.bookedPct}% of total</span>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-600 flex items-center justify-center font-bold text-lg">
                          ⚡
                        </div>
                      </div>

                      <div className="bg-rose-50/60 border border-rose-200/80 rounded-2xl p-4 flex items-center justify-between">
                        <div className="space-y-1">
                          <span className="text-[10px] font-extrabold text-rose-800 uppercase tracking-wider block">In Maintenance</span>
                          <span className="text-2xl font-black text-rose-700 font-mono block">{equipmentStatusSummary.maintenance}</span>
                          <span className="text-[10px] text-rose-600 font-bold block">{equipmentStatusSummary.maintenancePct}% of total</span>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center font-bold text-lg">
                          🔧
                        </div>
                      </div>
                    </div>

                    {/* Category Breakdown Progress Bars */}
                    {equipmentStatusSummary.categoryBreakdown && equipmentStatusSummary.categoryBreakdown.length > 0 && (
                      <div className="border rounded-xl p-4 bg-slate-50 space-y-3">
                        <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Status Breakdown by Category</h5>
                        <div className="space-y-3">
                          {equipmentStatusSummary.categoryBreakdown.map((catItem, idx) => (
                            <div key={idx} className="space-y-1">
                              <div className="flex justify-between text-xs font-semibold">
                                <span className="text-slate-800 font-bold">{catItem.category}</span>
                                <span className="text-slate-500 text-[10px]">
                                  Available: <strong className="text-emerald-700">{catItem.available}</strong> | Booked: <strong className="text-cyan-700">{catItem.booked}</strong> | Maint: <strong className="text-rose-700">{catItem.maintenance}</strong>
                                </span>
                              </div>
                              <div className="h-2.5 w-full bg-slate-200 rounded-full overflow-hidden flex">
                                {catItem.total > 0 && (
                                  <>
                                    <div className="bg-emerald-500 h-full" style={{ width: `${(catItem.available / catItem.total) * 100}%` }}></div>
                                    <div className="bg-cyan-500 h-full" style={{ width: `${(catItem.booked / catItem.total) * 100}%` }}></div>
                                    <div className="bg-rose-500 h-full" style={{ width: `${(catItem.maintenance / catItem.total) * 100}%` }}></div>
                                  </>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-8 text-center text-xs text-slate-500 italic">No equipment status details available.</div>
                )}
              </div>

              {/* Combined View & Rankings */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Quadrant scatter plot */}
                <div className="bg-white border rounded-2xl p-6 shadow-sm lg:col-span-7 flex flex-col justify-between space-y-6">
                  <div>
                    <h4 className="text-xl font-bold text-primary font-serif">Utilization × Demand Quadrant</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">Asset mapping. Horizontal split at 60% utilization, vertical split at 0.5 demand score.</p>
                  </div>

                  <div className="border border-slate-200 rounded-xl relative p-4 bg-slate-50 h-[380px] w-full flex flex-col justify-between">
                    {/* Quadrant backgrounds */}
                    <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 rounded-xl overflow-hidden pointer-events-none opacity-[0.06]">
                      <div className="bg-yellow-500 border-r border-b border-dashed border-slate-300"></div>
                      <div className="bg-rose-500 border-b border-dashed border-slate-300"></div>
                      <div className="bg-slate-500 border-r border-dashed border-slate-300"></div>
                      <div className="bg-emerald-500"></div>
                    </div>

                    {/* Quadrant Labels */}
                    <div className="absolute top-2 left-2 text-[9px] font-bold text-amber-700 bg-amber-50/80 px-2 py-0.5 rounded border border-amber-200/50">Scheduling Friction (Fix access)</div>
                    <div className="absolute top-2 right-2 text-[9px] font-bold text-rose-700 bg-rose-50/80 px-2 py-0.5 rounded border border-rose-200/50">Procurement Candidate (Buy unit)</div>
                    <div className="absolute bottom-2 left-2 text-[9px] font-bold text-slate-600 bg-slate-50/80 px-2 py-0.5 rounded border border-slate-200/50">Underused Asset (Redeploy/Retire)</div>
                    <div className="absolute bottom-2 right-2 text-[9px] font-bold text-emerald-700 bg-emerald-50/80 px-2 py-0.5 rounded border border-emerald-200/50">Efficiently Used (No Action)</div>

                    {/* Threshold Divider Lines */}
                    <div className="absolute left-[60%] top-0 bottom-0 border-l border-dashed border-slate-400/70 z-10"></div>
                    <div className="absolute top-[50%] left-0 right-0 border-t border-dashed border-slate-400/70 z-10"></div>

                    {/* Grid labels */}
                    <div className="w-full h-full relative">
                      {/* Map points */}
                      {quadrantData.map((pt) => {
                        const xPct = Math.min(pt.utilizationRate * 100, 95);
                        const yPct = Math.min(pt.demandScore * 100, 92);
                        
                        let dotColor = 'bg-slate-400 ring-slate-200';
                        if (pt.quadrant === 'Procurement Candidate') dotColor = 'bg-rose-600 ring-rose-200';
                        else if (pt.quadrant === 'Efficiently Used') dotColor = 'bg-emerald-600 ring-emerald-200';
                        else if (pt.quadrant === 'Scheduling/Access Problem') dotColor = 'bg-amber-500 ring-amber-200';

                        const tooltip = `${pt.equipmentName} [Lab: ${pt.labName || 'Unknown Lab'}]\nCategory: ${pt.category}\nUtilization: ${Math.round(pt.utilizationRate * 100)}%\nDemand Score: ${pt.demandScore.toFixed(2)}\nCategory Group: ${pt.quadrant}`;

                        return (
                          <div
                            key={pt.equipmentId}
                            className="absolute transition-all hover:scale-125 z-20 group"
                            style={{ left: `${xPct}%`, bottom: `${yPct}%` }}
                            title={tooltip}
                          >
                            <span className={`w-3.5 h-3.5 rounded-full block ring-4 cursor-pointer ${dotColor}`}></span>
                            <span className="absolute left-4 bottom-1 bg-slate-800 text-white text-[8px] font-bold px-1.5 py-0.5 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition shadow pointer-events-none">
                              {pt.equipmentName} [Lab: {pt.labName || 'Unknown Lab'}] ({Math.round(pt.utilizationRate * 100)}% / {pt.demandScore.toFixed(2)})
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Axes titles */}
                    <div className="w-full flex justify-between text-[8px] font-black text-slate-400 uppercase tracking-widest px-2 pt-2 border-t z-0 select-none">
                      <span>Low Util &larr;</span>
                      <span>Utilization Rate (Threshold 60%)</span>
                      <span>&rarr; High Util</span>
                    </div>
                  </div>
                </div>

                {/* Demand Rankings list */}
                <div className="bg-white border rounded-2xl p-6 shadow-sm lg:col-span-5 flex flex-col justify-between space-y-6">
                  <div>
                    <h4 className="text-xl font-bold text-primary font-serif">Demand Leaderboard</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">Rolling period priority rank based on booking requests, waitlists, and lead times.</p>
                  </div>

                  <div className="border rounded-xl overflow-hidden divide-y bg-slate-50 flex-1 max-h-[380px] overflow-y-auto">
                    {demandRankings.length > 0 ? (
                      demandRankings.map((rank, idx) => (
                        <div key={rank.equipmentId} className="p-3.5 flex justify-between items-center hover:bg-slate-100/50 transition text-xs font-semibold">
                          <div className="space-y-1 pr-2 text-left">
                            <div className="flex items-center gap-1.5">
                              <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-[10px]">#{idx + 1}</span>
                              <div>
                                <span className="font-bold text-slate-800 block truncate max-w-[150px]" title={rank.equipmentName}>{rank.equipmentName}</span>
                                <span className="text-[9px] font-bold text-amber-600 block truncate max-w-[120px]" title={rank.labName}>{rank.labName || 'Unknown Lab'}</span>
                              </div>
                            </div>
                            <span className="text-[9px] text-slate-400 block font-bold">Requests: {rank.bookingRequests} | Waitlist: {rank.waitlistEntries}</span>
                          </div>
                          <div className="text-right space-y-1">
                            <span className="font-mono text-sm block font-black text-primary">{(rank.demandScore * 10).toFixed(1)}</span>
                            <div className="w-16 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                              <div className="bg-primary h-1.5" style={{ width: `${rank.demandScore * 100}%` }}></div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center text-xs text-slate-500 italic">No demand scores calculated.</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Manual Batch Trigger Modal Dialog */}
              {showBatchModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                  <div className="bg-white border rounded-2xl w-full max-w-sm p-6 shadow-2xl relative animate-scaleIn space-y-6">
                    <button onClick={() => setShowBatchModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                    <h3 className="text-xl font-bold font-serif text-left">Execute Rollup Batch</h3>
                    <p className="text-xs text-slate-500 text-left">Trigger the batch aggregation pipeline chronologically for historical dates to feed charts.</p>
                    
                    <form onSubmit={handleTriggerBatch} className="space-y-4 text-xs font-semibold text-left">
                      <div className="space-y-1.5">
                        <label className="block uppercase text-slate-500 font-bold">Start Date</label>
                        <input
                          type="date"
                          value={batchDates.start}
                          onChange={(e) => setBatchDates({ ...batchDates, start: e.target.value })}
                          className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:border-primary text-sm font-medium"
                          required
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block uppercase text-slate-500 font-bold">End Date</label>
                        <input
                          type="date"
                          value={batchDates.end}
                          onChange={(e) => setBatchDates({ ...batchDates, end: e.target.value })}
                          className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:border-primary text-sm font-medium"
                          required
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isBatchLoading}
                        className="w-full bg-primary hover:bg-primary-light text-white font-bold py-2.5 rounded-lg text-xs tracking-wider transition shadow flex items-center justify-center gap-1.5"
                      >
                        {isBatchLoading ? (
                          <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        ) : (
                          'Execute Pipeline'
                        )}
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

        </main>
      </div>

      {/* Add Equipment Modal */}
      {showAddEquipmentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white border rounded-2xl w-full max-w-lg p-6 shadow-2xl relative animate-scaleIn space-y-6">
            <button onClick={() => setShowAddEquipmentModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
            <h3 className="text-xl font-bold font-serif">Register Equipment</h3>
            <form onSubmit={handleAddEquipment} className="space-y-4 text-xs font-semibold overflow-y-auto max-h-[70vh] pr-2">
              <div className="space-y-1 text-left">
                <label className="block uppercase text-slate-500 font-bold">Equipment Name</label>
                <input
                  type="text"
                  placeholder="e.g. Zeiss Axio Imager 2"
                  value={eqForm.name}
                  onChange={(e) => setEqForm({ ...eqForm, name: e.target.value })}
                  className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:border-primary text-sm font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4 text-left">
                <div className="space-y-1">
                  <label className="block uppercase text-slate-500 font-bold">Category</label>
                  <select
                    value={eqForm.category}
                    onChange={(e) => setEqForm({ ...eqForm, category: e.target.value })}
                    className="w-full border rounded-lg px-4 py-2 focus:outline-none text-sm font-medium bg-white"
                  >
                    <option value="Microscope">Microscope</option>
                    <option value="Centrifuge">Centrifuge</option>
                    <option value="Spectrometer">Spectrometer</option>
                    <option value="Thermal Cycler">Thermal Cycler</option>
                    <option value="Refrigerator">Refrigerator</option>
                    <option value="Balance">Balance</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block uppercase text-slate-500 font-bold">Manufacturer</label>
                  <input
                    type="text"
                    placeholder="e.g. Zeiss / Thermo Fisher"
                    value={eqForm.manufacturer}
                    onChange={(e) => setEqForm({ ...eqForm, manufacturer: e.target.value })}
                    className="w-full border rounded-lg px-4 py-2 focus:outline-none text-sm font-medium"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-left">
                <div className="space-y-1">
                  <label className="block uppercase text-slate-500 font-bold">Model</label>
                  <input
                    type="text"
                    placeholder="e.g. Axiolab 5"
                    value={eqForm.model}
                    onChange={(e) => setEqForm({ ...eqForm, model: e.target.value })}
                    className="w-full border rounded-lg px-4 py-2 focus:outline-none text-sm font-medium"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="block uppercase text-slate-500 font-bold">Serial Number</label>
                  <input
                    type="text"
                    placeholder="e.g. SN-88902-X"
                    value={eqForm.serialNumber}
                    onChange={(e) => setEqForm({ ...eqForm, serialNumber: e.target.value })}
                    className="w-full border rounded-lg px-4 py-2 focus:outline-none text-sm font-medium"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-left">
                <div className="space-y-1">
                  <label className="block uppercase text-slate-500 font-bold">Purchase Date</label>
                  <input
                    type="date"
                    value={eqForm.purchaseDate}
                    onChange={(e) => setEqForm({ ...eqForm, purchaseDate: e.target.value })}
                    className="w-full border rounded-lg px-4 py-2 focus:outline-none text-sm font-medium"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="block uppercase text-slate-500 font-bold">Purchase Amount ($)</label>
                  <input
                    type="number"
                    placeholder="e.g. 12000"
                    value={eqForm.purchaseCost}
                    onChange={(e) => setEqForm({ ...eqForm, purchaseCost: e.target.value })}
                    className="w-full border rounded-lg px-4 py-2 focus:outline-none text-sm font-medium"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 text-left">
                <div className="space-y-1">
                  <label className="block uppercase text-slate-500 font-bold text-[9px]">Cost/Hr ($)</label>
                  <input
                    type="number"
                    placeholder="e.g. 25"
                    value={eqForm.cost}
                    onChange={(e) => setEqForm({ ...eqForm, cost: e.target.value })}
                    className="w-full border rounded-lg px-4 py-2 focus:outline-none text-sm font-medium"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="block uppercase text-slate-500 font-bold">Quantity</label>
                  <input
                    type="number"
                    value={eqForm.amount}
                    onChange={(e) => setEqForm({ ...eqForm, amount: e.target.value })}
                    className="w-full border rounded-lg px-4 py-2 focus:outline-none text-sm font-medium"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="block uppercase text-slate-500 font-bold">Lab ID</label>
                  <input
                    type="number"
                    placeholder="Prefilled"
                    value={eqForm.labId}
                    onChange={(e) => setEqForm({ ...eqForm, labId: e.target.value })}
                    className="w-full border rounded-lg px-4 py-2 focus:outline-none text-sm font-medium"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-left">
                <div className="space-y-1">
                  <label className="block uppercase text-slate-500 font-bold">Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Room 402"
                    value={eqForm.location}
                    onChange={(e) => setEqForm({ ...eqForm, location: e.target.value })}
                    className="w-full border rounded-lg px-4 py-2 focus:outline-none text-sm font-medium"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="block uppercase text-slate-500 font-bold">Image URL</label>
                  <input
                    type="text"
                    placeholder="Unsplash / custom link"
                    value={eqForm.imageUrl}
                    onChange={(e) => setEqForm({ ...eqForm, imageUrl: e.target.value })}
                    className="w-full border rounded-lg px-4 py-2 focus:outline-none text-sm font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1 text-left">
                <label className="block uppercase text-slate-500 font-bold">Manual Link (URL)</label>
                <input
                  type="text"
                  placeholder="e.g. https://www.manufacturer.com/manual.pdf"
                  value={eqForm.manual}
                  onChange={(e) => setEqForm({ ...eqForm, manual: e.target.value })}
                  className="w-full border rounded-lg px-4 py-2 focus:outline-none text-sm font-medium"
                />
              </div>

              <div className="space-y-1 text-left">
                <label className="block uppercase text-slate-500 font-bold">Description</label>
                <textarea
                  placeholder="Details about calibration and operational usage limits..."
                  value={eqForm.description}
                  onChange={(e) => setEqForm({ ...eqForm, description: e.target.value })}
                  className="w-full border rounded-lg px-4 py-2 focus:outline-none text-sm font-medium h-16 resize-none"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t mt-4">
                <button type="button" onClick={() => setShowAddEquipmentModal(false)} className="px-4 py-2 border rounded-lg text-sm">Cancel</button>
                <button type="submit" className="bg-[#00a2c0] text-white px-5 py-2 rounded-lg transition text-sm">Add Equipment</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Department Modal */}
      {showAddDepartmentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white border rounded-2xl w-full max-w-lg p-6 shadow-2xl relative animate-scaleIn space-y-6">
            <button onClick={() => setShowAddDepartmentModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
            <h3 className="text-xl font-bold font-serif">Add Department</h3>
            <form onSubmit={handleAddDepartment} className="space-y-4 text-sm font-semibold">
              <div className="space-y-1">
                <label className="block text-xs uppercase text-slate-500">Department Name</label>
                <input
                  type="text"
                  placeholder="e.g. Molecular Biology"
                  value={deptForm.name}
                  onChange={(e) => setDeptForm({ name: e.target.value })}
                  className="w-full border rounded-lg px-4 py-2 focus:outline-none"
                  required
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowAddDepartmentModal(false)} className="px-4 py-2 border rounded-lg">Cancel</button>
                <button type="submit" className="bg-[#00a2c0] text-white px-5 py-2 rounded-lg transition">Add Department</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Lab Modal */}
      {showAddLabModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white border rounded-2xl w-full max-w-lg p-6 shadow-2xl relative animate-scaleIn space-y-6">
            <button onClick={() => setShowAddLabModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
            <h3 className="text-xl font-bold font-serif">Add Laboratory</h3>
            <form onSubmit={handleAddLab} className="space-y-4 text-sm font-semibold">
              <div className="space-y-1">
                <label className="block text-xs uppercase text-slate-500">Lab Name</label>
                <input
                  type="text"
                  placeholder="e.g. Advanced Nanotech Lab"
                  value={labForm.name}
                  onChange={(e) => setLabForm({ name: e.target.value })}
                  className="w-full border rounded-lg px-4 py-2 focus:outline-none"
                  required
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowAddLabModal(false)} className="px-4 py-2 border rounded-lg">Cancel</button>
                <button type="submit" className="bg-[#00a2c0] text-white px-5 py-2 rounded-lg transition">Add Laboratory</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Put In Maintenance Modal */}
      {showPutInMaintenanceModal && selectedEquipmentForMaintenance && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white border rounded-2xl w-full max-w-md p-6 shadow-2xl relative animate-scaleIn space-y-6 text-left">
            <button
              onClick={() => setShowPutInMaintenanceModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>

            <div>
              <h3 className="text-xl font-bold font-serif text-slate-900">Put Equipment into Maintenance</h3>
              <p className="text-xs text-slate-500 mt-1">
                Specify maintenance parameters for <span className="font-bold text-primary">{selectedEquipmentForMaintenance.name}</span>.
              </p>
            </div>

            <form onSubmit={handleSubmitPutInMaintenance} className="space-y-4 text-xs font-semibold">
              {/* Quantity or All Option */}
              <div className="space-y-2">
                <label className="block uppercase text-slate-500 font-bold">Maintenance Quantity</label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="isAll"
                      checked={maintenanceForm.isAll === true}
                      onChange={() => setMaintenanceForm({ ...maintenanceForm, isAll: true })}
                      className="text-primary focus:ring-primary"
                    />
                    <span>All Units ({selectedEquipmentForMaintenance.amount || 1})</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="isAll"
                      checked={maintenanceForm.isAll === false}
                      onChange={() => setMaintenanceForm({ ...maintenanceForm, isAll: false })}
                      className="text-primary focus:ring-primary"
                    />
                    <span>Specific Quantity</span>
                  </label>
                </div>

                {!maintenanceForm.isAll && (
                  <div className="pt-2">
                    <label className="block text-[11px] text-slate-600 mb-1">Select Quantity (1 to {selectedEquipmentForMaintenance.amount || 1}):</label>
                    <input
                      type="number"
                      min="1"
                      max={selectedEquipmentForMaintenance.amount || 1}
                      value={maintenanceForm.quantity}
                      onChange={(e) => setMaintenanceForm({ ...maintenanceForm, quantity: e.target.value })}
                      className="w-full border rounded-lg px-3 py-2 text-sm font-semibold focus:outline-none focus:border-primary"
                      required
                    />
                  </div>
                )}
              </div>

              {/* Start / Created Time */}
              <div className="space-y-1.5">
                <label className="block uppercase text-slate-500 font-bold">Maintenance Start / Created Time</label>
                <input
                  type="datetime-local"
                  value={maintenanceForm.startTime}
                  onChange={(e) => setMaintenanceForm({ ...maintenanceForm, startTime: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm font-semibold focus:outline-none focus:border-primary"
                  required
                />
                <span className="text-[10px] text-slate-400 block">Defaults to current time. Editable if maintenance started earlier.</span>
              </div>

              {/* Reason / Notes */}
              <div className="space-y-1.5">
                <label className="block uppercase text-slate-500 font-bold">Reason / Notes (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Scheduled sensor recalibration or hardware defect"
                  value={maintenanceForm.reason}
                  onChange={(e) => setMaintenanceForm({ ...maintenanceForm, reason: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm font-semibold focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowPutInMaintenanceModal(false)}
                  className="px-4 py-2 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100 border"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading[`put-maint-${selectedEquipmentForMaintenance.equipmentId || selectedEquipmentForMaintenance.id}`]}
                  className="px-5 py-2 rounded-lg text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                >
                  {actionLoading[`put-maint-${selectedEquipmentForMaintenance.equipmentId || selectedEquipmentForMaintenance.id}`] && (
                    <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  Put in Maintenance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Start/Created Time Modal */}
      {showEditTimeModal && selectedRecordForTimeEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white border rounded-2xl w-full max-w-sm p-6 shadow-2xl relative animate-scaleIn space-y-5 text-left">
            <button
              onClick={() => setShowEditTimeModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>

            <div>
              <h3 className="text-lg font-bold font-serif text-slate-900">Change Maintenance Created Time</h3>
              <p className="text-xs text-slate-500 mt-1">
                Update start timestamp for <span className="font-bold text-primary">{selectedRecordForTimeEdit.equipmentName}</span> in database.
              </p>
            </div>

            <form onSubmit={handleSubmitEditTime} className="space-y-4 text-xs font-semibold">
              <div className="space-y-1.5">
                <label className="block uppercase text-slate-500 font-bold">New Start / Created Time</label>
                <input
                  type="datetime-local"
                  value={editStartTimeValue}
                  onChange={(e) => setEditStartTimeValue(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm font-semibold focus:outline-none focus:border-primary"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowEditTimeModal(false)}
                  className="px-4 py-2 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100 border"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg text-xs font-bold text-white bg-primary hover:bg-primary-light shadow"
                >
                  Update Time in DB
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Equipment Renewal Modal */}
      {renderRenewalModal()}

    </div>
  );
}
