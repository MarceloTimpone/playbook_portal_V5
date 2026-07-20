import React, { useState, useEffect, useMemo } from 'react';
import { QAReview, Project } from '../../types';
import { 
  Clock, 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Send, 
  PlayCircle, 
  Settings, 
  Copy, 
  Check, 
  MessageSquare, 
  AlertCircle, 
  Info,
  ExternalLink
} from 'lucide-react';

interface MeetingsSummaryProps {
  reviews: QAReview[];
  projects: Project[];
  onTriggerNewQa: (projName: string) => void;
}

const DEFAULT_TEMPLATE_NO_QA = `Olá, GP!

Identificamos que o projeto (NOME DO PROJETO) para o cliente (NOME DO CLIENTE) está sem reuniões de Quality Gate registradas há mais de 30 dias.

Para garantir a governança e conformidade com o Playbook Corporativo, por favor realize o agendamento no Microsoft Teams com o seguinte título padrão:
👉 (NOME DA REUNIAO)

Contamos com o seu apoio para regularizar esta pendência o quanto antes.

Atenciosamente,
PMO Corporativo`;

const DEFAULT_TEMPLATE_NEW_QA = `Olá, GP!

Identificamos que o projeto (NOME DO PROJETO) para o cliente (NOME DO CLIENTE) está atualmente com o status de "Novo QA Necessário".

Por favor, agende uma nova sessão de auditoria técnica para tratar os pontos pendentes do Playbook. A reunião deve ser marcada com o seguinte título padrão:
👉 (NOME DA REUNIAO)

Por favor, confirme assim que agendar.

Atenciosamente,
PMO Corporativo`;

export default function MeetingsSummary({ reviews, projects, onTriggerNewQa }: MeetingsSummaryProps) {
  const [activeSubTab, setActiveSubTab] = useState<'pendencies' | 'templates'>('pendencies');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Templates state loaded from localStorage or fallback
  const [templateNoQa, setTemplateNoQa] = useState<string>(() => {
    return localStorage.getItem('exed_template_no_qa') || DEFAULT_TEMPLATE_NO_QA;
  });
  const [templateNewQa, setTemplateNewQa] = useState<string>(() => {
    return localStorage.getItem('exed_template_new_qa') || DEFAULT_TEMPLATE_NEW_QA;
  });

  const [saveSuccess, setSaveSuccess] = useState(false);

  // Modal State for Teams integration
  const [selectedPending, setSelectedPending] = useState<{
    id: string;
    client: string;
    project: string;
    gp: string;
    phase: string;
    pendencyType: 'no_qa_30' | 'new_qa_needed';
    formattedMessage: string;
    teamsLink: string;
  } | null>(null);

  const [copied, setCopied] = useState(false);

  // Persist templates on save
  const handleSaveTemplates = () => {
    localStorage.setItem('exed_template_no_qa', templateNoQa);
    localStorage.setItem('exed_template_new_qa', templateNewQa);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleRestoreDefaults = () => {
    if (confirm('Deseja redefinir as mensagens para o padrão original?')) {
      setTemplateNoQa(DEFAULT_TEMPLATE_NO_QA);
      setTemplateNewQa(DEFAULT_TEMPLATE_NEW_QA);
      localStorage.setItem('exed_template_no_qa', DEFAULT_TEMPLATE_NO_QA);
      localStorage.setItem('exed_template_new_qa', DEFAULT_TEMPLATE_NEW_QA);
    }
  };

  // Base current date set to 2026-07-20 for calculation consistency
  const referenceDate = new Date('2026-07-20');

  // Parse latest reviews per project
  const latestReviews = useMemo(() => {
    const map: Record<string, QAReview> = {};
    reviews.forEach(r => {
      const existing = map[r.projectName];
      if (!existing || new Date(r.validationDate) > new Date(existing.validationDate)) {
        map[r.projectName] = r;
      }
    });
    return map;
  }, [reviews]);

  // Derived pending projects lists
  const pendingProjects = useMemo(() => {
    const activePortalProjects = projects.filter(p => p.status === 'APPROVED');

    return activePortalProjects.map(proj => {
      const matchedReview = latestReviews[proj.name];
      
      let qaDone = false;
      let lastMeetingDate = '';
      let daysSinceLastReview = 999; // infinite if no QA has been done
      let status: 'Revisado e validado' | 'Novo QA realizado' | 'Novo QA necessário' | 'Aguardando revisão' | 'Pendente' = 'Pendente';
      let phase = proj.notes.includes('Prepare') ? 'Prepare' : 'Realise'; // default/derived from notes

      if (matchedReview) {
        qaDone = true;
        lastMeetingDate = matchedReview.validationDate;
        status = matchedReview.status;
        phase = matchedReview.phase;

        const lastDate = new Date(matchedReview.validationDate);
        const diffTime = referenceDate.getTime() - lastDate.getTime();
        daysSinceLastReview = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      }

      // Check for Pendency: Sem reunião de QA há mais de 30 dias
      const isOver30Days = daysSinceLastReview > 30;

      // Check for Pendency: Novo QA necessário
      const isNewQaNeeded = status === 'Novo QA necessário';

      return {
        id: proj.id,
        client: proj.clientName,
        line: proj.type.includes('FSW') ? 'FSW' : proj.solution,
        projectName: proj.name,
        phase,
        manager: proj.manager,
        qaDone,
        lastMeetingDate,
        daysSinceLastReview,
        isOver30Days,
        isNewQaNeeded,
        status
      };
    }).filter(p => p.isOver30Days || p.isNewQaNeeded); // Only show pending

  }, [projects, latestReviews]);

  // Filter pending list based on search bar
  const filteredPending = pendingProjects.filter(m => {
    return m.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           m.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
           m.manager.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Reusable parser to prefill template variables dynamically
  const parseTemplate = (template: string, client: string, project: string, phase: string) => {
    const meetingTitle = `[PMO Corporativo] - QA ${client} - ${phase} Phase`;
    return template
      .replace(/\(NOME DO CLIENTE\)/g, client)
      .replace(/\(NOME DO PROJETO\)/g, project)
      .replace(/\(NOME DA FASE\)/g, phase)
      .replace(/\(NOME DA REUNIAO\)/g, meetingTitle);
  };

  // Open Cobrar GP teams panel
  const handleOpenCobrarGP = (p: typeof pendingProjects[0], type: 'no_qa_30' | 'new_qa_needed') => {
    const rawTemplate = type === 'no_qa_30' ? templateNoQa : templateNewQa;
    const formatted = parseTemplate(rawTemplate, p.client, p.projectName, p.phase);
    
    // Derived email address for Microsoft Teams direct chat
    const gpEmail = `${p.manager.toLowerCase().trim().replace(/\s+/g, '.')}@exed.com.br`;
    
    // Microsoft Teams deep link URL format for starting a chat with prefilled message
    const teamsUrl = `https://teams.microsoft.com/l/chat/0/0?users=${encodeURIComponent(gpEmail)}&message=${encodeURIComponent(formatted)}`;

    setSelectedPending({
      id: p.id,
      client: p.client,
      project: p.projectName,
      gp: p.manager,
      phase: p.phase,
      pendencyType: type,
      formattedMessage: formatted,
      teamsLink: teamsUrl
    });
    setCopied(false);
  };

  const handleCopyMessage = () => {
    if (selectedPending) {
      navigator.clipboard.writeText(selectedPending.formattedMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Tab Header Banner */}
      <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex justify-between items-center flex-wrap gap-4">
        <div>
          <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider">Gestão de Resumo & Pendências</h3>
        </div>
        <div className="flex gap-2 font-mono text-[10px] font-bold">
          <span className="flex items-center gap-1 text-red-600 bg-red-50 border border-red-200 px-2.5 py-1 rounded">
            Atraso &gt; 30 Dias: {pendingProjects.filter(p => p.isOver30Days).length}
          </span>
          <span className="flex items-center gap-1 text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded">
            Novo QA Necessário: {pendingProjects.filter(p => p.isNewQaNeeded).length}
          </span>
        </div>
      </div>

      {/* Local Sub Tabs Navigation */}
      <div className="flex border-b border-slate-200 gap-1 pb-px">
        <button
          onClick={() => setActiveSubTab('pendencies')}
          className={`px-3 py-2 text-[11px] font-extrabold flex items-center gap-1.5 border-b-2 transition cursor-pointer ${
            activeSubTab === 'pendencies'
              ? 'border-blue-700 text-blue-700 font-black'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <AlertCircle size={13} />
          <span>Pendências e Cobranças ({pendingProjects.length})</span>
        </button>
        <button
          onClick={() => setActiveSubTab('templates')}
          className={`px-3 py-2 text-[11px] font-extrabold flex items-center gap-1.5 border-b-2 transition cursor-pointer ${
            activeSubTab === 'templates'
              ? 'border-blue-700 text-blue-700 font-black'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Settings size={13} />
          <span>Configuração de Mensagens Padrão</span>
        </button>
      </div>

      {/* SUBTAB 1: LISTS AND ALERTS */}
      {activeSubTab === 'pendencies' && (
        <div className="space-y-6">
          
          {/* Search Bar */}
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Filtrar por projeto, cliente ou GP..."
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-1.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              Referência: <strong className="text-slate-700">20/07/2026</strong>
            </div>
          </div>

          {/* Unified Table of Pendencies */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[10px] uppercase font-bold tracking-wider">
                    <th className="py-3 px-4">Cliente / Linha</th>
                    <th className="py-3 px-4">Projeto Ativo</th>
                    <th className="py-3 px-4">Responsável (GP)</th>
                    <th className="py-3 px-4 text-center">Último QA</th>
                    <th className="py-3 px-4">Pendência Identificada</th>
                    <th className="py-3 px-4 text-right">Ações de Cobrança</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-medium">
                  {filteredPending.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50/50 transition">
                      
                      {/* Cliente / Linha */}
                      <td className="py-3.5 px-4">
                        <span className="font-extrabold text-slate-800 block">{p.client}</span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">{p.line}</span>
                      </td>

                      {/* Projeto Ativo */}
                      <td className="py-3.5 px-4 font-bold text-slate-800">
                        {p.projectName}
                      </td>

                      {/* GP */}
                      <td className="py-3.5 px-4 text-slate-600">
                        GP {p.manager}
                      </td>

                      {/* Último QA */}
                      <td className="py-3.5 px-4 text-center">
                        {p.qaDone ? (
                          <div className="flex flex-col items-center">
                            <span className="text-slate-700 font-mono text-[10px] font-bold">
                              {new Date(p.lastMeetingDate).toLocaleDateString('pt-BR')}
                            </span>
                            <span className="text-[8px] text-slate-400 block mt-0.5">
                              Há {p.daysSinceLastReview} dias
                            </span>
                          </div>
                        ) : (
                          <span className="px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded text-[9px] font-mono font-extrabold uppercase">
                            Nenhum
                          </span>
                        )}
                      </td>

                      {/* Pendency Identifiers */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col gap-1">
                          {p.isOver30Days && (
                            <span className="px-2 py-0.5 bg-red-50 text-red-600 border border-red-100 rounded text-[10px] font-extrabold font-mono uppercase inline-flex items-center gap-1 w-fit">
                              <Clock size={10} />
                              Sem Reunião &gt; 30 dias
                            </span>
                          )}
                          {p.isNewQaNeeded && (
                            <span className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded text-[10px] font-extrabold font-mono uppercase inline-flex items-center gap-1 w-fit">
                              <AlertTriangle size={10} />
                              Novo QA Necessário
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {p.isOver30Days && (
                            <button
                              onClick={() => handleOpenCobrarGP(p, 'no_qa_30')}
                              className="bg-red-600 hover:bg-red-700 text-white px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition cursor-pointer shadow-xs"
                              title="Gerar mensagem de cobrança GP por atraso > 30 dias"
                            >
                              <Send size={10} />
                              <span>Gerar mensagem &gt; 30d</span>
                            </button>
                          )}
                          {p.isNewQaNeeded && (
                            <button
                              onClick={() => handleOpenCobrarGP(p, 'new_qa_needed')}
                              className="bg-amber-600 hover:bg-amber-700 text-white px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition cursor-pointer shadow-xs"
                              title="Gerar mensagem de cobrança GP por Novo QA Necessário"
                            >
                              <Send size={10} />
                              <span>Gerar mensagem Re-QA</span>
                            </button>
                          )}
                          <button
                            onClick={() => onTriggerNewQa(p.projectName)}
                            className="bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition cursor-pointer"
                            title="Lançar Quality Gate diretamente"
                          >
                            <PlayCircle size={10} />
                            <span>Abrir QA</span>
                          </button>
                        </div>
                      </td>

                    </tr>
                  ))}

                  {filteredPending.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400 text-xs">
                        Excelente! Não há projetos pendentes de auditoria ou em atraso de reunião.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* SUBTAB 2: CONFIGURATION OF MESSAGE TEMPLATES */}
      {activeSubTab === 'templates' && (
        <div className="space-y-6">
          
          <div className="bg-blue-50/50 border border-blue-200 p-4 rounded-xl flex items-start gap-2.5">
            <Info size={16} className="text-blue-700 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-600">
              <span className="font-extrabold text-blue-800 block mb-1">Tags Dinâmicas Disponíveis:</span>
              As tags abaixo serão preenchidas automaticamente pelo sistema antes do envio:
              <div className="flex flex-wrap gap-2 mt-2 font-mono text-[9px] font-bold">
                <span className="bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-700">(NOME DO CLIENTE)</span>
                <span className="bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-700">(NOME DO PROJETO)</span>
                <span className="bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-700">(NOME DA FASE)</span>
                <span className="bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-700">(NOME DA REUNIAO)</span>
              </div>
              <span className="text-[10px] text-slate-400 block mt-1.5 font-semibold">
                ⚠️ O formato de nome da reunião (NOME DA REUNIAO) é rigorosamente mantido como: <code className="bg-white px-1 text-blue-700 font-bold">[PMO Corporativo] - QA (NOME DO CLIENTE) - (NOME DA FASE) Phase</code>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Template 1: Sem Reunião por > 30 Dias */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h4 className="text-xs font-black text-slate-800 uppercase flex items-center gap-1.5">
                  <Clock size={13} className="text-red-500" />
                  <span>Pendência: Sem Reunião &gt; 30 Dias</span>
                </h4>
              </div>
              
              <textarea
                value={templateNoQa}
                onChange={e => setTemplateNoQa(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-[11px] font-mono leading-relaxed focus:outline-none focus:border-blue-500 h-80 focus:ring-1 focus:ring-blue-500"
                placeholder="Escreva a mensagem..."
              />
              
              {/* Sample Live Preview */}
              <div className="bg-slate-50/50 p-2.5 rounded-lg border border-slate-100 space-y-1">
                <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">Visualização Prévia (Exemplo)</span>
                <div className="text-[10px] text-slate-500 whitespace-pre-line font-mono max-h-36 overflow-y-auto bg-white p-2 border border-slate-100 rounded leading-normal">
                  {parseTemplate(templateNoQa, 'Coca-Cola', 'Onda RISE 1', 'Realise')}
                </div>
              </div>
            </div>

            {/* Template 2: Novo QA Necessário */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h4 className="text-xs font-black text-slate-800 uppercase flex items-center gap-1.5">
                  <AlertTriangle size={13} className="text-amber-500" />
                  <span>Pendência: Novo QA Necessário</span>
                </h4>
              </div>
              
              <textarea
                value={templateNewQa}
                onChange={e => setTemplateNewQa(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-[11px] font-mono leading-relaxed focus:outline-none focus:border-blue-500 h-80 focus:ring-1 focus:ring-blue-500"
                placeholder="Escreva a mensagem..."
              />

              {/* Sample Live Preview */}
              <div className="bg-slate-50/50 p-2.5 rounded-lg border border-slate-100 space-y-1">
                <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">Visualização Prévia (Exemplo)</span>
                <div className="text-[10px] text-slate-500 whitespace-pre-line font-mono max-h-36 overflow-y-auto bg-white p-2 border border-slate-100 rounded leading-normal">
                  {parseTemplate(templateNewQa, 'Ambev', 'Onda GROW 2', 'Prepare')}
                </div>
              </div>
            </div>

          </div>

          {/* Save Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <button
              onClick={handleRestoreDefaults}
              className="px-3 py-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-50 text-[10px] font-bold border border-slate-200 transition cursor-pointer"
            >
              Restaurar Padrões Exed
            </button>
            <div className="flex items-center gap-3">
              {saveSuccess && (
                <span className="text-[10px] text-emerald-600 font-extrabold flex items-center gap-1 animate-fade-in font-mono">
                  <CheckCircle2 size={12} />
                  Modelos de Mensagem Salvos!
                </span>
              )}
              <button
                onClick={handleSaveTemplates}
                className="bg-blue-700 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-[10px] font-extrabold uppercase tracking-wider transition shadow-sm cursor-pointer"
              >
                Salvar Configurações
              </button>
            </div>
          </div>

        </div>
      )}

      {/* MODAL / FLYOUT: MS TEAMS COBRANÇA */}
      {selectedPending && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-999 p-4 selection:bg-blue-500/30">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative space-y-5 animate-fade-in text-slate-800">
            
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-100">
                  <MessageSquare size={16} />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase text-slate-800 tracking-wider">Integração Teams Corporativo</h3>
                  <p className="text-[9px] text-slate-400 mt-0.5">Gerador automático de cobrança direcionada ao GP</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedPending(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold font-mono h-6 w-6 flex items-center justify-center rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Recipient Details */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 grid grid-cols-2 gap-3 text-[10px]">
              <div>
                <span className="text-slate-400 font-bold uppercase block tracking-wider text-[8px]">Destinatário</span>
                <span className="font-extrabold text-slate-800 block mt-0.5">GP {selectedPending.gp}</span>
                <span className="text-slate-400 block font-mono leading-none mt-0.5">
                  {selectedPending.gp.toLowerCase().trim().replace(/\s+/g, '.')}@exed.com.br
                </span>
              </div>
              <div>
                <span className="text-slate-400 font-bold uppercase block tracking-wider text-[8px]">Projeto / Cliente</span>
                <span className="font-extrabold text-slate-800 block mt-0.5 truncate">{selectedPending.project}</span>
                <span className="text-slate-400 block mt-0.5">Cliente: {selectedPending.client}</span>
              </div>
            </div>

            {/* Configured Standardized Message Textbox */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">Mensagem Preenchida Automaticamente</span>
                {copied ? (
                  <span className="text-[9px] text-emerald-600 font-extrabold flex items-center gap-1 animate-fade-in font-mono">
                    <Check size={10} />
                    Copiado!
                  </span>
                ) : (
                  <button 
                    onClick={handleCopyMessage}
                    className="text-[9px] text-blue-700 hover:text-blue-800 font-extrabold flex items-center gap-1 cursor-pointer hover:underline"
                  >
                    <Copy size={10} />
                    Copiar Texto
                  </button>
                )}
              </div>
              <div className="w-full bg-slate-950 text-slate-200 border border-slate-800 rounded-xl p-4 text-[11px] font-mono leading-relaxed h-60 overflow-y-auto whitespace-pre-wrap select-all">
                {selectedPending.formattedMessage}
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
              <button
                onClick={() => setSelectedPending(null)}
                className="px-3 py-2 rounded-lg hover:bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-800 text-[10px] font-bold transition cursor-pointer"
              >
                Fechar
              </button>
              <button
                onClick={handleCopyMessage}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3.5 py-2 rounded-lg text-[10px] font-bold flex items-center gap-1 transition cursor-pointer border border-slate-200"
              >
                <Copy size={11} />
                <span>Copiar Mensagem</span>
              </button>
              <a
                href={selectedPending.teamsLink}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  setSelectedPending(null);
                }}
                className="bg-blue-700 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-[10px] font-extrabold flex items-center gap-1.5 transition shadow-sm cursor-pointer"
                title="Abrir no Microsoft Teams e preencher chat"
              >
                <ExternalLink size={11} />
                <span>Gerar mensagem no Teams</span>
              </a>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
