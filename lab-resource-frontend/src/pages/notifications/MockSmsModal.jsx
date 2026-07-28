import { useState, useEffect } from 'react';
import { X, Smartphone, CheckCircle, Send, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const STEPS = { COMPOSE: 0, PREVIEW: 1, PROCESSING: 2, SUCCESS: 3 };

const SMS_TEMPLATES = [
  {
    value: 'BOOKING_CONFIRMED',
    label: 'Booking Confirmed',
    message: 'Your booking for {equipment} has been confirmed for {date} at {time}. Booking ID: #{id}.',
  },
  {
    value: 'BOOKING_REMINDER',
    label: 'Booking Reminder',
    message: 'Reminder: You have a booking for {equipment} tomorrow at {time}. Please arrive 10 minutes early.',
  },
  {
    value: 'MAINTENANCE_ALERT',
    label: 'Maintenance Alert',
    message: 'Scheduled maintenance for {equipment} will begin on {date}. The equipment will be unavailable during this period.',
  },
  {
    value: 'PAYMENT_DUE',
    label: 'Payment Due',
    message: 'Invoice #{id} for ₹{amount} is due on {date}. Please make payment to avoid late fees.',
  },
  {
    value: 'CALIBRATION_DUE',
    label: 'Calibration Due',
    message: 'Calibration for {equipment} is due on {date}. Please schedule calibration to maintain compliance.',
  },
  {
    value: 'CUSTOM',
    label: 'Custom Message',
    message: '',
  },
];

export default function MockSmsModal({ onClose }) {
  const { user } = useAuth();
  const [step, setStep] = useState(STEPS.COMPOSE);
  const [phoneNumber, setPhoneNumber] = useState('+91 98765 43210');
  const [template, setTemplate] = useState('BOOKING_CONFIRMED');
  const [message, setMessage] = useState(SMS_TEMPLATES[0].message);
  const [charCount, setCharCount] = useState(0);

  const sampleData = {
    equipment: 'CNC Milling Machine',
    date: new Date(Date.now() + 86400000).toLocaleDateString('en-IN'),
    time: '10:00 AM',
    id: String(Math.floor(Math.random() * 9000) + 1000),
    amount: '2,500',
  };

  useEffect(() => {
    const tpl = SMS_TEMPLATES.find(t => t.value === template);
    if (tpl) {
      let msg = tpl.message;
      Object.entries(sampleData).forEach(([k, v]) => {
        msg = msg.replace(new RegExp(`\\{${k}\\}`, 'g'), v);
      });
      setMessage(msg);
    }
  }, [template]);

  useEffect(() => {
    setCharCount(message.length);
  }, [message]);

  useEffect(() => {
    if (step === STEPS.PROCESSING) {
      const timer = setTimeout(() => setStep(STEPS.SUCCESS), 2500);
      return () => clearTimeout(timer);
    }
  }, [step]);

  const handleSend = () => {
    if (!phoneNumber.trim()) {
      toast.error('Phone number is required');
      return;
    }
    if (!message.trim()) {
      toast.error('Message cannot be empty');
      return;
    }
    setStep(STEPS.PROCESSING);
  };

  const handleDone = () => {
    toast.success('SMS sent successfully (demo)');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-lg mx-4 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-bold text-gray-800">
            {step === STEPS.SUCCESS ? 'SMS Sent' : 'Test SMS Notification'}
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <div className="flex items-center gap-2">
                  <Smartphone size={18} className="text-gray-400" />
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="input-field flex-1"
                    placeholder="+91 XXXXX XXXXX"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message Type</label>
                <select
                  value={template}
                  onChange={(e) => setTemplate(e.target.value)}
                  className="input-field"
                >
                  {SMS_TEMPLATES.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  maxLength={160}
                  className="input-field resize-none"
                  placeholder="Type your SMS message..."
                />
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-gray-400">Demo mode — no real SMS sent</span>
                  <span className={`text-xs ${charCount > 140 ? 'text-red-500' : 'text-gray-400'}`}>
                    {charCount}/160 characters
                  </span>
                </div>
              </div>

              <button onClick={handleSend} className="w-full btn-primary py-3 flex items-center justify-center gap-2">
                <Send size={18} /> Send SMS
              </button>
            </div>
          )}

          {/* Step: Preview */}
          {step === STEPS.PREVIEW && (
            <div className="space-y-4">
              <div className="bg-gray-100 rounded-2xl p-4 max-w-xs mx-auto">
                <div className="bg-white rounded-xl p-3 shadow-sm">
                  <p className="text-sm text-gray-800">{message}</p>
                </div>
                <p className="text-xs text-gray-400 mt-2 text-right">Just now</p>
              </div>
              <div className="text-center text-sm text-gray-500">
                To: <span className="font-medium">{phoneNumber}</span>
              </div>
              <button onClick={handleSend} className="w-full btn-primary py-3">Confirm & Send</button>
              <button onClick={() => setStep(STEPS.COMPOSE)} className="w-full text-center text-gray-500 hover:text-gray-700 py-2 text-sm">
                ← Back to edit
              </button>
            </div>
          )}

          {/* Step: Processing */}
          {step === STEPS.PROCESSING && (
            <div className="flex flex-col items-center py-8">
              <Loader2 size={48} className="text-primary-600 animate-spin mb-4" />
              <p className="text-lg font-medium text-gray-800">Sending SMS...</p>
              <p className="text-sm text-gray-500 mt-1">Simulating delivery to {phoneNumber}</p>
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
              <h3 className="text-xl font-bold text-gray-800 mb-1">SMS Sent Successfully!</h3>
              <p className="text-sm text-gray-500 mb-4">Demo notification delivered</p>

              <div className="bg-gray-50 rounded-lg p-4 w-full mb-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">To</span>
                  <span className="font-medium">{phoneNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Type</span>
                  <span className="font-medium">{SMS_TEMPLATES.find(t => t.value === template)?.label}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Characters</span>
                  <span className="font-medium">{charCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Status</span>
                  <span className="text-green-600 font-medium">Delivered</span>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 w-full mb-4">
                <p className="text-xs text-yellow-700 text-center">
                  This is a prototype demo. No actual SMS was sent. In production, this would use Twilio SMS gateway.
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
