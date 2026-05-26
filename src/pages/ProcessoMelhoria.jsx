import React, { useMemo } from 'react';
import { useDashboard } from '../context/DashboardContext';
import KPICard from '../components/KPICard';
import ChartCard from '../components/ChartCard';
import InsightBox from '../components/InsightBox';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, CheckCircle, Package } from 'lucide-react';

const ProcessoMelhoria = () => {
  const { filteredData, kpis } = useDashboard();

  const { evolucaoConc, taxaConclusao, meses } = useMemo(() => {
    // Evolução mensal: finalizadas vs. abertas
    const monthMap = {};
    filteredData.forEach(d => {
      const dt = d.DataOficina?.toString();
      const parts = dt?.split('/');
      if (parts?.length === 3) {
        const key = `${parts[1]}/${parts[2]}`;
        if (!monthMap[key]) monthMap[key] = { abertas: 0, finalizadas: 0 };
        monthMap[key].abertas++;
        if (d.StatusFinal === 'Finalizado') monthMap[key].finalizadas++;
      }
    });
    const evolucaoConc = Object.entries(monthMap).sort().map(([name, v]) => ({
      name,
      Abertas: v.abertas,
      Finalizadas: v.finalizadas,
      Taxa: v.abertas > 0 ? Math.round((v.finalizadas / v.abertas) * 100) : 0,
    }));

    const taxaConclusao = filteredData.length > 0 ? Math.round((kpis.finalizados / filteredData.length) * 100) : 0;
    const meses = evolucaoConc.length;
    return { evolucaoConc, taxaConclusao, meses };
  }, [filteredData, kpis]);

  const reducaoAtraso = filteredData.length > 0 ? Math.round((filteredData.filter(d => d.AtrasosPecas !== 'Sim').length / filteredData.length) * 100) : 0;

  return (
    <div className="page-container">
      <InsightBox text={`Analisando ${meses} meses de histórico. A taxa de conclusão atual é de ${kpis.finalizados}/${filteredData.length} OS (${filteredData.length > 0 ? Math.round((kpis.finalizados/filteredData.length)*100) : 0}%). ${reducaoAtraso}% das OS não tiveram atraso de peças, indicando gestão de estoque eficiente nessa fração.`} />

      <div className="kpi-grid">
        <KPICard title="Taxa de Conclusão" value={`${filteredData.length > 0 ? Math.round((kpis.finalizados/filteredData.length)*100) : 0}%`} changeType="positive" icon={<TrendingUp color="var(--status-success)" />} />
        <KPICard title="OS Concluídas" value={kpis.finalizados} changeType="positive" icon={<CheckCircle color="var(--status-success)" />} />
        <KPICard title="Sem Atraso de Peças" value={`${reducaoAtraso}%`} changeType="positive" icon={<Package color="var(--status-success)" />} />
      </div>

      <div className="charts-grid">
        <ChartCard title="Evolução Mensal — OS Abertas vs. Finalizadas">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={evolucaoConc} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
              <XAxis dataKey="name" stroke="var(--text-secondary)" tick={{ fontSize: 12 }} />
              <YAxis stroke="var(--text-secondary)" />
              <Tooltip contentStyle={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }} />
              <Legend />
              <Bar dataKey="Abertas" fill="var(--status-warning)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Finalizadas" fill="var(--status-success)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Evolução da Taxa de Conclusão (%)">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={evolucaoConc} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
              <XAxis dataKey="name" stroke="var(--text-secondary)" tick={{ fontSize: 12 }} />
              <YAxis stroke="var(--text-secondary)" domain={[0, 100]} />
              <Tooltip contentStyle={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }} />
              <Line type="monotone" dataKey="Taxa" name="Taxa de Conclusão (%)" stroke="var(--status-success)" strokeWidth={3} dot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Timeline de melhorias (marcos operacionais baseados nos dados) */}
      <div className="card">
        <div className="chart-title" style={{ marginBottom: '24px' }}>📅 Linha do Tempo Operacional</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
          {evolucaoConc.slice(-6).map((m, i) => (
            <div key={i} style={{ display: 'flex', gap: '20px', paddingBottom: '24px', position: 'relative' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: m.Taxa >= 70 ? 'var(--status-success)' : m.Taxa >= 40 ? 'var(--status-warning)' : 'var(--status-danger)', flexShrink: 0, marginTop: '4px' }} />
                {i < evolucaoConc.slice(-6).length - 1 && <div style={{ width: '2px', flex: 1, background: 'var(--border-color)', marginTop: '4px' }} />}
              </div>
              <div>
                <div style={{ fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px' }}>{m.name}</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  {m.Abertas} OS abertas · {m.Finalizadas} finalizadas · Taxa: <span style={{ fontWeight: '700', color: m.Taxa >= 70 ? 'var(--status-success)' : m.Taxa >= 40 ? 'var(--status-warning)' : 'var(--status-danger)' }}>{m.Taxa}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProcessoMelhoria;
