import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Lock, Mail, User, ShieldCheck, ArrowLeft, CheckCircle2 } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { authService } from '../../services/auth.service';

const Login = ({ onLogin }) => {
  // Email Form State
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Verification Challenge State
  const [requiresVerification, setRequiresVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  
  // 2FA Challenge State
  const [requires2FA, setRequires2FA] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');

  // Common UI State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const navigate = useNavigate();

  // Handle Email Login / Registration
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfoMessage('');
    setLoading(true);

    try {
      // 1. Submit Signup Email Verification Code
      if (requiresVerification) {
        await authService.verifyEmail(email, verificationCode);
        onLogin();
        navigate('/dashboard');
        return;
      }

      // 2. Submit 2-Step Login Verification Code
      if (requires2FA) {
        await authService.verify2FA(email, twoFactorCode);
        onLogin();
        navigate('/dashboard');
        return;
      }

      // 3. Register New Account
      if (isSignUp) {
        const res = await authService.register(name, email, password);
        if (res.requiresVerification || res.data?.requiresVerification) {
          setRequiresVerification(true);
          setInfoMessage(`Account created! A 6-digit verification code has been dispatched to your email inbox: ${email}`);
        }
      } else {
        // 4. Sign In
        const res = await authService.login(email, password);
        if (res.requiresVerification || res.data?.requiresVerification) {
          setRequiresVerification(true);
          setInfoMessage(`Account email is not verified yet. A 6-digit verification code was dispatched to ${email}.`);
        } else if (res.requires2FA || res.data?.requires2FA) {
          setRequires2FA(true);
          setInfoMessage('A 6-digit 2-step verification code has been dispatched to your email inbox.');
        } else {
          onLogin();
          navigate('/dashboard');
        }
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setError('');
    setInfoMessage('');
    setRequiresVerification(false);
    setRequires2FA(false);
  };

  return (
    <div className="login-page-wrapper">
      <div className="login-card-container">
        {/* Brand Header */}
        <div className="login-brand">
          <TrendingUp className="login-brand-icon" size={32} />
          <h1 className="login-brand-name">StockFlow</h1>
          <p className="login-brand-tagline">Smart Inventory & Restock Management</p>
        </div>

        <div className="login-card">
          <div className="login-card-header">
            {requiresVerification ? (
              <>
                <div style={{ display: 'inline-flex', padding: '10px', backgroundColor: '#f0fdf4', color: '#16a34a', borderRadius: '50%', marginBottom: '12px' }}>
                  <CheckCircle2 size={32} />
                </div>
                <h2>Verify Your Email</h2>
                <p>Account created! Enter the 6-digit activation code sent to <strong>{email}</strong></p>
              </>
            ) : requires2FA ? (
              <>
                <h2>2-Step Email Verification</h2>
                <p>Enter the 6-digit security code sent to <strong>{email}</strong></p>
              </>
            ) : (
              <>
                <h2>{isSignUp ? 'Create Shopkeeper Account' : 'Welcome Back'}</h2>
                <p>{isSignUp ? 'Enter your store details to set up your account' : 'Please enter your email & password to sign in'}</p>
              </>
            )}
          </div>

          {/* Feedback Alerts */}
          {error && <div className="login-error-alert">{error}</div>}
          {infoMessage && (
            <div style={{ padding: '10px 14px', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '6px', color: '#1e40af', fontSize: '13px', marginBottom: '16px' }}>
              {infoMessage}
            </div>
          )}

          {/* EMAIL AUTHENTICATION FORM */}
          <form onSubmit={handleSubmit} className="login-form">
            {requiresVerification ? (
              <>
                <Input
                  label="6-Digit Signup Verification Code"
                  type="text"
                  maxLength={6}
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="e.g. 123456"
                  icon={<ShieldCheck size={18} />}
                  required
                  autoFocus
                />

                <Button type="submit" variant="primary" loading={loading} className="login-submit-btn">
                  Verify Email &amp; Complete Sign In
                </Button>

                <div style={{ marginTop: '12px', textAlign: 'center' }}>
                  <button
                    type="button"
                    onClick={() => setRequiresVerification(false)}
                    style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                  >
                    <ArrowLeft size={14} /> Back to Sign Up
                  </button>
                </div>
              </>
            ) : requires2FA ? (
              <>
                <Input
                  label="6-Digit Verification Code"
                  type="text"
                  maxLength={6}
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value)}
                  placeholder="e.g. 123456"
                  icon={<ShieldCheck size={18} />}
                  required
                  autoFocus
                />

                <Button type="submit" variant="primary" loading={loading} className="login-submit-btn">
                  Verify &amp; Sign In
                </Button>

                <div style={{ marginTop: '12px', textAlign: 'center' }}>
                  <button
                    type="button"
                    onClick={() => setRequires2FA(false)}
                    style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                  >
                    <ArrowLeft size={14} /> Back to Sign In
                  </button>
                </div>
              </>
            ) : (
              <>
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

                <Button type="submit" variant="primary" loading={loading} className="login-submit-btn">
                  {isSignUp ? 'Create Account' : 'Sign In'}
                </Button>

                <div style={{ marginTop: '1.25rem', textAlign: 'center', fontSize: '0.875rem' }}>
                  <span style={{ color: 'var(--text-muted, #64748b)' }}>
                    {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                  </span>
                  <button
                    type="button"
                    onClick={toggleMode}
                    style={{ background: 'none', border: 'none', color: 'var(--primary-color, #4f6ef2)', fontWeight: 600, cursor: 'pointer', padding: 0, textDecoration: 'underline' }}
                  >
                    {isSignUp ? 'Sign In' : 'Sign Up'}
                  </button>
                </div>
              </>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
