import { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import './App.css'
import Navbar from './components/Common/Navbar'
import Footer from './components/Common/Footer'
import Home from './pages/Home'
import Wishlist from './pages/Customer/Wishlist'

function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [pathname])

  return null
}

export default function App() {
  return (
    <div className="App">
      <ScrollToTop />
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/wishlist" element={<Wishlist />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}