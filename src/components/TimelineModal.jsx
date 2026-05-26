import React from 'react';
import { X, CheckCircle, Clock } from 'lucide-react';

const TimelineModal = ({ os, onClose }) => {
  if (!os) return null;

  const milestones = [
    { label: 'Abertura', date: os.DataAbertura },
    { label: 'Entrada na Oficina', date: os.DataOficina },
    { label: 'Negociação', date: os.DataNegociacao },
    { label: 'Aprovação', date: os.DataAprovacao },
    { label: 'Aguardando Peças (NP)', date: os.DataNP },
    { label: 'Execução (Produção)', date: os.DataProducao },
    { label: 'Testes / Conclusão', date: os.DataConclusao },
    { label: 'Fechamento Administrativo', date: os.DataFechamento },
  ];

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.6)', zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }} onClick={onClose}>
      <div style={{
        background: 'var(--bg-secondary)', width: '450px', maxWidth: '90%',
        borderRadius: 'var(--border-radius-md)', padding: '24px',
        border: '1px solid var(--border-color)', boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
        position: 'relative'
      }} onClick={e => e.stopPropagation()}>
        
        <button onClick={onClose} style={{
          position: 'absolute', top: '16px', right: '16px',
          background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)'
        }}>
          <X size={20} />
        </button>

        <h2 style={{ fontSize: '1.25rem', marginBottom: '8px', color: 'var(--text-primary)' }}>
          OS {os.ID_OS} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: '400' }}>({os.Serie})</span>
        </h2>
        <div style={{ marginBottom: '24px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Modelo: <strong style={{ color: 'var(--text-primary)' }}>{os.Modelo}</strong> | 
          Status: <strong style={{ color: 'var(--accent-primary)' }}>{os.StatusFinal}</strong>
        </div>

        <div style={{ position: 'relative', paddingLeft: '24px' }}>
          <div style={{
            position: 'absolute', left: '7px', top: '0', bottom: '0',
            width: '2px', background: 'var(--border-color)'
          }}></div>

          {milestones.map((step, i) => {
            const hasDate = step.date && step.date.trim() !== '';
            return (
              <div key={i} style={{ position: 'relative', marginBottom: '16px' }}>
                <div style={{
                  position: 'absolute', left: '-24px', top: '2px',
                  background: 'var(--bg-secondary)', borderRadius: '50%'
                }}>
                  {hasDate 
                    ? <CheckCircle size={16} color="var(--status-success)" /> 
                    : <Clock size={16} color="var(--border-color)" />}
                </div>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: '600', color: hasDate ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                    {step.label}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: hasDate ? 'var(--accent-primary)' : 'var(--text-muted)' }}>
                    {hasDate ? step.date : 'Pendente / Não registrado'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};

export default TimelineModal;
