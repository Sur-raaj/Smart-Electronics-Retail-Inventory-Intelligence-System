import React, { useState } from 'react';
import { Heart, GitCompare, ShoppingCart, User, Search } from 'lucide-react';

const ElectroNestbar = () => {
  const [searchFocused, setSearchFocused] = useState(false);
    

  const navItems = [
    'All Products',
    'Accessories',
    'Audio',
    'Cameras',
    'Drones',
    'Gaming Consoles',
    'Laptops',
    'Smart Home',
    'Smartphones',
    'Tablets',
    'Wearables'     
   
    
  ];

  return (
    <nav className="navbar">
      {/* Top Bar */}
      <div className="navbar-top">
        {/* Logo */}
        <div className="logo">
          <div className="logo-icon">
            <span className="logo-text">EN</span>
          </div>
          <span className="logo-brand">
            Electro<span className="logo-brand-accent">Nest</span>
          </span>
        </div>

        {/* Search Bar */}
        <div className={`search-container ${searchFocused ? 'focused' : ''}`}>
          <input
            type="text"
            placeholder="Search for laptops, phones, accessories..."
            className="search-input"
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
          <button className="search-button">
            <Search size={20} />
          </button>
        </div>

        {/* Right Icons */}
        <div className="navbar-actions">
          <button className="icon-button" aria-label="Wishlist">
            <Heart size={20} />
            <span className="badge">1</span>
          </button>
          <button className="icon-button" aria-label="Compare">
            <GitCompare size={20} />
          </button>
          <button className="icon-button" aria-label="Cart">
            <ShoppingCart size={20} />
            <span className="badge">17</span>
          </button>
          <button className="sign-in-button">
            <User size={18} />
            <span>Sign In</span>
          </button>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="navbar-links">
        {navItems.map((item, index) => (
          <a
            key={index}
            href="#"
            className="nav-link"
          >
            {item}
          </a>
        ))}
      </div>

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700&display=swap');

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .navbar {
          font-family: 'Sora', sans-serif;
          background: linear-gradient(135deg, #ffffff 0%, #fafafa 100%);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
          position: sticky;
          top: 0;
          z-index: 1000;
          width: 100%;
        }

        .navbar-top {
          display: grid;
          grid-template-columns: auto 1fr auto;
          align-items: center;
          padding: 1rem 2.5rem;
          gap: 3rem;
          border-bottom: 1px solid #f0f0f0;
          width: 100%;
        }

        /* Logo Styles */
        .logo {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          cursor: pointer;
          transition: transform 0.3s ease;
          flex-shrink: 0;
        }

        .logo:hover {
          transform: scale(1.02);
        }

        .logo-icon {
          width: 50px;
          height: 50px;
          background: linear-gradient(135deg, #020024,#090979,#00D4FF);
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 15px rgba(37, 99, 235, 0.3);
          transition: all 0.3s ease;
        }

        .logo:hover .logo-icon {
          box-shadow: 0 6px 20px rgba(37, 99, 235, 0.4);
          transform: translateY(-2px);
        }

        .logo-text {
          font-size: 1.25rem;
          font-weight: 700;
          color: white;
        }

        .logo-brand {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1a1a1a;
          letter-spacing: -0.02em;
        }

        .logo-brand-accent {
          color: #0c51e6;
        }

        /* Search Bar */
        .search-container {
          width: 100%;
          max-width: 600px;
          position: relative;
          display: flex;
          align-items: center;
          justify-self: center;
          transition: all 0.3s ease;
        }

        .search-container.focused {
          transform: translateY(-1px);
        }

        .search-input {
          width: 100%;
          padding: 0.875rem 1.25rem;
          padding-right: 4rem;
          border: 2px solid #e8e8e8;
          border-radius: 12px;
          font-size: 0.95rem;
          font-family: 'Sora', sans-serif;
          transition: all 0.3s ease;
          background: #fafafa;
          color: #333;
        }

        .search-input:focus {
          outline: none;
          border-color: #2563eb;
          background: white;
          box-shadow: 0 4px 20px rgba(37, 99, 235, 0.1);
        }

        .search-input::placeholder {
          color: #999;
        }

        .search-button {
          position: absolute;
          right: 6px;
          width: 44px;
          height: 44px;
          background: linear-gradient(135deg, #2563eb 0%, #2144a5 100%);
          border: none;
          border-radius: 10px;
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          box-shadow: 0 2px 8px rgba(37, 99, 235, 0.3);
        }

        .search-button:hover {
          transform: scale(1.05);
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4);
        }

        .search-button:active {
          transform: scale(0.98);
        }

        /* Action Icons */
        .navbar-actions {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-shrink: 0;
        }

        .icon-button {
          position: relative;
          width: 40px;
          height: 40px;
          background: transparent;
          border: none;
          border-radius: 8px;
          color: #555;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }

        .icon-button:hover {
          background: transparent;
          color: #2563eb;
          transform: scale(1.3);
        }

        .badge {
          position: absolute;
          top: -6px;
          right: -6px;
          background: linear-gradient(135deg, rgb(235, 37, 37) 0%, #d8073b 100%);
          color: white;
          font-size: 0.7rem;
          font-weight: 700;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 8px rgba(37, 99, 235, 0.4);
        }

        .sign-in-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
          color: white;
          border: none;
          border-radius: 10px;
          font-size: 0.95rem;
          font-weight: 600;
          font-family: 'Sora', sans-serif;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(37, 99, 235, 0.3);
        }

        .sign-in-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(37, 99, 235, 0.4);
        }

        .sign-in-button:active {
          transform: translateY(0);
        }

        /* Navigation Links */
        .navbar-links {
          display: flex;
          align-items: center;
          gap: 0;
          padding: 0 2.5rem 1rem;
          overflow-x: auto;
          scrollbar-width: none;
        }

        .navbar-links::-webkit-scrollbar {
          display: none;
        }

        .nav-link {
          padding: 0.625rem 1rem;
          color: #666;
          text-decoration: none;
          font-size: 0.9rem;
          font-weight: 500;
          white-space: nowrap;
          border-radius: 8px;
          transition: all 0.3s ease;
          position: relative;
        }

        .nav-link::before {
          content: '';
          position: absolute;
          bottom: -1rem;
          left: 50%;
          transform: translateX(-50%) scaleX(0);
          width: 30px;
          height: 3px;
          background: linear-gradient(90deg, #2563eb 0%, #1d4ed8 100%);
          border-radius: 2px;
          transition: transform 0.3s ease;
        }

        .nav-link:hover {
          color: #2563eb;
          background: #eff6ff;
        }

        .nav-link:hover::before {
          transform: translateX(-50%) scaleX(1);
        }

        /* Responsive Design */
        @media (max-width: 1200px) {
          .navbar-top {
            padding: 1rem 2rem;
            gap: 2.5rem;
          }
          
          .search-container {
            max-width: 550px;
          }
          
          .navbar-links {
            padding: 0 2rem 1rem;
          }
        }

        @media (max-width: 968px) {
          .navbar-top {
            padding: 1rem 1.5rem;
            gap: 2rem;
          }

          .search-container {
            max-width: 450px;
          }

          .navbar-actions {
            gap: 0.5rem;
          }

          .icon-button {
            width: 36px;
            height: 36px;
          }

          .sign-in-button {
            padding: 0.625rem 1rem;
            font-size: 0.875rem;
          }
          
          .navbar-links {
            padding: 0 1.5rem 1rem;
          }
        }

        @media (max-width: 768px) {
          .navbar-top {
            grid-template-columns: auto 1fr auto;
            padding: 1rem;
            gap: 1rem;
          }

          .logo-brand {
            font-size: 1.25rem;
          }

          .search-container {
            max-width: none;
          }

          .navbar-links {
            padding: 0 1rem 1rem;
            gap: 0;
          }

          .nav-link {
            padding: 0.5rem 0.875rem;
            font-size: 0.85rem;
          }
        }

        @media (max-width: 580px) {
          .navbar-top {
            grid-template-columns: auto 1fr;
            grid-template-rows: auto auto;
            gap: 0.75rem;
          }
          
          .logo {
            grid-column: 1;
            grid-row: 1;
          }
          
          .navbar-actions {
            grid-column: 2;
            grid-row: 1;
            justify-self: end;
          }
          
          .search-container {
            grid-column: 1 / -1;
            grid-row: 2;
          }

          .logo-brand {
            display: none;
          }

          .sign-in-button span {
            display: none;
          }

          .sign-in-button {
            width: 36px;
            padding: 0.625rem;
            justify-content: center;
          }
          
          .icon-button {
            width: 34px;
            height: 34px;
          }
          
          .navbar-links {
            padding: 0 1rem 0.75rem;
          }
          
          .nav-link {
            padding: 0.5rem 0.75rem;
          }
        }
      `}</style>
    </nav>
  );
};

export default ElectroNestbar;  