import { CalendarPlus, Filter, Pencil, Plus, Search, Trash2, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';

import { canCreateBooking, canManageEquipment } from '../auth/permissions.js';
import StatusBadge from '../components/StatusBadge.jsx';
import { getApiErrorMessage } from '../services/apiError.js';
import {
  createEquipment,
  deleteEquipment,
  getEquipment,
  updateEquipment,
} from '../services/equipmentService.js';
import { getLabs } from '../services/labService.js';
import { clampPercent, EQUIPMENT_STATUSES, formatEnumLabel } from '../utils/display.js';

const emptyForm = {
  name: '',
  category: '',
  manufacturer: '',
  serialNumber: '',
  quantity: '1',
  availableQuantity: '1',
  status: 'AVAILABLE',
  purchaseDate: '',
  labId: '',
};

export default function Equipment() {
  const navigate = useNavigate();
  const { currentUser, searchQuery, setDraftBooking } = useOutletContext();
  const canCreateBookingsForRole = canCreateBooking(currentUser);
  const canManageEquipmentForRole = canManageEquipment(currentUser);
  const [query, setQuery] = useState('');
  const [labFilter, setLabFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [labs, setLabs] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [modalMode, setModalMode] = useState(null);
  const [editingEquipmentId, setEditingEquipmentId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadEquipment = useCallback(async () => {
    const [labData, equipmentData] = await Promise.all([
      getLabs(),
      getEquipment({ labId: labFilter, status: statusFilter }),
    ]);

    setLabs(labData);
    setEquipment(equipmentData);
    setForm((current) => ({
      ...current,
      labId: current.labId || (labData[0]?.id ? String(labData[0].id) : ''),
    }));
  }, [labFilter, statusFilter]);

  useEffect(() => {
    let isMounted = true;

    async function loadPage() {
      setIsLoading(true);
      setError('');

      try {
        await loadEquipment();
      } catch (requestError) {
        if (isMounted) {
          setError(getApiErrorMessage(requestError, 'Unable to load equipment.'));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadPage();

    return () => {
      isMounted = false;
    };
  }, [loadEquipment]);

  const filteredEquipment = useMemo(() => {
    const localQuery = query.trim().toLowerCase();
    const globalQuery = searchQuery.trim().toLowerCase();

    return equipment.filter((item) => {
      const searchableText = [
        item.name,
        item.id,
        item.category,
        item.manufacturer,
        item.serialNumber,
        item.labName,
        item.status,
      ]
        .join(' ')
        .toLowerCase();

      return (
        (!localQuery || searchableText.includes(localQuery)) &&
        (!globalQuery || searchableText.includes(globalQuery))
      );
    });
  }, [equipment, query, searchQuery]);

  function reserveEquipment(item) {
    setDraftBooking({ equipmentId: item.id, equipmentName: item.name });
    navigate('/bookings');
  }

  function openAddModal() {
    setMessage('');
    setFormError('');
    setEditingEquipmentId(null);
    setForm({
      ...emptyForm,
      labId: labs[0]?.id ? String(labs[0].id) : '',
    });
    setModalMode('add');
  }

  function openEditModal(item) {
    setMessage('');
    setFormError('');
    setEditingEquipmentId(item.id);
    setForm({
      name: item.name ?? '',
      category: item.category ?? '',
      manufacturer: item.manufacturer ?? '',
      serialNumber: item.serialNumber ?? '',
      quantity: String(item.quantity ?? 1),
      availableQuantity: String(item.availableQuantity ?? 0),
      status: item.status ?? 'AVAILABLE',
      purchaseDate: item.purchaseDate ?? '',
      labId: item.labId ? String(item.labId) : '',
    });
    setModalMode('edit');
  }

  function closeModal() {
    if (isSubmitting) {
      return;
    }

    setModalMode(null);
    setEditingEquipmentId(null);
    setFormError('');
  }

  function updateField(field, value) {
    setFormError('');
    setMessage('');
    setForm((current) => ({ ...current, [field]: value }));
  }

  function buildEquipmentRequest() {
    const quantity = Number(form.quantity);
    const availableQuantity = Number(form.availableQuantity);

    if (
      !form.name.trim() ||
      !form.category.trim() ||
      !form.manufacturer.trim() ||
      !form.serialNumber.trim() ||
      !form.status ||
      !form.purchaseDate ||
      !form.labId
    ) {
      throw new Error('Complete all equipment fields.');
    }

    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new Error('Quantity must be greater than zero.');
    }

    if (!Number.isInteger(availableQuantity) || availableQuantity < 0) {
      throw new Error('Available quantity must not be negative.');
    }

    if (availableQuantity > quantity) {
      throw new Error('Available quantity must not be greater than quantity.');
    }

    return {
      name: form.name.trim(),
      category: form.category.trim(),
      manufacturer: form.manufacturer.trim(),
      serialNumber: form.serialNumber.trim(),
      quantity,
      availableQuantity,
      status: form.status,
      purchaseDate: form.purchaseDate,
      labId: Number(form.labId),
    };
  }

  async function submitEquipment(event) {
    event.preventDefault();

    let request;

    try {
      request = buildEquipmentRequest();
    } catch (validationError) {
      setFormError(validationError.message);
      return;
    }

    setIsSubmitting(true);
    setFormError('');

    try {
      if (modalMode === 'edit') {
        await updateEquipment(editingEquipmentId, request);
        setMessage('Equipment updated.');
      } else {
        await createEquipment(request);
        setMessage('Equipment added.');
      }

      await loadEquipment();
      setModalMode(null);
      setEditingEquipmentId(null);
      setFormError('');
    } catch (requestError) {
      setFormError(getApiErrorMessage(requestError, 'Unable to save equipment.'));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function removeEquipment(item) {
    const confirmed = window.confirm(`Delete ${item.name}? This action cannot be undone.`);

    if (!confirmed) {
      return;
    }

    setMessage('');
    setError('');

    try {
      await deleteEquipment(item.id);
      await loadEquipment();
      setMessage('Equipment deleted.');
    } catch (requestError) {
      setMessage(getApiErrorMessage(requestError, 'Unable to delete equipment.'));
    }
  }

  if (isLoading) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-sm">
        Loading equipment...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-rose-200 bg-rose-50 p-5 text-sm font-medium text-rose-700">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-950">Equipment inventory</h3>
            <p className="mt-1 text-sm text-slate-500">Browse and filter shared lab resources.</p>
          </div>

          {canManageEquipmentForRole ? (
            <button
              className="focus-ring inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
              disabled={labs.length === 0}
              onClick={openAddModal}
              type="button"
            >
              <Plus className="h-4 w-4" />
              Add Equipment
            </button>
          ) : null}
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_220px_220px]">
          <label className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <span className="sr-only">Search equipment</span>
            <input
              className="focus-ring h-11 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by equipment, serial, lab"
              type="search"
              value={query}
            />
          </label>

          <label className="relative">
            <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <span className="sr-only">Filter lab</span>
            <select
              className="focus-ring h-11 w-full appearance-none rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm"
              onChange={(event) => setLabFilter(event.target.value)}
              value={labFilter}
            >
              <option value="">All labs</option>
              {labs.map((lab) => (
                <option key={lab.id} value={lab.id}>
                  {lab.name}
                </option>
              ))}
            </select>
          </label>

          <label className="relative">
            <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <span className="sr-only">Filter equipment status</span>
            <select
              className="focus-ring h-11 w-full appearance-none rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm"
              onChange={(event) => setStatusFilter(event.target.value)}
              value={statusFilter}
            >
              <option value="">All statuses</option>
              {EQUIPMENT_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {formatEnumLabel(status)}
                </option>
              ))}
            </select>
          </label>
        </div>

        {message ? (
          <p className="mt-4 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700">
            {message}
          </p>
        ) : null}
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        {filteredEquipment.length > 0 ? (
          filteredEquipment.map((item) => {
            const availabilityPercent = clampPercent((item.availableQuantity / item.quantity) * 100);
            const canReserve =
              canCreateBookingsForRole &&
              item.availableQuantity > 0 &&
              item.status !== 'MAINTENANCE' &&
              item.status !== 'OUT_OF_SERVICE';

            return (
              <article key={item.id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      {item.serialNumber}
                    </p>
                    <h3 className="mt-2 text-lg font-bold text-slate-950">{item.name}</h3>
                    <p className="mt-2 text-sm text-slate-600">{item.manufacturer}</p>
                  </div>
                  <StatusBadge status={item.status} />
                </div>

                <dl className="mt-5 grid gap-4 sm:grid-cols-3">
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Lab</dt>
                    <dd className="mt-1 text-sm font-semibold text-slate-900">{item.labName}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Category</dt>
                    <dd className="mt-1 text-sm font-semibold text-slate-900">{item.category}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Available</dt>
                    <dd className="mt-1 text-sm font-semibold text-slate-900">
                      {item.availableQuantity} of {item.quantity}
                    </dd>
                  </div>
                </dl>

                <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-emerald-500" style={{ width: `${availabilityPercent}%` }} />
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  {canCreateBookingsForRole ? (
                    <button
                      className="focus-ring inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                      disabled={!canReserve}
                      onClick={() => reserveEquipment(item)}
                      type="button"
                    >
                      <CalendarPlus className="h-4 w-4" />
                      Reserve
                    </button>
                  ) : null}

                  {canManageEquipmentForRole ? (
                    <>
                      <button
                        className="focus-ring inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                        onClick={() => openEditModal(item)}
                        type="button"
                      >
                        <Pencil className="h-4 w-4" />
                        Edit
                      </button>
                      <button
                        className="focus-ring inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-4 text-sm font-semibold text-rose-700 hover:bg-rose-100"
                        onClick={() => removeEquipment(item)}
                        type="button"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </button>
                    </>
                  ) : null}
                </div>
              </article>
            );
          })
        ) : (
          <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500 lg:col-span-2">
            No equipment matches the current filters.
          </div>
        )}
      </section>

      {modalMode ? (
        <EquipmentModal
          form={form}
          formError={formError}
          isSubmitting={isSubmitting}
          labs={labs}
          mode={modalMode}
          onClose={closeModal}
          onSubmit={submitEquipment}
          onUpdateField={updateField}
        />
      ) : null}
    </div>
  );
}

function EquipmentModal({
  form,
  formError,
  isSubmitting,
  labs,
  mode,
  onClose,
  onSubmit,
  onUpdateField,
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 py-6">
      <div className="max-h-full w-full max-w-3xl overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-xl">
        <div className="flex items-center justify-between gap-4 border-b border-slate-200 p-5">
          <div>
            <h3 className="text-lg font-bold text-slate-950">
              {mode === 'edit' ? 'Edit equipment' : 'Add equipment'}
            </h3>
            <p className="mt-1 text-sm text-slate-500">Use backend inventory fields and real lab assignments.</p>
          </div>
          <button
            aria-label="Close equipment form"
            className="focus-ring inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            onClick={onClose}
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form className="space-y-5 p-5" onSubmit={onSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <TextField
              label="Name"
              onChange={(value) => onUpdateField('name', value)}
              value={form.name}
            />
            <TextField
              label="Category"
              onChange={(value) => onUpdateField('category', value)}
              value={form.category}
            />
            <TextField
              label="Manufacturer"
              onChange={(value) => onUpdateField('manufacturer', value)}
              value={form.manufacturer}
            />
            <TextField
              label="Serial number"
              onChange={(value) => onUpdateField('serialNumber', value)}
              value={form.serialNumber}
            />

            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Quantity</span>
              <input
                className="focus-ring mt-2 h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm"
                min="1"
                onChange={(event) => onUpdateField('quantity', event.target.value)}
                type="number"
                value={form.quantity}
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Available quantity</span>
              <input
                className="focus-ring mt-2 h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm"
                min="0"
                onChange={(event) => onUpdateField('availableQuantity', event.target.value)}
                type="number"
                value={form.availableQuantity}
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Status</span>
              <select
                className="focus-ring mt-2 h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm"
                onChange={(event) => onUpdateField('status', event.target.value)}
                value={form.status}
              >
                {EQUIPMENT_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {formatEnumLabel(status)}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Purchase date</span>
              <input
                className="focus-ring mt-2 h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm"
                onChange={(event) => onUpdateField('purchaseDate', event.target.value)}
                type="date"
                value={form.purchaseDate}
              />
            </label>

            <label className="block md:col-span-2">
              <span className="text-sm font-semibold text-slate-700">Lab</span>
              <select
                className="focus-ring mt-2 h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm"
                onChange={(event) => onUpdateField('labId', event.target.value)}
                value={form.labId}
              >
                {labs.map((lab) => (
                  <option key={lab.id} value={lab.id}>
                    {lab.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {formError ? (
            <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">
              {formError}
            </p>
          ) : null}

          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
            <button
              className="focus-ring inline-flex h-10 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-100"
              disabled={isSubmitting}
              onClick={onClose}
              type="button"
            >
              Cancel
            </button>
            <button
              className="focus-ring inline-flex h-10 items-center justify-center rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? 'Saving' : mode === 'edit' ? 'Update equipment' : 'Add equipment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function TextField({ label, onChange, value }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <input
        className="focus-ring mt-2 h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm"
        onChange={(event) => onChange(event.target.value)}
        type="text"
        value={value}
      />
    </label>
  );
}
