import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { motion } from 'framer-motion';
import {
  Microscope, TestTube2, FlaskConical, Dna, Laptop2, Bot,
  Pipette, Cross, Atom, Cpu, Beaker,
  Mail, Lock, Eye, EyeOff, LogIn, UserPlus, KeyRound,
  ArrowLeft,
  Calendar, BarChart3, Share2, Clock, GraduationCap, Wrench,
  ClipboardList, Building2, Users, ShieldCheck, Search, Bell,
  ChevronDown, LogOut, User as UserIcon, Camera, Upload,
  Flame, TrendingUp, X, LayoutDashboard, AlertCircle, CheckCircle, Sparkles,
} from 'lucide-react';

const API = 'http://localhost:8080/api';

// ---------- Floating lab-equipment background for auth screens ----------
const FLOATING_ICONS = [
  { Icon: Microscope,   top: '8%',  left: '6%',  size: 44, duration: 7,  delay: 0,   rotate: 8,  blur: false, opacity: 0.08 },
  { Icon: TestTube2,    top: '18%', left: '85%', size: 36, duration: 6,  delay: 0.5, rotate: -12, blur: false, opacity: 0.06 },
  { Icon: Dna,          top: '65%', left: '90%', size: 52, duration: 9,  delay: 1,   rotate: 15, blur: true,  opacity: 0.06 },
  { Icon: FlaskConical, top: '78%', left: '10%', size: 40, duration: 8,  delay: 0.3, rotate: -10, blur: false, opacity: 0.08 },
  { Icon: Laptop2,      top: '35%', left: '3%',  size: 34, duration: 6.5,delay: 1.2, rotate: 6,  blur: true,  opacity: 0.06 },
  { Icon: Bot,          top: '5%',  left: '45%', size: 38, duration: 7.5,delay: 0.8, rotate: -8, blur: false, opacity: 0.06 },
  { Icon: Pipette,      top: '50%', left: '92%', size: 30, duration: 6,  delay: 0.2, rotate: 20, blur: false, opacity: 0.08 },
  { Icon: Cross,        top: '85%', left: '55%', size: 32, duration: 8,  delay: 1.5, rotate: 0,  blur: true,  opacity: 0.06 },
  { Icon: Atom,         top: '25%', left: '70%', size: 46, duration: 9.5,delay: 0.6, rotate: 25, blur: false, opacity: 0.08 },
  { Icon: Cpu,          top: '60%', left: '20%', size: 34, duration: 7,  delay: 1,   rotate: -15,blur: true,  opacity: 0.06 },
  { Icon: Beaker,       top: '12%', left: '25%', size: 30, duration: 6.5,delay: 0.4, rotate: 10, blur: false, opacity: 0.08 },
];

function FloatingLabBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      <div className="absolute top-1/2 -right-32 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-32 left-1/3 w-80 h-80 bg-purple-400/10 rounded-full blur-3xl" />
      {FLOATING_ICONS.map(({ Icon, top, left, size, duration, delay, rotate, blur, opacity }, i) => (
        <motion.div
          key={i}
          className="absolute text-white/10"
          style={{ top, left, opacity, filter: blur ? 'blur(2px)' : 'none' }}
          animate={{ y: [0, -18, 0], rotate: [0, rotate, 0] }}
          transition={{ duration, delay, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Icon size={size} strokeWidth={1.2} />
        </motion.div>
      ))}
    </div>
  );
}

// ---------- Nav items shown as horizontal icon tabs on the dashboard ----------
function getNavItems(role) {
  const items = [];
  items.push({ key: 'overview', label: 'Dashboard', icon: LayoutDashboard });
  items.push({ key: 'booking', label: 'Booking', icon: Calendar });
  items.push({ key: 'utilization', label: 'Utilization', icon: BarChart3 });
  items.push({ key: 'heatmap', label: 'Heatmap', icon: Flame });
  items.push({ key: 'demand', label: 'Demand', icon: TrendingUp });
  items.push({ key: 'sharing', label: 'Sharing', icon: Share2 });
  items.push({ key: 'waitlist', label: 'Waitlist', icon: Clock });
  if (role === 'LAB_MANAGER' || role === 'LAB_TECHNICIAN') {
    items.push({ key: 'maintenance', label: 'Maintenance', icon: Wrench });
  }
  if (role === 'LAB_MANAGER') {
    items.push({ key: 'equipment', label: 'Equipment', icon: FlaskConical });
  }
  if (role === 'DEPARTMENT_HEAD') {
    items.push({ key: 'requests', label: 'Requests', icon: ClipboardList });
  }
  if (role === 'INSTITUTION_ADMINISTRATOR') {
    items.push({ key: 'institutions', label: 'Institutions', icon: Building2 });
  }
  if (role === 'SYSTEM_ADMINISTRATOR') {
    items.push({ key: 'users', label: 'Users', icon: Users });
    items.push({ key: 'roleRequestsAdmin', label: 'Role Requests', icon: ShieldCheck });
  }
  if (role !== 'SYSTEM_ADMINISTRATOR') {
    items.push({ key: 'roleRequest', label: 'My Role', icon: GraduationCap });
  }
  items.push({ key: 'myProfile', label: 'Profile', icon: UserIcon });
  return items;
}

// Real in-browser camera capture (works on desktop webcams and mobile cameras alike)
function CameraCapture({ onCapture, onClose }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [error, setError] = useState('');
  const [stream, setStream] = useState(null);

  useEffect(() => {
    let activeStream;
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'environment' } })
      .then((s) => {
        activeStream = s;
        setStream(s);
        if (videoRef.current) videoRef.current.srcObject = s;
      })
      .catch(() => setError('Could not access the camera. Check browser permissions, or use "Upload File" instead.'));

    return () => {
      if (activeStream) activeStream.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const handleCapture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
    if (stream) stream.getTracks().forEach((t) => t.stop());
    onCapture(dataUrl);
  };

  const handleClose = () => {
    if (stream) stream.getTracks().forEach((t) => t.stop());
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl border border-slate-700"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-white">Take a Photo</h3>
          <button onClick={handleClose} className="p-1 rounded-lg hover:bg-slate-700 transition-colors">
            <X size={20} className="text-gray-400" />
          </button>
        </div>
        {error ? (
          <div className="bg-red-900/20 text-red-400 p-3 rounded-lg text-sm mb-3 border border-red-800/30">
            {error}
          </div>
        ) : (
          <video ref={videoRef} autoPlay playsInline className="w-full rounded-xl bg-black mb-4 aspect-video object-cover" />
        )}
        <canvas ref={canvasRef} className="hidden" />
        <div className="flex gap-3">
          <button
            onClick={handleCapture}
            disabled={!!error}
            className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-blue-500/25 disabled:opacity-50"
          >
            Capture
          </button>
          <button onClick={handleClose} className="px-5 py-2.5 border border-slate-600 rounded-xl text-sm font-medium text-gray-300 hover:bg-slate-700 transition-colors">
            Cancel
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ---------- Panel Component (Dark Theme) ----------
function Panel({ children, title, icon: Icon }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-slate-800/90 backdrop-blur-sm rounded-2xl shadow-xl shadow-slate-900/50 border border-slate-700 p-6 hover:border-slate-600 transition-all duration-300"
    >
      {title && (
        <h3 className="text-lg font-semibold text-white mb-5 flex items-center gap-2.5">
          {Icon && <Icon size={20} className="text-blue-400" strokeWidth={2} />}
          {title}
        </h3>
      )}
      {children}
    </motion.div>
  );
}

function App() {
  // ---------- Auth state ----------
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const [token, setToken] = useState(null);
  const [userEmail, setUserEmail] = useState('');
  const [userRole, setUserRole] = useState('');
  const [userName, setUserName] = useState('');
  const [userInstitutionId, setUserInstitutionId] = useState(null);

  const [activePanel, setActivePanel] = useState('overview');

  const [authMode, setAuthMode] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  // Register form
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerDesiredRole, setRegisterDesiredRole] = useState('RESEARCHER_STUDENT');
  const [registerProfileType, setRegisterProfileType] = useState('STUDENT');
  const [registerInstitutionId, setRegisterInstitutionId] = useState('');
  const [registerMessage, setRegisterMessage] = useState('');
  const [registerLoading, setRegisterLoading] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [registerFieldErrors, setRegisterFieldErrors] = useState({});
  const [agreeTerms, setAgreeTerms] = useState(false);

  const [publicInstitutions, setPublicInstitutions] = useState([]);

  // Forgot/Reset password
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMessage, setForgotMessage] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [devOnlyToken, setDevOnlyToken] = useState('');

  const [resetToken, setResetToken] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  // Role request (self-service)
  const [myRoleRequests, setMyRoleRequests] = useState([]);
  const [desiredRole, setDesiredRole] = useState('LAB_TECHNICIAN');
  const [roleRequestReason, setRoleRequestReason] = useState('');
  const [roleRequestMessage, setRoleRequestMessage] = useState('');

  const REQUESTABLE_ROLES = ['LAB_TECHNICIAN', 'LAB_MANAGER', 'DEPARTMENT_HEAD', 'INSTITUTION_ADMINISTRATOR'];

  // Role requests admin
  const [allRoleRequests, setAllRoleRequests] = useState([]);
  const [roleRequestAdminMessage, setRoleRequestAdminMessage] = useState('');

  // Institution management
  const [institutionName, setInstitutionName] = useState('');
  const [institutionAddress, setInstitutionAddress] = useState('');
  const [institutionEmail, setInstitutionEmail] = useState('');
  const [institutionsList, setInstitutionsList] = useState([]);
  const [institutionMessage, setInstitutionMessage] = useState('');
  const [institutionLoading, setInstitutionLoading] = useState(false);

  // Admin user/role management
  const [usersList, setUsersList] = useState([]);
  const [adminMessage, setAdminMessage] = useState('');

  const ALL_ROLES = [
    'RESEARCHER_STUDENT', 'LAB_TECHNICIAN', 'LAB_MANAGER',
    'DEPARTMENT_HEAD', 'INSTITUTION_ADMINISTRATOR', 'SYSTEM_ADMINISTRATOR',
  ];

  // Equipment
  const [equipmentName, setEquipmentName] = useState('');
  const [equipmentCategory, setEquipmentCategory] = useState('');
  const [equipmentDescription, setEquipmentDescription] = useState('');
  const [equipmentInstitutionId, setEquipmentInstitutionId] = useState('');
  const [equipmentImage, setEquipmentImage] = useState('');
  const [equipmentList, setEquipmentList] = useState([]);
  const [equipmentMessage, setEquipmentMessage] = useState('');
  const [equipmentLoading, setEquipmentLoading] = useState(false);
  const [allInstitutionsForDropdown, setAllInstitutionsForDropdown] = useState([]);
  const [showCameraModal, setShowCameraModal] = useState(false);

  // Booking
  const [bookingEquipmentId, setBookingEquipmentId] = useState('');
  const [bookingStart, setBookingStart] = useState('');
  const [bookingEnd, setBookingEnd] = useState('');
  const [bookingsList, setBookingsList] = useState([]);
  const [availableEquipment, setAvailableEquipment] = useState([]);
  const [bookingMessage, setBookingMessage] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);

  // Utilization
  const [utilizationList, setUtilizationList] = useState([]);

  // Heatmap & Demand
  const [heatmapData, setHeatmapData] = useState(null);
  const [heatmapLoading, setHeatmapLoading] = useState(false);
  const [demandData, setDemandData] = useState(null);
  const [demandLoading, setDemandLoading] = useState(false);

  // Maintenance
  const [maintenanceEquipmentId, setMaintenanceEquipmentId] = useState('');
  const [maintenanceType, setMaintenanceType] = useState('MAINTENANCE');
  const [maintenanceDescription, setMaintenanceDescription] = useState('');
  const [maintenanceDate, setMaintenanceDate] = useState('');
  const [maintenanceTechnician, setMaintenanceTechnician] = useState('');
  const [maintenanceList, setMaintenanceList] = useState([]);
  const [maintenanceMessage, setMaintenanceMessage] = useState('');
  const [maintenanceLoading, setMaintenanceLoading] = useState(false);

  // Requests
  const [requestsList, setRequestsList] = useState([]);
  const [requestsMessage, setRequestsMessage] = useState('');

  // Sharing
  const [sharingEquipmentId, setSharingEquipmentId] = useState('');
  const [sharingInstitutionId, setSharingInstitutionId] = useState('');
  const [sharingReason, setSharingReason] = useState('');
  const [sharingRequestsList, setSharingRequestsList] = useState([]);
  const [sharableEquipment, setSharableEquipment] = useState([]);
  const [sharingMessage, setSharingMessage] = useState('');
  const [sharingLoading, setSharingLoading] = useState(false);

  // Waitlist
  const [waitlistEquipmentId, setWaitlistEquipmentId] = useState('');
  const [waitlistEquipmentOptions, setWaitlistEquipmentOptions] = useState([]);
  const [myWaitlistEntries, setMyWaitlistEntries] = useState([]);
  const [allWaitlistEntries, setAllWaitlistEntries] = useState([]);
  const [waitlistMessage, setWaitlistMessage] = useState('');
  const [waitlistLoading, setWaitlistLoading] = useState(false);

  // My Profile (institution + profile type)
  const [myProfileInstitutionId, setMyProfileInstitutionId] = useState('');
  const [myProfileType, setMyProfileType] = useState('STUDENT');
  const [myProfileMessage, setMyProfileMessage] = useState('');
  const [myProfileLoading, setMyProfileLoading] = useState(false);

  // ---------- Fetch public institutions on mount (for register + my profile dropdowns) ----------
  useEffect(() => {
    let mounted = true;
    axios.get(`${API}/institutions/public`)
      .then((response) => {
        if (mounted) setPublicInstitutions(response.data);
      })
      .catch((error) => {
        console.error('Failed to fetch public institutions', error);
      });

    return () => {
      mounted = false;
    };
  }, []);

  // ---------- Auth handlers ----------
  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage('');

    const errors = {};
    if (!email.trim()) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) errors.email = 'Enter a valid email address';
    if (!password) errors.password = 'Password is required';

    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setLoading(true);
    try {
      const response = await axios.post(`${API}/auth/login`, { email, password });
      const receivedToken = response.data.token;
      const decoded = jwtDecode(receivedToken);

      setToken(receivedToken);
      setUserEmail(decoded.sub);
      setUserRole(decoded.role);
      setUserName(decoded.name);
      setUserInstitutionId(decoded.institutionId || null);
      setMyProfileInstitutionId(decoded.institutionId || '');
      setMyProfileType(decoded.profileType || 'STUDENT');

      const defaultPanel = 'overview';
      setActivePanel(defaultPanel);
      fetchBookings();
      fetchAvailableEquipment();
      fetchRequests();
      fetchMyWaitlist();
      fetchUtilization();
      fetchMaintenance();
      fetchSharingRequests();
      fetchMyRoleRequests();

    } catch (error) {
      if (error.response) {
        setMessage(error.response.data.message || 'Login failed');
      } else {
        setMessage('Could not reach the server');
      }
    } finally {
      setLoading(false);
    }
  };
const handleRegister = async (e) => {
  e.preventDefault();
  setRegisterMessage('');

  const errors = {};
  if (!registerName.trim()) errors.name = 'Full name is required';
  if (!registerEmail.trim()) errors.email = 'Email is required';
  else if (!/\S+@\S+\.\S+/.test(registerEmail)) errors.email = 'Enter a valid email address';
  if (!registerPassword) errors.password = 'Password is required';
  else if (registerPassword.length < 6) errors.password = 'Password must be at least 6 characters';
  
  // ✅ ADD THIS VALIDATION:
  if (!agreeTerms) {
    errors.terms = 'Please agree to the terms and conditions';
  }

  setRegisterFieldErrors(errors);
  if (Object.keys(errors).length > 0) return;

    setRegisterLoading(true);
    try {
      await axios.post(`${API}/auth/register`, {
        name: registerName,
        email: registerEmail,
        password: registerPassword,
        desiredRole: registerDesiredRole,
        profileType: registerProfileType,
        institutionId: registerInstitutionId ? parseInt(registerInstitutionId) : null,
      });

      setRegisterMessage(
        registerDesiredRole === 'RESEARCHER_STUDENT'
          ? 'Account created! You can now log in.'
          : `Account created! You can log in now with Researcher/Student access. Your request for ${registerDesiredRole.replace('_', ' ')} is pending admin approval.`
      );
      setRegisterName('');
      setRegisterEmail('');
      setRegisterPassword('');
      setRegisterDesiredRole('RESEARCHER_STUDENT');
      setRegisterProfileType('STUDENT');
      setRegisterInstitutionId('');

    } catch (error) {
      if (error.response) {
        setRegisterMessage(error.response.data.message || 'Registration failed');
      } else {
        setRegisterMessage('Could not reach the server');
      }
    } finally {
      setRegisterLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotLoading(true);
    setForgotMessage('');
    setDevOnlyToken('');
    try {
      const response = await axios.post(`${API}/auth/forgot-password`, { email: forgotEmail });
      setForgotMessage(response.data.message);
      if (response.data.devOnlyToken) setDevOnlyToken(response.data.devOnlyToken);
    } catch (error) {
      setForgotMessage(error.response ? (error.response.data.message || 'Something went wrong') : 'Could not reach the server');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setResetLoading(true);
    setResetMessage('');
    try {
      const response = await axios.post(`${API}/auth/reset-password`, {
        token: resetToken,
        newPassword: resetNewPassword,
      });
      setResetMessage(response.data.message);
      setResetToken('');
      setResetNewPassword('');
    } catch (error) {
      setResetMessage(error.response ? (error.response.data.message || 'Failed to reset password') : 'Could not reach the server');
    } finally {
      setResetLoading(false);
    }
  };

  const handleLogout = () => {
    setToken(null);
    setUserEmail('');
    setUserRole('');
    setUserName('');
    setUserInstitutionId(null);
    setEmail('');
    setPassword('');
    setMessage('');
    setAuthMode('login');
    setActivePanel('overview');
  };

  // ---------- My Profile ----------
  const handleUpdateMyProfile = async (e) => {
    e.preventDefault();
    setMyProfileLoading(true);
    setMyProfileMessage('');
    try {
      await axios.put(
        `${API}/users/me/profile`,
        {
          institutionId: myProfileInstitutionId ? parseInt(myProfileInstitutionId) : null,
          profileType: myProfileType,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMyProfileMessage('Profile updated! Log out and back in for it to fully apply everywhere (institution checks, dashboard view).');
    } catch (error) {
      setMyProfileMessage(error.response ? (error.response.data.message || 'Failed to update profile') : 'Could not reach the server');
    } finally {
      setMyProfileLoading(false);
    }
  };

  // ---------- Equipment ----------
  const fetchEquipment = async () => {
    try {
      const response = await axios.get(`${API}/equipment`, { headers: { Authorization: `Bearer ${token}` } });
      setEquipmentList(response.data);
    } catch (error) {
      console.error('Failed to fetch equipment', error);
    }
  };

  const fetchAllInstitutionsForDropdown = async () => {
    try {
      const response = await axios.get(`${API}/institutions`, { headers: { Authorization: `Bearer ${token}` } });
      setAllInstitutionsForDropdown(response.data);
    } catch (error) {
      console.error('Failed to fetch institutions', error);
    }
  };

  const handleEquipmentImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setEquipmentMessage('Image is too large — please use a photo under 2MB.');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => setEquipmentImage(reader.result);
    reader.readAsDataURL(file);
  };

  const handleAddEquipment = async (e) => {
    e.preventDefault();
    setEquipmentLoading(true);
    setEquipmentMessage('');
    try {
      const response = await axios.post(
        `${API}/equipment`,
        {
          name: equipmentName,
          category: equipmentCategory,
          description: equipmentDescription,
          institutionId: equipmentInstitutionId ? parseInt(equipmentInstitutionId) : null,
          imageBase64: equipmentImage || null,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEquipmentMessage(`"${response.data.name}" added successfully!`);
      setEquipmentName('');
      setEquipmentCategory('');
      setEquipmentDescription('');
      setEquipmentInstitutionId('');
      setEquipmentImage('');
      fetchEquipment();
    } catch (error) {
      setEquipmentMessage(error.response ? (error.response.data.message || 'Failed to add equipment') : 'Could not reach the server');
    } finally {
      setEquipmentLoading(false);
    }
  };

  // ---------- Requests ----------
  const fetchRequests = async () => {
    try {
      const response = await axios.get(`${API}/requests`, { headers: { Authorization: `Bearer ${token}` } });
      setRequestsList(response.data);
    } catch (error) {
      console.error('Failed to fetch requests', error);
    }
  };

  const handleApprove = async (id) => {
    setRequestsMessage('');
    try {
      await axios.put(`${API}/requests/${id}/approve`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setRequestsMessage(`Request #${id} approved.`);
      fetchRequests();
    } catch (error) {
      setRequestsMessage(error.response ? (error.response.data.message || 'Failed to approve') : 'Could not reach the server');
    }
  };

  const handleReject = async (id) => {
    setRequestsMessage('');
    try {
      await axios.put(`${API}/requests/${id}/reject`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setRequestsMessage(`Request #${id} rejected.`);
      fetchRequests();
    } catch (error) {
      setRequestsMessage(error.response ? (error.response.data.message || 'Failed to reject') : 'Could not reach the server');
    }
  };

  // ---------- Booking ----------
  const fetchBookings = async () => {
    try {
      const response = await axios.get(`${API}/bookings`, { headers: { Authorization: `Bearer ${token}` } });
      setBookingsList(response.data);
    } catch (error) {
      console.error('Failed to fetch bookings', error);
    }
  };

  const fetchAvailableEquipment = async () => {
    try {
      const response = await axios.get(`${API}/equipment`, { headers: { Authorization: `Bearer ${token}` } });
      setAvailableEquipment(response.data);
    } catch (error) {
      console.error('Failed to fetch equipment', error);
    }
  };

  const handleCreateBooking = async (e) => {
    e.preventDefault();
    setBookingLoading(true);
    setBookingMessage('');
    try {
      const response = await axios.post(
        `${API}/bookings`,
        { equipmentId: parseInt(bookingEquipmentId), startTime: bookingStart, endTime: bookingEnd },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBookingMessage(`Booking for "${response.data.equipmentName}" submitted — pending approval.`);
      setBookingEquipmentId('');
      setBookingStart('');
      setBookingEnd('');
      fetchBookings();
    } catch (error) {
      setBookingMessage(error.response ? (error.response.data.message || 'Failed to create booking') : 'Could not reach the server');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleApproveBooking = async (id) => {
    setBookingMessage('');
    try {
      await axios.put(`${API}/bookings/${id}/approve`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setBookingMessage(`Booking #${id} confirmed.`);
      fetchBookings();
    } catch (error) {
      setBookingMessage(error.response ? (error.response.data.message || 'Failed to approve booking') : 'Could not reach the server');
    }
  };

  const handleCancelBooking = async (id) => {
    setBookingMessage('');
    try {
      await axios.put(`${API}/bookings/${id}/cancel`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setBookingMessage(`Booking #${id} cancelled.`);
      fetchBookings();
    } catch (error) {
      setBookingMessage(error.response ? (error.response.data.message || 'Failed to cancel booking') : 'Could not reach the server');
    }
  };

  const statusColor = (status) => {
    switch (status) {
      case 'PENDING_APPROVAL': return 'bg-amber-500/20 text-amber-400 border border-amber-500/30';
      case 'CONFIRMED': return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
      case 'IN_USE': return 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
      case 'COMPLETED': return 'bg-slate-500/20 text-slate-400 border border-slate-500/30';
      case 'CANCELLED': return 'bg-rose-500/20 text-rose-400 border border-rose-500/30';
      case 'NO_SHOW': return 'bg-rose-500/20 text-rose-400 border border-rose-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border border-slate-500/30';
    }
  };

  // ---------- Utilization / Heatmap / Demand ----------
  const fetchUtilization = async () => {
    try {
      const response = await axios.get(`${API}/utilization`, { headers: { Authorization: `Bearer ${token}` } });
      setUtilizationList(response.data);
    } catch (error) {
      console.error('Failed to fetch utilization', error);
    }
  };

  const fetchHeatmap = async () => {
    setHeatmapLoading(true);
    try {
      const response = await axios.get(`${API}/utilization/heatmap`, { headers: { Authorization: `Bearer ${token}` } });
      setHeatmapData(response.data);
    } catch (error) {
      console.error('Failed to fetch heatmap', error);
    } finally {
      setHeatmapLoading(false);
    }
  };

  const fetchDemandAnalysis = async () => {
    setDemandLoading(true);
    try {
      const response = await axios.get(`${API}/utilization/demand-analysis`, { headers: { Authorization: `Bearer ${token}` } });
      setDemandData(response.data);
    } catch (error) {
      console.error('Failed to fetch demand analysis', error);
    } finally {
      setDemandLoading(false);
    }
  };

  const usageLevelColor = (level) => {
    switch (level) {
      case 'Idle': return 'bg-slate-500/30 text-slate-400 border border-slate-500/30';
      case 'Low': return 'bg-amber-500/20 text-amber-400 border border-amber-500/30';
      case 'Moderate': return 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
      case 'High': return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
      default: return 'bg-slate-500/30 text-slate-400 border border-slate-500/30';
    }
  };

  const barColor = (level) => {
    switch (level) {
      case 'Idle': return 'bg-slate-500';
      case 'Low': return 'bg-amber-500';
      case 'Moderate': return 'bg-blue-500';
      case 'High': return 'bg-emerald-500';
      default: return 'bg-slate-500';
    }
  };

  // ---------- Maintenance ----------
  const fetchMaintenance = async () => {
    try {
      const response = await axios.get(`${API}/maintenance`, { headers: { Authorization: `Bearer ${token}` } });
      setMaintenanceList(response.data);
    } catch (error) {
      console.error('Failed to fetch maintenance records', error);
    }
  };

  const handleScheduleMaintenance = async (e) => {
    e.preventDefault();
    setMaintenanceLoading(true);
    setMaintenanceMessage('');
    try {
      const response = await axios.post(
        `${API}/maintenance`,
        {
          equipmentId: parseInt(maintenanceEquipmentId),
          type: maintenanceType,
          description: maintenanceDescription,
          scheduledDate: maintenanceDate,
          assignedTechnician: maintenanceTechnician,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMaintenanceMessage(`${response.data.type === 'CALIBRATION' ? 'Calibration' : 'Maintenance'} scheduled for "${response.data.equipmentName}".`);
      setMaintenanceEquipmentId('');
      setMaintenanceDescription('');
      setMaintenanceDate('');
      setMaintenanceTechnician('');
      fetchMaintenance();
    } catch (error) {
      setMaintenanceMessage(error.response ? (error.response.data.message || 'Failed to schedule maintenance') : 'Could not reach the server');
    } finally {
      setMaintenanceLoading(false);
    }
  };

  const handleMaintenanceStatusChange = async (id, newStatus) => {
    setMaintenanceMessage('');
    try {
      const response = await axios.put(`${API}/maintenance/${id}/status`, { status: newStatus }, { headers: { Authorization: `Bearer ${token}` } });
      setMaintenanceMessage(`Marked as ${response.data.status.replace('_', ' ')}.`);
      fetchMaintenance();
    } catch (error) {
      setMaintenanceMessage(error.response ? (error.response.data.message || 'Failed to update status') : 'Could not reach the server');
    }
  };

  const maintenanceStatusColor = (status) => {
    switch (status) {
      case 'SCHEDULED': return 'bg-amber-500/20 text-amber-400 border border-amber-500/30';
      case 'IN_PROGRESS': return 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
      case 'COMPLETED': return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
      case 'OVERDUE': return 'bg-rose-500/20 text-rose-400 border border-rose-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border border-slate-500/30';
    }
  };

  // ---------- Institutions ----------
  const fetchInstitutions = async () => {
    try {
      const response = await axios.get(`${API}/institutions`, { headers: { Authorization: `Bearer ${token}` } });
      setInstitutionsList(response.data);
    } catch (error) {
      console.error('Failed to fetch institutions', error);
    }
  };

  const handleAddInstitution = async (e) => {
    e.preventDefault();
    setInstitutionLoading(true);
    setInstitutionMessage('');
    try {
      const response = await axios.post(
        `${API}/institutions`,
        { name: institutionName, address: institutionAddress, contactEmail: institutionEmail },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setInstitutionMessage(`"${response.data.name}" added successfully!`);
      setInstitutionName('');
      setInstitutionAddress('');
      setInstitutionEmail('');
      fetchInstitutions();
    } catch (error) {
      setInstitutionMessage(error.response ? (error.response.data.message || 'Failed to add institution') : 'Could not reach the server');
    } finally {
      setInstitutionLoading(false);
    }
  };

  // ---------- Admin (user/role management) ----------
  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API}/admin/users`, { headers: { Authorization: `Bearer ${token}` } });
      setUsersList(response.data);
    } catch (error) {
      console.error('Failed to fetch users', error);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    setAdminMessage('');
    try {
      const response = await axios.put(`${API}/admin/users/${userId}/role`, { newRole }, { headers: { Authorization: `Bearer ${token}` } });
      setAdminMessage(`${response.data.email} is now ${response.data.role}.`);
      fetchUsers();
    } catch (error) {
      setAdminMessage(error.response ? (error.response.data.message || 'Failed to update role') : 'Could not reach the server');
    }
  };

  // ---------- Role requests (self) ----------
  const fetchMyRoleRequests = async () => {
    try {
      const response = await axios.get(`${API}/role-requests/mine`, { headers: { Authorization: `Bearer ${token}` } });
      setMyRoleRequests(response.data);
    } catch (error) {
      console.error('Failed to fetch role requests', error);
    }
  };

  const handleRoleRequestSubmit = async (e) => {
    e.preventDefault();
    setRoleRequestMessage('');
    try {
      await axios.post(`${API}/role-requests`, { requestedRole: desiredRole, reason: roleRequestReason }, { headers: { Authorization: `Bearer ${token}` } });
      setRoleRequestMessage('Request submitted — waiting for admin approval.');
      setRoleRequestReason('');
      fetchMyRoleRequests();
    } catch (error) {
      setRoleRequestMessage(error.response ? (error.response.data.message || 'Failed to submit request') : 'Could not reach the server');
    }
  };

  const roleRequestStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'bg-amber-500/20 text-amber-400 border border-amber-500/30';
      case 'APPROVED': return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
      case 'REJECTED': return 'bg-rose-500/20 text-rose-400 border border-rose-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border border-slate-500/30';
    }
  };

  // ---------- Role requests (admin) ----------
  const fetchAllRoleRequests = async () => {
    try {
      const response = await axios.get(`${API}/role-requests`, { headers: { Authorization: `Bearer ${token}` } });
      setAllRoleRequests(response.data);
    } catch (error) {
      console.error('Failed to fetch role requests', error);
    }
  };

  const handleApproveRoleRequest = async (id) => {
    setRoleRequestAdminMessage('');
    try {
      await axios.put(`${API}/role-requests/${id}/approve`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setRoleRequestAdminMessage(`Request #${id} approved.`);
      fetchAllRoleRequests();
    } catch (error) {
      setRoleRequestAdminMessage(error.response ? (error.response.data.message || 'Failed to approve') : 'Could not reach the server');
    }
  };

  const handleRejectRoleRequest = async (id) => {
    setRoleRequestAdminMessage('');
    try {
      await axios.put(`${API}/role-requests/${id}/reject`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setRoleRequestAdminMessage(`Request #${id} rejected.`);
      fetchAllRoleRequests();
    } catch (error) {
      setRoleRequestAdminMessage(error.response ? (error.response.data.message || 'Failed to reject') : 'Could not reach the server');
    }
  };

  // ---------- Sharing ----------
  const fetchSharingRequests = async () => {
    try {
      const response = await axios.get(`${API}/sharing-requests`, { headers: { Authorization: `Bearer ${token}` } });
      setSharingRequestsList(response.data);
    } catch (error) {
      console.error('Failed to fetch sharing requests', error);
    }
  };

  const fetchSharableEquipment = async () => {
    try {
      const response = await axios.get(`${API}/equipment`, { headers: { Authorization: `Bearer ${token}` } });
      setSharableEquipment(response.data.filter((item) => item.institutionId));
    } catch (error) {
      console.error('Failed to fetch equipment', error);
    }
  };

  const handleCreateSharingRequest = async (e) => {
    e.preventDefault();
    setSharingLoading(true);
    setSharingMessage('');
    try {
      const response = await axios.post(
        `${API}/sharing-requests`,
        { equipmentId: parseInt(sharingEquipmentId), requestingInstitutionId: parseInt(sharingInstitutionId), reason: sharingReason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSharingMessage(`Sharing request for "${response.data.equipmentName}" submitted — pending approval.`);
      setSharingEquipmentId('');
      setSharingInstitutionId('');
      setSharingReason('');
      fetchSharingRequests();
    } catch (error) {
      setSharingMessage(error.response ? (error.response.data.message || 'Failed to submit sharing request') : 'Could not reach the server');
    } finally {
      setSharingLoading(false);
    }
  };

  const handleApproveSharing = async (id) => {
    setSharingMessage('');
    try {
      await axios.put(`${API}/sharing-requests/${id}/approve`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setSharingMessage(`Sharing request #${id} approved.`);
      fetchSharingRequests();
    } catch (error) {
      setSharingMessage(error.response ? (error.response.data.message || 'Failed to approve') : 'Could not reach the server');
    }
  };

  const handleRejectSharing = async (id) => {
    setSharingMessage('');
    try {
      await axios.put(`${API}/sharing-requests/${id}/reject`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setSharingMessage(`Sharing request #${id} rejected.`);
      fetchSharingRequests();
    } catch (error) {
      setSharingMessage(error.response ? (error.response.data.message || 'Failed to reject') : 'Could not reach the server');
    }
  };

  const sharingStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'bg-amber-500/20 text-amber-400 border border-amber-500/30';
      case 'APPROVED': return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
      case 'REJECTED': return 'bg-rose-500/20 text-rose-400 border border-rose-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border border-slate-500/30';
    }
  };

  const institutionNameById = (id) => {
    const inst = allInstitutionsForDropdown.find((i) => i.id === id) || publicInstitutions.find((i) => i.id === id);
    return inst ? inst.name : `Institution #${id}`;
  };

  // ---------- Waitlist ----------
  const fetchMyWaitlist = async () => {
    try {
      const response = await axios.get(`${API}/waitlist/mine`, { headers: { Authorization: `Bearer ${token}` } });
      setMyWaitlistEntries(response.data);
    } catch (error) {
      console.error('Failed to fetch my waitlist entries', error);
    }
  };

  const fetchAllWaitlist = async () => {
    try {
      const response = await axios.get(`${API}/waitlist`, { headers: { Authorization: `Bearer ${token}` } });
      setAllWaitlistEntries(response.data);
    } catch (error) {
      console.error('Failed to fetch waitlist', error);
    }
  };

  const fetchWaitlistEquipmentOptions = async () => {
    try {
      const response = await axios.get(`${API}/equipment`, { headers: { Authorization: `Bearer ${token}` } });
      setWaitlistEquipmentOptions(response.data);
    } catch (error) {
      console.error('Failed to fetch equipment', error);
    }
  };

  const handleJoinWaitlist = async (e) => {
    e.preventDefault();
    setWaitlistLoading(true);
    setWaitlistMessage('');
    try {
      const response = await axios.post(`${API}/waitlist`, { equipmentId: parseInt(waitlistEquipmentId) }, { headers: { Authorization: `Bearer ${token}` } });
      setWaitlistMessage(`Joined the waitlist for "${response.data.equipmentName}".`);
      setWaitlistEquipmentId('');
      fetchMyWaitlist();
      fetchAllWaitlist();
    } catch (error) {
      setWaitlistMessage(error.response ? (error.response.data.message || 'Failed to join waitlist') : 'Could not reach the server');
    } finally {
      setWaitlistLoading(false);
    }
  };

  const handleLeaveWaitlist = async (id) => {
    setWaitlistMessage('');
    try {
      await axios.delete(`${API}/waitlist/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setWaitlistMessage('Removed from waitlist.');
      fetchMyWaitlist();
      fetchAllWaitlist();
    } catch (error) {
      setWaitlistMessage(error.response ? (error.response.data.message || 'Failed to leave waitlist') : 'Could not reach the server');
    }
  };

  const handleFulfillWaitlistEntry = async (id) => {
    setWaitlistMessage('');
    try {
      await axios.put(`${API}/waitlist/${id}/fulfill`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setWaitlistMessage(`Waitlist entry #${id} marked as fulfilled.`);
      fetchAllWaitlist();
    } catch (error) {
      setWaitlistMessage(error.response ? (error.response.data.message || 'Failed to update waitlist entry') : 'Could not reach the server');
    }
  };

  const waitlistStatusColor = (status) => {
    switch (status) {
      case 'WAITING': return 'bg-slate-500/20 text-slate-400 border border-slate-500/30';
      case 'NOTIFIED': return 'bg-amber-500/20 text-amber-400 border border-amber-500/30';
      case 'FULFILLED': return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
      case 'CANCELLED': return 'bg-rose-500/20 text-rose-400 border border-rose-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border border-slate-500/30';
    }
  };

  // ---------- Tab navigation ----------
  const selectPanel = (key) => {
    setActivePanel(key);
    if (key === 'overview') {
      fetchBookings(); fetchRequests(); fetchMyWaitlist(); fetchUtilization();
      fetchMaintenance(); fetchSharingRequests(); fetchMyRoleRequests();
    }
    if (key === 'booking') { fetchBookings(); fetchAvailableEquipment(); }
    if (key === 'utilization') { fetchUtilization(); }
    if (key === 'heatmap') { fetchHeatmap(); }
    if (key === 'demand') { fetchDemandAnalysis(); }
    if (key === 'sharing') { fetchSharingRequests(); fetchSharableEquipment(); fetchAllInstitutionsForDropdown(); }
    if (key === 'waitlist') { fetchMyWaitlist(); fetchAllWaitlist(); fetchWaitlistEquipmentOptions(); }
    if (key === 'maintenance') { fetchMaintenance(); fetchAvailableEquipment(); }
    if (key === 'equipment') { fetchEquipment(); fetchAllInstitutionsForDropdown(); }
    if (key === 'requests') { fetchRequests(); }
    if (key === 'institutions') { fetchInstitutions(); }
    if (key === 'users') { fetchUsers(); }
    if (key === 'roleRequestsAdmin') { fetchAllRoleRequests(); }
    if (key === 'roleRequest') { fetchMyRoleRequests(); }
  };

  // ==================== IF LOGGED IN: DARK PROFESSIONAL DASHBOARD ====================
  if (token) {
    const navItems = getNavItems(userRole);

    const myBookingsCount = bookingsList.filter((b) => b.bookedBy === userEmail).length;
    const myRequestsCount = requestsList.filter((r) => r.requestedBy === userEmail).length;
    const myWaitlistCount = myWaitlistEntries.length;
    const pendingApprovalsCount = bookingsList.filter((b) => b.status === 'PENDING_APPROVAL').length;
    const idleAlertCount = utilizationList.filter((s) => s.idleAlert).length;
    const topEquipment = [...utilizationList].sort((a, b) => b.totalBookings - a.totalBookings).slice(0, 3);
    const pendingRoleRequest = myRoleRequests.find((r) => r.status === 'PENDING');

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex">
        {/* Dark Professional Sidebar */}
        <aside className="w-64 shrink-0 bg-slate-800/95 backdrop-blur-xl border-r border-slate-700 flex flex-col py-6 px-5 min-h-screen sticky top-0 shadow-2xl shadow-slate-900/50">
          <div className="flex items-center gap-3 mb-8 px-1">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
              <FlaskConical size={20} strokeWidth={1.8} />
            </div>
            <div>
              <span className="font-bold text-white text-base leading-tight block">LabResource</span>
              <span className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">Platform</span>
            </div>
          </div>

          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 text-white flex items-center justify-center text-2xl font-bold shadow-lg shadow-blue-500/30 ring-4 ring-slate-700">
              {(userName || userEmail || '?').charAt(0).toUpperCase()}
            </div>
            <div className="font-semibold text-white text-sm mt-3">{userName || userEmail}</div>
            <div className="text-xs text-slate-400 mt-0.5 bg-slate-700 px-3 py-0.5 rounded-full">
              {userRole.replace('_', ' ')}
            </div>
          </div>

          <nav className="flex-1 space-y-0.5">
            {navItems.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => selectPanel(key)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  activePanel === key
                    ? 'bg-gradient-to-r from-blue-500/20 to-indigo-500/20 text-blue-400 border border-blue-500/30 shadow-lg shadow-blue-500/10'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <Icon size={18} className={activePanel === key ? 'text-blue-400' : 'text-slate-500'} />
                {label}
                {key === 'overview' && pendingApprovalsCount > 0 && (
                  <span className="ml-auto bg-rose-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold shadow-lg shadow-rose-500/30">
                    {pendingApprovalsCount}
                  </span>
                )}
              </button>
            ))}
          </nav>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all duration-200 mt-4 group"
          >
            <LogOut size={18} className="group-hover:text-rose-400 transition-colors" />
            <span>Log out</span>
          </button>
        </aside>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <header className="bg-slate-800/95 backdrop-blur-xl border-b border-slate-700 px-8 py-4 flex items-center justify-between sticky top-0 z-20">
            <div className="hidden md:flex items-center flex-1 max-w-sm relative">
              <Search size={16} className="absolute left-3 text-slate-500" />
              <input
                type="text"
                placeholder="Search equipment, bookings..."
                className="w-full pl-9 pr-3 py-2.5 bg-slate-700/50 border border-slate-600 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none placeholder:text-slate-500 text-white transition-all"
                disabled
              />
            </div>
            <div className="flex items-center gap-4 ml-auto">
              <button className="relative p-2 rounded-xl hover:bg-slate-700 transition-colors">
                <Bell size={20} className="text-slate-400" />
                {(idleAlertCount > 0 || pendingRoleRequest) && (
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full animate-pulse ring-2 ring-slate-800"></span>
                )}
              </button>
              <div className="w-px h-8 bg-slate-700"></div>
              <button className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-700 transition-colors">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 text-white flex items-center justify-center text-sm font-semibold shadow-lg shadow-blue-500/20">
                  {(userName || userEmail || '?').charAt(0).toUpperCase()}
                </div>
                <ChevronDown size={16} className="text-slate-400" />
              </button>
            </div>
          </header>

          <main className="p-8 max-w-7xl mx-auto space-y-6">
            {/* ---------- OVERVIEW (Dark Professional) ---------- */}
            {activePanel === 'overview' && (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-white mb-1">Dashboard</h1>
                    <p className="text-slate-400 text-sm">Welcome back, {userName || userEmail}.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full font-medium border border-emerald-500/30">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1 animate-pulse"></span>
                      Online
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-slate-800/90 rounded-2xl border border-slate-700 shadow-sm p-5 hover:border-slate-600 transition-all">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-400">My Bookings</p>
                        <p className="text-2xl font-bold text-white mt-1">{myBookingsCount}</p>
                      </div>
                      <div className="p-3 rounded-xl bg-blue-500/20 text-blue-400">
                        <Calendar size={20} />
                      </div>
                    </div>
                  </div>
                  <div className="bg-slate-800/90 rounded-2xl border border-slate-700 shadow-sm p-5 hover:border-slate-600 transition-all">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-400">Access Requests</p>
                        <p className="text-2xl font-bold text-white mt-1">{myRequestsCount}</p>
                      </div>
                      <div className="p-3 rounded-xl bg-amber-500/20 text-amber-400">
                        <ClipboardList size={20} />
                      </div>
                    </div>
                  </div>
                  <div className="bg-slate-800/90 rounded-2xl border border-slate-700 shadow-sm p-5 hover:border-slate-600 transition-all">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-400">Waitlist</p>
                        <p className="text-2xl font-bold text-white mt-1">{myWaitlistCount}</p>
                      </div>
                      <div className="p-3 rounded-xl bg-purple-500/20 text-purple-400">
                        <Clock size={20} />
                      </div>
                    </div>
                  </div>
                  <div className="bg-slate-800/90 rounded-2xl border border-slate-700 shadow-sm p-5 hover:border-slate-600 transition-all">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-400">Pending Approvals</p>
                        <p className="text-2xl font-bold text-white mt-1">{pendingApprovalsCount}</p>
                      </div>
                      <div className="p-3 rounded-xl bg-rose-500/20 text-rose-400">
                        <AlertCircle size={20} />
                      </div>
                    </div>
                  </div>
                </div>

                {pendingRoleRequest ? (
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white flex items-center justify-between shadow-lg shadow-blue-500/20">
                    <div>
                      <div className="font-semibold text-lg">Role Request Pending</div>
                      <div className="text-blue-100/80 text-sm">
                        Your request for {pendingRoleRequest.requestedRole.replace('_', ' ')} is awaiting admin approval.
                      </div>
                    </div>
                    <GraduationCap size={32} className="opacity-80" />
                  </div>
                ) : idleAlertCount > 0 ? (
                  <div className="bg-gradient-to-r from-rose-500 to-orange-500 rounded-2xl p-6 text-white flex items-center justify-between shadow-lg shadow-rose-500/20">
                    <div>
                      <div className="font-semibold text-lg">{idleAlertCount} Equipment Idle 14+ Days</div>
                      <div className="text-rose-100/80 text-sm">Check the Utilization tab for details.</div>
                    </div>
                    <BarChart3 size={32} className="opacity-80" />
                  </div>
                ) : (
                  <div className="bg-slate-800/90 rounded-2xl border border-slate-700 shadow-sm p-5 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-white">All Caught Up</div>
                      <div className="text-sm text-slate-400">No pending approvals or alerts right now.</div>
                    </div>
                    <ShieldCheck size={28} className="text-emerald-400" />
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 bg-slate-800/90 rounded-2xl border border-slate-700 shadow-sm p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-semibold text-white">Activity — Bookings by Hour</h3>
                      <button
                        onClick={() => fetchDemandAnalysis()}
                        className="text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors"
                      >
                        Refresh
                      </button>
                    </div>
                    {!demandData && <p className="text-sm text-slate-400">Loading...</p>}
                    {demandData && (
                      <div className="flex items-end gap-1 h-32">
                        {demandData.hourly.map((h) => {
                          const max = Math.max(...demandData.hourly.map((x) => x.count), 1);
                          return (
                            <div key={h.hour} className="flex-1 flex flex-col items-center justify-end h-full">
                              <div
                                className="w-full bg-gradient-to-t from-blue-500 to-indigo-500 rounded-t transition-all hover:from-blue-400 hover:to-indigo-400"
                                style={{ height: `${(h.count / max) * 100}%`, minHeight: h.count > 0 ? '4px' : '0px' }}
                                title={`${h.hour}:00 — ${h.count} bookings`}
                              ></div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div className="bg-slate-800/90 rounded-2xl border border-slate-700 shadow-sm p-6">
                    <h3 className="font-semibold text-white mb-4">Most Booked Equipment</h3>
                    <div className="space-y-3">
                      {topEquipment.length === 0 && <p className="text-sm text-slate-400">No booking data yet.</p>}
                      {topEquipment.map((eq, i) => (
                        <div key={eq.equipmentId} className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold">
                            {i + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-white capitalize truncate">{eq.equipmentName}</div>
                            <div className="text-xs text-slate-400">{eq.totalBookings} bookings</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-2xl p-6 border border-blue-500/20">
                  <h3 className="font-semibold text-white mb-4">Quick Module Stats</h3>
                  <div className="flex flex-wrap gap-3">
                    <div className="bg-slate-800/90 rounded-xl px-4 py-3 flex-1 min-w-[110px] border border-slate-700">
                      <div className="text-xs text-slate-400">Bookings</div>
                      <div className="text-xl font-bold text-white">{bookingsList.length}</div>
                    </div>
                    <div className="bg-slate-800/90 rounded-xl px-4 py-3 flex-1 min-w-[110px] border border-slate-700">
                      <div className="text-xs text-slate-400">Equipment</div>
                      <div className="text-xl font-bold text-white">{utilizationList.length}</div>
                    </div>
                    <div className="bg-slate-800/90 rounded-xl px-4 py-3 flex-1 min-w-[110px] border border-slate-700">
                      <div className="text-xs text-slate-400">Maintenance</div>
                      <div className="text-xl font-bold text-white">{maintenanceList.length}</div>
                    </div>
                    <div className="bg-slate-800/90 rounded-xl px-4 py-3 flex-1 min-w-[110px] border border-slate-700">
                      <div className="text-xs text-slate-400">Sharing</div>
                      <div className="text-xl font-bold text-white">{sharingRequestsList.length}</div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* ---------- BOOKING (Dark Professional) ---------- */}
            {activePanel === 'booking' && (
              <Panel title="Equipment Booking" icon={Calendar}>
                <form onSubmit={handleCreateBooking} className="space-y-3 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Equipment</label>
                    <select
                      value={bookingEquipmentId}
                      onChange={(e) => setBookingEquipmentId(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none transition-all text-white"
                      required
                    >
                      <option value="" className="bg-slate-800">Select equipment...</option>
                      {availableEquipment.map((item) => (
                        <option key={item.id} value={item.id} className="bg-slate-800">{item.name} ({item.category})</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Start Time</label>
                      <input
                        type="datetime-local"
                        value={bookingStart}
                        onChange={(e) => setBookingStart(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none transition-all text-white [color-scheme:dark]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">End Time</label>
                      <input
                        type="datetime-local"
                        value={bookingEnd}
                        onChange={(e) => setBookingEnd(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none transition-all text-white [color-scheme:dark]"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={bookingLoading}
                    className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-all shadow-lg shadow-blue-500/25 disabled:opacity-50"
                  >
                    {bookingLoading ? 'Submitting...' : 'Submit Booking'}
                  </button>
                </form>

                {bookingMessage && (
                  <div className={`text-sm p-3 rounded-lg mb-4 ${
                    bookingMessage.includes('submitted') || bookingMessage.includes('confirmed') || bookingMessage.includes('cancelled')
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  }`}>
                    {bookingMessage}
                  </div>
                )}

                <h4 className="text-sm font-medium text-slate-300 mb-2">All Bookings</h4>
                <div className="space-y-2">
                  {bookingsList.length === 0 && <p className="text-sm text-slate-400">No bookings yet.</p>}
                  {bookingsList.map((booking) => (
                    <div key={booking.id} className="flex justify-between items-center bg-slate-700/30 px-3 py-2 rounded-lg text-sm border border-slate-700">
                      <div>
                        <span className="font-medium text-white capitalize">{booking.equipmentName}</span>
                        <span className="text-slate-400 ml-2 text-xs">
                          {new Date(booking.startTime).toLocaleString()} → {new Date(booking.endTime).toLocaleString()}
                        </span>
                        <span className="text-slate-400 ml-2 text-xs">by {booking.bookedBy}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${statusColor(booking.status)}`}>{booking.status.replace('_', ' ')}</span>
                        {userRole === 'LAB_MANAGER' && booking.status === 'PENDING_APPROVAL' && (
                          <>
                            <button onClick={() => handleApproveBooking(booking.id)} className="text-xs bg-emerald-500 hover:bg-emerald-600 text-white px-2.5 py-1 rounded-lg font-medium transition-colors">Approve</button>
                            <button onClick={() => handleCancelBooking(booking.id)} className="text-xs bg-rose-500 hover:bg-rose-600 text-white px-2.5 py-1 rounded-lg font-medium transition-colors">Cancel</button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>
            )}

            {/* ---------- UTILIZATION (Dark Professional) ---------- */}
            {activePanel === 'utilization' && (
              <Panel title="Equipment Utilization" icon={BarChart3}>
                <p className="text-xs text-slate-400 mb-3">Based on confirmed bookings over the last 30 days</p>
                <div className="space-y-3">
                  {utilizationList.length === 0 && <p className="text-sm text-slate-400">No equipment found.</p>}
                  {utilizationList.map((stat) => (
                    <div key={stat.equipmentId} className="bg-slate-700/30 px-3 py-3 rounded-lg border border-slate-700">
                      <div className="flex justify-between items-center mb-1">
                        <div>
                          <span className="font-medium text-white capitalize text-sm">{stat.equipmentName}</span>
                          <span className="text-slate-400 ml-2 text-xs capitalize">{stat.category}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {stat.idleAlert && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30">Idle Alert · {stat.idleDays}d</span>
                          )}
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${usageLevelColor(stat.usageLevel)}`}>{stat.usageLevel}</span>
                        </div>
                      </div>
                      <div className="w-full bg-slate-600 rounded-full h-2 mb-1">
                        <div className={`h-2 rounded-full ${barColor(stat.usageLevel)}`} style={{ width: `${Math.max(stat.utilizationRate, 2)}%` }}></div>
                      </div>
                      <div className="text-xs text-slate-400">
                        {stat.utilizationRate}% utilized · {stat.bookedHours}h booked · {stat.totalBookings} booking{stat.totalBookings !== 1 ? 's' : ''}
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>
            )}

            {/* ---------- HEATMAP (Dark Professional) ---------- */}
            {activePanel === 'heatmap' && (
              <Panel title="Utilization Heatmap (last 7 days)" icon={Flame}>
                {heatmapLoading && <p className="text-sm text-slate-400">Loading heatmap...</p>}
                {!heatmapLoading && (!heatmapData || heatmapData.rows.length === 0) && (
                  <p className="text-sm text-slate-400">No equipment data available.</p>
                )}
                {!heatmapLoading && heatmapData && heatmapData.rows.length > 0 && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs border-collapse">
                      <thead>
                        <tr>
                          <th className="text-left p-2 text-slate-400 font-medium">Equipment</th>
                          {heatmapData.days.map((d) => (
                            <th key={d} className="p-1 text-center text-slate-500 font-normal">{d.slice(5)}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {heatmapData.rows.map((row) => (
                          <tr key={row.equipmentId}>
                            <td className="p-2 font-medium capitalize text-white">{row.equipmentName}</td>
                            {row.dailyHours.map((h, i) => {
                              const intensity = Math.min(1, h / 8);
                              return (
                                <td key={i} className="p-1 text-center">
                                  <div
                                    title={`${h}h booked`}
                                    className="w-8 h-8 rounded mx-auto flex items-center justify-center text-[10px] text-white transition-all hover:scale-110"
                                    style={{ backgroundColor: h === 0 ? '#1e293b' : `rgba(59,130,246,${0.3 + intensity * 0.6})` }}
                                  >
                                    {h > 0 ? h : ''}
                                  </div>
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Panel>
            )}

            {/* ---------- DEMAND ANALYSIS (Dark Professional) ---------- */}
            {activePanel === 'demand' && (
              <Panel title="Demand Analysis" icon={TrendingUp}>
                {demandLoading && <p className="text-sm text-slate-400">Loading demand data...</p>}
                {!demandLoading && demandData && (
                  <>
                    <h4 className="text-sm font-medium text-slate-300 mb-2">Bookings by Hour of Day</h4>
                    <div className="flex items-end gap-1 h-28 mb-6">
                      {demandData.hourly.map((h) => {
                        const max = Math.max(...demandData.hourly.map((x) => x.count), 1);
                        return (
                          <div key={h.hour} className="flex-1 flex flex-col items-center justify-end h-full">
                            <div
                              className="w-full bg-gradient-to-t from-blue-500 to-indigo-500 rounded-t transition-all hover:from-blue-400 hover:to-indigo-400"
                              style={{ height: `${(h.count / max) * 100}%`, minHeight: h.count > 0 ? '4px' : '0px' }}
                              title={`${h.hour}:00 — ${h.count} bookings`}
                            ></div>
                            {h.hour % 3 === 0 && <span className="text-[9px] text-slate-500 mt-1">{h.hour}h</span>}
                          </div>
                        );
                      })}
                    </div>

                    <h4 className="text-sm font-medium text-slate-300 mb-2">Bookings by Day of Week</h4>
                    <div className="flex items-end gap-2 h-28">
                      {demandData.byDayOfWeek.map((d) => {
                        const max = Math.max(...demandData.byDayOfWeek.map((x) => x.count), 1);
                        return (
                          <div key={d.dayOfWeek} className="flex-1 flex flex-col items-center justify-end h-full">
                            <div
                              className="w-full bg-gradient-to-t from-purple-500 to-pink-500 rounded-t transition-all hover:from-purple-400 hover:to-pink-400"
                              style={{ height: `${(d.count / max) * 100}%`, minHeight: d.count > 0 ? '4px' : '0px' }}
                              title={`${d.count} bookings`}
                            ></div>
                            <span className="text-[9px] text-slate-500 mt-1">{d.dayOfWeek.slice(0, 3)}</span>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </Panel>
            )}

            {/* ---------- SHARING (Dark Professional) ---------- */}
            {activePanel === 'sharing' && (
              <Panel title="Inter-Institution Sharing" icon={Share2}>
                <form onSubmit={handleCreateSharingRequest} className="space-y-3 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Equipment (from another institution)</label>
                    <select
                      value={sharingEquipmentId}
                      onChange={(e) => setSharingEquipmentId(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none transition-all text-white"
                      required
                    >
                      <option value="" className="bg-slate-800">Select equipment...</option>
                      {sharableEquipment.map((item) => (
                        <option key={item.id} value={item.id} className="bg-slate-800">{item.name} — owned by {institutionNameById(item.institutionId)}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Your Institution</label>
                    <select
                      value={sharingInstitutionId}
                      onChange={(e) => setSharingInstitutionId(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none transition-all text-white"
                      required
                    >
                      <option value="" className="bg-slate-800">Select your institution...</option>
                      {allInstitutionsForDropdown.map((inst) => (
                        <option key={inst.id} value={inst.id} className="bg-slate-800">{inst.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Reason</label>
                    <input
                      type="text"
                      value={sharingReason}
                      onChange={(e) => setSharingReason(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none transition-all text-white"
                      placeholder="e.g. Need mass spec access for joint research"
                      required
                    />
                  </div>
                  <button type="submit" disabled={sharingLoading} className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-all shadow-lg shadow-blue-500/25 disabled:opacity-50">
                    {sharingLoading ? 'Submitting...' : 'Request Access'}
                  </button>
                </form>

                {sharingMessage && (
                  <div className={`text-sm p-3 rounded-lg mb-4 ${
                    sharingMessage.includes('submitted') || sharingMessage.includes('approved') || sharingMessage.includes('rejected')
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  }`}>
                    {sharingMessage}
                  </div>
                )}

                <h4 className="text-sm font-medium text-slate-300 mb-2">All Sharing Requests</h4>
                <div className="space-y-2">
                  {sharingRequestsList.length === 0 && <p className="text-sm text-slate-400">No sharing requests yet.</p>}
                  {sharingRequestsList.map((req) => (
                    <div key={req.id} className="bg-slate-700/30 px-3 py-2 rounded-lg text-sm border border-slate-700">
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="font-medium text-white capitalize">{req.equipmentName}</span>
                          <span className="text-slate-400 ml-2 text-xs">
                            {institutionNameById(req.requestingInstitutionId)} requesting from {institutionNameById(req.ownerInstitutionId)}
                          </span>
                        </div>
                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${sharingStatusColor(req.status)}`}>{req.status}</span>
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-xs text-slate-400">by {req.requestedBy} — {req.reason}</span>
                        {userRole === 'INSTITUTION_ADMINISTRATOR' && req.status === 'PENDING' && (
                          <div className="flex gap-1">
                            <button onClick={() => handleApproveSharing(req.id)} className="text-xs bg-emerald-500 hover:bg-emerald-600 text-white px-2.5 py-1 rounded-lg font-medium transition-colors">Approve</button>
                            <button onClick={() => handleRejectSharing(req.id)} className="text-xs bg-rose-500 hover:bg-rose-600 text-white px-2.5 py-1 rounded-lg font-medium transition-colors">Reject</button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>
            )}

            {/* ---------- WAITLIST (Dark Professional) ---------- */}
            {activePanel === 'waitlist' && (
              <Panel title="Equipment Waitlist" icon={Clock}>
                <p className="text-xs text-slate-400 mb-3">Join the waitlist for high-demand equipment — you'll be notified in order when a slot frees up.</p>
                <form onSubmit={handleJoinWaitlist} className="space-y-3 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Equipment</label>
                    <select
                      value={waitlistEquipmentId}
                      onChange={(e) => setWaitlistEquipmentId(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none transition-all text-white"
                      required
                    >
                      <option value="" className="bg-slate-800">Select equipment...</option>
                      {waitlistEquipmentOptions.map((item) => (
                        <option key={item.id} value={item.id} className="bg-slate-800">{item.name} ({item.category})</option>
                      ))}
                    </select>
                  </div>
                  <button type="submit" disabled={waitlistLoading} className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-all shadow-lg shadow-blue-500/25 disabled:opacity-50">
                    {waitlistLoading ? 'Joining...' : 'Join Waitlist'}
                  </button>
                </form>

                {waitlistMessage && (
                  <div className={`text-sm p-3 rounded-lg mb-4 ${
                    waitlistMessage.includes('Joined') || waitlistMessage.includes('Removed') || waitlistMessage.includes('fulfilled')
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  }`}>
                    {waitlistMessage}
                  </div>
                )}

                <h4 className="text-sm font-medium text-slate-300 mb-2">My Waitlist Entries</h4>
                <div className="space-y-2 mb-6">
                  {myWaitlistEntries.length === 0 && <p className="text-sm text-slate-400">You're not on any waitlists yet.</p>}
                  {myWaitlistEntries.map((entry) => (
                    <div key={entry.id} className="flex justify-between items-center bg-slate-700/30 px-3 py-2 rounded-lg text-sm border border-slate-700">
                      <span className="font-medium text-white capitalize">{entry.equipmentName}</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${waitlistStatusColor(entry.status)}`}>
                          {entry.status}{entry.status === 'NOTIFIED' && ' — a slot is free, book now!'}
                        </span>
                        {entry.status === 'WAITING' && (
                          <button onClick={() => handleLeaveWaitlist(entry.id)} className="text-xs bg-rose-500 hover:bg-rose-600 text-white px-2.5 py-1 rounded-lg font-medium transition-colors">Leave</button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <h4 className="text-sm font-medium text-slate-300 mb-2">All Waitlist Entries</h4>
                <div className="space-y-2">
                  {allWaitlistEntries.length === 0 && <p className="text-sm text-slate-400">No one is on a waitlist yet.</p>}
                  {allWaitlistEntries.map((entry) => (
                    <div key={entry.id} className="flex justify-between items-center bg-slate-700/30 px-3 py-2 rounded-lg text-sm border border-slate-700">
                      <div>
                        <span className="font-medium text-white capitalize">{entry.equipmentName}</span>
                        <span className="text-slate-400 ml-2 text-xs">{entry.userEmail}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${waitlistStatusColor(entry.status)}`}>{entry.status}</span>
                        {userRole === 'LAB_MANAGER' && entry.status !== 'FULFILLED' && entry.status !== 'CANCELLED' && (
                          <button onClick={() => handleFulfillWaitlistEntry(entry.id)} className="text-xs bg-emerald-500 hover:bg-emerald-600 text-white px-2.5 py-1 rounded-lg font-medium transition-colors">Mark Fulfilled</button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>
            )}

            {/* ---------- MAINTENANCE (Dark Professional) ---------- */}
            {activePanel === 'maintenance' && (userRole === 'LAB_MANAGER' || userRole === 'LAB_TECHNICIAN') && (
              <Panel title="Maintenance & Calibration" icon={Wrench}>
                {userRole === 'LAB_MANAGER' && (
                  <form onSubmit={handleScheduleMaintenance} className="space-y-3 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Equipment</label>
                      <select
                        value={maintenanceEquipmentId}
                        onChange={(e) => setMaintenanceEquipmentId(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none transition-all text-white"
                        required
                      >
                        <option value="" className="bg-slate-800">Select equipment...</option>
                        {availableEquipment.map((item) => (
                          <option key={item.id} value={item.id} className="bg-slate-800">{item.name} ({item.category})</option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Type</label>
                        <select
                          value={maintenanceType}
                          onChange={(e) => setMaintenanceType(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none transition-all text-white"
                        >
                          <option value="MAINTENANCE">Maintenance</option>
                          <option value="CALIBRATION">Calibration</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Scheduled Date</label>
                        <input
                          type="date"
                          value={maintenanceDate}
                          onChange={(e) => setMaintenanceDate(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none transition-all text-white [color-scheme:dark]"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
                      <input
                        type="text"
                        value={maintenanceDescription}
                        onChange={(e) => setMaintenanceDescription(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none transition-all text-white"
                        placeholder="e.g. Annual calibration check"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Assigned Technician (email)</label>
                      <input
                        type="email"
                        value={maintenanceTechnician}
                        onChange={(e) => setMaintenanceTechnician(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none transition-all text-white"
                        placeholder="e.g. john@test.com"
                        required
                      />
                    </div>
                    <button type="submit" disabled={maintenanceLoading} className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-all shadow-lg shadow-blue-500/25 disabled:opacity-50">
                      {maintenanceLoading ? 'Scheduling...' : 'Schedule'}
                    </button>
                  </form>
                )}

                {maintenanceMessage && (
                  <div className={`text-sm p-3 rounded-lg mb-4 ${
                    maintenanceMessage.includes('scheduled') || maintenanceMessage.includes('Marked')
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  }`}>
                    {maintenanceMessage}
                  </div>
                )}

                <h4 className="text-sm font-medium text-slate-300 mb-2">Maintenance Records</h4>
                <div className="space-y-2">
                  {maintenanceList.length === 0 && <p className="text-sm text-slate-400">No maintenance records yet.</p>}
                  {maintenanceList.map((rec) => (
                    <div key={rec.id} className="bg-slate-700/30 px-3 py-2 rounded-lg text-sm border border-slate-700">
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="font-medium text-white capitalize">{rec.equipmentName}</span>
                          <span className="text-slate-400 ml-2 text-xs">{rec.type} · {rec.description}</span>
                        </div>
                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${maintenanceStatusColor(rec.status)}`}>{rec.status.replace('_', ' ')}</span>
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-xs text-slate-400">
                          Scheduled: {rec.scheduledDate} · Technician: {rec.assignedTechnician}
                          {rec.completedDate && ` · Completed: ${rec.completedDate}`}
                        </span>
                        {rec.status !== 'COMPLETED' && (
                          <div className="flex gap-1">
                            {rec.status === 'SCHEDULED' && (
                              <button onClick={() => handleMaintenanceStatusChange(rec.id, 'IN_PROGRESS')} className="text-xs bg-blue-500 hover:bg-blue-600 text-white px-2.5 py-1 rounded-lg font-medium transition-colors">Start</button>
                            )}
                            <button onClick={() => handleMaintenanceStatusChange(rec.id, 'COMPLETED')} className="text-xs bg-emerald-500 hover:bg-emerald-600 text-white px-2.5 py-1 rounded-lg font-medium transition-colors">Complete</button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>
            )}

            {/* ---------- EQUIPMENT (Dark Professional) ---------- */}
            {activePanel === 'equipment' && userRole === 'LAB_MANAGER' && (
              <Panel title="Equipment Inventory" icon={FlaskConical}>
                <form onSubmit={handleAddEquipment} className="space-y-3 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Equipment Name</label>
                    <input
                      type="text"
                      value={equipmentName}
                      onChange={(e) => setEquipmentName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none transition-all text-white"
                      placeholder="e.g. Centrifuge"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Category</label>
                    <input
                      type="text"
                      value={equipmentCategory}
                      onChange={(e) => setEquipmentCategory(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none transition-all text-white"
                      placeholder="e.g. Lab Equipment"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
                    <textarea
                      value={equipmentDescription}
                      onChange={(e) => setEquipmentDescription(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none transition-all text-white"
                      placeholder="e.g. High-speed benchtop centrifuge, max 15,000 rpm"
                      rows={2}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Institution (optional)</label>
                    <select
                      value={equipmentInstitutionId}
                      onChange={(e) => setEquipmentInstitutionId(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none transition-all text-white"
                    >
                      <option value="" className="bg-slate-800">Unassigned</option>
                      {allInstitutionsForDropdown.map((inst) => (
                        <option key={inst.id} value={inst.id} className="bg-slate-800">{inst.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Photo (optional)</label>
                    <div className="flex gap-2 mb-2">
                      <button
                        type="button"
                        onClick={() => setShowCameraModal(true)}
                        className="bg-blue-500/20 text-blue-400 border border-blue-500/30 px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-1.5 hover:bg-blue-500/30 transition-colors"
                      >
                        <Camera size={14} /> Take Photo
                      </button>
                      <label className="cursor-pointer bg-slate-700/50 text-slate-300 border border-slate-600 px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-1.5 hover:bg-slate-600 transition-colors">
                        <Upload size={14} /> Upload File
                        <input type="file" accept="image/*" onChange={handleEquipmentImageChange} className="hidden" />
                      </label>
                    </div>
                    {equipmentImage && (
                      <div className="relative w-24 h-24">
                        <img src={equipmentImage} alt="Preview" className="w-24 h-24 object-cover rounded-lg border border-slate-600" />
                        <button
                          type="button"
                          onClick={() => setEquipmentImage('')}
                          className="absolute -top-2 -right-2 bg-rose-500 hover:bg-rose-600 text-white rounded-full w-5 h-5 flex items-center justify-center shadow-lg shadow-rose-500/25"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    )}
                    <p className="text-xs text-slate-400 mt-1">Max 2MB. Stored directly for now — will move to cloud storage later.</p>
                  </div>

                  <button type="submit" disabled={equipmentLoading} className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-all shadow-lg shadow-blue-500/25 disabled:opacity-50">
                    {equipmentLoading ? 'Adding...' : 'Save Equipment'}
                  </button>
                </form>

                {equipmentMessage && (
                  <div className={`text-sm p-3 rounded-lg mb-4 ${
                    equipmentMessage.includes('successfully') ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  }`}>
                    {equipmentMessage}
                  </div>
                )}

                <h4 className="text-sm font-medium text-slate-300 mb-2">Current Equipment</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {equipmentList.length === 0 && <p className="text-sm text-slate-400 col-span-2">No equipment added yet.</p>}
                  {equipmentList.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 bg-slate-700/30 rounded-lg p-3 border border-slate-700">
                      {item.imageBase64 ? (
                        <img src={item.imageBase64} alt={item.name} className="w-12 h-12 object-cover rounded-lg border border-slate-600" />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-slate-600 flex items-center justify-center text-slate-400">
                          <FlaskConical size={18} />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-white capitalize text-sm truncate">{item.name}</span>
                          <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full ml-2 whitespace-nowrap border border-emerald-500/30">{item.status}</span>
                        </div>
                        <div className="text-xs text-slate-400 capitalize">{item.category}</div>
                        {item.description && <div className="text-xs text-slate-400 truncate">{item.description}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>
            )}

            {/* ---------- REQUESTS (Dark Professional) ---------- */}
            {activePanel === 'requests' && userRole === 'DEPARTMENT_HEAD' && (
              <Panel title="Pending Access Requests" icon={ClipboardList}>
                {requestsMessage && (
                  <div className={`text-sm p-3 rounded-lg mb-4 ${
                    requestsMessage.includes('approved') || requestsMessage.includes('rejected') ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  }`}>
                    {requestsMessage}
                  </div>
                )}
                <div className="space-y-2">
                  {requestsList.length === 0 && <p className="text-sm text-slate-400">No requests found.</p>}
                  {requestsList.map((req) => (
                    <div key={req.id} className="flex justify-between items-center bg-slate-700/30 px-3 py-2 rounded-lg text-sm border border-slate-700">
                      <div>
                        <span className="font-medium text-white capitalize">{req.equipmentName}</span>
                        <span className="text-slate-400 ml-2 text-xs">by {req.requestedBy}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                          req.status === 'PENDING' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                          req.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        }`}>
                          {req.status}
                        </span>
                        {req.status === 'PENDING' && (
                          <>
                            <button onClick={() => handleApprove(req.id)} className="text-xs bg-emerald-500 hover:bg-emerald-600 text-white px-2.5 py-1 rounded-lg font-medium transition-colors">Approve</button>
                            <button onClick={() => handleReject(req.id)} className="text-xs bg-rose-500 hover:bg-rose-600 text-white px-2.5 py-1 rounded-lg font-medium transition-colors">Reject</button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>
            )}

            {/* ---------- INSTITUTIONS (Dark Professional) ---------- */}
            {activePanel === 'institutions' && userRole === 'INSTITUTION_ADMINISTRATOR' && (
              <Panel title="Manage Institutions" icon={Building2}>
                <form onSubmit={handleAddInstitution} className="space-y-3 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Institution Name</label>
                    <input
                      type="text"
                      value={institutionName}
                      onChange={(e) => setInstitutionName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none transition-all text-white"
                      placeholder="e.g. IIT Bangalore"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Address</label>
                    <input
                      type="text"
                      value={institutionAddress}
                      onChange={(e) => setInstitutionAddress(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none transition-all text-white"
                      placeholder="e.g. Bangalore, India"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Contact Email</label>
                    <input
                      type="email"
                      value={institutionEmail}
                      onChange={(e) => setInstitutionEmail(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none transition-all text-white"
                      placeholder="e.g. admin@institution.edu"
                      required
                    />
                  </div>
                  <button type="submit" disabled={institutionLoading} className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-all shadow-lg shadow-blue-500/25 disabled:opacity-50">
                    {institutionLoading ? 'Adding...' : 'Add Institution'}
                  </button>
                </form>

                {institutionMessage && (
                  <div className={`text-sm p-3 rounded-lg mb-4 ${
                    institutionMessage.includes('successfully') ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  }`}>
                    {institutionMessage}
                  </div>
                )}

                <h4 className="text-sm font-medium text-slate-300 mb-2">All Institutions</h4>
                <div className="space-y-2">
                  {institutionsList.length === 0 && <p className="text-sm text-slate-400">No institutions added yet.</p>}
                  {institutionsList.map((inst) => (
                    <div key={inst.id} className="bg-slate-700/30 px-3 py-2 rounded-lg text-sm border border-slate-700">
                      <div className="font-medium text-white">{inst.name}</div>
                      <div className="text-slate-400 text-xs">{inst.address} — {inst.contactEmail}</div>
                    </div>
                  ))}
                </div>
              </Panel>
            )}

            {/* ---------- USERS (Dark Professional) ---------- */}
            {activePanel === 'users' && userRole === 'SYSTEM_ADMINISTRATOR' && (
              <Panel title="Manage Users" icon={Users}>
                {adminMessage && (
                  <div className={`text-sm p-3 rounded-lg mb-4 ${
                    adminMessage.includes('is now') ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  }`}>
                    {adminMessage}
                  </div>
                )}
                <div className="space-y-2">
                  {usersList.length === 0 && <p className="text-sm text-slate-400">No users found.</p>}
                  {usersList.map((u) => (
                    <div key={u.id} className="flex justify-between items-center bg-slate-700/30 px-3 py-2 rounded-lg text-sm border border-slate-700">
                      <div>
                        <span className="font-medium text-white">{u.name}</span>
                        <span className="text-slate-400 ml-2 text-xs">{u.email}</span>
                      </div>
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        className="text-xs border border-slate-600 rounded-lg px-2 py-1 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none transition-all bg-slate-700/50 text-white"
                      >
                        {ALL_ROLES.map((r) => <option key={r} value={r} className="bg-slate-800">{r}</option>)}
                      </select>
                    </div>
                  ))}
                </div>
              </Panel>
            )}

            {/* ---------- ROLE REQUESTS ADMIN (Dark Professional) ---------- */}
            {activePanel === 'roleRequestsAdmin' && userRole === 'SYSTEM_ADMINISTRATOR' && (
              <Panel title="Pending Role Requests" icon={ShieldCheck}>
                {roleRequestAdminMessage && (
                  <div className={`text-sm p-3 rounded-lg mb-4 ${
                    roleRequestAdminMessage.includes('approved') ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  }`}>
                    {roleRequestAdminMessage}
                  </div>
                )}
                <div className="space-y-2">
                  {allRoleRequests.length === 0 && <p className="text-sm text-slate-400">No role requests found.</p>}
                  {allRoleRequests.map((r) => (
                    <div key={r.id} className="flex justify-between items-center bg-slate-700/30 px-3 py-2 rounded-lg text-sm border border-slate-700">
                      <div>
                        <span className="font-medium text-white">{r.userEmail}</span>
                        <span className="text-slate-400 ml-2 text-xs">wants {r.requestedRole.replace('_', ' ')} — {r.reason}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${roleRequestStatusColor(r.status)}`}>{r.status}</span>
                        {r.status === 'PENDING' && (
                          <>
                            <button onClick={() => handleApproveRoleRequest(r.id)} className="text-xs bg-emerald-500 hover:bg-emerald-600 text-white px-2.5 py-1 rounded-lg font-medium transition-colors">Approve</button>
                            <button onClick={() => handleRejectRoleRequest(r.id)} className="text-xs bg-rose-500 hover:bg-rose-600 text-white px-2.5 py-1 rounded-lg font-medium transition-colors">Reject</button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>
            )}

            {/* ---------- MY ROLE REQUEST (Dark Professional) ---------- */}
            {activePanel === 'roleRequest' && userRole !== 'SYSTEM_ADMINISTRATOR' && (
              <Panel title="Request a Different Role" icon={GraduationCap}>
                <form onSubmit={handleRoleRequestSubmit} className="space-y-3 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Desired Role</label>
                    <select
                      value={desiredRole}
                      onChange={(e) => setDesiredRole(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none transition-all text-white"
                    >
                      {REQUESTABLE_ROLES.map((r) => <option key={r} value={r} className="bg-slate-800">{r.replace('_', ' ')}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Reason</label>
                    <input
                      type="text"
                      value={roleRequestReason}
                      onChange={(e) => setRoleRequestReason(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none transition-all text-white"
                      placeholder="e.g. I manage the chemistry lab"
                      required
                    />
                  </div>
                  <button type="submit" className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-all shadow-lg shadow-blue-500/25">
                    Submit Request
                  </button>
                </form>

                {roleRequestMessage && (
                  <div className={`text-sm p-3 rounded-lg mb-4 ${
                    roleRequestMessage.includes('submitted') ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  }`}>
                    {roleRequestMessage}
                  </div>
                )}

                <h4 className="text-sm font-medium text-slate-300 mb-2">My Requests</h4>
                <div className="space-y-2">
                  {myRoleRequests.length === 0 && <p className="text-sm text-slate-400">No requests yet.</p>}
                  {myRoleRequests.map((r) => (
                    <div key={r.id} className="flex justify-between items-center bg-slate-700/30 px-3 py-2 rounded-lg text-sm border border-slate-700">
                      <div>
                        <span className="font-medium text-white">{r.requestedRole.replace('_', ' ')}</span>
                        <span className="text-slate-400 ml-2 text-xs">{r.reason}</span>
                      </div>
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${roleRequestStatusColor(r.status)}`}>{r.status}</span>
                    </div>
                  ))}
                </div>
              </Panel>
            )}

            {/* ---------- MY PROFILE (Dark Professional) ---------- */}
            {activePanel === 'myProfile' && (
              <Panel title="My Profile" icon={UserIcon}>
                <div className="grid grid-cols-2 gap-3 mb-6 text-sm">
                  <div className="bg-slate-700/30 rounded-lg p-3 border border-slate-700">
                    <div className="text-xs text-slate-400">Name</div>
                    <div className="font-medium text-white">{userName || '—'}</div>
                  </div>
                  <div className="bg-slate-700/30 rounded-lg p-3 border border-slate-700">
                    <div className="text-xs text-slate-400">Email</div>
                    <div className="font-medium text-white">{userEmail}</div>
                  </div>
                  <div className="bg-slate-700/30 rounded-lg p-3 border border-slate-700">
                    <div className="text-xs text-slate-400">Role</div>
                    <div className="font-medium text-white">{userRole.replace('_', ' ')}</div>
                  </div>
                  <div className="bg-slate-700/30 rounded-lg p-3 border border-slate-700">
                    <div className="text-xs text-slate-400">Current Institution</div>
                    <div className="font-medium text-white">{userInstitutionId ? institutionNameById(userInstitutionId) : 'None'}</div>
                  </div>
                </div>

                <form onSubmit={handleUpdateMyProfile} className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Institution</label>
                    <select
                      value={myProfileInstitutionId}
                      onChange={(e) => setMyProfileInstitutionId(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none transition-all text-white"
                    >
                      <option value="" className="bg-slate-800">No institution</option>
                      {publicInstitutions.map((i) => <option key={i.id} value={i.id} className="bg-slate-800">{i.name}</option>)}
                    </select>
                  </div>
                  {userRole === 'RESEARCHER_STUDENT' && (
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">I am a...</label>
                      <select
                        value={myProfileType}
                        onChange={(e) => setMyProfileType(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none transition-all text-white"
                      >
                        <option value="STUDENT" className="bg-slate-800">Student</option>
                        <option value="RESEARCHER" className="bg-slate-800">Researcher</option>
                      </select>
                    </div>
                  )}
                  <button type="submit" disabled={myProfileLoading} className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-all shadow-lg shadow-blue-500/25 disabled:opacity-50">
                    {myProfileLoading ? 'Saving...' : 'Save Profile'}
                  </button>
                </form>

                {myProfileMessage && (
                  <div className="text-sm p-3 rounded-lg mt-4 bg-blue-500/20 text-blue-400 border border-blue-500/30">
                    {myProfileMessage}
                  </div>
                )}
              </Panel>
            )}
          </main>
        </div>

        {showCameraModal && (
          <CameraCapture
            onCapture={(dataUrl) => { setEquipmentImage(dataUrl); setShowCameraModal(false); }}
            onClose={() => setShowCameraModal(false)}
          />
        )}
      </div>
    );
  }

  // ==================== IF NOT LOGGED IN: CLASSY COMPACT AUTH SCREENS ====================
return (
  <div className="min-h-screen relative flex items-center justify-center px-4 overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
    <FloatingLabBackground />

    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="relative z-10 w-full max-w-[380px]"
    >
      <div className="relative rounded-xl p-[1px] bg-gradient-to-br from-slate-600/30 via-slate-500/10 to-blue-400/20 shadow-xl">
        <div className="bg-slate-800/90 backdrop-blur-2xl rounded-xl p-6 border border-slate-700">

          {/* Logo - Smaller */}
          <div className="text-center mb-5">
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 text-white text-2xl font-bold mb-3 shadow-lg shadow-blue-500/30"
            >
              <Microscope size={28} strokeWidth={1.8} />
            </motion.div>
            <h1 className="text-xl font-bold text-white tracking-tight">Lab Resource Platform</h1>
            <p className="text-slate-400 text-xs mt-1 font-light">
              {authMode === 'login' ? 'Sign in to manage lab equipment' : 
               authMode === 'register' ? 'Create your account' : ''}
            </p>
          </div>

          {(authMode === 'login' || authMode === 'register') && (
            <div className="flex mb-4 bg-slate-700/30 rounded-lg p-0.5 border border-slate-600">
              <button
                onClick={() => setAuthMode('login')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all duration-300 ${
                  authMode === 'login' 
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/25' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                Login
              </button>
              <button
                onClick={() => setAuthMode('register')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all duration-300 ${
                  authMode === 'register' 
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/25' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                Register
              </button>
            </div>
          )}

          {authMode === 'login' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
              <form onSubmit={handleLogin} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Email</label>
                  <div className="relative group">
                    <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: null }); }}
                      className={`w-full pl-9 pr-3 py-2 bg-slate-700/50 border rounded-lg text-sm text-white placeholder-slate-500 focus:ring-2 outline-none transition-all duration-300 ${
                        fieldErrors.email 
                          ? 'border-rose-500 focus:ring-rose-500/30' 
                          : 'border-slate-600 focus:border-blue-500 focus:ring-blue-500/30 hover:border-slate-500'
                      }`}
                      placeholder="you@institution.edu"
                    />
                  </div>
                  {fieldErrors.email && <p className="text-xs text-rose-400 mt-1">{fieldErrors.email}</p>}
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-medium text-slate-300">Password</label>
                    <button type="button" onClick={() => setAuthMode('forgot')} className="text-[10px] text-blue-400 hover:text-blue-300 font-medium transition-colors">
                      Forgot?
                    </button>
                  </div>
                  <div className="relative group">
                    <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: null }); }}
                      className={`w-full pl-9 pr-9 py-2 bg-slate-700/50 border rounded-lg text-sm text-white placeholder-slate-500 focus:ring-2 outline-none transition-all duration-300 ${
                        fieldErrors.password 
                          ? 'border-rose-500 focus:ring-rose-500/30' 
                          : 'border-slate-600 focus:border-blue-500 focus:ring-blue-500/30 hover:border-slate-500'
                      }`}
                      placeholder="••••••••"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  {fieldErrors.password && <p className="text-xs text-rose-400 mt-1">{fieldErrors.password}</p>}
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer hover:text-slate-300 transition-colors">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-3.5 h-3.5 rounded border-slate-600 bg-slate-700/50 text-blue-500 focus:ring-blue-500/30 focus:ring-offset-0"
                    />
                    Remember me
                  </label>
                  <div className="flex items-center gap-1 text-[10px] text-slate-500">
                    <ShieldCheck size={12} />
                    <span>Secure</span>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="w-full py-2 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-medium rounded-lg transition-all duration-300 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <LogIn size={15} />
                      Sign In
                    </>
                  )}
                </motion.button>
              </form>

              {message && (
                <motion.div 
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mt-3 text-xs text-center p-2 rounded-lg ${
                    message.includes('coming soon') 
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
                      : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  }`}
                >
                  {message}
                </motion.div>
              )}
            </motion.div>
          )}

          {authMode === 'register' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
              <form onSubmit={handleRegister} className="space-y-3 max-h-[55vh] overflow-y-auto pr-1">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={registerName}
                    onChange={(e) => { setRegisterName(e.target.value); if (registerFieldErrors.name) setRegisterFieldErrors({ ...registerFieldErrors, name: null }); }}
                    className={`w-full px-3 py-2 bg-slate-700/50 border rounded-lg text-sm text-white placeholder-slate-500 focus:ring-2 outline-none transition-all duration-300 ${
                      registerFieldErrors.name 
                        ? 'border-rose-500 focus:ring-rose-500/30' 
                        : 'border-slate-600 focus:border-blue-500 focus:ring-blue-500/30 hover:border-slate-500'
                    }`}
                    placeholder="Jane Doe"
                  />
                  {registerFieldErrors.name && <p className="text-xs text-rose-400 mt-1">{registerFieldErrors.name}</p>}
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Email</label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="email"
                      value={registerEmail}
                      onChange={(e) => { setRegisterEmail(e.target.value); if (registerFieldErrors.email) setRegisterFieldErrors({ ...registerFieldErrors, email: null }); }}
                      className={`w-full pl-9 pr-3 py-2 bg-slate-700/50 border rounded-lg text-sm text-white placeholder-slate-500 focus:ring-2 outline-none transition-all duration-300 ${
                        registerFieldErrors.email 
                          ? 'border-rose-500 focus:ring-rose-500/30' 
                          : 'border-slate-600 focus:border-blue-500 focus:ring-blue-500/30 hover:border-slate-500'
                      }`}
                      placeholder="you@institution.edu"
                    />
                  </div>
                  {registerFieldErrors.email && <p className="text-xs text-rose-400 mt-1">{registerFieldErrors.email}</p>}
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type={showRegisterPassword ? 'text' : 'password'}
                      value={registerPassword}
                      onChange={(e) => { setRegisterPassword(e.target.value); if (registerFieldErrors.password) setRegisterFieldErrors({ ...registerFieldErrors, password: null }); }}
                      className={`w-full pl-9 pr-9 py-2 bg-slate-700/50 border rounded-lg text-sm text-white placeholder-slate-500 focus:ring-2 outline-none transition-all duration-300 ${
                        registerFieldErrors.password 
                          ? 'border-rose-500 focus:ring-rose-500/30' 
                          : 'border-slate-600 focus:border-blue-500 focus:ring-blue-500/30 hover:border-slate-500'
                      }`}
                      placeholder="••••••••"
                    />
                    <button type="button" onClick={() => setShowRegisterPassword(!showRegisterPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                      {showRegisterPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  {registerFieldErrors.password ? (
                    <p className="text-xs text-rose-400 mt-1">{registerFieldErrors.password}</p>
                  ) : (
                    <p className="text-[10px] text-slate-500 mt-1">At least 6 characters</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">I am a...</label>
                  <select
                    value={registerProfileType}
                    onChange={(e) => setRegisterProfileType(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-sm text-white focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none transition-all duration-300 hover:border-slate-500 [&>option]:bg-slate-800"
                  >
                    <option value="STUDENT" className="bg-slate-800">Student</option>
                    <option value="RESEARCHER" className="bg-slate-800">Researcher</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Institution (optional)</label>
                  <select
                    value={registerInstitutionId}
                    onChange={(e) => setRegisterInstitutionId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-sm text-white focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none transition-all duration-300 hover:border-slate-500 [&>option]:bg-slate-800"
                  >
                    <option value="" className="bg-slate-800">No institution</option>
                    {publicInstitutions.map((inst) => (
                      <option key={inst.id} value={inst.id} className="bg-slate-800">{inst.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Desired Role</label>
                  <select
                    value={registerDesiredRole}
                    onChange={(e) => setRegisterDesiredRole(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-sm text-white focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none transition-all duration-300 hover:border-slate-500 [&>option]:bg-slate-800"
                  >
                    <option value="RESEARCHER_STUDENT" className="bg-slate-800">Researcher / Student</option>
                    <option value="LAB_TECHNICIAN" className="bg-slate-800">Lab Technician</option>
                    <option value="LAB_MANAGER" className="bg-slate-800">Lab Manager</option>
                    <option value="DEPARTMENT_HEAD" className="bg-slate-800">Department Head</option>
                    <option value="INSTITUTION_ADMINISTRATOR" className="bg-slate-800">Institution Admin</option>
                  </select>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Other roles require admin approval
                  </p>
                </div>

                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="mt-0.5 w-3.5 h-3.5 rounded border-slate-600 bg-slate-700/50 text-blue-500 focus:ring-blue-500/30"
                    required
                  />
                  <label className="text-[10px] text-slate-400">
                    I agree to the{' '}
                    <a href="#" className="text-blue-400 hover:text-blue-300 transition-colors">Terms</a>
                    {' '}&{' '}
                    <a href="#" className="text-blue-400 hover:text-blue-300 transition-colors">Privacy Policy</a>
                  </label>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={registerLoading}
                  className="w-full py-2 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-medium rounded-lg transition-all duration-300 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 disabled:opacity-50 flex items-center justify-center gap-2 text-sm mt-1"
                >
                  {registerLoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <UserPlus size={15} />
                      Create Account
                    </>
                  )}
                </motion.button>
              </form>

              {registerMessage && (
                <motion.div 
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mt-3 text-xs text-center p-2 rounded-lg ${
                    registerMessage.includes('created') 
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                      : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  }`}
                >
                  {registerMessage}
                </motion.div>
              )}
            </motion.div>
          )}

          {authMode === 'forgot' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
              <p className="text-xs text-slate-400 mb-4">Enter your email and we'll help you reset your password.</p>
              <form onSubmit={handleForgotPassword} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Email</label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none transition-all duration-300 hover:border-slate-500"
                      placeholder="you@institution.edu"
                      required
                    />
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={forgotLoading}
                  className="w-full py-2 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-medium rounded-lg transition-all duration-300 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                >
                  <KeyRound size={15} />
                  {forgotLoading ? 'Sending...' : 'Send Reset Link'}
                </motion.button>
              </form>

              {forgotMessage && (
                <div className="mt-3 text-xs text-center p-2 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  {forgotMessage}
                </div>
              )}

              {devOnlyToken && (
                <div className="mt-2 text-[10px] p-2 rounded-lg bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                  <strong>Dev:</strong> Reset token: <span className="font-mono">{devOnlyToken}</span>
                  <button
                    type="button"
                    onClick={() => { setResetToken(devOnlyToken); setAuthMode('reset'); }}
                    className="block mt-1 text-blue-400 hover:text-blue-300 font-medium underline"
                  >
                    Use this token to reset now →
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={() => { setAuthMode('login'); setForgotMessage(''); setDevOnlyToken(''); }}
                className="mt-3 text-xs text-slate-400 hover:text-slate-300 w-full text-center flex items-center justify-center gap-1 transition-colors"
              >
                <ArrowLeft size={12} /> Back to Login
              </button>
            </motion.div>
          )}

          {authMode === 'reset' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
              <p className="text-xs text-slate-400 mb-4">Paste your reset token and choose a new password.</p>
              <form onSubmit={handleResetPassword} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Reset Token</label>
                  <input
                    type="text"
                    value={resetToken}
                    onChange={(e) => setResetToken(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none transition-all duration-300 hover:border-slate-500 font-mono"
                    placeholder="Paste your token"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">New Password</label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="password"
                      value={resetNewPassword}
                      onChange={(e) => setResetNewPassword(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 outline-none transition-all duration-300 hover:border-slate-500"
                      placeholder="••••••••"
                      required
                      minLength={6}
                    />
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={resetLoading}
                  className="w-full py-2 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-medium rounded-lg transition-all duration-300 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 disabled:opacity-50 text-sm"
                >
                  {resetLoading ? 'Resetting...' : 'Reset Password'}
                </motion.button>
              </form>

              {resetMessage && (
                <div className={`mt-3 text-xs text-center p-2 rounded-lg ${
                  resetMessage.includes('successful') 
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                    : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                }`}>
                  {resetMessage}
                </div>
              )}

              {resetMessage.includes('successful') && (
                <button
                  type="button"
                  onClick={() => { setAuthMode('login'); setResetMessage(''); }}
                  className="mt-2 w-full bg-slate-700/50 hover:bg-slate-600 text-white font-medium py-1.5 rounded-lg text-xs transition-all duration-300 border border-slate-600"
                >
                  Go to Login
                </button>
              )}

              <button
                type="button"
                onClick={() => { setAuthMode('login'); setResetMessage(''); }}
                className="mt-3 text-xs text-slate-400 hover:text-slate-300 w-full text-center flex items-center justify-center gap-1 transition-colors"
              >
                <ArrowLeft size={12} /> Back to Login
              </button>
            </motion.div>
          )}

          {/* Footer - Smaller */}
          <div className="mt-4 pt-3 border-t border-slate-700 flex items-center justify-between text-[10px] text-slate-500">
            <span className="flex items-center gap-1.5">
              <ShieldCheck size={12} className="text-slate-500" />
              Secure Login
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle size={12} className="text-slate-500" />
              SSL Encrypted
            </span>
            <span className="flex items-center gap-1.5">
              <Sparkles size={12} className="text-slate-500" />
              Verified
            </span>
          </div>

          {authMode === 'login' && (
            <div className="mt-2 text-center">
              <p className="text-[10px] text-slate-500">
                Don't have an account?{' '}
                <button
                  onClick={() => setAuthMode('register')}
                  className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                >
                  Create one
                </button>
              </p>
            </div>
          )}

          {authMode === 'register' && (
            <div className="mt-2 text-center">
              <p className="text-[10px] text-slate-500">
                Already have an account?{' '}
                <button
                  onClick={() => setAuthMode('login')}
                  className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                >
                  Sign in
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  </div>
);
}
export default App;