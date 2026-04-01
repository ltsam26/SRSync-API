import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function DashboardLayout({ isAdmin = false }) {
  return (
    <div className="page-wrapper">
      <Sidebar isAdmin={isAdmin} />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
