import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

function Prescriptions() {
  const { user } = useAuth();
  const [prescriptions, setPrescriptions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [formData, setFormData] = useState({ patientId: '', doctorId: '', medName: '', dosage: '', frequency: '', duration: '', notes: '' });
  const [printingDoc, setPrintingDoc] = useState(null); // For PDF/Print view
  const [editingId, setEditingId] = useState(null);
  const [deleteId, setDeleteId] = useState(null); // ID for custom delete modal


  const fetchPrescriptions = async () => {
    try {
      const res = await fetch('http://localhost:5000/prescriptions', { cache: 'no-store' });
      const data = await res.json();
      if(Array.isArray(data)) {
        if (user.role === 'admin') setPrescriptions(data);
        else if (user.role === 'doctor') setPrescriptions(data.filter(p => p.doctorId === user.id));
        else setPrescriptions(data.filter(p => p.patientId === user.id));
      }
    } catch (err) { console.error(err); }
  };

  const fetchDoctors = async () => {
    try {
      const res = await fetch('http://localhost:5000/doctors', { cache: 'no-store' });
      const data = await res.json();
      if(Array.isArray(data)) setDoctors(data);
    } catch (err) { console.error(err); }
  };

  const fetchPatients = async () => {
    try {
      const res = await fetch('http://localhost:5000/patients', { cache: 'no-store' });
      const data = await res.json();
      if(Array.isArray(data)) {
        console.log("FRESH_PATIENT_DATA:", data.length);
        const refined = data.filter(p => {
          const email = (p.email || '').toLowerCase();
          return !email.includes('doc') && !email.includes('admin');
        });
        setPatients(refined);
      }
    } catch (err) { console.error(err); }
  };

  useEffect(() => { 
    fetchPrescriptions(); 
    fetchDoctors();
    fetchPatients();
  }, []);

  // Auto-mark as 'Seen' for patients
  useEffect(() => {
    if (user.role === 'patient' && prescriptions.length > 0) {
      const newItems = prescriptions.filter(p => p.status === 'New');
      newItems.forEach(async (p) => {
        try {
          await fetch(`http://localhost:5000/prescriptions/${p._id}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'Seen' })
          });
        } catch (e) { console.error(e); }
      });
    }
  }, [prescriptions, user.role]);

  const downloadPDF = (p) => {
    const pName = getPatientName(p.patientId).replace(/\s+/g, '_');
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.getHours() + '-' + now.getMinutes();
    const oldTitle = document.title;
    
    // Set document title temporarily for the PDF filename
    document.title = `${pName}_prescription_${dateStr}_${timeStr}`;
    
    setPrintingDoc(p);
    setTimeout(() => {
      window.print();
      setPrintingDoc(null);
      document.title = oldTitle;
    }, 500);
  };

  // Helper for names with safety fallback to hide raw IDs
  const getPatientName = (id) => {
    if (!patients || patients.length === 0) return 'Loading...';
    const p = patients.find(p => String(p._id) === String(id));
    if (p) return `${p.firstName} ${p.lastName}`;
    return "Registered Patient"; // Never show the raw ID
  };
  const getDoctorName = (id) => {
    const d = doctors.find(d => d._id === id);
    return d ? `Dr. ${d.firstName} ${d.lastName}` : id;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Validation
    if (!formData.patientId) {
      toast.error("Please select a patient.");
      return;
    }
    if (user.role === 'admin' && !formData.doctorId) {
      toast.error("Please select a prescribing doctor.");
      return;
    }
    if (!formData.medName.trim() || !formData.dosage.trim()) {
      toast.error("Medication name and dosage are required.");
      return;
    }

    try {
      const body = {
        patientId: formData.patientId,
        doctorId: user.role === 'doctor' ? user.id : formData.doctorId,
        notes: formData.notes,
        medications: [{
          name: formData.medName,
          dosage: formData.dosage,
          frequency: formData.frequency,
          duration: formData.duration
        }]
      };

      const url = editingId 
        ? `http://localhost:5000/prescriptions/${editingId}`
        : 'http://localhost:5000/prescriptions';
      
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (res.ok) {
        toast.success(editingId ? 'Prescription updated!' : 'Prescription created!');
        setFormData({ patientId: '', doctorId: '', medName: '', dosage: '', frequency: '', duration: '', notes: '' });
        setEditingId(null);
        fetchPrescriptions();
      } else {
        const errData = await res.json();
        toast.error(`Operation failed: ${errData.message || 'Server error'}`);
      }
    } catch (err) { 
      console.error(err); 
      toast.error("Network Error: Could not reach the service.");
    }
  };

  const handleEdit = (p) => {
    setEditingId(p._id);
    const med = p.medications[0] || {};
    setFormData({
      patientId: p.patientId,
      doctorId: p.doctorId,
      medName: med.name || '',
      dosage: med.dosage || '',
      frequency: med.frequency || '',
      duration: med.duration || '',
      notes: p.notes || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id) => {
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`http://localhost:5000/prescriptions/${deleteId}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Prescription deleted.');
        fetchPrescriptions();
      } else {
        toast.error('Failed to delete.');
      }
    } catch (err) { console.error(err); }
    setDeleteId(null);
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1>{user.role === 'admin' ? 'Prescription Records' : 'My Prescriptions'}</h1>
          <p>Search and review historical medical prescriptions</p>
        </div>
      </div>

      <div className="form-card" style={{padding: '24px', marginBottom: '30px', display: 'flex', flexWrap: 'wrap', gap: '15px', alignItems: 'center', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)'}}>
         <div style={{flex: '1 1 300px', position: 'relative'}}>
            <span style={{position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', display: 'flex', alignItems: 'center'}}>
               <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </span>
            <input 
               placeholder="Search by patient, doctor or medications..." 
               value={searchTerm}
               onChange={e => setSearchTerm(e.target.value)}
               style={{width: '100%', padding: '12px 14px 12px 44px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.95rem', boxSizing: 'border-box', outline: 'none'}}
            />
         </div>
      </div>

      {user.role !== 'patient' && (
        <div className="form-card">
          <h2 style={{marginTop: 0, marginBottom: '20px'}}>{editingId ? 'Edit Prescription' : 'Issue Prescription'}</h2>
          <form onSubmit={handleSubmit} className="form-grid">
            <div className="form-group">
              <label>Select Patient</label>
              <select 
                required 
                value={formData.patientId} 
                onChange={e => setFormData({...formData, patientId: e.target.value})}
                style={{width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'white'}}
              >
                <option value="">-- Choose Patient --</option>
                {patients.length > 0 ? (
                  [...patients].sort((a,b) => a.firstName.localeCompare(b.firstName)).map(p => (
                    <option key={p._id} value={p._id}>
                      {p.firstName} {p.lastName} ({p.email})
                    </option>
                  ))
                ) : (
                  <option disabled>No records in directory</option>
                )}
              </select>
            </div>
            {user.role === 'admin' && (
              <div className="form-group">
                <label>Select Prescribing Doctor</label>
                <select 
                  required 
                  value={formData.doctorId} 
                  onChange={e => setFormData({...formData, doctorId: e.target.value})}
                  style={{width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'white'}}
                >
                  <option value="">-- Choose Doctor --</option>
                  {[...doctors].sort((a,b) => a.firstName.localeCompare(b.firstName)).map(d => (
                    <option key={d._id} value={d._id}>
                      Dr. {d.firstName} {d.lastName} ({d.specialization})
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="form-group">
              <label>Medication Name</label>
              <input required placeholder="e.g. Amoxicillin 500mg" value={formData.medName} onChange={e => setFormData({...formData, medName: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Dosage</label>
              <input required placeholder="e.g. 1 Tablet" value={formData.dosage} onChange={e => setFormData({...formData, dosage: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Frequency</label>
              <input required placeholder="e.g. 3 times daily" value={formData.frequency} onChange={e => setFormData({...formData, frequency: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Duration</label>
              <input required placeholder="e.g. 7 days" value={formData.duration} onChange={e => setFormData({...formData, duration: e.target.value})} />
            </div>
            <div className="form-group full">
              <label>Doctor Notes</label>
              <textarea rows="3" placeholder="Additional instructions (e.g. take after meals)" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})}></textarea>
            </div>
            <div className="form-group full" style={{display: 'flex', gap: '10px'}}>
              <button type="submit" className="btn" style={{flex: 1}}>{editingId ? 'Update Record' : 'Create Record'}</button>
              {editingId && (
                <button 
                  type="button" 
                  className="btn" 
                  style={{background: '#94a3b8'}}
                  onClick={() => {
                    setEditingId(null);
                    setFormData({ patientId: '', doctorId: '', medName: '', dosage: '', frequency: '', duration: '', notes: '' });
                  }}
                >Cancel</button>
              )}
            </div>
          </form>
        </div>
      )}

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Issue Date</th>
              <th>Patient Name</th>
              {user.role !== 'doctor' && <th>Prescribing Doctor</th>}
              <th>Medication Details</th>
              <th>Medical Notes</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {prescriptions.filter(p => {
              const pName = getPatientName(p.patientId).toLowerCase();
              const dName = getDoctorName(p.doctorId).toLowerCase();
              const meds = (p.medications || []).map(m => m.name).join(' ').toLowerCase();
              const notes = (p.notes || '').toLowerCase();
              const match = pName.includes(searchTerm.toLowerCase()) || 
                            dName.includes(searchTerm.toLowerCase()) || 
                            meds.includes(searchTerm.toLowerCase()) ||
                            notes.includes(searchTerm.toLowerCase());
              return match;
            }).map(p => (
              <tr key={p._id}>
                <td style={{fontWeight: 600, color: '#475569'}}>
                   {new Date(p.dateIssued).toLocaleDateString([], { dateStyle: 'medium' })}
                </td>
                <td style={{fontWeight: 600, color: '#0f172a'}}>
                   {getPatientName(p.patientId)}
                </td>
                {user.role !== 'doctor' && (
                  <td style={{fontWeight: 600, color: '#0f172a'}}>
                    {getDoctorName(p.doctorId)}
                  </td>
                )}
                <td>
                  {p.medications.map((m, i) => (
                    <div key={i} className="status-badge Scheduled" style={{marginBottom: '6px', display: 'block', textAlign: 'center', padding: '8px', border: '1px solid #e2e8f0'}}>
                      <div style={{fontWeight: 700}}>{m.name}</div>
                      <div style={{fontSize: '0.8rem', opacity: 0.9}}>{m.dosage} • {m.frequency}</div>
                      <div style={{fontSize: '0.75rem', fontWeight: 600}}>Duration: {m.duration}</div>
                    </div>
                  ))}
                </td>
                <td style={{fontSize: '0.9rem', color: '#64748b', lineHeight: '1.4'}}>{p.notes || 'No additional instructions.'}</td>
                <td>
                   <div style={{display: 'flex', gap: '6px'}}>
                      <button 
                        onClick={() => downloadPDF(p)}
                        className="btn"
                        style={{padding: '6px 12px', fontSize: '0.8rem', background: '#3b82f6', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '6px'}}
                      >PDF</button>
                      {user.role !== 'patient' && (
                        <>
                          <button 
                            onClick={() => handleEdit(p)}
                            className="btn"
                            style={{padding: '6px 12px', fontSize: '0.8rem', background: '#f59e0b', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '6px'}}
                          >Edit</button>
                          <button 
                            onClick={() => handleDelete(p._id)}
                            className="btn"
                            style={{padding: '6px 12px', fontSize: '0.8rem', background: '#ef4444', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '6px'}}
                          >Del</button>
                        </>
                      )}
                   </div>
                </td>
              </tr>
            ))}
            {prescriptions.length > 0 && prescriptions.filter(p => {
              const pName = getPatientName(p.patientId).toLowerCase();
              const dName = getDoctorName(p.doctorId).toLowerCase();
              const meds = (p.medications || []).map(m => m.name).join(' ').toLowerCase();
              const notes = (p.notes || '').toLowerCase();
              return pName.includes(searchTerm.toLowerCase()) || 
                     dName.includes(searchTerm.toLowerCase()) || 
                     meds.includes(searchTerm.toLowerCase()) ||
                     notes.includes(searchTerm.toLowerCase());
            }).length === 0 && (
              <tr><td colSpan={user.role === 'doctor' ? "5" : "6"} style={{textAlign: 'center', padding: '40px', color: '#64748b'}}>No records match your search criteria.</td></tr>
            )}
            {prescriptions.length === 0 && <tr><td colSpan={user.role === 'doctor' ? "5" : "6"} style={{textAlign: 'center', padding: '40px'}}>No records found.</td></tr>}
          </tbody>
        </table>
      </div>

      {/* Professional A5 Prescription Pad (Print-Only) */}
      <style>{`
        @media screen { .print-prescription { display: none; } }
        @media print {
          @page { size: A5 portrait; margin: 0 !important; }
          body * { visibility: hidden; }
          .print-prescription, .print-prescription * { visibility: visible; }
          .print-prescription { 
            position: absolute; left: 0; top: 0; width: 100%; 
            padding: 10mm; background: white; color: #0f172a;
            font-family: 'Inter', 'Segoe UI', serif;
            box-sizing: border-box;
          }
          .presc-pad {
            border: 1.5px solid #0f172a; padding: 12mm; 
            min-height: 190mm; position: relative;
            box-sizing: border-box;
            background: white;
          }
          .presc-letterhead { 
            display: flex; justify-content: space-between; 
            border-bottom: 2px solid #0f172a; padding-bottom: 10px; 
            margin-bottom: 20px; 
          }
          .hospital-name { font-size: 1.6rem; font-weight: 900; color: #0f172a; margin: 0; }
          .hospital-sub { font-size: 0.75rem; color: #334155; font-weight: 700; text-transform: uppercase; }
          
          .rx-symbol { font-size: 3.5rem; font-family: 'Times New Roman', serif; color: #0f172a; margin: 5px 0; line-height: 1; }
          
          .meds-table { width: 100%; border-collapse: collapse; margin-top: 5px; }
          .meds-table th { text-align: left; border-bottom: 1.5px solid #cbd5e1; padding: 6px 0; color: #475569; font-size: 0.75rem; }
          .meds-table td { padding: 10px 0; vertical-align: top; border-bottom: 0.5px solid #f1f5f9; font-size: 0.95rem; }
          
          .seal-area { position: absolute; bottom: 15mm; right: 15mm; text-align: center; }
          .signature-box { border-bottom: 1.5px solid #0f172a; width: 180px; margin-bottom: 5px; }
        }
      `}</style>

      {/* Custom Deletion Modal */}
      {deleteId && (
        <div style={{position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000}}>
          <div className="fade-in" style={{background: 'white', padding: '30px', borderRadius: '16px', maxWidth: '400px', width: '90%', textAlign: 'center', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'}}>
            <div style={{background: '#fee2e2', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px'}}>
              <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
            </div>
            <h3 style={{margin: '0 0 10px 0', fontSize: '1.25rem', color: '#0f172a'}}>Delete Prescription?</h3>
            <p style={{margin: '0 0 24px 0', color: '#64748b', fontSize: '0.95rem'}}>This action cannot be undone. The medical record will be permanently removed.</p>
            <div style={{display: 'flex', gap: '12px'}}>
              <button 
                onClick={() => setDeleteId(null)}
                style={{flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', background: 'white', fontWeight: 600, cursor: 'pointer'}}
              >Cancel</button>
              <button 
                onClick={confirmDelete}
                style={{flex: 1, padding: '12px', borderRadius: '10px', border: 'none', background: '#ef4444', color: 'white', fontWeight: 600, cursor: 'pointer'}}
              >Confirm Delete</button>
            </div>
          </div>
        </div>
      )}

      {printingDoc && (
        <div className="print-prescription">
          <div className="presc-pad">
            {/* Header Area */}
            <div className="presc-letterhead" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2.5px solid #0f172a', paddingBottom: '15px', marginBottom: '25px'}}>
              <div style={{display: 'flex', alignItems: 'center', gap: '20px'}}>
                <img src="/src/assets/icon.png" alt="Logo" style={{width: '65px', height: '65px', borderRadius: '10px'}} />
                <div>
                  <h1 className="hospital-name" style={{fontSize: '1.8rem', margin: 0}}>MediHealth Clinic</h1>
                  <p className="hospital-sub" style={{margin: '2px 0 0 0'}}>Registered Medical Practice</p>
                  <p style={{fontSize: '0.8rem', marginTop: '6px', color: '#475569', lineHeight: 1.3}}>
                    123, Malabe, Sri Lanka<br/>
                    +94 (70) 234-5678
                  </p>
                </div>
              </div>
              <div style={{textAlign: 'right'}}>
                <h2 style={{margin: '0 0 4px 0', fontSize: '1.3rem', fontWeight: 800}}>{getDoctorName(printingDoc.doctorId)}</h2>
                <div style={{color: '#2563eb', fontWeight: 700, fontSize: '0.9rem'}}>{doctors.find(d => d._id === printingDoc.doctorId)?.specialization || 'Physician'}</div>
                <p style={{margin: '6px 0 0 0', fontSize: '0.75rem', color: '#64748b', fontWeight: 600}}>LIC NO: {printingDoc.doctorId.slice(-8).toUpperCase()}</p>
              </div>
            </div>

            {/* Patient Identity */}
            <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1.5px solid #e2e8f0', paddingBottom: '12px'}}>
              <div>
                <span style={{fontSize: '0.7rem', color: '#64748b', fontWeight: 700, letterSpacing: '0.05em'}}>NAME OF PATIENT</span>
                <p style={{margin: '4px 0 0 0', fontSize: '1.2rem', fontWeight: 800, color: '#0f172a'}}>{getPatientName(printingDoc.patientId)}</p>
              </div>
              <div style={{textAlign: 'right'}}>
                <span style={{fontSize: '0.7rem', color: '#64748b', fontWeight: 700, letterSpacing: '0.05em'}}>DATE ISSUED</span>
                <p style={{margin: '4px 0 0 0', fontSize: '1.1rem', fontWeight: 700, color: '#0f172a'}}>{new Date(printingDoc.dateIssued).toLocaleDateString(undefined, { day: '2-digit', month: '2-digit', year: 'numeric' })}</p>
              </div>
            </div>



            {/* Medications */}
            <table className="meds-table">
              <thead>
                <tr>
                  <th style={{width: '60%'}}>MEDICATION & INSTRUCTIONS</th>
                  <th>DOSAGE</th>
                  <th style={{textAlign: 'right'}}>DURATION</th>
                </tr>
              </thead>
              <tbody>
                {printingDoc.medications.map((m, i) => (
                  <tr key={i}>
                    <td>
                      <div style={{fontWeight: 800}}>{m.name}</div>
                      <div style={{fontSize: '1rem', color: '#475569', marginTop: '4px'}}>Take {m.frequency}</div>
                    </td>
                    <td style={{fontWeight: 600}}>{m.dosage}</td>
                    <td style={{textAlign: 'right', fontWeight: 600}}>{m.duration}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Notes Section */}
            <div style={{marginTop: '30px'}}>
              <h4 style={{margin: '0 0 5px 0', fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748b'}}>Clinical Notes</h4>
              <div style={{minHeight: '80px', fontSize: '0.95rem', lineHeight: 1.4, color: '#1e293b', border: '1px solid #f1f5f9', padding: '10px', borderRadius: '4px'}}>
                {printingDoc.notes || "No special instructions."}
              </div>
            </div>

            <div style={{marginTop: 'auto', paddingTop: '20px'}}>
              <p style={{fontSize: '0.65rem', color: '#94a3b8', textAlign: 'center'}}>
                SECURE DIGITAL PRESCRIPTION • AUTH ID: {printingDoc._id.slice(-10)}
              </p>
            </div>

            {/* Signature Area */}
            <div className="seal-area">
              <div className="signature-box"></div>
              <p style={{margin: 0, fontSize: '0.75rem', fontWeight: 700}}>{getDoctorName(printingDoc.doctorId)}</p>
              <p style={{margin: '2px 0 0 0', fontSize: '0.6rem', color: '#64748b'}}>Physician Stamp</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Prescriptions;
