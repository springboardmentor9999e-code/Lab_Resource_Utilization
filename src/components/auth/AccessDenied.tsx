import React from 'react';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface AccessDeniedProps {
  onBackToConsole: () => void;
}

export const AccessDenied: React.FC<AccessDeniedProps> = ({ onBackToConsole }) => {
  const { currentRole } = useApp();

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="bg-slate-900/80 border border-slate-800 backdrop-blur-xl p-8 rounded-3xl max-w-lg shadow-2xl space-y-6">
        <div className="inline-flex p-4 rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20 animate-pulse">
          <ShieldAlert className="w-12 h-12" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold text-white tracking-tight">Access Restrained by Role Policy</h2>
          <p className="text-xs text-slate-400">
            Your active persona <strong className="text-rose-400 uppercase font-mono">@{currentRole}</strong> is not authorized to view this console.
          </p>
        </div>

        <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700/50 text-left text-xs space-y-2">
          <span className="font-bold text-slate-300 block uppercase tracking-wider text-[10px]">Sandbox Demonstration Notice:</span>
          <p className="text-slate-300 leading-relaxed text-[11px]">
            To facilitate evaluation and testing of all platform modules, the **Switch Role simulation** bar (visible when logged in as Admin) allows you to cycle through different personas.
          </p>
          <p className="text-slate-400 leading-relaxed text-[11px]">
            In production deployment, access control is strictly enforced on both client and server sides using cryptographically verified claims from authorization headers.
          </p>
        </div>

        <button
          onClick={onBackToConsole}
          className="w-full bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold py-3 rounded-xl transition-all border border-slate-700 hover:border-slate-600 flex items-center justify-center gap-2 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Authorized Console</span>
        </button>
      </div>
    </div>
  );
};
