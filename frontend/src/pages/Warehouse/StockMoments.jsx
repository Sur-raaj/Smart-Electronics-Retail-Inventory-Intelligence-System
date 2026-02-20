import React, { useState, useEffect } from 'react';
import { 
  Package, RefreshCw, FileText, MapPin, Search, 
  Bell, LogOut, User, ArrowUpRight, ArrowDownLeft, AlertCircle 
} from 'lucide-react';

export default function StockMovements() {
  const [movements, setMovements] = useState([]);
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Replace with your actual backend fetch: http://localhost:5000/api/stock-movements
    const fetchData = async () => {
      try {
        setLoading(true);
        // Simulated fetch for demonstration
        const response = await fetch('http://localhost:5000/api/warehouse/stock-movements');
        const data = await response.json();
        setMovements(data);
      } catch (err) {
        console.error("Database Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getMovementIcon = (type) => {
    switch (type) {
      case 'IN': return <ArrowDownLeft size={20} color="#16A34A" />;
      case 'OUT': return <ArrowUpRight size={20} color="#2563EB" />;
      case 'DAMAGE': return <AlertCircle size={20} color="#DC2626" />;
      default: return <RefreshCw size={20} color="#6B7280" />;
    }
  };

  const filteredMovements = filter === 'All' 
    ? movements 
    : movements.filter(m => m.type === filter.toUpperCase().replace('STOCK ', ''));

  if (loading) return <div className="warehouse-loader">Accessing Transaction Logs...</div>;

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
            <div className="menu-item active"><RefreshCw size={19} /> <span>Stock Movements</span></div>
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

      {/* Main Panel */}
      <main className="main-panel">
        <header className="panel-header">
           <div className="header-left">
             <h1>Stock Movements</h1>
             <p>Track all inventory transactions</p>
           </div>
           <div className="header-right">
             <div className="filter-tabs">
               {['All', 'Stock In', 'Stock Out', 'Damage', 'Adjustment'].map(tab => (
                 <button 
                   key={tab} 
                   className={`tab-btn ${filter === tab ? 'active' : ''}`}
                   onClick={() => setFilter(tab)}
                 >
                   {tab}
                 </button>
               ))}
             </div>
             <button className="icon-btn"><Bell size={20}/></button>
           </div>
        </header>

        <section className="movement-list">
          {filteredMovements.map((item, i) => (
            <div key={i} className="movement-card">
              <div className="movement-icon-box">
                {getMovementIcon(item.type)}
              </div>
              <div className="movement-main">
                <div className="item-info">
                  <h3>{item.productName}</h3>
                  <p>{item.reason}</p>
                </div>
                <div className="status-badge-container">
                   <span className={`type-tag ${item.type.toLowerCase()}`}>{item.type}</span>
                </div>
                <div className="quantity-change">
                   <span className={item.quantity > 0 ? 'pos' : 'neg'}>
                     {item.quantity > 0 ? `+${item.quantity}` : item.quantity}
                   </span>
                </div>
                <div className="movement-meta">
                  <p className="date">{item.date}</p>
                  <p className="person">{item.user}</p>
                </div>
                <div className="ref-id">
                  <p>{item.refId}</p>
                </div>
              </div>
            </div>
          ))}
        </section>
      </main>

      <style jsx>{`
        .warehouse-layout { display: flex; min-height: 100vh; background: #F9FAFB; font-family: 'Inter', sans-serif; }
        
        .warehouse-sidebar { width: 260px; background: white; border-right: 1px solid #E5E7EB; display: flex; flex-direction: column; padding: 24px; position: sticky; top: 0; height: 100vh; }
        .brand-section { display: flex; align-items: center; gap: 10px; margin-bottom: 40px; }
        .brand-logo { background: #F97316; color: white; padding: 6px 10px; border-radius: 8px; font-weight: 800; }
        .brand-name { font-weight: 700; font-size: 1.2rem; color: #111827; }
        .brand-name span { color: #F97316; }
        .menu-item { display: flex; align-items: center; gap: 12px; padding: 12px; border-radius: 8px; color: #6B7280; cursor: pointer; transition: 0.2s; margin-bottom: 4px; }
        .menu-item.active { background: #FFF7ED; color: #F97316; border-right: 4px solid #F97316; font-weight: 600; }

        .main-panel { flex: 1; display: flex; flex-direction: column; }
        .panel-header { padding: 32px; display: flex; justify-content: space-between; align-items: center; }
        .panel-header h1 { font-size: 1.5rem; font-weight: 700; margin: 0; }
        
        .filter-tabs { display: flex; gap: 8px; background: #F3F4F6; padding: 4px; border-radius: 10px; }
        .tab-btn { border: none; padding: 8px 16px; border-radius: 8px; font-size: 0.85rem; font-weight: 600; color: #6B7280; cursor: pointer; transition: 0.2s; background: transparent; }
        .tab-btn.active { background: white; color: #F97316; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }

        .movement-list { padding: 0 32px 40px; }
        .movement-card { background: white; border: 1px solid #E5E7EB; border-radius: 12px; padding: 20px; display: flex; align-items: center; gap: 20px; margin-bottom: 12px; }
        .movement-icon-box { background: #F9FAFB; padding: 12px; border-radius: 10px; }
        
        .movement-main { display: grid; grid-template-columns: 2fr 1fr 1fr 1.5fr 1fr; width: 100%; align-items: center; }
        .item-info h3 { font-size: 1rem; margin: 0; color: #111827; }
        .item-info p { font-size: 0.85rem; color: #9CA3AF; margin: 4px 0 0; }

        .type-tag { font-size: 0.7rem; font-weight: 800; padding: 4px 8px; border-radius: 4px; }
        .type-tag.in { color: #16A34A; background: #DCFCE7; }
        .type-tag.out { color: #2563EB; background: #DBEAFE; }
        .type-tag.damage { color: #DC2626; background: #FEE2E2; }

        .quantity-change { font-size: 1.1rem; font-weight: 700; text-align: center; }
        .quantity-change .pos { color: #16A34A; }
        .quantity-change .neg { color: #111827; }

        .movement-meta p { margin: 0; font-size: 0.85rem; }
        .movement-meta .date { color: #111827; font-weight: 500; }
        .movement-meta .person { color: #9CA3AF; }
        .ref-id p { font-size: 0.75rem; color: #9CA3AF; text-align: right; }

        .warehouse-loader { height: 100vh; display: flex; justify-content: center; align-items: center; color: #F97316; font-weight: bold; }
      `}</style>
    </div>
  );
}