import React, { useState, useEffect } from 'react';
import { 
  Package, RefreshCw, FileText, MapPin, Search, 
  Bell, LogOut, User, Phone, UserCircle 
} from 'lucide-react';

export default function Warehouses() {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWarehouses = async () => {
      try {
        setLoading(true);
        // Replace with: http://localhost:5000/api/warehouse/locations
        const response = await fetch('http://localhost:5000/api/warehouse/locations');
        const data = await response.json();
        setLocations(data);
      } catch (err) {
        console.error("Database Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchWarehouses();
  }, []);

  if (loading) return <div className="warehouse-loader">Loading Facility Data...</div>;

  return (
    <div className="warehouse-layout">
      {/* Shared Sidebar */}
      <aside className="warehouse-sidebar">
        <div className="brand-section">
          <div className="brand-logo">EN</div>
          <span className="brand-name">Electro<span>Nest</span></span>
        </div>
        <div className="sidebar-menu">
          <p className="menu-label">Warehouse Ops</p>
          <nav>
            <div className="menu-item"><Package size={19} /> <span>Inventory</span></div>
            <div className="menu-item"><RefreshCw size={19} /> <span>Stock Movements</span></div>
            <div className="menu-item"><FileText size={19} /> <span>Purchase Orders</span></div>
            <div className="menu-item active"><MapPin size={19} /> <span>Warehouses</span></div>
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

      {/* Main Panel */}
      <main className="main-panel">
        <header className="panel-header">
          <div className="header-left">
            <h1>Warehouse Locations</h1>
            <p>Manage warehouse facilities and capacity</p>
          </div>
          <div className="header-right">
            <button className="icon-btn"><Bell size={20}/></button>
            <div className="profile-badge">
              <User size={16}/> <span>Mike</span>
            </div>
          </div>
        </header>

        <section className="location-grid">
          {locations.map((loc, i) => {
            const capacityPercent = Math.round((loc.used / loc.total) * 100);
            
            return (
              <div key={i} className="location-card">
                <div className="card-top">
                  <div className="loc-icon-box">
                    <Package size={22} color="#5b47fb" />
                  </div>
                  <div className="loc-title">
                    <h3>{loc.name}</h3>
                    <p className="loc-id">{loc.id}</p>
                  </div>
                </div>

                <div className="loc-details">
                  <div className="detail-item">
                    <MapPin size={16} /> <span>{loc.address}</span>
                  </div>
                  <div className="detail-item">
                    <UserCircle size={16} /> <span>{loc.manager}</span>
                  </div>
                  <div className="detail-item">
                    <Phone size={16} /> <span>{loc.phone}</span>
                  </div>
                </div>

                <div className="capacity-section">
                  <div className="capacity-header">
                    <span>Capacity</span>
                    <span className="percent">{capacityPercent}%</span>
                  </div>
                  <div className="capacity-bar">
                    <div 
                      className="capacity-fill" 
                      style={{ width: `${capacityPercent}%` }}
                    ></div>
                  </div>
                  <div className="capacity-footer">
                    <span>{loc.used.toLocaleString()} used</span>
                    <span>{loc.total.toLocaleString()} total</span>
                  </div>
                </div>

                <div className="tag-container">
                  {loc.tags.map((tag, index) => (
                    <span key={index} className="category-tag">{tag}</span>
                  ))}
                </div>
              </div>
            );
          })}
        </section>
      </main>

      <style jsx>{`
        .warehouse-layout { display: flex; min-height: 100vh; background: #F9FAFB; font-family: 'Inter', sans-serif; }
        
        /* Sidebar Styling */
        .warehouse-sidebar { width: 260px; background: white; border-right: 1px solid #E5E7EB; display: flex; flex-direction: column; padding: 24px; position: sticky; top: 0; height: 100vh; }
        .brand-section { display: flex; align-items: center; gap: 10px; margin-bottom: 40px; }
        .brand-logo { background: #F97316; color: white; padding: 6px 10px; border-radius: 8px; font-weight: 800; }
        .brand-name { font-weight: 700; font-size: 1.2rem; color: #111827; }
        .brand-name span { color: #F97316; }
        .menu-item { display: flex; align-items: center; gap: 12px; padding: 12px; border-radius: 8px; color: #6B7280; cursor: pointer; transition: 0.2s; margin-bottom: 4px; }
        .menu-item.active { background: #FFF7ED; color: #F97316; border-right: 4px solid #F97316; font-weight: 600; }

        /* Main Panel Styling */
        .main-panel { flex: 1; display: flex; flex-direction: column; }
        .panel-header { padding: 32px; display: flex; justify-content: space-between; align-items: center; }
        .panel-header h1 { font-size: 1.5rem; font-weight: 700; margin: 0; color: #111827; }
        .panel-header p { color: #6B7280; margin: 4px 0 0 0; font-size: 0.9rem; }

        .location-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(380px, 1fr)); gap: 24px; padding: 0 32px 40px; }
        .location-card { background: white; border: 1px solid #E5E7EB; border-radius: 16px; padding: 24px; transition: 0.2s; }
        .location-card:hover { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05); }

        .card-top { display: flex; align-items: center; gap: 16px; margin-bottom: 20px; }
        .loc-icon-box { background: #EEF2FF; padding: 12px; border-radius: 12px; }
        .loc-title h3 { font-size: 1.05rem; margin: 0; color: #111827; }
        .loc-id { font-size: 0.75rem; color: #9CA3AF; margin: 2px 0 0; font-weight: 600; }

        .loc-details { border-bottom: 1px solid #F3F4F6; padding-bottom: 20px; margin-bottom: 20px; }
        .detail-item { display: flex; align-items: center; gap: 10px; color: #6B7280; font-size: 0.9rem; margin-bottom: 8px; }

        .capacity-section { margin-bottom: 20px; }
        .capacity-header { display: flex; justify-content: space-between; font-size: 0.85rem; font-weight: 600; color: #9CA3AF; margin-bottom: 10px; }
        .capacity-header .percent { color: #F97316; }
        .capacity-bar { height: 10px; background: #F3F4F6; border-radius: 10px; overflow: hidden; margin-bottom: 8px; }
        .capacity-fill { height: 100%; background: #F97316; border-radius: 10px; }
        .capacity-footer { display: flex; justify-content: space-between; font-size: 0.8rem; color: #9CA3AF; }

        .tag-container { display: flex; flex-wrap: wrap; gap: 8px; }
        .category-tag { background: #F0F7FF; color: #3b82f6; font-size: 0.75rem; font-weight: 600; padding: 4px 12px; border-radius: 20px; }

        .warehouse-loader { height: 100vh; display: flex; justify-content: center; align-items: center; color: #F97316; font-weight: 800; }
      `}</style>
    </div>
  );
}