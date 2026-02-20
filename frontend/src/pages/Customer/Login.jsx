import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { Mail, Lock, User, MapPin, ArrowRight, Phone, Calendar, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import config from '../../Config/Config';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate(); // Initialize navigate function
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    address: '',
    phone: '',
    gender: '',
    dob: ''
  });

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const validateSignup = (normalizedEmail) => {
    const emailOk = /(@gmail\.com|\.edu\.np)$/i.test(normalizedEmail);
    if (!emailOk) return 'Email must end with @gmail.com or .edu.np';

    const strongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;
    if (!strongPassword.test(formData.password)) {
      return 'Password must be 8+ chars with uppercase, lowercase, number, and special character';
    }

    if (formData.password !== formData.confirmPassword) {
      return 'Password and confirm password do not match';
    }

    const phoneOk = /^\d{10}$/.test(formData.phone);
    if (!phoneOk) return 'Phone number must be exactly 10 digits';

    if (!formData.dob) return 'Date of birth is required';
    const today = new Date();
    const dob = new Date(formData.dob);
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age -= 1;
    }
    if (age < 16) return 'You must be at least 16 years old to sign up';

    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const normalizedEmail = formData.email.toLowerCase().trim();
    
    setError('');

    // ── Login validation ──
    if (isLogin) {
      if (!normalizedEmail) {
        setError('Email is required');
        return;
      }
      if (!formData.password) {
        setError('Password is required');
        return;
      }
    }

    // ── Signup validation ──
    if (!isLogin) {
      if (!formData.firstName.trim()) {
        setError('First name is required');
        return;
      }
      if (!formData.lastName.trim()) {
        setError('Last name is required');
        return;
      }
      const validationError = validateSignup(normalizedEmail);
      if (validationError) {
        setError(validationError);
        return;
      }
      if (!formData.address.trim()) {
        setError('Address is required');
        return;
      }
      if (!formData.gender) {
        setError('Please select your gender');
        return;
      }
    }

    setIsLoading(true);

    try {
      // ── All login/signup goes through backend API ──
      const API_BASE_URL = config.API_BASE_URL;
      const endpoint = isLogin ? '/auth/login/' : '/auth/signup/';

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(isLogin 
          ? { email: normalizedEmail, password: formData.password }
          : { ...formData, email: normalizedEmail }
        ),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || (isLogin ? 'Invalid email or password' : 'Signup failed'));
      }

      // ── Store JWT tokens ──
      if (data.access) {
        localStorage.setItem(config.AUTH_TOKEN_KEY, data.access);
      }
      if (data.refresh) {
        localStorage.setItem(config.REFRESH_TOKEN_KEY, data.refresh);
      }

      const userData = data.user || data;
      if (!userData.role) userData.role = 'customer';
      login(userData);

      // ── Redirect based on role ──
      if (userData.role === 'owner') {
        navigate('/owner/dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.message || "Failed to connect to the server.");
    } finally {
      setIsLoading(false);
    }
  };


  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      if (/^\d*$/.test(value) && value.length <= 10) {
        setFormData({ ...formData, [name]: value });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  return (
    <div className="login-page">
      {error && <div className="error-popup">{error}</div>}
      <div className="login-card">
        <div className="login-header">
          <h2>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
          <p>{isLogin ? 'Enter your details to access your account' : 'Join us for a premium shopping experience'}</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form" autoComplete="off">
          {!isLogin && (
            <>
              <div className="name-row">
                <div className="input-group">
                  <User size={20} className="input-icon" />
                  <input 
                    type="text" 
                    name="firstName" 
                    placeholder="First Name" 
                    value={formData.firstName}
                    onChange={handleChange} 
                    required 
                    autoComplete="off"
                  />
                </div>
                <div className="input-group">
                  <User size={20} className="input-icon" />
                  <input 
                    type="text" 
                    name="lastName" 
                    placeholder="Last Name" 
                    value={formData.lastName}
                    onChange={handleChange} 
                    required 
                    autoComplete="off"
                  />
                </div>
              </div>

              <div className="input-group">
                <Phone size={20} className="input-icon" />
                <span className="country-code">🇳🇵 +977</span>
                <input 
                  type="tel" 
                  name="phone" 
                  placeholder="Phone Number" 
                  value={formData.phone}
                  onChange={handleChange} 
                  className="phone-input"
                  required 
                  autoComplete="off"
                />
              </div>

              <div className="input-group">
                <Calendar size={20} className="input-icon" />
                <input 
                  type="date" 
                  name="dob" 
                  value={formData.dob}
                  onChange={handleChange} 
                  required 
                  className="date-input"
                />
              </div>

              <div className="input-group gender-group">
                <span className="gender-label">Gender</span>
                <div className="gender-options">
                  <label><input type="radio" name="gender" value="male" checked={formData.gender === 'male'} onChange={handleChange} required /> Male</label>
                  <label><input type="radio" name="gender" value="female" checked={formData.gender === 'female'} onChange={handleChange} required /> Female</label>
                  <label><input type="radio" name="gender" value="other" checked={formData.gender === 'other'} onChange={handleChange} required /> Other</label>
                </div>
              </div>
            </>
          )}

          <div className="input-group">
            <Mail size={20} className="input-icon" />
            <input 
              type="email" 
              name="email" 
              placeholder="Email Address" 
              value={formData.email}
              onChange={handleChange} 
              required 
              autoComplete={isLogin ? "username" : "off"}
            />
          </div>

          {!isLogin && (
            <div className="input-group">
              <MapPin size={20} className="input-icon" />
              <input 
                type="text" 
                name="address" 
                placeholder="Address" 
                value={formData.address}
                onChange={handleChange} 
                required 
                autoComplete="off"
              />
            </div>
          )}

          <div className="input-group">
            <Lock size={20} className="input-icon" />
            <input 
              type={showPassword ? "text" : "password"} 
              name="password" 
              placeholder="Password" 
              value={formData.password}
              onChange={handleChange} 
              required 
              autoComplete={isLogin ? "current-password" : "new-password"}
            />
            <button type="button" className="eye-btn" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
            </button>
          </div>

          {!isLogin && (
            <div className="input-group">
              <Lock size={20} className="input-icon" />
              <input 
                type={showConfirmPassword ? "text" : "password"} 
                name="confirmPassword" 
                placeholder="Confirm Password" 
                value={formData.confirmPassword}
                onChange={handleChange} 
                required 
                autoComplete="new-password"
              />
              <button type="button" className="eye-btn" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                {showConfirmPassword ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
            </div>
          )}

          <button type="submit" className="submit-btn" disabled={isLoading}>
            {isLoading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
            {!isLoading && <ArrowRight size={18} />}
          </button>
        </form>

        <div className="login-footer">
          <p>
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button 
              type="button" 
              onClick={() => {
                setIsLogin(!isLogin);
                setFormData({
                  firstName: '',
                  lastName: '',
                  email: '',
                  password: '',
                  confirmPassword: '',
                  address: '',
                  phone: '',
                  gender: '',
                  dob: ''
                });
                setError('');
              }} 
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
            width: 100%;
            height: 100%;
            z-index: 9999; /* Ensures it is on top of everything */
            display: flex;
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            margin: 0;
            padding: 1rem;
            overflow-y: auto;
            }
        .error-popup {
          position: fixed;
          top: 20px;
          left: 50%;
          transform: translateX(-50%);
          background-color: #bd4d4d;
          color: white;
          padding: 12px 24px;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
          z-index: 10000;
          font-weight: 600;
          font-size: 0.9rem;
          text-align: center;
          max-width: 90%;
        }
        .login-card {
          background: white;
          padding: 1.5rem;
          border-radius: 16px;
          width: 100%;
          max-width: 450px;
          border: 1px solid #e0e0e0; /* Subtle light grey border */
          box-shadow: 0 10px 25px rgba(0,0,0,0.05); /* Soft shadow for depth */
          margin: auto;
        }
        .login-header { text-align: center; margin-bottom: 1rem; }
        .login-header h2 { font-size: 1.5rem; color: #1a1a1a; margin-bottom: 0.25rem; }
        .login-header p { color: #666; font-size: 0.9rem; }
        
        .input-group {
          position: relative;
          margin-bottom: 0.8rem;
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
          padding: 0.6rem 2.5rem 0.6rem 2.8rem;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          font-size: 1rem;
          outline: none;
          transition: border-color 0.2s;
        }
        .input-group input:focus { border-color: #F97316; }

        .eye-btn {
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #999;
          cursor: pointer;
          padding: 0;
          display: flex;
        }
        .eye-btn:hover { color: #666; }

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
          margin-top: 0.5rem;
        }
        .submit-btn:disabled {
          background: #fdba74;
          cursor: not-allowed;
        }
        .login-footer { text-align: center; margin-top: 1rem; color: #666; }
        .toggle-btn {
          background: none;
          border: none;
          color: #F97316;
          font-weight: 700;
          cursor: pointer;
          margin-left: 0.5rem;
        }

        .name-row {
          display: flex;
          gap: 1rem;
        }
        
        .country-code {
          position: absolute;
          left: 40px;
          top: 50%;
          transform: translateY(-50%);
          color: #666;
          font-size: 0.9rem;
          font-weight: 500;
          pointer-events: none;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .phone-input {
          padding-left: 6.5rem !important;
        }

        .gender-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        
        .gender-label {
          font-size: 0.9rem;
          color: #666;
          font-weight: 500;
          margin-left: 4px;
        }

        .gender-options {
          display: flex;
          gap: 1.5rem;
          padding-left: 4px;
        }

        .gender-options label {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.95rem;
          color: #333;
          cursor: pointer;
        }

        .gender-options input[type="radio"] {
          accent-color: #F97316;
          width: auto;
          margin: 0;
        }

        @media (max-width: 480px) {
          .name-row {
            flex-direction: column;
            gap: 0;
          }
        }
      `}</style>
    </div>
  );
}
