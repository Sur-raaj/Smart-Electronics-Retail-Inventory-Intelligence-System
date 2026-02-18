import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { Mail, Lock, User, MapPin, ArrowRight } from 'lucide-react';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate(); // Initialize navigate function
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    address: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // 1. Simulate API Call / Validation
    console.log(isLogin ? "Logging in..." : "Registering...", formData);

    // 2. Perform Redirection
    // In a real app, you'd do this inside a .then() or after an 'await'
    setTimeout(() => {
      alert(isLogin ? "Login Successful!" : "Account Created!");
      navigate('/'); // Redirect to the Home page
    }, 500); 
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <h2>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
          <p>{isLogin ? 'Enter your details to access your account' : 'Join us for a premium shopping experience'}</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {!isLogin && (
            <div className="input-group">
              <User size={20} className="input-icon" />
              <input 
                type="text" 
                name="fullName" 
                placeholder="Full Name" 
                onChange={handleChange} 
                required 
              />
            </div>
          )}

          <div className="input-group">
            <Mail size={20} className="input-icon" />
            <input 
              type="email" 
              name="email" 
              placeholder="Email Address" 
              onChange={handleChange} 
              required 
            />
          </div>

          {!isLogin && (
            <div className="input-group">
              <MapPin size={20} className="input-icon" />
              <input 
                type="text" 
                name="address" 
                placeholder="Full Address" 
                onChange={handleChange} 
                required 
              />
            </div>
          )}

          <div className="input-group">
            <Lock size={20} className="input-icon" />
            <input 
              type="password" 
              name="password" 
              placeholder="Password" 
              onChange={handleChange} 
              required 
            />
          </div>

          <button type="submit" className="submit-btn">
            {isLogin ? 'Sign In' : 'Sign Up'}
            <ArrowRight size={18} />
          </button>
        </form>

        <div className="login-footer">
          <p>
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button 
              type="button" 
              onClick={() => setIsLogin(!isLogin)} 
              className="toggle-btn"
            >
              {isLogin ? 'Sign Up' : 'Login'}
            </button>
          </p>
        </div>
      </div>

     <style jsx>{`
        .login-page {
            position: fixed; /* Fixes it to the viewport */
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            z-index: 9999; /* Ensures it is on top of everything */
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            margin: 0;
            padding: 0;
            }
        .login-card {
          background: white;
          padding: 2.5rem;
          border-radius: 16px;
          width: 100%;
          max-width: 450px;
          border: 1px solid #e0e0e0; /* Subtle light grey border */
          box-shadow: 0 10px 25px rgba(0,0,0,0.05); /* Soft shadow for depth */
        }
        .login-header { text-align: center; margin-bottom: 2rem; }
        .login-header h2 { font-size: 1.8rem; color: #1a1a1a; margin-bottom: 0.5rem; }
        .login-header p { color: #666; font-size: 0.95rem; }
        
        .input-group {
          position: relative;
          margin-bottom: 1.25rem;
        }
        .input-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #999;
        }
        .input-group input {
          width: 100%;
          padding: 0.8rem 1rem 0.8rem 2.8rem;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          font-size: 1rem;
          outline: none;
          transition: border-color 0.2s;
        }
        .input-group input:focus { border-color: #F97316; }

        .submit-btn {
          width: 100%;
          padding: 0.9rem;
          background: #F97316;
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          margin-top: 1rem;
        }
        .login-footer { text-align: center; margin-top: 1.5rem; color: #666; }
        .toggle-btn {
          background: none;
          border: none;
          color: #F97316;
          font-weight: 700;
          cursor: pointer;
          margin-left: 0.5rem;
        }
      `}</style>
    </div>
  );
}