import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Edit, Trash2, Search, Filter, Activity } from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmModal from '../components/ConfirmModal';

function Patients() {
  const { user } = useAuth();
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGender, setFilterGender] = useState('All');
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', phone: '', gender: 'Male' });
  const [editingId, setEditingId] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState(null);

  const fetchPatients = async () => {
    try {
      const res = await fetch('http://localhost:5000/patients');
      const data = await res.json();
      if(Array.isArray(data)) {
        const refined = data.filter(p =>
          !p.email.toLowerCase().includes('doc') &&
          !p.email.toLowerCase().includes('admin')
        );
        setPatients(refined);
      }
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchPatients(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = editingId 
      ? `http://localhost:5000/patients/${editingId}`
      : 'http://localhost:5000/patients';
    const method = editingId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        toast.success(editingId ? 'Patient record updated' : 'Patient registered successfully');
        setFormData({ firstName: '', lastName: '', email: '', phone: '', gender: 'Male' });
        setEditingId(null);
        fetchPatients();
      } else {
        const err = await res.json();
        toast.error(err.message || 'Operation failed');
      }
    } catch (err) { 
      console.error(err);
      toast.error('Network Error: Could not reach the server.');
    }
  };

  const handleEdit = (p) => {
    setEditingId(p._id);
    setFormData({
      firstName: p.firstName,
      lastName: p.lastName,
      email: p.email,
      phone: p.phone || '',
      gender: p.gender || 'Male'
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteClick = (id) => {
    setPatientToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      const res = await fetch(`http://localhost:5000/patients/${patientToDelete}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Patient record removed');
        fetchPatients();
      } else {
        toast.error('Failed to delete patient');
      }
    } catch (err) { console.error(err); }
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <div style={{width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <div>
            <h1>Patient Records Directory</h1>
            <p style={{color: '#64748b', margin: '4px 0 0 0'}}>View and manage registered patient files</p>
          </div>
          <div className="stats-pill info">
            <Activity size={16} /> {patients.length} Total Patients
          </div>
        </div>
      </div>

      {user.role === 'admin' && (
        <div className="form-card" style={{marginBottom: '30px', padding: '30px'}}>
          <h2 style={{marginTop: 0, marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px'}}>
            {editingId ? <><Edit size={20} color="#3b82f6" /> Edit Patient File</> : <><UserPlus size={20} color="#3b82f6" /> Register New Patient</>}
          </h2>
          <form onSubmit={handleSubmit} className="form-grid">
            <div className="form-group">
              <label>First Name</label>
              <input required value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} placeholder="Enter first name" />
            </div>
            <div className="form-group">
              <label>Last Name</label>
              <input required value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} placeholder="Enter last name" />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="patient@example.com" />
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="+94 7X XXX XXXX" />
            </div>
            <div className="form-group">
              <label>Gender</label>
              <select value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})} style={{width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'white'}}>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="form-group full" style={{display: 'flex', gap: '12px', marginTop: '10px'}}>
               <button type="submit" className="btn" style={{flex: 1}}>
                 {editingId ? 'Save Changes' : 'Register Patient'}
               </button>
               {editingId && (
                 <button type="button" className="btn" style={{background: '#94a3b8'}} onClick={() => { setEditingId(null); setFormData({ firstName: '', lastName: '', email: '', phone: '', gender: 'Male' }); }}>
                   Cancel
                 </button>
               )}
            </div>
          </form>
        </div>
      )}

    <div className="form-card" style={{padding: '24px', marginBottom: '30px', display: 'flex', flexWrap: 'wrap', gap: '15px', alignItems: 'center', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)'}}>
         <div style={{flex: '1 1 300px', position: 'relative'}}>
            <span style={{position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', display: 'flex', alignItems: 'center'}}>
               <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </span>
            <input 
               placeholder="Search by name, email or phone..." 
               value={searchTerm}
               onChange={e => setSearchTerm(e.target.value)}
               style={{width: '100%', padding: '12px 14px 12px 44px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.95rem', boxSizing: 'border-box', outline: 'none'}}
            />
         </div>
         <div style={{flex: '0 0 200px'}}>
            <select 
               value={filterGender} 
               onChange={e => setFilterGender(e.target.value)}
               style={{width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', background: 'white', fontSize: '0.95rem', cursor: 'pointer', boxSizing: 'border-box'}}
            >
               <option value="All">All Genders</option>
               <option value="Male">Male</option>
               <option value="Female">Female</option>
               <option value="Other">Other</option>
            </select>
         </div>
      </div>



      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Full Name</th>
              <th>Contact Email</th>
              <th>Phone Number</th>
              <th>Gender</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {patients.filter(p => {
              const matchesSearch = (p.firstName + ' ' + p.lastName + ' ' + p.email + ' ' + (p.phone || '')).toLowerCase().includes(searchTerm.toLowerCase());
              const matchesGender = filterGender === 'All' || p.gender === filterGender;
              return matchesSearch && matchesGender;
            }).map(p => (
              <tr key={p._id}>
                 <td style={{fontWeight: 600, color: '#0f172a'}}>{p.firstName} {p.lastName}</td>
                 <td>{p.email}</td>
                 <td>{p.phone}</td>
                 <td style={{textTransform: 'capitalize'}}>{p.gender}</td>
                 <td>
                    <div style={{display: 'flex', gap: '8px'}}>
                       <button onClick={() => handleEdit(p)} className="btn" style={{padding: '6px', background: '#eff6ff', color: '#3b82f6', border: '1px solid #dbeafe'}} title="Edit Profile">
                          <Edit size={16} />
                       </button>
                       <button onClick={() => handleDeleteClick(p._id)} className="btn" style={{padding: '6px', background: '#fef2f2', color: '#ef4444', border: '1px solid #fee2e2'}} title="Remove Patient">
                          <Trash2 size={16} />
                       </button>
                    </div>
                 </td>
              </tr>
            ))}
            {patients.length > 0 && patients.filter(p => {
              const matchesSearch = (p.firstName + ' ' + p.lastName + ' ' + p.email + ' ' + (p.phone || '')).toLowerCase().includes(searchTerm.toLowerCase());
              const matchesGender = filterGender === 'All' || p.gender === filterGender;
              return matchesSearch && matchesGender;
            }).length === 0 && (
              <tr><td colSpan="4" style={{textAlign: 'center', padding: '40px', color: '#64748b'}}>No patients match your search criteria.</td></tr>
            )}
            {patients.length === 0 && <tr><td colSpan="4" style={{textAlign: 'center', padding: '40px'}}>No patients registered yet.</td></tr>}
          </tbody>
        </table>
      </div>

      <ConfirmModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Patient Record?"
        message="Are you sure you want to permanently remove this patient from the registry? This will delete all their medical history in this service."
        type="danger"
      />
    </div>
  );
}
export default Patients;
