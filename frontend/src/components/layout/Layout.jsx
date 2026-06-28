import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { useLocation } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { useState } from 'react';

const noSidebarPages = ['/login', '/register'];

const Layout = ({ children }) => {
  const location = useLocation();
  const { isAuthenticated } = useAuthStore();
  const showSidebar = isAuthenticated && !noSidebarPages.includes(location.pathname);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Navbar />
      <div style={{
        maxWidth: 1200, margin: '0 auto',
        padding: '72px 16px 32px',
        display: 'flex', gap: 20,
      }}>
        {/* Sidebar — hidden on mobile */}
        {showSidebar && (
          <div style={{ display: 'block' }} className="sidebar-wrapper">
            <Sidebar />
          </div>
        )}
        <main style={{ flex: 1, minWidth: 0 }}>
          {children}
        </main>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .sidebar-wrapper { display: none !important; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Layout;