import {
  CalendarPlus,
  CheckCircle2,
  ClipboardList,
  Pencil,
  PlayCircle,
  Wrench,
  XCircle,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';

import { canManageMaintenance } from '../auth/permissions.js';
import StatusBadge from '../components/StatusBadge.jsx';
import { getApiErrorMessage } from '../services/apiError.js';
import { getEquipment } from '../services/equipmentService.js';
import {
  cancelMaintenance,
  completeMaintenance,
  createMaintenance,
  getMaintenanceRecords,
  startMaintenance,
  updateMaintenance,
} from '../services/maintenanceService.js';
import {
  formatDateTimeRange,
  toDateInput,
  toLocalDateTime,
  toTimeInput,
} from '../utils/display.js';

const initialForm = {
  equipmentId: '',
  title: '',
  description: '',
  date: '',
  startTime: '',
  endTime: '',
  technicianName: '',
  notes: '',
};

const activeStatuses = new Set(['SCHEDULED', 'IN_PROGRESS']);

export default function Maintenance() {
  const { currentUser, searchQuery } = useOutletContext();
  const canManageMaintenanceForRole = canManageMaintenance(currentUser);
  const [records, setRecords] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionRecordId, setActionRecordId] = useState(null);
  const [pageError, setPageError] = useState('');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [actionMessage, setActionMessage] = useState('');

  const refreshMaintenance = useCallback(async () => {
    const [maintenanceData, equipmentData] = await Promise.all([
      getMaintenanceRecords(),
      getEquipment(),
    ]);

    setRecords(maintenanceData);
    setEquipment(equipmentData);
    setForm((current) => {
      if (current.equipmentId || equipmentData.length === 0) {
        return current;
      }

      return { ...current, equipmentId: String(equipmentData[0].id) };
    });
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadMaintenance() {
      setIsLoading(true);
      setPageError('');

      try {
        await refreshMaintenance();
      } catch (requestError) {
        if (isMounted) {
          setPageError(getApiErrorMessage(requestError, 'Unable to load maintenance records.'));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadMaintenance();

    return () => {
      isMounted = false;
    };
  }, [refreshMaintenance]);

  const summary = useMemo(() => {
    const openRecords = records.filter((item) => activeStatuses.has(item.status));

    return {
      open: openRecords.length,
      scheduled: records.filter((item) => item.status === 'SCHEDULED').length,
      completed: records.filter((item) => item.status === 'COMPLETED').length,
    };
  }, [records]);

  const visibleMaintenance = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return records;
    }

    return records.filter((item) =>
      [
        item.id,
        item.equipmentName,
        item.title,
        item.description,
        item.technicianName,
        item.status,
        item.notes,
      ]
        .join(' ')
        .toLowerCase()
        .includes(query),
    );
  }, [records, searchQuery]);

  function updateField(field, value) {
    setFormError('');
    setFormSuccess('');
    setActionMessage('');
    setForm((current) => ({ ...current, [field]: value }));
  }

  function resetForm() {
    setEditingId(null);
    setForm((current) => ({
      ...initialForm,
      equipmentId: current.equipmentId || (equipment[0]?.id ? String(equipment[0].id) : ''),
    }));
  }

  function editRecord(record) {
    setEditingId(record.id);
    setFormError('');
    setFormSuccess('');
    setActionMessage('');
    setForm({
      equipmentId: String(record.equipmentId),
      title: record.title ?? '',
      description: record.description ?? '',
      date: toDateInput(record.scheduledStartTime),
      startTime: toTimeInput(record.scheduledStartTime),
      endTime: toTimeInput(record.scheduledEndTime),
      technicianName: record.technicianName ?? '',
      notes: record.notes ?? '',
    });
  }

  async function submitMaintenance(event) {
    event.preventDefault();

    if (!form.equipmentId || !form.title.trim() || !form.date || !form.startTime || !form.endTime) {
      setFormError('Complete the equipment, title, date, start, and end fields.');
      return;
    }

    if (form.startTime >= form.endTime) {
      setFormError('End time must be after the start time.');
      return;
    }

    const request = {
      equipmentId: Number(form.equipmentId),
      title: form.title.trim(),
      description: form.description.trim() || null,
      scheduledStartTime: toLocalDateTime(form.date, form.startTime),
      scheduledEndTime: toLocalDateTime(form.date, form.endTime),
      technicianName: form.technicianName.trim() || null,
      notes: form.notes.trim() || null,
    };

    setIsSubmitting(true);
    setFormError('');
    setFormSuccess('');

    try {
      if (editingId) {
        await updateMaintenance(editingId, request);
        setFormSuccess('Maintenance record updated.');
      } else {
        await createMaintenance(request);
        setFormSuccess('Maintenance record created.');
      }

      await refreshMaintenance();
      resetForm();
    } catch (requestError) {
      setFormError(getApiErrorMessage(requestError, 'Unable to save maintenance record.'));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function runMaintenanceAction(record, action) {
    setActionRecordId(`${action}-${record.id}`);
    setActionMessage('');

    try {
      const updatedRecord =
        action === 'start'
          ? await startMaintenance(record.id)
          : action === 'complete'
            ? await completeMaintenance(record.id)
            : await cancelMaintenance(record.id);

      setRecords((current) =>
        current.map((item) => (item.id === updatedRecord.id ? updatedRecord : item)),
      );
      setActionMessage('Maintenance record updated.');
    } catch (requestError) {
      setActionMessage(getApiErrorMessage(requestError, 'Unable to update maintenance record.'));
    } finally {
      setActionRecordId(null);
    }
  }

  if (isLoading) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-sm">
        Loading maintenance records...
      </div>
    );
  }

  if (pageError) {
    return (
      <div className="rounded-lg border border-rose-200 bg-rose-50 p-5 text-sm font-medium text-rose-700">
        {pageError}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-3">
        <SummaryCard icon={Wrench} label="Open jobs" value={summary.open} helper="Scheduled or in progress" />
        <SummaryCard icon={ClipboardList} label="Scheduled" value={summary.scheduled} helper="Ready to start" />
        <SummaryCard icon={CheckCircle2} label="Completed" value={summary.completed} helper="Closed maintenance records" />
      </section>

      <section className={canManageMaintenanceForRole ? 'grid gap-6 xl:grid-cols-[380px_1fr]' : 'space-y-6'}>
        {canManageMaintenanceForRole ? (
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-bold text-slate-950">
            {editingId ? 'Update maintenance' : 'Create maintenance'}
          </h3>

          <form className="mt-5 space-y-4" onSubmit={submitMaintenance}>
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Equipment</span>
              <select
                className="focus-ring mt-2 h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm"
                onChange={(event) => updateField('equipmentId', event.target.value)}
                value={form.equipmentId}
              >
                {equipment.length === 0 ? <option value="">No equipment available</option> : null}
                {equipment.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Title</span>
              <input
                className="focus-ring mt-2 h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm"
                onChange={(event) => updateField('title', event.target.value)}
                placeholder="Preventive calibration"
                type="text"
                value={form.title}
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Description</span>
              <textarea
                className="focus-ring mt-2 min-h-20 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                onChange={(event) => updateField('description', event.target.value)}
                value={form.description}
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Date</span>
              <input
                className="focus-ring mt-2 h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm"
                onChange={(event) => updateField('date', event.target.value)}
                type="date"
                value={form.date}
              />
            </label>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
              <label className="block">
                <span className="text-sm font-semibold text-slate-700">Start</span>
                <input
                  className="focus-ring mt-2 h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm"
                  onChange={(event) => updateField('startTime', event.target.value)}
                  type="time"
                  value={form.startTime}
                />
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-slate-700">End</span>
                <input
                  className="focus-ring mt-2 h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm"
                  onChange={(event) => updateField('endTime', event.target.value)}
                  type="time"
                  value={form.endTime}
                />
              </label>
            </div>

            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Technician</span>
              <input
                className="focus-ring mt-2 h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm"
                onChange={(event) => updateField('technicianName', event.target.value)}
                placeholder="Ravi Kumar"
                type="text"
                value={form.technicianName}
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-slate-700">Notes</span>
              <textarea
                className="focus-ring mt-2 min-h-20 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                onChange={(event) => updateField('notes', event.target.value)}
                value={form.notes}
              />
            </label>

            {formError ? (
              <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">
                {formError}
              </p>
            ) : null}

            {formSuccess ? (
              <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
                {formSuccess}
              </p>
            ) : null}

            <div className="flex flex-col gap-3 sm:flex-row xl:flex-col 2xl:flex-row">
              <button
                className="focus-ring inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                disabled={isSubmitting || equipment.length === 0}
                type="submit"
              >
                <CalendarPlus className="h-4 w-4" />
                {isSubmitting ? 'Saving' : editingId ? 'Update' : 'Create'}
              </button>

              {editingId ? (
                <button
                  className="focus-ring inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                  onClick={resetForm}
                  type="button"
                >
                  <XCircle className="h-4 w-4" />
                  Cancel edit
                </button>
              ) : null}
            </div>
          </form>
          </div>
        ) : null}

        <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-5">
            <h3 className="text-lg font-bold text-slate-950">Maintenance schedule</h3>
            <p className="mt-1 text-sm text-slate-500">Track preventive work, repairs, and calibration availability.</p>
            {actionMessage ? (
              <p className="mt-4 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700">
                {actionMessage}
              </p>
            ) : null}
          </div>

          {visibleMaintenance.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Equipment</th>
                    <th className="px-5 py-3 font-semibold">Work type</th>
                    <th className="px-5 py-3 font-semibold">Owner</th>
                    <th className="px-5 py-3 font-semibold">Scheduled</th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                    <th className="px-5 py-3 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {visibleMaintenance.map((item) => {
                    const canEdit = item.status === 'SCHEDULED';
                    const canStart = item.status === 'SCHEDULED';
                    const canComplete = item.status === 'IN_PROGRESS';
                    const canCancel = item.status === 'SCHEDULED' || item.status === 'IN_PROGRESS';
                    const hasActions = canManageMaintenanceForRole && (canEdit || canStart || canComplete || canCancel);

                    return (
                      <tr key={item.id} className="hover:bg-slate-50">
                        <td className="px-5 py-4">
                          <p className="font-semibold text-slate-950">{item.equipmentName}</p>
                          <p className="mt-1 text-xs text-slate-500">#{item.id}</p>
                        </td>
                        <td className="px-5 py-4 text-slate-600">{item.title}</td>
                        <td className="px-5 py-4 text-slate-600">{item.technicianName || 'Unassigned'}</td>
                        <td className="px-5 py-4 text-slate-600">
                          {formatDateTimeRange(item.scheduledStartTime, item.scheduledEndTime)}
                        </td>
                        <td className="px-5 py-4">
                          <StatusBadge status={item.status} />
                        </td>
                        <td className="px-5 py-4">
                          {hasActions ? (
                            <div className="flex items-center gap-2">
                              {canManageMaintenanceForRole && canEdit ? (
                                <button
                                  aria-label={`Edit maintenance ${item.id}`}
                                  className="focus-ring inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                                  disabled={Boolean(actionRecordId)}
                                  onClick={() => editRecord(item)}
                                  title="Edit maintenance"
                                  type="button"
                                >
                                  <Pencil className="h-4 w-4" />
                                </button>
                              ) : null}

                              {canManageMaintenanceForRole && canStart ? (
                                <button
                                  aria-label={`Start maintenance ${item.id}`}
                                  className="focus-ring inline-flex h-9 w-9 items-center justify-center rounded-lg border border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100 disabled:cursor-not-allowed disabled:opacity-60"
                                  disabled={Boolean(actionRecordId)}
                                  onClick={() => runMaintenanceAction(item, 'start')}
                                  title="Start maintenance"
                                  type="button"
                                >
                                  <PlayCircle className="h-4 w-4" />
                                </button>
                              ) : null}

                              {canManageMaintenanceForRole && canComplete ? (
                                <button
                                  aria-label={`Complete maintenance ${item.id}`}
                                  className="focus-ring inline-flex h-9 w-9 items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
                                  disabled={Boolean(actionRecordId)}
                                  onClick={() => runMaintenanceAction(item, 'complete')}
                                  title="Complete maintenance"
                                  type="button"
                                >
                                  <CheckCircle2 className="h-4 w-4" />
                                </button>
                              ) : null}

                              {canManageMaintenanceForRole && canCancel ? (
                                <button
                                  aria-label={`Cancel maintenance ${item.id}`}
                                  className="focus-ring inline-flex h-9 w-9 items-center justify-center rounded-lg border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                                  disabled={Boolean(actionRecordId)}
                                  onClick={() => runMaintenanceAction(item, 'cancel')}
                                  title="Cancel maintenance"
                                  type="button"
                                >
                                  <XCircle className="h-4 w-4" />
                                </button>
                              ) : null}
                            </div>
                          ) : (
                            <span className="text-xs font-medium text-slate-400">
                              {canManageMaintenanceForRole ? 'Closed' : 'Read only'}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-sm text-slate-500">No maintenance jobs match the current search.</div>
          )}
        </div>
      </section>
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value, helper }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-bold text-slate-950">{value}</p>
          <p className="mt-3 text-sm text-slate-600">{helper}</p>
        </div>
        <div className="rounded-lg bg-sky-50 p-2 text-sky-700 ring-1 ring-sky-100">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </article>
  );
}
