import React, { useMemo } from 'react';
import { useDashboard } from '../context/DashboardContext';
import KPICard from '../components/KPICard';
import ChartCard from '../components/ChartCard';
import InsightBox from '../components/InsightBox';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Timer } from 'lucide-react';

const ETAPA_LABELS = [
  { key: 'entradaOficina', label: 'Entrada → Oficina', color: 'var(--accent-primary)' },
  { key: 'diagnostico',    label: 'Diagnóstico',        color: '#8b5cf6' },
  { key: 'aprovacao',      label: 'Aprovação Orç.',     color: 'var(--status-warning)' },
  { key: 'pecas',          label: 'Aguardando Peças',   color: 'var(--status-danger)' },
  { key: 'execucao',       label: 'Execução',           color: 'var(--status-success)' },
  { key: 'teste',          label: 'Teste e Liberação',  color: '#06b6d4' },
];

const KpisEtapas = () => {
  const { kpis } = useDashboard();

  const fluxoData = ETAPA_LABELS.map(({ key, label, color }) => ({
    etapa: label, color, mediaDias: kpis.etapasMedia?.[key] || 0,
  }));

  const totalMediaSomado = fluxoData.reduce((s, d) => s + d.mediaDias, 0);
  const gargalo = fluxoData.reduce((p, c) => c.mediaDias > p.mediaDias ? c : p, { etapa: '—', mediaDias: 0 });

  const insight = `A etapa "${gargalo.etapa}" concentra o maior tempo médio (${gargalo.mediaDias} dias). O tempo somado de todas as etapas representa ${totalMediaSomado} dias de ciclo completo. Otimizações nessa etapa teriam impacto direto na redução do SLA global.`;

  return (
    <div className="page-container">
      <InsightBox text={insight} />

      <div className="kpi-grid">
        {fluxoData.map((item, i) => (
          <KPICard key={i} title={item.etapa} value={`${item.mediaDias}d`}
            changeType={item.mediaDias > 10 ? 'negative' : item.mediaDias > 5 ? 'neutral' : 'positive'}
            change={item.mediaDias > 10 ? 'Crítico' : item.mediaDias > 5 ? 'Atenção' : 'Normal'}
            icon={<Timer size={20} color={item.color} />} />
        ))}
      </div>

      <div className="charts-grid">
        <ChartCard title="Comparativo de Tempo Médio por Etapa (dias)">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={fluxoData} margin={{ top: 10, right: 20, left: 0, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
              <XAxis dataKey="etapa" stroke="var(--text-secondary)" angle={-30} textAnchor="end" tick={{ fontSize: 11 }} interval={0} />
              <YAxis stroke="var(--text-secondary)" />
              <Tooltip contentStyle={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }} />
              <Bar dataKey="mediaDias" name="Dias Médios" radius={[4, 4, 0, 0]}
                label={{ position: 'top', fill: 'var(--text-secondary)', fontSize: 12 }}>
                {fluxoData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Proporção do Ciclo por Etapa">
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '14px', padding: '0 16px' }}>
            {fluxoData.map((item, i) => {
              const perc = totalMediaSomado > 0 ? Math.round((item.mediaDias / totalMediaSomado) * 100) : 0;
              return (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{item.etapa}</span>
                    <span style={{ fontWeight: '700', color: item.color }}>{perc}% ({item.mediaDias}d)</span>
                  </div>
                  <div className="progress-bg">
                    <div className="progress-fill" style={{ width: `${perc}%`, backgroundColor: item.color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </ChartCard>
      </div>
    </div>
  );
};

export default KpisEtapas;
