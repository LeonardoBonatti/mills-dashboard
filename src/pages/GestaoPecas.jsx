import React from 'react';
import { useDashboard } from '../context/DashboardContext';
import KPICard from '../components/KPICard';
import ChartCard from '../components/ChartCard';
import InsightBox from '../components/InsightBox';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Package, Clock, AlertTriangle } from 'lucide-react';

const GestaoPecas = () => {
  const { filteredData } = useDashboard();

  const comImport = filteredData.filter(d => d.PecasImportadas === 'Sim');
  const semImport = filteredData.filter(d => d.PecasImportadas !== 'Sim');
  const comAtraso = filteredData.filter(d => d.AtrasosPecas === 'Sim');

  const percImport = filteredData.length > 0 ? Math.round((comImport.length / filteredData.length) * 100) : 0;

  // Peças importadas por modelo (proxy para impacto)
  const importPorModelo = filteredData.reduce((acc, d) => {
    if (d.PecasImportadas === 'Sim') {
      const m = d.Modelo || 'N/A';
      const found = acc.find(a => a.name === m);
      found ? found.value++ : acc.push({ name: m, value: 1 });
    }
    return acc;
  }, []).sort((a, b) => b.value - a.value);

  // Peças por componente
  const importPorComp = filteredData.reduce((acc, d) => {
    if (d.PecasImportadas === 'Sim') {
      const c = d.Componente || 'N/A';
      const found = acc.find(a => a.name === c);
      found ? found.value++ : acc.push({ name: c, value: 1 });
    }
    return acc;
  }, []).sort((a, b) => b.value - a.value);

  return (
    <div className="page-container">
      <InsightBox text={`${percImport}% das OS utilizam peças importadas (${comImport.length} OS). ${comAtraso.length} ordens sofreram atraso na entrega de peças. Componentes com maior demanda de importação: ${importPorComp.slice(0, 3).map(c => c.name).join(', ')}.`} />

      <div className="kpi-grid">
        <KPICard title="OS com Peças Importadas" value={comImport.length} change={`${percImport}% do total`} changeType="negative" icon={<Package color="var(--status-warning)" />} />
        <KPICard title="OS com Atraso de Peças" value={comAtraso.length} changeType="negative" icon={<AlertTriangle color="var(--status-danger)" />} />
        <KPICard title="OS sem Importação" value={semImport.length} changeType="positive" icon={<Package color="var(--status-success)" />} />
      </div>

      <div className="charts-grid">
        <ChartCard title="Peças Importadas por Modelo CAT">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={importPorModelo} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" horizontal={false} />
              <XAxis type="number" stroke="var(--text-secondary)" />
              <YAxis type="category" dataKey="name" stroke="var(--text-secondary)" width={80} tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }} />
              <Bar dataKey="value" name="OS c/ Peça Importada" fill="var(--status-warning)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Componentes com Maior Demanda de Importação">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={importPorComp} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" horizontal={false} />
              <XAxis type="number" stroke="var(--text-secondary)" />
              <YAxis type="category" dataKey="name" stroke="var(--text-secondary)" width={140} tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }} />
              <Bar dataKey="value" name="Ocorrências" fill="var(--status-danger)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="card">
        <div className="chart-title" style={{ marginBottom: '16px' }}>OS com Peças Importadas e Atraso — Rastreabilidade</div>
        <div className="table-container">
          <table>
            <thead>
              <tr><th>OS</th><th>Série</th><th>Modelo</th><th>Componente</th><th>Peças Importadas</th><th>Atraso Peças</th><th>Status</th></tr>
            </thead>
            <tbody>
              {filteredData.filter(d => d.PecasImportadas === 'Sim' || d.AtrasosPecas === 'Sim').slice(0, 25).map((os, i) => (
                <tr key={i}>
                  <td style={{ color: 'var(--accent-primary)', fontWeight: '700' }}>{os.ID_OS}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.82rem' }}>{os.Serie}</td>
                  <td>{os.Modelo}</td>
                  <td>{os.Componente || '—'}</td>
                  <td>{os.PecasImportadas === 'Sim' ? <span style={{ color: 'var(--status-warning)', fontWeight: '700' }}>Sim</span> : <span style={{ color: 'var(--text-muted)' }}>Não</span>}</td>
                  <td>{os.AtrasosPecas === 'Sim' ? <span style={{ color: 'var(--status-danger)', fontWeight: '700' }}>⚠️ Sim</span> : <span style={{ color: 'var(--text-muted)' }}>Não</span>}</td>
                  <td><span className={`badge ${os.StatusFinal === 'Finalizado' ? 'badge-success' : os.StatusFinal === 'Aguardando Peça' ? 'badge-danger' : 'badge-warning'}`}>{os.StatusFinal}</span></td>
                </tr>
              ))}
              {filteredData.filter(d => d.PecasImportadas === 'Sim' || d.AtrasosPecas === 'Sim').length === 0 && (
                <tr><td colSpan="7" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>Nenhuma OS com peças importadas ou atraso encontrada.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default GestaoPecas;
