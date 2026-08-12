import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Lock, Mail } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('store@stockflow.com');
  const [password, setPassword] = useState('password');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Mock verification
    setTimeout(() => {
      if (email === 'store@stockflow.com' && password === 'password') {
        onLogin();
        navigate('/dashboard');
      } else {
        setError('Invalid email or password.');
      }
      setLoading(false);
    }, 800);
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
            <h2>Welcome Back</h2>
            <p>Please enter your store credentials to sign in</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            {error && <div className="login-error-alert">{error}</div>}
            
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
              Sign In
            </Button>
          </form>
        </div>
        
        <div className="login-footer">
          <p>Demo Login: store@stockflow.com / password</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
