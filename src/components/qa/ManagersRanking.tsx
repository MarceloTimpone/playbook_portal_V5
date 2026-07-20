import React, { useState, useMemo } from 'react';
import { QAReview, Project } from '../../types';
import { Trophy, Medal, Search, Filter, RefreshCw, BarChart2, Star, Target, Users } from 'lucide-react';

interface ManagersRankingProps {
  reviews: QAReview[];
  projects: Project[];
}

const MONTHS_PT = [
  { value: 'all', label: 'Todos os meses' },
  { value: '1', label: 'Janeiro' },
  { value: '2', label: 'Fevereiro' },
  { value: '3', label: 'Março' },
  { value: '4', label: 'Abril' },
  { value: '5', label: 'Maio' },
  { value: '6', label: 'Junho' },
  { value: '7', label: 'Julho' },
  { value: '8', label: 'Agosto' },
  { value: '9', label: 'Setembro' },
  { value: '10', label: 'Outubro' },
  { value: '11', label: 'Novembro' },
  { value: '12', label: 'Dezembro' },
];

export default function ManagersRanking({ reviews, projects }: ManagersRankingProps) {
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [selectedPhase, setSelectedPhase] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Extract all unique phases present in reviews for the filter
  const phases = useMemo(() => {
    const uniquePhases = new Set<string>();
    reviews.forEach(r => {
      if (r.phase) uniquePhases.add(r.phase);
    });
    return ['all', ...Array.from(uniquePhases)];
  }, [reviews]);

  // Aggregate stats per Manager (GP)
  const rankingData = useMemo(() => {
    // 1. Group reviews by GP
    const gpGroups: Record<string, { filteredReviews: QAReview[]; allReviews: QAReview[] }> = {};

    reviews.forEach(review => {
      const gp = review.manager;
      if (!gpGroups[gp]) {
        gpGroups[gp] = { filteredReviews: [], allReviews: [] };
      }
      
      // Store in all reviews (for lifetime average)
      gpGroups[gp].allReviews.push(review);

      // Determine if review matches month filter
      let matchesMonth = true;
      if (selectedMonth !== 'all' && review.validationDate) {
        // Safe parsing: e.g. "2026-06-15"
        const parts = review.validationDate.split('-');
        if (parts.length >= 2) {
          const monthVal = parseInt(parts[1], 10).toString();
          matchesMonth = monthVal === selectedMonth;
        } else {
          matchesMonth = false;
        }
      }

      // Determine if review matches phase filter
      const matchesPhase = selectedPhase === 'all' || review.phase === selectedPhase;

      if (matchesMonth && matchesPhase) {
        gpGroups[gp].filteredReviews.push(review);
      }
    });

    // 2. Map groups into ranking list
    const list = Object.entries(gpGroups).map(([gpName, group]) => {
      // Calculate overall (lifetime) average adherence
      const totalAllAdherence = group.allReviews.reduce((sum, r) => sum + r.adherence, 0);
      const lifetimeAverage = group.allReviews.length > 0 ? (totalAllAdherence / group.allReviews.length) * 100 : 0;

      // Calculate filtered average adherence
      const totalFilteredAdherence = group.filteredReviews.reduce((sum, r) => sum + r.adherence, 0);
      const filteredAverage = group.filteredReviews.length > 0 ? (totalFilteredAdherence / group.filteredReviews.length) * 100 : 0;

      // Count total active projects led by this GP
      const activeProjectsCount = projects.filter(p => p.manager === gpName && p.status === 'APPROVED').length;

      return {
        manager: gpName,
        lifetimeAverage,
        filteredAverage,
        allReviewsCount: group.allReviews.length,
        filteredReviewsCount: group.filteredReviews.length,
        activeProjectsCount,
      };
    });

    // 3. Filter by search term
    const searchedList = list.filter(item => 
      item.manager.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // 4. Sort by filtered average adherence DESC, if filteredReviewsCount > 0, otherwise put at bottom or sort by lifetime
    return searchedList.sort((a, b) => {
      const aVal = a.filteredReviewsCount > 0 ? a.filteredAverage : -1;
      const bVal = b.filteredReviewsCount > 0 ? b.filteredAverage : -1;
      
      if (aVal !== bVal) {
        return bVal - aVal;
      }
      // Fallback to lifetime average
      return b.lifetimeAverage - a.lifetimeAverage;
    });

  }, [reviews, projects, selectedMonth, selectedPhase, searchTerm]);

  // Overall KPI metrics
  const kpis = useMemo(() => {
    const activeGPs = Object.keys(reviews.reduce((acc, r) => ({ ...acc, [r.manager]: true }), {}));
    
    // Average adherence of filtered reviews
    const filteredWithScores = rankingData.filter(r => r.filteredReviewsCount > 0);
    const avgFiltered = filteredWithScores.length > 0
      ? filteredWithScores.reduce((sum, r) => sum + r.filteredAverage, 0) / filteredWithScores.length
      : 0;

    // Best GP under filters
    const bestGP = filteredWithScores.length > 0 ? filteredWithScores[0] : null;

    return {
      totalGPs: activeGPs.length,
      averageAdherence: avgFiltered,
      bestGP: bestGP ? bestGP.manager : 'N/A',
      bestGPScores: bestGP ? bestGP.filteredAverage : 0,
      totalAuditsFiltered: rankingData.reduce((sum, r) => sum + r.filteredReviewsCount, 0),
    };
  }, [rankingData, reviews]);

  const handleResetFilters = () => {
    setSelectedMonth('all');
    setSelectedPhase('all');
    setSearchTerm('');
  };

  const getAdherenceColorClass = (val: number) => {
    if (val >= 90) return 'text-emerald-600 bg-emerald-50 border-emerald-100';
    if (val >= 75) return 'text-amber-600 bg-amber-50 border-amber-100';
    return 'text-red-600 bg-red-50 border-red-100';
  };

  const getProgressBarColor = (val: number) => {
    if (val >= 90) return 'bg-emerald-500';
    if (val >= 75) return 'bg-amber-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-6">
      
      {/* Information Header Banner */}
      <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex justify-between items-center flex-wrap gap-4">
        <div>
          <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider">Ranking de Gestores (GPs)</h3>
          <p className="text-[10px] text-slate-400 mt-1">
            Classificação e aderência metodológica de GPs ao Playbook.
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleResetFilters}
            className="flex items-center gap-1.5 bg-white border border-slate-200 text-slate-600 hover:text-slate-800 px-3 py-1.5 rounded-lg text-[10px] font-bold transition cursor-pointer"
          >
            <RefreshCw size={11} />
            <span>Limpar Filtros</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1 */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex items-center gap-3">
          <div className="h-10 w-10 bg-blue-50 text-blue-700 rounded-lg flex items-center justify-center border border-blue-100 shrink-0">
            <Trophy size={18} />
          </div>
          <div>
            <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider leading-none">Melhor Gestor (Filtro)</span>
            <span className="text-sm font-extrabold text-slate-800 block mt-1 truncate max-w-[150px]">
              {kpis.bestGP}
            </span>
            {kpis.bestGPScores > 0 && (
              <span className="text-[9px] text-emerald-600 font-bold block mt-0.5">
                {kpis.bestGPScores.toFixed(1)}% Aderência
              </span>
            )}
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex items-center gap-3">
          <div className="h-10 w-10 bg-emerald-50 text-emerald-700 rounded-lg flex items-center justify-center border border-emerald-100 shrink-0">
            <Target size={18} />
          </div>
          <div>
            <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider leading-none">Média Aderência (Filtro)</span>
            <span className="text-sm font-extrabold text-slate-800 block mt-1">
              {kpis.averageAdherence > 0 ? `${kpis.averageAdherence.toFixed(1)}%` : 'N/A'}
            </span>
            <span className="text-[9px] text-slate-400 block mt-0.5">
              Média do portfólio no período
            </span>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex items-center gap-3">
          <div className="h-10 w-10 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center border border-amber-100 shrink-0">
            <Users size={18} />
          </div>
          <div>
            <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider leading-none">Total de GPs Ativos</span>
            <span className="text-sm font-extrabold text-slate-800 block mt-1">
              {kpis.totalGPs} Gestores
            </span>
            <span className="text-[9px] text-slate-400 block mt-0.5">
              Com avaliações registradas
            </span>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex items-center gap-3">
          <div className="h-10 w-10 bg-slate-50 text-slate-600 rounded-lg flex items-center justify-center border border-slate-100 shrink-0">
            <BarChart2 size={18} />
          </div>
          <div>
            <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider leading-none">Auditorias Realizadas</span>
            <span className="text-sm font-extrabold text-slate-800 block mt-1">
              {kpis.totalAuditsFiltered} QAs
            </span>
            <span className="text-[9px] text-slate-400 block mt-0.5">
              Consideradas no filtro atual
            </span>
          </div>
        </div>

      </div>

      {/* Filters & Search Control Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 max-w-sm w-full">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Pesquisar por nome do GP..."
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-1.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-wrap gap-2 w-full md:w-auto items-center">
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg">
            <Filter size={11} className="text-slate-400 shrink-0" />
            <span className="text-[9px] font-bold text-slate-400 uppercase mr-1">Mês:</span>
            <select
              value={selectedMonth}
              onChange={e => setSelectedMonth(e.target.value)}
              className="bg-transparent text-slate-700 text-[11px] font-bold border-none focus:outline-none cursor-pointer"
            >
              {MONTHS_PT.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg">
            <Filter size={11} className="text-slate-400 shrink-0" />
            <span className="text-[9px] font-bold text-slate-400 uppercase mr-1">Fase:</span>
            <select
              value={selectedPhase}
              onChange={e => setSelectedPhase(e.target.value)}
              className="bg-transparent text-slate-700 text-[11px] font-bold border-none focus:outline-none cursor-pointer"
            >
              <option value="all">Todas as fases</option>
              {phases.filter(p => p !== 'all').map(p => (
                <option key={p} value={p}>{p} Phase</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Ranking Table Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[10px] uppercase font-bold tracking-wider">
                <th className="py-3 px-4 text-center w-12">Pos</th>
                <th className="py-3 px-4">Gestor (GP)</th>
                <th className="py-3 px-4 text-center w-32">Projetos Ativos</th>
                <th className="py-3 px-4 text-center w-32">QAs Filtrados</th>
                <th className="py-3 px-4">Progresso de Aderência (Filtro)</th>
                <th className="py-3 px-4 text-center w-28">Média (Filtro)</th>
                <th className="py-3 px-4 text-center w-28 border-l border-slate-100 bg-slate-50/50">Média Geral (Histórica)</th>
                <th className="py-3 px-4 text-center w-28 bg-slate-50/50">Diferença</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium">
              {rankingData.map((item, index) => {
                const isFilteredActive = item.filteredReviewsCount > 0;
                const difference = isFilteredActive ? item.filteredAverage - item.lifetimeAverage : 0;
                
                // Rank styling
                let rankBadge = null;
                if (index === 0 && isFilteredActive) {
                  rankBadge = <span className="h-6 w-6 rounded-full bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-700 font-extrabold mx-auto"><Trophy size={12} /></span>;
                } else if (index === 1 && isFilteredActive) {
                  rankBadge = <span className="h-6 w-6 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-extrabold mx-auto"><Medal size={12} /></span>;
                } else if (index === 2 && isFilteredActive) {
                  rankBadge = <span className="h-6 w-6 rounded-full bg-orange-100 border border-orange-200 flex items-center justify-center text-orange-700 font-extrabold mx-auto"><Medal size={12} /></span>;
                } else {
                  rankBadge = <span className="h-6 w-6 text-slate-400 font-mono font-bold flex items-center justify-center mx-auto">{index + 1}º</span>;
                }

                return (
                  <tr key={item.manager} className={`hover:bg-slate-50/40 transition ${!isFilteredActive ? 'opacity-65' : ''}`}>
                    <td className="py-4 px-4 text-center">
                      {rankBadge}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-center font-bold font-mono text-[11px] uppercase">
                          {item.manager.substring(0, 2)}
                        </div>
                        <div>
                          <span className="font-extrabold text-slate-800 block">GP {item.manager}</span>
                          <span className="text-[9px] text-slate-400 block">Exed Project Manager</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center text-slate-700 font-bold">
                      {item.activeProjectsCount}
                    </td>
                    <td className="py-4 px-4 text-center font-mono">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${item.filteredReviewsCount > 0 ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-400'}`}>
                        {item.filteredReviewsCount} de {item.allReviewsCount}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      {isFilteredActive ? (
                        <div className="w-full space-y-1">
                          <div className="w-full bg-slate-100 rounded-full h-1.5">
                            <div 
                              className={`h-1.5 rounded-full transition-all duration-300 ${getProgressBarColor(item.filteredAverage)}`}
                              style={{ width: `${item.filteredAverage}%` }}
                            />
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[10px] italic">Sem auditoria no período</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-center">
                      {isFilteredActive ? (
                        <span className={`px-2.5 py-1 rounded text-[10px] font-extrabold font-mono border ${getAdherenceColorClass(item.filteredAverage)}`}>
                          {item.filteredAverage.toFixed(1)}%
                        </span>
                      ) : (
                        <span className="text-slate-400 font-mono">-</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-center border-l border-slate-100 bg-slate-50/20">
                      <span className="text-slate-700 font-bold font-mono">
                        {item.lifetimeAverage.toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      {isFilteredActive ? (
                        difference >= 0 ? (
                          <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded text-[9px] font-mono font-extrabold">
                            +{difference.toFixed(1)}%
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 bg-red-50 text-red-600 border border-red-100 rounded text-[9px] font-mono font-extrabold">
                            {difference.toFixed(1)}%
                          </span>
                        )
                      ) : (
                        <span className="text-slate-400 font-mono">-</span>
                      )}
                    </td>
                  </tr>
                );
              })}

              {rankingData.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 text-xs">
                    Nenhum gestor ativo com avaliações correspondentes encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
