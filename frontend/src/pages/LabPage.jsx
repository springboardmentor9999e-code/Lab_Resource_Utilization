import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { platformService } from '../services/platformService';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, 
  Plus, 
  Edit2, 
  Trash2, 
  MapPin, 
  Users, 
  Cpu, 
  Loader2,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import PageTransition from '../components/PageTransition';

const LabPage = () => {
  const { user } = useAuth();
  
  // RBAC permissions Check
  const currentRole = user?.roles?.[0] || user?.role || 'STUDENT';
  const isManager = ['ADMIN', 'TECHNICIAN', 'HOD'].includes(currentRole.toUpperCase());

  // Component States
  const [labsList, setLabsList] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Modal States
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState('add'); // 'add' or 'edit'
  const [selectedLab, setSelectedLab] = useState(null);

  // Form Fields State
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    capacity: 30,
    location: '',
    departmentId: ''
  });

  const [formSubmitStatus, setFormSubmitStatus] = useState('idle'); // 'idle', 'loading', 'success'

  // Fetch labs and departments
  useEffect(() => {
    fetchLabs();
    fetchDepartments();
  }, []);

  const fetchLabs = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const data = await platformService.getLabs();
      setLabsList(data || []);
    } catch (err) {
      setErrorMsg('Failed to load laboratories. Ensure the backend server is running.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const data = await platformService.getDepartments();
      setDepartments(data || []);
    } catch (err) {
      console.error('Error fetching departments list:', err);
    }
  };

  const handleOpenAddModal = () => {
    setFormData({
      name: '',
      code: '',
      capacity: 30,
      location: '',
      departmentId: departments[0]?.departmentId || ''
    });
    setModalType('add');
    setFormSubmitStatus('idle');
    setModalOpen(true);
  };

  const handleOpenEditModal = (lab) => {
    setSelectedLab(lab);
    setFormData({
      name: lab.name,
      code: lab.code,
      capacity: lab.capacity,
      location: lab.location || '',
      departmentId: lab.departmentId || ''
    });
    setModalType('edit');
    setFormSubmitStatus('idle');
    setModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitStatus('loading');
    try {
      const payload = {
        ...formData,
        capacity: parseInt(formData.capacity, 10),
        departmentId: parseInt(formData.departmentId, 10)
      };

      if (modalType === 'add') {
        await platformService.createLab(payload);
      } else {
        await platformService.updateLab(selectedLab.labId, payload);
      }

      setFormSubmitStatus('success');
      setTimeout(() => {
        setModalOpen(false);
        fetchLabs();
      }, 1000);
    } catch (err) {
      alert(err.response?.data?.message || 'Error occurred while saving laboratory details');
      setFormSubmitStatus('idle');
    }
  };

  const handleDeleteLab = async (id) => {
    if (window.confirm('Are you sure you want to delete this laboratory? All allocated equipment will be unassigned.')) {
      try {
        await platformService.deleteLab(id);
        fetchLabs();
      } catch (err) {
        alert('Failed to delete laboratory. Ensure no active bookings depend on it.');
      }
    }
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        
        {/* Title and Top Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white font-heading">
              Laboratories Management
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Administer campus laboratory workspace nodes, capacities, and device counts.
            </p>
          </div>
          
          {isManager && (
            <button
              onClick={handleOpenAddModal}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary to-secondary text-white font-bold text-sm rounded-xl shadow-lg hover:shadow-primary/25 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <Plus className="h-4 w-4" /> Add Laboratory
            </button>
          )}
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="h-64 flex flex-col justify-center items-center gap-3">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
            <span className="text-sm text-slate-500">Querying laboratories catalog...</span>
          </div>
        ) : errorMsg ? (
          <div className="glass-card dark:glass-card-dark p-6 rounded-2xl flex flex-col items-center justify-center text-center gap-3 border border-red-500/20">
            <AlertTriangle className="h-10 w-10 text-red-500" />
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{errorMsg}</span>
          </div>
        ) : labsList.length === 0 ? (
          <div className="glass-card dark:glass-card-dark p-12 rounded-2xl flex flex-col items-center justify-center text-center gap-4">
            <div className="p-4 rounded-full bg-slate-100 dark:bg-slate-950 text-slate-400">
              <Building2 className="h-10 w-10" />
            </div>
            <div>
              <p className="font-bold text-slate-800 dark:text-slate-100">No laboratories registered</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Add a laboratory node to get started.</p>
            </div>
          </div>
        ) : (
          /* Labs Card List */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {labsList.map((lab, idx) => (
              <motion.div
                key={lab.labId}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="glass-card dark:glass-card-dark rounded-2xl p-6 border border-slate-200/50 dark:border-slate-800/50 flex flex-col justify-between hover:shadow-xl hover:border-primary/20 transition-all group"
              >
                <div>
                  {/* Category and Code Header */}
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-[10px] text-primary dark:text-blue-400 uppercase font-extrabold tracking-wider bg-primary/10 dark:bg-primary/25 px-2.5 py-0.5 rounded-md">
                      {lab.code}
                    </span>
                    <span className="text-xs text-slate-400 dark:text-slate-500 font-bold">
                      {lab.departmentName}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white mt-4 my-0">
                    {lab.name}
                  </h3>

                  {/* Details block */}
                  <div className="mt-6 space-y-4 pt-4 border-t border-slate-100 dark:border-slate-900 text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-slate-400" />
                      <span>{lab.location || 'No location set'}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-slate-400" />
                        <div>
                          <span className="block text-[10px] text-slate-400 uppercase font-bold">Capacity</span>
                          <span className="font-bold text-slate-700 dark:text-slate-350">{lab.capacity} Slots</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Cpu className="h-4 w-4 text-slate-400" />
                        <div>
                          <span className="block text-[10px] text-slate-400 uppercase font-bold">Instruments</span>
                          <span className="font-bold text-slate-700 dark:text-slate-350">{lab.equipmentCount || 0} Devices</span>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Edit and Delete Toggles */}
                {isManager && (
                  <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-900 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleOpenEditModal(lab)}
                      className="p-2 text-slate-500 hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                      title="Edit Lab"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteLab(lab.labId)}
                      className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                      title="Delete Lab"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}

        {/* Add/Edit Modal overlay */}
        <AnimatePresence>
          {modalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              
              {/* Overlay Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                onClick={() => setModalOpen(false)}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              />

              {/* Modal Container */}
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="glass-card dark:glass-card-dark w-full max-w-md rounded-3xl border border-white/20 dark:border-slate-850 p-6 sm:p-8 shadow-2xl relative z-10"
              >
                
                {/* Title */}
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white my-0 font-heading">
                  {modalType === 'add' ? 'Add Laboratory' : 'Edit Laboratory'}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Initialize a new workspace node on the platform.
                </p>

                {/* Form layout */}
                <form onSubmit={handleFormSubmit} className="space-y-4 mt-6">
                  
                  {/* Lab Name */}
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Laboratory Name</label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="e.g. Artificial Intelligence Lab"
                      className="w-full px-3 py-2 text-sm bg-slate-100/50 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-800 dark:text-slate-100"
                    />
                  </div>

                  {/* Lab Code and Capacity */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Lab Code</label>
                      <input
                        type="text"
                        name="code"
                        required
                        value={formData.code}
                        onChange={handleInputChange}
                        placeholder="e.g. LAB-AI-01"
                        className="w-full px-3 py-2 text-sm bg-slate-100/50 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-800 dark:text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Max Capacity</label>
                      <input
                        type="number"
                        name="capacity"
                        required
                        min="1"
                        value={formData.capacity}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 text-sm bg-slate-100/50 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-800 dark:text-slate-100"
                      />
                    </div>
                  </div>

                  {/* Location */}
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Physical Location</label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      placeholder="e.g. Block C, 3rd Floor"
                      className="w-full px-3 py-2 text-sm bg-slate-100/50 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-800 dark:text-slate-100"
                    />
                  </div>

                  {/* Department select */}
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Department</label>
                    <select
                      name="departmentId"
                      value={formData.departmentId}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 text-sm bg-slate-100/50 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-800 dark:text-slate-100 cursor-pointer"
                    >
                      {departments.map(dept => (
                        <option key={dept.departmentId} value={dept.departmentId}>{dept.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Buttons */}
                  <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-900 mt-6">
                    <button
                      type="button"
                      onClick={() => setModalOpen(false)}
                      className="px-4 py-2 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold text-sm rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={formSubmitStatus !== 'idle'}
                      className="flex items-center justify-center gap-2 px-5 py-2 bg-gradient-to-r from-primary to-secondary text-white font-bold text-sm rounded-xl shadow-lg hover:shadow-primary/25 disabled:opacity-50 transition-all min-w-[100px]"
                    >
                      {formSubmitStatus === 'loading' && <Loader2 className="h-4 w-4 animate-spin" />}
                      {formSubmitStatus === 'success' && <CheckCircle className="h-4 w-4" />}
                      {formSubmitStatus === 'idle' && (modalType === 'add' ? 'Add' : 'Save')}
                      {formSubmitStatus === 'success' ? 'Saved!' : formSubmitStatus === 'loading' ? 'Saving...' : ''}
                    </button>
                  </div>

                </form>

              </motion.div>

            </div>
          )}
        </AnimatePresence>

      </div>
    </PageTransition>
  );
};

export default LabPage;
