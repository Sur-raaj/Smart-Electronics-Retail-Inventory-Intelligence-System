import { useEffect, useState } from 'react'
import { Routes, Route, useLocation, Link } from 'react-router-dom'
import { X } from 'lucide-react'
import './App.css'
import Navbar from './components/Common/Navbar'
import Footer from './components/Common/Footer'
import { useAuth } from './context/AuthContext'
import Home from './pages/Home'
import Wishlist from './pages/Customer/Wishlist'
import Cart from './pages/Customer/Cart'
import Login from './pages/Customer/Login'
import Checkout from './pages/Customer/Checkout'
import Compare from './pages/Customer/Compare'
import Profile from './pages/Customer/Profile'

// Owner Pages
import OwnerDashboard from './pages/Owner/Dashboard'
import ProductManagement from './pages/Owner/ProductManagement'
import OrderManagement from './pages/Owner/OrderManagement'
import Analytics from './pages/Owner/Analytics'
import OwnerLayout from './components/Owner/OwnerLayout'

// Warehouse Pages
import WarehouseDashboard from './pages/Warehouse/Dashboard'
import InventoryManagement from './pages/Warehouse/InventoryManagement'
import StockMovements from './pages/Warehouse/StockMovements'
import LowStockAlerts from './pages/Warehouse/LowStockAlerts'
import WarehouseLayout from './components/warehouse/WarehouseLayout'

// Admin Pages
import AdminDashboard from './pages/Admin/Dashboard'
import UserManagement from './pages/Admin/UserManagement'
import SupplierManagement from './pages/Admin/SupplierManagement'
import SystemLogs from './pages/Admin/SystemLogs'
import AnalyticsSummary from './pages/Admin/AnalyticsSummary'
import AdminLayout from './components/admin/AdminLayout'

function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [pathname])

  return null
}

export default function App() {
  const [cartItems, setCartItems] = useState([])
  const [wishlistItems, setWishlistItems] = useState([])
  const [checkoutSelection, setCheckoutSelection] = useState([])
  const [pendingWishlistCheckoutIds, setPendingWishlistCheckoutIds] = useState([])
  const [compareItems, setCompareItems] = useState([])
  const [toasts, setToasts] = useState([])
  const { user } = useAuth()
  const location = useLocation()

  const addToast = (data) => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, ...data }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 3000)
  }

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }

  const addToCart = (product) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id)
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)
      }
      return [...prev, { ...product, quantity: 1 }]
    })
  }

  const removeFromCart = (id) => {
    setCartItems(prev => prev.filter(item => item.id !== id))
    setCheckoutSelection(prev => prev.filter(itemId => itemId !== id))
    setPendingWishlistCheckoutIds(prev => prev.filter(itemId => itemId !== id))
  }

  const updateCartQuantity = (id, quantity) => {
    if (quantity < 1) return
    setCartItems(prev => prev.map(item => item.id === id ? { ...item, quantity } : item))
  }

  const toggleWishlist = (product) => {
    setWishlistItems(prev => {
      const exists = prev.find(item => item.id === product.id)
      if (exists) {
        return prev.filter(item => item.id !== product.id)
      }
      return [...prev, { ...product, addedDaysAgo: 0, inStock: true, rating: product.rating || 4.5 }]
    })
  }

  const removeFromWishlist = (id) => {
    setWishlistItems(prev => prev.filter(item => item.id !== id))
    setPendingWishlistCheckoutIds(prev => prev.filter(itemId => itemId !== id))
  }

  const clearWishlist = () => {
    setWishlistItems([])
    setPendingWishlistCheckoutIds([])
  }

  const clearCart = () => {
    setCartItems([])
    setCheckoutSelection([])
  }

  const setCheckoutItems = (itemIds) => {
    setCheckoutSelection(itemIds)
    setPendingWishlistCheckoutIds([])
  }

  const buyNowFromWishlist = (product) => {
    addToCart(product)
    setCheckoutSelection([product.id])
    setPendingWishlistCheckoutIds([product.id])
  }

  const removePurchasedFromCart = (purchasedIds) => {
    if (!Array.isArray(purchasedIds) || purchasedIds.length === 0) return
    setCartItems(prev => prev.filter(item => !purchasedIds.includes(item.id)))
    setCheckoutSelection([])
    if (pendingWishlistCheckoutIds.length > 0) {
      setWishlistItems(prev => prev.filter(item => !(pendingWishlistCheckoutIds.includes(item.id) && purchasedIds.includes(item.id))))
    }
    setPendingWishlistCheckoutIds([])
  }

  const moveAllToCart = () => {
    setCartItems(prev => {
      const newCart = [...prev]
      wishlistItems.forEach(item => {
        const existingIndex = newCart.findIndex(ci => ci.id === item.id)
        if (existingIndex >= 0) {
          newCart[existingIndex] = { ...newCart[existingIndex], quantity: newCart[existingIndex].quantity + 1 }
        } else {
          newCart.push({ ...item, quantity: 1 })
        }
      })
      return newCart
    })
    setWishlistItems([])
    setPendingWishlistCheckoutIds([])
  }

  const toggleCompare = (product) => {
    const exists = compareItems.find(item => item.id === product.id)

    if (exists) {
      setCompareItems(prev => prev.filter(item => item.id !== product.id))
      addToast({ type: 'remove', product })
    } else {
      if (compareItems.length >= 3) {
        addToast({ type: 'warning', message: "You can compare up to 3 products only." })
      } else {
        setCompareItems(prev => [...prev, { ...product, rating: product.rating || 4.5, inStock: true }])
        addToast({ type: 'add', product })
      }
    }
  }

  const removeFromCompare = (id) => {
    setCompareItems(prev => prev.filter(item => item.id !== id))
  }

  const isOwnerRoute = location.pathname.startsWith('/owner');
  const isWarehouseRoute = location.pathname.startsWith('/warehouse');
  const isAdminRoute = location.pathname.startsWith('/admin');
  const hideCustomerChrome = isOwnerRoute || isWarehouseRoute || isAdminRoute;

  return (
    <div className="App">
      <ScrollToTop />
      {!hideCustomerChrome && (
        <Navbar cartCount={cartItems.reduce((acc, item) => acc + item.quantity, 0)} wishlistCount={wishlistItems.length} compareCount={compareItems.length} user={user} />
      )}
      <main className={hideCustomerChrome ? '' : 'main-content'}>
        <Routes>
          <Route path="/" element={<Home addToCart={addToCart} toggleWishlist={toggleWishlist} wishlistItems={wishlistItems} toggleCompare={toggleCompare} compareItems={compareItems} />} />
          <Route path="/wishlist" element={<Wishlist items={wishlistItems} removeFromWishlist={removeFromWishlist} addToCart={addToCart} clearWishlist={clearWishlist} moveAllToCart={moveAllToCart} buyNowFromWishlist={buyNowFromWishlist} />} />
          <Route path="/cart" element={<Cart cartItems={cartItems} updateCartQuantity={updateCartQuantity} removeFromCart={removeFromCart} clearCart={clearCart} checkoutSelection={checkoutSelection} setCheckoutItems={setCheckoutItems} />} />
          <Route path="/compare" element={<Compare items={compareItems} removeFromCompare={removeFromCompare} addToCart={addToCart} />} />
          <Route path="/checkout" element={<Checkout cartItems={cartItems} selectedIds={checkoutSelection} onPaymentSuccess={removePurchasedFromCart} />} />
          <Route path="/login" element={<Login />} />
          <Route path="/profile" element={<Profile />} />

          {/* Owner Routes — wrapped in OwnerLayout with its own navbar */}
          <Route path="/owner" element={<OwnerLayout />}>
            <Route path="dashboard" element={<OwnerDashboard />} />
            <Route path="products" element={<ProductManagement />} />
            <Route path="orders" element={<OrderManagement />} />
            <Route path="analytics" element={<Analytics />} />
          </Route>

          {/* Warehouse Routes — wrapped in WarehouseLayout with its own navbar */}
          <Route path="/warehouse" element={<WarehouseLayout />}>
            <Route path="dashboard" element={<WarehouseDashboard />} />
            <Route path="inventory" element={<InventoryManagement />} />
            <Route path="stock-movements" element={<StockMovements />} />
            <Route path="low-stock-alerts" element={<LowStockAlerts />} />
          </Route>

          {/* Admin Routes — wrapped in AdminLayout with its own navbar */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="suppliers" element={<SupplierManagement />} />
            <Route path="logs" element={<SystemLogs />} />
            <Route path="analytics" element={<AnalyticsSummary />} />
          </Route>
        </Routes>
      </main>
      {!hideCustomerChrome && <Footer />}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className="toast-message">
            {t.type === 'warning' ? (
              <span style={{ flex: 1, padding: '0 8px' }}>{t.message}</span>
            ) : (
              <>
                <img src={t.product.image} alt="" className="toast-img" />
                <div className="toast-info">
                  <span className="toast-price">{new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(t.product.price)}</span>
                  <span className="toast-desc" title={t.product.name}>{t.product.name}</span>
                </div>
                <span className="toast-status">
                  {t.type === 'add' ? 'Added to comparison' : 'Removed from comparison'}
                </span>
                <div className="toast-actions">
                  {t.type === 'add' && <Link to="/compare" className="toast-link">View Comparison</Link>}
                  <button onClick={() => removeToast(t.id)} className="toast-close">
                    <X size={16} />
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
      <style>{`
        .toast-container {
          position: fixed;
          bottom: 24px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 10000;
          display: flex;
          flex-direction: column;
          gap: 10px;
          pointer-events: none;
        }
        .toast-message {
          background: linear-gradient(to right, #ffffff, #f8fafc);
          color: #1e293b;
          padding: 12px 16px;
          border-radius: 12px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.15);
          font-size: 14px;
          font-weight: 500;
          animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          border: 1px solid rgba(255,255,255,0.5);
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: fit-content;
          pointer-events: auto;
        }
        .toast-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .toast-price {
          color: #16a34a;
          font-weight: 700;
          font-size: 14px;
        }
        .toast-desc {
          font-size: 12px;
          color: #64748b;
          max-width: 140px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .toast-status {
          font-size: 13px;
          color: #F97316;
          font-weight: 600;
          white-space: nowrap;
        }
        .toast-actions {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-left: 8px;
        }
        .toast-link {
          font-size: 13px;
          color: #F97316;
          text-decoration: none;
          font-weight: 600;
          white-space: nowrap;
        }
        .toast-img {
          width: 48px;
          height: 48px;
          border-radius: 8px;
          object-fit: cover;
          border: 2px solid rgba(255,255,255,0.15);
        }
        .toast-close {
          background: none;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          padding: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: all 0.2s;
        }
        .toast-close:hover {
          background: #f1f5f9;
          color: #ef4444;
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}