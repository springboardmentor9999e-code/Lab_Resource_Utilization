import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
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
  warrantyExpiry: z.string().optional().or(z.literal('')),
  description: z.string().optional().or(z.literal('')),
  maxBookingHours: z.number().min(1).max(24).default(8),
});

export default function EquipmentFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEdit = Boolean(id);

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
      warrantyExpiry: '',
      description: '',
      maxBookingHours: 8,
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
        warrantyExpiry: existing.warrantyExpiry || '',
        description: existing.description || '',
        maxBookingHours: existing.maxBookingHours || 8,
      });
    }
  }, [existing, reset]);

  const mutation = useMutation({
    mutationFn: (data) => {
      const payload = {
        ...data,
        categoryId: parseInt(data.categoryId),
        laboratoryId: parseInt(data.laboratoryId),
        purchaseCost: data.purchaseCost ? parseFloat(data.purchaseCost) : null,
        maxBookingHours: parseInt(data.maxBookingHours) || 8,
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Serial Number</label>
              <input {...register('serialNumber')} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Booking Hours</label>
              <input type="number" {...register('maxBookingHours', { valueAsNumber: true })} className="input-field" />
              {errors.maxBookingHours && <p className="text-danger-500 text-xs mt-1">{errors.maxBookingHours.message}</p>}
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea {...register('description')} className="input-field" rows={3} />
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
