import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, BarChart3, LogOut, Bell, Store, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useState, useRef, useEffect } from 'react';

const ownerLinks = [
  { label: 'Dashboard', path: '/owner/dashboard', icon: LayoutDashboard },
  { label: 'Products', path: '/owner/products', icon: Package },
  { label: 'Orders', path: '/owner/orders', icon: ShoppingCart },
  { label: 'Analytics', path: '/owner/analytics', icon: BarChart3 },
];

export default function OwnerNavbar() {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef(null);

  // Get display name and initials from user context
  const displayName = user?.firstName
    ? `${user.firstName}${user.lastName ? ' ' + user.lastName : ''}`
    : 'Owner';
  const avatarInitial = user?.firstName ? user.firstName.charAt(0).toUpperCase() : 'O';
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
      <div className="owner-topbar">
        <div className="owner-topbar-inner">
          <div className="owner-topbar-left">
            <Store size={13} />
            <span>ElectroNest Owner Panel</span>
          </div>
          <div className="owner-topbar-right">
            <span className="owner-store-status"><span className="status-dot" /> Store Online</span>
          </div>
        </div>
      </div>

      <nav className="owner-navbar">
        <div className="owner-navbar-inner">
          {/* Logo */}
          <Link to="/owner/dashboard" className="owner-nav-logo">
            <div className="owner-nav-logo-icon"><span>EN</span></div>
            <div className="owner-nav-logo-text">
              <span className="owner-nav-logo-name">Electro<span className="owner-nav-accent">Nest</span></span>
              <span className="owner-nav-logo-tag">Management</span>
            </div>
          </Link>

          {/* Nav Links */}
          <div className="owner-nav-links">
            {ownerLinks.map((link) => {
              const isActive = pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`owner-nav-link ${isActive ? 'active' : ''}`}
                >
                  <link.icon size={17} />
                  <span>{link.label}</span>
                  {isActive && <div className="owner-nav-underline" />}
                </Link>
              );
            })}
          </div>

          {/* Right section */}
          <div className="owner-nav-right">
            {/* Notification Bell */}
            <button className="owner-nav-icon-btn" title="Notifications">
              <Bell size={19} />
              <span className="owner-notif-dot" />
            </button>

            {/* Divider */}
            <div className="owner-nav-divider" />

            {/* User Dropdown */}
            <div className="owner-nav-user-wrap" ref={menuRef}>
              <button className="owner-nav-user-btn" onClick={() => setShowUserMenu(!showUserMenu)}>
                <div className="owner-nav-avatar">
                  <span>{avatarInitial}</span>
                </div>
                <div className="owner-nav-user-info">
                  <span className="owner-nav-user-name">{displayName}</span>
                  <span className="owner-nav-user-role">Administrator</span>
                </div>
                <ChevronDown size={14} className={`owner-chevron ${showUserMenu ? 'open' : ''}`} />
              </button>

              {showUserMenu && (
                <div className="owner-nav-dropdown">
                  <div className="owner-dropdown-header">
                    <div className="owner-dropdown-avatar">{avatarInitial}</div>
                    <div>
                      <div className="owner-dropdown-name">{displayName}</div>
                      <div className="owner-dropdown-email">{displayEmail}</div>
                    </div>
                  </div>
                  <div className="owner-dropdown-divider" />
                  <Link to="/owner/dashboard" className="owner-dropdown-item" onClick={() => setShowUserMenu(false)}>
                    <LayoutDashboard size={15} /> Dashboard
                  </Link>
                  <Link to="/owner/analytics" className="owner-dropdown-item" onClick={() => setShowUserMenu(false)}>
                    <BarChart3 size={15} /> Analytics
                  </Link>
                  <div className="owner-dropdown-divider" />
                  <button className="owner-dropdown-item logout" onClick={handleLogout}>
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
        .owner-topbar {
          background: #1a242f;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .owner-topbar-inner {
          max-width: 1400px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.35rem 2rem;
          font-size: 0.7rem;
          color: rgba(255,255,255,0.5);
        }
        .owner-topbar-left {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-weight: 500;
        }
        .owner-topbar-right {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .owner-store-status {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          font-weight: 600;
          color: #4ade80;
        }
        .status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #4ade80;
          box-shadow: 0 0 6px rgba(74,222,128,0.5);
          animation: pulse-dot 2s infinite;
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        /* ── Main Navbar ── */
        .owner-navbar {
          background: #232F3E;
          border-bottom: 3px solid #F97316;
          position: sticky;
          top: 0;
          z-index: 100;
          width: 100%;
          box-shadow: 0 2px 12px rgba(0,0,0,0.15);
        }
        .owner-navbar-inner {
          max-width: 1400px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          padding: 0 2rem;
          height: 58px;
          gap: 1.5rem;
        }

        /* ── Logo ── */
        .owner-nav-logo {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          text-decoration: none;
          flex-shrink: 0;
        }
        .owner-nav-logo-icon {
          width: 36px;
          height: 36px;
          background: linear-gradient(135deg, #F97316, #ea580c);
          border-radius: 9px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 8px rgba(249,115,22,0.3);
        }
        .owner-nav-logo-icon span {
          color: #fff;
          font-weight: 800;
          font-size: 0.82rem;
          letter-spacing: -0.02em;
        }
        .owner-nav-logo-text {
          display: flex;
          flex-direction: column;
          line-height: 1.15;
        }
        .owner-nav-logo-name {
          font-size: 1.1rem;
          font-weight: 700;
          color: #fff;
          letter-spacing: -0.02em;
        }
        .owner-nav-accent { color: #F97316; }
        .owner-nav-logo-tag {
          font-size: 0.58rem;
          font-weight: 700;
          color: rgba(249,115,22,0.8);
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        /* ── Nav Links ── */
        .owner-nav-links {
          display: flex;
          align-items: center;
          gap: 0.15rem;
          flex: 1;
          margin-left: 1rem;
        }
        .owner-nav-link {
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
        .owner-nav-link:hover {
          background: rgba(255,255,255,0.07);
          color: rgba(255,255,255,0.95);
        }
        .owner-nav-link.active {
          background: rgba(249,115,22,0.12);
          color: #F97316;
          font-weight: 600;
        }
        .owner-nav-underline {
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
        .owner-nav-right {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-shrink: 0;
        }
        .owner-nav-icon-btn {
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
        .owner-nav-icon-btn:hover {
          background: rgba(255,255,255,0.08);
          color: #fff;
        }
        .owner-notif-dot {
          position: absolute;
          top: 7px;
          right: 8px;
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #ef4444;
          border: 1.5px solid #232F3E;
        }

        .owner-nav-divider {
          width: 1px;
          height: 28px;
          background: rgba(255,255,255,0.1);
          margin: 0 0.3rem;
        }

        /* ── User Dropdown ── */
        .owner-nav-user-wrap {
          position: relative;
        }
        .owner-nav-user-btn {
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
        .owner-nav-user-btn:hover {
          background: rgba(255,255,255,0.1);
          border-color: rgba(255,255,255,0.15);
        }
        .owner-nav-avatar {
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
        .owner-nav-user-info {
          display: flex;
          flex-direction: column;
          text-align: left;
          line-height: 1.2;
        }
        .owner-nav-user-name {
          font-size: 0.8rem;
          font-weight: 600;
          color: #fff;
        }
        .owner-nav-user-role {
          font-size: 0.65rem;
          color: rgba(255,255,255,0.45);
          font-weight: 500;
        }
        .owner-chevron {
          color: rgba(255,255,255,0.4);
          transition: transform 0.2s;
        }
        .owner-chevron.open {
          transform: rotate(180deg);
        }

        /* ── Dropdown Menu ── */
        .owner-nav-dropdown {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          width: 220px;
          background: #fff;
          border-radius: 12px;
          box-shadow: 0 12px 40px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05);
          padding: 0.4rem;
          animation: dropIn 0.2s ease;
          z-index: 200;
        }
        @keyframes dropIn {
          from { opacity: 0; transform: translateY(-6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .owner-dropdown-header {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          padding: 0.7rem 0.75rem;
        }
        .owner-dropdown-avatar {
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
        .owner-dropdown-name {
          font-size: 0.85rem;
          font-weight: 600;
          color: #1e293b;
        }
        .owner-dropdown-email {
          font-size: 0.72rem;
          color: #94a3b8;
        }
        .owner-dropdown-divider {
          height: 1px;
          background: #f1f5f9;
          margin: 0.25rem 0.5rem;
        }
        .owner-dropdown-item {
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
        .owner-dropdown-item:hover {
          background: #f8fafc;
          color: #1e293b;
        }
        .owner-dropdown-item.logout {
          color: #ef4444;
        }
        .owner-dropdown-item.logout:hover {
          background: #fef2f2;
          color: #dc2626;
        }

        /* ── Responsive ── */
        @media (max-width: 768px) {
          .owner-topbar-inner { padding: 0.3rem 1rem; }
          .owner-navbar-inner {
            padding: 0 1rem;
            gap: 0.75rem;
          }
          .owner-nav-logo-text { display: none; }
          .owner-nav-link span { display: none; }
          .owner-nav-link { padding: 0.5rem 0.65rem; }
          .owner-nav-user-info { display: none; }
          .owner-chevron { display: none; }
          .owner-nav-links { margin-left: 0; }
          .owner-topbar-left span { display: none; }
        }
      `}</style>
    </>
  );
}
