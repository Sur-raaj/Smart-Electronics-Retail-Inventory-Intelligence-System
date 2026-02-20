import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, ArrowLeftRight, AlertTriangle, LogOut, Bell, Warehouse, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useState, useRef, useEffect } from 'react';

const warehouseLinks = [
  { label: 'Dashboard', path: '/warehouse/dashboard', icon: LayoutDashboard },
  { label: 'Inventory', path: '/warehouse/inventory', icon: Package },
  { label: 'Stock Movements', path: '/warehouse/stock-movements', icon: ArrowLeftRight },
  { label: 'Low Stock Alerts', path: '/warehouse/low-stock-alerts', icon: AlertTriangle },
];

export default function WarehouseNavbar() {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef(null);

  const displayName = user?.firstName
    ? `${user.firstName}${user.lastName ? ' ' + user.lastName : ''}`
    : 'Warehouse Manager';
  const avatarInitial = user?.firstName ? user.firstName.charAt(0).toUpperCase() : 'W';
  const displayEmail = user?.email || '';

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setShowUserMenu(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Accent Top Bar */}
      <div className="wh-topbar">
        <div className="wh-topbar-inner">
          <div className="wh-topbar-left">
            <Warehouse size={13} />
            <span>ElectroNest Warehouse Panel</span>
          </div>
          <div className="wh-topbar-right">
            <span className="wh-store-status"><span className="wh-status-dot" /> System Online</span>
          </div>
        </div>
      </div>

      <nav className="wh-navbar">
        <div className="wh-navbar-inner">
          {/* Logo */}
          <Link to="/warehouse/dashboard" className="wh-nav-logo">
            <div className="wh-nav-logo-icon"><span>EN</span></div>
            <div className="wh-nav-logo-text">
              <span className="wh-nav-logo-name">Electro<span className="wh-nav-accent">Nest</span></span>
              <span className="wh-nav-logo-tag">Warehouse</span>
            </div>
          </Link>

          {/* Nav Links */}
          <div className="wh-nav-links">
            {warehouseLinks.map((link) => {
              const isActive = pathname === link.path || pathname.startsWith(link.path + '/');
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`wh-nav-link ${isActive ? 'active' : ''}`}
                >
                  <link.icon size={17} />
                  <span>{link.label}</span>
                  {isActive && <div className="wh-nav-underline" />}
                </Link>
              );
            })}
          </div>

          {/* Right section */}
          <div className="wh-nav-right">
            <button className="wh-nav-icon-btn" title="Notifications">
              <Bell size={19} />
              <span className="wh-notif-dot" />
            </button>

            <div className="wh-nav-divider" />

            {/* User Dropdown */}
            <div className="wh-nav-user-wrap" ref={menuRef}>
              <button className="wh-nav-user-btn" onClick={() => setShowUserMenu(!showUserMenu)}>
                <div className="wh-nav-avatar">
                  <span>{avatarInitial}</span>
                </div>
                <div className="wh-nav-user-info">
                  <span className="wh-nav-user-name">{displayName}</span>
                  <span className="wh-nav-user-role">Warehouse Manager</span>
                </div>
                <ChevronDown size={14} className={`wh-chevron ${showUserMenu ? 'open' : ''}`} />
              </button>

              {showUserMenu && (
                <div className="wh-nav-dropdown">
                  <div className="wh-dropdown-header">
                    <div className="wh-dropdown-avatar">{avatarInitial}</div>
                    <div>
                      <div className="wh-dropdown-name">{displayName}</div>
                      <div className="wh-dropdown-email">{displayEmail}</div>
                    </div>
                  </div>
                  <div className="wh-dropdown-divider" />
                  <Link to="/warehouse/dashboard" className="wh-dropdown-item" onClick={() => setShowUserMenu(false)}>
                    <LayoutDashboard size={15} /> Dashboard
                  </Link>
                  <Link to="/warehouse/inventory" className="wh-dropdown-item" onClick={() => setShowUserMenu(false)}>
                    <Package size={15} /> Inventory
                  </Link>
                  <div className="wh-dropdown-divider" />
                  <button className="wh-dropdown-item logout" onClick={handleLogout}>
                    <LogOut size={15} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <style>{`
        /* ── Top Accent Bar ── */
        .wh-topbar {
          background: #1a242f;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .wh-topbar-inner {
          max-width: 1400px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.35rem 2rem;
          font-size: 0.7rem;
          color: rgba(255,255,255,0.5);
        }
        .wh-topbar-left {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-weight: 500;
        }
        .wh-topbar-right {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .wh-store-status {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          font-weight: 600;
          color: #4ade80;
        }
        .wh-status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #4ade80;
          box-shadow: 0 0 6px rgba(74,222,128,0.5);
          animation: wh-pulse-dot 2s infinite;
        }
        @keyframes wh-pulse-dot {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        /* ── Main Navbar ── */
        .wh-navbar {
          background: #232F3E;
          border-bottom: 3px solid #F97316;
          position: sticky;
          top: 0;
          z-index: 100;
          width: 100%;
          box-shadow: 0 2px 12px rgba(0,0,0,0.15);
        }
        .wh-navbar-inner {
          max-width: 1400px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          padding: 0 2rem;
          height: 58px;
          gap: 1.5rem;
        }

        /* ── Logo ── */
        .wh-nav-logo {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          text-decoration: none;
          flex-shrink: 0;
        }
        .wh-nav-logo-icon {
          width: 36px;
          height: 36px;
          background: linear-gradient(135deg, #F97316, #ea580c);
          border-radius: 9px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 8px rgba(249,115,22,0.3);
        }
        .wh-nav-logo-icon span {
          color: #fff;
          font-weight: 800;
          font-size: 0.82rem;
          letter-spacing: -0.02em;
        }
        .wh-nav-logo-text {
          display: flex;
          flex-direction: column;
          line-height: 1.15;
        }
        .wh-nav-logo-name {
          font-size: 1.1rem;
          font-weight: 700;
          color: #fff;
          letter-spacing: -0.02em;
        }
        .wh-nav-accent { color: #F97316; }
        .wh-nav-logo-tag {
          font-size: 0.58rem;
          font-weight: 700;
          color: rgba(249,115,22,0.8);
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        /* ── Nav Links ── */
        .wh-nav-links {
          display: flex;
          align-items: center;
          gap: 0.15rem;
          flex: 1;
          margin-left: 1rem;
        }
        .wh-nav-link {
          position: relative;
          display: flex;
          align-items: center;
          gap: 0.45rem;
          padding: 0.55rem 1.1rem;
          border-radius: 8px;
          color: rgba(255,255,255,0.65);
          text-decoration: none;
          font-size: 0.84rem;
          font-weight: 500;
          transition: all 0.2s ease;
          white-space: nowrap;
        }
        .wh-nav-link:hover {
          background: rgba(255,255,255,0.07);
          color: rgba(255,255,255,0.95);
        }
        .wh-nav-link.active {
          background: rgba(249,115,22,0.12);
          color: #F97316;
          font-weight: 600;
        }
        .wh-nav-underline {
          position: absolute;
          bottom: -12px;
          left: 50%;
          transform: translateX(-50%);
          width: 60%;
          height: 3px;
          background: #F97316;
          border-radius: 3px 3px 0 0;
        }

        /* ── Right Section ── */
        .wh-nav-right {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-shrink: 0;
        }
        .wh-nav-icon-btn {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 8px;
          background: transparent;
          color: rgba(255,255,255,0.65);
          border: none;
          cursor: pointer;
          transition: all 0.15s;
        }
        .wh-nav-icon-btn:hover {
          background: rgba(255,255,255,0.08);
          color: #fff;
        }
        .wh-notif-dot {
          position: absolute;
          top: 7px;
          right: 8px;
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #ef4444;
          border: 1.5px solid #232F3E;
        }

        .wh-nav-divider {
          width: 1px;
          height: 28px;
          background: rgba(255,255,255,0.1);
          margin: 0 0.3rem;
        }

        /* ── User Dropdown ── */
        .wh-nav-user-wrap {
          position: relative;
        }
        .wh-nav-user-btn {
          display: flex;
          align-items: center;
          gap: 0.55rem;
          padding: 0.3rem 0.6rem 0.3rem 0.3rem;
          border-radius: 10px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          cursor: pointer;
          transition: all 0.15s;
          font-family: inherit;
        }
        .wh-nav-user-btn:hover {
          background: rgba(255,255,255,0.1);
          border-color: rgba(255,255,255,0.15);
        }
        .wh-nav-avatar {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: linear-gradient(135deg, #F97316, #f59e0b);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          font-weight: 700;
          font-size: 0.8rem;
          box-shadow: 0 2px 6px rgba(249,115,22,0.25);
        }
        .wh-nav-user-info {
          display: flex;
          flex-direction: column;
          text-align: left;
          line-height: 1.2;
        }
        .wh-nav-user-name {
          font-size: 0.8rem;
          font-weight: 600;
          color: #fff;
        }
        .wh-nav-user-role {
          font-size: 0.65rem;
          color: rgba(255,255,255,0.45);
          font-weight: 500;
        }
        .wh-chevron {
          color: rgba(255,255,255,0.4);
          transition: transform 0.2s;
        }
        .wh-chevron.open {
          transform: rotate(180deg);
        }

        /* ── Dropdown Menu ── */
        .wh-nav-dropdown {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          width: 220px;
          background: #fff;
          border-radius: 12px;
          box-shadow: 0 12px 40px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05);
          padding: 0.4rem;
          animation: whDropIn 0.2s ease;
          z-index: 200;
        }
        @keyframes whDropIn {
          from { opacity: 0; transform: translateY(-6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .wh-dropdown-header {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          padding: 0.7rem 0.75rem;
        }
        .wh-dropdown-avatar {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          background: linear-gradient(135deg, #F97316, #f59e0b);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          font-weight: 700;
          font-size: 0.85rem;
          flex-shrink: 0;
        }
        .wh-dropdown-name {
          font-size: 0.85rem;
          font-weight: 600;
          color: #1e293b;
        }
        .wh-dropdown-email {
          font-size: 0.72rem;
          color: #94a3b8;
        }
        .wh-dropdown-divider {
          height: 1px;
          background: #f1f5f9;
          margin: 0.25rem 0.5rem;
        }
        .wh-dropdown-item {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          padding: 0.55rem 0.75rem;
          border-radius: 8px;
          font-size: 0.82rem;
          font-weight: 500;
          color: #475569;
          text-decoration: none;
          cursor: pointer;
          border: none;
          background: none;
          width: 100%;
          font-family: inherit;
          transition: background 0.12s;
        }
        .wh-dropdown-item:hover {
          background: #f8fafc;
          color: #1e293b;
        }
        .wh-dropdown-item.logout {
          color: #ef4444;
        }
        .wh-dropdown-item.logout:hover {
          background: #fef2f2;
          color: #dc2626;
        }

        /* ── Responsive ── */
        @media (max-width: 768px) {
          .wh-topbar-inner { padding: 0.3rem 1rem; }
          .wh-navbar-inner {
            padding: 0 1rem;
            gap: 0.75rem;
          }
          .wh-nav-logo-text { display: none; }
          .wh-nav-link span { display: none; }
          .wh-nav-link { padding: 0.5rem 0.65rem; }
          .wh-nav-user-info { display: none; }
          .wh-chevron { display: none; }
          .wh-nav-links { margin-left: 0; }
          .wh-topbar-left span { display: none; }
        }
      `}</style>
    </>
  );
}
