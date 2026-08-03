import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Sparkles, Send, Bot, User, Loader2 } from 'lucide-react';

interface AiLabAssistantModalProps {
  onClose: () => void;
}

export const AiLabAssistantModal: React.FC<AiLabAssistantModalProps> = ({ onClose }) => {
  const { askAiAdvisor, currentRole, currentUser, equipment, labs } = useApp();

  const [prompt, setPrompt] = useState<string>('');
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([
    {
      role: 'assistant',
      text: `Hello ${currentUser.name}! I am your Lab Resource Intelligence AI. I can assist you with scheduling optimization, calibration risk analysis, maintenance troubleshooting, and safety protocols for your role as ${currentRole.toUpperCase()}. How can I help you today?`,
    },
  ]);
  const [loading, setLoading] = useState<boolean>(false);

  const quickPrompts = [
    'How can we optimize equipment booking slots across departments during peak exam weeks?',
    'Analyze maintenance risks for equipment with upcoming calibration due dates.',
    'Suggest a daily safety checklist for the Robotics & Additive Manufacturing Workshop.',
    'Draft an inter-department sharing policy for high-value research instruments.',
  ];

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || prompt;
    if (!query.trim() || loading) return;

    const userMsg = { role: 'user' as const, text: query };
    setMessages(prev => [...prev, userMsg]);
    setPrompt('');
    setLoading(true);

    const context = {
      role: currentRole,
      userDepartment: currentUser.departmentName,
      totalEquipment: equipment.length,
      totalLabs: labs.length,
    };

    const reply = await askAiAdvisor(query, context);

    setMessages(prev => [...prev, { role: 'assistant', text: reply }]);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl text-slate-100 flex flex-col h-[580px]">
        
        {/* Modal Header */}
        <div className="p-4 bg-slate-900 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-gradient-to-tr from-purple-500 to-indigo-500 text-white">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                Lab Resource Intelligence AI
                <span className="text-[10px] font-mono bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded border border-purple-500/30">
                  Gemini Powered
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">Contextual advisor for scheduling, maintenance & safety</p>
            </div>
          </div>

          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat History */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-2.5 ${
                m.role === 'user' ? 'flex-row-reverse' : ''
              }`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-white ${
                  m.role === 'user'
                    ? 'bg-indigo-600'
                    : 'bg-purple-600'
                }`}
              >
                {m.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`p-3 rounded-2xl max-w-[80%] leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-tr-none'
                    : 'bg-slate-900 text-slate-200 border border-slate-700/80 rounded-tl-none whitespace-pre-line'
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-purple-400 text-xs italic p-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Analyzing lab data and generating optimization recommendations...</span>
            </div>
          )}
        </div>

        {/* Quick Prompts */}
        <div className="px-4 py-2 bg-slate-900/60 border-t border-slate-700/80 overflow-x-auto scrollbar-none flex gap-1.5">
          {quickPrompts.map((qp, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(qp)}
              disabled={loading}
              className="text-[10px] bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-indigo-500/30 px-2.5 py-1 rounded-full whitespace-nowrap shrink-0 transition-colors"
            >
              ⚡ {qp}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-slate-900 border-t border-slate-700 flex items-center gap-2">
          <input
            type="text"
            placeholder="Ask AI advisor about equipment slots, fault codes, or safety..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            disabled={loading}
            className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />

          <button
            onClick={() => handleSend()}
            disabled={loading || !prompt.trim()}
            className="p-2 bg-gradient-to-tr from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl transition-all disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
