import { useState, useEffect } from 'react';
import { X, CreditCard, Building2, Smartphone, CheckCircle, Download, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { paymentApi } from '../../api/api';

const STEPS = { SUMMARY: 0, METHOD: 1, FORM: 2, PROCESSING: 3, SUCCESS: 4 };

export default function MockPaymentModal({ invoice, onClose, onSuccess }) {
  const [step, setStep] = useState(STEPS.SUMMARY);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentRef, setPaymentRef] = useState('');
  const [cardForm, setCardForm] = useState({ number: '', expiry: '', cvv: '', name: '' });
  const [upiId, setUpiId] = useState('');
  const [processing, setProcessing] = useState(false);

  const amount = parseFloat(invoice.totalAmount || 0);
  const tax = parseFloat(invoice.taxAmount || 0);
  const total = amount + tax;

  useEffect(() => {
    if (step === STEPS.PROCESSING) {
      const timer = setTimeout(() => {
        setStep(STEPS.SUCCESS);
        setProcessing(false);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [step]);

  const handlePay = async () => {
    setStep(STEPS.PROCESSING);
    setProcessing(true);

    const ref = `PAY-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    setPaymentRef(ref);

    try {
      await paymentApi.record({
        invoiceId: invoice.id,
        amountPaid: total,
        paymentMethod: paymentMethod,
        paymentReference: ref,
      });
    } catch (err) {
      console.warn('Payment API call failed (demo mode):', err);
    }
  };

  const handleDone = () => {
    toast.success('Payment recorded successfully!');
    onSuccess?.();
    onClose();
  };

  const handleDownloadReceipt = () => {
    const receipt = `
PAYMENT RECEIPT
=====================================
Invoice: ${invoice.invoiceNumber}
Date: ${new Date().toLocaleDateString()}
Payment Ref: ${paymentRef}
Method: ${paymentMethod}
-------------------------------------
Subtotal: ₹${amount.toLocaleString()}
Tax: ₹${tax.toLocaleString()}
TOTAL PAID: ₹${total.toLocaleString()}
=====================================
Status: PAID
=====================================
This is a system-generated receipt.
    `.trim();

    const blob = new Blob([receipt], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt-${invoice.invoiceNumber}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-lg mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-bold text-gray-800">
            {step === STEPS.SUCCESS ? 'Payment Complete' : 'Make Payment'}
          </h2>
          {step !== STEPS.PROCESSING && step !== STEPS.SUCCESS && (
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
          )}
        </div>

        <div className="p-6">
          {/* Step: Invoice Summary */}
          {step === STEPS.SUMMARY && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-500">Invoice</span>
                  <span className="font-medium">{invoice.invoiceNumber}</span>
                </div>
                {invoice.equipmentName && (
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-500">Equipment</span>
                    <span className="font-medium">{invoice.equipmentName}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-500">Due Date</span>
                  <span className="font-medium">{invoice.dueDate}</span>
                </div>
                <div className="border-t mt-3 pt-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-500">Subtotal</span>
                    <span>₹{amount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-500">Tax</span>
                    <span>₹{tax.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg mt-2">
                    <span>Total</span>
                    <span>₹{total.toLocaleString()}</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setStep(STEPS.METHOD)} className="w-full btn-primary py-3">
                Proceed to Payment
              </button>
            </div>
          )}

          {/* Step: Payment Method */}
          {step === STEPS.METHOD && (
            <div className="space-y-3">
              <p className="text-sm text-gray-500 mb-3">Select payment method</p>
              {[
                { id: 'CREDIT_CARD', label: 'Credit / Debit Card', icon: CreditCard, color: 'blue' },
                { id: 'BANK_TRANSFER', label: 'Bank Transfer (NEFT/RTGS)', icon: Building2, color: 'green' },
                { id: 'UPI', label: 'UPI Payment', icon: Smartphone, color: 'purple' },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => { setPaymentMethod(m.id); setStep(STEPS.FORM); }}
                  className={`w-full flex items-center gap-3 p-4 border-2 rounded-lg transition-all hover:border-${m.color}-500 ${
                    paymentMethod === m.id ? `border-${m.color}-500 bg-${m.color}-50` : 'border-gray-200'
                  }`}
                >
                  <m.icon size={24} className={`text-${m.color}-600`} />
                  <span className="font-medium">{m.label}</span>
                </button>
              ))}
              <button onClick={() => setStep(STEPS.SUMMARY)} className="w-full text-center text-gray-500 hover:text-gray-700 py-2 text-sm">
                ← Back
              </button>
            </div>
          )}

          {/* Step: Payment Form */}
          {step === STEPS.FORM && (
            <div className="space-y-4">
              {paymentMethod === 'CREDIT_CARD' && (
                <div className="space-y-3">
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-4 text-white">
                    <p className="text-xs opacity-75 mb-1">CARD NUMBER</p>
                    <p className="text-lg tracking-wider font-mono">
                      {cardForm.number || '•••• •••• •••• ••••'}
                    </p>
                    <div className="flex justify-between mt-3">
                      <div>
                        <p className="text-xs opacity-75">CARD HOLDER</p>
                        <p className="text-sm">{cardForm.name || 'YOUR NAME'}</p>
                      </div>
                      <div>
                        <p className="text-xs opacity-75">EXPIRES</p>
                        <p className="text-sm">{cardForm.expiry || 'MM/YY'}</p>
                      </div>
                    </div>
                  </div>
                  <input
                    type="text" placeholder="Card Number" maxLength={19}
                    value={cardForm.number}
                    onChange={(e) => {
                      const v = e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim();
                      setCardForm({ ...cardForm, number: v });
                    }}
                    className="input-field font-mono"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input type="text" placeholder="MM/YY" maxLength={5}
                      value={cardForm.expiry}
                      onChange={(e) => setCardForm({ ...cardForm, expiry: e.target.value })}
                      className="input-field"
                    />
                    <input type="password" placeholder="CVV" maxLength={4}
                      value={cardForm.cvv}
                      onChange={(e) => setCardForm({ ...cardForm, cvv: e.target.value })}
                      className="input-field"
                    />
                  </div>
                  <input type="text" placeholder="Cardholder Name"
                    value={cardForm.name}
                    onChange={(e) => setCardForm({ ...cardForm, name: e.target.value })}
                    className="input-field"
                  />
                </div>
              )}

              {paymentMethod === 'BANK_TRANSFER' && (
                <div className="space-y-3">
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                    <p className="font-medium text-gray-700">Transfer to:</p>
                    <p>Account: <span className="font-mono">4521 7890 3456 1234</span></p>
                    <p>IFSC: <span className="font-mono">SBIN0001234</span></p>
                    <p>Bank: State Bank of India</p>
                    <p>A/C Name: LRUP Platform</p>
                  </div>
                  <input type="text" placeholder="UTR / Reference Number"
                    value={cardForm.name}
                    onChange={(e) => setCardForm({ ...cardForm, name: e.target.value })}
                    className="input-field"
                  />
                </div>
              )}

              {paymentMethod === 'UPI' && (
                <div className="space-y-3">
                  <div className="bg-purple-50 rounded-lg p-4 text-center">
                    <p className="text-sm text-gray-600 mb-2">Scan QR or enter UPI ID</p>
                    <div className="w-32 h-32 mx-auto bg-white border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center mb-2">
                      <span className="text-xs text-gray-400">QR Code</span>
                    </div>
                    <p className="text-xs text-gray-500">Demo QR — not functional</p>
                  </div>
                  <input type="text" placeholder="yourname@upi"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    className="input-field"
                  />
                </div>
              )}

              <button onClick={handlePay} className="w-full btn-primary py-3 flex items-center justify-center gap-2">
                <CreditCard size={18} />
                Pay ₹{total.toLocaleString()}
              </button>
              <button onClick={() => setStep(STEPS.METHOD)} className="w-full text-center text-gray-500 hover:text-gray-700 py-2 text-sm">
                ← Back
              </button>
            </div>
          )}

          {/* Step: Processing */}
          {step === STEPS.PROCESSING && (
            <div className="flex flex-col items-center py-8">
              <Loader2 size={48} className="text-primary-600 animate-spin mb-4" />
              <p className="text-lg font-medium text-gray-800">Processing Payment...</p>
              <p className="text-sm text-gray-500 mt-1">Please wait while we process your payment</p>
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
              <h3 className="text-xl font-bold text-gray-800 mb-1">Payment Successful!</h3>
              <p className="text-sm text-gray-500 mb-4">Your payment has been processed</p>

              <div className="bg-gray-50 rounded-lg p-4 w-full mb-4 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Invoice</span>
                  <span className="font-medium">{invoice.invoiceNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Payment Ref</span>
                  <span className="font-mono text-xs">{paymentRef}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Amount</span>
                  <span className="font-bold">₹{total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Method</span>
                  <span className="font-medium">{paymentMethod.replace('_', ' ')}</span>
                </div>
              </div>

              <button onClick={handleDownloadReceipt} className="w-full flex items-center justify-center gap-2 py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 mb-3 text-sm">
                <Download size={16} /> Download Receipt
              </button>
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
