import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  X, Loader2, Save, UploadCloud, FileText, Trash2, Plus,
  ImageIcon, Info, Cpu, Package, MapPin, QrCode, Share2
} from 'lucide-react';
import { platformService } from '../../services/platformService';
import { useToast } from '../ui/Toast';
import { can } from '../../utils/permissions';
import { ALL_STATUSES, STATUS_CONFIG } from './StatusBadge';
import TagInput from './TagInput';

const emptyForm = {
  equipmentName: '',
  equipmentCode: '',
  category: 'Computers',
  manufacturer: '',
  model: '',
  serialNumber: '',
  purchaseDate: '',
  warrantyExpiry: '',
  vendor: '',
  cost: '',
  currentLocation: '',
  status: 'AVAILABLE',
  description: '',
  rfidTag: '',
  tags: '',
  isShareable: false,
  hourlyRate: '',
  labId: '',
  departmentId: '',
  institutionId: '',
};

const SPEC_PRESETS = [
  'Processor', 'RAM', 'Storage', 'Operating System', 'Voltage',
  'Power Consumption', 'Dimensions', 'Weight', 'Brand', 'Model Number',
];

const inputCls =
  'w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/20 text-slate-900 dark:text-white text-xs transition-all focus:outline-none focus:ring-2 focus:border-primary focus:ring-primary/10';

const labelCls =
  'block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5';

/**
 * Large enterprise Add / Edit equipment modal.
 * props: open, mode ('add'|'edit'), equipment (for edit), user, categories, tagOptions, labs,
 *        departments, onClose, onSaved
 */
const EquipmentFormModal = ({ open, mode, equipment, user, categories, tagOptions = [], labs, departments, onClose, onSaved }) => {
  const toast = useToast();
  const [form, setForm] = useState(emptyForm);
  const [specs, setSpecs] = useState([]); // [{key, value}]
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  // Deferred uploads for ADD mode (files picked before equipment exists)
  const [pendingImages, setPendingImages] = useState([]);
  const [pendingDocs, setPendingDocs] = useState([]); // [{file, documentType}]
  const imageInputRef = useRef(null);
  const docInputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  const canUploadImages = can(user, 'uploadImages');
  const canUploadDocs = can(user, 'uploadDocuments');
  const canChangeStatus = can(user, 'changeStatus') || mode === 'add';

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setPendingImages([]);
    setPendingDocs([]);
    if (mode === 'edit' && equipment) {
      setForm({
        equipmentName: equipment.equipmentName || '',
        equipmentCode: equipment.equipmentCode || '',
        category: equipment.category || 'Computers',
        manufacturer: equipment.manufacturer || '',
        model: equipment.model || '',
        serialNumber: equipment.serialNumber || '',
        purchaseDate: equipment.purchaseDate || '',
        warrantyExpiry: equipment.warrantyExpiry || '',
        vendor: equipment.vendor || '',
        cost: equipment.cost ?? '',
        currentLocation: equipment.currentLocation || '',
        status: equipment.status || 'AVAILABLE',
        description: equipment.description || '',
        rfidTag: equipment.rfidTag || '',
        tags: equipment.tags || '',
        isShareable: equipment.isShareable === true,
        hourlyRate: equipment.hourlyRate ?? '',
        labId: equipment.labId || '',
        departmentId: equipment.departmentId || '',
        institutionId: equipment.institutionId || '',
      });
      try {
        const parsed = equipment.specifications ? JSON.parse(equipment.specifications) : {};
        setSpecs(Object.entries(parsed).map(([key, value]) => ({ key, value })));
      } catch {
        setSpecs([]);
      }
    } else {
      setForm({ ...emptyForm, category: categories[0] || 'Computers' });
      setSpecs([]);
    }
  }, [open, mode, equipment, categories]);

  const setField = (name, value) => {
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((e) => ({ ...e, [name]: undefined }));
  };

  const validate = () => {
    const errs = {};
    if (!form.equipmentName.trim()) errs.equipmentName = 'Equipment name is required';
    if (!form.equipmentCode.trim()) errs.equipmentCode = 'Equipment code is required';
    if (!form.category.trim()) errs.category = 'Category is required';
    if (form.cost && isNaN(Number(form.cost))) errs.cost = 'Cost must be a number';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ---------- Pending file selection (add mode) ----------
  const addPendingImages = (files) => {
    const valid = [...files].filter((f) => {
      if (!f.type.startsWith('image/')) {
        toast.error(`${f.name} is not an image`);
        return false;
      }
      if (f.size > 10 * 1024 * 1024) {
        toast.error(`${f.name} exceeds the 10MB image limit`);
        return false;
      }
      return true;
    });
    setPendingImages((prev) => [...prev, ...valid]);
  };

  const addPendingDoc = (files, documentType = 'OTHER') => {
    const valid = [...files].filter((f) => {
      if (f.size > 10 * 1024 * 1024) {
        toast.error(`${f.name} exceeds the 10MB limit`);
        return false;
      }
      return true;
    });
    setPendingDocs((prev) => [...prev, ...valid.map((file) => ({ file, documentType }))]);
  };

  // ---------- Save ----------
  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const specObject = {};
      specs.forEach(({ key, value }) => {
        if (key.trim()) specObject[key.trim()] = value;
      });

      const payload = {
        ...form,
        cost: form.cost === '' ? null : Number(form.cost),
        hourlyRate: form.hourlyRate === '' ? null : Number(form.hourlyRate),
        purchaseDate: form.purchaseDate || null,
        warrantyExpiry: form.warrantyExpiry || null,
        labId: form.labId || null,
        departmentId: form.departmentId || null,
        institutionId: form.institutionId || null,
        specifications: Object.keys(specObject).length ? JSON.stringify(specObject) : null,
      };

      let saved;
      if (mode === 'edit') {
        saved = await platformService.updateEquipment(equipment.equipmentId, payload);
      } else {
        saved = await platformService.createEquipment(payload);
      }

      // Upload files picked during add/edit
      for (const file of pendingImages) {
        try {
          await platformService.uploadEquipmentImage(saved.equipmentId, file);
        } catch (e) {
          toast.error(`Image ${file.name} failed to upload: ${e.response?.data?.message || e.message}`);
        }
      }
      for (const { file, documentType } of pendingDocs) {
        try {
          await platformService.uploadEquipmentDocument(saved.equipmentId, file, documentType, file.name);
        } catch (e) {
          toast.error(`Document ${file.name} failed to upload: ${e.response?.data?.message || e.message}`);
        }
      }

      toast.success(mode === 'edit' ? 'Equipment updated successfully' : 'Equipment added successfully');
      onSaved(saved);
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to save equipment';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.55 }}
            exit={{ opacity: 0 }}
            onClick={saving ? undefined : onClose}
            className="fixed inset-0 z-[60] bg-black"
          />
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-6 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 280 }}
              className="glass-card dark:glass-card-dark rounded-2xl shadow-2xl border border-slate-200/50 dark:border-slate-800/50 w-full max-w-3xl max-h-[92vh] flex flex-col pointer-events-auto overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200/40 dark:border-slate-800/40 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 dark:bg-primary/20 p-2 rounded-xl text-primary border border-primary/20">
                    <Package className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white font-heading my-0">
                      {mode === 'edit' ? 'Edit Equipment' : 'Add New Equipment'}
                    </h3>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {mode === 'edit'
                        ? `Updating ${equipment?.equipmentCode}`
                        : 'Register a new asset in the inventory'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  disabled={saving}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Body (scrollable) */}
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
                {/* ---- Section: General ---- */}
                <section>
                  <h4 className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
                    <Info className="h-3.5 w-3.5" /> General Information
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Equipment Name *</label>
                      <input
                        value={form.equipmentName}
                        onChange={(e) => setField('equipmentName', e.target.value)}
                        placeholder="e.g. Digital Oscilloscope 100MHz"
                        className={`${inputCls} ${errors.equipmentName ? 'border-red-500' : ''}`}
                      />
                      {errors.equipmentName && <p className="text-red-500 text-[10px] font-semibold mt-1">{errors.equipmentName}</p>}
                    </div>
                    <div>
                      <label className={labelCls}>Equipment Code *</label>
                      <input
                        value={form.equipmentCode}
                        onChange={(e) => setField('equipmentCode', e.target.value)}
                        placeholder="e.g. EQ-PHYS-010"
                        className={`${inputCls} ${errors.equipmentCode ? 'border-red-500' : ''}`}
                      />
                      {errors.equipmentCode && <p className="text-red-500 text-[10px] font-semibold mt-1">{errors.equipmentCode}</p>}
                    </div>
                    <div>
                      <label className={labelCls}>Category *</label>
                      {/* Combobox: pick an existing category or type a brand new one */}
                      <input
                        list="equipment-category-options"
                        value={form.category}
                        onChange={(e) => setField('category', e.target.value)}
                        placeholder="Select or type a new category"
                        className={`${inputCls} ${errors.category ? 'border-red-500' : ''}`}
                      />
                      <datalist id="equipment-category-options">
                        {categories.map((c) => <option key={c} value={c} />)}
                      </datalist>
                      {errors.category ? (
                        <p className="text-red-500 text-[10px] font-semibold mt-1">{errors.category}</p>
                      ) : (
                        !categories.includes(form.category.trim()) && form.category.trim() && (
                          <p className="text-[10px] text-primary font-semibold mt-1">
                            New category "{form.category.trim()}" will be created
                          </p>
                        )
                      )}
                    </div>
                    <div>
                      <label className={labelCls}>Status</label>
                      <select
                        value={form.status}
                        onChange={(e) => setField('status', e.target.value)}
                        disabled={!canChangeStatus}
                        className={`${inputCls} disabled:opacity-60`}
                      >
                        {ALL_STATUSES.map((s) => (
                          <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>Laboratory</label>
                      <select
                        value={form.labId}
                        onChange={(e) => setField('labId', e.target.value)}
                        className={inputCls}
                      >
                        <option value="">— Unallocated —</option>
                        {labs.map((l) => (
                          <option key={l.labId} value={l.labId}>{l.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>Department</label>
                      <select
                        value={form.departmentId}
                        onChange={(e) => setField('departmentId', e.target.value)}
                        className={inputCls}
                      >
                        <option value="">— Auto (from lab) —</option>
                        {departments.map((d) => (
                          <option key={d.departmentId} value={d.departmentId}>{d.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </section>

                {/* ---- Section: Manufacturer & Purchase ---- */}
                <section>
                  <h4 className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
                    <Package className="h-3.5 w-3.5" /> Manufacturer & Purchase
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className={labelCls}>Manufacturer</label>
                      <input value={form.manufacturer} onChange={(e) => setField('manufacturer', e.target.value)} placeholder="e.g. Tektronix" className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Model</label>
                      <input value={form.model} onChange={(e) => setField('model', e.target.value)} placeholder="e.g. TBS1102B" className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Serial Number</label>
                      <input value={form.serialNumber} onChange={(e) => setField('serialNumber', e.target.value)} placeholder="e.g. SN-TEK-019X" className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Purchase Date</label>
                      <input type="date" value={form.purchaseDate} onChange={(e) => setField('purchaseDate', e.target.value)} className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Warranty Expiry</label>
                      <input type="date" value={form.warrantyExpiry} onChange={(e) => setField('warrantyExpiry', e.target.value)} className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Cost (₹)</label>
                      <input
                        value={form.cost}
                        onChange={(e) => setField('cost', e.target.value)}
                        placeholder="e.g. 85000"
                        className={`${inputCls} ${errors.cost ? 'border-red-500' : ''}`}
                      />
                      {errors.cost && <p className="text-red-500 text-[10px] font-semibold mt-1">{errors.cost}</p>}
                    </div>
                    <div className="sm:col-span-2">
                      <label className={labelCls}>Vendor</label>
                      <input value={form.vendor} onChange={(e) => setField('vendor', e.target.value)} placeholder="e.g. Scientific Instruments Pvt Ltd" className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}><MapPin className="inline h-3 w-3 mr-0.5" />Current Location</label>
                      <input value={form.currentLocation} onChange={(e) => setField('currentLocation', e.target.value)} placeholder="e.g. Science Block, Room 102" className={inputCls} />
                    </div>
                  </div>
                </section>

                {/* ---- Section: Identification ---- */}
                <section>
                  <h4 className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
                    <QrCode className="h-3.5 w-3.5" /> Identification
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>RFID Tag</label>
                      <input value={form.rfidTag} onChange={(e) => setField('rfidTag', e.target.value)} placeholder="e.g. RFID-0044-AC21" className={inputCls} />
                    </div>
                    <div className="sm:col-span-2">
                      <label className={labelCls}>Tags <span className="normal-case font-normal text-slate-400">(press Enter to add · used for search &amp; filtering)</span></label>
                      <TagInput
                        value={form.tags}
                        onChange={(v) => setField('tags', v)}
                        suggestions={tagOptions}
                        placeholder="e.g. high-voltage, shared, teaching-lab"
                      />
                    </div>
                    <div className="flex items-end">
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-relaxed pb-2">
                        <QrCode className="inline h-3 w-3 mr-1" />
                        A QR code is generated automatically from the equipment code after saving.
                      </p>
                    </div>
                  </div>
                </section>

                {/* ---- Section: Sharing ---- */}
                <section>
                  <h4 className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
                    <Share2 className="h-3.5 w-3.5" /> Inter-Institution Sharing
                  </h4>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={form.isShareable}
                    onClick={() => setField('isShareable', !form.isShareable)}
                    className="w-full flex items-center justify-between gap-3 px-3.5 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/20 hover:border-primary/40 transition-colors cursor-pointer text-left"
                  >
                    <span>
                      <span className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                        Shareable across institutions
                      </span>
                      <span className="block text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                        List this equipment for discovery and booking requests from other institutions.
                      </span>
                    </span>
                    <span
                      className={`relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors ${
                        form.isShareable
                          ? 'bg-gradient-to-r from-primary to-secondary'
                          : 'bg-slate-300 dark:bg-slate-700'
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${
                          form.isShareable ? 'left-[18px]' : 'left-0.5'
                        }`}
                      />
                    </span>
                  </button>
                  {form.isShareable && (
                    <div className="mt-3">
                      <label className={labelCls}>Usage Fee (per hour, ₹) — 0 or empty = free</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={form.hourlyRate}
                        onChange={(e) => setField('hourlyRate', e.target.value)}
                        placeholder="e.g. 500.00"
                        className={inputCls}
                      />
                      <p className="text-[10px] text-slate-400 mt-1">
                        Charged to requesting institutions for shared access. The estimated fee
                        (rate × requested hours) is shown on every sharing request.
                      </p>
                    </div>
                  )}
                </section>

                {/* ---- Section: Description ---- */}
                <section>
                  <label className={labelCls}>Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setField('description', e.target.value)}
                    rows={3}
                    placeholder="Purpose, usage notes, handling instructions..."
                    className={`${inputCls} resize-none`}
                  />
                </section>

                {/* ---- Section: Specifications ---- */}
                <section>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 my-0">
                      <Cpu className="h-3.5 w-3.5" /> Specifications
                    </h4>
                    <div className="flex gap-1.5">
                      <select
                        onChange={(e) => {
                          if (e.target.value) {
                            setSpecs((prev) => [...prev, { key: e.target.value, value: '' }]);
                            e.target.value = '';
                          }
                        }}
                        defaultValue=""
                        className="text-[10px] font-bold px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/20 text-slate-600 dark:text-slate-300 cursor-pointer"
                      >
                        <option value="" disabled>+ Preset</option>
                        {SPEC_PRESETS.filter((p) => !specs.some((s) => s.key === p)).map((p) => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => setSpecs((prev) => [...prev, { key: '', value: '' }])}
                        className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors cursor-pointer"
                      >
                        <Plus className="h-3 w-3" /> Custom
                      </button>
                    </div>
                  </div>
                  {specs.length === 0 ? (
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 italic">
                      No specifications added. Use "+ Preset" (Processor, RAM, Voltage...) or "+ Custom".
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {specs.map((spec, i) => (
                        <div key={i} className="flex gap-2">
                          <input
                            value={spec.key}
                            onChange={(e) => setSpecs((prev) => prev.map((s, idx) => idx === i ? { ...s, key: e.target.value } : s))}
                            placeholder="Attribute (e.g. RAM)"
                            className={`${inputCls} flex-[2]`}
                          />
                          <input
                            value={spec.value}
                            onChange={(e) => setSpecs((prev) => prev.map((s, idx) => idx === i ? { ...s, value: e.target.value } : s))}
                            placeholder="Value (e.g. 16GB DDR5)"
                            className={`${inputCls} flex-[3]`}
                          />
                          <button
                            type="button"
                            onClick={() => setSpecs((prev) => prev.filter((_, idx) => idx !== i))}
                            className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-colors shrink-0 cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                {/* ---- Section: Uploads ---- */}
                {(canUploadImages || canUploadDocs) && (
                  <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Images dropzone */}
                    {canUploadImages && (
                      <div>
                        <label className={labelCls}>Equipment Images</label>
                        <div
                          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                          onDragLeave={() => setDragOver(false)}
                          onDrop={(e) => {
                            e.preventDefault();
                            setDragOver(false);
                            addPendingImages(e.dataTransfer.files);
                          }}
                          onClick={() => imageInputRef.current?.click()}
                          className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors ${
                            dragOver
                              ? 'border-primary bg-primary/5'
                              : 'border-slate-200 dark:border-slate-800 hover:border-primary/50'
                          }`}
                        >
                          <ImageIcon className="h-6 w-6 mx-auto text-slate-400 mb-1.5" />
                          <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                            Drag & drop or click to upload
                          </p>
                          <p className="text-[9px] text-slate-400 mt-0.5">JPG, PNG, WEBP · max 10MB each</p>
                          <input
                            ref={imageInputRef}
                            type="file"
                            accept="image/*"
                            multiple
                            hidden
                            onChange={(e) => { addPendingImages(e.target.files); e.target.value = ''; }}
                          />
                        </div>
                        {pendingImages.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {pendingImages.map((f, i) => (
                              <div key={i} className="flex items-center justify-between text-[10px] bg-slate-100/60 dark:bg-slate-900/50 rounded-lg px-2.5 py-1.5">
                                <span className="truncate font-semibold text-slate-600 dark:text-slate-300">{f.name}</span>
                                <button
                                  onClick={() => setPendingImages((prev) => prev.filter((_, idx) => idx !== i))}
                                  className="text-slate-400 hover:text-red-500 ml-2 cursor-pointer"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Documents picker */}
                    {canUploadDocs && (
                      <div>
                        <label className={labelCls}>Documents (Manual / Warranty / Spec PDF)</label>
                        <div
                          onClick={() => docInputRef.current?.click()}
                          className="border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-primary/50 rounded-xl p-4 text-center cursor-pointer transition-colors"
                        >
                          <UploadCloud className="h-6 w-6 mx-auto text-slate-400 mb-1.5" />
                          <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                            Click to select documents
                          </p>
                          <p className="text-[9px] text-slate-400 mt-0.5">PDF, DOCX, XLSX, TXT · max 10MB each</p>
                          <input
                            ref={docInputRef}
                            type="file"
                            accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,image/*"
                            multiple
                            hidden
                            onChange={(e) => { addPendingDoc(e.target.files); e.target.value = ''; }}
                          />
                        </div>
                        {pendingDocs.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {pendingDocs.map((d, i) => (
                              <div key={i} className="flex items-center gap-2 text-[10px] bg-slate-100/60 dark:bg-slate-900/50 rounded-lg px-2.5 py-1.5">
                                <FileText className="h-3 w-3 text-slate-400 shrink-0" />
                                <span className="truncate font-semibold text-slate-600 dark:text-slate-300 flex-1">{d.file.name}</span>
                                <select
                                  value={d.documentType}
                                  onChange={(e) => setPendingDocs((prev) => prev.map((x, idx) => idx === i ? { ...x, documentType: e.target.value } : x))}
                                  className="text-[9px] font-bold bg-transparent border border-slate-200 dark:border-slate-700 rounded-md px-1 py-0.5 cursor-pointer"
                                >
                                  <option value="MANUAL">Manual</option>
                                  <option value="WARRANTY">Warranty</option>
                                  <option value="SPECIFICATION">Specification</option>
                                  <option value="CALIBRATION">Calibration</option>
                                  <option value="OTHER">Other</option>
                                </select>
                                <button
                                  onClick={() => setPendingDocs((prev) => prev.filter((_, idx) => idx !== i))}
                                  className="text-slate-400 hover:text-red-500 cursor-pointer"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </section>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-2.5 px-6 py-4 border-t border-slate-200/40 dark:border-slate-800/40 shrink-0">
                <button
                  onClick={onClose}
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-primary to-secondary hover:opacity-95 transition-opacity flex items-center gap-1.5 disabled:opacity-60 cursor-pointer"
                >
                  {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                  {saving ? 'Saving...' : mode === 'edit' ? 'Update Equipment' : 'Save Equipment'}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default EquipmentFormModal;
