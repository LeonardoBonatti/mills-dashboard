import React, { useMemo } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { calcularEtapas, getSLABadge } from '../utils/dataUtils';
import KPICard from '../components/KPICard';
import ChartCard from '../components/ChartCard';
import InsightBox from '../components/InsightBox';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Wrench, AlertTriangle, CheckCircle, Clock, Package, Zap } from 'lucide-react';

const COLORS = ['#0ea5e9','#ef4444','#10b981','#f59e0b','#8b5cf6','#06b6d4','#f97316','#84cc16'];

const DashboardExecutivo = () => {
  const { filteredData, kpis } = useDashboard();

  // Top OS mais críticas (aguardando peça + mais antigas)
  const osCriticas = useMemo(() => {
    return filteredData
      .filter(d => d.StatusFinal !== 'Finalizado')
      .map(d => { const e = calcularEtapas(d); return { ...d, totalDias: e.totalOS }; })
      .sort((a, b) => (b.totalDias || 0) - (a.totalDias || 0))
      .slice(0, 6);
  }, [filteredData]);

  // Insight automático
  const insight = useMemo(() => {
    const maisComum = kpis.motivoDist?.[0];
    const compMaisComum = kpis.componenteDist?.[0];
    const percAtraso = kpis.total > 0 ? Math.round((kpis.comAtrasosPecas / kpis.total) * 100) : 0;
    return `${percAtraso}% das OS tiveram atraso por disponibilidade de peças. O motivo de parada mais frequente é "${maisComum?.name || '—'}" e o componente com maior incidência é "${compMaisComum?.name || '—'}". Todas as ordens de serviço são da Oficina Sumaré, frota exclusiva Caterpillar.`;
  }, [kpis]);

  return (
    <div className="page-container">
      <InsightBox text={insight} />

      {/* KPIs */}
      <div className="kpi-grid">
        <KPICard title="Total de OS" value={kpis.total} icon={<Wrench />} />
        <KPICard title="Finalizadas" value={kpis.finalizados} changeType="positive" change={`${kpis.total > 0 ? Math.round((kpis.finalizados/kpis.total)*100) : 0}% do total`} icon={<CheckCircle color="var(--status-success)" />} />
        <KPICard title="Aguardando Peça" value={kpis.aguardandoPeca} changeType="negative" change="Crítico" icon={<AlertTriangle color="var(--status-danger)" />} />
        <KPICard title="Em Andamento" value={kpis.emAndamento} changeType="neutral" icon={<Clock color="var(--status-warning)" />} />
        <KPICard title="Com Atraso de Peças" value={kpis.comAtrasosPecas} changeType="negative" change="Impacto no SLA" icon={<Package color="var(--status-danger)" />} />
        <KPICard title="Tempo Médio (Total OS)" value={`${kpis.avgDias}d`} icon={<Zap color="var(--accent-primary)" />} />
      </div>

      {/* Charts row 1 */}
      <div className="charts-grid">
        <ChartCard title="Volume Mensal de OS">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={kpis.monthlyVolume} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="gradVol" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--accent-primary)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="var(--accent-primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
              <XAxis dataKey="name" stroke="var(--text-secondary)" tick={{ fontSize: 12 }} />
              <YAxis stroke="var(--text-secondary)" />
              <Tooltip contentStyle={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} />
              <Area type="monotone" dataKey="value" name="Qtd OS" stroke="var(--accent-primary)" fill="url(#gradVol)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Distribuição por Status">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={kpis.statusDist} cx="50%" cy="50%" innerRadius={70} outerRadius={120} paddingAngle={4} dataKey="value" stroke="none" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                {(kpis.statusDist || []).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Charts row 2 */}
      <div className="charts-grid">
        <ChartCard title="Principais Motivos de Parada">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={kpis.motivoDist} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" horizontal={false} />
              <XAxis type="number" stroke="var(--text-secondary)" />
              <YAxis type="category" dataKey="name" stroke="var(--text-secondary)" width={130} tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }} />
              <Bar dataKey="value" name="Ocorrências" fill="var(--status-warning)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Componentes com Maior Incidência">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={kpis.componenteDist} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" horizontal={false} />
              <XAxis type="number" stroke="var(--text-secondary)" />
              <YAxis type="category" dataKey="name" stroke="var(--text-secondary)" width={130} tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }} />
              <Bar dataKey="value" name="Ocorrências" fill="var(--accent-primary)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Ranking OS Críticas */}
      <div className="card">
        <div className="chart-header" style={{ marginBottom: '16px' }}>
          <div className="chart-title">🚨 Ranking de OS Críticas (Em Aberto)</div>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>#</th><th>OS</th><th>Série</th><th>Modelo</th><th>Componente</th><th>Motivo Parada</th><th>Atraso Peça</th><th>Status</th><th>SLA</th>
              </tr>
            </thead>
            <tbody>
              {osCriticas.length === 0 && (
                <tr><td colSpan="9" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>Nenhuma OS crítica encontrada.</td></tr>
              )}
              {osCriticas.map((os, i) => {
                const badge = getSLABadge(os.StatusFinal, os.totalDias);
                return (
                  <tr key={i}>
                    <td style={{ color: 'var(--text-muted)', fontWeight: 'bold' }}>#{i + 1}</td>
                    <td style={{ color: 'var(--accent-primary)', fontWeight: '700' }}>{os.ID_OS}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{os.Serie}</td>
                    <td>{os.Modelo}</td>
                    <td>{os.Componente || '—'}</td>
                    <td>{os.MotivoParada || '—'}</td>
                    <td>{os.AtrasosPecas === 'Sim' ? <span style={{ color: 'var(--status-danger)', fontWeight: '700' }}>Sim</span> : <span style={{ color: 'var(--text-muted)' }}>Não</span>}</td>
                    <td><span className={`badge ${os.StatusFinal === 'Aguardando Peça' ? 'badge-danger' : 'badge-warning'}`}>{os.StatusFinal}</span></td>
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

export default DashboardExecutivo;
