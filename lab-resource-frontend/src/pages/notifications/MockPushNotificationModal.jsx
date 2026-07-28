import { useState, useEffect } from 'react';
import { X, Radio, CheckCircle, Send, Loader2, Bell, AlertTriangle, Info } from 'lucide-react';
import toast from 'react-hot-toast';

const STEPS = { COMPOSE: 0, PREVIEW: 1, PROCESSING: 2, SUCCESS: 3 };

const PRIORITIES = [
  { value: 'low', label: 'Low', color: 'bg-gray-100 text-gray-700', icon: Info },
  { value: 'normal', label: 'Normal', color: 'bg-blue-100 text-blue-700', icon: Bell },
  { value: 'high', label: 'High', color: 'bg-red-100 text-red-700', icon: AlertTriangle },
];

const PUSH_TEMPLATES = [
  {
    value: 'BOOKING_UPDATE',
    label: 'Booking Update',
    title: 'Booking Confirmed',
    body: 'Your booking for CNC Milling Machine has been confirmed for tomorrow at 10:00 AM.',
  },
  {
    value: 'MAINTENANCE_ALERT',
    label: 'Maintenance Alert',
    title: 'Maintenance Scheduled',
    body: 'Scheduled maintenance for 3D Printer will begin on 2026-08-01.',
  },
  {
    value: 'WAITLIST_PROMOTED',
    label: 'Waitlist Promoted',
    title: 'You\'re off the waitlist!',
    body: 'A slot has opened up. Your booking for GPU Workstation is now confirmed.',
  },
  {
    value: 'ANNOUNCEMENT',
    label: 'System Announcement',
    title: 'System Update',
    body: 'The platform will undergo maintenance on Saturday from 2:00 AM to 4:00 AM.',
  },
  {
    value: 'CUSTOM',
    label: 'Custom',
    title: '',
    body: '',
  },
];

export default function MockPushNotificationModal({ onClose }) {
  const [step, setStep] = useState(STEPS.COMPOSE);
  const [title, setTitle] = useState(PUSH_TEMPLATES[0].title);
  const [body, setBody] = useState(PUSH_TEMPLATES[0].body);
  const [template, setTemplate] = useState('BOOKING_UPDATE');
  const [priority, setPriority] = useState('normal');

  useEffect(() => {
    const tpl = PUSH_TEMPLATES.find(t => t.value === template);
    if (tpl) {
      setTitle(tpl.title);
      setBody(tpl.body);
    }
  }, [template]);

  useEffect(() => {
    if (step === STEPS.PROCESSING) {
      const timer = setTimeout(() => setStep(STEPS.SUCCESS), 2000);
      return () => clearTimeout(timer);
    }
  }, [step]);

  const handleSend = () => {
    if (!title.trim() || !body.trim()) {
      toast.error('Title and body are required');
      return;
    }
    setStep(STEPS.PROCESSING);
  };

  const handleDone = () => {
    toast.success('Push notification sent (demo)');
    onClose();
  };

  const priorityConfig = PRIORITIES.find(p => p.value === priority);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-lg mx-4 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-bold text-gray-800">
            {step === STEPS.SUCCESS ? 'Notification Sent' : 'Test Push Notification'}
          </h2>
          {step !== STEPS.PROCESSING && step !== STEPS.SUCCESS && (
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
          )}
        </div>

        <div className="p-6">
          {/* Step: Compose */}
          {step === STEPS.COMPOSE && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Template</label>
                <select value={template} onChange={(e) => setTemplate(e.target.value)} className="input-field">
                  {PUSH_TEMPLATES.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notification Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="input-field"
                  placeholder="Enter notification title"
                  maxLength={60}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Body</label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={3}
                  className="input-field resize-none"
                  placeholder="Enter notification body"
                  maxLength={200}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                <div className="flex gap-2">
                  {PRIORITIES.map(p => {
                    const Icon = p.icon;
                    return (
                      <button
                        key={p.value}
                        onClick={() => setPriority(p.value)}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                          priority === p.value
                            ? `${p.color} ring-2 ring-offset-1 ring-current`
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                      >
                        <Icon size={14} /> {p.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button onClick={handleSend} className="w-full btn-primary py-3 flex items-center justify-center gap-2">
                <Send size={18} /> Send Push Notification
              </button>
            </div>
          )}

          {/* Step: Preview */}
          {step === STEPS.PREVIEW && (
            <div className="space-y-4">
              <div className="max-w-sm mx-auto">
                <div className="bg-gray-900 rounded-t-2xl h-6 flex items-center justify-center">
                  <div className="w-16 h-1 bg-gray-600 rounded-full" />
                </div>
                <div className="bg-gray-100 p-4 space-y-3">
                  <div className="bg-white rounded-xl p-3 shadow-sm flex items-start gap-3">
                    <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Bell size={16} className="text-primary-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-500">LRUP Platform • now</p>
                        <span className={`text-xs px-1.5 py-0.5 rounded ${priorityConfig?.color}`}>{priorityConfig?.label}</span>
                      </div>
                      <p className="text-sm font-semibold text-gray-800 mt-0.5">{title}</p>
                      <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">{body}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-800 rounded-b-2xl h-8" />
              </div>
              <button onClick={() => setStep(STEPS.PROCESSING)} className="w-full btn-primary py-3">Confirm & Deliver</button>
              <button onClick={() => setStep(STEPS.COMPOSE)} className="w-full text-center text-gray-500 hover:text-gray-700 py-2 text-sm">
                ← Back to edit
              </button>
            </div>
          )}

          {/* Step: Processing */}
          {step === STEPS.PROCESSING && (
            <div className="flex flex-col items-center py-8">
              <Loader2 size={48} className="text-primary-600 animate-spin mb-4" />
              <p className="text-lg font-medium text-gray-800">Delivering Push Notification...</p>
              <p className="text-sm text-gray-500 mt-1">Simulating Firebase FCM delivery</p>
              <div className="mt-4 flex gap-1">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="w-2 h-2 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
          )}

          {/* Step: Success */}
          {step === STEPS.SUCCESS && (
            <div className="flex flex-col items-center py-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle size={40} className="text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-1">Push Notification Delivered!</h3>
              <p className="text-sm text-gray-500 mb-4">Demo notification sent</p>

              <div className="bg-gray-50 rounded-lg p-4 w-full mb-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Title</span>
                  <span className="font-medium">{title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Priority</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${priorityConfig?.color}`}>{priorityConfig?.label}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Status</span>
                  <span className="text-green-600 font-medium">Delivered</span>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 w-full mb-4">
                <p className="text-xs text-yellow-700 text-center">
                  This is a prototype demo. No actual push was sent. In production, this would use Firebase Cloud Messaging (FCM).
                </p>
              </div>

              <button onClick={handleDone} className="w-full btn-primary py-3">
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
