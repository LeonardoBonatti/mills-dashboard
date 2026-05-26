import React, { useMemo } from 'react';
import { useDashboard } from '../context/DashboardContext';
import KPICard from '../components/KPICard';
import ChartCard from '../components/ChartCard';
import InsightBox from '../components/InsightBox';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AlertTriangle, Repeat, Zap } from 'lucide-react';

const COLORS = ['#ef4444','#f59e0b','#0ea5e9','#8b5cf6','#10b981','#06b6d4'];

const RegistroFalhas = () => {
  const { filteredData } = useDashboard();

  const { motivoDist, componenteDist, reincidentes, porModelo } = useMemo(() => {
    // Falhas por motivo
    const motivoMap = {};
    filteredData.forEach(d => {
      const m = d.MotivoParada || 'Não Informado';
      motivoMap[m] = (motivoMap[m] || 0) + 1;
    });
    const motivoDist = Object.entries(motivoMap).sort((a, b) => b[1] - a[1]).map(([name, value]) => ({ name, value }));

    // Falhas por componente
    const compMap = {};
    filteredData.forEach(d => {
      const c = d.Componente || 'Não Informado';
      compMap[c] = (compMap[c] || 0) + 1;
    });
    const componenteDist = Object.entries(compMap).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([name, value]) => ({ name, value }));

    // Reincidentes: séries com > 1 OS
    const serieMap = {};
    filteredData.forEach(d => {
      const s = d.Serie || 'N/A';
      serieMap[s] = (serieMap[s] || 0) + 1;
    });
    const reincidentes = Object.entries(serieMap)
      .filter(([, v]) => v > 1)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, value]) => ({ name, value }));

    // Por modelo
    const modeloMap = {};
    filteredData.forEach(d => {
      const m = d.Modelo || 'N/A';
      modeloMap[m] = (modeloMap[m] || 0) + 1;
    });
    const porModelo = Object.entries(modeloMap).sort((a, b) => b[1] - a[1]).map(([name, value]) => ({ name, value }));

    return { motivoDist, componenteDist, reincidentes, porModelo };
  }, [filteredData]);

  const totalFalhas = filteredData.length;
  const maisFreq = motivoDist[0] || { name: '—', value: 0 };
  const maisReincidente = reincidentes[0] || { name: '—', value: 0 };

  return (
    <div className="page-container">
      <InsightBox text={`Foram registradas ${totalFalhas} ocorrências. O tipo de falha mais comum é "${maisFreq.name}" (${maisFreq.value} ocorrências). O equipamento com maior reincidência é o de série ${maisReincidente.name} com ${maisReincidente.value} OS registradas.`} />

      <div className="kpi-grid">
        <KPICard title="Total de Falhas" value={totalFalhas} icon={<AlertTriangle color="var(--status-danger)" />} />
        <KPICard title="Tipo Mais Frequente" value={maisFreq.name} change={`${maisFreq.value} ocorrências`} changeType="negative" icon={<Zap color="var(--status-warning)" />} />
        <KPICard title="Equipamento Reincidente" value={maisReincidente.name} change={`${maisReincidente.value} OS`} changeType="negative" icon={<Repeat color="var(--status-danger)" />} />
      </div>

      <div className="charts-grid">
        <ChartCard title="Pareto de Falhas por Tipo">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={motivoDist} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" horizontal={false} />
              <XAxis type="number" stroke="var(--text-secondary)" />
              <YAxis type="category" dataKey="name" stroke="var(--text-secondary)" width={130} tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }} />
              <Bar dataKey="value" name="Ocorrências" fill="var(--status-danger)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Falhas por Componente">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={componenteDist} cx="50%" cy="50%" innerRadius={60} outerRadius={110} paddingAngle={4} dataKey="value" stroke="none"
                label={({ name, percent }) => `${name.substring(0, 12)} ${(percent * 100).toFixed(0)}%`} labelLine={true}>
                {componenteDist.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Reincidência */}
      <div className="card">
        <div className="chart-title" style={{ marginBottom: '16px' }}>🔁 Equipamentos com Maior Reincidência (Nº Série × Qtd OS)</div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>#</th><th>Nº Série</th><th>Modelo</th><th>Qtd OS</th><th>Indicador</th>
              </tr>
            </thead>
            <tbody>
              {reincidentes.map((item, i) => {
                const osDoEquip = filteredData.filter(d => d.Serie === item.name);
                const modelo = osDoEquip[0]?.Modelo || '—';
                return (
                  <tr key={i}>
                    <td style={{ color: 'var(--text-muted)', fontWeight: 'bold' }}>#{i + 1}</td>
                    <td style={{ color: 'var(--accent-primary)', fontWeight: '700', fontFamily: 'monospace' }}>{item.name}</td>
                    <td>{modelo}</td>
                    <td style={{ fontWeight: '700', color: item.value > 3 ? 'var(--status-danger)' : 'var(--status-warning)' }}>{item.value}</td>
                    <td>
                      <div className="progress-bg" style={{ maxWidth: '200px' }}>
                        <div className="progress-fill" style={{ width: `${Math.min(100, (item.value / reincidentes[0].value) * 100)}%`, backgroundColor: item.value > 3 ? 'var(--status-danger)' : 'var(--status-warning)' }} />
                      </div>
                    </td>
                  </tr>
                );
              })}
              {reincidentes.length === 0 && <tr><td colSpan="5" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>Nenhuma reincidência encontrada.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RegistroFalhas;
