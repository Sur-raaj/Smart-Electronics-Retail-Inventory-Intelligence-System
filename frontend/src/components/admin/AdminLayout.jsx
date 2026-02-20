import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AdminNavbar from './AdminNavbar';

export default function AdminLayout() {
  const { user, initialized } = useAuth();

  if (!initialized) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#F3F4F6' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '50px', height: '50px', border: '4px solid #e0e0e0', borderTop: '4px solid #DC2626', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ color: '#666', fontSize: '14px' }}>Initializing...</p>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="admin-layout">
      <AdminNavbar />
      <main className="admin-main-content">
        <Outlet />
      </main>
      <style>{`
        .admin-layout {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background: #F3F4F6;
        }
        .admin-main-content {
          flex: 1;
        }
      `}</style>
    </div>
  );
}
