import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package, Building2, Search, Loader2, Share2, Clock, Calendar,
  CheckCircle, XCircle, HelpCircle, Archive, Send, X, Inbox,
  ArrowUpRight, ArrowDownLeft, User, FileText,
  Plus, FileSignature, ArrowRight, BarChart3
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import PageTransition from '../components/PageTransition';
import { STATUS_CONFIG } from '../components/equipment/StatusBadge';
import { getPrimaryRole } from '../utils/permissions';
import { sharingService } from '../services/sharingService';
import { fileUrl } from '../services/platformService';

const MANAGER_ROLES = ['SYSTEM_ADMIN', 'INSTITUTION_ADMIN', 'DEPARTMENT_HEAD', 'LAB_MANAGER'];

const REQUEST_STATUS_CONFIG = {
  PENDING: { label: 'Pending', icon: HelpCircle, classes: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25' },
  APPROVED: { label: 'Approved', icon: CheckCircle, classes: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/25' },
  REJECTED: { label: 'Rejected', icon: XCircle, classes: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/25' },
  CANCELLED: { label: 'Cancelled', icon: X, classes: 'bg-gray-500/10 text-gray-500 dark:text-gray-400 border-gray-500/25' },
  COMPLETED: { label: 'Completed', icon: Archive, classes: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/25' },
};

const inputCls =
  'w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/20 text-slate-900 dark:text-white text-xs transition-all focus:outline-none focus:ring-2 focus:border-primary focus:ring-primary/10';

const labelCls =
  'block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5';

const RequestStatusChip = ({ status }) => {
  const cfg = REQUEST_STATUS_CONFIG[status] || REQUEST_STATUS_CONFIG.PENDING;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 text-[10px] rounded-lg border font-bold whitespace-nowrap ${cfg.classes}`}>
      <Icon className="h-3 w-3" />
      {cfg.label}
    </span>
  );
};

// Labelled form row, used by the agreement modal
const Field = ({ label, children }) => (
  <div>
    <label className={labelCls}>{label}</label>
    {children}
  </div>
);

// Compact key figure, used by the agreement cards and the partnership summary
const AgreementFact = ({ label, value, sub }) => (
  <div className="rounded-xl border border-slate-200/60 dark:border-slate-800/60 p-2.5">
    <p className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 my-0">{label}</p>
    <p className="text-xs font-bold text-slate-800 dark:text-white my-0.5">{value}</p>
    {sub && <p className="text-[9px] text-slate-400 my-0">{sub}</p>}
  </div>
);

const EmptyState = ({ icon: Icon, title, subtitle }) => (
  <div className="glass-card dark:glass-card-dark p-12 rounded-2xl flex flex-col items-center justify-center text-center gap-4">
    <div className="p-4 rounded-full bg-slate-100 dark:bg-slate-950 text-slate-400">
      <Icon className="h-10 w-10" />
    </div>
    <div>
      <p className="font-bold text-slate-800 dark:text-slate-100">{title}</p>
      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{subtitle}</p>
    </div>
  </div>
);

const SharingPage = () => {
  const { user } = useAuth();
  const toast = useToast();
  const isManager = MANAGER_ROLES.includes(getPrimaryRole(user));

  const [activeTab, setActiveTab] = useState('discover'); // 'discover' | 'outgoing' | 'incoming'
  const [loading, setLoading] = useState(true);

  // Discover
  const [equipment, setEquipment] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  // Requests
  const [outgoing, setOutgoing] = useState([]);
  const [incoming, setIncoming] = useState([]);

  // Agreements & partnership analytics
  const [agreements, setAgreements] = useState([]);
  const [partnerships, setPartnerships] = useState(null);
  const [agreementModalOpen, setAgreementModalOpen] = useState(false);
  const [institutions, setInstitutions] = useState([]);
  const [agreementForm, setAgreementForm] = useState({
    toInstitutionId: '',
    title: '',
    startDate: '',
    endDate: '',
    discountPercent: '',
    maxHoursPerMonth: '',
    autoApprove: false,
    terms: '',
  });
  const [agreementSaving, setAgreementSaving] = useState(false);

  // Request modal (discover -> request access)
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [requestForm, setRequestForm] = useState({
    purpose: '',
    requestedDate: '',
    startTime: '09:00',
    endTime: '11:00',
  });
  const [submitting, setSubmitting] = useState(false);

  // Cancel dialog
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);

  // Approve / reject dialog: { request, action: 'approve'|'reject' }
  const [decisionTarget, setDecisionTarget] = useState(null);
  const [decisionRemarks, setDecisionRemarks] = useState('');
  const [decisionLoading, setDecisionLoading] = useState(false);

  const fetchDiscover = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (category.trim()) params.category = category.trim();
      const data = await sharingService.discover(params);
      setEquipment(data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load shareable equipment');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, category]);

  const fetchOutgoing = useCallback(async () => {
    setLoading(true);
    try {
      const data = await sharingService.getOutgoing();
      setOutgoing(data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load your requests');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchIncoming = useCallback(async () => {
    setLoading(true);
    try {
      const data = await sharingService.getIncoming();
      setIncoming(data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load incoming requests');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAgreements = useCallback(async () => {
    setLoading(true);
    try {
      const data = await sharingService.getAgreements();
      setAgreements(data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load sharing agreements');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchPartnerships = useCallback(async () => {
    setLoading(true);
    try {
      const data = await sharingService.getPartnershipReport(90);
      setPartnerships(data || null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load partnership report');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (activeTab === 'discover') fetchDiscover();
    else if (activeTab === 'outgoing') fetchOutgoing();
    else if (activeTab === 'incoming') fetchIncoming();
    else if (activeTab === 'agreements') fetchAgreements();
    else if (activeTab === 'partnerships') fetchPartnerships();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const categories = [...new Set(equipment.map((e) => e.category).filter(Boolean))];

  // Agreements proposed TO us are the ones needing a decision — badge only those
  const myInstitutionId = user?.institutionId;
  const proposedForUsCount = agreements.filter(
    (a) => a.status === 'PROPOSED' && a.toInstitutionId === myInstitutionId
  ).length;

  // ---------- Agreements ----------
  const openAgreementModal = async () => {
    setAgreementForm({
      toInstitutionId: '',
      title: '',
      startDate: new Date().toISOString().slice(0, 10),
      endDate: '',
      discountPercent: '',
      maxHoursPerMonth: '',
      autoApprove: false,
      terms: '',
    });
    setAgreementModalOpen(true);
    try {
      const list = await sharingService.getInstitutions();
      // Cannot hold an agreement with yourself
      setInstitutions((list || []).filter((i) => i.institutionId !== myInstitutionId));
    } catch {
      setInstitutions([]);
    }
  };

  const submitAgreement = async () => {
    if (!agreementForm.toInstitutionId || !agreementForm.title.trim() || !agreementForm.startDate) {
      toast.error('Partner institution, title and start date are required');
      return;
    }
    setAgreementSaving(true);
    try {
      const res = await sharingService.proposeAgreement({
        toInstitutionId: Number(agreementForm.toInstitutionId),
        title: agreementForm.title.trim(),
        startDate: agreementForm.startDate,
        endDate: agreementForm.endDate || null,
        discountPercent: agreementForm.discountPercent === ''
          ? null : Number(agreementForm.discountPercent),
        maxHoursPerMonth: agreementForm.maxHoursPerMonth === ''
          ? null : Number(agreementForm.maxHoursPerMonth),
        autoApprove: agreementForm.autoApprove,
        terms: agreementForm.terms.trim() || null,
      });
      toast.success(res?.message || 'Agreement proposed');
      setAgreementModalOpen(false);
      fetchAgreements();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to propose agreement');
    } finally {
      setAgreementSaving(false);
    }
  };

  const changeAgreementStatus = async (agreement, status) => {
    try {
      const res = await sharingService.updateAgreementStatus(agreement.agreementId, status);
      toast.success(res?.message || `Agreement is now ${status}`);
      fetchAgreements();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update the agreement');
    }
  };

  // ---------- Request access ----------
  const openRequestModal = (item) => {
    setSelectedEquipment(item);
    setRequestForm({
      purpose: '',
      requestedDate: new Date().toISOString().split('T')[0],
      startTime: '09:00',
      endTime: '11:00',
    });
    setRequestModalOpen(true);
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    if (!requestForm.purpose.trim()) {
      toast.error('Please describe the purpose of your request');
      return;
    }
    setSubmitting(true);
    try {
      await sharingService.createRequest({
        equipmentId: selectedEquipment.equipmentId,
        purpose: requestForm.purpose.trim(),
        requestedDate: requestForm.requestedDate,
        startTime: requestForm.startTime + ':00',
        endTime: requestForm.endTime + ':00',
      });
      toast.success('Sharing request submitted successfully');
      setRequestModalOpen(false);
      setActiveTab('outgoing');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit sharing request');
    } finally {
      setSubmitting(false);
    }
  };

  // ---------- Cancel ----------
  const handleCancel = async () => {
    if (!cancelTarget) return;
    setCancelLoading(true);
    try {
      await sharingService.cancel(cancelTarget.sharingRequestId);
      toast.success('Request cancelled');
      setCancelTarget(null);
      fetchOutgoing();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel request');
    } finally {
      setCancelLoading(false);
    }
  };

  // ---------- Approve / reject ----------
  const openDecision = (request, action) => {
    setDecisionTarget({ request, action });
    setDecisionRemarks('');
  };

  const handleDecision = async (e) => {
    e.preventDefault();
    if (!decisionTarget) return;
    const { request, action } = decisionTarget;
    setDecisionLoading(true);
    try {
      if (action === 'approve') {
        await sharingService.approve(request.sharingRequestId, decisionRemarks.trim() || undefined);
        toast.success('Request approved — booking created for the requester');
      } else {
        await sharingService.reject(request.sharingRequestId, decisionRemarks.trim() || undefined);
        toast.success('Request rejected');
      }
      setDecisionTarget(null);
      fetchIncoming();
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to ${action} request`);
    } finally {
      setDecisionLoading(false);
    }
  };

  // ---------- Renderers ----------
  const renderRequestCard = (req, mode) => (
    <motion.div
      key={req.sharingRequestId}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card dark:glass-card-dark rounded-2xl p-5 border border-slate-200/50 dark:border-slate-800/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
    >
      <div className="min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white my-0">
            {req.equipmentName}
          </h3>
          <span className="font-mono text-[10px] text-slate-400">{req.equipmentCode}</span>
          <RequestStatusChip status={req.status} />
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-snug">
          <FileText className="inline h-3 w-3 mr-1 text-slate-400" />
          {req.purpose}
        </p>

        <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3 text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <Building2 className="h-3.5 w-3.5" />
            {mode === 'incoming'
              ? `From ${req.fromInstitutionName}`
              : `Owner: ${req.toInstitutionName}`}
          </span>
          {mode === 'incoming' && (
            <span className="flex items-center gap-1">
              <User className="h-3.5 w-3.5" /> {req.requestedByName}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" /> {req.requestedDate}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" /> {req.startTime?.substring(0, 5)} - {req.endTime?.substring(0, 5)}
          </span>
          <span className={`flex items-center gap-1 font-bold ${
            req.estimatedFee > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-green-600 dark:text-green-400'
          }`}>
            {req.estimatedFee > 0
              ? `Usage fee: ₹${Number(req.estimatedFee).toLocaleString('en-IN')}` +
                (req.hourlyRate > 0 && req.durationHours != null
                  ? ` (₹${Number(req.hourlyRate).toLocaleString('en-IN')}/hr × ${req.durationHours}h)`
                  : '')
              : 'Free of charge'}
          </span>
        </div>

        {req.remarks && (
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 italic">
            Remarks: {req.remarks}
          </p>
        )}
      </div>

      <div className="flex gap-2 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-900 justify-end shrink-0">
        {mode === 'outgoing' && req.status === 'PENDING' && (
          <button
            onClick={() => setCancelTarget(req)}
            className="px-3.5 py-2 border border-red-500/25 text-red-500 dark:text-red-400 bg-red-500/5 font-bold text-xs rounded-xl hover:bg-red-500/10 transition-colors cursor-pointer"
          >
            Cancel Request
          </button>
        )}
        {mode === 'incoming' && req.status === 'PENDING' && (
          <>
            <button
              onClick={() => openDecision(req, 'reject')}
              className="px-3.5 py-2 border border-red-500/25 text-red-500 dark:text-red-400 bg-red-500/5 font-bold text-xs rounded-xl hover:bg-red-500/10 transition-colors cursor-pointer"
            >
              Reject
            </button>
            <button
              onClick={() => openDecision(req, 'approve')}
              className="px-4 py-2 bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md hover:bg-emerald-600 transition-all cursor-pointer"
            >
              Approve
            </button>
          </>
        )}
      </div>
    </motion.div>
  );

  const tabBtn = (key, label, count) => (
    <button
      onClick={() => setActiveTab(key)}
      className={`relative pb-3 px-4 text-sm font-semibold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
        activeTab === key
          ? 'border-primary text-primary dark:text-blue-400 font-bold'
          : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
      }`}
    >
      {label}
      {count > 0 && (
        <span className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-red-500 text-white rounded-full text-[9px] font-bold">
          {count}
        </span>
      )}
    </button>
  );

  const pendingIncomingCount = incoming.filter((r) => r.status === 'PENDING').length;

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white font-heading flex items-center gap-3">
            <Share2 className="h-7 w-7 text-primary" /> Inter-Institution Resource Sharing
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Discover shareable equipment at partner institutions, request access, and manage cross-institution bookings.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2 overflow-x-auto pb-px">
          {tabBtn('discover', 'Discover Equipment', 0)}
          {tabBtn('outgoing', 'My Requests', 0)}
          {isManager && tabBtn('incoming', 'Incoming Requests', pendingIncomingCount)}
          {tabBtn('agreements', 'Agreements', proposedForUsCount)}
          {isManager && tabBtn('partnerships', 'Partnerships', 0)}
        </div>

        {/* Discover filters */}
        {activeTab === 'discover' && (
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchDiscover()}
                placeholder="Search by name, code or manufacturer..."
                className={`${inputCls} pl-9`}
              />
            </div>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={`${inputCls} sm:w-52`}
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <button
              onClick={fetchDiscover}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-primary to-secondary hover:opacity-95 transition-opacity flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Search className="h-3.5 w-3.5" /> Search
            </button>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="h-64 flex flex-col justify-center items-center gap-3">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
            <span className="text-sm text-slate-500">Loading...</span>
          </div>
        ) : (
          <>
            {/* Discover grid */}
            {activeTab === 'discover' && (
              equipment.length === 0 ? (
                <EmptyState
                  icon={Package}
                  title="No shareable equipment found"
                  subtitle="No partner institution currently lists available equipment matching your filters."
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {equipment.map((item, idx) => {
                    const statusCfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.AVAILABLE;
                    const StatusIcon = statusCfg.icon;
                    return (
                      <motion.div
                        key={item.equipmentId}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.04 }}
                        className="glass-card dark:glass-card-dark rounded-2xl p-5 border border-slate-200/50 dark:border-slate-800/50 flex flex-col hover:shadow-xl hover:border-primary/20 transition-all"
                      >
                        {/* Image / placeholder */}
                        <div className="h-32 rounded-xl bg-slate-100/60 dark:bg-slate-950/40 border border-slate-200/50 dark:border-slate-800/50 flex items-center justify-center overflow-hidden mb-4">
                          {item.primaryImageUrl ? (
                            <img
                              src={fileUrl(item.primaryImageUrl)}
                              alt={item.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <Package className="h-10 w-10 text-slate-300 dark:text-slate-700" />
                          )}
                        </div>

                        <div className="flex justify-between items-start gap-2">
                          <span className="text-[10px] text-primary dark:text-blue-400 uppercase tracking-wider font-extrabold bg-primary/10 dark:bg-primary/25 px-2.5 py-0.5 rounded-md">
                            {item.category}
                          </span>
                          <span className={`inline-flex items-center gap-1 px-2 py-1 text-[10px] rounded-lg border font-bold whitespace-nowrap ${statusCfg.classes}`}>
                            <StatusIcon className="h-3 w-3" /> {statusCfg.label}
                          </span>
                        </div>

                        <h3 className="text-base font-bold text-slate-800 dark:text-white mt-3 my-0 leading-snug">
                          {item.name}
                        </h3>
                        <span className="font-mono text-[10px] text-slate-400 mt-0.5">{item.code}</span>

                        <div className="flex items-center gap-1.5 mt-3 flex-wrap">
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/25">
                            <Building2 className="h-3 w-3" /> {item.institutionName}
                          </span>
                          <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg border ${
                            item.hourlyRate > 0
                              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25'
                              : 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/25'
                          }`}>
                            {item.hourlyRate > 0 ? `₹${Number(item.hourlyRate).toLocaleString('en-IN')}/hr` : 'Free'}
                          </span>
                        </div>

                        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-900 space-y-1 text-xs text-slate-500 dark:text-slate-400 flex-1">
                          {item.manufacturer && (
                            <p><span className="text-slate-400">Manufacturer:</span> <span className="font-semibold text-slate-700 dark:text-slate-300">{item.manufacturer}</span></p>
                          )}
                          {item.model && (
                            <p><span className="text-slate-400">Model:</span> <span className="font-semibold text-slate-700 dark:text-slate-300">{item.model}</span></p>
                          )}
                          {(item.labName || item.departmentName) && (
                            <p><span className="text-slate-400">Location:</span> <span className="font-semibold text-slate-700 dark:text-slate-300">{[item.labName, item.departmentName].filter(Boolean).join(', ')}</span></p>
                          )}
                        </div>

                        <button
                          onClick={() => openRequestModal(item)}
                          className="mt-4 w-full py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-primary to-secondary hover:opacity-95 transition-opacity flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Send className="h-3.5 w-3.5" /> Request Access
                        </button>
                      </motion.div>
                    );
                  })}
                </div>
              )
            )}

            {/* My requests (outgoing) */}
            {activeTab === 'outgoing' && (
              outgoing.length === 0 ? (
                <EmptyState
                  icon={ArrowUpRight}
                  title="No outgoing sharing requests"
                  subtitle="Discover shareable equipment at other institutions and submit an access request."
                />
              ) : (
                <div className="space-y-4">
                  {outgoing.map((req) => renderRequestCard(req, 'outgoing'))}
                </div>
              )
            )}

            {/* Incoming requests */}
            {activeTab === 'incoming' && isManager && (
              incoming.length === 0 ? (
                <EmptyState
                  icon={Inbox}
                  title="No incoming sharing requests"
                  subtitle="Requests from other institutions for your shareable equipment will appear here."
                />
              ) : (
                <div className="space-y-4">
                  {incoming.map((req) => renderRequestCard(req, 'incoming'))}
                </div>
              )
            )}

            {/* Sharing agreements */}
            {activeTab === 'agreements' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <p className="text-xs text-slate-500 dark:text-slate-400 my-0 max-w-2xl">
                    An agreement sets standing terms with a partner — a negotiated discount, an
                    optional monthly hour cap, and whether their requests skip manual approval.
                    Requests are matched against it automatically when they are submitted.
                  </p>
                  {isManager && (
                    <button
                      onClick={openAgreementModal}
                      className="shrink-0 inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-primary to-secondary px-4 py-2.5 text-xs font-bold text-white hover:opacity-95 cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" /> Propose Agreement
                    </button>
                  )}
                </div>

                {agreements.length === 0 ? (
                  <EmptyState
                    icon={FileSignature}
                    title="No sharing agreements yet"
                    subtitle="Without an agreement, every request is negotiated one at a time."
                  />
                ) : (
                  agreements.map((a) => {
                    const weOwn = a.toInstitutionId === myInstitutionId;
                    return (
                      <motion.div
                        key={a.agreementId}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-card dark:glass-card-dark rounded-2xl p-5 border border-slate-200/50 dark:border-slate-800/50"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                          <div className="min-w-0">
                            <h3 className="text-sm font-bold text-slate-800 dark:text-white my-0">
                              {a.title}
                            </h3>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 mb-0">
                              {a.fromInstitutionName}
                              <ArrowRight className="inline h-3 w-3 mx-1" />
                              {a.toInstitutionName}
                              <span className="ml-2 text-slate-400">
                                {weOwn ? '(they borrow from us)' : '(we borrow from them)'}
                              </span>
                            </p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span
                              className={`text-[10px] font-bold px-2 py-1 rounded-lg border ${
                                a.status === 'ACTIVE'
                                  ? 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/25'
                                  : a.status === 'PROPOSED'
                                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25'
                                  : 'bg-slate-500/10 text-slate-500 border-slate-500/25'
                              }`}
                            >
                              {a.status}
                            </span>
                            {a.effective && (
                              <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-primary/10 text-primary border border-primary/25">
                                In force
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                          <AgreementFact label="Runs" value={`${a.startDate} → ${a.endDate || 'open'}`} />
                          <AgreementFact label="Discount" value={`${a.discountPercent ?? 0}%`} />
                          <AgreementFact
                            label="Monthly cap"
                            value={a.maxHoursPerMonth ? `${a.maxHoursPerMonth} h` : 'none'}
                            sub={
                              a.maxHoursPerMonth
                                ? `${a.hoursUsedThisMonth} h used · ${a.hoursRemainingThisMonth} h left`
                                : null
                            }
                          />
                          <AgreementFact label="Auto-approve" value={a.autoApprove ? 'Yes' : 'No'} />
                        </div>

                        {a.terms && (
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-3 mb-0 whitespace-pre-wrap">
                            {a.terms}
                          </p>
                        )}

                        {isManager && ['PROPOSED', 'ACTIVE', 'SUSPENDED'].includes(a.status) && (
                          <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-slate-200/40 dark:border-slate-800/40">
                            {/* Activating grants access to the owner's kit, so only they may do it */}
                            {a.status !== 'ACTIVE' && weOwn && (
                              <button
                                onClick={() => changeAgreementStatus(a, 'ACTIVE')}
                                className="rounded-lg bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/25 px-3 py-1.5 text-[11px] font-bold hover:bg-green-500/20 cursor-pointer"
                              >
                                Activate
                              </button>
                            )}
                            {a.status === 'ACTIVE' && (
                              <button
                                onClick={() => changeAgreementStatus(a, 'SUSPENDED')}
                                className="rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/25 px-3 py-1.5 text-[11px] font-bold hover:bg-amber-500/20 cursor-pointer"
                              >
                                Suspend
                              </button>
                            )}
                            <button
                              onClick={() => changeAgreementStatus(a, 'TERMINATED')}
                              className="rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/25 px-3 py-1.5 text-[11px] font-bold hover:bg-red-500/20 cursor-pointer"
                            >
                              Terminate
                            </button>
                            {a.status === 'PROPOSED' && !weOwn && (
                              <span className="text-[10px] text-slate-400 self-center">
                                Waiting for {a.toInstitutionName} to activate
                              </span>
                            )}
                          </div>
                        )}
                      </motion.div>
                    );
                  })
                )}
              </div>
            )}

            {/* Partnership analytics */}
            {activeTab === 'partnerships' && isManager && (
              !partnerships ? (
                <EmptyState
                  icon={BarChart3}
                  title="No partnership data"
                  subtitle="Sharing activity with other institutions will be summarised here."
                />
              ) : (
                <div className="space-y-5">
                  <div className="glass-card dark:glass-card-dark rounded-2xl p-5">
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                      <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 my-0">
                        {partnerships.institutionName} · last {partnerships.days} days
                      </h2>
                      <span
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border ${
                          partnerships.posture === 'LENDER'
                            ? 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/25'
                            : partnerships.posture === 'BORROWER'
                            ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/25'
                            : 'bg-slate-500/10 text-slate-500 border-slate-500/25'
                        }`}
                      >
                        Net {partnerships.posture.toLowerCase()}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                      <AgreementFact
                        label="Lent out"
                        value={`${partnerships.inboundHours} h`}
                        sub={`${partnerships.inboundApproved}/${partnerships.inboundRequests} approved`}
                      />
                      <AgreementFact
                        label="Borrowed"
                        value={`${partnerships.outboundHours} h`}
                        sub={`${partnerships.outboundApproved}/${partnerships.outboundRequests} approved`}
                      />
                      <AgreementFact
                        label="Revenue"
                        value={`₹${partnerships.inboundRevenue ?? 0}`}
                        sub={`cost ₹${partnerships.outboundCost ?? 0}`}
                      />
                      <AgreementFact
                        label="Partners"
                        value={String(partnerships.totalPartners)}
                        sub={`${partnerships.activeAgreements} live agreement(s)`}
                      />
                    </div>

                    {partnerships.insights?.length > 0 && (
                      <ul className="mt-4 pt-4 border-t border-slate-200/40 dark:border-slate-800/40 space-y-1.5">
                        {partnerships.insights.map((text, i) => (
                          <li key={i} className="flex gap-2 text-[11px] text-slate-600 dark:text-slate-300">
                            <span className="text-primary font-bold">•</span>
                            {text}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {partnerships.partners?.length > 0 && (
                    <div className="glass-card dark:glass-card-dark rounded-2xl overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                          <thead>
                            <tr className="border-b border-slate-200/50 dark:border-slate-800/50 text-[10px] uppercase tracking-wider text-slate-400">
                              <th className="px-4 py-3 font-extrabold">Partner</th>
                              <th className="px-4 py-3 font-extrabold">Lent to them</th>
                              <th className="px-4 py-3 font-extrabold">Borrowed from them</th>
                              <th className="px-4 py-3 font-extrabold">Agreement</th>
                              <th className="px-4 py-3 font-extrabold">Top equipment</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100/70 dark:divide-slate-800/40">
                            {partnerships.partners.map((p) => (
                              <tr key={p.institutionId}>
                                <td className="px-4 py-3 text-xs font-bold text-slate-800 dark:text-slate-100">
                                  {p.institutionName}
                                </td>
                                <td className="px-4 py-3 text-[11px] text-slate-600 dark:text-slate-300">
                                  {p.inboundHours} h
                                  <span className="ml-1.5 text-slate-400">
                                    ({p.inboundApproved}/{p.inboundRequests}, {p.inboundApprovalRate}%)
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-[11px] text-slate-600 dark:text-slate-300">
                                  {p.outboundHours} h
                                  <span className="ml-1.5 text-slate-400">
                                    ({p.outboundApproved}/{p.outboundRequests}, {p.outboundApprovalRate}%)
                                  </span>
                                </td>
                                <td className="px-4 py-3">
                                  {p.hasInboundAgreement || p.hasOutboundAgreement ? (
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-green-500/10 text-green-600 dark:text-green-400">
                                      {p.hasInboundAgreement && p.hasOutboundAgreement
                                        ? 'both ways'
                                        : p.hasInboundAgreement
                                        ? 'inbound'
                                        : 'outbound'}
                                    </span>
                                  ) : (
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-400/10 text-slate-400">
                                      none
                                    </span>
                                  )}
                                </td>
                                <td className="px-4 py-3 text-[10px] text-slate-500 dark:text-slate-400">
                                  {p.topEquipment?.join(', ') || '—'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )
            )}
          </>
        )}

        {/* -------- Propose agreement modal -------- */}
        <AnimatePresence>
          {agreementModalOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.55 }}
                exit={{ opacity: 0 }}
                onClick={() => !agreementSaving && setAgreementModalOpen(false)}
                className="fixed inset-0 z-[80] bg-black"
              />
              <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 pointer-events-none">
                <motion.div
                  initial={{ opacity: 0, scale: 0.94, y: 18 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.94, y: 18 }}
                  className="glass-card dark:glass-card-dark rounded-2xl shadow-2xl border border-slate-200/50 dark:border-slate-800/50 w-full max-w-lg max-h-[85vh] flex flex-col pointer-events-auto"
                >
                  <div className="p-5 border-b border-slate-200/50 dark:border-slate-800/50">
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white font-heading my-0">
                      Propose a sharing agreement
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 mb-0">
                      This lets your institution borrow from the partner you name. They activate it.
                    </p>
                  </div>

                  <div className="flex-1 overflow-y-auto p-5 space-y-3">
                    <Field label="Partner institution *">
                      <select
                        value={agreementForm.toInstitutionId}
                        onChange={(e) =>
                          setAgreementForm((f) => ({ ...f, toInstitutionId: e.target.value }))
                        }
                        className={inputCls}
                      >
                        <option value="">Select an institution…</option>
                        {institutions.map((i) => (
                          <option key={i.institutionId} value={i.institutionId}>
                            {i.name}
                          </option>
                        ))}
                      </select>
                    </Field>

                    <Field label="Title *">
                      <input
                        value={agreementForm.title}
                        onChange={(e) => setAgreementForm((f) => ({ ...f, title: e.target.value }))}
                        placeholder="e.g. Joint Microscopy Access 2026"
                        className={inputCls}
                      />
                    </Field>

                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Start date *">
                        <input
                          type="date"
                          value={agreementForm.startDate}
                          onChange={(e) =>
                            setAgreementForm((f) => ({ ...f, startDate: e.target.value }))
                          }
                          className={inputCls}
                        />
                      </Field>
                      <Field label="End date (optional)">
                        <input
                          type="date"
                          value={agreementForm.endDate}
                          onChange={(e) =>
                            setAgreementForm((f) => ({ ...f, endDate: e.target.value }))
                          }
                          className={inputCls}
                        />
                      </Field>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Discount %">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={agreementForm.discountPercent}
                          onChange={(e) =>
                            setAgreementForm((f) => ({ ...f, discountPercent: e.target.value }))
                          }
                          placeholder="0"
                          className={inputCls}
                        />
                      </Field>
                      <Field label="Monthly hour cap">
                        <input
                          type="number"
                          min="1"
                          value={agreementForm.maxHoursPerMonth}
                          onChange={(e) =>
                            setAgreementForm((f) => ({ ...f, maxHoursPerMonth: e.target.value }))
                          }
                          placeholder="unlimited"
                          className={inputCls}
                        />
                      </Field>
                    </div>

                    <label className="flex items-center gap-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800/60 px-3 py-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={agreementForm.autoApprove}
                        onChange={(e) =>
                          setAgreementForm((f) => ({ ...f, autoApprove: e.target.checked }))
                        }
                        className="h-4 w-4 rounded accent-primary"
                      />
                      <span className="text-[11px] text-slate-700 dark:text-slate-200">
                        Auto-approve requests under this agreement (skips manual review)
                      </span>
                    </label>

                    <Field label="Terms (optional)">
                      <textarea
                        rows={4}
                        value={agreementForm.terms}
                        onChange={(e) => setAgreementForm((f) => ({ ...f, terms: e.target.value }))}
                        placeholder="Any conditions, contacts or billing notes…"
                        className={inputCls}
                      />
                    </Field>
                  </div>

                  <div className="flex gap-2.5 p-5 border-t border-slate-200/50 dark:border-slate-800/50">
                    <button
                      onClick={() => setAgreementModalOpen(false)}
                      disabled={agreementSaving}
                      className="flex-1 py-2.5 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={submitAgreement}
                      disabled={agreementSaving}
                      className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-primary to-secondary hover:opacity-95 flex items-center justify-center gap-1.5 disabled:opacity-60 cursor-pointer"
                    >
                      {agreementSaving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                      Propose Agreement
                    </button>
                  </div>
                </motion.div>
              </div>
            </>
          )}
        </AnimatePresence>

        {/* -------- Request Access modal -------- */}
        <AnimatePresence>
          {requestModalOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.55 }}
                exit={{ opacity: 0 }}
                onClick={submitting ? undefined : () => setRequestModalOpen(false)}
                className="fixed inset-0 z-[60] bg-black"
              />
              <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 pointer-events-none">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  transition={{ type: 'spring', damping: 25, stiffness: 280 }}
                  className="glass-card dark:glass-card-dark rounded-2xl shadow-2xl border border-slate-200/50 dark:border-slate-800/50 w-full max-w-md p-6 pointer-events-auto"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white font-heading my-0 flex items-center gap-2">
                      <Share2 className="h-4 w-4 text-primary" /> Request Equipment Access
                    </h3>
                    <button
                      onClick={() => setRequestModalOpen(false)}
                      disabled={submitting}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                    >
                      <X className="h-4.5 w-4.5" />
                    </button>
                  </div>

                  <div className="mt-4 p-3.5 bg-slate-100/50 dark:bg-slate-950/20 border border-slate-200/50 dark:border-slate-800/50 rounded-xl">
                    <span className="text-sm font-bold text-slate-800 dark:text-white block">{selectedEquipment?.name}</span>
                    <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-1">
                      <Building2 className="h-3 w-3" /> {selectedEquipment?.institutionName}
                    </span>
                    {(() => {
                      // Live usage-fee estimate: rate x requested hours
                      const rate = Number(selectedEquipment?.hourlyRate) || 0;
                      const [sh, sm] = (requestForm.startTime || '0:0').split(':').map(Number);
                      const [eh, em] = (requestForm.endTime || '0:0').split(':').map(Number);
                      const hours = Math.max(0, (eh * 60 + em - sh * 60 - sm) / 60);
                      const fee = Math.round(rate * hours * 100) / 100;
                      return (
                        <span className={`text-[11px] font-bold flex items-center gap-1 mt-1.5 ${
                          rate > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-green-600 dark:text-green-400'
                        }`}>
                          {rate > 0
                            ? `Estimated usage fee: ₹${fee.toLocaleString('en-IN')} (₹${rate.toLocaleString('en-IN')}/hr × ${Math.round(hours * 100) / 100}h)`
                            : 'Free of charge'}
                        </span>
                      );
                    })()}
                  </div>

                  <form onSubmit={handleSubmitRequest} className="space-y-4 mt-5">
                    <div>
                      <label className={labelCls}>Purpose *</label>
                      <textarea
                        value={requestForm.purpose}
                        onChange={(e) => setRequestForm((f) => ({ ...f, purpose: e.target.value }))}
                        rows={3}
                        maxLength={500}
                        required
                        placeholder="Describe why you need this equipment and how it will be used..."
                        className={`${inputCls} resize-none`}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Date *</label>
                      <input
                        type="date"
                        required
                        min={new Date().toISOString().split('T')[0]}
                        value={requestForm.requestedDate}
                        onChange={(e) => setRequestForm((f) => ({ ...f, requestedDate: e.target.value }))}
                        className={inputCls}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={labelCls}>Start Time *</label>
                        <input
                          type="time"
                          required
                          value={requestForm.startTime}
                          onChange={(e) => setRequestForm((f) => ({ ...f, startTime: e.target.value }))}
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <label className={labelCls}>End Time *</label>
                        <input
                          type="time"
                          required
                          value={requestForm.endTime}
                          onChange={(e) => setRequestForm((f) => ({ ...f, endTime: e.target.value }))}
                          className={inputCls}
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-900">
                      <button
                        type="button"
                        onClick={() => setRequestModalOpen(false)}
                        disabled={submitting}
                        className="px-5 py-2.5 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-primary to-secondary hover:opacity-95 transition-opacity flex items-center gap-1.5 disabled:opacity-60 cursor-pointer"
                      >
                        {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                        {submitting ? 'Submitting...' : 'Submit Request'}
                      </button>
                    </div>
                  </form>
                </motion.div>
              </div>
            </>
          )}
        </AnimatePresence>

        {/* -------- Approve / Reject modal -------- */}
        <AnimatePresence>
          {decisionTarget && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.55 }}
                exit={{ opacity: 0 }}
                onClick={decisionLoading ? undefined : () => setDecisionTarget(null)}
                className="fixed inset-0 z-[80] bg-black"
              />
              <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 pointer-events-none">
                <motion.div
                  initial={{ opacity: 0, scale: 0.92, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.92, y: 15 }}
                  transition={{ type: 'spring', damping: 22, stiffness: 300 }}
                  className="glass-card dark:glass-card-dark rounded-2xl shadow-2xl border border-slate-200/50 dark:border-slate-800/50 w-full max-w-sm p-6 pointer-events-auto"
                >
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white font-heading my-0">
                    {decisionTarget.action === 'approve' ? 'Approve Sharing Request' : 'Reject Sharing Request'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                    {decisionTarget.action === 'approve'
                      ? `Approving grants ${decisionTarget.request.requestedByName} (${decisionTarget.request.fromInstitutionName}) a confirmed booking for ${decisionTarget.request.equipmentName} on ${decisionTarget.request.requestedDate}.`
                      : `Reject the request from ${decisionTarget.request.requestedByName} (${decisionTarget.request.fromInstitutionName}) for ${decisionTarget.request.equipmentName}.`}
                  </p>

                  <form onSubmit={handleDecision} className="mt-4">
                    <label className={labelCls}>Remarks (optional)</label>
                    <input
                      value={decisionRemarks}
                      onChange={(e) => setDecisionRemarks(e.target.value)}
                      maxLength={255}
                      placeholder="e.g. Please collect an access badge at reception"
                      className={inputCls}
                    />

                    <div className="flex gap-2.5 mt-6">
                      <button
                        type="button"
                        onClick={() => setDecisionTarget(null)}
                        disabled={decisionLoading}
                        className="flex-1 py-2.5 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={decisionLoading}
                        className={`flex-1 py-2.5 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-1.5 disabled:opacity-60 transition-all cursor-pointer ${
                          decisionTarget.action === 'approve'
                            ? 'bg-emerald-500 hover:bg-emerald-600'
                            : 'bg-red-500 hover:bg-red-600'
                        }`}
                      >
                        {decisionLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                        {decisionTarget.action === 'approve' ? 'Approve' : 'Reject'}
                      </button>
                    </div>
                  </form>
                </motion.div>
              </div>
            </>
          )}
        </AnimatePresence>

        {/* -------- Cancel confirmation -------- */}
        <ConfirmDialog
          open={!!cancelTarget}
          title="Cancel sharing request?"
          message={cancelTarget ? `This will cancel your pending request for ${cancelTarget.equipmentName} (${cancelTarget.toInstitutionName}). This cannot be undone.` : ''}
          confirmLabel="Cancel Request"
          danger
          loading={cancelLoading}
          onConfirm={handleCancel}
          onCancel={() => setCancelTarget(null)}
        />
      </div>
    </PageTransition>
  );
};

export default SharingPage;
