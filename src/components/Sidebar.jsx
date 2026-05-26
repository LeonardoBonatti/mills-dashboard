import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Wrench, 
  ListOrdered, 
  Settings, 
  AlertTriangle, 
  BarChart2, 
  Clock, 
  Timer, 
  AlertCircle, 
  Search, 
  DollarSign, 
  TrendingUp, 
  Calendar 
} from 'lucide-react';

const Sidebar = () => {
  const menuItems = [
    { path: '/', icon: <LayoutDashboard size={20} />, label: 'Visão Geral Executiva' },
    { path: '/base-manutencao', icon: <Wrench size={20} />, label: 'Base Manutenção' },
    { path: '/controle-filas', icon: <ListOrdered size={20} />, label: 'Controle de Filas' },
    { path: '/gestao-pecas', icon: <Settings size={20} />, label: 'Gestão de Peças' },
    { path: '/registro-falhas', icon: <AlertTriangle size={20} />, label: 'Registro de Falhas' },
    { path: '/kpis-volume', icon: <BarChart2 size={20} />, label: 'KPIs Volume' },
    { path: '/kpis-sla', icon: <Clock size={20} />, label: 'KPIs SLA' },
    { path: '/kpis-etapas', icon: <Timer size={20} />, label: 'KPIs Etapas' },
    { path: '/kpis-gargalos', icon: <AlertCircle size={20} />, label: 'KPIs Gargalos' },
    { path: '/analise-falhas', icon: <Search size={20} />, label: 'Análise de Falhas' },
    { path: '/orcamento-aprovacao', icon: <DollarSign size={20} />, label: 'Orçamento e Aprovação' },
    { path: '/processo-melhoria', icon: <TrendingUp size={20} />, label: 'Processo e Melhoria' },
    { path: '/calendario', icon: <Calendar size={20} />, label: 'Calendário' },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        Mills Insights
      </div>
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
