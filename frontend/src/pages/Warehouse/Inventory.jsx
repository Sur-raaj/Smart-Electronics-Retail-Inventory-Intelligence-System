import React, { useState, useEffect } from 'react';
import { 
  Package, RefreshCw, FileText, MapPin, 
  Search, Bell, LogOut, User, AlertTriangle, 
  CheckCircle, TrendingDown, XCircle 
} from 'lucide-react';

export default function Inventory() {
  const [data, setData] = useState({ stats: [], stockLevels: [], alerts: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Database Fetch Logic
  useEffect(() => {
    const fetchInventory = async () => {
      try {
        setLoading(true);
        // Replace with your actual backend endpoint
        const response = await fetch('http://localhost:5000/api/warehouse/inventory');
        if (!response.ok) throw new Error('Database connection failed');
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchInventory();
  }, []);

  if (loading) return <div className="loader">Syncing Warehouse Data...</div>;
  if (error) return <div className="error-screen">Error: {error}</div>;

  return (
    <div className="warehouse-layout">
      {/* Sidebar - ElectroNest Theme */}
      <aside className="warehouse-sidebar">
        <div className="brand-section">
          <div className="brand-logo">EN</div>
          <span className="brand-name">Electro<span>Nest</span></span>
        </div>
        
        <div className="sidebar-menu">
          <p className="menu-label">Warehouse Ops</p>
          <nav>
            <div className="menu-item active"><Package size={19} /> <span>Inventory</span></div>
            <div className="menu-item"><RefreshCw size={19} /> <span>Stock Movements</span></div>
            <div className="menu-item"><FileText size={19} /> <span>Purchase Orders</span></div>
            <div className="menu-item"><MapPin size={19} /> <span>Warehouses</span></div>
          </nav>
        </div>

        <div className="sidebar-footer">
          <div className="user-pill">
            <div className="u-avatar">MW</div>
            <div>
              <p className="u-name">Mike Warehouse</p>
              <p className="u-role">Manager</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-panel">
        <header className="panel-header">
           <div className="header-left">
             <h1>Inventory Dashboard</h1>
             <p>Real-time monitoring from Central Database</p>
           </div>
           <div className="header-right">
             <button className="icon-btn"><Search size={20}/></button>
             <button className="icon-btn"><Bell size={20}/></button>
             <div className="profile-badge">
               <User size={16}/> <span>Mike</span>
             </div>
           </div>
        </header>

        <section className="panel-content">
          {/* Top Stat Cards */}
          <div className="stats-grid">
            {data.stats.map((stat, i) => (
              <div key={i} className="stat-card">
                <div className="stat-icon" style={{ backgroundColor: stat.bg, color: stat.color }}>
                   {stat.label.includes('Total') && <Package size={24}/>}
                   {stat.label.includes('Healthy') && <CheckCircle size={24}/>}
                   {stat.label.includes('Low') && <TrendingDown size={24}/>}
                   {stat.label.includes('Critical') && <XCircle size={24}/>}
                </div>
                <div>
                  <p className="stat-label">{stat.label}</p>
                  <h3 className="stat-value">{stat.value}</h3>
                </div>
              </div>
            ))}
          </div>

          <div className="dashboard-main-grid">
            {/* Stock Levels (Left Column) */}
            <div className="levels-card">
              <h3>Stock Levels</h3>
              <div className="stock-list">
                {data.stockLevels.map((item, i) => {
                  const [current, max] = item.val.split('/').map(Number);
                  const percentage = max > 0 ? (current / max) * 100 : 0;
                  
                  return (
                    <div key={i} className="stock-row">
                      <div className="row-info">
                        <p><strong>{item.name}</strong> <span className="cat">{item.cat}</span></p>
                        <p className="qty-status">
                          <span className="qty-text">{item.val}</span>
                          <span className={`status-tag ${item.status.replace(/\s+/g, '-').toLowerCase()}`}>
                            {item.status}
                          </span>
                        </p>
                      </div>
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{ 
                            width: `${percentage}%`, 
                            backgroundColor: percentage === 0 ? '#E5E7EB' : '#F97316' 
                          }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Low Stock Alerts (Right Column) */}
            <div className="alerts-card">
              <h3><AlertTriangle size={18} color="#F97316"/> Low Stock Alerts</h3>
              <div className="alert-items">
                {data.alerts.map((alert, i) => (
                  <div key={i} className={`alert-box ${alert.type}`}>
                    <p className="alert-title">{alert.name}</p>
                    <p>Stock: <strong>{alert.current}</strong> / Min: <strong>{alert.min}</strong></p>
                    <p className="countdown" style={{ color: alert.type === 'danger' ? '#DC2626' : '#EA580C' }}>
                      {alert.message}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <style jsx>{`
        .warehouse-layout { display: flex; min-height: 100vh; background: #F9FAFB; font-family: 'Inter', sans-serif; }
        
        .warehouse-sidebar { width: 260px; background: white; border-right: 1px solid #E5E7EB; display: flex; flex-direction: column; padding: 24px; }
        .brand-section { display: flex; align-items: center; gap: 10px; margin-bottom: 40px; }
        .brand-logo { background: #F97316; color: white; padding: 6px 10px; border-radius: 8px; font-weight: 800; }
        .brand-name { font-weight: 700; font-size: 1.2rem; color: #111827; }
        .brand-name span { color: #F97316; }

        .menu-item { display: flex; align-items: center; gap: 12px; padding: 12px; border-radius: 8px; color: #6B7280; cursor: pointer; transition: 0.2s; margin-bottom: 4px; }
        .menu-item.active { background: #FFF7ED; color: #F97316; border-right: 4px solid #F97316; font-weight: 600; }
        .sidebar-footer { margin-top: auto; padding-top: 20px; border-top: 1px solid #F3F4F6; }
        .user-pill { display: flex; align-items: center; gap: 12px; }
        .u-avatar { background: #F97316; color: white; padding: 8px; border-radius: 50%; font-size: 0.8rem; font-weight: bold; }
        .u-name { font-weight: 600; font-size: 0.9rem; margin: 0; }
        .u-role { font-size: 0.75rem; color: #9CA3AF; margin: 0; }

        .main-panel { flex: 1; display: flex; flex-direction: column; }
        .panel-header { padding: 24px 32px; display: flex; justify-content: space-between; align-items: center; }
        .panel-header h1 { font-size: 1.5rem; font-weight: 700; margin: 0; }
        .panel-header p { color: #6B7280; margin: 4px 0 0 0; font-size: 0.9rem; }
        .header-right { display: flex; align-items: center; gap: 15px; }
        .icon-btn { background: white; border: 1px solid #E5E7EB; padding: 8px; border-radius: 8px; color: #6B7280; cursor: pointer; }
        .profile-badge { display: flex; align-items: center; gap: 8px; background: white; border: 1px solid #E5E7EB; padding: 6px 15px; border-radius: 20px; font-weight: 600; font-size: 0.9rem; }

        .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; padding: 0 32px 32px; }
        .stat-card { background: white; padding: 20px; border-radius: 12px; border: 1px solid #E5E7EB; display: flex; align-items: center; gap: 16px; transition: transform 0.2s; }
        .stat-card:hover { transform: translateY(-2px); }
        .stat-icon { padding: 12px; border-radius: 10px; }
        .stat-label { font-size: 0.85rem; color: #6B7280; margin: 0; }
        .stat-value { font-size: 1.5rem; font-weight: 700; margin: 4px 0 0 0; }

        .dashboard-main-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 24px; padding: 0 32px 40px; }
        .levels-card, .alerts-card { background: white; padding: 24px; border-radius: 16px; border: 1px solid #E5E7EB; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
        .levels-card h3, .alerts-card h3 { margin: 0 0 20px 0; font-size: 1.1rem; display: flex; align-items: center; gap: 10px; }
        
        .stock-row { margin-bottom: 20px; }
        .row-info { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
        .cat { color: #9CA3AF; font-weight: 400; font-size: 0.8rem; margin-left: 8px; }
        .progress-bar { height: 8px; background: #F3F4F6; border-radius: 10px; overflow: hidden; }
        .progress-fill { height: 100%; transition: 0.4s ease-in-out; }

        .status-tag { padding: 2px 10px; border-radius: 12px; font-size: 0.75rem; font-weight: 600; }
        .status-tag.in-stock { background: #DCFCE7; color: #16A34A; }
        .status-tag.out-of-stock { background: #FEE2E2; color: #DC2626; }

        .alert-box { padding: 16px; border-radius: 12px; margin-bottom: 12px; border-left: 4px solid; }
        .alert-box.warning { background: #FFFBEB; border-color: #F97316; }
        .alert-box.danger { background: #FEF2F2; border-color: #DC2626; }
        .alert-title { font-weight: 700; margin-bottom: 4px; font-size: 0.95rem; }
        .countdown { font-size: 0.85rem; margin-top: 8px; font-weight: 500; }

        .loader { height: 100vh; display: flex; justify-content: center; align-items: center; color: #F97316; font-weight: bold; }
      `}</style>
    </div>
  );
}