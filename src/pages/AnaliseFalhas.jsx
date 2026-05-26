import React, { useMemo } from 'react';
import { useDashboard } from '../context/DashboardContext';
import KPICard from '../components/KPICard';
import ChartCard from '../components/ChartCard';
import InsightBox from '../components/InsightBox';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Search, AlertTriangle, TrendingDown } from 'lucide-react';

const COLORS = ['#ef4444','#f59e0b','#0ea5e9','#8b5cf6','#10b981'];

const AnaliseFalhas = () => {
  const { filteredData } = useDashboard();

  const { correlacao, tendencia, causaRaiz } = useMemo(() => {
    // Correlação: falhas com atraso de peças
    const comAtraso = filteredData.filter(d => d.AtrasosPecas === 'Sim');
    const semAtraso = filteredData.filter(d => d.AtrasosPecas !== 'Sim');

    // Causas raiz por componente x motivo
    const causaMap = {};
    filteredData.forEach(d => {
      const key = `${d.Componente || 'N/A'} → ${d.MotivoParada || 'N/A'}`;
      causaMap[key] = (causaMap[key] || 0) + 1;
    });
    const causaRaiz = Object.entries(causaMap).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([name, value]) => ({ name, value }));

    // Tendência mensal
    const monthMap = {};
    filteredData.forEach(d => {
      const dt = d.DataOficina?.toString();
      const parts = dt?.split('/');
      if (parts?.length === 3) {
        const key = `${parts[1]}/${parts[2]}`;
        if (!monthMap[key]) monthMap[key] = { total: 0, comAtraso: 0 };
        monthMap[key].total++;
        if (d.AtrasosPecas === 'Sim') monthMap[key].comAtraso++;
      }
    });
    const tendencia = Object.entries(monthMap).sort().map(([name, v]) => ({
      name, total: v.total, comAtraso: v.comAtraso,
    }));

    const correlacao = [
      { name: 'Com Atraso de Peças', value: comAtraso.length },
      { name: 'Sem Atraso de Peças', value: semAtraso.length },
    ];

    return { correlacao, tendencia, causaRaiz };
  }, [filteredData]);

  const topCausa = causaRaiz[0] || { name: '—', value: 0 };

  return (
    <div className="page-container">
      <InsightBox text={`A causa raiz mais frequente é "${topCausa.name}" com ${topCausa.value} ocorrências. A correlação entre falhas e atraso de peças indica impacto direto no SLA — OS com atraso de peças representam ${filteredData.length > 0 ? Math.round((filteredData.filter(d => d.AtrasosPecas === 'Sim').length / filteredData.length) * 100) : 0}% do total.`} />

      <div className="kpi-grid">
        <KPICard title="Causa Raiz Principal" value={topCausa.name?.split(' → ')[0] || '—'} change={`${topCausa.value} ocorrências`} changeType="negative" icon={<Search color="var(--status-danger)" />} />
        <KPICard title="Com Atraso de Peças" value={filteredData.filter(d => d.AtrasosPecas === 'Sim').length} changeType="negative" icon={<AlertTriangle color="var(--status-danger)" />} />
        <KPICard title="Com Peças Importadas" value={filteredData.filter(d => d.PecasImportadas === 'Sim').length} changeType="negative" icon={<TrendingDown color="var(--status-warning)" />} />
      </div>

      <div className="charts-grid">
        <ChartCard title="Causa Raiz — Componente × Motivo de Falha">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={causaRaiz} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" horizontal={false} />
              <XAxis type="number" stroke="var(--text-secondary)" />
              <YAxis type="category" dataKey="name" stroke="var(--text-secondary)" width={200} tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }} />
              <Bar dataKey="value" name="Ocorrências" fill="var(--status-danger)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Correlação — Atraso de Peças vs. Normal">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={correlacao} cx="50%" cy="50%" innerRadius={70} outerRadius={120} paddingAngle={4} dataKey="value" stroke="none"
                label={({ name, percent }) => `${name.split(' ')[0]} ${(percent * 100).toFixed(0)}%`}>
                {correlacao.map((_, i) => <Cell key={i} fill={i === 0 ? 'var(--status-danger)' : 'var(--status-success)'} />)}
              </Pie>
              <Tooltip contentStyle={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="charts-grid" style={{ marginTop: '0' }}>
        <ChartCard title="Tendência Mensal — Total vs. Com Atraso de Peças">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={tendencia} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
              <XAxis dataKey="name" stroke="var(--text-secondary)" tick={{ fontSize: 12 }} />
              <YAxis stroke="var(--text-secondary)" />
              <Tooltip contentStyle={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }} />
              <Bar dataKey="total" name="Total de Falhas" fill="var(--accent-primary)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="comAtraso" name="Com Atraso de Peças" fill="var(--status-danger)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Distribuição por Componente Afetado">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={filteredData.reduce((acc, d) => { const c = d.Componente || 'N/A'; const f = acc.find(a => a.name === c); f ? f.value++ : acc.push({ name: c, value: 1 }); return acc; }, []).sort((a, b) => b.value - a.value).slice(0, 6)}
                cx="50%" cy="50%" innerRadius={60} outerRadius={110} paddingAngle={4} dataKey="value" stroke="none"
                label={({ name, percent }) => `${name.substring(0, 14)} ${(percent * 100).toFixed(0)}%`}>
                {[1, 2, 3, 4, 5, 6].map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
};

export default AnaliseFalhas;
