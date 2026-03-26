import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Lock, Activity, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

function ResetPassword() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      return setError('Password must be at least 6 characters long.');
    }
    if (newPassword !== confirmPassword) {
      return setError('Passwords do not match.');
    }
    if (newPassword === 'medi@1234') {
      return setError('Please choose a different password than the temporary one.');
    }

    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/doctors/${user.id}/change-password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword })
      });

      if (res.ok) {
        // Update local session to clear the flag
        login(user.role, user.id, user.name, user.email, false);
        toast.success('Password updated successfully! Welcome back.');
        navigate('/');
      } else {
        throw new Error('Failed to update password');
      }
    } catch (err) {
      setError(err.message);
      toast.error(`Update Failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-wrapper fade-in" style={{maxWidth: '500px'}}>
        <div className="login-card" style={{padding: '40px', textAlign: 'center'}}>
          <ShieldAlert size={64} style={{color: '#f59e0b', margin: '0 auto 20px'}} />
          <h1 style={{margin: '0 0 10px 0'}}>Security Update Required</h1>
          <p style={{color: '#64748b', marginBottom: '30px'}}>
            An administrator has reset your password. For your protection, you must choose a new secure password before continuing.
          </p>

          <form className="login-form" onSubmit={handleSubmit} style={{textAlign: 'left'}}>
            {error && <div className="error-banner">{error}</div>}
            
            <div className="input-group">
              <label>New Secure Password</label>
              <div className="input-with-icon">
                <Lock size={18} className="input-icon" />
                <input required type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="••••••••" />
              </div>
            </div>

            <div className="input-group">
              <label>Confirm New Password</label>
              <div className="input-with-icon">
                <Lock size={18} className="input-icon" />
                <input required type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="••••••••" />
              </div>
            </div>

            <button type="submit" className="btn full primary" disabled={loading}>
              {loading ? <><Loader2 className="animate-spin" size={18} /> Updating...</> : 'Save & Enter Dashboard'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
