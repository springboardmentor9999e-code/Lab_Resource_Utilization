import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Plus, X, Tag } from 'lucide-react';
import toast from 'react-hot-toast';
import { equipmentApi } from '../../api/api';

const equipmentSchema = z.object({
  equipmentCode: z.string().min(1, 'Equipment code is required').max(50),
  equipmentName: z.string().min(1, 'Equipment name is required').max(200),
  categoryId: z.string().min(1, 'Category is required'),
  laboratoryId: z.string().min(1, 'Laboratory is required'),
  manufacturer: z.string().max(200).optional().or(z.literal('')),
  modelNumber: z.string().max(100).optional().or(z.literal('')),
  serialNumber: z.string().max(100).optional().or(z.literal('')),
  purchaseDate: z.string().optional().or(z.literal('')),
  purchaseCost: z.string().optional().or(z.literal('')),
  hourlyRate: z.string().optional().or(z.literal('')),
  warrantyExpiry: z.string().optional().or(z.literal('')),
  description: z.string().optional().or(z.literal('')),
  maxBookingHours: z.number().min(1).max(24).default(8),
  serviceIntervalMonths: z.number().min(1).max(120).default(6),
  calibrationIntervalMonths: z.number().min(1).max(120).default(12),
});

export default function EquipmentFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEdit = Boolean(id);

  const [specifications, setSpecifications] = useState([{ key: '', value: '' }]);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [tagSuggestions, setTagSuggestions] = useState([]);

  const { data: existing, isLoading: loadingExisting } = useQuery({
    queryKey: ['equipment', id],
    queryFn: async () => {
      const res = await equipmentApi.getById(id);
      return res.data;
    },
    enabled: isEdit,
  });

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(equipmentSchema),
    defaultValues: {
      equipmentCode: '',
      equipmentName: '',
      categoryId: '',
      laboratoryId: '',
      manufacturer: '',
      modelNumber: '',
      serialNumber: '',
      purchaseDate: '',
      purchaseCost: '',
      hourlyRate: '',
      warrantyExpiry: '',
      description: '',
      maxBookingHours: 8,
      serviceIntervalMonths: 6,
      calibrationIntervalMonths: 12,
    },
  });

  useEffect(() => {
    if (existing) {
      reset({
        equipmentCode: existing.equipmentCode || '',
        equipmentName: existing.equipmentName || '',
        categoryId: existing.categoryId?.toString() || '',
        laboratoryId: existing.laboratoryId?.toString() || '',
        manufacturer: existing.manufacturer || '',
        modelNumber: existing.modelNumber || '',
        serialNumber: existing.serialNumber || '',
        purchaseDate: existing.purchaseDate || '',
        purchaseCost: existing.purchaseCost?.toString() || '',
        hourlyRate: existing.hourlyRate?.toString() || '',
        warrantyExpiry: existing.warrantyExpiry || '',
        description: existing.description || '',
        maxBookingHours: existing.maxBookingHours || 8,
        serviceIntervalMonths: existing.serviceIntervalMonths || 6,
        calibrationIntervalMonths: existing.calibrationIntervalMonths || 12,
      });
      if (existing.specifications && typeof existing.specifications === 'object') {
        const specs = Object.entries(existing.specifications).map(([key, value]) => ({ key, value: String(value) }));
        setSpecifications(specs.length > 0 ? specs : [{ key: '', value: '' }]);
      }
      if (existing.tags && Array.isArray(existing.tags)) {
        setTags(existing.tags);
      }
    }
  }, [existing, reset]);

  const searchTags = useCallback(async (query) => {
    if (!query || query.length < 1) {
      setTagSuggestions([]);
      return;
    }
    try {
      const res = await equipmentApi.searchTags(query);
      const existingNames = tags.map(t => typeof t === 'string' ? t : t.tagName);
      setTagSuggestions((res.data || []).filter(t => !existingNames.includes(t.tagName)));
    } catch {
      setTagSuggestions([]);
    }
  }, [tags]);

  useEffect(() => {
    const timer = setTimeout(() => searchTags(tagInput), 300);
    return () => clearTimeout(timer);
  }, [tagInput, searchTags]);

  const addSpecRow = () => setSpecifications([...specifications, { key: '', value: '' }]);
  const removeSpecRow = (index) => setSpecifications(specifications.filter((_, i) => i !== index));
  const updateSpecRow = (index, field, val) => {
    const updated = [...specifications];
    updated[index][field] = val;
    setSpecifications(updated);
  };

  const addTag = (tagName) => {
    if (tagName && !tags.includes(tagName)) {
      setTags([...tags, tagName]);
    }
    setTagInput('');
    setTagSuggestions([]);
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const mutation = useMutation({
    mutationFn: (data) => {
      const specsObj = {};
      specifications.forEach(s => {
        if (s.key.trim()) specsObj[s.key.trim()] = s.value;
      });

      const payload = {
        ...data,
        categoryId: parseInt(data.categoryId),
        laboratoryId: parseInt(data.laboratoryId),
        purchaseCost: data.purchaseCost ? parseFloat(data.purchaseCost) : null,
        hourlyRate: data.hourlyRate ? parseFloat(data.hourlyRate) : null,
        maxBookingHours: parseInt(data.maxBookingHours) || 8,
        serviceIntervalMonths: parseInt(data.serviceIntervalMonths) || 6,
        calibrationIntervalMonths: parseInt(data.calibrationIntervalMonths) || 12,
        specifications: Object.keys(specsObj).length > 0 ? specsObj : null,
        tags: tags.map(t => ({ tagName: typeof t === 'string' ? t : t.tagName })),
      };
      if (isEdit) {
        return equipmentApi.update(id, payload);
      }
      return equipmentApi.create(payload);
    },
    onSuccess: () => {
      toast.success(isEdit ? 'Equipment updated successfully' : 'Equipment created successfully');
      queryClient.invalidateQueries(['equipment']);
      navigate('/equipment');
    },
    onError: (err) => {
      const message = err.response?.data?.message || 'Failed to save equipment';
      toast.error(message);
    },
  });

  const onSubmit = (data) => {
    mutation.mutate(data);
  };

  if (isEdit && loadingExisting) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4">
        <ArrowLeft size={18} /> Back
      </button>

      <div className="max-w-2xl">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          {isEdit ? 'Edit Equipment' : 'Add New Equipment'}
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="card space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Equipment Code *</label>
              <input {...register('equipmentCode')} className="input-field" placeholder="e.g. CNC-001" />
              {errors.equipmentCode && <p className="text-danger-500 text-xs mt-1">{errors.equipmentCode.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Equipment Name *</label>
              <input {...register('equipmentName')} className="input-field" />
              {errors.equipmentName && <p className="text-danger-500 text-xs mt-1">{errors.equipmentName.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
              <select {...register('categoryId')} className="input-field">
                <option value="">Select category</option>
                <option value="1">Mechanical</option>
                <option value="2">Electrical</option>
                <option value="3">Electronics</option>
                <option value="4">Computer Science</option>
                <option value="5">Biomedical</option>
                <option value="6">Civil</option>
                <option value="7">Chemical</option>
                <option value="8">Physics</option>
                <option value="9">Chemistry</option>
                <option value="10">Biology</option>
              </select>
              {errors.categoryId && <p className="text-danger-500 text-xs mt-1">{errors.categoryId.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Laboratory *</label>
              <select {...register('laboratoryId')} className="input-field">
                <option value="">Select laboratory</option>
                <option value="1">CNC Lab</option>
                <option value="2">Manufacturing Lab</option>
                <option value="3">Programming Lab</option>
                <option value="4">Electronics Lab</option>
                <option value="5">HPC Lab</option>
                <option value="6">Signal Processing Lab</option>
              </select>
              {errors.laboratoryId && <p className="text-danger-500 text-xs mt-1">{errors.laboratoryId.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Manufacturer</label>
              <input {...register('manufacturer')} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Model Number</label>
              <input {...register('modelNumber')} className="input-field" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Serial Number</label>
              <input {...register('serialNumber')} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Booking Hours</label>
              <input type="number" {...register('maxBookingHours', { valueAsNumber: true })} className="input-field" />
              {errors.maxBookingHours && <p className="text-danger-500 text-xs mt-1">{errors.maxBookingHours.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hourly Rate (₹)</label>
              <input type="number" step="0.01" {...register('hourlyRate')} className="input-field" placeholder="e.g. 500" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Date</label>
              <input type="date" {...register('purchaseDate')} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Cost (₹)</label>
              <input type="number" step="0.01" {...register('purchaseCost')} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Warranty Expiry</label>
              <input type="date" {...register('warrantyExpiry')} className="input-field" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Service Interval (months)</label>
              <input type="number" min={1} max={120} {...register('serviceIntervalMonths', { valueAsNumber: true })} className="input-field" />
              <p className="text-xs text-gray-400 mt-1">Next service due = last service + this interval</p>
              {errors.serviceIntervalMonths && <p className="text-danger-500 text-xs mt-1">{errors.serviceIntervalMonths.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Calibration Interval (months)</label>
              <input type="number" min={1} max={120} {...register('calibrationIntervalMonths', { valueAsNumber: true })} className="input-field" />
              <p className="text-xs text-gray-400 mt-1">Used when renewing calibration certificates</p>
              {errors.calibrationIntervalMonths && <p className="text-danger-500 text-xs mt-1">{errors.calibrationIntervalMonths.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea {...register('description')} className="input-field" rows={3} />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Tag size={14} className="inline mr-1" /> Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag, i) => {
                const name = typeof tag === 'string' ? tag : tag.tagName;
                return (
                  <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-medium">
                    {name}
                    <button type="button" onClick={() => removeTag(name)} className="hover:text-primary-900">
                      <X size={12} />
                    </button>
                  </span>
                );
              })}
            </div>
            <div className="relative">
              <input
                type="text"
                className="input-field"
                placeholder="Type to search tags..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag(tagInput.trim());
                  }
                }}
              />
              {tagSuggestions.length > 0 && (
                <div className="absolute z-10 mt-1 w-full bg-white border rounded-lg shadow-lg max-h-40 overflow-y-auto">
                  {tagSuggestions.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      className="w-full px-3 py-2 text-left text-sm hover:bg-primary-50 flex items-center gap-2"
                      onClick={() => addTag(s.tagName)}
                    >
                      <Tag size={12} className="text-gray-400" /> {s.tagName}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-1">Press Enter to add a new tag</p>
          </div>

          {/* Specifications */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Technical Specifications</label>
            <div className="space-y-2">
              {specifications.map((spec, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <input
                    type="text"
                    className="input-field flex-1"
                    placeholder="Key (e.g. Power)"
                    value={spec.key}
                    onChange={(e) => updateSpecRow(index, 'key', e.target.value)}
                  />
                  <input
                    type="text"
                    className="input-field flex-1"
                    placeholder="Value (e.g. 1500W)"
                    value={spec.value}
                    onChange={(e) => updateSpecRow(index, 'value', e.target.value)}
                  />
                  {specifications.length > 1 && (
                    <button type="button" onClick={() => removeSpecRow(index)} className="p-2 text-red-400 hover:text-red-600">
                      <X size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button type="button" onClick={addSpecRow} className="mt-2 flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700">
              <Plus size={14} /> Add specification
            </button>
          </div>

          <div className="flex gap-3 pt-4">
            <button type="submit" className="btn-primary" disabled={mutation.isLoading}>
              {mutation.isLoading ? 'Saving...' : isEdit ? 'Update Equipment' : 'Save Equipment'}
            </button>
            <button type="button" onClick={() => navigate('/equipment')} className="btn-secondary">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
