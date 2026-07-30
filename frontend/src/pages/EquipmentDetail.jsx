import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MdArrowBack, MdScience, MdEdit, MdCalendarToday } from 'react-icons/md';
import { equipmentService } from '../services/services';
import { useAuth } from '../context/AuthContext';
import BookingModal from '../components/BookingModal';
import EquipmentImage from '../components/EquipmentImage';

const StatusBadge = ({ status }) => {
  const classes = { AVAILABLE: 'badge-available', BOOKED: 'badge-booked', UNDER_MAINTENANCE: 'badge-maintenance', RETIRED: 'badge-retired' };
  return <span className={`badge ${classes[status] || 'badge-pending'}`}>{status?.replace(/_/g, ' ')}</span>;
};

export default function EquipmentDetail() {
  const { id } = useParams();
  const { hasRole } = useAuth();
  const [equipment, setEquipment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  useEffect(() => {
    equipmentService.getById(id).then(res => {
      setEquipment(res.data.data);
    }).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="p-8 text-center text-gray-400">Loading...</div>;
  if (!equipment) return <div className="p-8 text-center text-gray-400">Equipment not found</div>;

  const isResearcher = hasRole('RESEARCHER');
  const isAvailable = equipment.status === 'AVAILABLE';
  const canBook = isResearcher && isAvailable;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Link to="/equipment" className="btn-ghost p-2"><MdArrowBack /></Link>
        <div>
          <h1 className="page-title">{equipment.name}</h1>
          <p className="page-subtitle">{equipment.manufacturer} · {equipment.model}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card">
          <div className="aspect-video bg-gray-100 rounded-xl flex items-center justify-center mb-6 overflow-hidden">
            <EquipmentImage equipment={equipment} className="w-full h-full object-cover rounded-xl" />
          </div>
          <h2 className="font-bold text-gray-900 mb-3">Description</h2>
          <p className="text-gray-600 text-sm">{equipment.description || 'No description available.'}</p>
        </div>

        <div className="space-y-4">
          <div className="card">
            <h2 className="font-bold text-gray-900 mb-4">Details</h2>
            <div className="space-y-3">
              {[
                ['Status', <StatusBadge status={equipment.status} />],
                ['Category', equipment.categoryName],
                ['Serial No.', equipment.serialNumber],
                ['Location', equipment.location],
                ['Department', equipment.departmentName],
                ['Purchase Date', equipment.purchaseDate],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between items-center py-1.5 border-b border-gray-50 last:border-0">
                  <span className="text-xs text-gray-500">{label}</span>
                  <span className="text-sm font-medium text-gray-800">{value || '—'}</span>
                </div>
              ))}
            </div>
          </div>

          {canBook && (
            <div className="flex flex-col gap-2">
              <button onClick={() => setIsBookingOpen(true)} className="btn-primary justify-center w-full py-2.5">
                <MdCalendarToday /> Book Equipment
              </button>
            </div>
          )}
        </div>
      </div>

      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        equipmentId={equipment.id}
        equipmentName={equipment.name}
        onSuccess={() => {
          equipmentService.getById(id).then(res => setEquipment(res.data.data));
        }}
      />
    </div>
  );
}

