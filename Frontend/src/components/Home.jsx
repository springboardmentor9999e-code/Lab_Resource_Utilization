import React, { useEffect, useState } from 'react';
import Skeleton from 'react-loading-skeleton';
import heroImg from '/hero.jpg';
import microscope from '/microscope.png';

export default function Home({ onNavigate }) {
  const [activeSection, setActiveSection] = useState('home');
  const [imageLoaded, setImageLoaded] = useState(false);
  const [institutionsDirectory, setInstitutionsDirectory] = useState([]);
  const [loadingInstitutions, setLoadingInstitutions] = useState(true);

  const defaultPartners = [
    { id: 1, name: 'IISc Bangalore', address: 'Bengaluru, Karnataka, IND', type: 'Premier Research Institute' },
    { id: 2, name: 'IIT Delhi', address: 'New Delhi, Delhi, IND', type: 'Engineering & Advanced Nanotech Hub' },
    { id: 3, name: 'BHU Varanasi', address: 'Varanasi, Uttar Pradesh, IND', type: 'Central Medical & Scientific Research' },
    { id: 4, name: 'AIIMS New Delhi', address: 'New Delhi, Delhi, IND', type: 'Bio-Medical & Clinical Research Center' }
  ];

  useEffect(() => {
    fetch('http://localhost:8080/api/institutions/all')
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setInstitutionsDirectory(data);
        } else {
          setInstitutionsDirectory(defaultPartners);
        }
      })
      .catch(() => {
        setInstitutionsDirectory(defaultPartners);
      })
      .finally(() => setLoadingInstitutions(false));
  }, []);

  const displayInstitutions = (institutionsDirectory && institutionsDirectory.length > 0)
    ? institutionsDirectory.slice(0, 4)
    : defaultPartners;

  return (
    <div className="min-h-screen bg-surface-bg text-on-surface flex flex-col font-sans">
      
      {/* Sticky Public Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-outline-variant/30 py-4 px-6 md:px-10 flex items-center justify-between">
        <div className="flex items-center cursor-pointer" onClick={() => onNavigate('home')}>
          <img className='w-8 mr-3' src={microscope} alt="logo" />
          <span className="text-xl md:text-2xl font-bold text-primary logo-font tracking-tight">LabMaintain</span>
        </div>
        
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-on-surface-variant">
          <button 
            onClick={() => { onNavigate('home'); setActiveSection('home'); }} 
            className={`transition font-semibold pb-1 border-b-2 ${activeSection === 'home' ? 'text-primary border-primary' : 'text-on-surface-variant border-transparent hover:text-primary'}`}
          >
            Home
          </button>
          <a 
            href="#about" 
            onClick={() => setActiveSection('about')} 
            className={`transition font-semibold pb-1 border-b-2 ${activeSection === 'about' ? 'text-primary border-primary' : 'text-on-surface-variant border-transparent hover:text-primary'}`}
          >
            About
          </a>
          <a 
            href="#contact" 
            onClick={() => setActiveSection('contact')} 
            className={`transition font-semibold pb-1 border-b-2 ${activeSection === 'contact' ? 'text-primary border-primary' : 'text-on-surface-variant border-transparent hover:text-primary'}`}
          >
            Contact
          </a>
          <a 
            href="#institutions" 
            onClick={() => setActiveSection('institutions')} 
            className={`transition font-semibold pb-1 border-b-2 ${activeSection === 'institutions' ? 'text-primary border-primary' : 'text-on-surface-variant border-transparent hover:text-primary'}`}
          >
            Institutions
          </a>
        </nav>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={() => onNavigate('login')}
            className="text-sm font-semibold text-primary hover:text-primary-light transition px-4 py-2"
          >
            Login
          </button>
          <button 
            onClick={() => onNavigate('register')}
            className="bg-primary hover:bg-primary-light text-white text-sm font-semibold px-5 py-2 rounded transition shadow-sm hover:shadow-md"
          >
            Register
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-[1440px] mx-auto px-6 md:px-10 py-8 space-y-20">
        
        {/* Hero Section */}
        <section className="space-y-10">
          <div className="w-full rounded-2xl overflow-hidden shadow-xl border border-outline-variant/20 bg-white relative h-[30rem]">
            {!imageLoaded && (
              <div className="absolute inset-0 z-10">
                <Skeleton height="100%" borderRadius={16} />
              </div>
            )}
            <img 
              src={heroImg} 
              alt="Modern Laboratory Infrastructure" 
              onLoad={() => setImageLoaded(true)}
              className={`w-full h-[30rem] object-cover transition-opacity duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            />
          </div>
          
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-[48px] font-bold text-primary leading-tight tracking-tight">
              Precision Maintenance for Modern Laboratories
            </h1>
            <p className="text-on-surface-variant text-base md:text-lg max-w-2xl mx-auto font-normal">
              Streamline equipment uptime, compliance, and institutional safety with our all-in-one management suite designed for high-stakes research environments.
            </p>
            <div className="flex items-center justify-center gap-4 pt-2">
              <button 
                onClick={() => onNavigate('register')}
                className="bg-primary hover:bg-primary-light text-white font-semibold px-6 py-3 rounded transition shadow-md"
              >
                Register Now
              </button>
              <button 
                onClick={() => onNavigate('login')}
                className="border border-outline hover:border-primary hover:text-primary font-semibold px-6 py-3 rounded bg-white transition"
              >
                Login
              </button>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section id="about" className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center border-t border-outline-variant/20 pt-16">
          <div className="lg:col-span-7 space-y-6">
            <span className="text-xs font-bold text-tertiary tracking-wider uppercase">Our Mission</span>
            <h2 className="text-3xl md:text-4xl font-bold text-primary">
              Efficiency, Reliability, and Safety
            </h2>
            <p className="text-on-surface-variant leading-relaxed text-sm md:text-base">
              LabMaintain was founded on the principle that institutional research should never be hindered by equipment failure or administrative overhead. We provide the infrastructure for excellence.
            </p>
            <p className="text-on-surface-variant leading-relaxed text-sm md:text-base">
              Our platform integrates seamlessly into existing laboratory workflows, offering a centralized hub for tracking every asset from microscope to centrifuge, ensuring they are calibrated, compliant, and ready for use.
            </p>
          </div>
          
          <div className="lg:col-span-5 flex flex-col gap-4">
            {/* Uptime Card */}
            <div className="bg-white border border-outline-variant/30 rounded-xl p-5 shadow-sm flex items-start gap-4 hover:shadow-md transition">
              <div className="p-3 bg-secondary-container/30 text-primary rounded-lg">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-on-surface font-sans">99.9% Uptime</h3>
                <p className="text-sm text-on-surface-variant mt-1">Guaranteed operational continuity for critical research.</p>
              </div>
            </div>

            {/* Audit Ready Card */}
            <div className="bg-white border border-outline-variant/30 rounded-xl p-5 shadow-sm flex items-start gap-4 hover:shadow-md transition">
              <div className="p-3 bg-secondary-container/30 text-primary rounded-lg">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-on-surface font-sans">Audit Ready</h3>
                <p className="text-sm text-on-surface-variant mt-1">Instant compliance documentation at your fingertips.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Management Tools Section */}
        <section className="space-y-10 border-t border-outline-variant/20 pt-16">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-primary">Advanced Management Tools</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="bg-white border border-outline-variant/30 rounded-xl p-6 shadow-sm hover:shadow-md transition flex flex-col items-center text-center space-y-4">
              <div className="p-4 bg-secondary-container/20 text-primary rounded-full">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-on-surface">Intelligent Scheduling</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Predictive maintenance algorithms that prevent breakdowns before they happen, maximizing equipment lifespan.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-white border border-outline-variant/30 rounded-xl p-6 shadow-sm hover:shadow-md transition flex flex-col items-center text-center space-y-4">
              <div className="p-4 bg-secondary-container/20 text-primary rounded-full">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-on-surface">Compliance Tracking</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Automated regulatory alerts and safety log management to ensure institutional standards are met without effort.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-white border border-outline-variant/30 rounded-xl p-6 shadow-sm hover:shadow-md transition flex flex-col items-center text-center space-y-4">
              <div className="p-4 bg-secondary-container/20 text-primary rounded-full">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-on-surface">Real-time Analytics</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Comprehensive dashboard with live data feeds showing utilization rates and performance metrics across the entire lab.
              </p>
            </div>
          </div>
        </section>

        {/* Partner Institutions Section */}
        <section id="institutions" className="space-y-8 border-t border-outline-variant/20 pt-16">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
            <div>
              <h2 className="text-3xl font-bold text-primary">Partner Institutions</h2>
              <p className="text-sm text-on-surface-variant mt-1">Trusted by leading research centers globally.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {loadingInstitutions ? (
              [1, 2, 3, 4].map(i => (
                <div key={i} className="bg-white border border-outline-variant/30 rounded-xl p-5 shadow-sm space-y-4">
                  <Skeleton height={112} borderRadius={8} />
                  <Skeleton height={20} width="70%" />
                  <Skeleton height={14} width="50%" />
                </div>
              ))
            ) : (
              displayInstitutions.map((inst, idx) => (
                <div key={inst.id || inst.institutionId || idx} className="bg-white border border-outline-variant/30 rounded-xl p-5 shadow-sm hover:shadow-md transition space-y-4">
                  <div className="h-28 bg-surface-low rounded-lg flex items-center justify-center text-primary-light">
                    <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-on-surface font-sans">{inst.name}</h4>
                    <p className="text-xs text-on-surface-variant mt-0.5">{inst.address || inst.type || 'Research Institute'}</p>
                  </div>
                </div>
              ))
            )}
          </div> 
        </section>

      </main>

      {/* Footer */}
      <footer className="bg-surface-low border-t border-outline-variant/40 mt-20 py-12 px-6 md:px-10">
        <div className="max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          
          <div className="space-y-4">
            <span className="text-lg font-bold text-primary logo-font">LabMaintain</span>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              &copy; 2026 LabMaintain. All rights reserved.<br />
              Precision in Maintenance.
            </p>
          </div>

          <div className="space-y-3">
            <h5 className="text-xs font-bold text-on-surface uppercase tracking-wider">Legal</h5>
            <ul className="space-y-2 text-sm text-on-surface-variant">
              <li><a href="#privacy" className="hover:text-primary transition">Privacy Policy</a></li>
              <li><a href="#terms" className="hover:text-primary transition">Terms of Service</a></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h5 className="text-xs font-bold text-on-surface uppercase tracking-wider">Operations</h5>
            <ul className="space-y-2 text-sm text-on-surface-variant">
              <li><a href="#compliance" className="hover:text-primary transition">Compliance</a></li>
              <li><a href="#support" className="hover:text-primary transition">Support</a></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h5 className="text-xs font-bold text-on-surface uppercase tracking-wider">Newsletter</h5>
            <div className="flex border border-outline-variant rounded-md overflow-hidden bg-white max-w-xs focus-within:ring-2 focus-within:ring-primary focus-within:border-transparent transition">
              <input 
                type="email" 
                placeholder="Email address" 
                className="px-3 py-2 text-sm w-full outline-none"
              />
              <button className="bg-primary hover:bg-primary-light text-white px-3 transition flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}
