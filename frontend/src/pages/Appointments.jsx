import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Calendar, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmModal from '../components/ConfirmModal';
function Appointments() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [formData, setFormData] = useState({ patientId: '', doctorId: '', appointmentDate: '', status: 'Scheduled', notes: '' });

  const [availableDoctors, setAvailableDoctors] = useState([]);
  const [selectedAppt, setSelectedAppt] = useState(null); // For Detail Modal
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, apptId: null });


  const fetchAppointments = async () => {
    try {
      const res = await fetch('http://localhost:5000/appointments', { cache: 'no-store' });
      const data = await res.json();
      if(Array.isArray(data)) {
        if (user.role === 'admin') setAppointments(data);
        else if (user.role === 'doctor') setAppointments(data.filter(a => a.doctorId === user.id));
        else setAppointments(data.filter(a => a.patientId === user.id));
      }
    } catch (err) { console.error(err); }
  };

  // Full list for name resolution in the table
  const fetchDoctors = async () => {
    try {
      const res = await fetch('http://localhost:5000/doctors', { cache: 'no-store' });
      const data = await res.json();
      if(Array.isArray(data)) setDoctors(data);
    } catch (err) { console.error(err); }
  };

  // Server-side filtered: only online + approved doctors (for the booking dropdown)
  const fetchAvailableDoctors = async () => {
    try {
      const res = await fetch('http://localhost:5000/doctors?available=true', { cache: 'no-store' });
      const data = await res.json();
      if(Array.isArray(data)) setAvailableDoctors(data);
    } catch (err) { console.error(err); }
  };

  const fetchPatients = async () => {
    try {
      const res = await fetch('http://localhost:5000/patients', { cache: 'no-store' });
      const data = await res.json();
      if(Array.isArray(data)) {
        console.log("APPT_PATIENT_DATA:", data.length);
        const refined = data.filter(p => {
          const email = (p.email || '').toLowerCase();
          return !email.includes('doc') && !email.includes('admin');
        });
        setPatients(refined);
      }
    } catch (err) { console.error(err); }
  };

  const checkConflict = (selectedDate, doctorId) => {
    const doctor = doctors.find(d => d._id === doctorId);
    if (!doctor || !doctor.busySlots) return false;

    const bookingTime = new Date(selectedDate).getTime();
    return doctor.busySlots.some(slot => {
      const start = new Date(slot.start).getTime();
      const end = new Date(slot.end).getTime();
      return bookingTime >= start && bookingTime <= end;
    });
  };

  useEffect(() => { 
    fetchAppointments(); 
    fetchDoctors();
    fetchAvailableDoctors();
    fetchPatients();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 0. Date Validation
    const selectedDate = new Date(formData.appointmentDate);
    const now = new Date();
    if (selectedDate < now) {
      toast.error("Error: Appointment date must be in the future.");
      return;
    }

    // 1. Ensure a doctor was selected (for patients)
    const selectedDoctorId = user.role === 'doctor' ? user.id : formData.doctorId;
    if (user.role !== 'doctor' && !selectedDoctorId) {
      toast.error('Please select a doctor before booking.');
      return;
    }

    // 2. Re-fetch the doctor LIVE from the API to get the latest availability
    try {
      const liveRes = await fetch(`http://localhost:5000/doctors/${selectedDoctorId}`, { cache: 'no-store' });
      if (liveRes.ok) {
        const liveDoctor = await liveRes.json();
        if (!liveDoctor.isAvailable) {
          toast.error('This doctor is currently Offline. Please choose another.');
          fetchDoctors(); // Refresh the dropdown
          setFormData(prev => ({ ...prev, doctorId: '' }));
          return;
        }
      }
    } catch (err) {
      console.error('Could not validate doctor availability live:', err);
    }

    // 3. Check busy slot conflicts
    if (checkConflict(formData.appointmentDate, selectedDoctorId)) {
      toast.error('The selected doctor is busy during this time. Please choose another slot.');
      return;
    }

    try {
      const body = {
        ...formData,
        patientId: user.role === 'patient' ? user.id : formData.patientId,
        doctorId: user.role === 'doctor' ? user.id : formData.doctorId
      };

      const res = await fetch('http://localhost:5000/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (res.ok) {
        toast.success('Appointment booked successfully!');
        setFormData({ patientId: '', doctorId: '', appointmentDate: '', status: 'Scheduled', notes: '' });
        fetchAppointments();
      } else {
        const errData = await res.json();
        toast.error(`Failed to book appointment: ${errData.message || 'Server error'}`);
      }
    } catch (err) { 
      console.error(err); 
      toast.error("Network Error: Could not connect to the appointment service.");
    }
  };

  const rejectAppointment = (appointmentId) => {
    setConfirmModal({ isOpen: true, apptId: appointmentId });
  };

  const handleConfirmReject = async () => {
    const appointmentId = confirmModal.apptId;
    try {
      const res = await fetch(`http://localhost:5000/appointments/${appointmentId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Rejected' })
      });
      if (res.ok) {
        toast.success('Appointment has been rejected.');
        fetchAppointments();
      } else {
        toast.error('Failed to reject appointment.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Network error. Could not update appointment status.');
    }
  };

  const acceptAppointment = async (appointmentId) => {
    try {
      const res = await fetch(`http://localhost:5000/appointments/${appointmentId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Scheduled' })
      });
      if (res.ok) {
        toast.success('Appointment confirmed.');
        fetchAppointments();
      } else {
        toast.error('Failed to confirm appointment.');
      }
    } catch (err) {
      toast.error('Network error.');
    }
  };

  // Helper for names
  const getPatientName = (id) => {
    const p = patients.find(p => p._id === id);
    return p ? `${p.firstName} ${p.lastName}` : id;
  };
  const getDoctorName = (id) => {
    const d = doctors.find(d => d._id === id);
    return d ? `Dr. ${d.firstName} ${d.lastName}` : id;
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1>{user.role === 'admin' ? 'Appointments Calendar' : 'My Appointments'}</h1>
          <p>Complete record of registered patients</p>
        </div>
      </div>

      <div className="form-card" style={{padding: '24px', marginBottom: '30px', display: 'flex', flexWrap: 'wrap', gap: '15px', alignItems: 'center', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)'}}>
         <div style={{flex: '1 1 300px', position: 'relative'}}>
            <span style={{position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', display: 'flex', alignItems: 'center'}}>
               <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </span>
            <input 
               placeholder="Search by patient, doctor or notes..." 
               value={searchTerm}
               onChange={e => setSearchTerm(e.target.value)}
               style={{width: '100%', padding: '12px 14px 12px 44px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.95rem', boxSizing: 'border-box', outline: 'none'}}
            />
         </div>
         <div style={{flex: '0 0 200px'}}>
            <select 
               value={statusFilter} 
               onChange={e => setStatusFilter(e.target.value)}
               style={{width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', background: 'white', fontSize: '0.95rem', cursor: 'pointer', boxSizing: 'border-box'}}
            >
               <option value="All">All Statuses</option>
               <option value="Scheduled">Scheduled</option>
               <option value="Completed">Completed</option>
               <option value="Rejected">Rejected</option>
            </select>
         </div>
      </div>

      {user.role !== 'doctor' && (
        <div className="form-card">
          <h2 style={{marginTop: 0, marginBottom: '20px'}}>Book Appointment</h2>
        <form onSubmit={handleSubmit} className="form-grid">
          {user.role !== 'patient' && (
            <div className="form-group">
              <label>Patient ID</label>
              <input required={user.role !== 'patient'} placeholder="Enter Patient ID" value={formData.patientId} onChange={e => setFormData({...formData, patientId: e.target.value})} />
            </div>
          )}
          {user.role !== 'doctor' && (
            <div className="form-group">
              <label>Select Doctor</label>
              <select 
                required={user.role !== 'doctor'} 
                value={formData.doctorId} 
                onChange={e => setFormData({...formData, doctorId: e.target.value})}
                style={{width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'white'}}
              >
                <option value="">-- Choose a Doctor --</option>
                {[...doctors].filter(d => d.isApproved).sort((a, b) => (b.isAvailable - a.isAvailable)).map(d => (
                  <option 
                    key={d._id} 
                    value={d._id} 
                    disabled={!d.isAvailable}
                    style={{color: d.isAvailable ? 'inherit' : '#94a3b8'}}
                  >
                    Dr. {d.firstName} {d.lastName} ({d.specialization}) {!d.isAvailable ? ' - (Offline)' : ''}
                  </option>
                ))}
              </select>
              {doctors.filter(d => d.isApproved && d.isAvailable).length === 0 && (
                <p style={{color: '#ef4444', fontSize: '0.8rem', marginTop: '5px'}}>⚠️ No doctors are currently online. Please check back later.</p>
              )}
              {formData.doctorId && doctors.find(d => d._id === formData.doctorId)?.busySlots?.length > 0 && (
                <div style={{marginTop: '10px', fontSize: '0.8rem', color: '#f59e0b', background: '#fffbeb', padding: '10px', borderRadius: '6px', border: '1px solid #fef3c7'}}>
                  <strong>⚠️ Doctor Busy Times:</strong>
                  <ul style={{margin: '5px 0 0 15px', padding: 0}}>
                    {doctors.find(d => d._id === formData.doctorId).busySlots.map(s => (
                      <li key={s._id}>{new Date(s.start).toLocaleString()} - {new Date(s.end).toLocaleString()}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
          <div className="form-group">
            <label>Date & Time</label>
            <input required type="datetime-local" value={formData.appointmentDate} onChange={e => setFormData({...formData, appointmentDate: e.target.value})} />
          </div>
          <div className="form-group full">
            <label>Notes (Reason for Visit)</label>
            <input placeholder="Describe your symptoms or reason for visit (e.g. Regular checkup)" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} />
          </div>
          <button type="submit" className="btn full primary" style={{padding: '12px'}}>Book Appointment</button>
        </form>
      </div>
      )}

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Patient Name</th>
              {user.role !== 'doctor' && <th>Assigned Doctor</th>}
              <th>Appt. Schedule</th>
              <th>Current Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {appointments.filter(a => {
              const pName = getPatientName(a.patientId).toLowerCase();
              const dName = getDoctorName(a.doctorId).toLowerCase();
              const notes = (a.notes || '').toLowerCase();
              const matchesSearch = pName.includes(searchTerm.toLowerCase()) || dName.includes(searchTerm.toLowerCase()) || notes.includes(searchTerm.toLowerCase());
              const matchesStatus = statusFilter === 'All' || a.status === statusFilter;
              return matchesSearch && matchesStatus;
            }).map((a, idx) => (
              <tr key={a._id} style={a.status === 'Rejected' ? {background: '#fef2f2'} : {}}>
                <td style={{fontWeight: 600, color: '#0f172a'}}>
                   {getPatientName(a.patientId)}
                </td>
                {user.role !== 'doctor' && (
                  <td>
                    <div style={{fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px'}}>
                      {getDoctorName(a.doctorId)}
                      {doctors.find(d => d._id === a.doctorId)?.isAvailable ? (
                        <span title="Online Now" style={{width: '8px', height: '8px', background: '#22c55e', borderRadius: '50%', boxShadow: '0 0 4px rgba(34, 197, 94, 0.5)'}}></span>
                      ) : (
                        <span title="Offline" style={{width: '8px', height: '8px', background: '#94a3b8', borderRadius: '50%'}}></span>
                      )}
                    </div>
                  </td>
                )}
                <td>
                  <div style={{display: 'flex', alignItems: 'center', gap: '8px', color: '#475569'}}>
                    <Calendar size={14} style={{color: '#3b82f6'}} />
                    {new Date(a.appointmentDate).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                  </div>
                </td>
                <td>
                  <span className={`status-badge ${a.status === 'Rejected' ? 'Cancelled' : a.status}`}
                    style={a.status === 'Rejected' ? {background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca'} : {}}>
                    {a.status === 'Rejected' ? 'Rejected by Doctor' : a.status}
                  </span>
                </td>
                <td>
                  <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
                    <button 
                      onClick={() => setSelectedAppt(a)}
                      className="btn"
                      style={{padding: '6px 12px', fontSize: '0.8rem', background: '#f8fafc', color: '#1e293b', border: '1px solid #e2e8f0', cursor: 'pointer', borderRadius: '6px'}}
                    >View</button>
                    
                    {user.role === 'doctor' && (
                      <>
                        {a.status === 'Scheduled' && (
                          <button
                            onClick={() => rejectAppointment(a._id)}
                            className="btn"
                            style={{padding: '6px 14px', fontSize: '0.85rem', background: '#ef4444', color: 'white', borderRadius: '6px', cursor: 'pointer', border: 'none'}}
                          >Reject</button>
                        )}
                        {a.status === 'Rejected' && (
                          <button
                            onClick={() => acceptAppointment(a._id)}
                            className="btn"
                            style={{padding: '6px 14px', fontSize: '0.85rem', background: '#22c55e', color: 'white', borderRadius: '6px', cursor: 'pointer', border: 'none'}}
                          >Accept</button>
                        )}
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {appointments.length > 0 && appointments.filter(a => {
              const pName = getPatientName(a.patientId).toLowerCase();
              const dName = getDoctorName(a.doctorId).toLowerCase();
              const notes = (a.notes || '').toLowerCase();
              const matchesSearch = pName.includes(searchTerm.toLowerCase()) || dName.includes(searchTerm.toLowerCase()) || notes.includes(searchTerm.toLowerCase());
              const matchesStatus = statusFilter === 'All' || a.status === statusFilter;
              return matchesSearch && matchesStatus;
            }).length === 0 && (
              <tr><td colSpan={user.role === 'doctor' ? "4" : "5"} style={{textAlign: 'center', padding: '40px', color: '#64748b'}}>No appointments match your search or filters.</td></tr>
            )}
            {appointments.length === 0 && <tr><td colSpan={user.role === 'doctor' ? "4" : "5"} style={{textAlign: 'center', padding: '40px'}}>No records found.</td></tr>}
          </tbody>
        </table>
      </div>

      {/* Appointment Detail Modal */}
      {selectedAppt && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }} onClick={() => setSelectedAppt(null)}>
          <div style={{
            background: 'white', padding: '30px', borderRadius: '16px', 
            width: '90%', maxWidth: '500px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
          }} onClick={e => e.stopPropagation()}>
            <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '20px'}}>
              <h2 style={{margin: 0, color: '#0f172a'}}>Appointment Details</h2>
              <button 
                onClick={() => setSelectedAppt(null)}
                style={{background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#64748b'}}
              >&times;</button>
            </div>
            
            <div style={{display: 'grid', gap: '15px'}}>
              <div>
                <label style={{fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600}}>Patient</label>
                <p style={{margin: '5px 0', fontSize: '1.1rem', fontWeight: 600}}>{getPatientName(selectedAppt.patientId)}</p>
              </div>
              <div>
                <label style={{fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600}}>Date & Time</label>
                <p style={{margin: '5px 0'}}>{new Date(selectedAppt.appointmentDate).toLocaleString([], { dateStyle: 'full', timeStyle: 'short' })}</p>
              </div>
              <div style={{background: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0'}}>
                <label style={{fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600}}>Reason for Visit</label>
                <p style={{margin: '10px 0 0 0', lineHeight: 1.6, color: '#1e293b'}}>
                  {selectedAppt.notes || "No additional notes provided."}
                </p>
              </div>
            </div>
            
            <button 
              onClick={() => setSelectedAppt(null)}
              className="btn full primary" 
              style={{marginTop: '25px', padding: '12px'}}
            >Close Details</button>
          </div>
        </div>
      )}

      <ConfirmModal 
        isOpen={confirmModal.isOpen} 
        onClose={() => setConfirmModal({ isOpen: false, apptId: null })}
        onConfirm={handleConfirmReject}
        title="Reject Appointment?"
        message="Are you sure you want to reject this patient's clinical session? This action will notify the patient."
        type="danger"
      />
    </div>
  );
}
export default Appointments;
