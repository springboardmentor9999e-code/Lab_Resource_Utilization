import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  MdAdd, MdSearch, MdFilterList, MdGridView, MdViewList,
  MdScience, MdClose, MdEdit, MdDelete
} from 'react-icons/md';
import { equipmentService } from '../services/services';
import { useAuth } from '../context/AuthContext';
import EquipmentImage from '../components/EquipmentImage';

const STATUS_STYLES = {
  AVAILABLE: 'badge-available',
  BOOKED: 'badge-booked',
  UNDER_MAINTENANCE: 'badge-maintenance',
  OUT_OF_SERVICE: 'badge-retired',
  RETIRED: 'badge-retired',
};

const StatusBadge = ({ status }) => (
  <span className={`badge ${STATUS_STYLES[status] || 'badge-pending'}`}>
    {status?.replace(/_/g, ' ')}
  </span>
);

const EquipmentCard = ({ equipment, onEdit, onDelete, canManage }) => (
  <div className="bg-white rounded-2xl shadow-card hover:shadow-card-hover transition-shadow duration-200 overflow-hidden group">
    <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-50 relative overflow-hidden">
      <EquipmentImage
        equipment={equipment}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
      />
      {canManage && (
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={() => onEdit(equipment)}
            className="w-7 h-7 bg-white/90 rounded-lg flex items-center justify-center hover:bg-white shadow-sm"
          >
            <MdEdit className="text-gray-600 text-sm" />
          </button>
          <button
            onClick={() => onDelete(equipment)}
            className="w-7 h-7 bg-white/90 rounded-lg flex items-center justify-center hover:bg-red-50 shadow-sm"
          >
            <MdDelete className="text-red-500 text-sm" />
          </button>
        </div>
      )}
    </div>
    <div className="p-4">
      <h3 className="font-semibold text-gray-900 text-sm">{equipment.name}</h3>
      <p className="text-xs text-gray-400 mt-0.5">{equipment.categoryName}</p>
      <div className="flex items-center justify-between mt-3">
        <StatusBadge status={equipment.status} />
        <Link
          to={`/equipment/${equipment.id}`}
          className="text-xs text-brand-500 font-medium hover:text-brand-600"
        >
          Details
        </Link>
      </div>
    </div>
  </div>
);

export default function Equipment() {
  const { canManageEquipment } = useAuth();
  const [equipment, setEquipment] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);

  const fetchEquipment = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, size: 8 };
      if (search) params.search = search;
      if (selectedCategory) params.categoryId = selectedCategory;
      if (selectedStatus) params.status = selectedStatus;

      const res = await equipmentService.getAll(params);
      const data = res.data.data;
      setEquipment(data.content || []);
      setTotalPages(data.totalPages || 1);
      setTotalElements(data.totalElements || 0);
    } catch (err) {
      console.error('Equipment fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [page, search, selectedCategory, selectedStatus]);

  useEffect(() => {
    fetchEquipment();
  }, [fetchEquipment]);

  useEffect(() => {
    equipmentService.getCategories().then(res => {
      setCategories(res.data.data || []);
    }).catch(() => {});
  }, []);

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(0);
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Equipment</h1>
          <p className="page-subtitle">Browse and manage all lab equipment.</p>
        </div>
        {canManageEquipment && (
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary"
          >
            <MdAdd className="text-lg" /> Add Equipment
          </button>
        )}
      </div>

      {/* Filters toolbar */}
      <div className="card p-4 flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="search-box flex-1 min-w-48">
          <MdSearch className="text-gray-400 text-lg flex-shrink-0" />
          <input
            value={search}
            onChange={handleSearch}
            placeholder="Search equipment..."
          />
        </div>

        {/* Category filter */}
        <select
          value={selectedCategory}
          onChange={(e) => { setSelectedCategory(e.target.value); setPage(0); }}
          className="form-input w-44 py-2"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        {/* Status filter */}
        <select
          value={selectedStatus}
          onChange={(e) => { setSelectedStatus(e.target.value); setPage(0); }}
          className="form-input w-44 py-2"
        >
          <option value="">All Status</option>
          {['AVAILABLE', 'BOOKED', 'UNDER_MAINTENANCE', 'OUT_OF_SERVICE', 'RETIRED'].map(s => (
            <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
          ))}
        </select>

        {/* View toggle */}
        <div className="flex border border-gray-200 rounded-xl overflow-hidden">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 ${viewMode === 'grid' ? 'bg-brand-500 text-white' : 'bg-white text-gray-400 hover:bg-gray-50'}`}
          >
            <MdGridView className="text-lg" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 ${viewMode === 'list' ? 'bg-brand-500 text-white' : 'bg-white text-gray-400 hover:bg-gray-50'}`}
          >
            <MdViewList className="text-lg" />
          </button>
        </div>
      </div>

      {/* Equipment grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array(8).fill(0).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-card">
              <div className="skeleton aspect-video" />
              <div className="p-4 space-y-2">
                <div className="skeleton h-4 w-3/4 rounded" />
                <div className="skeleton h-3 w-1/2 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : equipment.length === 0 ? (
        <div className="card py-16 text-center">
          <MdScience className="text-5xl text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400 font-medium">No equipment found</p>
          <p className="text-gray-300 text-sm">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className={viewMode === 'grid'
          ? 'grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4'
          : 'flex flex-col gap-3'
        }>
          {equipment.map((e) => (
            <EquipmentCard
              key={e.id}
              equipment={e}
              canManage={canManageEquipment}
              onEdit={() => {}}
              onDelete={() => {}}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>Showing {page * 8 + 1} to {Math.min((page + 1) * 8, totalElements)} of {totalElements} items</span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              className="px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40"
            >
              ‹
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => (
              <button
                key={i}
                onClick={() => setPage(i)}
                className={`w-8 h-8 rounded-lg text-sm font-medium ${
                  page === i
                    ? 'bg-brand-500 text-white'
                    : 'border border-gray-200 hover:bg-gray-50 text-gray-700'
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
              disabled={page >= totalPages - 1}
              className="px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40"
            >
              ›
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
