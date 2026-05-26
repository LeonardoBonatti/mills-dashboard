import React, { useMemo } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { calcularEtapas, getSLABadge } from '../utils/dataUtils';
import KPICard from '../components/KPICard';
import ChartCard from '../components/ChartCard';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Target, TrendingDown, AlertTriangle } from 'lucide-react';

const META_SLA = 30; // dias

const KpisSLA = () => {
  const { filteredData } = useDashboard();

  const { slaMediaGeral, abaixoMeta, dentroDaMeta, evolucao, porModelo } = useMemo(() => {
    const withDias = filteredData
      .map(d => { const e = calcularEtapas(d); return { ...d, totalDias: e.totalOS }; })
      .filter(d => d.totalDias !== null && d.totalDias > 0);

    const slaMediaGeral = withDias.length > 0
      ? (withDias.reduce((s, d) => s + d.totalDias, 0) / withDias.length).toFixed(1)
      : 'N/A';

    const dentroDaMeta = withDias.filter(d => d.totalDias <= META_SLA).length;
    const abaixoMeta = withDias.filter(d => d.totalDias > META_SLA).length;

    // Evolução mensal (avg dias por mês)
    const monthMap = {};
    filteredData.forEach(d => {
      const dt = d.DataOficina?.toString();
      const parts = dt?.split('/');
      if (parts?.length === 3) {
        const key = `${parts[1]}/${parts[2]}`;
        const e = calcularEtapas(d);
        if (!monthMap[key]) monthMap[key] = { soma: 0, count: 0 };
        if (e.totalOS) { monthMap[key].soma += e.totalOS; monthMap[key].count++; }
      }
    });
    const evolucao = Object.entries(monthMap).sort().map(([name, v]) => ({
      name, mediaDias: v.count > 0 ? Math.round(v.soma / v.count) : 0, meta: META_SLA,
    }));

    // SLA por modelo
    const modeloMap = {};
    filteredData.forEach(d => {
      const m = d.Modelo || 'N/A';
      if (!modeloMap[m]) modeloMap[m] = { soma: 0, count: 0 };
      const e = calcularEtapas(d);
      if (e.totalOS) { modeloMap[m].soma += e.totalOS; modeloMap[m].count++; }
    });
    const porModelo = Object.entries(modeloMap)
      .map(([name, v]) => ({ name, mediaDias: v.count > 0 ? Math.round(v.soma / v.count) : 0 }))
      .sort((a, b) => b.mediaDias - a.mediaDias);

    return { slaMediaGeral, abaixoMeta, dentroDaMeta, evolucao, porModelo };
  }, [filteredData]);

  const percOk = filteredData.length > 0 ? Math.round((dentroDaMeta / filteredData.length) * 100) : 0;

  return (
    <div className="page-container">
      <div className="kpi-grid">
        <KPICard title="Tempo Médio Total por OS" value={`${slaMediaGeral} dias`} icon={<Target />} changeType={parseFloat(slaMediaGeral) > META_SLA ? 'negative' : 'positive'} change={parseFloat(slaMediaGeral) > META_SLA ? 'Acima da Meta' : 'Dentro da Meta'} />
        <KPICard title="OS Dentro da Meta (≤30d)" value={dentroDaMeta} changeType="positive" change={`${percOk}% do total`} icon={<Target color="var(--status-success)" />} />
        <KPICard title="OS Acima da Meta (>30d)" value={abaixoMeta} changeType="negative" change="Requer atenção" icon={<AlertTriangle color="var(--status-danger)" />} />
      </div>

      <div className="charts-grid">
        <ChartCard title="Evolução Mensal — Tempo Médio vs. Meta (30 dias)">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={evolucao} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
              <XAxis dataKey="name" stroke="var(--text-secondary)" tick={{ fontSize: 12 }} />
              <YAxis stroke="var(--text-secondary)" />
              <Tooltip contentStyle={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }} />
              <Legend />
              <ReferenceLine y={META_SLA} stroke="var(--status-success)" strokeDasharray="6 3" label={{ value: 'Meta 30d', fill: 'var(--status-success)', fontSize: 12 }} />
              <Line type="monotone" dataKey="mediaDias" name="Dias Médios" stroke="var(--accent-primary)" strokeWidth={3} dot={{ r: 5 }} activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Tempo Médio por Modelo CAT">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={porModelo} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" horizontal={false} />
              <XAxis type="number" stroke="var(--text-secondary)" />
              <YAxis type="category" dataKey="name" stroke="var(--text-secondary)" width={80} tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }} />
              <ReferenceLine x={META_SLA} stroke="var(--status-success)" strokeDasharray="6 3" />
              <Bar dataKey="mediaDias" name="Dias Médios" radius={[0, 4, 4, 0]}
                fill="var(--accent-primary)" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Detail table */}
      <div className="card">
        <div className="chart-header" style={{ marginBottom: '16px' }}>
          <div className="chart-title">Detalhamento de SLA por OS</div>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr><th>OS</th><th>Série</th><th>Modelo</th><th>Abertura</th><th>Conclusão</th><th>Total Dias</th><th>SLA</th></tr>
            </thead>
            <tbody>
              {filteredData.slice(0, 20).map((os, i) => {
                const e = calcularEtapas(os);
                const badge = getSLABadge(os.StatusFinal, e.totalOS);
                return (
                  <tr key={i}>
                    <td style={{ color: 'var(--accent-primary)', fontWeight: '700' }}>{os.ID_OS}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.82rem' }}>{os.Serie}</td>
                    <td>{os.Modelo}</td>
                    <td>{os.DataAbertura || os.DataOficina || '—'}</td>
                    <td>{os.DataConclusao || os.DataFechamento || '—'}</td>
                    <td style={{ fontWeight: '700', color: e.totalOS > META_SLA ? 'var(--status-danger)' : 'var(--status-success)' }}>{e.totalOS !== null ? `${e.totalOS}d` : '—'}</td>
                    <td><span className={`badge ${badge.cls}`}>{badge.txt}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default KpisSLA;
