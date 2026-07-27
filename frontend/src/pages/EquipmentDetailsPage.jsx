import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { platformService, fileUrl } from '../services/platformService';
import { can } from '../utils/permissions';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import {
  ArrowLeft, Edit2, Trash2, ImageIcon, FileText, Download, Star,
  UploadCloud, X, MapPin, Calendar, ShieldCheck, IndianRupee,
  Building2, FlaskConical, Cpu, QrCode, Clock, Package, Loader2,
  Repeat, Tag, Radio, HeartPulse, ZoomIn
} from 'lucide-react';
import PageTransition from '../components/PageTransition';
import StatusBadge, { ALL_STATUSES, STATUS_CONFIG } from '../components/equipment/StatusBadge';
import EquipmentFormModal from '../components/equipment/EquipmentFormModal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { useToast } from '../components/ui/Toast';

const formatBytes = (bytes) => {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const formatDate = (d) => (d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—');

const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-2.5 py-2">
    <Icon className="h-3.5 w-3.5 text-slate-400 mt-0.5 shrink-0" />
    <div className="min-w-0 flex-1">
      <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">{label}</p>
      <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 mt-0.5 break-words">{value || '—'}</p>
    </div>
  </div>
);

const EquipmentDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();

  const [equipment, setEquipment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [activeImage, setActiveImage] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const imageInputRef = useRef(null);
  const docInputRef = useRef(null);
  const [docType, setDocType] = useState('MANUAL');

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [statusTarget, setStatusTarget] = useState(null);
  const [statusChanging, setStatusChanging] = useState(false);
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);
  const [deleteImageTarget, setDeleteImageTarget] = useState(null);
  const [deleteDocTarget, setDeleteDocTarget] = useState(null);

  const [categories, setCategories] = useState([]);
  const [labs, setLabs] = useState([]);
  const [departments, setDepartments] = useState([]);

  const canEdit = can(user, 'editEquipment');
  const canDelete = can(user, 'deleteEquipment');
  const canChangeStatus = can(user, 'changeStatus');
  const canUploadImages = can(user, 'uploadImages');
  const canUploadDocs = can(user, 'uploadDocuments');

  const fetchEquipment = useCallback(async () => {
    try {
      const data = await platformService.getEquipmentById(id);
      setEquipment(data);
      setActiveImage(0);
    } catch (err) {
      if (err.response?.status === 400 || err.response?.status === 404) {
        setNotFound(true);
      } else {
        toast.error('Failed to load equipment details');
      }
    } finally {
      setLoading(false);
    }
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchEquipment();
    (async () => {
      const [cats, labsRes, depts] = await Promise.allSettled([
        platformService.getCategories(),
        platformService.getLabs(),
        platformService.getDepartments(),
      ]);
      if (cats.status === 'fulfilled') setCategories(cats.value || []);
      if (labsRes.status === 'fulfilled') setLabs(labsRes.value || []);
      if (depts.status === 'fulfilled') setDepartments(depts.value || []);
    })();
  }, [fetchEquipment]);

  // ---------- Uploads ----------
  const handleImageUpload = async (files) => {
    setUploadingImage(true);
    for (const file of [...files]) {
      try {
        await platformService.uploadEquipmentImage(equipment.equipmentId, file);
        toast.success(`${file.name} uploaded`);
      } catch (err) {
        toast.error(err.response?.data?.message || `Failed to upload ${file.name}`);
      }
    }
    setUploadingImage(false);
    fetchEquipment();
  };

  const handleDocUpload = async (files) => {
    setUploadingDoc(true);
    for (const file of [...files]) {
      try {
        await platformService.uploadEquipmentDocument(equipment.equipmentId, file, docType, file.name);
        toast.success(`${file.name} uploaded`);
      } catch (err) {
        toast.error(err.response?.data?.message || `Failed to upload ${file.name}`);
      }
    }
    setUploadingDoc(false);
    fetchEquipment();
  };

  const handleSetPrimary = async (imageId) => {
    try {
      await platformService.setPrimaryEquipmentImage(equipment.equipmentId, imageId);
      toast.success('Primary image updated');
      fetchEquipment();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to set primary image');
    }
  };

  const handleDeleteImage = async () => {
    try {
      await platformService.deleteEquipmentImage(equipment.equipmentId, deleteImageTarget.imageId);
      toast.success('Image deleted');
      setDeleteImageTarget(null);
      fetchEquipment();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete image');
    }
  };

  const handleDeleteDoc = async () => {
    try {
      await platformService.deleteEquipmentDocument(equipment.equipmentId, deleteDocTarget.documentId);
      toast.success('Document deleted');
      setDeleteDocTarget(null);
      fetchEquipment();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete document');
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await platformService.deleteEquipment(equipment.equipmentId);
      toast.success('Equipment deleted');
      navigate('/dashboard/equipment');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete equipment');
      setDeleting(false);
    }
  };

  const handleStatusChange = async () => {
    setStatusChanging(true);
    try {
      await platformService.changeEquipmentStatus(equipment.equipmentId, statusTarget);
      toast.success(`Status changed to ${STATUS_CONFIG[statusTarget].label}`);
      setStatusTarget(null);
      fetchEquipment();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change status');
    } finally {
      setStatusChanging(false);
    }
  };

  // ---------- Derived ----------
  const specs = (() => {
    try {
      return equipment?.specifications ? Object.entries(JSON.parse(equipment.specifications)) : [];
    } catch {
      return [];
    }
  })();

  const images = equipment?.images || [];
  const documents = equipment?.documents || [];

  // Simple health score: base 100, minus penalties for status/warranty
  const healthScore = (() => {
    if (!equipment) return 0;
    let score = 100;
    if (equipment.status === 'UNDER_MAINTENANCE') score -= 30;
    if (equipment.status === 'OUT_OF_SERVICE') score -= 60;
    if (equipment.status === 'LOST') score = 0;
    if (equipment.warrantyExpiry && new Date(equipment.warrantyExpiry) < new Date()) score -= 15;
    return Math.max(0, score);
  })();

  const healthColor = healthScore >= 70 ? 'text-green-500' : healthScore >= 40 ? 'text-amber-500' : 'text-red-500';

  const timeline = (() => {
    if (!equipment) return [];
    const events = [];
    if (equipment.purchaseDate) events.push({ date: equipment.purchaseDate, label: 'Purchased', detail: equipment.vendor ? `From ${equipment.vendor}` : 'Asset acquired' });
    if (equipment.createdAt) events.push({ date: equipment.createdAt, label: 'Registered in inventory', detail: `Cataloged as ${equipment.equipmentCode}` });
    images.forEach((img) => events.push({ date: img.uploadedAt, label: 'Image uploaded', detail: img.fileName }));
    documents.forEach((doc) => events.push({ date: doc.uploadedAt, label: `${doc.documentType} document uploaded`, detail: doc.fileName }));
    if (equipment.warrantyExpiry) events.push({ date: equipment.warrantyExpiry, label: 'Warranty expiry', detail: new Date(equipment.warrantyExpiry) < new Date() ? 'Expired' : 'Upcoming' });
    return events
      .filter((e) => e.date)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 8);
  })();

  // ---------- Render ----------
  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (notFound || !equipment) {
    return (
      <div className="text-center py-24">
        <Package className="h-12 w-12 mx-auto text-slate-300 dark:text-slate-700 mb-4" />
        <p className="text-sm font-bold text-slate-500">Equipment not found</p>
        <button
          onClick={() => navigate('/dashboard/equipment')}
          className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-primary cursor-pointer"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Inventory
        </button>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="space-y-5 animate-fadeIn">
        {/* Header bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/dashboard/equipment')}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-primary hover:border-primary/40 transition-colors cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <h2 className="text-xl font-extrabold text-slate-800 dark:text-white my-0 font-heading">
                {equipment.equipmentName}
              </h2>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                {equipment.equipmentCode} · {equipment.category}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <StatusBadge status={equipment.status} size="lg" />
            {canChangeStatus && (
              <div className="relative">
                <button
                  onClick={() => setStatusMenuOpen(!statusMenuOpen)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 hover:border-amber-500/40 hover:text-amber-500 transition-colors cursor-pointer"
                >
                  <Repeat className="h-3.5 w-3.5" /> Change Status
                </button>
                <AnimatePresence>
                  {statusMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-20" onClick={() => setStatusMenuOpen(false)} />
                      <motion.div
                        initial={{ opacity: 0, y: 6, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.95 }}
                        className="absolute right-0 mt-1.5 w-44 glass-card dark:glass-card-dark rounded-xl shadow-xl border border-slate-200/50 dark:border-slate-800/50 z-30 p-1.5"
                      >
                        {ALL_STATUSES.filter((s) => s !== equipment.status).map((s) => (
                          <button
                            key={s}
                            onClick={() => { setStatusMenuOpen(false); setStatusTarget(s); }}
                            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200/40 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
                          >
                            <span className={`h-2 w-2 rounded-full ${STATUS_CONFIG[s].dot}`} />
                            {STATUS_CONFIG[s].label}
                          </button>
                        ))}
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            )}
            {canEdit && (
              <button
                onClick={() => setEditOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 hover:border-blue-500/40 hover:text-blue-500 transition-colors cursor-pointer"
              >
                <Edit2 className="h-3.5 w-3.5" /> Edit
              </button>
            )}
            {canDelete && (
              <button
                onClick={() => setDeleteOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-red-500/30 text-xs font-bold text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </button>
            )}
          </div>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* ---- Left column: gallery + info ---- */}
          <div className="lg:col-span-2 space-y-5">
            {/* Image Gallery */}
            <div className="glass-card dark:glass-card-dark rounded-2xl p-4">
              <div className="relative h-64 sm:h-80 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 overflow-hidden flex items-center justify-center group">
                {images.length > 0 ? (
                  <>
                    <img
                      src={fileUrl(images[activeImage]?.imageUrl)}
                      alt={equipment.equipmentName}
                      className="h-full w-full object-contain cursor-zoom-in"
                      onClick={() => setZoomOpen(true)}
                    />
                    <button
                      onClick={() => setZoomOpen(true)}
                      className="absolute top-3 right-3 p-2 rounded-xl bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      <ZoomIn className="h-4 w-4" />
                    </button>
                    {images[activeImage]?.isPrimary && (
                      <span className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-500/90 text-white text-[9px] font-bold">
                        <Star className="h-3 w-3 fill-current" /> Primary
                      </span>
                    )}
                  </>
                ) : (
                  <div className="text-center">
                    <ImageIcon className="h-12 w-12 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
                    <p className="text-[11px] font-bold text-slate-400">No images uploaded</p>
                  </div>
                )}
              </div>

              {/* Thumbnails + upload */}
              <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <div key={img.imageId} className="relative shrink-0 group/thumb">
                    <button
                      onClick={() => setActiveImage(i)}
                      className={`h-14 w-14 rounded-xl overflow-hidden border-2 transition-colors cursor-pointer ${
                        i === activeImage ? 'border-primary' : 'border-transparent hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <img src={fileUrl(img.imageUrl)} alt="" className="h-full w-full object-cover" />
                    </button>
                    {canUploadImages && (
                      <div className="absolute -top-1.5 -right-1.5 hidden group-hover/thumb:flex gap-0.5">
                        {!img.isPrimary && (
                          <button
                            onClick={() => handleSetPrimary(img.imageId)}
                            title="Set as primary"
                            className="p-1 rounded-full bg-amber-500 text-white shadow cursor-pointer"
                          >
                            <Star className="h-2.5 w-2.5" />
                          </button>
                        )}
                        <button
                          onClick={() => setDeleteImageTarget(img)}
                          title="Delete image"
                          className="p-1 rounded-full bg-red-500 text-white shadow cursor-pointer"
                        >
                          <X className="h-2.5 w-2.5" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
                {canUploadImages && (
                  <button
                    onClick={() => imageInputRef.current?.click()}
                    disabled={uploadingImage}
                    className="h-14 w-14 shrink-0 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-primary/50 flex items-center justify-center text-slate-400 hover:text-primary transition-colors cursor-pointer"
                  >
                    {uploadingImage ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
                  </button>
                )}
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  hidden
                  onChange={(e) => { handleImageUpload(e.target.files); e.target.value = ''; }}
                />
              </div>
            </div>

            {/* Equipment Information */}
            <div className="glass-card dark:glass-card-dark rounded-2xl p-5">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5">
                <Package className="h-3.5 w-3.5" /> Equipment Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 divide-y sm:divide-y-0 divide-slate-100/70 dark:divide-slate-800/40">
                <InfoRow icon={Tag} label="Manufacturer" value={equipment.manufacturer} />
                <InfoRow icon={Cpu} label="Model" value={equipment.model} />
                <InfoRow icon={Radio} label="Serial Number" value={equipment.serialNumber} />
                <InfoRow icon={Radio} label="RFID Tag" value={equipment.rfidTag} />
                <InfoRow icon={Building2} label="Institution" value={equipment.institutionName} />
                <InfoRow icon={Building2} label="Department" value={equipment.departmentName} />
                <InfoRow icon={FlaskConical} label="Assigned Laboratory" value={equipment.labName} />
                <InfoRow icon={MapPin} label="Current Location" value={equipment.currentLocation} />
              </div>
              {equipment.tags && (
                <div className="mt-4 pt-4 border-t border-slate-100/70 dark:border-slate-800/40">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Tags</p>
                  <div className="flex flex-wrap gap-1.5">
                    {equipment.tags.split(',').map((t) => (
                      <span key={t} className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary px-2.5 py-0.5 text-[11px] font-semibold">
                        <Tag className="h-3 w-3" /> {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {equipment.description && (
                <div className="mt-4 pt-4 border-t border-slate-100/70 dark:border-slate-800/40">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Description</p>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{equipment.description}</p>
                </div>
              )}
            </div>

            {/* Specifications */}
            <div className="glass-card dark:glass-card-dark rounded-2xl p-5">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-1.5">
                <Cpu className="h-3.5 w-3.5" /> Specifications
              </h3>
              {specs.length === 0 ? (
                <p className="text-[11px] text-slate-400 italic">No specifications recorded for this equipment.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {specs.map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between bg-slate-100/50 dark:bg-slate-900/40 rounded-xl px-3.5 py-2.5">
                      <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{key}</span>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{String(value)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Documents */}
            <div className="glass-card dark:glass-card-dark rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 my-0 flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5" /> Documents ({documents.length})
                </h3>
                {canUploadDocs && (
                  <div className="flex items-center gap-1.5">
                    <select
                      value={docType}
                      onChange={(e) => setDocType(e.target.value)}
                      className="text-[10px] font-bold px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/20 text-slate-600 dark:text-slate-300 cursor-pointer"
                    >
                      <option value="MANUAL">User Manual</option>
                      <option value="WARRANTY">Warranty Card</option>
                      <option value="SPECIFICATION">Specification</option>
                      <option value="CALIBRATION">Calibration</option>
                      <option value="OTHER">Other</option>
                    </select>
                    <button
                      onClick={() => docInputRef.current?.click()}
                      disabled={uploadingDoc}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20 text-[10px] font-bold hover:bg-primary/20 transition-colors cursor-pointer"
                    >
                      {uploadingDoc ? <Loader2 className="h-3 w-3 animate-spin" /> : <UploadCloud className="h-3 w-3" />}
                      Upload
                    </button>
                    <input
                      ref={docInputRef}
                      type="file"
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,image/*"
                      multiple
                      hidden
                      onChange={(e) => { handleDocUpload(e.target.files); e.target.value = ''; }}
                    />
                  </div>
                )}
              </div>
              {documents.length === 0 ? (
                <p className="text-[11px] text-slate-400 italic">No documents uploaded (manual, warranty, specification PDF...).</p>
              ) : (
                <div className="space-y-2">
                  {documents.map((doc) => (
                    <div key={doc.documentId} className="flex items-center gap-3 bg-slate-100/50 dark:bg-slate-900/40 rounded-xl px-3.5 py-2.5 group">
                      <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">{doc.title || doc.fileName}</p>
                        <p className="text-[9px] text-slate-400">
                          {doc.documentType} · {formatBytes(doc.fileSize)} · by {doc.uploadedBy || 'unknown'} · {formatDate(doc.uploadedAt)}
                        </p>
                      </div>
                      <a
                        href={fileUrl(doc.fileUrl)}
                        target="_blank"
                        rel="noreferrer"
                        title="Preview / Download"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-primary hover:bg-primary/10 transition-colors"
                      >
                        <Download className="h-3.5 w-3.5" />
                      </a>
                      {canUploadDocs && (
                        <button
                          onClick={() => setDeleteDocTarget(doc)}
                          title="Delete document"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ---- Right column: purchase, warranty, QR, health, timeline ---- */}
          <div className="space-y-5">
            {/* Health Score */}
            <div className="glass-card dark:glass-card-dark rounded-2xl p-5">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-1.5">
                <HeartPulse className="h-3.5 w-3.5" /> Equipment Health
              </h3>
              <div className="flex items-center gap-4">
                <div className="relative h-16 w-16 shrink-0">
                  <svg viewBox="0 0 36 36" className="h-16 w-16 -rotate-90">
                    <circle cx="18" cy="18" r="15.9" fill="none" className="stroke-slate-200 dark:stroke-slate-800" strokeWidth="3.5" />
                    <circle
                      cx="18" cy="18" r="15.9" fill="none"
                      className={healthScore >= 70 ? 'stroke-green-500' : healthScore >= 40 ? 'stroke-amber-500' : 'stroke-red-500'}
                      strokeWidth="3.5"
                      strokeDasharray={`${healthScore} 100`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className={`absolute inset-0 flex items-center justify-center text-sm font-extrabold ${healthColor}`}>
                    {healthScore}
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  Based on current status{equipment.warrantyExpiry ? ' and warranty validity' : ''}.
                  {healthScore >= 70 ? ' Asset is in good operating condition.' : healthScore >= 40 ? ' Attention may be required.' : ' Immediate attention required.'}
                </div>
              </div>
            </div>

            {/* Purchase & Warranty */}
            <div className="glass-card dark:glass-card-dark rounded-2xl p-5">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5" /> Purchase & Warranty
              </h3>
              <InfoRow icon={Calendar} label="Purchase Date" value={formatDate(equipment.purchaseDate)} />
              <InfoRow
                icon={ShieldCheck}
                label="Warranty Expiry"
                value={
                  equipment.warrantyExpiry
                    ? `${formatDate(equipment.warrantyExpiry)}${new Date(equipment.warrantyExpiry) < new Date() ? ' (Expired)' : ''}`
                    : '—'
                }
              />
              <InfoRow icon={Building2} label="Vendor" value={equipment.vendor} />
              <InfoRow
                icon={IndianRupee}
                label="Cost"
                value={equipment.cost != null ? `₹ ${Number(equipment.cost).toLocaleString('en-IN')}` : '—'}
              />
            </div>

            {/* QR Code */}
            <div className="glass-card dark:glass-card-dark rounded-2xl p-5 text-center">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center justify-center gap-1.5">
                <QrCode className="h-3.5 w-3.5" /> Asset QR Code
              </h3>
              <div className="inline-block p-3 bg-white rounded-2xl border border-slate-200 shadow-sm">
                <QRCodeSVG
                  value={equipment.qrCode || `LRP-EQ:${equipment.equipmentCode}`}
                  size={128}
                  level="M"
                />
              </div>
              <p className="text-[10px] font-mono text-slate-400 mt-2.5">{equipment.qrCode || `LRP-EQ:${equipment.equipmentCode}`}</p>
              <p className="text-[9px] text-slate-400 mt-1">Scan to identify this asset</p>
            </div>

            {/* Activity Timeline */}
            <div className="glass-card dark:glass-card-dark rounded-2xl p-5">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" /> Activity Timeline
              </h3>
              {timeline.length === 0 ? (
                <p className="text-[11px] text-slate-400 italic">No recorded activity.</p>
              ) : (
                <div className="relative pl-5 space-y-4 before:absolute before:left-1.5 before:top-1 before:bottom-1 before:w-px before:bg-slate-200 dark:before:bg-slate-800">
                  {timeline.map((event, i) => (
                    <div key={i} className="relative">
                      <span className="absolute -left-5 top-0.5 h-3 w-3 rounded-full bg-primary/20 border-2 border-primary" />
                      <p className="text-[11px] font-bold text-slate-700 dark:text-slate-200">{event.label}</p>
                      <p className="text-[9px] text-slate-400 truncate">{event.detail}</p>
                      <p className="text-[9px] text-slate-400 font-semibold mt-0.5">{formatDate(event.date)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Zoom lightbox */}
        <AnimatePresence>
          {zoomOpen && images.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setZoomOpen(false)}
              className="fixed inset-0 z-[95] bg-black/90 flex items-center justify-center p-6 cursor-zoom-out"
            >
              <button className="absolute top-5 right-5 p-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors">
                <X className="h-5 w-5" />
              </button>
              <motion.img
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                src={fileUrl(images[activeImage]?.imageUrl)}
                alt={equipment.equipmentName}
                className="max-h-full max-w-full object-contain rounded-xl"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Edit modal */}
        <EquipmentFormModal
          open={editOpen}
          mode="edit"
          equipment={equipment}
          user={user}
          categories={categories}
          labs={labs}
          departments={departments}
          onClose={() => setEditOpen(false)}
          onSaved={fetchEquipment}
        />

        {/* Confirmations */}
        <ConfirmDialog
          open={deleteOpen}
          danger
          title="Delete Equipment?"
          message={`"${equipment.equipmentName}" and all its images, documents and history will be permanently removed.`}
          confirmLabel="Delete"
          loading={deleting}
          onConfirm={handleDelete}
          onCancel={() => setDeleteOpen(false)}
        />
        <ConfirmDialog
          open={!!statusTarget}
          title="Change Equipment Status?"
          message={statusTarget ? `Change status from ${STATUS_CONFIG[equipment.status]?.label} to ${STATUS_CONFIG[statusTarget]?.label}?` : ''}
          confirmLabel="Change Status"
          loading={statusChanging}
          onConfirm={handleStatusChange}
          onCancel={() => setStatusTarget(null)}
        />
        <ConfirmDialog
          open={!!deleteImageTarget}
          danger
          title="Delete Image?"
          message={`Remove "${deleteImageTarget?.fileName || 'this image'}" from the gallery?`}
          confirmLabel="Delete"
          onConfirm={handleDeleteImage}
          onCancel={() => setDeleteImageTarget(null)}
        />
        <ConfirmDialog
          open={!!deleteDocTarget}
          danger
          title="Delete Document?"
          message={`Remove "${deleteDocTarget?.title || deleteDocTarget?.fileName}" permanently?`}
          confirmLabel="Delete"
          onConfirm={handleDeleteDoc}
          onCancel={() => setDeleteDocTarget(null)}
        />
      </div>
    </PageTransition>
  );
};

export default EquipmentDetailsPage;
