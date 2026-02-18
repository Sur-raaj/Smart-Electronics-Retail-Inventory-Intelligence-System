import { useEffect, useState } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import './App.css'
import Navbar from './components/Common/Navbar'
import Footer from './components/Common/Footer'
import Home from './pages/Home'
import Wishlist from './pages/Customer/Wishlist'
import Cart from './pages/Customer/Cart'
import Login from './pages/Customer/Login'
import Profile from './pages/Customer/Profile' // Assuming you'll create a profile page

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
  const [user, setUser] = useState(null); // Add user state
  
  const location = useLocation();
  // Check if current page is login to hide Navbar/Footer
  const isLoginPage = location.pathname === '/login';

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
  }

  const clearWishlist = () => setWishlistItems([])
  const clearCart = () => setCartItems([])

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
  }

  return (
    <div className="App">
      <ScrollToTop />
      
      {/* 1. Hide Navbar if on login page */}
      {!isLoginPage && (
        <Navbar 
          cartCount={cartItems.reduce((acc, item) => acc + item.quantity, 0)} 
          wishlistCount={wishlistItems.length} 
          user={user} 
        />
      )}

      <main className={isLoginPage ? "" : "main-content"}>
        <Routes>
          <Route path="/" element={<Home addToCart={addToCart} toggleWishlist={toggleWishlist} wishlistItems={wishlistItems} />} />
          <Route path="/wishlist" element={<Wishlist items={wishlistItems} removeFromWishlist={removeFromWishlist} addToCart={addToCart} clearWishlist={clearWishlist} moveAllToCart={moveAllToCart} />} />
          <Route path="/cart" element={<Cart cartItems={cartItems} updateCartQuantity={updateCartQuantity} removeFromCart={removeFromCart} clearCart={clearCart} />} />
          
          {/* 2. Pass setUser to Login so it can log the user in */}
          <Route path="/login" element={<Login setUser={setUser} />} />
          
          <Route path="/profile" element={<Profile user={user} />} />
        </Routes>
      </main>

      {/* 3. Hide Footer if on login page */}
      {!isLoginPage && <Footer />}
    </div>
  )
}