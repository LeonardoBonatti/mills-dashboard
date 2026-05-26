import React, { useMemo } from 'react';
import { useDashboard } from '../context/DashboardContext';
import KPICard from '../components/KPICard';
import ChartCard from '../components/ChartCard';
import InsightBox from '../components/InsightBox';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { BarChart2, TrendingUp } from 'lucide-react';

const KpisVolume = () => {
  const { filteredData, kpis } = useDashboard();

  const { porDescTAM, crescimento } = useMemo(() => {
    const tamMap = {};
    filteredData.forEach(d => {
      const t = d.DescTAM || 'Não Informado';
      tamMap[t] = (tamMap[t] || 0) + 1;
    });
    const porDescTAM = Object.entries(tamMap).sort((a, b) => b[1] - a[1]).map(([name, value]) => ({ name, value }));

    // Crescimento mensal
    const crescimento = kpis.monthlyVolume.map((m, i, arr) => ({
      ...m,
      anterior: i > 0 ? arr[i - 1].value : null,
      delta: i > 0 ? m.value - arr[i - 1].value : 0,
    }));

    return { porDescTAM, crescimento };
  }, [filteredData, kpis]);

  return (
    <div className="page-container">
      <InsightBox text={`Total de ${filteredData.length} OS registradas na Oficina Sumaré. O mês com maior volume foi ${kpis.monthlyVolume.reduce((p, c) => c.value > p.value ? c : p, { name: '—', value: 0 }).name}.`} />

      <div className="kpi-grid">
        <KPICard title="Total de OS" value={filteredData.length} icon={<BarChart2 />} />
        <KPICard title="Finalizadas" value={kpis.finalizados} changeType="positive" icon={<TrendingUp color="var(--status-success)" />} />
        <KPICard title="Em Aberto" value={filteredData.length - kpis.finalizados} changeType="negative" icon={<BarChart2 color="var(--status-warning)" />} />
      </div>

      <div className="charts-grid">
        <ChartCard title="Volume Mensal de OS">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={kpis.monthlyVolume} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
              <XAxis dataKey="name" stroke="var(--text-secondary)" tick={{ fontSize: 12 }} />
              <YAxis stroke="var(--text-secondary)" />
              <Tooltip contentStyle={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }} />
              <Bar dataKey="value" name="Qtd OS" fill="var(--accent-primary)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Volume por Categoria / Tipo de Atendimento">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={porDescTAM} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" horizontal={false} />
              <XAxis type="number" stroke="var(--text-secondary)" />
              <YAxis type="category" dataKey="name" stroke="var(--text-secondary)" width={160} tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }} />
              <Bar dataKey="value" name="Qtd OS" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="charts-grid">
        <ChartCard title="Volume por Modelo CAT">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={kpis.modeloDist} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" horizontal={false} />
              <XAxis type="number" stroke="var(--text-secondary)" />
              <YAxis type="category" dataKey="name" stroke="var(--text-secondary)" width={80} tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }} />
              <Bar dataKey="value" name="Qtd OS" fill="var(--status-success)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Volume por Status">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={kpis.statusDist} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
              <XAxis dataKey="name" stroke="var(--text-secondary)" tick={{ fontSize: 12 }} />
              <YAxis stroke="var(--text-secondary)" />
              <Tooltip contentStyle={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }} />
              <Bar dataKey="value" name="Qtd" fill="var(--status-warning)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
};

export default KpisVolume;
