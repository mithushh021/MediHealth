import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Users, UserRoundCog, CalendarCheck, FileText, CheckCircle, Clock, UserCheck, UserX, Plus, Trash2, Calendar, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmModal from '../components/ConfirmModal';

function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ 
    totalPatients: 0, 
    totalDoctors: 0, 
    appointments: 0, 
    prescriptions: 0,
    upcoming: 0
  });

  const [docData, setDocData] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [newSlot, setNewSlot] = useState({ start: '', end: '', note: 'Surgery/Break' });
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, slotId: null });

  const fetchDocData = async () => {
    if (user.role !== 'doctor') return;
    try {
      const res = await fetch(`http://localhost:5000/doctors/${user.id}`);
      const data = await res.json();
      setDocData(data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    fetchDocData();
    // Fetch data simultaneously via API Gateway
    const options = { cache: 'no-store' };
    Promise.all([
      fetch('http://localhost:5000/patients', options).then(r => r.json()),
      fetch('http://localhost:5000/doctors', options).then(r => r.json()),
      fetch('http://localhost:5000/appointments', options).then(r => r.json()),
      fetch('http://localhost:5000/prescriptions', options).then(r => r.json())
    ]).then(([p, d, a, pr]) => {
      let filteredA = a;
      let filteredPr = pr;

      if (user.role === 'doctor') {
        filteredA = a.filter(item => item.doctorId === user.id);
        filteredPr = pr.filter(item => item.doctorId === user.id);
      } else if (user.role === 'patient') {
        filteredA = a.filter(item => item.patientId === user.id);
        filteredPr = pr.filter(item => item.patientId === user.id);
      }

      setStats({
        totalPatients: p.length || 0,
        totalDoctors: d.length || 0,
        onlineDoctors: d.filter(doc => doc.isAvailable).length || 0,
        appointments: filteredA.length || 0,
        prescriptions: filteredPr.length || 0,
        upcoming: filteredA.filter(item => item.status === 'Scheduled').length || 0
      });

      // Map names for the Dashboard table
      const enhancedA = filteredA.map(appt => {
        const patient = p.find(pat => pat._id === appt.patientId);
        const doctor = d.find(doc => doc._id === appt.doctorId);
        return {
          ...appt,
          patientName: patient ? `${patient.firstName} ${patient.lastName}` : 'Registered Patient',
          doctorName: doctor ? `Dr. ${doctor.firstName} ${doctor.lastName}` : 'Clinical Staff'
        };
      });

      setAppointments(enhancedA.filter(a => a.status === 'Scheduled' || a.status === 'Accepted').slice(0, 5));
    }).catch(err => console.error("Error fetching stats:", err));
  }, [user]);

  const toggleAvailability = async () => {
    try {
      const res = await fetch(`http://localhost:5000/doctors/${user.id}/availability`, { method: 'PUT' });
      if (res.ok) {
        fetchDocData();
        toast.success('Availability status updated successfully!');
      } else {
        toast.error('Failed to update availability status.');
      }
    } catch (err) { 
      console.error(err); 
      toast.error('Network Error: Could not update status.');
    }
  };

  const addBusySlot = async (e) => {
    e.preventDefault();
    
    // 1. Logic Validation
    const start = new Date(newSlot.start);
    const end = new Date(newSlot.end);
    const now = new Date();

    if (start < now) {
      toast.error("Error: Start time cannot be in the past.");
      return;
    }

    if (end <= start) {
      toast.error("Error: End time must be at least 15 minutes after start time.");
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/doctors/${user.id}/busy-slots`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSlot)
      });
      if (res.ok) {
        toast.success('Busy slot added successfully!');
        fetchDocData();
        setNewSlot({ start: '', end: '', note: 'Surgery/Break' });
      } else {
        toast.error('Failed to add busy slot.');
      }
    } catch (err) { 
      console.error(err); 
      toast.error('Network Error: Could not connect to service.');
    }
  };

  const removeBusySlot = (slotId) => {
    setConfirmModal({ isOpen: true, slotId });
  };

  const executeRemoveBusySlot = async () => {
    const slotId = confirmModal.slotId;
    try {
      const res = await fetch(`http://localhost:5000/doctors/${user.id}/busy-slots/${slotId}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Busy slot removed.');
        fetchDocData();
      } else {
        toast.error('Failed to remove busy slot.');
      }
    } catch (err) { 
      console.error(err); 
      toast.error('Network Error.');
    }
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1>Hello, {user.name}</h1>
          <p>{user.role === 'admin' ? 'Global System Insights' : `Your ${user.role} Dashboard Overview`}</p>
        </div>
      </div>

      <div className="summary-grid">
        {user.role === 'admin' ? (
          <>
            <div className="summary-card">
              <div className="summary-info">
                <h3>Total Patients</h3>
                <p>{stats.totalPatients}</p>
              </div>
              <div className="icon-wrapper blue"><Users size={28} /></div>
            </div>
            <div className="summary-card">
              <div className="summary-info">
                <h3>Active Doctors</h3>
                <p>{stats.totalDoctors} <span style={{fontSize: '0.8rem', opacity: 0.8}}>({stats.onlineDoctors} Online)</span></p>
              </div>
              <div className="icon-wrapper green"><UserRoundCog size={28} /></div>
            </div>
          </>
        ) : (
          <div className="summary-card">
            <div className="summary-info">
              <h3>Upcoming Sessions</h3>
              <p>{stats.upcoming}</p>
            </div>
            <div className="icon-wrapper blue"><Clock size={28} /></div>
          </div>
        )}

        <div className="summary-card">
          <div className="summary-info">
            <h3>{user.role === 'admin' ? 'Total Appointments' : 'My Appointments'}</h3>
            <p>{stats.appointments}</p>
          </div>
          <div className="icon-wrapper purple"><CalendarCheck size={28} /></div>
        </div>

        <div className="summary-card">
          <div className="summary-info">
            <h3>{user.role === 'admin' ? 'Total Prescriptions' : 'My Prescriptions'}</h3>
            <p>{stats.prescriptions}</p>
          </div>
          <div className="icon-wrapper orange"><FileText size={28} /></div>
        </div>

        <div className="summary-card">
          <div className="summary-info">
            <h3>System Status</h3>
            <p>Active</p>
          </div>
          <div className="icon-wrapper green"><CheckCircle size={28} /></div>
        </div>
      </div>

      <div className="dashboard-grid" style={{
        display: 'grid', 
        gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', 
        gap: '25px', 
        marginTop: '30px', 
        alignItems: 'start'
      }}>
        {/* Universal Schedule / Recent Bookings */}
        <div className="form-card" style={{margin: 0, padding: '24px'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
            <h2 style={{margin: 0, fontSize: '1.25rem'}}>Upcoming Schedule</h2>
            <button className="btn" style={{margin: 0, padding: '8px 16px', fontSize: '0.85rem'}} onClick={() => window.location.hash = '#/appointments'}>Full Calendar</button>
          </div>
          <div className="table-container" style={{boxShadow: 'none', border: '1px solid #f1f5f9'}}>
            <table style={{fontSize: '0.9rem'}}>
              <thead>
                <tr>
                  <th>{user.role === 'patient' ? 'Doctor' : 'Patient'}</th>
                  <th>Date & Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map(appt => (
                  <tr key={appt._id}>
                    <td style={{fontWeight: 600, color: '#0f172a'}}>{user.role === 'patient' ? appt.doctorName : appt.patientName}</td>
                    <td>{new Date(appt.appointmentDate).toLocaleDateString()} at {new Date(appt.appointmentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                    <td>
                      <span className={`status-badge ${appt.status}`} style={{fontSize: '0.75rem'}}>
                        {appt.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {appointments.length === 0 && (
                  <tr>
                    <td colSpan="3" style={{textAlign: 'center', padding: '40px', color: '#94a3b8'}}>
                      No scheduled sessions for your profile.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Sidebar - Role Specific Content */}
        <div style={{display: 'flex', flexDirection: 'column', gap: '25px'}}>
          {user.role === 'admin' && (
            <div className="form-card" style={{margin: 0, padding: '24px', background: '#f8fafc', border: '1px solid #e2e8f0'}}>
              <h3 style={{marginTop: 0, fontSize: '1rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px'}}>
                <Shield size={20} className="text-primary" /> Required Actions
              </h3>
              <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0'}}>
                  <div style={{fontSize: '0.85rem', color: '#64748b'}}>Credential Approvals</div>
                  <div style={{fontWeight: 800, color: '#ef4444', fontSize: '1.2rem'}}>{stats.pendingApprovals || 0}</div>
                </div>
                <button 
                  className="btn primary full" 
                  style={{fontSize: '0.9rem', margin: '8px 0 0 0', padding: '12px'}}
                  onClick={() => window.location.hash = '#/user-management'}
                >Review Applications</button>
              </div>
            </div>
          )}

          {user.role === 'doctor' && docData && (
            <>
              <div className="form-card" style={{margin: 0, padding: '24px'}}>
                 <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
                   <h3 style={{margin: 0, fontSize: '1rem'}}>Active Status</h3>
                   <div style={{width: '10px', height: '10px', borderRadius: '50%', background: docData.isAvailable ? '#22c55e' : '#ef4444', boxShadow: `0 0 8px ${docData.isAvailable ? '#22c55e66' : '#ef444466'}`}}></div>
                 </div>
                 <button 
                   onClick={toggleAvailability} 
                   className="btn full" 
                   style={{margin: 0, background: docData.isAvailable ? '#fef2f2' : '#f0fdf4', color: docData.isAvailable ? '#ef4444' : '#16a34a', border: '1px solid currentColor'}}
                 >
                   {docData.isAvailable ? <><UserX size={18} /> Go Offline</> : <><UserCheck size={18} /> Go Online</>}
                 </button>
              </div>

              <div className="form-card" style={{margin: 0, padding: '24px'}}>
                 <h3 style={{marginTop: 0, marginBottom: '20px', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '10px', color: '#0f172a'}}>
                   <Calendar size={22} className="text-secondary" /> Block My Time
                 </h3>
                 <form onSubmit={addBusySlot} style={{display: 'flex', flexDirection: 'column', gap: '18px', marginBottom: '15px'}}>
                    <div style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
                      <div style={{display: 'flex', flexDirection: 'column', gap: '6px'}}>
                        <label style={{fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em'}}>Start Time</label>
                        <input required type="datetime-local" value={newSlot.start} onChange={e => setNewSlot({...newSlot, start: e.target.value})} style={{padding: '10px 12px', fontSize: '0.9rem', width: '100%', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fcfdfe', boxSizing: 'border-box'}} />
                      </div>
                      <div style={{display: 'flex', flexDirection: 'column', gap: '6px'}}>
                        <label style={{fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em'}}>End Time</label>
                        <input required type="datetime-local" value={newSlot.end} onChange={e => setNewSlot({...newSlot, end: e.target.value})} style={{padding: '10px 12px', fontSize: '0.9rem', width: '100%', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fcfdfe', boxSizing: 'border-box'}} />
                      </div>
                      <div style={{display: 'flex', flexDirection: 'column', gap: '6px'}}>
                        <label style={{fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em'}}>Reason / Note</label>
                        <input placeholder="e.g. Surgery or Conference" value={newSlot.note} onChange={e => setNewSlot({...newSlot, note: e.target.value})} style={{padding: '10px 12px', fontSize: '0.9rem', width: '100%', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fcfdfe', boxSizing: 'border-box'}} />
                      </div>
                    </div>
                    <button type="submit" className="btn primary" style={{margin: 0, width: '100%', padding: '12px', fontSize: '0.95rem', background: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'}}>
                      <Plus size={18} /> Add Block
                    </button>
                 </form>
                 <div style={{maxHeight: '140px', overflowY: 'auto'}}>
                    {docData.busySlots?.map(slot => (
                      <div key={slot._id} style={{display: 'flex', justifyContent: 'space-between', padding: '8px', background: '#f8fafc', borderRadius: '6px', marginBottom: '6px', border: '1px solid #e2e8f0', fontSize: '0.75rem'}}>
                        <div>
                          <div style={{fontWeight: 600, color: '#0f172a'}}>{new Date(slot.start).toLocaleDateString()} {new Date(slot.start).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                          <div style={{color: '#64748b'}}>{slot.note}</div>
                        </div>
                        <button onClick={() => removeBusySlot(slot._id)} style={{background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '5px'}}><Trash2 size={14}/></button>
                      </div>
                    ))}
                 </div>
              </div>
            </>
          )}

          {user.role === 'patient' && (
            <div className="form-card" style={{margin: 0, padding: '24px', background: '#eff6ff', border: '1px solid #dbeafe'}}>
              <h3 style={{marginTop: 0, fontSize: '1rem', color: '#1e40af', display: 'flex', alignItems: 'center', gap: '8px'}}>
                <FileText size={20} /> Medical Records
              </h3>
              <p style={{fontSize: '0.85rem', color: '#60a5fa', marginBottom: '15px', lineHeight: 1.5}}>Access your clinical history, previous doctor findings, and digital prescriptions.</p>
              <button 
                className="btn" 
                style={{background: 'white', color: '#2563eb', border: '1px solid #bfdbfe', margin: 0, width: '100%', padding: '12px'}}
                onClick={() => window.location.hash = '#/prescriptions'}
              >View Full History</button>
            </div>
          )}

          <div className="form-card" style={{margin: 0, padding: '20px', border: '1px dashed #e2e8f0', background: 'transparent', textAlign: 'center'}}>
             <p style={{margin: 0, fontSize: '0.75rem', color: '#94a3b8', fontWeight: 500}}>MediHealth Clinical Portal v2.4.0 <br/> Secure Encryption Active</p>
          </div>
        </div>
      </div>

      <ConfirmModal 
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, slotId: null })}
        onConfirm={executeRemoveBusySlot}
        title="Remove Blocked Slot?"
        message="Are you sure you want to remove this busy time slot? This slot will become available for appointments again."
        type="danger"
      />
    </div>
  );
}
export default Dashboard;
