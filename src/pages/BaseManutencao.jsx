import React, { useState } from 'react';
import { useDashboard } from '../context/DashboardContext';
import KPICard from '../components/KPICard';
import ChartCard from '../components/ChartCard';
import { Download } from 'lucide-react';
import { calcularEtapas, getSLABadge } from '../utils/dataUtils';
import TimelineModal from '../components/TimelineModal';

const BaseManutencao = () => {
  const { filteredData } = useDashboard();
  const [selectedOS, setSelectedOS] = useState(null);

  return (
    <div className="page-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Exibindo <strong style={{ color: 'var(--text-primary)' }}>{filteredData.length}</strong> ordens de serviço · Oficina <strong style={{ color: 'var(--accent-primary)' }}>Sumaré</strong> · Frota <strong style={{ color: 'var(--accent-primary)' }}>Caterpillar</strong>
        </div>
        <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: 'var(--accent-primary)', color: 'white', border: 'none', borderRadius: 'var(--border-radius-sm)', cursor: 'pointer', fontWeight: '600', fontSize: '0.875rem' }}>
          <Download size={16} /> Exportar
        </button>
      </div>

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>OS</th>
                <th>Série</th>
                <th>Modelo</th>
                <th>Componente</th>
                <th>Motivo</th>
                <th>Tipo (TAM)</th>
                <th>Abertura</th>
                <th>Conclusão</th>
                <th>Dias Total</th>
                <th>Peça Import.</th>
                <th>Atraso Peça</th>
                <th>Status</th>
                <th>SLA</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((os, i) => {
                const e = calcularEtapas(os);
                const badge = getSLABadge(os.StatusFinal, e.totalOS);
                return (
                  <tr key={i} onClick={() => setSelectedOS(os)} style={{ cursor: 'pointer' }} className="hover-row">
                    <td style={{ color: 'var(--accent-primary)', fontWeight: '700', whiteSpace: 'nowrap' }}>{os.ID_OS}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.82rem', whiteSpace: 'nowrap' }}>{os.Serie}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>{os.Modelo}</td>
                    <td>{os.Componente || '—'}</td>
                    <td>{os.MotivoParada || '—'}</td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{os.DescTAM || '—'}</td>
                    <td style={{ whiteSpace: 'nowrap', fontSize: '0.85rem' }}>{os.DataAbertura || os.DataOficina || '—'}</td>
                    <td style={{ whiteSpace: 'nowrap', fontSize: '0.85rem' }}>{os.DataConclusao || os.DataFechamento || '—'}</td>
                    <td style={{ fontWeight: '700', color: e.totalOS > 30 ? 'var(--status-danger)' : e.totalOS !== null ? 'var(--status-success)' : 'var(--text-muted)' }}>
                      {e.totalOS !== null ? `${e.totalOS}d` : '—'}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {os.PecasImportadas === 'Sim' ? <span style={{ color: 'var(--status-warning)', fontWeight: '700' }}>Sim</span> : <span style={{ color: 'var(--text-muted)' }}>Não</span>}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {os.AtrasosPecas === 'Sim' ? <span style={{ color: 'var(--status-danger)', fontWeight: '700' }}>⚠️ Sim</span> : <span style={{ color: 'var(--text-muted)' }}>Não</span>}
                    </td>
                    <td>
                      <span className={`badge ${os.StatusFinal === 'Finalizado' ? 'badge-success' : os.StatusFinal === 'Aguardando Peça' ? 'badge-danger' : 'badge-warning'}`}>
                        {os.StatusFinal || '—'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${badge.cls}`}>{badge.txt}</span>
                    </td>
                  </tr>
                );
              })}
              {filteredData.length === 0 && (
                <tr><td colSpan="13" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Nenhuma OS encontrada com os filtros atuais.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <TimelineModal os={selectedOS} onClose={() => setSelectedOS(null)} />
    </div>
  );
};

export default BaseManutencao;
