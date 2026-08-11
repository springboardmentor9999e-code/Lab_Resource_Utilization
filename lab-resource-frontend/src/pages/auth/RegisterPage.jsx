import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { institutionApi, departmentApi } from '../../api/api';

const ROLES = [
  { value: 'RESEARCHER', label: 'Researcher' },
  { value: 'STUDENT', label: 'Student' },
  { value: 'LAB_TECHNICIAN', label: 'Lab Technician' },
  { value: 'LAB_MANAGER', label: 'Lab Manager' },
  { value: 'DEPARTMENT_HEAD', label: 'Department Head' },
];

const registerSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  email: z.string().email('Please enter a valid email'),
  phone: z.string().optional(),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Must contain at least one number')
    .regex(/[@$!%*?&]/, 'Must contain at least one special character'),
  confirmPassword: z.string(),
  role: z.string().min(1, 'Role is required'),
  institutionId: z.string().min(1, 'Institution is required'),
  customInstitutionName: z.string().optional(),
  departmentId: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
}).refine((data) => {
  if (data.institutionId === 'OTHER') return !!data.customInstitutionName?.trim();
  return true;
}, {
  message: "Institution name is required",
  path: ['customInstitutionName'],
}).refine((data) => {
  if (data.institutionId && data.institutionId !== 'OTHER') return !!data.departmentId;
  return true;
}, {
  message: "Department is required",
  path: ['departmentId'],
});

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [institutions, setInstitutions] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loadingDepts, setLoadingDepts] = useState(false);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: '',
      institutionId: '',
      customInstitutionName: '',
      departmentId: ''
    }
  });

  const selectedInst = watch('institutionId');
  const isOther = selectedInst === 'OTHER';
  const showDepartment = selectedInst && !isOther;

  useEffect(() => {
    let mounted = true;
    institutionApi.getAll().then(r => {
      if (mounted) setInstitutions(r.data || []);
    }).catch(() => {});
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (selectedInst && !isOther) {
      setLoadingDepts(true);
      setValue('departmentId', '');
      departmentApi.getByInstitution(selectedInst)
        .then(res => setDepartments(res.data || []))
        .catch(() => setDepartments([]))
        .finally(() => setLoadingDepts(false));
    } else {
      setDepartments([]);
    }
  }, [selectedInst, isOther, setValue]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const { confirmPassword, ...submitData } = data;
      if (submitData.institutionId === 'OTHER') {
        submitData.institutionId = null;
        submitData.departmentId = null;
      } else {
        submitData.institutionId = parseInt(submitData.institutionId);
        submitData.departmentId = parseInt(submitData.departmentId);
      }
      await registerUser(submitData);
      toast.success('Registration successful! Please login.');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 py-12">
      <div className="w-full max-w-lg px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary-700">LRUP</h1>
          <p className="text-gray-600 mt-2">Create your account</p>
        </div>

        <div className="card">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Register</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <input {...register('firstName')} className="input-field" placeholder="First name" />
                {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input {...register('lastName')} className="input-field" placeholder="Last name" />
                {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" {...register('email')} className="input-field" placeholder="Enter your email" />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone (Optional)</label>
                <input {...register('phone')} className="input-field" placeholder="Phone number" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select {...register('role')} className="input-field w-full">
                  <option value="">Select your role</option>
                  {ROLES.map(r => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
                {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role.message}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Institution</label>
              <select {...register('institutionId')} className="input-field w-full">
                <option value="">Select your institution</option>
                {institutions.map(inst => (
                  <option key={inst.id} value={inst.id}>{inst.institutionName}</option>
                ))}
                <option value="OTHER">Other (Not Listed)</option>
              </select>
              {errors.institutionId && <p className="text-red-500 text-xs mt-1">{errors.institutionId.message}</p>}
            </div>

            {isOther && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Institution Name</label>
                <input {...register('customInstitutionName')} className="input-field w-full" placeholder="Enter your institution name" />
                {errors.customInstitutionName && <p className="text-red-500 text-xs mt-1">{errors.customInstitutionName.message}</p>}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <select {...register('departmentId')} className="input-field w-full" disabled={!showDepartment || loadingDepts}>
                <option value="">
                  {isOther ? 'Not required for custom institution' : loadingDepts ? 'Loading departments...' : !selectedInst ? 'Select institution first' : 'Select your department'}
                </option>
                {showDepartment && departments.map(dept => (
                  <option key={dept.id} value={dept.id}>{dept.departmentName}</option>
                ))}
              </select>
              {errors.departmentId && <p className="text-red-500 text-xs mt-1">{errors.departmentId.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input type="password" {...register('password')} className="input-field" placeholder="Create password" />
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                <input type="password" {...register('confirmPassword')} className="input-field" placeholder="Confirm password" />
                {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full btn-primary py-3">
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
