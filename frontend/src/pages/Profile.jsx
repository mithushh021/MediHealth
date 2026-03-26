import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Phone, Calendar, Briefcase, Award, Users, Edit, Save, X } from 'lucide-react';
import toast from 'react-hot-toast';

function Profile() {
  const { user, login } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});

  const fetchProfile = async () => {
    setLoading(true);
    if (user.role === 'admin') {
      setData({ firstName: 'System', lastName: 'Administrator', email: 'admin@medihealth.com', role: 'Staff' });
      setLoading(false);
      return;
    }

    const endpoint = user.role === 'patient' ? 'patients' : 'doctors';
    try {
      const res = await fetch(`http://localhost:5000/${endpoint}/${user.id}`);
      const json = await res.json();
      setData(json);
      setEditData(json);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const handleSave = async () => {
    // 1. Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editData.email)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    const phoneValue = editData.phone || editData.contactNumber || '';
    if (phoneValue.length < 5) {
      toast.error("Please enter a valid phone number.");
      return;
    }

    if (user.role === 'doctor') {
      if (!editData.specialization?.trim()) {
        toast.error("Specialization is required.");
        return;
      }
      if (Number(editData.experienceYears) < 0) {
        toast.error("Experience years cannot be negative.");
        return;
      }
    }

    const endpoint = user.role === 'patient' ? 'patients' : 'doctors';
    try {
      const res = await fetch(`http://localhost:5000/${endpoint}/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData)
      });

      if (res.ok) {
        toast.success('Profile updated successfully!');
        setData(editData);
        setIsEditing(false);
        // Sync AuthContext if name or email changed
        login(user.role, user.id, `${editData.firstName} ${editData.lastName}`, editData.email, user.needsPasswordReset);
      } else {
        toast.error('Failed to update profile.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Network Error: Could not save changes.');
    }
  };

  if (loading) return <div className="fade-in">Loading profile...</div>;
  if (!data) return <div className="fade-in">Could not load profile data.</div>;

  return (
    <div className="fade-in">
      <div className="page-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <div>
          <h1>My Profile</h1>
          <p>Personal account information and settings</p>
        </div>
        {user.role !== 'admin' && (
          <div style={{display: 'flex', gap: '10px'}}>
            {!isEditing ? (
              <button 
                onClick={() => setIsEditing(true)} 
                className="btn primary" 
                style={{display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px'}}
              >
                <Edit size={18} /> Edit Profile
              </button>
            ) : (
              <>
                <button 
                  onClick={() => { setIsEditing(false); setEditData(data); }} 
                  className="btn" 
                  style={{display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: '#f1f5f9', color: '#64748b'}}
                >
                  <X size={18} /> Cancel
                </button>
                <button 
                  onClick={handleSave} 
                  className="btn primary" 
                  style={{display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: '#22c55e'}}
                >
                  <Save size={18} /> Save Changes
                </button>
              </>
            )}
          </div>
        )}
      </div>

      <div className="form-card" style={{maxWidth: '800px', padding: '30px'}}>
        {!isEditing ? (
          <>
            <div style={{display: 'flex', gap: '40px', alignItems: 'center', marginBottom: '40px'}}>
              <div style={{width: '120px', height: '120px', borderRadius: '50%', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb', border: '4px solid white', boxShadow: '0 4px 10px rgba(0,0,0,0.05)'}}>
                <User size={64} />
              </div>
              <div style={{flex: 1}}>
                <h2 style={{margin: '0 0 5px 0', fontSize: '2rem'}}>{data.firstName} {data.lastName}</h2>
                <p style={{margin: 0, color: '#64748b', fontSize: '1.1rem', textTransform: 'capitalize'}}>{user.role}</p>
              </div>
            </div>

            <div className="form-grid">
              <div className="summary-card" style={{padding: '20px'}}>
                <div className="summary-info" style={{flex: 1}}>
                  <h3>Email Address</h3>
                  <p style={{fontSize: '1.2rem'}}>{data.email}</p>
                </div>
                <div className="icon-wrapper blue"><Mail size={20} /></div>
              </div>

              <div className="summary-card" style={{padding: '20px'}}>
                <div className="summary-info" style={{flex: 1}}>
                  <h3>Phone Number</h3>
                  <p style={{fontSize: '1.2rem'}}>{data.phone || data.contactNumber || 'N/A'}</p>
                </div>
                <div className="icon-wrapper green"><Phone size={20} /></div>
              </div>

              {user.role === 'patient' && (
                <>
                  <div className="summary-card" style={{padding: '20px'}}>
                    <div className="summary-info" style={{flex: 1}}>
                      <h3>Gender</h3>
                      <p style={{fontSize: '1.2rem'}}>{data.gender}</p>
                    </div>
                    <div className="icon-wrapper orange"><Users size={20} /></div>
                  </div>
                  <div className="summary-card" style={{padding: '20px'}}>
                    <div className="summary-info" style={{flex: 1}}>
                      <h3>Date of Birth</h3>
                      <p style={{fontSize: '1.2rem'}}>{data.dateOfBirth ? new Date(data.dateOfBirth).toLocaleDateString() : 'Not Set'}</p>
                    </div>
                    <div className="icon-wrapper purple"><Calendar size={20} /></div>
                  </div>
                </>
              )}

              {user.role === 'doctor' && (
                <>
                  <div className="summary-card" style={{padding: '20px'}}>
                    <div className="summary-info" style={{flex: 1}}>
                      <h3>Specialization</h3>
                      <p style={{fontSize: '1.2rem'}}>{data.specialization}</p>
                    </div>
                    <div className="icon-wrapper orange"><Briefcase size={20} /></div>
                  </div>
                  <div className="summary-card" style={{padding: '20px'}}>
                    <div className="summary-info" style={{flex: 1}}>
                      <h3>Experience (Years)</h3>
                      <p style={{fontSize: '1.2rem'}}>{data.experienceYears} Years</p>
                    </div>
                    <div className="icon-wrapper purple"><Award size={20} /></div>
                  </div>
                </>
              )}
            </div>
          </>
        ) : (
          <div style={{display: 'flex', flexDirection: 'column', gap: '25px'}}>
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px'}}>
              <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                <label style={{fontSize: '0.85rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase'}}>First Name</label>
                <input placeholder="e.g. John" value={editData.firstName} onChange={e => setEditData({...editData, firstName: e.target.value})} style={{width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '1rem', boxSizing: 'border-box'}} />
              </div>
              <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                <label style={{fontSize: '0.85rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase'}}>Last Name</label>
                <input placeholder="e.g. Doe" value={editData.lastName} onChange={e => setEditData({...editData, lastName: e.target.value})} style={{width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '1rem', boxSizing: 'border-box'}} />
              </div>
            </div>

            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px'}}>
              <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                <label style={{fontSize: '0.85rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase'}}>Email Address</label>
                <input placeholder="name@example.com" value={editData.email} onChange={e => setEditData({...editData, email: e.target.value})} style={{width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '1rem', boxSizing: 'border-box'}} />
              </div>
              <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                <label style={{fontSize: '0.85rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase'}}>Phone Number</label>
                <input placeholder="e.g. +94..." value={editData.phone || editData.contactNumber || ''} onChange={e => setEditData({...editData, phone: e.target.value, contactNumber: e.target.value})} style={{width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '1rem', boxSizing: 'border-box'}} />
              </div>
            </div>

            {user.role === 'patient' && (
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px'}}>
                <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                  <label style={{fontSize: '0.85rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase'}}>Gender</label>
                  <select value={editData.gender} onChange={e => setEditData({...editData, gender: e.target.value})} style={{width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '1rem', background: 'white', boxSizing: 'border-box'}}>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                  <label style={{fontSize: '0.85rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase'}}>Date of Birth</label>
                  <input type="date" value={editData.dateOfBirth?.split('T')[0] || ''} onChange={e => setEditData({...editData, dateOfBirth: e.target.value})} style={{width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '1rem', boxSizing: 'border-box'}} />
                </div>
              </div>
            )}

            {user.role === 'doctor' && (
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px'}}>
                <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                  <label style={{fontSize: '0.85rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase'}}>Specialization</label>
                  <input placeholder="e.g. Cardiology" value={editData.specialization} onChange={e => setEditData({...editData, specialization: e.target.value})} style={{width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '1rem', boxSizing: 'border-box'}} />
                </div>
                <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                  <label style={{fontSize: '0.85rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase'}}>Experience (Years)</label>
                  <input type="number" placeholder="Years of practice" value={editData.experienceYears} onChange={e => setEditData({...editData, experienceYears: e.target.value})} style={{width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '1rem', boxSizing: 'border-box'}} />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;
