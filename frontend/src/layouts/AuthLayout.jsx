import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Award, Layers, ShieldCheck, Microscope } from 'lucide-react';

const AuthLayout = () => {
  return (
    <div className="min-h-screen w-full relative flex items-center justify-center bg-slate-50 dark:bg-[#0b0f19] overflow-hidden p-0 sm:p-4 transition-colors duration-300">
      
      {/* Dynamic Background Glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-blue-500/10 dark:bg-blue-600/10 blur-[100px] animate-pulse-slow"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-cyan-500/10 dark:bg-cyan-600/10 blur-[100px] animate-pulse-slow-delayed"></div>
      <div className="absolute top-1/2 left-1/3 w-80 h-80 rounded-full bg-purple-500/5 dark:bg-purple-600/5 blur-[120px] animate-pulse-slow"></div>

      {/* Main Grid Wrapper */}
      <div className="w-full max-w-6xl min-h-[650px] grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden lg:rounded-3xl lg:border lg:border-white/20 lg:glass-card lg:dark:glass-card-dark lg:shadow-2xl">
        
        {/* Left Pane - Illustration & Brand Value */}
        <div className="hidden lg:flex lg:col-span-5 bg-gradient-to-br from-blue-600 via-secondary to-accent relative flex-col justify-between p-12 text-white overflow-hidden">
          {/* Subtle grid line overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
          
          {/* Ambient light streak */}
          <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-white/10 rounded-full blur-[100px] rotate-45 pointer-events-none"></div>

          {/* Logo / Brand Header */}
          <div className="z-10 flex items-center gap-2">
            <div className="bg-white/10 backdrop-blur-md p-2.5 rounded-xl border border-white/20">
              <Microscope className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="font-heading font-extrabold text-xl tracking-tight leading-none block">LRUP</span>
              <span className="text-[10px] text-blue-100 uppercase tracking-widest font-semibold block">University Suite</span>
            </div>
          </div>

          {/* Content Mid-section */}
          <div className="z-10 space-y-6">
            <h1 className="font-heading font-extrabold text-4xl leading-tight tracking-tight text-white my-0">
              Optimize. Shared. Academic <br />
              <span className="text-cyan-200">Resources.</span>
            </h1>
            <p className="text-white/80 text-sm leading-relaxed max-w-xs">
              Seamlessly monitor, schedule, and allocate enterprise university equipment and laboratories in real time.
            </p>
            
            {/* Features grid */}
            <div className="space-y-4 pt-4">
              <div className="flex items-center gap-3">
                <div className="bg-white/10 p-1.5 rounded-lg">
                  <Layers className="h-4 w-4 text-cyan-200" />
                </div>
                <span className="text-sm font-medium text-white/90">99.8% Resource Utilization</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-white/10 p-1.5 rounded-lg">
                  <ShieldCheck className="h-4 w-4 text-cyan-200" />
                </div>
                <span className="text-sm font-medium text-white/90">Role-Based Gatekeeping</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-white/10 p-1.5 rounded-lg">
                  <Award className="h-4 w-4 text-cyan-200" />
                </div>
                <span className="text-sm font-medium text-white/90">Smart Token Verification</span>
              </div>
            </div>
          </div>

          {/* Floating Widget Mock - Bottom */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="z-10 bg-white/10 backdrop-blur-lg border border-white/20 p-4 rounded-2xl shadow-xl flex items-center justify-between"
          >
            <div>
              <div className="text-[10px] uppercase tracking-wider text-cyan-200 font-semibold">Active Lab Sessions</div>
              <div className="text-2xl font-extrabold mt-0.5">142 / 150</div>
            </div>
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full border-2 border-blue-600 bg-slate-200 text-xs font-bold text-slate-800 flex items-center justify-center">A</div>
              <div className="w-8 h-8 rounded-full border-2 border-blue-600 bg-cyan-200 text-xs font-bold text-slate-800 flex items-center justify-center">B</div>
              <div className="w-8 h-8 rounded-full border-2 border-blue-600 bg-purple-200 text-xs font-bold text-slate-800 flex items-center justify-center">+5</div>
            </div>
          </motion.div>
        </div>

        {/* Right Pane - Form Outlet */}
        <div className="col-span-1 lg:col-span-7 flex items-center justify-center p-6 sm:p-12 md:p-16 bg-white/40 dark:bg-slate-900/30 backdrop-blur-xl">
          <div className="w-full max-w-md">
            <Outlet />
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default AuthLayout;
