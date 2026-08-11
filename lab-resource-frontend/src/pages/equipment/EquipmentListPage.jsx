import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, Plus, MapPin, Cpu } from 'lucide-react';
import { equipmentApi } from '../../api/api';
import { useAuth } from '../../context/AuthContext';

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

export default function EquipmentListPage() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const { isManager, isSystemAdmin } = useAuth();

  const { data: equipment = [], isLoading, error } = useQuery({
    queryKey: ['equipment'],
    queryFn: async () => {
      const res = await equipmentApi.getAll();
      return res.data.content || [];
    },
  });

  const filteredEquipment = equipment.filter((eq) => {
    if (search && !eq.equipmentName?.toLowerCase().includes(search.toLowerCase()) && !eq.equipmentCode?.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    if (categoryFilter && eq.categoryId?.toString() !== categoryFilter) {
      return false;
    }
    if (statusFilter && eq.status !== statusFilter) {
      return false;
    }
    return true;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Equipment Inventory</h1>
          <p className="text-gray-600 mt-1">Manage and browse laboratory equipment</p>
        </div>
        {isManager && (
          <Link to="/equipment/new" className="btn-primary flex items-center gap-2">
            <Plus size={18} />
            Add Equipment
          </Link>
        )}
      </div>

      <div className="card mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search equipment..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="input-field w-48">
            <option value="">All Categories</option>
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
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-field w-48">
            <option value="">All Status</option>
            <option value="AVAILABLE">Available</option>
            <option value="IN_USE">In Use</option>
            <option value="UNDER_MAINTENANCE">Under Maintenance</option>
            <option value="RESERVED">Reserved</option>
            <option value="CALIBRATION_DUE">Calibration Due</option>
          </select>
        </div>
      </div>

      {isLoading && (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      )}

      {error && (
        <div className="card text-center py-12">
          <p className="text-danger-600">Failed to load equipment. Please try again.</p>
        </div>
      )}

      {!isLoading && !error && filteredEquipment.length === 0 && (
        <div className="card text-center py-12">
          <Cpu size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">No equipment found</p>
          {isManager && (
            <Link to="/equipment/new" className="btn-primary inline-flex items-center gap-2 mt-4">
              <Plus size={16} /> Add Equipment
            </Link>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEquipment.map((eq) => (
          <Link key={eq.id} to={`/equipment/${eq.id}`} className="card hover:shadow-md transition-shadow">
            <div className="h-40 bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
              <Cpu size={48} className="text-gray-300" />
            </div>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-500 font-mono">{eq.equipmentCode}</p>
                <h3 className="font-semibold text-gray-800 mt-1">{eq.equipmentName}</h3>
              </div>
              <span className={statusColors[eq.status] || 'badge-info'}>
                {statusLabels[eq.status] || eq.status}
              </span>
            </div>
            <div className="mt-3 flex items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <MapPin size={14} />
                {eq.laboratoryName || 'N/A'}
              </span>
              <span>{eq.categoryName || 'N/A'}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
