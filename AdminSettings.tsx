/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Project, Customer, UserRole } from '../types';
import { Briefcase, Users, CheckCircle, Clock, AlertTriangle, Globe, Landmark, TrendingUp } from 'lucide-react';

interface DashboardTabProps {
  projects: Project[];
  customers: Customer[];
  activeRole: UserRole;
  onNavigateToTab: (tab: string) => void;
}

export default function DashboardTab({ projects, customers, activeRole, onNavigateToTab }: DashboardTabProps) {
  // Calculations
  const totalProjects = projects.length;
  const pendingPmo = projects.filter(p => p.status === 'AWAITING_PMO_APP').length;
  const approvedProjects = projects.filter(p => p.status === 'APPROVED').length;
  const rejectedProjects = projects.filter(p => p.status === 'REJECTED').length;
  const pendingCustomers = customers.filter(c => c.status === 'PENDING_FINANCE').length;

  // Group by SAP Solution
  const solutionCount = projects.reduce((acc, curr) => {
    acc[curr.solution] = (acc[curr.solution] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Group by status
  const statusCount = projects.reduce((acc, curr) => {
    acc[curr.status] = (acc[curr.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Solutions chart data (RISE, GROW, SCP, SCE, PMO)
  const solutions = ['RISE', 'GROW', 'SCP', 'SCE', 'PMO'];
  const maxSolutionCount = Math.max(...solutions.map(s => solutionCount[s] || 0), 1);

  // Status mapping labels
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PRE_SALES_DRAFT': return 'Rascunho Comercial';
      case 'AWAITING_CUSTOMER_REG': return 'Pendente Cliente';
      case 'AWAITING_PMO_APP': return 'Pendente PMO';
      case 'APPROVED': return 'Ativo (S/4HANA)';
      case 'REJECTED': return 'Reprovado';
      case 'CLOSURE_PENDING': return 'Pendente Encerramento';
      case 'CLOSED': return 'Encerrado (Inativo)';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PRE_SALES_DRAFT': return 'bg-slate-100 text-slate-700';
      case 'AWAITING_CUSTOMER_REG': return 'bg-indigo-50 text-indigo-700';
      case 'AWAITING_PMO_APP': return 'bg-blue-50 text-blue-700 border border-blue-200';
      case 'APPROVED': return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
      case 'REJECTED': return 'bg-rose-50 text-rose-700 border border-rose-200';
      case 'CLOSURE_PENDING': return 'bg-purple-50 text-purple-700 border border-purple-200';
      case 'CLOSED': return 'bg-gray-100 text-gray-500';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div id="pmo-dashboard-container" className="space-y-6">
      {/* Banner de Boas-vindas baseada no Perfil */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-slate-900 text-white rounded-xl p-6 shadow-sm border border-slate-800 relative overflow-hidden">
        <div className="absolute right-0 top-0 opacity-10 pointer-events-none transform translate-x-12 -translate-y-6">
          <Landmark size={280} className="text-white" />
        </div>
        <div className="relative z-10 max-w-3xl">
          <span className="bg-amber-500/20 text-amber-300 font-mono text-xs uppercase px-3 py-1 rounded-full border border-amber-500/30">
            Painel Operacional SAP S/4HANA
          </span>
          <h1 className="text-2xl md:text-3xl font-sans font-medium tracking-tight mt-3 text-slate-100">
            Bem-vindo ao Portal de Projetos Exed S/4 Public
          </h1>
          <p className="text-slate-300 text-sm md:text-base mt-2 leading-relaxed">
            {activeRole === 'PMO_CORPORATE' && "Visão geral completa de governança corporativa. Você possui acesso irrestrito para aprovar registros, autorizar exclusões e ajustar permissões da Matriz de Projetos."}
            {activeRole === 'PRE_SALES' && "Visão operacional de Pré-vendas. Cadastre novas propostas comerciais e acompanhe o andamento das validações financeiras e do PMO."}
            {activeRole === 'FINANCE' && "Central de Validação Fiscal e Financeira. Verifique novas solicitações de clientes, lance as chaves de controle CO/FI e libere propostas para aprovação final."}
            {activeRole === 'PM_GOVERNANCE' && "Visão de Acompanhamento e Governança de Projetos. Monitore execuções em andamento e submeta pedidos formais de encerramento contratual."}
          </p>
        </div>
      </div>

      {/* Grid de Métricas Gerais (Bento-Style) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Projetos */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition duration-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total de Projetos</p>
              <h3 className="text-2xl font-bold font-sans text-slate-900 mt-2">{totalProjects}</h3>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-lg text-slate-600 border border-slate-100">
              <Briefcase size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs">
            <span className="text-blue-600 font-semibold flex items-center">
              Total Cadastrado
            </span>
            <button 
              onClick={() => onNavigateToTab('master_list')}
              className="text-blue-600 hover:text-blue-700 hover:underline font-semibold"
            >
              Ver todos
            </button>
          </div>
        </div>

        {/* Card 2: Pendente PMO */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition duration-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pendente PMO</p>
              <h3 className="text-2xl font-bold font-sans text-slate-900 mt-2">{pendingPmo}</h3>
            </div>
            <div className="bg-amber-50 p-2.5 rounded-lg text-amber-600 border border-amber-100">
              <Clock size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Aguardando análise PMO</span>
            {activeRole === 'PMO_CORPORATE' ? (
              <button 
                onClick={() => onNavigateToTab('lista_01')}
                className="text-amber-700 hover:text-amber-800 hover:underline font-semibold bg-amber-50 px-2.5 py-1 rounded transition"
              >
                Tratar agora
              </button>
            ) : null}
          </div>
        </div>

        {/* Card 3: Ativo no SAP */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition duration-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ativo no SAP</p>
              <h3 className="text-2xl font-bold font-sans text-slate-900 mt-2">{approvedProjects}</h3>
            </div>
            <div className="bg-emerald-50 p-2.5 rounded-lg text-emerald-600 border border-emerald-100">
              <CheckCircle size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs">
            <span className="text-emerald-600 font-semibold">Integrado no S/4HANA</span>
            <span className="text-slate-400 font-mono text-[9px]">Sincronizado</span>
          </div>
        </div>

        {/* Card 4: Projetos Recusados */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition duration-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Recusados</p>
              <h3 className="text-2xl font-bold font-sans text-slate-900 mt-2">{rejectedProjects}</h3>
            </div>
            <div className="bg-rose-50 p-2.5 rounded-lg text-rose-600 border border-rose-100">
              <AlertTriangle size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs">
            <span className="text-rose-600 font-semibold">Rejeitados pelo PMO</span>
            <span className="text-slate-400 font-mono text-[9px]">Não homologados</span>
          </div>
        </div>
      </div>

      {/* Grid de Alertas de Governança para Trabalho */}
      {((pendingCustomers > 0 && (activeRole === 'FINANCE' || activeRole === 'PMO_CORPORATE')) ||
        (projects.filter(p => p.status === 'CLOSURE_PENDING').length > 0 && (activeRole === 'PMO_CORPORATE'))) && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={20} />
          <div className="space-y-1">
            <h4 className="text-sm font-medium text-amber-900">Ações de Governança Pendentes de Atenção</h4>
            <div className="text-xs text-amber-700 space-y-1">
              {pendingCustomers > 0 && (activeRole === 'FINANCE' || activeRole === 'PMO_CORPORATE') && (
                <p>
                  • Existe(m) <strong className="font-semibold">{pendingCustomers} novo(s) cliente(s)</strong> aguardando validação fiscal e atribuição de código SAP S/4HANA na aba de clientes.
                </p>
              )}
              {projects.filter(p => p.status === 'CLOSURE_PENDING').length > 0 && (activeRole === 'PMO_CORPORATE') && (
                <p>
                  • Existe(m) <strong className="font-semibold">{projects.filter(p => p.status === 'CLOSURE_PENDING').length} solicitação(ões) de encerramento</strong> de projeto pendente de deferimento pelo PMO.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Gráficos em Linha de Distribuição (Custom CSS Bento) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Distribuição por Solução SAP (RISE, GROW, SCP, etc.) */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm lg:col-span-2">
          <h3 className="text-xs font-bold text-slate-800 tracking-tight uppercase">
            Distribuição por Solução SAP do Projeto
          </h3>
          <p className="text-xs text-slate-400 mt-1 mb-6">Contagem de registros de projeto agregados no portal</p>
          
          <div className="space-y-4">
            {solutions.map(sol => {
              const val = solutionCount[sol] || 0;
              const percent = totalProjects > 0 ? (val / totalProjects) * 100 : 0;
              return (
                <div key={sol} className="space-y-1.5">
                  <div className="flex justify-between text-xs text-slate-600 font-medium">
                    <span className="font-mono font-semibold">{sol}</span>
                    <span>{val} {val === 1 ? 'projeto' : 'projetos'} ({percent.toFixed(0)}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-blue-600 h-full rounded-full transition-all duration-500 shadow-sm"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Status das Solicitações */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-800 tracking-tight uppercase">
              Pipeline de Status
            </h3>
            <p className="text-xs text-slate-400 mt-1 mb-4">Acompanhamento de processos de governança</p>
            
            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {Object.keys(statusCount).length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">Nenhum projeto no banco de dados.</p>
              ) : (
                Object.entries(statusCount).map(([status, count]) => (
                  <div key={status} className="flex justify-between items-center text-xs p-2 rounded-lg border border-slate-100 hover:bg-slate-50/50 transition">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase ${getStatusColor(status)}`}>
                      {getStatusLabel(status)}
                    </span>
                    <span className="font-bold text-slate-700 font-mono">{count}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4 mt-4">
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Conexão Simulada SAP S/4HANA: <strong className="text-emerald-600 font-semibold">ONLINE</strong></span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
