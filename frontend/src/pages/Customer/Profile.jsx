// c:\Users\Sushant\OneDrive\Desktop\WApython\Smart-Electronics-Retail-Inventory-Intelligence-System\frontend\src\pages\Customer\Profile.jsx

import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, MapPin, LogOut, Package } from 'lucide-react';

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(180deg, #fff7ed 0%, #ffffff 35%)",
    padding: "48px 24px",
  },
  container: {
    maxWidth: 800,
    margin: "0 auto",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 32,
  },
  title: {
    fontSize: "2rem",
    fontWeight: 800,
    color: "#1e293b",
  },
  card: {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: 20,
    padding: 32,
    boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
    marginBottom: 24,
  },
  avatarSection: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginBottom: 32,
    borderBottom: "1px solid #f1f5f9",
    paddingBottom: 32,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: "50%",
    background: "#fff7ed",
    border: "2px solid #fed7aa",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#F97316",
    marginBottom: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: 700,
    color: "#1e293b",
  },
  userRole: {
    fontSize: 14,
    color: "#64748b",
    marginTop: 4,
    background: "#f1f5f9",
    padding: "4px 12px",
    borderRadius: 999,
    fontWeight: 600,
  },
  infoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: 24,
  },
  infoItem: {
    display: "flex",
    alignItems: "flex-start",
    gap: 12,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    background: "#f8fafc",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#64748b",
  },
  label: {
    fontSize: 13,
    color: "#94a3b8",
    fontWeight: 600,
    marginBottom: 4,
  },
  value: {
    fontSize: 15,
    color: "#1e293b",
    fontWeight: 500,
  },
  logoutBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "12px 24px",
    background: "#fef2f2",
    color: "#ef4444",
    border: "1px solid #fecaca",
    borderRadius: 12,
    fontSize: 15,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s",
  },
};

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div style={{ ...styles.page, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>Please log in to view your profile.</p>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <section style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>My Profile</h1>
        </div>

        <div style={styles.card}>
          <div style={styles.avatarSection}>
            <div style={styles.avatar}>
              <User size={48} />
            </div>
            <h2 style={styles.userName}>{user.firstName} {user.lastName}</h2>
            <span style={styles.userRole}>Customer</span>
          </div>

          <div style={styles.infoGrid}>
            <div style={styles.infoItem}>
              <div style={styles.iconBox}><Mail size={20} /></div>
              <div>
                <div style={styles.label}>Email Address</div>
                <div style={styles.value}>{user.email}</div>
              </div>
            </div>
            
            <div style={styles.infoItem}>
              <div style={styles.iconBox}><Phone size={20} /></div>
              <div>
                <div style={styles.label}>Phone Number</div>
                <div style={styles.value}>{user.phone || "Not provided"}</div>
              </div>
            </div>

            <div style={styles.infoItem}>
              <div style={styles.iconBox}><MapPin size={20} /></div>
              <div>
                <div style={styles.label}>Address</div>
                <div style={styles.value}>{user.address || "Not provided"}</div>
              </div>
            </div>

            <div style={styles.infoItem}>
              <div style={styles.iconBox}><Package size={20} /></div>
              <div>
                <div style={styles.label}>Member Since</div>
                <div style={styles.value}>{new Date().toLocaleDateString()}</div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button 
            onClick={handleLogout}
            style={styles.logoutBtn}
            onMouseEnter={(e) => e.currentTarget.style.background = "#fee2e2"}
            onMouseLeave={(e) => e.currentTarget.style.background = "#fef2f2"}
          >
            <LogOut size={18} /> Sign Out
          </button>
        </div>
      </div>
    </section>
  );
}
