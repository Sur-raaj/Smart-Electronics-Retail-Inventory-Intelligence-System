import { Routes, Route } from 'react-router-dom'
import './App.css'
import Navbar from './components/Common/Navbar'
import Footer from './components/Common/Footer'
import Home from './pages/Home'

export default function App() {
  return (
    <div className="App">
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}