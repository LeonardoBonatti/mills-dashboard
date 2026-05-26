import React, { useMemo, useState } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { calcularEtapas, getSLABadge } from '../utils/dataUtils';
import KPICard from '../components/KPICard';
import ChartCard from '../components/ChartCard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Hourglass, ListOrdered, AlertOctagon, ArrowRight } from 'lucide-react';
import TimelineModal from '../components/TimelineModal';

const ETAPA_LABELS = [
  { key: 'entradaOficina', label: '1. Entrada → Oficina' },
  { key: 'diagnostico',    label: '2. Diagnóstico' },
  { key: 'aprovacao',      label: '3. Aprovação Orç.' },
  { key: 'pecas',          label: '4. Aguardando Peças' },
  { key: 'execucao',       label: '5. Execução' },
  { key: 'teste',          label: '6. Teste e Liberação' },
];

const ControleFilas = () => {
  const { filteredData, kpis } = useDashboard();
  const [selectedOS, setSelectedOS] = useState(null);


  const { fluxoData, maxGargalo, osPorEtapa } = useMemo(() => {
    const fluxo = ETAPA_LABELS.map(({ key, label }) => ({
      etapa: label, key, mediaDias: kpis.etapasMedia?.[key] || 0,
    }));
    const max = fluxo.reduce((p, c) => c.mediaDias > p.mediaDias ? c : p, { etapa: '—', mediaDias: 0 });

    // Group open OS by current stage
    const osPorEtapa = {};
    filteredData.filter(d => d.StatusFinal !== 'Finalizado').forEach(d => {
      const etapa = d.MotivoParada || d.StatusFinal || 'Não Informado';
      if (!osPorEtapa[etapa]) osPorEtapa[etapa] = [];
      osPorEtapa[etapa].push(d);
    });

    return { fluxoData: fluxo, maxGargalo: max, osPorEtapa };
  }, [filteredData, kpis]);

  const abertas = filteredData.filter(d => d.StatusFinal !== 'Finalizado').length;

  return (
    <div className="page-container">
      <div className="kpi-grid">
        <KPICard title="Tempo Médio Total (OS)" value={`${kpis.avgDias} dias`} icon={<Hourglass />} />
        <KPICard title="OS em Aberto" value={`${abertas}`} changeType="negative" change={`de ${filteredData.length} total`} icon={<ListOrdered />} />
        <KPICard title="Maior Gargalo" value={maxGargalo.etapa.replace(/^\d\. /, '')} change={`${maxGargalo.mediaDias}d média`} changeType="negative" icon={<AlertOctagon color="var(--status-danger)" />} />
      </div>

      {/* Flow + Chart */}
      <div className="charts-grid">
        <ChartCard title="Tempo Médio por Etapa (dias)">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={fluxoData} margin={{ top: 10, right: 20, left: 0, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
              <XAxis dataKey="etapa" stroke="var(--text-secondary)" tick={{ fontSize: 11 }} angle={-30} textAnchor="end" interval={0} />
              <YAxis stroke="var(--text-secondary)" />
              <Tooltip contentStyle={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }} />
              <Bar dataKey="mediaDias" name="Dias Médios" radius={[4, 4, 0, 0]}
                fill="var(--accent-primary)"
                label={{ position: 'top', fill: 'var(--text-secondary)', fontSize: 12 }} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Fluxo Operacional — Gargalos Visuais">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '8px 8px', justifyContent: 'center', height: '100%' }}>
            {fluxoData.map((item, i) => {
              const perc = Math.min(100, item.mediaDias > 0 ? Math.max(8, (item.mediaDias / 20) * 100) : 0);
              const col = item.mediaDias > 10 ? 'var(--status-danger)' : item.mediaDias > 5 ? 'var(--status-warning)' : 'var(--status-success)';
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '160px', fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: '500', flexShrink: 0 }}>{item.etapa}</div>
                  <div className="progress-bg" style={{ flex: 1 }}>
                    <div className="progress-fill" style={{ width: `${perc}%`, backgroundColor: col }} />
                  </div>
                  <div style={{ width: '40px', textAlign: 'right', fontSize: '0.85rem', fontWeight: '700', color: col }}>{item.mediaDias}d</div>
                  {i < fluxoData.length - 1 && <ArrowRight size={14} color="var(--text-muted)" style={{ flexShrink: 0 }} />}
                </div>
              );
            })}
            <div style={{ marginTop: '8px', display: 'flex', gap: '16px', fontSize: '0.78rem' }}>
              <span style={{ color: 'var(--status-success)' }}>■ Dentro do Prazo</span>
              <span style={{ color: 'var(--status-warning)' }}>■ Atenção (&gt;5d)</span>
              <span style={{ color: 'var(--status-danger)' }}>■ Crítico (&gt;10d)</span>
            </div>
          </div>
        </ChartCard>
      </div>

      {/* Detalhe por etapa */}
      <div className="card">
        <div className="chart-header" style={{ marginBottom: '16px' }}>
          <div className="chart-title">Rastreabilidade por Etapa — OS em Aberto</div>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>OS</th><th>Série</th><th>Modelo</th><th>Componente</th>
                <th>Etapa / Motivo</th><th>Peças Importadas</th><th>Atraso Peças</th><th>Status</th><th>SLA</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.filter(d => d.StatusFinal !== 'Finalizado').map((os, i) => {
                const e = calcularEtapas(os);
                const badge = getSLABadge(os.StatusFinal, e.totalOS);
                return (
                  <tr key={i} onClick={() => setSelectedOS(os)} style={{ cursor: 'pointer' }} className="hover-row">
                    <td style={{ color: 'var(--accent-primary)', fontWeight: '700' }}>{os.ID_OS}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.82rem' }}>{os.Serie}</td>
                    <td>{os.Modelo}</td>
                    <td>{os.Componente || '—'}</td>
                    <td>{os.MotivoParada || os.StatusFinal || '—'}</td>
                    <td>{os.PecasImportadas === 'Sim' ? <span style={{ color: 'var(--status-warning)', fontWeight: '600' }}>Sim</span> : <span style={{ color: 'var(--text-muted)' }}>Não</span>}</td>
                    <td>{os.AtrasosPecas === 'Sim' ? <span style={{ color: 'var(--status-danger)', fontWeight: '700' }}>Sim ⚠️</span> : <span style={{ color: 'var(--text-muted)' }}>Não</span>}</td>
                    <td><span className={`badge ${os.StatusFinal === 'Aguardando Peça' ? 'badge-danger' : 'badge-warning'}`}>{os.StatusFinal}</span></td>
                    <td><span className={`badge ${badge.cls}`}>{badge.txt}</span></td>
                  </tr>
                );
              })}
              {filteredData.filter(d => d.StatusFinal !== 'Finalizado').length === 0 && (
                <tr><td colSpan="9" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>Nenhuma OS em aberto encontrada.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <TimelineModal os={selectedOS} onClose={() => setSelectedOS(null)} />
    </div>
  );
};

export default ControleFilas;
