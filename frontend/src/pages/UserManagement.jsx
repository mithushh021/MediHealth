import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserCheck, UserX, Shield, Mail, Activity, Trash2, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmModal from '../components/ConfirmModal';

function UserManagement() {
  const [doctors, setDoctors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [approvalFilter, setApprovalFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, docId: null, mode: 'reset' });

  const fetchDoctors = async () => {
    try {
      const res = await fetch('http://localhost:5000/doctors', { cache: 'no-store' });
      const data = await res.json();
      setDoctors(data);
      setLoading(false);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchDoctors(); }, []);

  const toggleApproval = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/doctors/${id}/approve`, { method: 'PUT' });
      if (!res.ok) {
        const errData = await res.json();
        toast.error(`Error: ${errData.message || 'Failed to update status'}`);
      } else {
        toast.success('Status updated successfully');
        fetchDoctors();
      }
    } catch (err) { 
      console.error("Toggle Approval Error:", err);
      toast.error("Network Error: Could not reach the server.");
    }
  };

  const resetPassword = (id) => {
    setConfirmModal({ isOpen: true, docId: id, mode: 'reset' });
  };

  const deleteDoctor = (id) => {
    setConfirmModal({ isOpen: true, docId: id, mode: 'delete' });
  };

  const handleConfirmAction = async () => {
    const id = confirmModal.docId;
    if (confirmModal.mode === 'reset') {
      try {
        const res = await fetch(`http://localhost:5000/doctors/${id}/reset-password`, { method: 'PUT' });
        if(res.ok) {
          toast.success('Password has been reset successfully.');
          fetchDoctors();
        } else {
          const errData = await res.json();
          toast.error(`Error: ${errData.message || 'Failed to reset password'}`);
        }
      } catch (err) { 
        console.error("Reset Password Error:", err);
        toast.error("Network Error: Could not reach the server.");
      }
    } else {
      try {
        const res = await fetch(`http://localhost:5000/doctors/${id}`, { method: 'DELETE' });
        if (res.ok) {
           toast.success('Staff record removed successfully.');
           fetchDoctors();
        } else {
           toast.error("Failed to delete record.");
        }
      } catch (err) { 
        console.warn(err); 
        toast.error("An error occurred while deleting the record.");
      }
    }
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1>User Management</h1>
          <p>Review and authorize medical professional applications</p>
        </div>
        <div className="stats-pill warning">
          <Shield size={16} /> {doctors.filter(d => !d.isApproved).length} Pending Approvals
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
               value={approvalFilter} 
               onChange={e => setApprovalFilter(e.target.value)}
               style={{width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', background: 'white', fontSize: '0.95rem', cursor: 'pointer', boxSizing: 'border-box'}}
            >
               <option value="All">All Statuses</option>
               <option value="Pending">Pending Review</option>
               <option value="Approved">Authorized Only</option>
            </select>
         </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Doctor Name</th>
              <th>Email Address</th>
              <th>Specialization</th>
              <th>Portal Status</th>
              <th>Admin Actions</th>
            </tr>
          </thead>
          <tbody>
            {doctors.filter(d => {
              const name = (d.firstName + ' ' + d.lastName).toLowerCase();
              const email = (d.email || '').toLowerCase();
              const spec = (d.specialization || '').toLowerCase();
              const matchesSearch = name.includes(searchTerm.toLowerCase()) || email.includes(searchTerm.toLowerCase()) || spec.includes(searchTerm.toLowerCase());
              const matchesApproval = approvalFilter === 'All' || (approvalFilter === 'Approved' ? d.isApproved : !d.isApproved);
              return matchesSearch && matchesApproval;
            }).map(d => (
              <tr key={d._id} className={!d.isApproved ? 'row-highlight' : ''}>
                <td>
                  <div style={{fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px'}}>
                    {d.firstName ? `Dr. ${d.firstName} ${d.lastName}` : <span style={{color: '#94a3b8'}}>[Name Not Set]</span>}
                    {d.isAvailable ? (
                      <span title="Online Now" style={{width: '7.5px', height: '7.5px', background: '#22c55e', borderRadius: '50%', boxShadow: '0 0 4px rgba(34, 197, 94, 0.4)'}}></span>
                    ) : (
                      <span title="Offline" style={{width: '7.5px', height: '7.5px', background: '#94a3b8', borderRadius: '50%'}}></span>
                    )}
                  </div>
                  <div style={{fontSize: '0.8rem', color: '#64748b'}}>Practice Exp: {d.experienceYears || 0} Years</div>
                </td>
                <td>
                   <div style={{display: 'flex', alignItems: 'center', gap: '8px', color: d.email ? '#334155' : '#94a3b8'}}>
                      <Mail size={15} style={{color: '#64748b'}} /> {d.email || 'Email missing'}
                   </div>
                </td>
                <td style={{fontWeight: 500, color: '#475569'}}>{d.specialization}</td>
                <td>
                   <span className={`status-badge ${d.isApproved ? 'Completed' : 'Cancelled'}`}>
                      {d.isApproved ? 'Authorized' : 'Pending Review'}
                   </span>
                </td>
                <td>
                   <div style={{display: 'flex', gap: '10px'}}>
                      <button 
                        onClick={() => toggleApproval(d._id)} 
                        className={`btn ${d.isApproved ? 'btn-danger' : 'btn-success'}`}
                        style={{padding: '6px 12px', fontSize: '0.8rem'}}
                      >
                        {d.isApproved ? <><UserX size={14} /> Revoke</> : <><UserCheck size={14} /> Approve</>}
                      </button>
                      <button 
                        onClick={() => resetPassword(d._id)} 
                        className="btn" 
                        title="Reset Password to default"
                        style={{padding: '6px', background: '#f0f9ff', color: '#0ea5e9', border: '1px solid #e0f2fe'}}
                      >
                         <RefreshCw size={16} />
                      </button>
                      <button onClick={() => deleteDoctor(d._id)} className="btn" style={{padding: '6px', background: '#fef2f2', color: '#ef4444'}}>
                         <Trash2 size={16} />
                      </button>
                   </div>
                </td>
              </tr>
            ))}
            {doctors.length > 0 && doctors.filter(d => {
              const name = (d.firstName + ' ' + d.lastName).toLowerCase();
              const email = (d.email || '').toLowerCase();
              const spec = (d.specialization || '').toLowerCase();
              const matchesSearch = name.includes(searchTerm.toLowerCase()) || email.includes(searchTerm.toLowerCase()) || spec.includes(searchTerm.toLowerCase());
              const matchesApproval = approvalFilter === 'All' || (approvalFilter === 'Approved' ? d.isApproved : !d.isApproved);
              return matchesSearch && matchesApproval;
            }).length === 0 && (
              <tr><td colSpan="5" style={{textAlign: 'center', padding: '40px', color: '#64748b'}}>No doctor applications match your search or filters.</td></tr>
            )}
            {doctors.length === 0 && (
              <tr><td colSpan="5" style={{textAlign: 'center', padding: '40px'}}>No doctor applications found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <ConfirmModal 
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={handleConfirmAction}
        title={confirmModal.mode === 'reset' ? 'Reset Password?' : 'Remove Professional?'}
        message={confirmModal.mode === 'reset' 
          ? "This will reset the doctor's password to 'medi@1234'. They will be required to change it on their next login." 
          : "Are you sure you want to permanently remove this medical professional from the portal registry?"}
        type={confirmModal.mode === 'reset' ? 'info' : 'danger'}
      />
    </div>
  );
}

export default UserManagement;
