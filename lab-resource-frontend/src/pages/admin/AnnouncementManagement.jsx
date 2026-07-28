import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Megaphone, Plus, Edit2, Trash2, Eye, EyeOff, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { announcementApi } from '../../api/api';
import { useAuth } from '../../context/AuthContext';

const ANNOUNCEMENT_TYPES = [
  { value: 'GENERAL', label: 'General' },
  { value: 'MAINTENANCE', label: 'Maintenance' },
  { value: 'POLICY', label: 'Policy Update' },
  { value: 'EVENT', label: 'Event' },
  { value: 'EMERGENCY', label: 'Emergency' },
];

const PRIORITY_OPTIONS = [
  { value: 'LOW', label: 'Low', color: 'bg-gray-100 text-gray-700' },
  { value: 'MEDIUM', label: 'Medium', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'HIGH', label: 'High', color: 'bg-orange-100 text-orange-700' },
  { value: 'CRITICAL', label: 'Critical', color: 'bg-red-100 text-red-700' },
];

const TARGET_AUDIENCE = [
  { value: 'ALL', label: 'All Users' },
  { value: 'INSTITUTION', label: 'Institution' },
  { value: 'DEPARTMENT', label: 'Department' },
];

const getPriorityColor = (priority) => {
  return PRIORITY_OPTIONS.find(p => p.value === priority)?.color || 'bg-gray-100 text-gray-700';
};

export default function AnnouncementManagement() {
  const queryClient = useQueryClient();
  const { isAdmin } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    announcementType: 'GENERAL',
    priority: 'MEDIUM',
    targetAudience: 'ALL',
    institutionId: null,
    departmentId: null,
    published: false,
    expiresAt: '',
  });

  const { data: announcements = [], isLoading } = useQuery({
    queryKey: ['announcements'],
    queryFn: async () => { const res = await announcementApi.getAll(); return res.data; },
  });

  const createMutation = useMutation({
    mutationFn: (data) => announcementApi.create(data),
    onSuccess: () => {
      toast.success('Announcement created');
      queryClient.invalidateQueries(['announcements']);
      setShowModal(false);
      resetForm();
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to create announcement'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => announcementApi.update(id, data),
    onSuccess: () => {
      toast.success('Announcement updated');
      queryClient.invalidateQueries(['announcements']);
      setShowModal(false);
      resetForm();
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to update announcement'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => announcementApi.delete(id),
    onSuccess: () => {
      toast.success('Announcement deleted');
      queryClient.invalidateQueries(['announcements']);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to delete announcement'),
  });

  const publishMutation = useMutation({
    mutationFn: (id) => announcementApi.publish(id),
    onSuccess: () => {
      toast.success('Announcement published');
      queryClient.invalidateQueries(['announcements']);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to publish announcement'),
  });

  const unpublishMutation = useMutation({
    mutationFn: (id) => announcementApi.unpublish(id),
    onSuccess: () => {
      toast.success('Announcement unpublished');
      queryClient.invalidateQueries(['announcements']);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to unpublish announcement'),
  });

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      announcementType: 'GENERAL',
      priority: 'MEDIUM',
      targetAudience: 'ALL',
      institutionId: null,
      departmentId: null,
      published: false,
      expiresAt: '',
    });
    setEditingId(null);
  };

  const handleEdit = (announcement) => {
    setFormData({
      title: announcement.title,
      content: announcement.content,
      announcementType: announcement.announcementType,
      priority: announcement.priority,
      targetAudience: announcement.targetAudience,
      institutionId: announcement.institutionId,
      departmentId: announcement.departmentId,
      published: announcement.published,
      expiresAt: announcement.expiresAt ? announcement.expiresAt.split('T')[0] : '',
    });
    setEditingId(announcement.id);
    setShowModal(true);
  };

  const handleSubmit = () => {
    if (!formData.title || !formData.content) {
      toast.error('Title and content are required');
      return;
    }

    const data = {
      ...formData,
      expiresAt: formData.expiresAt ? new Date(formData.expiresAt).toISOString() : null,
    };

    if (editingId) {
      updateMutation.mutate({ id: editingId, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this announcement?')) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Announcement Management</h1>
          <p className="text-gray-600 mt-1">Create and manage announcements for users</p>
        </div>
        {isAdmin && (
          <button onClick={() => { resetForm(); setShowModal(true); }} className="btn-primary flex items-center gap-2">
            <Plus size={16} /> New Announcement
          </button>
        )}
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {announcements.length === 0 ? (
          <div className="card text-center py-12">
            <Megaphone size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">No announcements yet</p>
          </div>
        ) : (
          announcements.map((announcement) => (
            <div key={announcement.id} className="card">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-800">{announcement.title}</h3>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getPriorityColor(announcement.priority)}`}>
                      {announcement.priority}
                    </span>
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                      {announcement.announcementType}
                    </span>
                    {announcement.published ? (
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                        Published
                      </span>
                    ) : (
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                        Draft
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 mb-3 whitespace-pre-wrap">{announcement.content}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>By: {announcement.createdByName}</span>
                    <span>Target: {announcement.targetAudience}</span>
                    {announcement.institutionName && <span>Institution: {announcement.institutionName}</span>}
                    {announcement.publishedAt && <span>Published: {new Date(announcement.publishedAt).toLocaleDateString()}</span>}
                    {announcement.expiresAt && <span>Expires: {new Date(announcement.expiresAt).toLocaleDateString()}</span>}
                  </div>
                </div>
                {isAdmin && (
                  <div className="flex items-center gap-2 ml-4">
                    {announcement.published ? (
                      <button
                        onClick={() => unpublishMutation.mutate(announcement.id)}
                        className="p-2 text-gray-400 hover:text-yellow-600 transition-colors"
                        title="Unpublish"
                      >
                        <EyeOff size={16} />
                      </button>
                    ) : (
                      <button
                        onClick={() => publishMutation.mutate(announcement.id)}
                        className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                        title="Publish"
                      >
                        <Eye size={16} />
                      </button>
                    )}
                    <button
                      onClick={() => handleEdit(announcement)}
                      className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                      title="Edit"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(announcement.id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">{editingId ? 'Edit Announcement' : 'New Announcement'}</h3>
              <button onClick={() => { setShowModal(false); resetForm(); }} className="p-1 hover:bg-gray-100 rounded">
                <X size={20} />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input
                  type="text"
                  className="input-field"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Announcement title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content *</label>
                <textarea
                  className="input-field h-32"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Announcement content"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    className="input-field"
                    value={formData.announcementType}
                    onChange={(e) => setFormData({ ...formData, announcementType: e.target.value })}
                  >
                    {ANNOUNCEMENT_TYPES.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    className="input-field"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  >
                    {PRIORITY_OPTIONS.map(priority => (
                      <option key={priority.value} value={priority.value}>{priority.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Target Audience</label>
                  <select
                    className="input-field"
                    value={formData.targetAudience}
                    onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                  >
                    {TARGET_AUDIENCE.map(audience => (
                      <option key={audience.value} value={audience.value}>{audience.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expires At</label>
                  <input
                    type="date"
                    className="input-field"
                    value={formData.expiresAt}
                    onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="published"
                  className="h-4 w-4 text-primary-600 rounded"
                  checked={formData.published}
                  onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                />
                <label htmlFor="published" className="text-sm text-gray-700">Publish immediately</label>
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t">
              <button onClick={() => { setShowModal(false); resetForm(); }} className="btn-secondary">
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="btn-primary"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {createMutation.isPending || updateMutation.isPending ? 'Saving...' : (editingId ? 'Update' : 'Create')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
