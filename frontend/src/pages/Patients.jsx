import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

function Patients() {
  const { user } = useAuth();
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGender, setFilterGender] = useState('All');

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
    try {
      await fetch('http://localhost:5000/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      setFormData({ firstName: '', lastName: '', email: '', phone: '', gender: 'Male' });
      fetchPatients();
    } catch (err) { console.error(err); }
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <div style={{width: '100%'}}>
          <h1>Patient Records Directory</h1>
          <p style={{color: '#64748b', margin: '4px 0 0 0'}}>View and manage registered patient files</p>
        </div>
      </div>

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
                <td>{p.gender}</td>
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
    </div>
  );
}
export default Patients;
