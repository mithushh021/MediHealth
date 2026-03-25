import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import ConfirmModal from '../components/ConfirmModal';

function Doctors() {
  const { user } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('All');
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, docId: null });
  const fetchDoctors = async () => {
    try {
      const res = await fetch('http://localhost:5000/doctors');
      const data = await res.json();
      if(Array.isArray(data)) setDoctors(data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchDoctors(); }, []);

  const handleResetPassword = (id) => {
    setConfirmModal({ isOpen: true, docId: id });
  };

  const executeReset = async () => {
    const id = confirmModal.docId;
    try {
      const res = await fetch(`http://localhost:5000/doctors/${id}/reset-password`, { method: 'PUT' });
      const data = await res.json();
      toast.success(data.message || 'Password reset successful');
    } catch (err) { 
      console.error(err); 
      toast.error('Failed to reset password'); 
    }
  };

  // Unique specialties for the filter dropdown
  const specialties = ['All', ...new Set(doctors.map(d => d.specialization).filter(Boolean))];

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1>Doctor Roster</h1>
          <p>Managed by Doctor Microservice (Native Port 5002)</p>
        </div>
      </div>

      <div className="form-card" style={{padding: '24px', marginBottom: '30px', display: 'flex', flexWrap: 'wrap', gap: '15px', alignItems: 'center', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)'}}>
         <div style={{flex: '1 1 300px', position: 'relative'}}>
            <span style={{position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', display: 'flex', alignItems: 'center'}}>
               <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </span>
            <input 
               placeholder="Search doctors by name, email or specialty..." 
               value={searchTerm}
               onChange={e => setSearchTerm(e.target.value)}
               style={{width: '100%', padding: '12px 14px 12px 44px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.95rem', boxSizing: 'border-box', outline: 'none'}}
            />
         </div>
         <div style={{flex: '0 0 200px'}}>
            <select 
               value={specialtyFilter} 
               onChange={e => setSpecialtyFilter(e.target.value)}
               style={{width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', background: 'white', fontSize: '0.95rem', cursor: 'pointer', boxSizing: 'border-box'}}
            >
               {specialties.map(spec => (
                 <option key={spec} value={spec}>{spec === 'All' ? 'All Specialties' : spec}</option>
               ))}
            </select>
         </div>
      </div>



      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Specialty</th>
              <th>Experience</th>
              <th>Contact</th>
              {user.role === 'admin' && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {doctors.filter(d => {
              const matchesSearch = (d.firstName + ' ' + d.lastName + ' ' + d.email + ' ' + d.specialization).toLowerCase().includes(searchTerm.toLowerCase());
              const matchesSpec = specialtyFilter === 'All' || d.specialization === specialtyFilter;
              return matchesSearch && matchesSpec;
            }).map(d => (
              <tr key={d._id}>
                <td style={{color: '#64748b', fontSize: '0.85rem'}}>{d._id.substring(18)}</td>
                <td style={{fontWeight: 500}}>Dr. {d.firstName} {d.lastName}</td>
                <td>{d.email}</td>
                <td>{d.specialization}</td>
                <td>{d.experienceYears} yrs</td>
                <td>{d.contactNumber}</td>
                {user.role === 'admin' && (
                  <td>
                    <button 
                      onClick={() => handleResetPassword(d._id)}
                      className="btn"
                      style={{padding: '6px 12px', fontSize: '0.75rem', backgroundColor: '#f8fafc', color: '#64748b', border: '1px solid #e2e8f0'}}
                    >
                      Reset Password
                    </button>
                  </td>
                )}
              </tr>
            ))}
            {doctors.length > 0 && doctors.filter(d => {
              const matchesSearch = (d.firstName + ' ' + d.lastName + ' ' + d.email + ' ' + d.specialization).toLowerCase().includes(searchTerm.toLowerCase());
              const matchesSpec = specialtyFilter === 'All' || d.specialization === specialtyFilter;
              return matchesSearch && matchesSpec;
            }).length === 0 && (
              <tr><td colSpan={user.role === 'admin' ? "7" : "6"} style={{textAlign: 'center', padding: '40px', color: '#64748b'}}>No doctors match your search or filter.</td></tr>
            )}
            {doctors.length === 0 && <tr><td colSpan={user.role === 'admin' ? "7" : "6"} style={{textAlign: 'center', padding: '40px'}}>No medical professionals found in the system.</td></tr>}
          </tbody>
        </table>
      </div>
      
      <ConfirmModal 
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, docId: null })}
        onConfirm={executeReset}
        title="Reset Password?"
        message="This will reset the doctor's password to 'medi@1234'. They will be required to change it on their next login."
        type="info"
      />
    </div>
  );
}
export default Doctors;
