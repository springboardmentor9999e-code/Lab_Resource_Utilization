import { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Calendar, Wrench, FileText, Edit, Trash2, Cpu, QrCode, Upload, ImageIcon, Tag, X, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { equipmentApi } from '../../api/api';
import DocumentManagementModal from './DocumentManagementModal';

const statusColors = {
  'AVAILABLE': 'badge-success',
  'IN_USE': 'badge-info',
  'UNDER_MAINTENANCE': 'badge-danger',
  'RESERVED': 'badge-warning',
  'OUT_OF_SERVICE': 'badge-danger',
  'CALIBRATION_DUE': 'badge-warning',
  'RETIRED': 'badge-info',
};

const statusLabels = {
  'AVAILABLE': 'Available',
  'IN_USE': 'In Use',
  'UNDER_MAINTENANCE': 'Maintenance',
  'RESERVED': 'Reserved',
  'OUT_OF_SERVICE': 'Out of Service',
  'CALIBRATION_DUE': 'Calibration Due',
  'RETIRED': 'Retired',
};

export default function EquipmentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isManager, isSystemAdmin } = useAuth();
  const queryClient = useQueryClient();
  const [showDocModal, setShowDocModal] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [tags, setTags] = useState([]);

  const { data: eq, isLoading, error } = useQuery({
    queryKey: ['equipment', id],
    queryFn: async () => {
      const res = await equipmentApi.getById(id);
      return res.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => equipmentApi.delete(id),
    onSuccess: () => {
      toast.success('Equipment deleted successfully');
      queryClient.invalidateQueries(['equipment']);
      navigate('/equipment');
    },
    onError: () => {
      toast.error('Failed to delete equipment');
    },
  });

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this equipment? This action cannot be undone.')) {
      deleteMutation.mutate();
    }
  };

  const handleDownloadQrCode = () => {
    equipmentApi.getQrCode(id).then((res) => {
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `qr_${eq.equipmentCode}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('QR Code downloaded');
    }).catch(() => toast.error('Failed to download QR Code'));
  };

  const fileInputRef = useRef(null);

  const uploadImageMutation = useMutation({
    mutationFn: (formData) => equipmentApi.uploadImage(id, formData),
    onSuccess: () => {
      toast.success('Image uploaded successfully');
      queryClient.invalidateQueries(['equipment', id]);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to upload image'),
  });

  const addTagMutation = useMutation({
    mutationFn: (tagsArray) => equipmentApi.update(id, { tags: tagsArray }),
    onSuccess: () => { toast.success('Tags updated'); queryClient.invalidateQueries(['equipment', id]); },
    onError: () => toast.error('Failed to update tags'),
  });

  const handleAddTag = () => {
    const tag = newTag.trim();
    if (!tag) return;
    const currentTags = tags.length > 0 ? tags : (eq?.tags || []);
    if (currentTags.includes(tag)) { toast.error('Tag already exists'); return; }
    const updated = [...currentTags, tag];
    setTags(updated);
    setNewTag('');
    addTagMutation.mutate(updated);
  };

  const handleRemoveTag = (tagToRemove) => {
    const currentTags = tags.length > 0 ? tags : (eq?.tags || []);
    const updated = currentTags.filter(t => t !== tagToRemove);
    setTags(updated);
    addTagMutation.mutate(updated);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    uploadImageMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !eq) {
    return (
      <div className="card text-center py-12">
        <p className="text-danger-600">Failed to load equipment details.</p>
        <button onClick={() => navigate('/equipment')} className="btn-primary mt-4">Back to Equipment</button>
      </div>
    );
  }

  const formatCurrency = (amount) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
  };

  return (
    <div>
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4">
        <ArrowLeft size={18} />
        Back to Equipment
      </button>

      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-sm text-gray-500 font-mono">{eq.equipmentCode}</p>
          <h1 className="text-2xl font-bold text-gray-800">{eq.equipmentName}</h1>
        </div>
        <div className="flex gap-2">
          {isManager && !isSystemAdmin && (
            <>
              <button onClick={() => navigate(`/equipment/${id}/edit`)} className="btn-secondary flex items-center gap-2">
                <Edit size={16} /> Edit
              </button>
              <button onClick={handleDelete} className="btn-danger flex items-center gap-2" disabled={deleteMutation.isLoading}>
                <Trash2 size={16} /> {deleteMutation.isLoading ? 'Deleting...' : 'Delete'}
              </button>
            </>
          )}
          {eq.status === 'AVAILABLE' && (
            <button onClick={() => navigate('/bookings', { state: { equipmentId: id } })} className="btn-primary flex items-center gap-2">
              <Calendar size={16} /> Book Now
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">General Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-sm text-gray-500">Manufacturer</p><p className="font-medium">{eq.manufacturer || 'N/A'}</p></div>
              <div><p className="text-sm text-gray-500">Model</p><p className="font-medium">{eq.modelNumber || 'N/A'}</p></div>
              <div><p className="text-sm text-gray-500">Serial Number</p><p className="font-medium">{eq.serialNumber || 'N/A'}</p></div>
              <div><p className="text-sm text-gray-500">Category</p><p className="font-medium">{eq.categoryName || 'N/A'}</p></div>
              <div><p className="text-sm text-gray-500">Laboratory</p><p className="font-medium">{eq.laboratoryName || 'N/A'}</p></div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <span className={statusColors[eq.status] || 'badge-info'}>
                  {statusLabels[eq.status] || eq.status}
                </span>
              </div>
              <div><p className="text-sm text-gray-500">Max Booking Hours</p><p className="font-medium">{eq.maxBookingHours || 8} hrs/day</p></div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Purchase Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-sm text-gray-500">Purchase Date</p><p className="font-medium">{eq.purchaseDate || 'N/A'}</p></div>
              <div><p className="text-sm text-gray-500">Purchase Cost</p><p className="font-medium">{formatCurrency(eq.purchaseCost)}</p></div>
              <div><p className="text-sm text-gray-500">Hourly Rate</p><p className="font-medium">{formatCurrency(eq.hourlyRate)}</p></div>
              <div><p className="text-sm text-gray-500">Warranty Expiry</p><p className="font-medium">{eq.warrantyExpiry || 'N/A'}</p></div>
              <div><p className="text-sm text-gray-500">Calibration Due</p><p className="font-medium">{eq.calibrationDueDate || 'N/A'}</p></div>
            </div>
          </div>

          {eq.description && (
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Description</h3>
              <p className="text-gray-600">{eq.description}</p>
            </div>
          )}

          {eq.specifications && Object.keys(eq.specifications).length > 0 && (
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Technical Specifications</h3>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(eq.specifications).map(([key, value]) => (
                  <div key={key} className="flex justify-between py-2 border-b border-gray-100 last:border-0">
                    <span className="text-sm text-gray-500">{key}</span>
                    <span className="text-sm font-medium text-gray-900">{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(eq.tags && eq.tags.length > 0) || (tags.length > 0) ? (
            <div className="card">
              <h3 className="text-lg font-semibold mb-3">Tags</h3>
              <div className="flex flex-wrap gap-2 mb-3">
                {(tags.length > 0 ? tags : eq.tags || []).map((tag, i) => (
                  <span key={i} className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
                    <Tag size={12} /> {tag}
                    {isManager && !isSystemAdmin && (
                      <button onClick={() => handleRemoveTag(tag)} className="ml-1 hover:text-red-600">
                        <X size={12} />
                      </button>
                    )}
                  </span>
                ))}
              </div>
              {isManager && !isSystemAdmin && (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                    className="input-field flex-1 text-sm"
                    placeholder="Add a tag..."
                  />
                  <button onClick={handleAddTag} className="btn-primary px-3 py-1.5 text-sm flex items-center gap-1">
                    <Plus size={14} /> Add
                  </button>
                </div>
              )}
            </div>
          ) : isManager && !isSystemAdmin ? (
            <div className="card">
              <h3 className="text-lg font-semibold mb-3">Tags</h3>
              <p className="text-sm text-gray-400 mb-3">No tags yet</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                  className="input-field flex-1 text-sm"
                  placeholder="Add a tag..."
                />
                <button onClick={handleAddTag} className="btn-primary px-3 py-1.5 text-sm flex items-center gap-1">
                  <Plus size={14} /> Add
                </button>
              </div>
            </div>
          ) : null}
        </div>

        <div className="space-y-6">
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-2">
              {eq.status === 'AVAILABLE' && (
                <button onClick={() => navigate('/bookings', { state: { equipmentId: id } })} className="w-full btn-primary flex items-center justify-center gap-2">
                  <Calendar size={16} /> Book Equipment
                </button>
              )}
              {isManager && !isSystemAdmin && (
                <button onClick={() => navigate(`/maintenance?equipmentId=${id}`)} className="w-full btn-secondary flex items-center justify-center gap-2">
                  <Wrench size={16} /> Request Maintenance
                </button>
              )}
              <button onClick={handleDownloadQrCode} className="w-full btn-secondary flex items-center justify-center gap-2">
                <QrCode size={16} /> Download QR Code
              </button>
              <button onClick={() => setShowDocModal(true)} className="w-full btn-secondary flex items-center justify-center gap-2">
                <FileText size={16} /> View Documents
              </button>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Image</h3>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />
            {eq.imageUrl ? (
              <div className="relative">
                <img 
                  src={`/api${eq.imageUrl}`} 
                  alt={eq.equipmentName}
                  className="h-48 w-full object-cover rounded-lg"
                />
                {isManager && !isSystemAdmin && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-2 right-2 p-2 bg-white rounded-lg shadow-md hover:bg-gray-100"
                    disabled={uploadImageMutation.isPending}
                  >
                    <Upload size={16} />
                  </button>
                )}
              </div>
            ) : (
              <div 
                className="h-48 bg-gray-50 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => isManager && !isSystemAdmin && fileInputRef.current?.click()}
              >
                <ImageIcon size={48} className="text-gray-300 mb-2" />
                {isManager && !isSystemAdmin && (
                  <p className="text-sm text-gray-500">Click to upload image</p>
                )}
              </div>
            )}
            {uploadImageMutation.isPending && (
              <div className="mt-2 text-center">
                <p className="text-sm text-gray-500">Uploading...</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {showDocModal && <DocumentManagementModal equipment={eq} onClose={() => setShowDocModal(false)} />}
    </div>
  );
}
