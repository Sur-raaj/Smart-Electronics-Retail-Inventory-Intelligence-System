import React, { useState, useEffect } from 'react';
import { Package, RefreshCw, FileText, MapPin, Eye, Search, Bell, LogOut, ChevronLeft, User
} from 'lucide-react';

export default function PurchaseOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetching logic (placeholder for your DB fetch)
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/purchase-orders');
        const data = await response.json();
        setOrders(data);
      } catch (err) {
        console.error("Database error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Delivered': return { bg: '#F0FDF4', color: '#16A34A', border: '#DCFCE7' };
      case 'Shipped': return { bg: '#EFF6FF', color: '#2563EB', border: '#DBEAFE' };
      case 'Processing': return { bg: '#FFF7ED', color: '#EA580C', border: '#FFEDD5' };
      default: return { bg: '#F9FAFB', color: '#4B5563', border: '#F3F4F6' };
    }
  };

  if (loading) return <div className="loader">Loading Warehouse Data...</div>;

  return (
    <div className="warehouse-layout">
      {/* Sidebar - Matching your Navbar's dark/clean aesthetic */}
      <aside className="warehouse-sidebar">
        <div className="brand-section">
          <div className="brand-logo">EN</div>
          <span className="brand-name">Electro<span>Nest</span></span>
        </div>
        
        <div className="sidebar-menu">
          <p className="menu-label">Warehouse Management</p>
          <nav>
            <div className="menu-item"><Package size={19} /> <span>Inventory</span></div>
            <div className="menu-item"><RefreshCw size={19} /> <span>Stock Movements</span></div>
            <div className="menu-item active"><FileText size={19} /> <span>Purchase Orders</span></div>
            <div className="menu-item"><MapPin size={19} /> <span>Warehouses</span></div>
          </nav>
        </div>

        <div className="sidebar-user">
          <div className="user-icon"><User size={20} /></div>
          <div className="user-details">
            <p className="u-name">Admin Mike</p>
            <p className="u-role">Warehouse Ops</p>
          </div>
        </div>
      </aside>

      {/* Main Panel */}
      <div className="main-panel">
        <header className="panel-header">
          <div className="search-box">
            <Search size={18} />
            <input type="text" placeholder="Search orders..." />
          </div>
          <div className="header-right">
            <button className="icon-notify"><Bell size={20} /></button>
            <div className="profile-pill">
              <User size={16} />
              <span>Mike</span>
            </div>
          </div>
        </header>

        <main className="panel-content">
          <div className="content-heading">
            <div>
              <h1>Purchase Orders</h1>
              <p>Real-time data from your warehouse database</p>
            </div>
            <button className="add-btn">+ Create New PO</button>
          </div>

          <div className="table-card">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>PO ID</th>
                  <th>Supplier</th>
                  <th>Order Date</th>
                  <th>Expected</th>
                  <th>Status</th>
                  <th>Total Amount</th>
                  <th>View</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const style = getStatusStyle(order.status);
                  return (
                    <tr key={order.id}>
                      <td className="text-bold">{order.id}</td>
                      <td>{order.supplier}</td>
                      <td>{order.date}</td>
                      <td>{order.expected}</td>
                      <td>
                        <span className="badge" style={{ 
                          backgroundColor: style.bg, 
                          color: style.color,
                          border: `1px solid ${style.border}` 
                        }}>
                          {order.status}
                        </span>
                      </td>
                      <td className="text-bold">{order.total}</td>
                      <td><Eye size={18} className="view-link" /></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </main>
      </div>

      <style jsx>{`
        .warehouse-layout { display: flex; min-height: 100vh; background: #FDFDFD; font-family: 'Poppins', sans-serif; }
        
        /* Sidebar - ElectroNest Themed */
        .warehouse-sidebar { width: 260px; background: #111827; color: white; display: flex; flex-direction: column; padding: 20px; }
        .brand-section { display: flex; align-items: center; gap: 10px; margin-bottom: 40px; padding-left: 10px; }
        .brand-logo { background: #F97316; padding: 5px 10px; border-radius: 6px; font-weight: 800; font-size: 1.2rem; }
        .brand-name { font-weight: 700; font-size: 1.3rem; letter-spacing: -0.5px; }
        .brand-name span { color: #F97316; }

        .menu-label { font-size: 0.7rem; color: #6B7280; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 15px; padding-left: 10px; }
        .menu-item { display: flex; align-items: center; gap: 12px; padding: 12px 15px; border-radius: 8px; color: #9CA3AF; cursor: pointer; transition: 0.3s; margin-bottom: 5px; }
        .menu-item:hover { background: #1F2937; color: white; }
        .menu-item.active { background: #F97316; color: white; font-weight: 600; }

        /* Main Content */
        .main-panel { flex: 1; display: flex; flex-direction: column; }
        .panel-header { height: 70px; background: white; border-bottom: 1px solid #E5E7EB; display: flex; align-items: center; justify-content: space-between; padding: 0 30px; }
        .search-box { display: flex; align-items: center; gap: 10px; background: #F3F4F6; padding: 8px 15px; border-radius: 10px; width: 300px; }
        .search-box input { border: none; background: transparent; outline: none; font-size: 0.9rem; width: 100%; }
        
        .header-right { display: flex; align-items: center; gap: 20px; }
        .profile-pill { display: flex; align-items: center; gap: 8px; background: #F3F4F6; padding: 6px 15px; border-radius: 20px; font-weight: 600; font-size: 0.9rem; }

        .panel-content { padding: 30px; }
        .content-heading { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 30px; }
        .content-heading h1 { font-size: 1.8rem; font-weight: 700; color: #111827; margin: 0; }
        .content-heading p { color: #6B7280; margin: 5px 0 0 0; }
        .add-btn { background: #F97316; color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; transition: 0.3s; }
        .add-btn:hover { background: #EA580C; }

        /* Table Card */
        .table-card { background: white; border-radius: 15px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); border: 1px solid #E5E7EB; overflow: hidden; }
        .custom-table { width: 100%; border-collapse: collapse; }
        .custom-table th { text-align: left; padding: 15px 20px; background: #F9FAFB; font-size: 0.8rem; text-transform: uppercase; color: #6B7280; border-bottom: 1px solid #E5E7EB; }
        .custom-table td { padding: 18px 20px; border-bottom: 1px solid #F3F4F6; font-size: 0.95rem; color: #374151; }
        .text-bold { font-weight: 600; color: #111827; }
        .badge { padding: 5px 12px; border-radius: 6px; font-size: 0.75rem; font-weight: 700; }
        .view-link { color: #9CA3AF; cursor: pointer; transition: 0.2s; }
        .view-link:hover { color: #F97316; }

        .loader { height: 100vh; display: flex; justify-content: center; align-items: center; font-weight: 700; color: #F97316; font-size: 1.2rem; }
      `}</style>
    </div>
  );
}