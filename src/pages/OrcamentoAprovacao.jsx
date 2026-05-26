import React, { useMemo } from 'react';
import { useDashboard } from '../context/DashboardContext';
import KPICard from '../components/KPICard';
import ChartCard from '../components/ChartCard';
import InsightBox from '../components/InsightBox';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarSign, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

const OrcamentoAprovacao = () => {
  const { filteredData, kpis } = useDashboard();

  const { aprovadas, pendentes, comImportacao, aprovacaoMedia, porTAM } = useMemo(() => {
    // Aprovadas = Finalizadas
    const aprovadas = filteredData.filter(d => d.StatusFinal === 'Finalizado').length;
    const pendentes = filteredData.filter(d => d.StatusFinal !== 'Finalizado').length;
    const comImportacao = filteredData.filter(d => d.PecasImportadas === 'Sim').length;

    // Avg dias de aprovação (DataNegociacao -> DataAprovacao)
    let somaAprov = 0; let countAprov = 0;
    filteredData.forEach(d => {
      const ng = d.DataNegociacao; const ap = d.DataAprovacao;
      if (ng && ap && ng.includes('/') && ap.includes('/')) {
        const pN = ng.split('/'); const pA = ap.split('/');
        const dN = new Date(`${pN[2]}-${pN[1]}-${pN[0]}`);
        const dA = new Date(`${pA[2]}-${pA[1]}-${pA[0]}`);
        const diff = Math.ceil(Math.abs(dA - dN) / (1000 * 60 * 60 * 24));
        if (!isNaN(diff) && diff >= 0) { somaAprov += diff; countAprov++; }
      }
    });
    const aprovacaoMedia = countAprov > 0 ? (somaAprov / countAprov).toFixed(1) : 'N/A';

    // Por tipo de atendimento
    const tamMap = {};
    filteredData.forEach(d => {
      const t = d.DescTAM || 'N/A';
      tamMap[t] = (tamMap[t] || 0) + 1;
    });
    const porTAM = Object.entries(tamMap).sort((a, b) => b[1] - a[1]).map(([name, value]) => ({ name, value }));

    return { aprovadas, pendentes, comImportacao, aprovacaoMedia, porTAM };
  }, [filteredData]);

  const taxaAprov = filteredData.length > 0 ? Math.round((aprovadas / filteredData.length) * 100) : 0;

  return (
    <div className="page-container">
      <InsightBox text={`Taxa de conclusão atual: ${taxaAprov}%. O tempo médio de aprovação de orçamento é de ${aprovacaoMedia} dias. Existem ${comImportacao} OS com peças importadas, o que geralmente eleva o tempo total de aprovação e chegada de materiais.`} />

      <div className="kpi-grid">
        <KPICard title="Taxa de Conclusão" value={`${taxaAprov}%`} changeType={taxaAprov > 70 ? 'positive' : 'negative'} icon={<CheckCircle color="var(--status-success)" />} />
        <KPICard title="OS Finalizadas" value={aprovadas} changeType="positive" icon={<DollarSign color="var(--status-success)" />} />
        <KPICard title="OS Pendentes" value={pendentes} changeType="negative" icon={<AlertTriangle color="var(--status-danger)" />} />
        <KPICard title="Tempo Médio de Aprovação" value={`${aprovacaoMedia}d`} icon={<Clock />} />
        <KPICard title="OS com Peças Importadas" value={comImportacao} changeType="negative" change="Maior prazo de entrega" icon={<DollarSign color="var(--status-warning)" />} />
      </div>

      <div className="charts-grid">
        <ChartCard title="Volume por Tipo de Atendimento (TAM)">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={porTAM} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" horizontal={false} />
              <XAxis type="number" stroke="var(--text-secondary)" />
              <YAxis type="category" dataKey="name" stroke="var(--text-secondary)" width={160} tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }} />
              <Bar dataKey="value" name="Qtd OS" fill="var(--accent-primary)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Status de Aprovação por Modelo CAT">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={kpis.modeloDist.map(m => {
                const osModelo = filteredData.filter(d => d.Modelo === m.name);
                const fin = osModelo.filter(d => d.StatusFinal === 'Finalizado').length;
                return { name: m.name, Finalizadas: fin, Pendentes: osModelo.length - fin };
              })}
              margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
              <XAxis dataKey="name" stroke="var(--text-secondary)" tick={{ fontSize: 12 }} />
              <YAxis stroke="var(--text-secondary)" />
              <Tooltip contentStyle={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }} />
              <Bar dataKey="Finalizadas" fill="var(--status-success)" radius={[4, 4, 0, 0]} stackId="a" />
              <Bar dataKey="Pendentes" fill="var(--status-danger)" radius={[4, 4, 0, 0]} stackId="a" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Tabela detalhada */}
      <div className="card">
        <div className="chart-title" style={{ marginBottom: '16px' }}>Detalhamento de OS — Importação e Aprovação</div>
        <div className="table-container">
          <table>
            <thead>
              <tr><th>OS</th><th>Série</th><th>Modelo</th><th>Tipo TAM</th><th>Peças Importadas</th><th>Atraso Peças</th><th>Status</th></tr>
            </thead>
            <tbody>
              {filteredData.filter(d => d.PecasImportadas === 'Sim').slice(0, 20).map((os, i) => (
                <tr key={i}>
                  <td style={{ color: 'var(--accent-primary)', fontWeight: '700' }}>{os.ID_OS}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.82rem' }}>{os.Serie}</td>
                  <td>{os.Modelo}</td>
                  <td>{os.DescTAM || '—'}</td>
                  <td><span style={{ color: 'var(--status-warning)', fontWeight: '600' }}>Sim</span></td>
                  <td>{os.AtrasosPecas === 'Sim' ? <span style={{ color: 'var(--status-danger)', fontWeight: '700' }}>Sim ⚠️</span> : <span style={{ color: 'var(--text-muted)' }}>Não</span>}</td>
                  <td><span className={`badge ${os.StatusFinal === 'Finalizado' ? 'badge-success' : os.StatusFinal === 'Aguardando Peça' ? 'badge-danger' : 'badge-warning'}`}>{os.StatusFinal}</span></td>
                </tr>
              ))}
              {filteredData.filter(d => d.PecasImportadas === 'Sim').length === 0 && (
                <tr><td colSpan="7" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>Nenhuma OS com peças importadas encontrada.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OrcamentoAprovacao;
