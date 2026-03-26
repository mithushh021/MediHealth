import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, UserRoundCog, CalendarCheck, FileText, Activity, LogOut, UserCircle, Shield, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [rejectedCount, setRejectedCount] = useState(0);
  const [prescCount, setPrescCount] = useState(0);

  useEffect(() => {
    if (user?.role === 'patient') {
      // Fetch Appointments for Rejections
      fetch('http://localhost:5000/appointments', { cache: 'no-store' })
        .then(r => r.json())
        .then(data => {
          if (Array.isArray(data)) {
            const count = data.filter(a => a.patientId === user.id && a.status === 'Rejected').length;
            setRejectedCount(count);
          }
        })
        .catch(() => {});

      // Fetch Prescriptions for New Records
      fetch('http://localhost:5000/prescriptions', { cache: 'no-store' })
        .then(r => r.json())
        .then(data => {
          if (Array.isArray(data)) {
            const count = data.filter(p => p.patientId === user.id && p.status === 'New').length;
            setPrescCount(count);
          }
        })
        .catch(() => {});
    }
  }, [user]);

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header" onClick={() => navigate('/')} style={{cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px'}}>
        <img src="/src/assets/icon.png" alt="MediHealth Logo" style={{width: '32px', height: '32px', borderRadius: '6px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'}} />
        <h2>MediHealth</h2>
      </div>
      
      <div style={{padding: '16px 24px', fontSize: '0.9rem', color: '#64748b', borderBottom: '1px solid var(--border)', background: '#f8fafc'}}>
        <div style={{fontWeight: 700, color: '#0f172a', marginBottom: '2px'}}>{user.name}</div>
        <div style={{textTransform: 'capitalize', color: '#3b82f6', fontWeight: 600, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '5px'}}>
           <div style={{width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e'}}></div>
           {user.role}
        </div>
      </div>

      <nav className="nav-menu">
        <NavLink to="/" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
          <LayoutDashboard size={20} /> Dashboard
        </NavLink>

        <NavLink to="/profile" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
          <UserCircle size={20} /> My Profile
        </NavLink>

        {user.role === 'admin' && (
          <>
            <NavLink to="/doctors" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
              <UserRoundCog size={20} /> Doctor Roster
            </NavLink>
            <NavLink to="/user-management" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
              <Shield size={20} /> Doctor Login Approval
            </NavLink>
          </>
        )}

        {user.role === 'admin' && (
          <NavLink to="/patients" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}>
             <Users size={20} /> Patient Files
          </NavLink>
        )}

        <NavLink to="/appointments" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')} style={{position: 'relative'}}>
          <CalendarCheck size={20} /> {user.role === 'admin' ? 'Scheduling' : 'Appointments'}
          {user.role === 'patient' && rejectedCount > 0 && (
            <span style={{
              position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
              background: '#ef4444', color: 'white', borderRadius: '50%',
              width: '20px', height: '20px', fontSize: '0.7rem', fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>{rejectedCount}</span>
          )}
        </NavLink>
        
        <NavLink to="/prescriptions" className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')} style={{position: 'relative'}}>
          <FileText size={20} /> {user.role === 'admin' ? 'Prescriptions' : 'Medical Records'}
          {user.role === 'patient' && prescCount > 0 && (
            <span style={{
              position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
              background: '#3b82f6', color: 'white', borderRadius: '50%',
              width: '20px', height: '20px', fontSize: '0.7rem', fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>{prescCount}</span>
          )}
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <button onClick={handleLogout} className="btn full logout-btn" style={{background: '#fef2f2', color: '#ef4444', border: '1px solid #fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', margin: 0, padding: '10px'}}>
          <LogOut size={18} /> Sign Out
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
