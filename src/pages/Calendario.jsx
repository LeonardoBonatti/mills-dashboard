import React, { useMemo } from 'react';
import { useDashboard } from '../context/DashboardContext';
import KPICard from '../components/KPICard';
import ChartCard from '../components/ChartCard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Calendar } from 'lucide-react';
import { parseDate } from '../utils/dataUtils';

const MONTH_NAMES = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
const DAY_NAMES = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];

const Calendario = () => {
  const { filteredData } = useDashboard();

  const { byDayOfWeek, byMonth, heatmapData, pico } = useMemo(() => {
    const dow = Array(7).fill(0);
    const monthMap = Array(12).fill(0);
    const dayMap = {};

    filteredData.forEach(d => {
      const dt = parseDate(d.DataOficina);
      if (dt && !isNaN(dt)) {
        dow[dt.getDay()]++;
        monthMap[dt.getMonth()]++;
        const key = dt.toISOString().split('T')[0];
        dayMap[key] = (dayMap[key] || 0) + 1;
      }
    });

    const byDayOfWeek = DAY_NAMES.map((name, i) => ({ name, value: dow[i] }));
    const byMonth = MONTH_NAMES.map((name, i) => ({ name, value: monthMap[i] }));
    const heatmapData = Object.entries(dayMap).sort().slice(-30).map(([date, value]) => ({ date, value }));
    const pico = byMonth.reduce((p, c) => c.value > p.value ? c : p, { name: '—', value: 0 });

    return { byDayOfWeek, byMonth, heatmapData, pico };
  }, [filteredData]);

  const totalDias = [...new Set(filteredData.map(d => d.DataOficina).filter(Boolean))].length;

  return (
    <div className="page-container">
      <div className="kpi-grid">
        <KPICard title="Mês com Maior Volume" value={pico.name} change={`${pico.value} OS`} changeType="negative" icon={<Calendar color="var(--status-warning)" />} />
        <KPICard title="Dias com Atividade" value={totalDias} icon={<Calendar />} />
        <KPICard title="Total de OS (Filtro)" value={filteredData.length} icon={<Calendar color="var(--accent-primary)" />} />
      </div>

      <div className="charts-grid">
        <ChartCard title="Volume de OS por Mês (Sazonalidade)">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={byMonth} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
              <XAxis dataKey="name" stroke="var(--text-secondary)" tick={{ fontSize: 12 }} />
              <YAxis stroke="var(--text-secondary)" />
              <Tooltip contentStyle={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }} />
              <Bar dataKey="value" name="Qtd OS" fill="var(--accent-primary)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Volume por Dia da Semana">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={byDayOfWeek} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
              <XAxis dataKey="name" stroke="var(--text-secondary)" tick={{ fontSize: 12 }} />
              <YAxis stroke="var(--text-secondary)" />
              <Tooltip contentStyle={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }} />
              <Bar dataKey="value" name="Qtd OS" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Heatmap visual dos últimos 30 dias */}
      <div className="card">
        <div className="chart-title" style={{ marginBottom: '16px' }}>📆 Heatmap — Atividade dos Últimos 30 Dias com Registros</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {heatmapData.map((d, i) => {
            const intensity = Math.min(1, d.value / 5);
            const bg = `rgba(14, 165, 233, ${0.15 + intensity * 0.85})`;
            return (
              <div key={i} title={`${d.date}: ${d.value} OS`}
                style={{ width: '44px', height: '44px', background: bg, borderRadius: '6px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'default', transition: 'transform 0.1s', border: '1px solid var(--border-color)' }}
                onMouseEnter={e => e.target.style.transform = 'scale(1.1)'}
                onMouseLeave={e => e.target.style.transform = 'scale(1)'}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{d.date.slice(8)}</div>
                <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-primary)' }}>{d.value}</div>
              </div>
            );
          })}
          {heatmapData.length === 0 && <p style={{ color: 'var(--text-muted)' }}>Nenhum dado de calendário disponível para o filtro atual.</p>}
        </div>
      </div>
    </div>
  );
};

export default Calendario;
