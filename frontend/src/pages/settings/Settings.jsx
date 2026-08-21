import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody, CardTitle, CardDescription } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import { User, Mail, Phone, ShieldCheck, Save, CheckCircle, AlertCircle } from 'lucide-react';
import { authService } from '../../services/auth.service';
import { useToast } from '../../context/ToastContext';

const Settings = () => {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    isTwoFactorEnabled: false
  });

  // Fetch latest authenticated user profile
  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      try {
        const user = await authService.me();
        if (user) {
          setFormData({
            name: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
            isTwoFactorEnabled: Boolean(user.isTwoFactorEnabled)
          });
        }
      } catch (err) {
        console.error('Failed to load user profile:', err);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const res = await authService.updateProfile({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        isTwoFactorEnabled: formData.isTwoFactorEnabled
      });

      addToast('Profile & security settings updated successfully!', 'success');
      if (res.data?.user) {
        setFormData({
          name: res.data.user.name || '',
          email: res.data.user.email || '',
          phone: res.data.user.phone || '',
          isTwoFactorEnabled: Boolean(res.data.user.isTwoFactorEnabled)
        });
      }
    } catch (err) {
      setError(err.message || 'Failed to update profile settings.');
      addToast(err.message || 'Update failed', 'danger');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="settings-page" style={{ maxWidth: '800px' }}>
      <div className="page-header flex-between" style={{ marginBottom: '24px' }}>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--neutral-900)' }}>Account &amp; Security Settings</h1>
          <p className="text-muted text-sm" style={{ marginTop: '2px' }}>
            Manage your shopkeeper profile, contact numbers, and 2-Step Verification preferences
          </p>
        </div>
        <Badge variant="primary">Shopkeeper Profile</Badge>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Profile Details Card */}
          <Card>
            <CardHeader>
              <CardTitle style={{ fontSize: '16px' }}>Shopkeeper Profile Details</CardTitle>
              <CardDescription>Update your display name and contact details used across invoices</CardDescription>
            </CardHeader>
            <CardBody>
              {error && (
                <div style={{ padding: '10px 14px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', color: '#991b1b', fontSize: '13px', marginBottom: '16px' }}>
                  {error}
                </div>
              )}

              {loading ? (
                <div style={{ padding: '30px', textAlign: 'center', color: 'var(--neutral-500)' }}>
                  Loading profile settings...
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <Input
                    label="Full Name / Store Owner"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Ramesh Kumar"
                    icon={<User size={18} />}
                    required
                  />

                  <Input
                    label="Email Address"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="e.g. store@stockflow.com"
                    icon={<Mail size={18} />}
                    required
                  />

                  <Input
                    label="Mobile Phone Number"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="e.g. +91 98765 43210"
                    icon={<Phone size={18} />}
                  />
                </div>
              )}
            </CardBody>
          </Card>

          {/* Security & 2-Step Verification Card */}
          <Card>
            <CardHeader>
              <CardTitle style={{ fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={18} className="text-primary" />
                2-Step Security Verification (2FA)
              </CardTitle>
              <CardDescription>Require a 6-digit verification code every time you sign in with your email</CardDescription>
            </CardHeader>
            <CardBody>
              <div className="flex-between" style={{ padding: '12px 16px', backgroundColor: 'var(--neutral-50, #f8fafc)', borderRadius: 'var(--border-radius-md, 8px)', border: '1px solid var(--neutral-200, #e2e8f0)' }}>
                <div>
                  <h4 className="font-semibold text-neutral-800" style={{ fontSize: '14px', marginBottom: '2px' }}>
                    Enable 2-Step Verification
                  </h4>
                  <p className="text-muted text-xs">
                    Adds an extra layer of protection when logging in with email and password
                  </p>
                </div>

                <label style={{ position: 'relative', display: 'inline-block', width: '48px', height: '24px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formData.isTwoFactorEnabled}
                    onChange={(e) => setFormData({ ...formData, isTwoFactorEnabled: e.target.checked })}
                    style={{ opacity: 0, width: 0, height: 0 }}
                  />
                  <span style={{
                    position: 'absolute',
                    top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: formData.isTwoFactorEnabled ? 'var(--primary-color, #4f6ef2)' : '#cbd5e1',
                    borderRadius: '24px',
                    transition: '0.3s'
                  }}>
                    <span style={{
                      position: 'absolute',
                      content: '""',
                      height: '18px',
                      width: '18px',
                      left: formData.isTwoFactorEnabled ? '26px' : '3px',
                      bottom: '3px',
                      backgroundColor: 'white',
                      borderRadius: '50%',
                      transition: '0.3s'
                    }} />
                  </span>
                </label>
              </div>
            </CardBody>
          </Card>

          {/* Form Action Button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              type="submit"
              variant="primary"
              loading={submitting}
              icon={<Save size={16} />}
            >
              Save Profile Settings
            </Button>
          </div>

        </div>
      </form>
    </div>
  );
};

export default Settings;
