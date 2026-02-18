import { useEffect, useState } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import './App.css'
import Navbar from './components/Common/Navbar'
import Footer from './components/Common/Footer'
import Home from './pages/Home'
import Wishlist from './pages/Customer/Wishlist'
import Cart from './pages/Customer/Cart'
import Checkout from './pages/Customer/Checkout'

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

  const clearWishlist = () => {
    setWishlistItems([])
  }

  const clearCart = () => {
    setCartItems([])
    setCheckoutSelection([])
  }

  const setCheckoutItems = (itemIds) => {
    setCheckoutSelection(itemIds)
  }

  const removePurchasedFromCart = (purchasedIds) => {
    if (!Array.isArray(purchasedIds) || purchasedIds.length === 0) return
    setCartItems(prev => prev.filter(item => !purchasedIds.includes(item.id)))
    setCheckoutSelection([])
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
  }

  return (
    <div className="App">
      <ScrollToTop />
      <Navbar cartCount={cartItems.reduce((acc, item) => acc + item.quantity, 0)} wishlistCount={wishlistItems.length} />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home addToCart={addToCart} toggleWishlist={toggleWishlist} wishlistItems={wishlistItems} />} />
          <Route path="/wishlist" element={<Wishlist items={wishlistItems} removeFromWishlist={removeFromWishlist} addToCart={addToCart} clearWishlist={clearWishlist} moveAllToCart={moveAllToCart} />} />
          <Route path="/cart" element={<Cart cartItems={cartItems} updateCartQuantity={updateCartQuantity} removeFromCart={removeFromCart} clearCart={clearCart} checkoutSelection={checkoutSelection} setCheckoutItems={setCheckoutItems} />} />
          <Route path="/checkout" element={<Checkout cartItems={cartItems} selectedIds={checkoutSelection} onPaymentSuccess={removePurchasedFromCart} />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}