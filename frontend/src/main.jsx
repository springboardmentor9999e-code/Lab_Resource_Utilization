import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import AppShell from './components/AppShell.jsx';
import RequireAuth from './components/RequireAuth.jsx';
import Analytics from './pages/Analytics.jsx';
import Bookings from './pages/Bookings.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Equipment from './pages/Equipment.jsx';
import Login from './pages/Login.jsx';
import Maintenance from './pages/Maintenance.jsx';
import Register from './pages/Register.jsx';
import Users from './pages/Users.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route element={<RequireAuth />}>
          <Route element={<AppShell />}>
            <Route index element={<Dashboard />} />
            <Route path="equipment" element={<Equipment />} />
            <Route path="bookings" element={<Bookings />} />
            <Route path="maintenance" element={<Maintenance />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="users" element={<Users />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
);
