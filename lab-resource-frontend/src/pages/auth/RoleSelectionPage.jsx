import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authApi, institutionApi, departmentApi } from '../../api/api';
import toast from 'react-hot-toast';

const ROLES = [
  { value: 'RESEARCHER', label: 'Researcher' },
  { value: 'STUDENT', label: 'Student' },
  { value: 'LAB_TECHNICIAN', label: 'Lab Technician' },
  { value: 'LAB_MANAGER', label: 'Lab Manager' },
  { value: 'DEPARTMENT_HEAD', label: 'Department Head' },
];

export default function RoleSelectionPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loginWithOAuth } = useAuth();
  const [loading, setLoading] = useState(false);
  const [institutions, setInstitutions] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loadingDepts, setLoadingDepts] = useState(false);

  const [role, setRole] = useState('');
  const [institutionId, setInstitutionId] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [customInstitutionName, setCustomInstitutionName] = useState('');

  const setupToken = searchParams.get('setupToken');
  const fullName = searchParams.get('fullName');
  const email = searchParams.get('email');
  const userId = searchParams.get('userId');

  useEffect(() => {
    if (!setupToken) {
      toast.error('Invalid setup link. Please try logging in again.');
      navigate('/login');
      return;
    }
    institutionApi.getAll().then(res => setInstitutions(res.data || [])).catch(() => {});
  }, [setupToken, navigate]);

  useEffect(() => {
    if (institutionId) {
      setLoadingDepts(true);
      setDepartmentId('');
      departmentApi.getByInstitution(institutionId)
        .then(res => setDepartments(res.data || []))
        .catch(() => setDepartments([]))
        .finally(() => setLoadingDepts(false));
    } else {
      setDepartments([]);
    }
  }, [institutionId]);

  const isOther = institutionId === 'OTHER';
  const showDepartment = institutionId && !isOther;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!role) {
      toast.error('Please select a role');
      return;
    }
    if (!institutionId) {
      toast.error('Please select an institution');
      return;
    }
    if (isOther && !customInstitutionName.trim()) {
      toast.error('Please enter your institution name');
      return;
    }
    if (!isOther && !departmentId) {
      toast.error('Please select a department');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        setupToken,
        role,
        institutionId: isOther ? null : parseInt(institutionId),
        departmentId: isOther ? null : (departmentId ? parseInt(departmentId) : null),
      };
      if (isOther) {
        payload.customInstitutionName = customInstitutionName.trim();
      }
      const res = await authApi.completeOAuthProfile(payload);
      const data = res.data;
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('user', JSON.stringify({
        userId: data.userId,
        email: data.email,
        role: data.role,
        fullName: data.fullName,
        institutionId: data.institutionId,
        departmentId: data.departmentId,
      }));
      toast.success('Profile setup complete!');
      window.location.href = '/dashboard';
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to complete setup. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Complete Your Profile</h1>
          <p className="text-gray-600 mt-2">Welcome, {decodeURIComponent(fullName || '')}!</p>
          <p className="text-sm text-gray-500 mt-1">{decodeURIComponent(email || '')}</p>
          <p className="text-sm text-gray-500 mt-3">Please select your role and institution to continue.</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select
                className="input-field w-full"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="">Select your role</option>
                {ROLES.map(r => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Institution</label>
              <select
                className="input-field w-full"
                value={institutionId}
                onChange={(e) => { setInstitutionId(e.target.value); setCustomInstitutionName(''); setDepartmentId(''); }}
              >
                <option value="">Select your institution</option>
                {institutions.map(inst => (
                  <option key={inst.id} value={inst.id}>{inst.institutionName}</option>
                ))}
                <option value="OTHER">Other (Not Listed)</option>
              </select>
            </div>

            {isOther && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Institution Name</label>
                <input
                  type="text"
                  className="input-field w-full"
                  placeholder="Enter your institution name"
                  value={customInstitutionName}
                  onChange={(e) => setCustomInstitutionName(e.target.value)}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <select
                className="input-field w-full"
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                disabled={!showDepartment || loadingDepts}
              >
                <option value="">
                  {isOther ? 'Not required for custom institution' : loadingDepts ? 'Loading departments...' : !institutionId ? 'Select institution first' : 'Select your department'}
                </option>
                {showDepartment && departments.map(dept => (
                  <option key={dept.id} value={dept.id}>{dept.departmentName}</option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={loading || !role || !institutionId || (isOther ? !customInstitutionName.trim() : !departmentId)}
              className="w-full btn-primary py-3 flex items-center justify-center"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                'Continue to Dashboard'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
