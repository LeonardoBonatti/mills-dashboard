import React, { useMemo } from 'react';
import { useDashboard } from '../context/DashboardContext';
import KPICard from '../components/KPICard';
import ChartCard from '../components/ChartCard';
import InsightBox from '../components/InsightBox';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AlertOctagon, Package, Clock } from 'lucide-react';

const KpisGargalos = () => {
  const { filteredData, kpis } = useDashboard();

  const { gargaloPrincipal, ranking, matrizCriticidade } = useMemo(() => {
    // Ranking: motivos parada x quantidade
    const motivoMap = {};
    filteredData.forEach(d => {
      if (d.StatusFinal !== 'Finalizado') {
        const m = d.MotivoParada || 'Não Informado';
        motivoMap[m] = (motivoMap[m] || 0) + 1;
      }
    });
    const ranking = Object.entries(motivoMap)
      .sort((a, b) => b[1] - a[1])
      .map(([name, value]) => ({ name, value }));

    // Matriz de criticidade: modelo x motivo
    const matriz = {};
    filteredData.forEach(d => {
      if (d.StatusFinal !== 'Finalizado') {
        const modelo = d.Modelo || 'N/A';
        const motivo = d.MotivoParada || 'N/A';
        if (!matriz[modelo]) matriz[modelo] = {};
        matriz[modelo][motivo] = (matriz[modelo][motivo] || 0) + 1;
      }
    });

    return {
      gargaloPrincipal: ranking[0] || { name: '—', value: 0 },
      ranking,
      matrizCriticidade: matriz,
    };
  }, [filteredData]);

  const aguardandoPeca = filteredData.filter(d => d.StatusFinal === 'Aguardando Peça').length;
  const comAtrasoImportadas = filteredData.filter(d => d.PecasImportadas === 'Sim' && d.StatusFinal !== 'Finalizado').length;
  const insight = `O maior gargalo operacional é "${gargaloPrincipal.name}" com ${gargaloPrincipal.value} OS impactadas. Existem ${aguardandoPeca} ordens aguardando peças e ${comAtrasoImportadas} com peças importadas ainda em aberto — esses são os pontos críticos que mais impactam o SLA.`;

  return (
    <div className="page-container">
      <InsightBox text={insight} />

      <div className="kpi-grid">
        <KPICard title="Principal Gargalo" value={gargaloPrincipal.name} change={`${gargaloPrincipal.value} OS impactadas`} changeType="negative" icon={<AlertOctagon color="var(--status-danger)" />} />
        <KPICard title="Aguardando Peça" value={aguardandoPeca} changeType="negative" icon={<Package color="var(--status-danger)" />} />
        <KPICard title="Com Peças Importadas (Aberto)" value={comAtrasoImportadas} changeType="negative" icon={<Clock color="var(--status-warning)" />} />
      </div>

      <div className="charts-grid">
        <ChartCard title="Ranking de Gargalos — Motivos de Parada (OS em Aberto)">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={ranking} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" horizontal={false} />
              <XAxis type="number" stroke="var(--text-secondary)" />
              <YAxis type="category" dataKey="name" stroke="var(--text-secondary)" width={130} tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }} />
              <Bar dataKey="value" name="OS Impactadas" fill="var(--status-danger)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Componentes mais Problemáticos (Falhas em Aberto)">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={filteredData.filter(d => d.StatusFinal !== 'Finalizado')
                .reduce((acc, d) => {
                  const c = d.Componente || 'N/A';
                  const found = acc.find(a => a.name === c);
                  if (found) found.value++;
                  else acc.push({ name: c, value: 1 });
                  return acc;
                }, []).sort((a, b) => b.value - a.value).slice(0, 8)}
              layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" horizontal={false} />
              <XAxis type="number" stroke="var(--text-secondary)" />
              <YAxis type="category" dataKey="name" stroke="var(--text-secondary)" width={140} tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }} />
              <Bar dataKey="value" name="Ocorrências" fill="var(--status-warning)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Matriz criticidade */}
      <div className="card">
        <div className="chart-title" style={{ marginBottom: '16px' }}>Matriz de Criticidade — Modelo × Motivo de Parada</div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Modelo</th>
                {[...new Set(filteredData.filter(d => d.StatusFinal !== 'Finalizado').map(d => d.MotivoParada || 'N/A'))].slice(0, 6).map(m => <th key={m}>{m}</th>)}
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(matrizCriticidade).map(([modelo, motivos]) => {
                const total = Object.values(motivos).reduce((s, v) => s + v, 0);
                const motivoKeys = [...new Set(filteredData.filter(d => d.StatusFinal !== 'Finalizado').map(d => d.MotivoParada || 'N/A'))].slice(0, 6);
                return (
                  <tr key={modelo}>
                    <td style={{ fontWeight: '600', color: 'var(--accent-primary)' }}>{modelo}</td>
                    {motivoKeys.map(m => (
                      <td key={m} style={{ textAlign: 'center', fontWeight: motivos[m] ? '700' : 'normal', color: motivos[m] > 2 ? 'var(--status-danger)' : motivos[m] > 0 ? 'var(--status-warning)' : 'var(--text-muted)' }}>
                        {motivos[m] || '—'}
                      </td>
                    ))}
                    <td style={{ fontWeight: '700' }}>{total}</td>
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

export default KpisGargalos;
