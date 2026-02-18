import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { Mail, Lock, User, MapPin, ArrowRight, Phone, Calendar, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate(); // Initialize navigate function
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');

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

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!isLogin) {
      const { password, confirmPassword, dob, email } = formData;

      // Age Validation
      const birthDate = new Date(dob);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }

      if (age < 16) {
        setError("Date is Invalid please keep your real date");
        return;
      }

      // Email Validation
      const emailRegex = /^[a-zA-Z0-9._%+-]+@(gmail\.com|.*\.edu\.np)$/;
      if (!emailRegex.test(email)) {
        setError("! Please Use Gmail or Educational mail");
        return;
      }
      
      // Password Validation: At least 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

      if (!passwordRegex.test(password)) {
        setError("Password must be at least 8 characters with uppercase, lowercase, number & special char.");
        return;
      }

      if (password !== confirmPassword) {
        setError("Password and Confirm Password do not match.");
        return;
      }
    }
    
    setError(''); // Clear error if validation passes

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

        <form onSubmit={handleSubmit} className="login-form">
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
              />
              <button type="button" className="eye-btn" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                {showConfirmPassword ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
            </div>
          )}

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
