import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { FiSearch, FiHeart, FiShoppingCart, FiUser, FiChevronDown, FiBarChart2 } from 'react-icons/fi'

const navItems = [
  { label: 'Home', path: '/' },
  { label: 'Laptops', path: '/products?cat=Laptops' },
  { label: 'Smartphones', path: '/products?cat=Smartphones' },
  {label : 'Gaming', path: '/products?cat=Gaming'},
  {label : 'Tablets', path: '/products?cat=Tablets'},
  { label: 'Smart Home', path: '/products?cat=Smart Home' },
  { label: 'Headphones', path: '/products?cat=Headphones' },
  {label : 'Display', path: '/products?cat=Display'},
  { label: 'Cameras', path: '/products?cat=Cameras' },
  {label : 'Drones', path: '/products?cat=Drones'},
  {label : 'Smart Watches', path: '/products?cat=Smart Watches'},
  {label : 'Speakers', path: '/products?cat=Speakers'},
  { label: 'Accessories', path: '/products?cat=Accessories' },
]

export default function Navbar({ cartCount = 0, wishlistCount = 0, compareCount = 0, user = null}) {
  const [searchFocused, setSearchFocused] = useState(false)
  const [searchVal, setSearchVal] = useState('')
  const location = useLocation()

  return (
    <>
      {/* Announcement Bar */}
      <div className="announce-bar">
        Free shipping on orders over ₹5000 &nbsp;·&nbsp; Use code <strong>&nbsp;TECH20&nbsp;</strong> for 20% off
      </div>

      <nav className="navbar">
        {/* Main Top Row */}
        <div className="navbar-top">

          {/* Logo */}
          <Link to="/" className="logo">
            <div className="logo-icon">
              <span>EN</span>
            </div>
            <div className="logo-text">
              <span className="logo-name">Electro<span className="logo-accent">Nest</span></span>
              <span className="logo-tagline">Premium Electronics</span>
            </div>
          </Link>

          {/* Search */}
          <div className={`search-wrap ${searchFocused ? 'active' : ''}`}>
            <input
              type="text"
              value={searchVal}
              onChange={e => setSearchVal(e.target.value)}
              placeholder="Search laptops, phones, accessories..."
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
            />
            {searchVal && (
              <button className="search-clear" onClick={() => setSearchVal('')}>✕</button>
            )}
            <button className="search-btn"><FiSearch size={18} /></button>
          </div>

          {/* Actions */}
          <div className="nav-actions">
            <Link to="/compare" className="action-btn" aria-label="Compare">
              <FiBarChart2 size={20} />
              <span className="action-label">Compare</span>
              {compareCount > 0 && <span className="action-badge">{compareCount}</span>}
            </Link>
            <Link to="/wishlist" className="action-btn" aria-label="Wishlist">
              <FiHeart size={20} />
              <span className="action-label">Wishlist</span>
              {wishlistCount > 0 && <span className="action-badge">{wishlistCount}</span>}
            </Link>
            <Link to="/cart" className="action-btn" aria-label="Cart">
              <FiShoppingCart size={20} />
              <span className="action-label">Cart</span>
              {cartCount > 0 && <span className="action-badge">{cartCount}</span>}
            </Link>
            <div className="divider" />
            {user ? (
              <Link to="/profile" className="signin-btn">
                <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#F97316', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.7rem', fontWeight: 'bold' }}>
                  {user.firstName?.charAt(0)}
                </div>
                <span>{user.firstName}</span>
              </Link>
            ) : (
              <Link to="/login" className="signin-btn">
                <FiUser size={17} />
                <span>Sign In</span>
                <FiChevronDown size={14} />
              </Link>
            )}
          </div>
        </div>

        {/* Category Nav */}
        <div className="nav-strip">
          <div className="nav-strip-inner">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path || location.search.includes(item.path.split('?')[1] || '___')
              return (
                <Link
                  key={item.label}
                  to={item.path}
                  className={`nav-link ${isActive ? 'nav-link-active' : ''}`}
                >
                  {item.label}
                </Link>
              )
            })}
          </div>
        </div>
      </nav>

      <style>{`
        /* ── Announcement Bar ── */
        .announce-bar {
          background: #F97316;
          color: #fff;
          font-size: 0.78rem;
          font-weight: 500;
          text-align: center;
          padding: 0.4rem 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          letter-spacing: 0.01em;
        }

        /* ── Navbar Shell ── */
        .navbar {
          background: #232F3E;
          border-bottom: 1px solid rgba(0,0,0,0.1);
          box-shadow: 0 1px 3px rgba(0,0,0,0.12);
          position: sticky;
          top: 0;
          z-index: 100;
          width: 100%;
        }

        /* ── Top Row ── */
        .navbar-top {
          display: flex;
          align-items: center;
          padding: 0.6rem 2rem;
          gap: 1.25rem;
        }

        /* ── Logo ── */
        .logo {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          text-decoration: none;
          flex-shrink: 0;
        }

        .logo-icon {
          width: 38px;
          height: 38px;
          background: #F97316;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .logo-icon span {
          color: #fff;
          font-weight: 700;
          font-size: 0.9rem;
        }

        .logo-text {
          display: flex;
          flex-direction: column;
          line-height: 1.15;
        }

        .logo-name {
          font-size: 1.15rem;
          font-weight: 700;
          color: #fff;
          letter-spacing: -0.02em;
        }

        .logo-accent {
          color: #F97316;
        }

        .logo-tagline {
          font-size: 0.62rem;
          font-weight: 400;
          color: rgba(255,255,255,0.5);
          letter-spacing: 0.03em;
          text-transform: uppercase;
        }

        /* ── Search (Amazon-style) ── */
        .search-wrap {
          flex: 1;
          display: flex;
          align-items: center;
          background: #fff;
          border: 2px solid transparent;
          border-radius: 6px;
          padding: 0 0 0 0.85rem;
          transition: border-color 0.15s;
          height: 40px;
          overflow: hidden;
        }

        .search-wrap.active {
          border-color: #F97316;
        }

        .search-wrap input {
          flex: 1;
          border: none;
          background: transparent;
          font-size: 0.88rem;
          font-family: inherit;
          color: #1e293b;
          outline: none;
          min-width: 0;
          height: 100%;
        }

        .search-wrap input::placeholder {
          color: #94a3b8;
        }

        .search-clear {
          background: none;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          font-size: 0.75rem;
          padding: 0.2rem 0.5rem;
          line-height: 1;
          flex-shrink: 0;
        }

        .search-clear:hover {
          color: #475569;
        }

        .search-btn {
          background: #F97316;
          color: #fff;
          border: none;
          border-radius: 0 4px 4px 0;
          padding: 0 1rem;
          height: 100%;
          cursor: pointer;
          flex-shrink: 0;
          transition: background 0.15s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .search-btn:hover {
          background: #ea580c;
        }

        /* ── Actions ── */
        .nav-actions {
          display: flex;
          align-items: center;
          gap: 0.15rem;
          flex-shrink: 0;
        }

        .action-btn {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.1rem;
          padding: 0.35rem 0.7rem;
          background: transparent;
          border: none;
          border-radius: 6px;
          color: rgba(255,255,255,0.8);
          cursor: pointer;
          transition: color 0.15s, background 0.15s;
          font-family: inherit;
        }

        .action-btn:hover {
          background: rgba(255,255,255,0.08);
          color: #fff;
        }

        .action-label {
          font-size: 0.65rem;
          font-weight: 500;
          color: inherit;
          line-height: 1;
        }

        .action-badge {
          position: absolute;
          top: 0;
          right: 4px;
          background: #F97316;
          color: #fff;
          font-size: 0.58rem;
          font-weight: 700;
          min-width: 16px;
          height: 16px;
          border-radius: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 3px;
          border: 1.5px solid #232F3E;
        }

        .divider {
          width: 1px;
          height: 26px;
          background: rgba(255,255,255,0.15);
          margin: 0 0.4rem;
          flex-shrink: 0;
        }

        .signin-btn {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.45rem 0.9rem;
          background: transparent;
          color: rgba(255,255,255,0.85);
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 6px;
          font-size: 0.82rem;
          font-weight: 500;
          font-family: inherit;
          cursor: pointer;
          transition: color 0.15s, border-color 0.15s, background 0.15s;
          white-space: nowrap;
        }

        .signin-btn:hover {
          border-color: rgba(255,255,255,0.4);
          color: #fff;
          background: rgba(255,255,255,0.06);
        }

        /* ── Category Strip ── */
        .nav-strip {
          background: #37475A;
        }

        .nav-strip-inner {
          display: flex;
          align-items: center;
          padding: 0 2rem;
          overflow-x: auto;
          scrollbar-width: none;
          gap: 0;
        }

        .nav-strip-inner::-webkit-scrollbar {
          display: none;
        }

        .nav-link {
          position: relative;
          padding: 0.55rem 0.9rem;
          color: rgba(255,255,255,0.8);
          text-decoration: none;
          font-size: 0.82rem;
          font-weight: 400;
          white-space: nowrap;
          transition: color 0.15s;
        }

        .nav-link::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%) scaleX(0);
          width: 80%;
          height: 2px;
          background: #F97316;
          transition: transform 0.15s ease;
        }

        .nav-link:hover {
          color: #fff;
        }

        .nav-link:hover::after {
          transform: translateX(-50%) scaleX(1);
        }

        .nav-link-active {
          color: #fff;
          font-weight: 600;
        }

        .nav-link-active::after {
          transform: translateX(-50%) scaleX(1);
        }

        /* ── Responsive ── */
        @media (max-width: 900px) {
          .navbar-top {
            padding: 0.6rem 1rem;
            gap: 0.75rem;
          }
          .logo-tagline { display: none; }
          .action-label { display: none; }
          .action-btn { padding: 0.4rem; }
        }

        @media (max-width: 640px) {
          .logo-text { display: none; }
          .search-wrap { flex: 1; }
          .signin-btn span:not(:first-child) { display: none; }
        }
      `}</style>
    </>
  )
}