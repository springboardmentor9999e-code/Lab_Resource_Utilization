import { useState } from 'react';
import { MdSearch, MdNotifications, MdDarkMode, MdLightMode } from 'react-icons/md';
import { useAuth } from '../context/AuthContext';

export default function Header({ title = '' }) {
  const { user } = useAuth();
  const [darkMode, setDarkMode] = useState(false);

  const toggleDark = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white/70 border-b border-slate-100/80 backdrop-blur-md sticky top-0 z-20">
      {/* Search */}
      <div className="flex items-center gap-2 px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl w-80 focus-within:ring-2 focus-within:ring-brand-500 focus-within:border-transparent transition-all duration-200">
        <MdSearch className="text-gray-400 text-xl flex-shrink-0" />
        <input
          type="text"
          placeholder="Search equipment, labs, bookings..."
          className="bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400 w-full"
        />
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <button className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors duration-200">
          <MdNotifications className="text-gray-500 text-xl" />
          <span className="absolute top-1 right-1 w-4 h-4 bg-brand-500 rounded-full text-white text-[9px] font-bold flex items-center justify-center">
            3
          </span>
        </button>

        {/* Dark mode toggle */}
        <button
          onClick={toggleDark}
          className="p-2 rounded-xl hover:bg-gray-100 transition-colors duration-200"
        >
          {darkMode
            ? <MdLightMode className="text-amber-500 text-xl" />
            : <MdDarkMode className="text-gray-500 text-xl" />
          }
        </button>
      </div>
    </header>
  );
}
