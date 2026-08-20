import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Lock, Mail, User } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { authService } from '../../services/auth.service';

const Login = ({ onLogin }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        await authService.register(name, email, password);
      } else {
        await authService.login(email, password);
      }
      onLogin();
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || (isSignUp ? 'Registration failed.' : 'Invalid email or password.'));
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setError('');
  };

  return (
    <div className="login-page-wrapper">
      <div className="login-card-container">
        <div className="login-brand">
          <TrendingUp className="login-brand-icon" size={32} />
          <h1 className="login-brand-name">StockFlow</h1>
          <p className="login-brand-tagline">Smart Inventory & Restock Management</p>
        </div>

        <div className="login-card">
          <div className="login-card-header">
            <h2>{isSignUp ? 'Create Shopkeeper Account' : 'Welcome Back'}</h2>
            <p>{isSignUp ? 'Enter your store details to set up your account' : 'Please enter your store credentials to sign in'}</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            {error && <div className="login-error-alert">{error}</div>}

            {isSignUp && (
              <Input
                label="Full Name / Store Owner"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ramesh Kumar"
                icon={<User size={18} />}
                required
              />
            )}
            
            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. store@stockflow.com"
              icon={<Mail size={18} />}
              required
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              icon={<Lock size={18} />}
              required
            />

            <Button 
              type="submit" 
              variant="primary" 
              loading={loading} 
              className="login-submit-btn"
            >
              {isSignUp ? 'Create Account' : 'Sign In'}
            </Button>
          </form>

          <div style={{ marginTop: '1.25rem', textAlign: 'center', fontSize: '0.875rem' }}>
            <span style={{ color: 'var(--text-muted, #64748b)' }}>
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            </span>
            <button
              type="button"
              onClick={toggleMode}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--primary-color, #4f6ef2)',
                fontWeight: 600,
                cursor: 'pointer',
                padding: 0,
                textDecoration: 'underline'
              }}
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
