import React, { useState } from 'react';
import { jobApi } from '../../api';
import './AuthPage.css';

const AuthPage = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.email || !formData.password) {
      setError('Email and password are required.');
      return;
    }
    if (!isLogin && !formData.name) {
      setError('Name is required to register.');
      return;
    }

    try {
      setIsLoading(true);
      let data;
      if (isLogin) {
        data = await jobApi.login(formData.email, formData.password);
      } else {
        data = await jobApi.register(formData.name, formData.email, formData.password);
      }
      // Store token and user info
      localStorage.setItem('jt_token', data.token);
      localStorage.setItem('jt_user', JSON.stringify({ name: data.name, email: data.email }));
      onAuthSuccess(data);
    } catch (err) {
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Job Tracker</h1>
          <p>{isLogin ? 'Welcome back! Sign in to continue.' : 'Create an account to get started.'}</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                name="name"
                className="input-field"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
          )}

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              className="input-field"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              className="input-field"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <button
            type="submit"
            className="auth-submit-btn"
            disabled={isLoading}
          >
            {isLoading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="auth-switch">
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
          <button onClick={() => { setIsLogin(!isLogin); setError(null); }}>
            {isLogin ? 'Sign up' : 'Sign in'}
          </button>
        </div>

        <div className="auth-branding">
          <span>Powered by Spring Boot + React + Gemini AI</span>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
