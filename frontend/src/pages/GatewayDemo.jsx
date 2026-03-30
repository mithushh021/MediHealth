import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Network, Rocket, Plug, XCircle, CheckCircle2, FlaskConical, List, Code, FolderOpen, Folder, ExternalLink, Tag, FileText, ArrowRight, ArrowLeft, Terminal, Copy } from 'lucide-react';

const GATEWAY = 'http://localhost:5000';
const SERVICES = {
  patients:      { name: 'Patient Service',      direct: 'http://localhost:5001', color: '#3b82f6', endpoints: ['/patients'] },
  doctors:       { name: 'Doctor Service',       direct: 'http://localhost:5002', color: '#8b5cf6', endpoints: ['/doctors'] },
  appointments:  { name: 'Appointment Service',  direct: 'http://localhost:5003', color: '#f59e0b', endpoints: ['/appointments'] },
  prescriptions: { name: 'Prescription Service', direct: 'http://localhost:5004', color: '#10b981', endpoints: ['/prescriptions'] },
};

const PRESET_EXAMPLES = {
  GET: [
    { label: 'Patient Service: Get All Patients', url: 'http://localhost:5000/patients', body: '' },
    { label: 'Doctor Service: Get All Clinical Staff', url: 'http://localhost:5000/doctors', body: '' },
    { label: 'Appointment Service: Fetch Schedule', url: 'http://localhost:5000/appointments', body: '' },
    { label: 'Prescription Service: Read Records', url: 'http://localhost:5000/prescriptions', body: '' }
  ],
  POST: [
    { label: 'Patient Service: Register Patient', url: 'http://localhost:5000/patients', body: JSON.stringify({ firstName: "Demo", lastName: "User", email: "demo_" + Math.floor(Math.random()*1000) + "@test.com", phone: "0771234567", gender: "Male", dateOfBirth: "1990-01-01" }, null, 2) },
    { label: 'Doctor Service: Hire Doctor', url: 'http://localhost:5000/doctors', body: JSON.stringify({ firstName: "Sarah", lastName: "Connor", email: "sarah" + Math.floor(Math.random()*1000) + "@medhealth.co", specialization: "Neurology", experience: 10, contactNumber: "0771231234", qualifications: ["MBBS"] }, null, 2) },
    { label: 'Appointment Service: Book Session', url: 'http://localhost:5000/appointments', body: JSON.stringify({ patientId: "PATIENT_ID_HERE", doctorId: "DOCTOR_ID_HERE", date: "2026-05-10T10:00:00Z", reason: "General Checkup" }, null, 2) },
    { label: 'Prescription Service: Issue Scripts', url: 'http://localhost:5000/prescriptions', body: JSON.stringify({ patientId: "PATIENT_ID", doctorId: "DOCTOR_ID", medications: [{ name: "Aspirin", dosage: "500px", instructions: "Twice daily" }] }, null, 2) }
  ],
  PUT: [
    { label: 'Patient Service: Update Info', url: 'http://localhost:5000/patients/REPLACE_WITH_ID', body: JSON.stringify({ phone: "0779998888", gender: "Other" }, null, 2) },
    { label: 'Doctor Service: Update Details', url: 'http://localhost:5000/doctors/REPLACE_WITH_ID', body: JSON.stringify({ experience: 12, specialization: "Senior Neurology" }, null, 2) },
    { label: 'Appointment Service: Status Update', url: 'http://localhost:5000/appointments/APP_ID_HERE/status', body: JSON.stringify({ status: "Completed" }, null, 2) },
    { label: 'Prescription Service: Revise Meds', url: 'http://localhost:5000/prescriptions/SCRIPT_ID', body: JSON.stringify({ medications: [{ name: "Aspirin", dosage: "500px", instructions: "Once daily" }] }, null, 2) }
  ],
  DELETE: [
    { label: 'Patient Service: Delete Patient', url: 'http://localhost:5000/patients/REPLACE_WITH_ID', body: '' },
    { label: 'Doctor Service: Delete Doctor', url: 'http://localhost:5000/doctors/REPLACE_WITH_ID', body: '' },
    { label: 'Appointment Service: Cancel Session', url: 'http://localhost:5000/appointments/APP_ID_HERE', body: '' },
    { label: 'Prescription Service: Delete Record', url: 'http://localhost:5000/prescriptions/SCRIPT_ID', body: '' }
  ]
};

const updateUrlPort = (url, useGw) => {
  try {
    const u = new URL(url);
    if (useGw) {
      u.port = '5000';
    } else {
      if (u.pathname.startsWith('/patients')) u.port = '5001';
      else if (u.pathname.startsWith('/doctors')) u.port = '5002';
      else if (u.pathname.startsWith('/appointments')) u.port = '5003';
      else if (u.pathname.startsWith('/prescriptions')) u.port = '5004';
    }
    return u.toString();
  } catch (e) {
    return url;
  }
};

const GATEWAY_CODE = `// api-gateway/server.js — Lines 10–40
// All traffic enters at a SINGLE port: 5000
// and is routed to the correct microservice.

const routes = {
  '/patients':      'http://localhost:5001',
  '/doctors':       'http://localhost:5002',
  '/appointments':  'http://localhost:5003',
  '/prescriptions': 'http://localhost:5004',
};

Object.entries(routes).forEach(([path, target]) => {
  app.use(path, createProxyMiddleware({
    target,
    changeOrigin: true,
    pathRewrite: { '^': path },
    onProxyReq: (proxyReq, req) => {
      console.log(\`[Proxy] \${req.method} \${req.url} -> \${target}\${proxyReq.path}\`);
    },
  }));
});

app.listen(5000, () => {
  console.log('API Gateway is running on http://localhost:5000');
});`;

const GITHUB_LINK = 'https://github.com/mithushh021/MediHealth/blob/main/api-gateway/server.js';

function StatusBadge({ status }) {
  if (!status) return null;
  const ok = status >= 200 && status < 300;
  return (
    <span style={{
      padding: '3px 10px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 700,
      background: ok ? '#dcfce7' : '#fee2e2', color: ok ? '#16a34a' : '#dc2626'
    }}>
      {status} {ok ? '✓ OK' : '✗ Error'}
    </span>
  );
}

export default function GatewayDemo() {
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState({});
  const [showCode, setShowCode] = useState(false);
  const [activeTab, setActiveTab] = useState('tester');

  // Sandbox State
  const [sandboxMethod, setSandboxMethod] = useState('POST');
  const [sandboxUseGateway, setSandboxUseGateway] = useState(true);
  const [sandboxUrl, setSandboxUrl] = useState('http://localhost:5000/patients');
  const [sandboxBody, setSandboxBody] = useState(JSON.stringify({
    firstName: "Test",
    lastName: "User",
    email: "test.user" + Math.floor(Math.random() * 1000) + "@example.com",
    phone: "0771234567",
    dateOfBirth: "1990-01-01",
    gender: "Male"
  }, null, 2));
  const [sandboxResponse, setSandboxResponse] = useState(null);
  const [sandboxLoading, setSandboxLoading] = useState(false);

  const runSandbox = async () => {
    setSandboxLoading(true);
    setSandboxResponse(null);
    const start = Date.now();
    try {
      const opts = { method: sandboxMethod, headers: {} };
      if (sandboxMethod !== 'GET' && sandboxMethod !== 'DELETE') {
        opts.headers['Content-Type'] = 'application/json';
        if (sandboxBody.trim()) opts.body = sandboxBody;
      }
      const res = await fetch(sandboxUrl, opts);
      const data = await res.json().catch(() => null);
      setSandboxResponse({
        status: res.status,
        ok: res.ok,
        time: Date.now() - start,
        data: data || 'No valid JSON returned.'
      });
    } catch (err) {
      setSandboxResponse({ status: 0, ok: false, time: Date.now() - start, error: err.message });
    }
    setSandboxLoading(false);
  };

  const runTest = async (key, path, useGateway) => {
    const id = `${key}-${useGateway ? 'gw' : 'direct'}`;
    setLoading(prev => ({ ...prev, [id]: true }));
    const base = useGateway ? GATEWAY : SERVICES[key].direct;
    const url = `${base}${path}`;
    const start = Date.now();
    try {
      const res = await fetch(url, { cache: 'no-store' });
      const data = await res.json();
      const ms = Date.now() - start;
      setResults(prev => ({ ...prev, [id]: { status: res.status, url, ms, count: Array.isArray(data) ? data.length : 1, ok: res.ok } }));
    } catch (e) {
      setResults(prev => ({ ...prev, [id]: { status: 0, url, ms: Date.now() - start, error: e.message, ok: false } }));
    }
    setLoading(prev => ({ ...prev, [id]: false }));
  };

  const runAll = async (useGateway) => {
    Object.entries(SERVICES).forEach(([key, svc]) => {
      svc.endpoints.forEach(ep => runTest(key, ep, useGateway));
    });
  };

  const tabStyle = (active) => ({
    padding: '10px 22px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem',
    background: active ? '#2563eb' : 'transparent', color: active ? 'white' : '#64748b', transition: 'all 0.2s'
  });

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)', padding: '0', fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>
      {/* Header */}
      <div style={{ background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '14px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, #2563eb, #7c3aed)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
            <Network size={22} />
          </div>
          <div>
            <div style={{ color: 'white', fontWeight: 800, fontSize: '1.1rem' }}>API Gateway Live Demo</div>
            <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>IT4020 Microservices Assignment </div>
          </div>
        </div>
        <Link to="/login" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94a3b8', textDecoration: 'none', fontSize: '0.85rem', padding: '8px 16px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', transition: 'all 0.2s', background: 'rgba(255,255,255,0.02)' }}>
          <ArrowLeft size={16} /> Back to Login
        </Link>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px' }}>

        {/* Concept Banner */}
        <div style={{ background: 'rgba(37,99,235,0.12)', border: '1px solid rgba(37,99,235,0.3)', borderRadius: '16px', padding: '24px', marginBottom: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '20px', alignItems: 'center' }}>
            {/* Without Gateway */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: '#f87171', fontWeight: 700, fontSize: '0.85rem', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <XCircle size={16} /> Without Gateway
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {[['5001', '#3b82f6', '/patients'], ['5002', '#8b5cf6', '/doctors'], ['5003', '#f59e0b', '/appointments'], ['5004', '#10b981', '/prescriptions']].map(([port, color, label]) => (
                  <div key={port} style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${color}40`, borderRadius: '8px', padding: '6px 14px', color, fontWeight: 600, fontSize: '0.82rem' }}>
                    localhost:{port}{label}
                  </div>
                ))}
              </div>
            </div>
            {/* Arrow */}
            <div style={{ display: 'flex', alignItems: 'center', color: '#60a5fa' }}>
               <ArrowRight size={32} strokeWidth={2.5} />
            </div>
            {/* With Gateway */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: '#4ade80', fontWeight: 700, fontSize: '0.85rem', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <CheckCircle2 size={16} /> With Gateway
              </div>
              <div style={{ background: 'linear-gradient(135deg, #2563eb20, #7c3aed20)', border: '2px solid #2563eb', borderRadius: '12px', padding: '16px 32px', color: 'white', fontWeight: 800, fontSize: '1.2rem', boxShadow: '0 4px 20px rgba(37,99,235,0.15)' }}>
                localhost:5000
                <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 400, marginTop: '4px' }}>Single Entry Point → Routes Internally</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '12px', padding: '6px', display: 'inline-flex', gap: '4px', marginBottom: '30px', boxShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>
          <button style={{...tabStyle(activeTab === 'tester'), display: 'flex', alignItems: 'center', gap: '8px'}} onClick={() => setActiveTab('tester')}>
             <FlaskConical size={18} /> Live API Tester
          </button>
          <button style={{...tabStyle(activeTab === 'endpoints'), display: 'flex', alignItems: 'center', gap: '8px'}} onClick={() => setActiveTab('endpoints')}>
             <List size={18} /> All Endpoints
          </button>
          <button style={{...tabStyle(activeTab === 'external'), display: 'flex', alignItems: 'center', gap: '8px'}} onClick={() => setActiveTab('external')}>
             <Terminal size={18} /> API Sandbox
          </button>
          <button style={{...tabStyle(activeTab === 'code'), display: 'flex', alignItems: 'center', gap: '8px'}} onClick={() => setActiveTab('code')}>
             <Code size={18} /> View Code
          </button>
        </div>

        {/* --- TESTER TAB --- */}
        {activeTab === 'tester' && (
          <div className="fade-in">
            <div style={{ display: 'flex', gap: '16px', marginBottom: '28px' }}>
              <button 
                onClick={() => runAll(true)} 
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '14px 28px', background: 'linear-gradient(135deg, #2563eb, #7c3aed)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', fontSize: '0.95rem', boxShadow: '0 4px 15px rgba(37,99,235,0.3)', transition: 'transform 0.1s' }}
                onMouseDown={e => e.currentTarget.style.transform = 'scale(0.98)'}
                onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                <Rocket size={18} /> Test ALL via Gateway (Port 5000)
              </button>
              <button 
                onClick={() => runAll(false)} 
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '14px 28px', background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', fontSize: '0.95rem', transition: 'all 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.15)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
              >
                <Plug size={18} /> Test ALL Direct (Ports 5001–5004)
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(470px, 1fr))', gap: '16px' }}>
              {Object.entries(SERVICES).map(([key, svc]) => (
                <div key={key} style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${svc.color}30`, borderRadius: '14px', padding: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: svc.color }} />
                    <div style={{ color: 'white', fontWeight: 700, fontSize: '1rem' }}>{svc.name}</div>
                  </div>
                  {svc.endpoints.map(ep => {
                    const gwId = `${key}-gw`, dirId = `${key}-direct`;
                    const gwRes = results[gwId], dirRes = results[dirId];
                    return (
                      <div key={ep}>
                        {/* Gateway Test Row */}
                        <div style={{ background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(37,99,235,0.2)', borderRadius: '10px', padding: '12px', marginBottom: '8px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: gwRes ? '8px' : 0 }}>
                            <div>
                              <span style={{ fontSize: '0.7rem', color: '#60a5fa', fontWeight: 700 }}>VIA GATEWAY</span>
                              <div style={{ color: '#e2e8f0', fontFamily: 'monospace', fontSize: '0.85rem' }}>localhost:5000{ep}</div>
                            </div>
                            <button
                              onClick={() => runTest(key, ep, true)}
                              disabled={loading[gwId]}
                              style={{ padding: '6px 14px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '7px', fontWeight: 600, cursor: 'pointer', fontSize: '0.8rem', opacity: loading[gwId] ? 0.6 : 1 }}
                            >{loading[gwId] ? '...' : 'Test'}</button>
                          </div>
                          {gwRes && (
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                              <StatusBadge status={gwRes.status} />
                              <span style={{ color: '#94a3b8', fontSize: '0.78rem' }}>{gwRes.ms}ms</span>
                              {gwRes.count !== undefined && <span style={{ color: '#94a3b8', fontSize: '0.78rem' }}>{gwRes.count} record(s) returned</span>}
                              {gwRes.error && <span style={{ color: '#f87171', fontSize: '0.78rem' }}>{gwRes.error}</span>}
                            </div>
                          )}
                        </div>
                        {/* Direct Test Row */}
                        <div style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: '10px', padding: '12px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: dirRes ? '8px' : 0 }}>
                            <div>
                              <span style={{ fontSize: '0.7rem', color: '#f87171', fontWeight: 700 }}>DIRECT (BYPASSES GATEWAY)</span>
                              <div style={{ color: '#e2e8f0', fontFamily: 'monospace', fontSize: '0.85rem' }}>{svc.direct}{ep}</div>
                            </div>
                            <button
                              onClick={() => runTest(key, ep, false)}
                              disabled={loading[dirId]}
                              style={{ padding: '6px 14px', background: 'rgba(239,68,68,0.2)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '7px', fontWeight: 600, cursor: 'pointer', fontSize: '0.8rem', opacity: loading[dirId] ? 0.6 : 1 }}
                            >{loading[dirId] ? '...' : 'Test'}</button>
                          </div>
                          {dirRes && (
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                              <StatusBadge status={dirRes.status} />
                              <span style={{ color: '#94a3b8', fontSize: '0.78rem' }}>{dirRes.ms}ms</span>
                              {dirRes.count !== undefined && <span style={{ color: '#94a3b8', fontSize: '0.78rem' }}>{dirRes.count} record(s) returned</span>}
                              {dirRes.error && <span style={{ color: '#f87171', fontSize: '0.78rem' }}>{dirRes.error}</span>}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- ENDPOINTS TAB --- */}
        {activeTab === 'endpoints' && (
          <div className="fade-in">
            <div style={{ marginBottom: '20px', color: '#e2e8f0', fontSize: '0.95rem', background: 'rgba(37,99,235,0.1)', padding: '16px', borderRadius: '10px', borderLeft: '4px solid #3b82f6', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Network size={24} color="#60a5fa" />
              <div>All endpoints are accessible through both the <strong style={{color: '#60a5fa'}}>API Gateway (port 5000)</strong> and directly via their native service port. The frontend only uses port 5000.</div>
            </div>
            {Object.entries(SERVICES).map(([key, svc]) => (
              <div key={key} style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${svc.color}25`, borderRadius: '14px', padding: '20px', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: svc.color }} />
                  <div style={{ color: 'white', fontWeight: 700 }}>{svc.name}</div>
                  <span style={{ background: `${svc.color}20`, color: svc.color, padding: '2px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600 }}>PORT {svc.direct.split(':')[2]}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {[
                    ['GET', `/${key}`, 'List all records'],
                    ['GET', `/${key}/:id`, 'Get by ID'],
                    ['POST', `/${key}`, 'Create new record'],
                    ['PUT', `/${key}/:id`, 'Update record'],
                    ['DELETE', `/${key}/:id`, 'Delete record'],
                  ].map(([method, path, desc]) => (
                    <div key={path+method} style={{ display: 'flex', gap: '8px', alignItems: 'center', padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: 800, padding: '2px 8px', borderRadius: '4px', background: method === 'GET' ? '#166534' : method === 'POST' ? '#1e3a8a' : method === 'PUT' ? '#92400e' : '#7f1d1d', color: 'white', minWidth: '46px', textAlign: 'center' }}>{method}</span>
                      <span style={{ fontFamily: 'monospace', color: '#e2e8f0', fontSize: '0.82rem' }}>localhost:5000{path}</span>
                      <span style={{ color: '#64748b', fontSize: '0.78rem', marginLeft: 'auto' }}>{desc}</span>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: '12px', padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FileText size={14} color="#94a3b8" />
                  <span style={{ color: '#94a3b8', fontSize: '0.78rem' }}>Swagger Docs: </span>
                  <a href={`${svc.direct}/${key}/api-docs`} target="_blank" rel="noreferrer" style={{ color: svc.color, fontSize: '0.78rem', fontFamily: 'monospace', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {svc.direct}/{key}/api-docs <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* --- API SANDBOX TAB --- */}
        {activeTab === 'external' && (
          <div className="fade-in">
            <div style={{ marginBottom: '24px', color: '#e2e8f0', fontSize: '0.95rem', background: 'rgba(37,99,235,0.1)', padding: '16px 20px', borderRadius: '10px', borderLeft: '4px solid #3b82f6', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <Terminal size={26} color="#60a5fa" />
              <div>
                 <strong style={{ fontSize: '1.05rem' }}>Built-in API Sandbox</strong>
                 <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '4px' }}>
                    Send live HTTP requests directly from your browser. Test any endpoint exactly as you would in Postman.
                 </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
              {/* Request Builder */}
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '24px' }}>
                <div style={{ color: 'white', fontWeight: 700, marginBottom: '20px', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Network size={20} color="#60a5fa" /> Request Configuration
                </div>
                {/* Linked Dropdowns for Method & Action */}
                <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
                  <select 
                    value={sandboxMethod} 
                    onChange={e => {
                      const method = e.target.value;
                      setSandboxMethod(method);
                      const presets = PRESET_EXAMPLES[method];
                      if (presets && presets.length > 0) {
                        setSandboxUrl(updateUrlPort(presets[0].url, sandboxUseGateway));
                        setSandboxBody(presets[0].body);
                      }
                    }}
                    style={{ background: '#0f172a', color: 'white', border: '1px solid rgba(255,255,255,0.15)', padding: '12px 16px', borderRadius: '10px', fontWeight: 800, outline: 'none', cursor: 'pointer', minWidth: '120px' }}
                  >
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                    <option value="DELETE">DELETE</option>
                  </select>

                  <select 
                    onChange={(e) => {
                      const idx = parseInt(e.target.value);
                      if (idx >= 0) {
                        const presets = PRESET_EXAMPLES[sandboxMethod];
                        if (presets && presets[idx]) {
                          setSandboxUrl(updateUrlPort(presets[idx].url, sandboxUseGateway));
                          setSandboxBody(presets[idx].body);
                        }
                      }
                    }}
                    style={{ flex: 1, background: '#1e293b', color: '#60a5fa', border: '1px solid rgba(37,99,235,0.4)', padding: '12px 16px', borderRadius: '10px', fontWeight: 700, outline: 'none', cursor: 'pointer' }}
                  >
                    <option value="-1" disabled>-- Select an Action to Perform --</option>
                    {(PRESET_EXAMPLES[sandboxMethod] || []).map((ex, i) => (
                      <option key={i} value={i}>{ex.label}</option>
                    ))}
                  </select>
                </div>
                
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
                  <select
                    value={sandboxUseGateway ? "true" : "false"}
                    onChange={(e) => {
                      const isGw = e.target.value === "true";
                      setSandboxUseGateway(isGw);
                      setSandboxUrl(prev => updateUrlPort(prev, isGw));
                    }}
                    style={{ background: sandboxUseGateway ? '#166534' : '#7f1d1d', color: 'white', border: '1px solid rgba(255,255,255,0.15)', padding: '12px 14px', borderRadius: '10px', fontWeight: 800, outline: 'none', cursor: 'pointer', fontSize: '0.85rem', width: '200px' }}
                  >
                    <option value="true">🟢 With Gateway</option>
                    <option value="false">🔴 Without Gateway (Direct)</option>
                  </select>
                  <input 
                    type="text" 
                    value={sandboxUrl} 
                    onChange={e => setSandboxUrl(e.target.value)}
                    placeholder="http://localhost:5000/..."
                    style={{ flex: 1, minWidth: '300px', background: '#0f172a', color: '#e2e8f0', border: '1px solid rgba(255,255,255,0.15)', padding: '12px 16px', borderRadius: '10px', fontFamily: "'JetBrains Mono', 'Fira Code', monospace", fontSize: '0.9rem', outline: 'none' }}
                  />
                </div>

                <div style={{ marginBottom: '24px', opacity: (sandboxMethod === 'GET' || sandboxMethod === 'DELETE') ? 0.4 : 1, transition: 'opacity 0.2s', pointerEvents: (sandboxMethod === 'GET' || sandboxMethod === 'DELETE') ? 'none' : 'auto' }}>
                  <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem', fontWeight: 700, marginBottom: '8px' }}>JSON Body <span style={{fontWeight: 400, opacity: 0.7}}>(Only for POST/PUT)</span></label>
                  <textarea 
                    value={sandboxBody}
                    onChange={e => setSandboxBody(e.target.value)}
                    style={{ width: '100%', height: '180px', background: '#0f172a', color: '#e2e8f0', border: '1px solid rgba(255,255,255,0.15)', padding: '16px', borderRadius: '10px', fontFamily: "'JetBrains Mono', 'Fira Code', monospace", fontSize: '0.85rem', resize: 'vertical', outline: 'none', whiteSpace: 'pre' }}
                    spellCheck="false"
                  />
                </div>

                <button 
                  onClick={runSandbox}
                  disabled={sandboxLoading}
                  style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #2563eb, #7c3aed)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 800, fontSize: '1rem', cursor: sandboxLoading ? 'not-allowed' : 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', opacity: sandboxLoading ? 0.7 : 1, boxShadow: '0 4px 15px rgba(37,99,235,0.25)' }}
                >
                  <Rocket size={20} /> {sandboxLoading ? 'Sending...' : 'Send Request'}
                </button>
              </div>

              {/* Response Viewer */}
              <div style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div style={{ padding: '18px 24px', background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ color: 'white', fontWeight: 700, fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FileText size={20} color="#94a3b8" /> Response
                  </div>
                  {sandboxResponse && (
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', animation: 'fadeIn 0.3s' }}>
                      <span style={{ fontSize: '0.85rem', color: sandboxResponse.ok ? '#4ade80' : '#f87171', fontWeight: 800, background: sandboxResponse.ok ? 'rgba(74,222,128,0.15)' : 'rgba(248,113,113,0.15)', padding: '6px 14px', borderRadius: '20px' }}>
                        {sandboxResponse.status} {sandboxResponse.ok ? 'OK' : 'Error'}
                      </span>
                      <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 700 }}>{sandboxResponse.time} ms</span>
                    </div>
                  )}
                </div>
                
                <div style={{ padding: '24px', flex: 1, minHeight: '300px', maxHeight: '500px', overflowY: 'auto' }}>
                  {!sandboxResponse && !sandboxLoading && (
                    <div style={{ color: '#64748b', fontSize: '0.95rem', textAlign: 'center', marginTop: '80px', fontWeight: 500 }}>
                      Hit "Send Request" to see the response payload.
                    </div>
                  )}
                  {sandboxLoading && (
                    <div style={{ color: '#60a5fa', fontSize: '0.95rem', textAlign: 'center', marginTop: '80px', animation: 'pulse 1.5s infinite', fontWeight: 500 }}>
                      Awaiting response from {GATEWAY}...
                    </div>
                  )}
                  {sandboxResponse && sandboxResponse.error && (
                    <div style={{ color: '#f87171', fontSize: '0.9rem', fontFamily: "'JetBrains Mono', 'Fira Code', monospace", background: 'rgba(248,113,113,0.1)', padding: '16px', borderRadius: '8px' }}>
                      Error: {sandboxResponse.error}
                    </div>
                  )}
                  {sandboxResponse && sandboxResponse.data && (
                    <pre style={{ margin: 0, color: '#e2e8f0', fontFamily: "'JetBrains Mono', 'Fira Code', monospace", fontSize: '0.88rem', whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                      {JSON.stringify(sandboxResponse.data, null, 2)}
                    </pre>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- CODE TAB --- */}
        {activeTab === 'code' && (
          <div className="fade-in">
            <div style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}>
              <div style={{ padding: '18px 24px', background: '#1e293b', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <FolderOpen size={24} color="#60a5fa" />
                  <div>
                    <div style={{ color: 'white', fontWeight: 700, fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      api-gateway <ArrowRight size={14} color="#64748b" /> server.js
                    </div>
                    <div style={{ color: '#94a3b8', fontSize: '0.8rem', marginTop: '2px' }}>This is the precise code that implements the single entry point routing</div>
                  </div>
                </div>
                <a
                  href={GITHUB_LINK}
                  target="_blank"
                  rel="noreferrer"
                  style={{ padding: '10px 18px', background: '#334155', color: '#f8fafc', borderRadius: '8px', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', transition: 'background 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#475569'}
                  onMouseLeave={e => e.currentTarget.style.background = '#334155'}
                >
                  <ExternalLink size={18} /> View on GitHub
                </a>
              </div>
              {/* File Location Info */}
              <div style={{ padding: '14px 24px', background: 'rgba(15,23,42,0.8)', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Folder size={16} color="#64748b" />
                  <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Folder: </span>
                  <span style={{ color: '#e2e8f0', fontSize: '0.82rem', fontFamily: 'monospace' }}>MediHealth/api-gateway/server.js</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ExternalLink size={16} color="#64748b" />
                  <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Repository: </span>
                  <a href={GITHUB_LINK} target="_blank" rel="noreferrer" style={{ color: '#60a5fa', fontSize: '0.82rem', fontFamily: 'monospace', textDecoration: 'none' }}>mithushh021/MediHealth → server.js</a>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Tag size={16} color="#64748b" />
                  <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Key Lines: </span>
                  <span style={{ color: '#e2e8f0', fontSize: '0.82rem', fontFamily: 'monospace' }}>Lines 10–40 (Routing table + Proxy loop)</span>
                </div>
              </div>
              <pre style={{ margin: 0, padding: '28px', color: '#f8fafc', fontFamily: "'JetBrains Mono', 'Fira Code', monospace", fontSize: '0.88rem', lineHeight: '1.6', overflow: 'auto', background: '#0f172a', whiteSpace: 'pre-wrap' }}>
                {GATEWAY_CODE}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
