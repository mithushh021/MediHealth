import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Activity, Mail, Lock, User, Phone, Briefcase, FileDigit, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

function Signup() {
  const navigate = useNavigate();
  const [role, setRole] = useState('patient');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    gender: 'Male',
    password: '',
    // Doctor specific
    specialization: '',
    experienceYears: '',
    doctorId: '' // String ID
  });

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    
    // 1. Basic Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }

    if (formData.phone.length < 5) {
      toast.error("Please enter a valid phone number.");
      return;
    }

    if (role === 'doctor') {
      if (!formData.specialization.trim()) {
        toast.error("Please specify your specialization.");
        return;
      }
      if (Number(formData.experienceYears) < 0) {
        toast.error("Experience years cannot be negative.");
        return;
      }
      if (!formData.doctorId.trim()) {
        toast.error("Please provide your Doctor ID / Registration No.");
        return;
      }
    }

    setLoading(true);

    try {
      const endpoint = role === 'patient' ? 'patients' : 'doctors';
      const body = role === 'patient' 
        ? { firstName: formData.firstName, lastName: formData.lastName, email: formData.email, phone: formData.phone, gender: formData.gender, password: formData.password }
        : { firstName: formData.firstName, lastName: formData.lastName, email: formData.email, contactNumber: formData.phone, specialization: formData.specialization, experienceYears: Number(formData.experienceYears), doctorId: formData.doctorId, isApproved: false, password: formData.password };

      const res = await fetch(`http://localhost:5000/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Registration failed');
      }

      if (role === 'doctor') {
        toast.success('Registration successful! Please wait for administrator approval.');
      } else {
        toast.success('Welcome to MediHealth! Your account has been created.');
      }
      navigate('/login');
    } catch (err) {
      let displayMsg = err.message;
      if (displayMsg.includes('E11000') || displayMsg.includes('duplicate key')) {
        displayMsg = 'An account with this email already exists. Please Sign In or use a different email.';
      } else if (displayMsg.includes('Failed to fetch')) {
        displayMsg = 'Connection to the server failed. Please ensure the backend is running.';
      }

      setError(displayMsg);
      toast.error(displayMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-wrapper fade-in" style={{maxWidth: '1000px'}}>
        <div className="login-visuals">
          <img src="/src/assets/icon.png" alt="MediHealth Logo" style={{width: '80px', height: '80px', marginBottom: '20px', borderRadius: '15px', boxShadow: '0 8px 16px rgba(0,0,0,0.15)'}} />
          <h2>Join MediHealth</h2>
          <p>Create your account to start managing your health or clinical practice today.</p>
        </div>
        
        <div className="login-card" style={{padding: '40px'}}>
          <div className="login-header">
            <h1>Create Account</h1>
            <p>Select your role and fill in the details</p>
          </div>

          <div className="role-tabs" style={{marginBottom: '24px'}}>
            <button className={`role-tab ${role === 'patient' ? 'active' : ''}`} onClick={() => setRole('patient')}>
              <User size={18} /> Patient
            </button>
            <button className={`role-tab ${role === 'doctor' ? 'active' : ''}`} onClick={() => setRole('doctor')}>
              <Activity size={18} /> Doctor
            </button>
          </div>

          <form className="form-grid" onSubmit={handleSignup} style={{textAlign: 'left'}}>
            <div className="form-group">
              <label>First Name</label>
              <input required placeholder="e.g. John" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Last Name</label>
              <input required placeholder="e.g. Doe" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input required placeholder="e.g. +94 77 123 4567" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
            </div>
            <div className="form-group full">
               <label>Account Password</label>
               <div className="input-with-icon">
                  <Lock size={18} className="input-icon" />
                  <input required type="password" placeholder="Min 6 characters" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
               </div>
            </div>

            {role === 'patient' ? (
               <div className="form-group full">
                  <label>Gender</label>
                  <select value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})}>
                     <option>Male</option>
                     <option>Female</option>
                     <option>Other</option>
                  </select>
               </div>
            ) : (
              <>
                 <div className="form-group">
                    <label>Specialization</label>
                    <input required placeholder="e.g. Cardiology" value={formData.specialization} onChange={e => setFormData({...formData, specialization: e.target.value})} />
                 </div>
                 <div className="form-group">
                    <label>Experience (Years)</label>
                    <input required type="number" placeholder="e.g. 5" value={formData.experienceYears} onChange={e => setFormData({...formData, experienceYears: e.target.value})} />
                 </div>
                 <div className="form-group full">
                    <label>Doctor ID / Registration No.</label>
                    <div className="input-with-icon">
                       <FileDigit size={18} className="input-icon" />
                       <input required placeholder="e.g. AMC-12345" value={formData.doctorId} onChange={e => setFormData({...formData, doctorId: e.target.value})} />
                    </div>
                 </div>
              </>
            )}

            {error && <div className="error-banner full" style={{marginTop: '10px'}}>{error}</div>}

            <button type="submit" className="btn full primary" style={{marginTop: '20px'}} disabled={loading}>
               {loading ? <><Loader2 className="animate-spin" size={20} /> Registering...</> : 'Complete Registration'}
            </button>
          </form>

          <p style={{marginTop: '20px', fontSize: '0.9rem', color: '#64748b'}}>
            Already have an account? <Link to="/login" style={{color: '#2563eb', fontWeight: 600}}>Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
export default Signup;
