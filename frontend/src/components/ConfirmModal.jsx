import React from 'react';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, type = 'info' }) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
      background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
    }} onClick={onClose}>
      <div 
        style={{
          background: 'white', padding: '32px', borderRadius: '18px', 
          width: '90%', maxWidth: '400px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
          textAlign: 'center', animation: 'modalSlideUp 0.3s ease-out'
        }} 
        onClick={e => e.stopPropagation()}
      >
        <style>{`
          @keyframes modalSlideUp {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
        `}</style>

        <div style={{
          width: '56px', height: '56px', borderRadius: '50%', 
          background: type === 'danger' ? '#fef2f2' : '#eff6ff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px auto', color: type === 'danger' ? '#ef4444' : '#3b82f6'
        }}>
          {type === 'danger' ? <AlertCircle size={32} /> : <CheckCircle2 size={32} />}
        </div>

        <h2 style={{margin: '0 0 10px 0', color: '#0f172a', fontSize: '1.4rem', fontWeight: 800}}>{title}</h2>
        <p style={{margin: '0 0 24px 0', color: '#64748b', lineHeight: 1.5, fontSize: '0.95rem'}}>{message}</p>

        <div style={{display: 'flex', gap: '12px'}}>
          <button 
            onClick={() => { onConfirm(); onClose(); }}
            style={{
              flex: 1, padding: '12px', background: type === 'danger' ? '#ef4444' : '#3b82f6',
              color: 'white', border: 'none', borderRadius: '10px', fontWeight: 700,
              cursor: 'pointer', transition: 'all 0.2s'
            }}
          >Confirm</button>
          <button 
            onClick={onClose}
            style={{
              flex: 1, padding: '12px', background: '#f1f5f9', color: '#475569',
              border: 'none', borderRadius: '10px', fontWeight: 700,
              cursor: 'pointer', transition: 'all 0.2s'
            }}
          >Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
