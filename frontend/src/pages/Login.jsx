import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Activity, Mail, Lock, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Hardcoded Admin Login
    if (email === 'admin@medhealth.co' && password === 'adMin#$92%gov') {
      login('admin', 'ADMIN_ID', 'Head Administrator', 'admin@medhealth.co');
      toast.success('Admin access granted.');
      setLoading(false);
      return;
    }

    try {
      // 1. Try Patient Lookup (Cache-busted)
      const pRes = await fetch(`http://localhost:5000/patients?t=${Date.now()}`, { cache: 'no-store' });
      const patients = await pRes.json();
      const patientMatch = patients.find(p => p.email?.toLowerCase() === email.toLowerCase());

      if (patientMatch) {
          if (patientMatch.password && patientMatch.password !== password) {
            const msg = 'Invalid email or password.';
            setError(msg);
            toast.error(msg);
            setLoading(false);
            return;
          }
          toast.success(`Welcome back, ${patientMatch.firstName}!`);
          login('patient', patientMatch._id, `${patientMatch.firstName} ${patientMatch.lastName}`, patientMatch.email, patientMatch.needsPasswordReset);
         setLoading(false);
         return;
      }

      // 2. Try Doctor Lookup (Cache-busted)
      const dRes = await fetch(`http://localhost:5000/doctors?t=${Date.now()}`, { cache: 'no-store' });
      const doctors = await dRes.json();
      const doctorMatch = doctors.find(d => d.email?.toLowerCase() === email.toLowerCase());

      if (doctorMatch) {
         if (doctorMatch.password && doctorMatch.password !== password) {
            const msg = 'Invalid email or password.';
            setError(msg);
            toast.error(msg);
            setLoading(false);
            return;
         }
         if (!doctorMatch.isApproved) {
            const msg = '⏳ Your account is pending administrator approval.';
            setError(msg);
            toast(msg, { icon: '⏳' });
         } else {
            toast.success(`Welcome back, Dr. ${doctorMatch.lastName}`);
            login('doctor', doctorMatch._id, `Dr. ${doctorMatch.lastName}`, doctorMatch.email, doctorMatch.needsPasswordReset);
         }
         setLoading(false);
         return;
      }

      const msg = 'Account not found. Please check your email or Register.';
      setError(msg);
      toast.error(msg);
    } catch (err) {
      console.error("Login System Error:", err);
      const msg = 'Connection to security services failed. Please try again.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-wrapper fade-in">
        <div className="login-visuals">
          <img src="/src/assets/icon.png" alt="MediHealth Logo" style={{width: '80px', height: '80px', marginBottom: '20px', borderRadius: '15px', boxShadow: '0 8px 16px rgba(0,0,0,0.15)'}} />
          <h2>MediHealth</h2>
          <p>Access your healthcare portal securely from any device.</p>
        </div>
        
        <div className="login-card">
          <div className="login-header">
            <h1>Secure login</h1>
            <p>Welcome back! Please enter your details</p>
          </div>
          
          <form className="login-form" onSubmit={handleLogin}>
            {error && <div className="error-banner">{error}</div>}
            
            <div className="input-group">
              <label>Registered Email</label>
              <div className="input-with-icon">
                <Mail size={18} className="input-icon" />
                <input 
                  type="email" 
                  autoComplete="email"
                  required 
                  placeholder="name@example.com" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                />
              </div>
            </div>

            <div className="input-group">
              <label>Password</label>
              <div className="input-with-icon">
                <Lock size={18} className="input-icon" />
                <input 
                  type="password" 
                  autoComplete="current-password"
                  required 
                  placeholder="••••••••" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                />
              </div>
            </div>

            <button type="submit" className="btn full login-btn" disabled={loading}>
              {loading ? <><Loader2 className="animate-spin" size={20} /> Authenticating...</> : 'Sign In'}
            </button>
          </form>

          <div className="login-footer">
            <p>Don't have an account? <Link to="/signup" style={{color: '#2563eb', fontWeight: 600}}>Create account</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}
export default Login;
