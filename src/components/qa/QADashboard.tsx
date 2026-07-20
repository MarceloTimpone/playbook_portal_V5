import React, { useState, useEffect } from 'react';
import { QAReview, RSERecord, MeetingSummary, QACriterion, Project, AppUser } from '../../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';
import { 
  Filter, RefreshCw, AlertTriangle, CheckCircle, Clock, 
  HelpCircle, ChevronRight, FileText, TrendingUp, Compass, ArrowUpRight,
  Eye, EyeOff, Save, Star, Trash2, Settings, ToggleLeft, ToggleRight
} from 'lucide-react';

interface QADashboardProps {
  reviews: QAReview[];
  rseRecords: RSERecord[];
  meetingSummaries: MeetingSummary[];
  criteria: QACriterion[];
  projects: Project[];
  currentUser?: AppUser;
}

interface FavoriteFilter {
  id: string;
  name: string;
  client: string;
  line: string;
  gp: string;
  foco: 'GP' | 'Projeto' | 'TODOS';
}

export default function QADashboard({ 
  reviews, 
  rseRecords, 
  meetingSummaries, 
  criteria,
  projects,
  currentUser
}: QADashboardProps) {
  // Filters State
  const [filterClient, setFilterClient] = useState<string>('ALL');
  const [filterLine, setFilterLine] = useState<string>('ALL');
  const [filterGP, setFilterGP] = useState<string>('ALL');
  const [foco, setFoco] = useState<'GP' | 'Projeto' | 'TODOS'>('Projeto');

  // Chart Theme/Colors State
  const [chartTheme, setChartTheme] = useState(() => {
    const saved = localStorage.getItem('exed_chart_theme');
    return saved ? JSON.parse(saved) : {
      barColor: '#3b82f6',
      lineColor: '#6366f1',
      bgColor: '#ffffff',
    };
  });

  useEffect(() => {
    localStorage.setItem('exed_chart_theme', JSON.stringify(chartTheme));
  }, [chartTheme]);

  const isDarkColor = (hex: string) => {
    if (!hex || hex.length < 6) return false;
    const c = hex.replace('#', '');
    try {
      const r = parseInt(c.substring(0, 2), 16);
      const g = parseInt(c.substring(2, 4), 16);
      const b = parseInt(c.substring(4, 6), 16);
      const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
      return yiq < 128;
    } catch (e) {
      return false;
    }
  };

  const isDark = isDarkColor(chartTheme.bgColor);
  const cardBgStyle = { backgroundColor: chartTheme.bgColor };
  const textPrimaryClass = isDark ? 'text-white' : 'text-slate-700';
  const textTitleClass = isDark ? 'text-white font-extrabold' : 'text-slate-800 font-black';
  const textSecondaryClass = isDark ? 'text-slate-300' : 'text-slate-400';
  const gridStroke = isDark ? '#334155' : '#f1f5f9';
  const tickColor = isDark ? '#cbd5e1' : '#64748b';

  // Favorite Filters State
  const [favorites, setFavorites] = useState<FavoriteFilter[]>([]);
  const [newFavName, setNewFavName] = useState<string>('');
  const [showFavPanel, setShowFavPanel] = useState<boolean>(false);

  // Chart Visibility State
  const [visibleCharts, setVisibleCharts] = useState<Record<string, boolean>>({
    histAderenciaMes: true,
    qtdQaMes: true,
    pendQA_GP: true,
    pendQA_Proj: true,
    pendNovoQA_GP: true,
    projStatus: true,
    projNaoAderenteCrit: true,
    aderenciaProj: true,
    aderenciaGP: true,
    pendRSE_Proj: true,
    atrasoRSE_Proj: true,
    pendRSE_GP: true,
    atrasoRSE_GP: true,
    pctRSE_Prazo: true,
  });
  const [showConfigPanel, setShowConfigPanel] = useState<boolean>(false);

  // Extract unique options from raw reviews and meetingSummaries
  const clients = Array.from(new Set([
    ...reviews.map(r => r.client),
    ...rseRecords.map(r => r.client),
    ...meetingSummaries.map(m => m.client)
  ])).filter(Boolean);

  const lines = Array.from(new Set([
    ...reviews.map(r => r.line),
    ...rseRecords.map(r => r.line),
    ...meetingSummaries.map(m => m.line)
  ])).filter(Boolean);

  const gps = Array.from(new Set([
    ...reviews.map(r => r.manager),
    ...meetingSummaries.map(m => m.manager),
    ...projects.map(p => p.manager)
  ])).filter(Boolean);

  // Load user favorites & visibility on mount / user change
  useEffect(() => {
    const userKey = currentUser ? `exed_fav_filters_${currentUser.id}` : 'exed_fav_filters_guest';
    const savedFavs = localStorage.getItem(userKey);
    if (savedFavs) {
      setFavorites(JSON.parse(savedFavs));
    } else {
      setFavorites([]);
    }

    const visibilityKey = currentUser ? `exed_chart_vis_${currentUser.id}` : 'exed_chart_vis_guest';
    const savedVis = localStorage.getItem(visibilityKey);
    if (savedVis) {
      setVisibleCharts(JSON.parse(savedVis));
    }
  }, [currentUser]);

  // Persist Visibility
  const toggleChartVisibility = (chartId: string) => {
    const updated = { ...visibleCharts, [chartId]: !visibleCharts[chartId] };
    setVisibleCharts(updated);
    const visibilityKey = currentUser ? `exed_chart_vis_${currentUser.id}` : 'exed_chart_vis_guest';
    localStorage.setItem(visibilityKey, JSON.stringify(updated));
  };

  const setAllChartsVisibility = (visible: boolean) => {
    const updated = Object.keys(visibleCharts).reduce((acc, key) => {
      acc[key] = visible;
      return acc;
    }, {} as Record<string, boolean>);
    setVisibleCharts(updated);
    const visibilityKey = currentUser ? `exed_chart_vis_${currentUser.id}` : 'exed_chart_vis_guest';
    localStorage.setItem(visibilityKey, JSON.stringify(updated));
  };

  // Save Favorite Filter
  const handleSaveFavorite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFavName.trim()) return;

    const newFav: FavoriteFilter = {
      id: 'fav-' + Date.now(),
      name: newFavName.trim(),
      client: filterClient,
      line: filterLine,
      gp: filterGP,
      foco: foco
    };

    const updated = [...favorites, newFav];
    setFavorites(updated);
    const userKey = currentUser ? `exed_fav_filters_${currentUser.id}` : 'exed_fav_filters_guest';
    localStorage.setItem(userKey, JSON.stringify(updated));
    setNewFavName('');
    alert('Filtro favorito salvo com sucesso!');
  };

  // Delete Favorite Filter
  const handleDeleteFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = favorites.filter(f => f.id !== id);
    setFavorites(updated);
    const userKey = currentUser ? `exed_fav_filters_${currentUser.id}` : 'exed_fav_filters_guest';
    localStorage.setItem(userKey, JSON.stringify(updated));
  };

  // Apply Favorite Filter
  const handleApplyFavorite = (fav: FavoriteFilter) => {
    setFilterClient(fav.client);
    setFilterLine(fav.line);
    setFilterGP(fav.gp);
    setFoco(fav.foco);
  };

  // Filter Data Arrays
  const filteredReviews = reviews.filter(r => {
    return (filterClient === 'ALL' || r.client === filterClient) &&
           (filterLine === 'ALL' || r.line === filterLine) &&
           (filterGP === 'ALL' || r.manager === filterGP);
  });

  const filteredRSERecords = rseRecords.filter(r => {
    return (filterClient === 'ALL' || r.client === filterClient) &&
           (filterLine === 'ALL' || r.line === filterLine) &&
           (filterGP === 'ALL' || r.projectName === filterGP || true); // GP filter will be applied via projectToGP lookup below
  });

  // Project -> GP Map to cross-reference GP filter for RSE/Meetings
  const projectToGP: Record<string, string> = {};
  reviews.forEach(r => { projectToGP[r.projectName] = r.manager; });
  meetingSummaries.forEach(m => { projectToGP[m.projectName] = m.manager; });
  projects.forEach(p => { projectToGP[p.name] = p.manager; });

  // Filter RSE and Meeting summaries properly by GP
  const finalFilteredRSEs = filteredRSERecords.filter(r => {
    if (filterGP === 'ALL') return true;
    const gp = projectToGP[r.projectName];
    return gp === filterGP;
  });

  const finalFilteredMeetings = meetingSummaries.filter(m => {
    return (filterClient === 'ALL' || m.client === filterClient) &&
           (filterLine === 'ALL' || m.line === filterLine) &&
           (filterGP === 'ALL' || m.manager === filterGP);
  });

  // Helper to format short date month
  const getMonthLabel = (dateStr: string) => {
    if (!dateStr) return 'S/D';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr.substring(0, 7);
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${months[d.getMonth()]}/${d.getFullYear()}`;
    } catch {
      return dateStr.substring(0, 7);
    }
  };

  // ==========================================
  // DATA PREPARATION FOR THE 14 CHARTS
  // Rule: If any value is 0/empty, exclude it!
  // ==========================================

  // Chart 1: Histórico de % aderência por mês
  // Group reviews by month, average adherence, value > 0
  const monthlyAdherenceMap: Record<string, { sum: number, count: number }> = {};
  filteredReviews.forEach(r => {
    const month = r.validationDate ? r.validationDate.substring(0, 7) : '2026-07';
    if (!monthlyAdherenceMap[month]) {
      monthlyAdherenceMap[month] = { sum: 0, count: 0 };
    }
    monthlyAdherenceMap[month].sum += r.adherence * 100;
    monthlyAdherenceMap[month].count += 1;
  });
  const chartData1 = Object.keys(monthlyAdherenceMap)
    .map(m => {
      const avg = monthlyAdherenceMap[m].sum / monthlyAdherenceMap[m].count;
      return { name: getMonthLabel(m), valor: Math.round(avg * 10) / 10 };
    })
    .filter(item => item.valor > 0)
    .sort((a, b) => a.name.localeCompare(b.name));

  // Chart 2: Quantidade de QAs Realizados por Mês
  const monthlyQaCount: Record<string, number> = {};
  filteredReviews.forEach(r => {
    const month = r.validationDate ? r.validationDate.substring(0, 7) : '2026-07';
    monthlyQaCount[month] = (monthlyQaCount[month] || 0) + 1;
  });
  const chartData2 = Object.keys(monthlyQaCount)
    .map(m => ({ name: getMonthLabel(m), valor: monthlyQaCount[m] }))
    .filter(item => item.valor > 0)
    .sort((a, b) => a.name.localeCompare(b.name));

  // Chart 3: Pendências após QA por GP
  const gpQAPendencies: Record<string, number> = {};
  filteredReviews.forEach(r => {
    gpQAPendencies[r.manager] = (gpQAPendencies[r.manager] || 0) + (r.pendencyCount || 0);
  });
  const chartData3 = Object.keys(gpQAPendencies)
    .map(g => ({ name: g, valor: gpQAPendencies[g] }))
    .filter(item => item.valor > 0)
    .sort((a, b) => b.valor - a.valor);

  // Chart 4: Pendências após QA por Projeto
  const projQAPendencies: Record<string, number> = {};
  filteredReviews.forEach(r => {
    projQAPendencies[r.projectName] = (projQAPendencies[r.projectName] || 0) + (r.pendencyCount || 0);
  });
  const chartData4 = Object.keys(projQAPendencies)
    .map(p => ({ name: p, valor: projQAPendencies[p] }))
    .filter(item => item.valor > 0)
    .sort((a, b) => b.valor - a.valor);

  // Chart 5: Pendências após Novo QA realizado por GP (status === 'Novo QA realizado')
  const gpNewQAPendencies: Record<string, number> = {};
  filteredReviews.forEach(r => {
    if (r.status === 'Novo QA realizado') {
      gpNewQAPendencies[r.manager] = (gpNewQAPendencies[r.manager] || 0) + (r.pendencyCount || 0);
    }
  });
  const chartData5 = Object.keys(gpNewQAPendencies)
    .map(g => ({ name: g, valor: gpNewQAPendencies[g] }))
    .filter(item => item.valor > 0)
    .sort((a, b) => b.valor - a.valor);

  // Chart 6: Projetos por status do controle
  const statusCounts: Record<string, number> = {};
  filteredReviews.forEach(r => {
    statusCounts[r.status] = (statusCounts[r.status] || 0) + 1;
  });
  const chartData6 = Object.keys(statusCounts)
    .map(s => ({ name: s, valor: statusCounts[s] }))
    .filter(item => item.valor > 0);

  // Chart 7: Projetos não aderentes por critério
  // Check scores for each criterion and count non-adherents (Sim/NA is OK, Parcial/Não/<1 is non-adherent)
  const nonAdherentCritCounts: Record<string, number> = {};
  criteria.forEach(crit => {
    const numStr = crit.number.toString();
    filteredReviews.forEach(rev => {
      const score = rev.scores?.[numStr];
      if (score !== undefined) {
        let isNonAdherent = false;
        if (typeof score === 'number') {
          isNonAdherent = score < 1;
        } else if (typeof score === 'string') {
          isNonAdherent = score === 'Não' || score === 'Parcial';
        }
        if (isNonAdherent) {
          nonAdherentCritCounts[`C${crit.number}`]= (nonAdherentCritCounts[`C${crit.number}`] || 0) + 1;
        }
      }
    });
  });
  const chartData7 = Object.keys(nonAdherentCritCounts)
    .map(c => {
      const origCrit = criteria.find(cr => `C${cr.number}` === c);
      return { 
        name: c, 
        valor: nonAdherentCritCounts[c],
        desc: origCrit ? origCrit.text : ''
      };
    })
    .filter(item => item.valor > 0)
    .sort((a, b) => b.valor - a.valor);

  // Chart 8: Aderência ao Playbook por Projeto
  const projAdherence: Record<string, { sum: number, count: number }> = {};
  filteredReviews.forEach(r => {
    if (!projAdherence[r.projectName]) {
      projAdherence[r.projectName] = { sum: 0, count: 0 };
    }
    projAdherence[r.projectName].sum += r.adherence * 100;
    projAdherence[r.projectName].count += 1;
  });
  const chartData8 = Object.keys(projAdherence)
    .map(p => ({ name: p, valor: Math.round((projAdherence[p].sum / projAdherence[p].count) * 10) / 10 }))
    .filter(item => item.valor > 0)
    .sort((a, b) => b.valor - a.valor);

  // Chart 9: Aderência Média por GP
  const gpAdherence: Record<string, { sum: number, count: number }> = {};
  filteredReviews.forEach(r => {
    if (!gpAdherence[r.manager]) {
      gpAdherence[r.manager] = { sum: 0, count: 0 };
    }
    gpAdherence[r.manager].sum += r.adherence * 100;
    gpAdherence[r.manager].count += 1;
  });
  const chartData9 = Object.keys(gpAdherence)
    .map(g => ({ name: g, valor: Math.round((gpAdherence[g].sum / gpAdherence[g].count) * 10) / 10 }))
    .filter(item => item.valor > 0)
    .sort((a, b) => b.valor - a.valor);

  // Chart 10: Pendências de RSE por criticidade por projeto
  const projRSEPendencies: Record<string, { Graves: number, Simples: number }> = {};
  finalFilteredRSEs.forEach(r => {
    if (!projRSEPendencies[r.projectName]) {
      projRSEPendencies[r.projectName] = { Graves: 0, Simples: 0 };
    }
    if (r.pendencies === 'Graves') projRSEPendencies[r.projectName].Graves += 1;
    if (r.pendencies === 'Simples/Moderadas') projRSEPendencies[r.projectName].Simples += 1;
  });
  const chartData10 = Object.keys(projRSEPendencies)
    .map(p => ({ name: p, Graves: projRSEPendencies[p].Graves, Simples: projRSEPendencies[p].Simples }))
    .filter(item => item.Graves > 0 || item.Simples > 0);

  // Chart 11: Atrasos de RSE por projeto
  const projRSEDelays: Record<string, number> = {};
  finalFilteredRSEs.forEach(r => {
    if (r.delayed === 'Sim') {
      projRSEDelays[r.projectName] = (projRSEDelays[r.projectName] || 0) + 1;
    }
  });
  const chartData11 = Object.keys(projRSEDelays)
    .map(p => ({ name: p, valor: projRSEDelays[p] }))
    .filter(item => item.valor > 0)
    .sort((a, b) => b.valor - a.valor);

  // Chart 12: Pendências de RSE por criticidade por GP
  const gpRSEPendencies: Record<string, { Graves: number, Simples: number }> = {};
  finalFilteredRSEs.forEach(r => {
    const gp = projectToGP[r.projectName] || 'S/GP';
    if (!gpRSEPendencies[gp]) {
      gpRSEPendencies[gp] = { Graves: 0, Simples: 0 };
    }
    if (r.pendencies === 'Graves') gpRSEPendencies[gp].Graves += 1;
    if (r.pendencies === 'Simples/Moderadas') gpRSEPendencies[gp].Simples += 1;
  });
  const chartData12 = Object.keys(gpRSEPendencies)
    .map(g => ({ name: g, Graves: gpRSEPendencies[g].Graves, Simples: gpRSEPendencies[g].Simples }))
    .filter(item => item.Graves > 0 || item.Simples > 0);

  // Chart 13: Atrasos de RSE por GP
  const gpRSEDelays: Record<string, number> = {};
  finalFilteredRSEs.forEach(r => {
    if (r.delayed === 'Sim') {
      const gp = projectToGP[r.projectName] || 'S/GP';
      gpRSEDelays[gp] = (gpRSEDelays[gp] || 0) + 1;
    }
  });
  const chartData13 = Object.keys(gpRSEDelays)
    .map(g => ({ name: g, valor: gpRSEDelays[g] }))
    .filter(item => item.valor > 0)
    .sort((a, b) => b.valor - a.valor);

  // Chart 14: Porcentagem de RSEs entregues no prazo e sem pendências por Projeto/GP (depende do foco, ou agrupado por Projeto)
  // Formula: (RSEs com delayed === Não e pendencies === Nenhuma) / Total RSEs * 100
  const rseComplianceData: Record<string, { perfect: number, total: number }> = {};
  finalFilteredRSEs.forEach(r => {
    const gpName = projectToGP[r.projectName] || 'S/GP';
    const key = foco === 'GP' ? gpName : (foco === 'TODOS' ? `${gpName} - ${r.projectName}` : r.projectName);
    if (!rseComplianceData[key]) {
      rseComplianceData[key] = { perfect: 0, total: 0 };
    }
    rseComplianceData[key].total += 1;
    if (r.delayed === 'Não' && r.pendencies === 'Nenhuma') {
      rseComplianceData[key].perfect += 1;
    }
  });
  const chartData14 = Object.keys(rseComplianceData)
    .map(k => {
      const pct = (rseComplianceData[k].perfect / rseComplianceData[k].total) * 100;
      return { name: k, valor: Math.round(pct * 10) / 10 };
    })
    .filter(item => item.valor > 0)
    .sort((a, b) => b.valor - a.valor);

  // General KPIs (Bento-style summary)
  const totalWavesActive = 21;
  const wavesWithQG = filteredReviews.length;
  const wavesWithoutQG = Math.max(0, totalWavesActive - wavesWithQG);
  const avgAdherence = filteredReviews.length > 0 
    ? (filteredReviews.reduce((sum, r) => sum + r.adherence, 0) / filteredReviews.length) * 100
    : 0;
  const delayedUpdatesCount = finalFilteredMeetings.filter(m => m.delayedMeeting === 'Sim').length;

  const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f43f5e'];

  // Helper function to render Empty state inside chart container
  const renderEmptyState = (message: string = 'Nenhum dado com valor maior que 0 para exibir.') => (
    <div className="h-full w-full flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 rounded-lg p-6 border border-dashed border-slate-200">
      <AlertTriangle size={24} className="text-slate-300 mb-2" />
      <span className="text-[11px] font-semibold text-center">{message}</span>
    </div>
  );

  return (
    <div className="space-y-6">
      
      {/* 1. FILTER PANEL WITH FOCO SELECT & FAVORITES */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-blue-700" />
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Filtros Inteligentes</h3>
          </div>

          <div className="flex items-center gap-2">
            {/* Toggle Config Panel */}
            <button
              onClick={() => setShowConfigPanel(!showConfigPanel)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                showConfigPanel ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Settings size={14} />
              <span>Personalizar Visualização ({Object.values(visibleCharts).filter(Boolean).length}/14)</span>
            </button>

            {/* Toggle Favorites Panel */}
            <button
              onClick={() => setShowFavPanel(!showFavPanel)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                showFavPanel ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Star size={14} className={favorites.length > 0 ? 'fill-amber-400 text-amber-500' : ''} />
              <span>Filtros Favoritos ({favorites.length})</span>
            </button>
          </div>
        </div>

        {/* Saved Favorites List */}
        {showFavPanel && (
          <div className="bg-amber-50/50 border border-amber-100 p-4 rounded-xl space-y-3 animate-fadeIn">
            <h4 className="text-xs font-extrabold text-amber-900 uppercase">Seus Filtros Salvos</h4>
            
            {favorites.length === 0 ? (
              <p className="text-[11px] text-amber-700/70">Nenhum filtro favorito registrado ainda. Salve seu filtro atual no formulário abaixo.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {favorites.map(fav => (
                  <div 
                    key={fav.id}
                    onClick={() => handleApplyFavorite(fav)}
                    className="flex items-center gap-2 bg-white hover:bg-amber-100/50 border border-amber-200/60 px-3 py-1 rounded-full text-xs font-semibold text-amber-800 cursor-pointer transition shadow-xs"
                  >
                    <span>{fav.name}</span>
                    <span className="text-[9px] bg-amber-200/50 px-1 py-0.25 rounded font-mono">
                      {fav.foco} - {fav.client !== 'ALL' ? fav.client : 'Todos'}
                    </span>
                    <button 
                      onClick={(e) => handleDeleteFavorite(fav.id, e)}
                      className="text-amber-500 hover:text-red-600 p-0.5 rounded transition"
                      title="Excluir Favorito"
                    >
                      <Trash2 size={10} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Form to Save Current Filter */}
            <form onSubmit={handleSaveFavorite} className="flex gap-2 items-center pt-2 border-t border-amber-200/50 max-w-md">
              <input 
                type="text"
                required
                value={newFavName}
                onChange={e => setNewFavName(e.target.value)}
                placeholder="Nome do seu filtro favorito..."
                className="flex-1 bg-white border border-amber-200/60 rounded-lg px-3 py-1.5 text-xs text-amber-900 focus:outline-none focus:border-amber-500 font-semibold"
              />
              <button 
                type="submit"
                className="bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 rounded-lg text-xs font-extrabold flex items-center gap-1 shadow-sm transition cursor-pointer shrink-0"
              >
                <Save size={12} />
                <span>Salvar Atual</span>
              </button>
            </form>
          </div>
        )}

        {/* Main Filters Form Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 items-end pt-2">
          {/* Foco Filter (GP or Projeto) */}
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-slate-500 block">Foco da Análise</label>
            <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 gap-1">
              <button
                type="button"
                onClick={() => setFoco('Projeto')}
                className={`flex-1 py-1 rounded text-[9px] font-bold uppercase transition cursor-pointer ${
                  foco === 'Projeto' ? 'bg-white text-blue-700 shadow-sm font-extrabold' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Projeto
              </button>
              <button
                type="button"
                onClick={() => setFoco('GP')}
                className={`flex-1 py-1 rounded text-[9px] font-bold uppercase transition cursor-pointer ${
                  foco === 'GP' ? 'bg-white text-blue-700 shadow-sm font-extrabold' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                GP
              </button>
              <button
                type="button"
                onClick={() => setFoco('TODOS')}
                className={`flex-1 py-1 rounded text-[9px] font-bold uppercase transition cursor-pointer ${
                  foco === 'TODOS' ? 'bg-white text-blue-700 shadow-sm font-extrabold' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                TODOS
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-slate-500">Cliente</label>
            <select 
              value={filterClient} 
              onChange={e => setFilterClient(e.target.value)}
              className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="ALL">Todos os Clientes ({clients.length})</option>
              {clients.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-slate-500">Linha de Solução</label>
            <select 
              value={filterLine} 
              onChange={e => setFilterLine(e.target.value)}
              className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="ALL">Todas as Linhas ({lines.length})</option>
              {lines.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-slate-500">Gerente (GP)</label>
            <select 
              value={filterGP} 
              onChange={e => setFilterGP(e.target.value)}
              className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="ALL">Todos os GPs ({gps.length})</option>
              {gps.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>

          <div className="flex gap-2">
            {(filterClient !== 'ALL' || filterLine !== 'ALL' || filterGP !== 'ALL' || foco !== 'Projeto') && (
              <button 
                onClick={() => { setFilterClient('ALL'); setFilterLine('ALL'); setFilterGP('ALL'); setFoco('Projeto'); }}
                className="w-full bg-slate-50 hover:bg-red-50 text-slate-600 hover:text-red-700 border border-slate-200 hover:border-red-200 rounded-lg py-1.5 text-xs font-bold transition cursor-pointer"
              >
                Limpar Filtros
              </button>
            )}
          </div>
        </div>

        {/* 2. SHOW / HIDE CHART SELECTION COMPONENT */}
        {showConfigPanel && (
          <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl space-y-4 animate-scaleUp">
            <div className="flex justify-between items-center border-b border-slate-200 pb-2">
              <span className="text-xs font-black text-slate-800 uppercase tracking-wider">Configurar Gráficos Exibidos</span>
              <div className="flex gap-2">
                <button 
                  onClick={() => setAllChartsVisibility(true)}
                  className="text-[10px] font-bold text-blue-700 hover:underline cursor-pointer"
                >
                  Exibir Todos
                </button>
                <span className="text-slate-300">|</span>
                <button 
                  onClick={() => setAllChartsVisibility(false)}
                  className="text-[10px] font-bold text-red-600 hover:underline cursor-pointer"
                >
                  Ocultar Todos
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {Object.keys(visibleCharts).map(key => {
                let label = '';
                if (key === 'histAderenciaMes') label = '1. Histórico de % Aderência por Mês';
                if (key === 'qtdQaMes') label = '2. Quantidade de QAs por Mês';
                if (key === 'pendQA_GP') label = '3. Pendências após QA por GP';
                if (key === 'pendQA_Proj') label = '4. Pendências após QA por Projeto';
                if (key === 'pendNovoQA_GP') label = '5. Pendências Novo QA por GP';
                if (key === 'projStatus') label = '6. Projetos por Status do Controle';
                if (key === 'projNaoAderenteCrit') label = '7. Projetos Não Aderentes por Critério';
                if (key === 'aderenciaProj') label = '8. Aderência ao Playbook por Projeto';
                if (key === 'aderenciaGP') label = '9. Aderência Média por GP';
                if (key === 'pendRSE_Proj') label = '10. Pendências RSE por Projeto';
                if (key === 'atrasoRSE_Proj') label = '11. Atrasos de RSE por Projeto';
                if (key === 'pendRSE_GP') label = '12. Pendências RSE por GP';
                if (key === 'atrasoRSE_GP') label = '13. Atrasos de RSE por GP';
                if (key === 'pctRSE_Prazo') label = '14. % RSE no Prazo e Sem Pendência';

                return (
                  <label key={key} className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50 select-none">
                    <input 
                      type="checkbox"
                      checked={visibleCharts[key]}
                      onChange={() => toggleChartVisibility(key)}
                      className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4 cursor-pointer"
                    />
                    <span className="text-[11px] font-bold text-slate-700">{label}</span>
                  </label>
                );
              })}
            </div>

            {/* Custom Chart Theme Section */}
            <div className="border-t border-slate-200 pt-4 mt-4 space-y-3">
              <span className="text-xs font-black text-slate-800 uppercase tracking-wider block">Tema e Cores dos Gráficos</span>
              
              {/* Presets Row */}
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Temas Rápidos:</span>
                <button
                  type="button"
                  onClick={() => setChartTheme({ barColor: '#3b82f6', lineColor: '#6366f1', bgColor: '#ffffff' })}
                  className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 border border-slate-300 text-[10px] font-bold cursor-pointer transition text-slate-700"
                >
                  Padrão Corporativo
                </button>
                <button
                  type="button"
                  onClick={() => setChartTheme({ barColor: '#7b1a2c', lineColor: '#b89640', bgColor: '#fdfaf2' })}
                  className="px-2.5 py-1 rounded bg-[#fdfaf2] hover:bg-[#fbf7eb] border border-[#eddcb4] text-[10px] font-bold text-[#7b1a2c] cursor-pointer transition"
                >
                  Exed Burgundy
                </button>
                <button
                  type="button"
                  onClick={() => setChartTheme({ barColor: '#10b981', lineColor: '#059669', bgColor: '#f0fdf4' })}
                  className="px-2.5 py-1 rounded bg-[#f0fdf4] hover:bg-[#dcfce7] border border-[#bbf7d0] text-[10px] font-bold text-[#10b981] cursor-pointer transition"
                >
                  Verde Floresta
                </button>
                <button
                  type="button"
                  onClick={() => setChartTheme({ barColor: '#60a5fa', lineColor: '#c084fc', bgColor: '#1e293b' })}
                  className="px-2.5 py-1 rounded bg-[#1e293b] hover:bg-[#334155] border border-slate-700 text-[10px] font-bold text-[#60a5fa] cursor-pointer transition"
                >
                  Dark Modern
                </button>
                <button
                  type="button"
                  onClick={() => setChartTheme({ barColor: '#475569', lineColor: '#0f172a', bgColor: '#f8fafc' })}
                  className="px-2.5 py-1 rounded bg-[#f8fafc] hover:bg-[#f1f5f9] border border-slate-300 text-[10px] font-bold text-slate-700 cursor-pointer transition"
                >
                  Brutalist Slate
                </button>
              </div>

              {/* Custom Color Pickers */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200">
                  <input
                    type="color"
                    value={chartTheme.barColor}
                    onChange={e => setChartTheme((prev: any) => ({ ...prev, barColor: e.target.value }))}
                    className="w-6 h-6 rounded cursor-pointer border-none p-0"
                  />
                  <span className="text-[10px] font-bold text-slate-600">Cor das Barras</span>
                </div>
                <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200">
                  <input
                    type="color"
                    value={chartTheme.lineColor}
                    onChange={e => setChartTheme((prev: any) => ({ ...prev, lineColor: e.target.value }))}
                    className="w-6 h-6 rounded cursor-pointer border-none p-0"
                  />
                  <span className="text-[10px] font-bold text-slate-600">Cor das Linhas/Áreas</span>
                </div>
                <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200">
                  <input
                    type="color"
                    value={chartTheme.bgColor}
                    onChange={e => setChartTheme((prev: any) => ({ ...prev, bgColor: e.target.value }))}
                    className="w-6 h-6 rounded cursor-pointer border-none p-0"
                  />
                  <span className="text-[10px] font-bold text-slate-600">Fundo dos Gráficos</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* KPI Cards Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3.5">
          <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
            <Compass size={20} />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Ondas Ativas</span>
            <span className="text-xl font-black text-slate-800 block mt-0.5">{totalWavesActive}</span>
            <span className="text-[9px] text-slate-400">Total do Portfólio</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3.5">
          <div className="h-10 w-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
            <CheckCircle size={20} />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">QGs Auditados</span>
            <span className="text-xl font-black text-emerald-600 block mt-0.5">{wavesWithQG}</span>
            <span className="text-[9px] text-emerald-500 font-medium">({Math.round((wavesWithQG/totalWavesActive)*100)}% de cobertura)</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3.5">
          <div className="h-10 w-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
            <AlertTriangle size={20} />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">QGs Pendentes</span>
            <span className="text-xl font-black text-amber-600 block mt-0.5">{wavesWithoutQG}</span>
            <span className="text-[9px] text-slate-400">Aguardando auditoria</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3.5">
          <div className="h-10 w-10 rounded-lg bg-violet-50 flex items-center justify-center text-violet-600 shrink-0">
            <TrendingUp size={20} />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Aderência Geral</span>
            <span className="text-xl font-black text-violet-600 block mt-0.5">{avgAdherence.toFixed(1)}%</span>
            <span className="text-[9px] text-slate-400">Ponderada da matriz</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3.5">
          <div className="h-10 w-10 rounded-lg bg-red-50 flex items-center justify-center text-red-600 shrink-0">
            <Clock size={20} />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Atrasos Cronograma</span>
            <span className="text-xl font-black text-red-600 block mt-0.5">{delayedUpdatesCount}</span>
            <span className="text-[9px] text-red-500 font-semibold">({delayedUpdatesCount > 0 ? 'Exige atenção' : 'Tudo em dia'})</span>
          </div>
        </div>
      </div>

      {/* CHARTS CONTAINER GRID */}
      {/* If focus is GP, we sort/order the list of rendered charts to place GP-focused charts first */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* CHART 1: Histórico de % aderência por mês */}
        {visibleCharts.histAderenciaMes && (
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between" style={cardBgStyle}>
            <div className="mb-4">
              <div className="flex justify-between items-center">
                <h3 className={`text-xs uppercase tracking-wider ${textTitleClass}`}>1. Histórico de % Aderência por Mês</h3>
              </div>
              <p className={`text-[10px] mt-0.5 ${textSecondaryClass}`}>Média ponderada mensal calculada das ondas de qualidade realizadas</p>
            </div>
            <div className="h-60 w-full">
              {chartData1.length === 0 ? renderEmptyState() : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData1} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                    <defs>
                      <linearGradient id="colorAderencia" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={chartTheme.lineColor} stopOpacity={0.2}/>
                        <stop offset="95%" stopColor={chartTheme.lineColor} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridStroke} />
                    <XAxis dataKey="name" tick={{ fontSize: 9, fill: tickColor }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 9, fill: tickColor }} axisLine={false} tickLine={false} />
                    <Tooltip 
                      formatter={(value: any) => [`${value}%`, 'Aderência Média']} 
                      contentStyle={{ fontSize: '11px', borderRadius: '8px' }}
                    />
                    <Area type="monotone" dataKey="valor" stroke={chartTheme.lineColor} strokeWidth={2} fillOpacity={1} fill="url(#colorAderencia)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        )}

        {/* CHART 2: Quantidade de QAs Realizados por Mês */}
        {visibleCharts.qtdQaMes && (
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between" style={cardBgStyle}>
            <div className="mb-4">
              <div className="flex justify-between items-center">
                <h3 className={`text-xs uppercase tracking-wider ${textTitleClass}`}>2. Quantidade de QAs Realizados por Mês</h3>
              </div>
              <p className={`text-[10px] mt-0.5 ${textSecondaryClass}`}>Número acumulado de auditorias de Quality Gates por mês</p>
            </div>
            <div className="h-60 w-full">
              {chartData2.length === 0 ? renderEmptyState() : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData2} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridStroke} />
                    <XAxis dataKey="name" tick={{ fontSize: 9, fill: tickColor }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 9, fill: tickColor }} axisLine={false} tickLine={false} />
                    <Tooltip formatter={(value: any) => [value, 'QAs Concluídos']} contentStyle={{ fontSize: '11px', borderRadius: '8px' }} />
                    <Bar dataKey="valor" fill={chartTheme.barColor} radius={[4, 4, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        )}

        {/* CHART 3: Pendências após QA por GP */}
        {visibleCharts.pendQA_GP && (
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between" style={cardBgStyle}>
            <div className="mb-4">
              <div className="flex justify-between items-center">
                <h3 className={`text-xs uppercase tracking-wider ${textTitleClass}`}>3. Pendências após QA por GP</h3>
              </div>
              <p className={`text-[10px] mt-0.5 ${textSecondaryClass}`}>Soma das pendências identificadas nos QAs do respectivo GP</p>
            </div>
            <div className="h-60 w-full">
              {chartData3.length === 0 ? renderEmptyState('Nenhuma pendência pendente de QA por GP') : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData3} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridStroke} />
                    <XAxis dataKey="name" tick={{ fontSize: 9, fill: tickColor }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 9, fill: tickColor }} axisLine={false} tickLine={false} />
                    <Tooltip formatter={(value: any) => [value, 'Pendências']} contentStyle={{ fontSize: '11px', borderRadius: '8px' }} />
                    <Bar dataKey="valor" fill={chartTheme.barColor} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        )}

        {/* CHART 4: Pendências após QA por Projeto */}
        {visibleCharts.pendQA_Proj && (
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between" style={cardBgStyle}>
            <div className="mb-4">
              <div className="flex justify-between items-center">
                <h3 className={`text-xs uppercase tracking-wider ${textTitleClass}`}>4. Pendências após QA por Projeto</h3>
              </div>
              <p className={`text-[10px] mt-0.5 ${textSecondaryClass}`}>Soma de pendências de Quality Gates por projeto</p>
            </div>
            <div className="h-60 w-full">
              {chartData4.length === 0 ? renderEmptyState('Nenhuma pendência ativa em projetos') : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData4} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridStroke} />
                    <XAxis dataKey="name" tick={{ fontSize: 9, fill: tickColor }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 9, fill: tickColor }} axisLine={false} tickLine={false} />
                    <Tooltip formatter={(value: any) => [value, 'Pendências']} contentStyle={{ fontSize: '11px', borderRadius: '8px' }} />
                    <Bar dataKey="valor" fill={chartTheme.barColor} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        )}

        {/* CHART 5: Pendências após Novo QA realizado por GP */}
        {visibleCharts.pendNovoQA_GP && (
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between" style={cardBgStyle}>
            <div className="mb-4">
              <div className="flex justify-between items-center">
                <h3 className={`text-xs uppercase tracking-wider ${textTitleClass}`}>5. Pendências após Novo QA por GP</h3>
              </div>
              <p className={`text-[10px] mt-0.5 ${textSecondaryClass}`}>Pendências registradas especificamente nos reviews com status 'Novo QA realizado'</p>
            </div>
            <div className="h-60 w-full">
              {chartData5.length === 0 ? renderEmptyState('Nenhum dado cadastrado com status "Novo QA realizado" contendo pendências') : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData5} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridStroke} />
                    <XAxis dataKey="name" tick={{ fontSize: 9, fill: tickColor }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 9, fill: tickColor }} axisLine={false} tickLine={false} />
                    <Tooltip formatter={(value: any) => [value, 'Pendências']} contentStyle={{ fontSize: '11px', borderRadius: '8px' }} />
                    <Bar dataKey="valor" fill={chartTheme.barColor} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        )}

        {/* CHART 6: Projetos por status do controle */}
        {visibleCharts.projStatus && (
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between" style={cardBgStyle}>
            <div className="mb-4">
              <div className="flex justify-between items-center">
                <h3 className={`text-xs uppercase tracking-wider ${textTitleClass}`}>6. Projetos por Status do Controle</h3>
              </div>
              <p className={`text-[10px] mt-0.5 ${textSecondaryClass}`}>Volume de projetos nos diferentes status do Quality Gate</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center h-60">
              <div className="h-48 w-full">
                {chartData6.length === 0 ? renderEmptyState() : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData6}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={5}
                        dataKey="valor"
                      >
                        {chartData6.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
              <div className="space-y-1.5 overflow-y-auto max-h-48">
                {chartData6.map((entry, index) => (
                  <div key={entry.name} className="flex items-center justify-between border-b border-slate-100 pb-1 text-[11px] font-semibold text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <div className="h-2 w-2 rounded-full" style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }} />
                      <span className={`truncate max-w-[120px] ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{entry.name}</span>
                    </div>
                    <span className={`font-extrabold ${isDark ? 'text-white' : 'text-slate-800'}`}>{entry.valor}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* CHART 7: Projetos não aderentes por critério */}
        {visibleCharts.projNaoAderenteCrit && (
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between" style={cardBgStyle}>
            <div className="mb-4">
              <div className="flex justify-between items-center">
                <h3 className={`text-xs uppercase tracking-wider ${textTitleClass}`}>7. Projetos Não Aderentes por Critério</h3>
              </div>
              <p className={`text-[10px] mt-0.5 ${textSecondaryClass}`}>Quantidade de ondas com pontuação não aderente por critério de Playbook</p>
            </div>
            <div className="h-60 w-full">
              {chartData7.length === 0 ? renderEmptyState('100% de conformidade! Nenhum critério com inconformidade registrado.') : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData7} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridStroke} />
                    <XAxis dataKey="name" tick={{ fontSize: 9, fill: tickColor }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 9, fill: tickColor }} axisLine={false} tickLine={false} />
                    <Tooltip 
                      formatter={(value: any, name: any, props: any) => [value, `Projetos Não Aderentes (${props.payload.desc})`]} 
                      contentStyle={{ fontSize: '11px', borderRadius: '8px', maxWidth: '300px' }}
                    />
                    <Bar dataKey="valor" fill={chartTheme.barColor} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        )}

        {/* CHART 8: Aderência ao Playbook por Projeto */}
        {visibleCharts.aderenciaProj && (
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between" style={cardBgStyle}>
            <div className="mb-4">
              <div className="flex justify-between items-center">
                <h3 className={`text-xs uppercase tracking-wider ${textTitleClass}`}>8. Aderência ao Playbook por Projeto</h3>
              </div>
              <p className={`text-[10px] mt-0.5 ${textSecondaryClass}`}>Pontuação média de aderência ao Playbook por onda/projeto</p>
            </div>
            <div className="h-60 w-full">
              {chartData8.length === 0 ? renderEmptyState() : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData8} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridStroke} />
                    <XAxis dataKey="name" tick={{ fontSize: 9, fill: tickColor }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 9, fill: tickColor }} axisLine={false} tickLine={false} />
                    <Tooltip formatter={(value: any) => [`${value}%`, 'Aderência']} contentStyle={{ fontSize: '11px', borderRadius: '8px' }} />
                    <Bar dataKey="valor" fill={chartTheme.barColor} radius={[4, 4, 0, 0]}>
                      {chartData8.map((entry, index) => {
                        let fillVal = chartTheme.barColor;
                        if (entry.valor >= 95) fillVal = '#10b981';
                        else if (entry.valor >= 85) fillVal = '#3b82f6';
                        else fillVal = '#f59e0b';
                        return <Cell key={`cell-${index}`} fill={fillVal} />;
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        )}

        {/* CHART 9: Aderência Média por GP */}
        {visibleCharts.aderenciaGP && (
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between" style={cardBgStyle}>
            <div className="mb-4">
              <div className="flex justify-between items-center">
                <h3 className={`text-xs uppercase tracking-wider ${textTitleClass}`}>9. Aderência Média por GP</h3>
              </div>
              <p className={`text-[10px] mt-0.5 ${textSecondaryClass}`}>Média ponderada da aderência de todas as ondas de cada GP</p>
            </div>
            <div className="h-60 w-full">
              {chartData9.length === 0 ? renderEmptyState() : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData9} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridStroke} />
                    <XAxis dataKey="name" tick={{ fontSize: 9, fill: tickColor }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 9, fill: tickColor }} axisLine={false} tickLine={false} />
                    <Tooltip formatter={(value: any) => [`${value}%`, 'Aderência GP']} contentStyle={{ fontSize: '11px', borderRadius: '8px' }} />
                    <Bar dataKey="valor" fill={chartTheme.barColor} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        )}

        {/* CHART 10: Pendências de RSE por criticidade por projeto */}
        {visibleCharts.pendRSE_Proj && (
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between" style={cardBgStyle}>
            <div className="mb-4">
              <div className="flex justify-between items-center">
                <h3 className={`text-xs uppercase tracking-wider ${textTitleClass}`}>10. Pendências RSE por Projeto</h3>
              </div>
              <p className={`text-[10px] mt-0.5 ${textSecondaryClass}`}>Inconformidades registradas em RSE por grau de criticidade</p>
            </div>
            <div className="h-60 w-full">
              {chartData10.length === 0 ? renderEmptyState('Nenhuma pendência activa em RSEs') : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData10} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridStroke} />
                    <XAxis dataKey="name" tick={{ fontSize: 9, fill: tickColor }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 9, fill: tickColor }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px' }} />
                    <Legend wrapperStyle={{ fontSize: '10px' }} />
                    <Bar dataKey="Graves" name="Pendência Grave" fill={chartTheme.barColor} stackId="a" radius={[2, 2, 0, 0]} />
                    <Bar dataKey="Simples" name="Pendência Simples" fill={chartTheme.lineColor} stackId="a" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        )}

        {/* CHART 11: Atrasos de RSE por projeto */}
        {visibleCharts.atrasoRSE_Proj && (
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between" style={cardBgStyle}>
            <div className="mb-4">
              <div className="flex justify-between items-center">
                <h3 className={`text-xs uppercase tracking-wider ${textTitleClass}`}>11. Atrasos de RSE por Projeto</h3>
              </div>
              <p className={`text-[10px] mt-0.5 ${textSecondaryClass}`}>Quantidade de RSEs marcados como enviados em atraso por projeto</p>
            </div>
            <div className="h-60 w-full">
              {chartData11.length === 0 ? renderEmptyState('Nenhum RSE enviado em atraso por projeto!') : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData11} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridStroke} />
                    <XAxis dataKey="name" tick={{ fontSize: 9, fill: tickColor }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 9, fill: tickColor }} axisLine={false} tickLine={false} />
                    <Tooltip formatter={(value: any) => [value, 'Atrasos']} contentStyle={{ fontSize: '11px', borderRadius: '8px' }} />
                    <Bar dataKey="valor" fill={chartTheme.barColor} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        )}

        {/* CHART 12: Pendências de RSE por criticidade por GP */}
        {visibleCharts.pendRSE_GP && (
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between" style={cardBgStyle}>
            <div className="mb-4">
              <div className="flex justify-between items-center">
                <h3 className={`text-xs uppercase tracking-wider ${textTitleClass}`}>12. Pendências RSE por GP</h3>
              </div>
              <p className={`text-[10px] mt-0.5 ${textSecondaryClass}`}>Volume de inconformidades abertas em RSEs sob gestão de cada GP</p>
            </div>
            <div className="h-60 w-full">
              {chartData12.length === 0 ? renderEmptyState('Nenhuma pendência ativa em RSEs por GP') : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData12} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridStroke} />
                    <XAxis dataKey="name" tick={{ fontSize: 9, fill: tickColor }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 9, fill: tickColor }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px' }} />
                    <Legend wrapperStyle={{ fontSize: '10px' }} />
                    <Bar dataKey="Graves" name="Grave" fill={chartTheme.barColor} stackId="b" radius={[2, 2, 0, 0]} />
                    <Bar dataKey="Simples" name="Simples" fill={chartTheme.lineColor} stackId="b" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        )}

        {/* CHART 13: Atrasos de RSE por GP */}
        {visibleCharts.atrasoRSE_GP && (
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between" style={cardBgStyle}>
            <div className="mb-4">
              <div className="flex justify-between items-center">
                <h3 className={`text-xs uppercase tracking-wider ${textTitleClass}`}>13. Atrasos de RSE por GP</h3>
              </div>
              <p className={`text-[10px] mt-0.5 ${textSecondaryClass}`}>RSEs entregues em atraso agrupados por gerente responsável</p>
            </div>
            <div className="h-60 w-full">
              {chartData13.length === 0 ? renderEmptyState('Nenhum atraso de RSE reportado para os GPs ativos!') : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData13} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridStroke} />
                    <XAxis dataKey="name" tick={{ fontSize: 9, fill: tickColor }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 9, fill: tickColor }} axisLine={false} tickLine={false} />
                    <Tooltip formatter={(value: any) => [value, 'Atrasos']} contentStyle={{ fontSize: '11px', borderRadius: '8px' }} />
                    <Bar dataKey="valor" fill={chartTheme.barColor} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        )}

        {/* CHART 14: Porcentagem de RSEs entregues no prazo e sem pendências */}
        {visibleCharts.pctRSE_Prazo && (
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between" style={cardBgStyle}>
            <div className="mb-4">
              <div className="flex justify-between items-center">
                <h3 className={`text-xs uppercase tracking-wider ${textTitleClass}`}>14. % RSE no Prazo e Sem Pendência ({foco === 'GP' ? 'por GP' : (foco === 'TODOS' ? 'por GP e Projeto' : 'por Projeto')})</h3>
              </div>
              <p className={`text-[10px] mt-0.5 ${textSecondaryClass}`}>Taxa de RSEs 100% eficientes (enviados no prazo e sem nenhuma pendência)</p>
            </div>
            <div className="h-60 w-full">
              {chartData14.length === 0 ? renderEmptyState('Nenhum RSE no prazo e sem pendências cadastrado.') : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData14} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridStroke} />
                    <XAxis dataKey="name" tick={{ fontSize: 9, fill: tickColor }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 9, fill: tickColor }} axisLine={false} tickLine={false} />
                    <Tooltip formatter={(value: any) => [`${value}%`, 'Eficiência RSE']} contentStyle={{ fontSize: '11px', borderRadius: '8px' }} />
                    <Bar dataKey="valor" fill={chartTheme.barColor} radius={[4, 4, 0, 0]}>
                      {chartData14.map((entry, index) => {
                        let fillVal = chartTheme.barColor;
                        if (entry.valor >= 90) fillVal = '#059669';
                        else if (entry.valor >= 60) fillVal = '#10b981';
                        else fillVal = '#f59e0b';
                        return <Cell key={`cell-${index}`} fill={fillVal} />;
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
