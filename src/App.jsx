import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';

// Pages
import DashboardExecutivo from './pages/DashboardExecutivo';
import BaseManutencao from './pages/BaseManutencao';
import ControleFilas from './pages/ControleFilas';
import GestaoPecas from './pages/GestaoPecas';
import RegistroFalhas from './pages/RegistroFalhas';
import KpisVolume from './pages/KpisVolume';
import KpisSLA from './pages/KpisSLA';
import KpisEtapas from './pages/KpisEtapas';
import KpisGargalos from './pages/KpisGargalos';
import AnaliseFalhas from './pages/AnaliseFalhas';
import OrcamentoAprovacao from './pages/OrcamentoAprovacao';
import ProcessoMelhoria from './pages/ProcessoMelhoria';
import Calendario from './pages/Calendario';

import { DashboardProvider } from './context/DashboardContext';

function App() {
  return (
    <DashboardProvider>
      <Router>
        <div className="app-container">
          <Sidebar />
          <main className="main-content">
            <Header />
            <Routes>
              <Route path="/" element={<DashboardExecutivo />} />
              <Route path="/base-manutencao" element={<BaseManutencao />} />
              <Route path="/controle-filas" element={<ControleFilas />} />
              <Route path="/gestao-pecas" element={<GestaoPecas />} />
              <Route path="/registro-falhas" element={<RegistroFalhas />} />
              <Route path="/kpis-volume" element={<KpisVolume />} />
              <Route path="/kpis-sla" element={<KpisSLA />} />
              <Route path="/kpis-etapas" element={<KpisEtapas />} />
              <Route path="/kpis-gargalos" element={<KpisGargalos />} />
              <Route path="/analise-falhas" element={<AnaliseFalhas />} />
              <Route path="/orcamento-aprovacao" element={<OrcamentoAprovacao />} />
              <Route path="/processo-melhoria" element={<ProcessoMelhoria />} />
              <Route path="/calendario" element={<Calendario />} />
            </Routes>
          </main>
        </div>
      </Router>
    </DashboardProvider>
  );
}

export default App;
