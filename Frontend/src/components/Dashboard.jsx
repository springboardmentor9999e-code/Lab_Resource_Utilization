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

  // Filters & Sorting states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('name'); 

  // Modals / Adding Forms states
  const [toastMessage, setToastMessage] = useState('');
  const [showAddEquipmentModal, setShowAddEquipmentModal] = useState(false);
  const [showAddDepartmentModal, setShowAddDepartmentModal] = useState(false);
  const [showAddLabModal, setShowAddLabModal] = useState(false);

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
    .then(data => setEquipments(data))
    .catch(() => {
      setEquipments([
        { id: 1, name: 'Zeiss Axiolab 5', category: 'Microscope', status: 'Operational', maintenanceDate: 'Oct 12', location: 'Rm 402', imageUrl: 'https://images.unsplash.com/photo-1576086213369-97a306d36557?w=500&auto=format&fit=crop&q=80', manual: 'https://www.zeiss.com/content/dam/microscopy/us/downloads/pdf/user-manuals/axiolab-5-user-guide.pdf', cost: 4500.00, amount: 6 },
        { id: 2, name: 'Thermo Sorvall ST8', category: 'Centrifuge', status: 'Operational', maintenanceDate: 'Sep 30', location: 'Rm 215', imageUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=500&auto=format&fit=crop&q=80', manual: 'https://assets.thermofisher.com/TFS-Assets/LED/manuals/Sorvall-ST8-Centrifuge-Manual.pdf', cost: 3200.00, amount: 4 },
        { id: 3, name: 'UV-Vis Spec 2000', category: 'Spectrometer', status: 'Calibration Required', maintenanceDate: 'Today', location: 'Rm 109', imageUrl: 'https://images.unsplash.com/photo-1532187643603-ba119ca4109e?w=500&auto=format&fit=crop&q=80', manual: 'https://www.agilent.com/cs/library/usermanuals/public/Agilent_Cary60_User_Manual.pdf', cost: 6700.00, amount: 5 },
        { id: 4, name: 'Bio-Rad PCR T100', category: 'Thermal Cycler', status: 'Operational', maintenanceDate: 'Nov 01', location: 'Rm 312', imageUrl: 'https://images.unsplash.com/photo-1601597111158-2fceff270190?w=500&auto=format&fit=crop&q=80', manual: 'https://www.bio-rad.com/webroot/web/pdf/lsr/literature/10000067649.pdf', cost: 2900.00, amount: 8 }
      ]);
    })
    .finally(() => setLoadingEquipments(false));
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
      // Map labId to id to fix listing and deleting
      setLabs(data.map(l => ({ ...l, id: l.labId, name: l.name, availableCount: 8, maintenanceCount: 1, bookedCount: 3 })));
    })
    .catch(() => {
      setLabs([
        { id: 1, name: 'Bio-Safety Level 4 Isolation Lab', availableCount: 8, maintenanceCount: 1, bookedCount: 3 },
        { id: 2, name: 'Organic Chemistry Synthesis Lab', availableCount: 6, maintenanceCount: 2, bookedCount: 2 },
        { id: 3, name: 'Quantum Optics Laboratory', availableCount: 10, maintenanceCount: 0, bookedCount: 4 }
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
    if (user?.labId) {
      setEqForm(prev => ({ ...prev, labId: user.labId }));
    }
  }, [user]);

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
  };

  const loadOverviewHeatmap = (deptId) => {
    if (!deptId) return;
    fetch(`http://localhost:8080/api/utilization/department/${deptId}?range=12d`, {
      headers: getAuthHeaders()
    })
    .then(res => {
      if (!res.ok) throw new Error();
      return res.json();
    })
    .then(data => setOverviewHeatmapData(data))
    .catch(() => {
      setOverviewHeatmapData(getMockHeatmapData(deptId, '12d'));
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

    fetch(`http://localhost:8080/api/users/${userId}/${endpoint}`, {
      method: 'PATCH',
      headers: getAuthHeaders()
    })
    .then(res => {
      if (!res.ok) throw new Error();
      setPendingApprovals(pendingApprovals.filter(p => p.userId !== userId));
      triggerToast('User role request approved.');
    })
    .catch(() => {
      setPendingApprovals(pendingApprovals.filter(p => p.userId !== userId));
      triggerToast('User role request approved (mock fallback).');
    });
  };

  const handleRejectUser = (userId) => {
    fetch(`http://localhost:8080/api/users/${userId}/reject`, {
      method: 'PATCH',
      headers: getAuthHeaders()
    })
    .then(res => {
      if (!res.ok) throw new Error();
      setPendingApprovals(pendingApprovals.filter(p => p.userId !== userId));
      triggerToast('User registration request rejected.');
    })
    .catch(() => {
      setPendingApprovals(pendingApprovals.filter(p => p.userId !== userId));
      triggerToast('User registration request rejected (mock fallback).');
    });
  };

  const handleApproveBooking = (booking) => {
    const bookingId = booking.bookingId || booking.id;
    const isReturn = booking.status === "Pending Return Approval" || booking.status === "Returned (Pending Approval)";
    const endpoint = isReturn 
      ? `http://localhost:8080/api/bookings/${bookingId}/approve-return`
      : `http://localhost:8080/api/bookings/${bookingId}/approve`;

    fetch(endpoint, {
      method: 'PATCH',
      headers: getAuthHeaders()
    })
    .then(res => {
      if (!res.ok) throw new Error();
      setPendingBookings(pendingBookings.filter(p => (p.bookingId || p.id) !== bookingId));
      triggerToast(isReturn ? 'Return approved successfully.' : 'Booking approved successfully.');
    })
    .catch(() => {
      setPendingBookings(pendingBookings.filter(p => (p.bookingId || p.id) !== bookingId));
      triggerToast(isReturn ? 'Return approved (mock fallback).' : 'Booking approved (mock fallback).');
    });
  };

  const handleRejectBooking = (booking) => {
    const bookingId = booking.bookingId || booking.id;
    const isReturn = booking.status === "Pending Return Approval" || booking.status === "Returned (Pending Approval)";

    fetch(`http://localhost:8080/api/bookings/${bookingId}/reject`, {
      method: 'PATCH',
      headers: getAuthHeaders()
    })
    .then(res => {
      if (!res.ok) throw new Error();
      setPendingBookings(pendingBookings.filter(p => (p.bookingId || p.id) !== bookingId));
      triggerToast(isReturn ? 'Return request rejected.' : 'Booking rejected.');
    })
    .catch(() => {
      setPendingBookings(pendingBookings.filter(p => (p.bookingId || p.id) !== bookingId));
      triggerToast(isReturn ? 'Return request rejected (mock fallback).' : 'Booking rejected (mock fallback).');
    });
  };

  // Sub-views renderers
  const renderOverviewTab = () => {
    // Generate beautiful demo utilization matrix heatmap matching context image
    return (
      <div className="space-y-8 animate-fadeIn">
        <div className="bg-white border border-outline-variant/30 rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h3 className="text-2xl font-bold text-primary font-serif">Lab Asset Utilization Matrix</h3>
              <p className="text-xs text-on-surface-variant mt-1.5 leading-relaxed">
                Precision monitoring of laboratory zones. Real-time environmental data and maintenance heat mapping.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-[10px] font-bold text-outline uppercase tracking-wider bg-surface-low px-3 py-1.5 rounded-full border border-outline-variant/50">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-blue-100 rounded-sm"></span> LOW (&lt;15%)</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-cyan-400 rounded-sm"></span> MID (15%-60%)</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-cyan-900 rounded-sm"></span> PEAK (&gt;60%)</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-surface-dim border border-outline-variant/30 rounded-sm"></span> MAINT / OFF</span>
            </div>
          </div>

          {/* Grid structure matching context image layout */}
          <div className="space-y-4">
            {!overviewHeatmapData ? (
              <div className="p-4 bg-surface-low rounded-xl border border-outline-variant/40 space-y-3">
                <Skeleton count={4} height={48} borderRadius={8} />
              </div>
            ) : overviewHeatmapData && overviewHeatmapData.dates && overviewHeatmapData.equipmentMetrics ? (
              <div className="space-y-4 p-4 bg-surface-low rounded-xl border border-outline-variant/40 max-h-[420px] overflow-y-auto custom-scrollbar">
                {overviewHeatmapData.equipmentMetrics.slice(0, 6).map((row) => (
                  <div key={row.equipmentId} className="flex flex-col lg:flex-row lg:items-center gap-3 border-b border-outline-variant/10 pb-3 last:border-b-0 last:pb-0">
                    <div className="lg:w-44 text-left flex-shrink-0">
                      <span className="font-bold text-xs text-on-surface block truncate" title={row.equipmentName}>{row.equipmentName}</span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[9px] font-bold text-cyan-600 uppercase tracking-wider">{row.category}</span>
                        <span className="text-[9px] text-outline">•</span>
                        <span className="text-[9px] font-bold text-amber-600 truncate max-w-[80px]" title={row.labName}>{row.labName || 'Unknown Lab'}</span>
                      </div>
                    </div>
                    <div className="flex-1 grid grid-cols-12 gap-2">
                      {row.dailyRates.map((rate, idx) => {
                        let cellBg = 'bg-surface-dim border border-outline-variant/30 text-on-surface-variant/40';
                        let label = 'MAINT';
                        if (rate != null) {
                          label = `${Math.round(rate * 100)}%`;
                          if (rate < 0.15) {
                            cellBg = 'bg-blue-100 text-cyan-800 border-blue-200/40 hover:bg-blue-200';
                          } else if (rate < 0.6) {
                            cellBg = 'bg-cyan-400 text-white border-cyan-500/40 hover:bg-cyan-500';
                          } else {
                            cellBg = 'bg-cyan-900 text-white border-cyan-950/40 hover:bg-cyan-950';
                          }
                        }
                        const formattedDate = overviewHeatmapData.dates[idx];
                        const tooltip = `${row.equipmentName} [Lab: ${row.labName || 'Unknown Lab'}]\nDate: ${formattedDate}\nUtilization: ${rate != null ? Math.round(rate * 100) + '%' : 'Downtime / Blackout'}`;
                        return (
                          <div
                            key={idx}
                            className={`h-14 rounded-lg ${cellBg} p-1.5 flex flex-col justify-between cursor-pointer hover:ring-2 hover:ring-primary transition shadow-sm border`}
                            title={tooltip}
                          >
                            <span className="text-[7px] font-mono font-bold opacity-60">Day {idx + 1}</span>
                            <span className="text-[8px] font-black self-end tracking-tighter">{label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-500 italic bg-surface-low rounded-xl border border-outline-variant/40">
                No active utilization matrix metrics found for this department.
              </div>
            )}
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-6 mt-8 border-t border-outline-variant/20 pt-6">
            <div className="text-center">
              <span className="text-3xl font-black text-primary font-mono tracking-tight block">94.2%</span>
              <span className="text-[10px] text-outline block uppercase font-bold tracking-wider mt-1">System Uptime</span>
            </div>
            <div className="text-center border-x border-outline-variant/30">
              <span className="text-3xl font-black text-cyan-600 font-mono tracking-tight block">12</span>
              <span className="text-[10px] text-outline block uppercase font-bold tracking-wider mt-1">Active Tickets</span>
            </div>
            <div className="text-center">
              <span className="text-3xl font-black text-rose-600 font-mono tracking-tight block">3</span>
              <span className="text-[10px] text-outline block uppercase font-bold tracking-wider mt-1">Urgent Reviews</span>
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
            {filteredEquipments.map((eq) => (
            <div key={eq.id} className="bg-white border border-outline-variant/30 rounded-xl overflow-hidden shadow-sm hover:shadow hover:border-primary/20 transition flex flex-col h-[460px] relative">
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

              <div className="p-4 flex-1 flex flex-col justify-between">
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

                <div className="border-t border-outline-variant/20 pt-3 mt-4 text-xs text-on-surface-variant flex justify-between font-semibold flex-wrap gap-2">
                  <span>Loc: {eq.location}</span>
                  <span>Maint: {eq.maintenanceDate || 'Regular'}</span>
                  <span>Qty: {eq.amount ?? 'N/A'}</span>
                  <span className="text-[#00a2c0] font-bold">${eq.cost || 'N/A'}/hr</span>
                </div>
              </div>
            </div>
          ))}
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
                        onClick={() => handleRejectBooking(b)}
                        className="bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 font-bold py-1.5 px-3 rounded-lg text-xs transition"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleApproveBooking(b)}
                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-1.5 px-3.5 rounded-lg text-xs transition"
                      >
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
          </nav>

          {/* Active Monitors List */}
          <div className="space-y-4 pt-6 border-t border-white/20 text-xs">
            {/* <span className="text-[10px] uppercase font-bold text-cyan-200 tracking-wider block">Active Monitors</span>
            <ul className="space-y-2.5 font-semibold text-cyan-50">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-300 animate-pulse"></span>
                Main Server Gateway
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-300 animate-pulse"></span>
                IoT Sensor Network
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                Backup Power Array
              </li>
            </ul> */}

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

          <div className="flex items-center gap-6">
            <button
              onClick={onLogout}
              className="text-xs font-bold text-rose-600  transition border px-2 py-2 shadow-sm rounded-xl  bg-gray-100 hover:text-rose-700 hover:shadow-md "
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
                {(user?.roleId === 6 || user?.roleId === 5 || user?.roleId === 4 || user?.roleId === 3 || user?.roleId === 2 || hasPermission('approve_bookings') || hasPermission('approve_department_head') || hasPermission('approve_lab_manager') || hasPermission('approve_lab_technician')) && (
                  <button
                    onClick={() => setActiveSubTab('approvals')}
                    className={`px-6 py-2 rounded-full text-xs font-bold transition-all ${
                      activeSubTab === 'approvals' ? 'bg-[#00a2c0] text-white shadow-sm' : 'text-slate-600 hover:text-primary'
                    }`}
                  >
                    Approval
                  </button>
                )}
                {hasPermission('manage_departments') ? (
                  <button
                    onClick={() => setActiveSubTab('departments')}
                    className={`px-6 py-2 rounded-full text-xs font-bold transition-all ${
                      activeSubTab === 'departments' ? 'bg-[#00a2c0] text-white shadow-sm' : 'text-slate-600 hover:text-primary'
                    }`}
                  >
                    Labs Department
                  </button>
                ) : hasPermission('manage_labs') ? (
                  <button
                    onClick={() => setActiveSubTab('labs')}
                    className={`px-6 py-2 rounded-full text-xs font-bold transition-all ${
                      activeSubTab === 'labs' ? 'bg-[#00a2c0] text-white shadow-sm' : 'text-slate-600 hover:text-primary'
                    }`}
                  >
                    Labs
                  </button>
                ) : (
                  <button
                    onClick={() => setActiveSubTab('maintenance')}
                    className={`px-6 py-2 rounded-full text-xs font-bold transition-all ${
                      activeSubTab === 'maintenance' ? 'bg-[#00a2c0] text-white shadow-sm' : 'text-slate-600 hover:text-primary'
                    }`}
                  >
                    Maintenance
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
              {activeSubTab === 'maintenance' && (
                <div className="bg-white border rounded-xl p-8 text-center space-y-4 shadow-sm max-w-2xl mx-auto">
                  <h4 className="font-bold text-on-surface">No active maintenance work orders.</h4>
                  <p className="text-xs text-outline">All assets in your zones are operating within tolerances.</p>
                </div>
              )}
            </div>
          )}

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
                            // Show date text only for boundaries or intervals to save space
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

    </div>
  );
}
