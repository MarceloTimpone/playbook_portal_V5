import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { QACriterion, ExcelMapping } from '../../types';
import { 
  Plus, Trash2, Edit2, Check, X, Shield, RefreshCw, Save, HelpCircle, 
  Info, SlidersHorizontal, FileSpreadsheet, Download, Upload, FileUp, 
  AlertTriangle, CheckCircle2 
} from 'lucide-react';

interface CriteriaConfigProps {
  criteria: QACriterion[];
  onAddCriterion: (criterion: QACriterion) => void;
  onUpdateCriterion: (criterion: QACriterion) => void;
  onDeleteCriterion: (id: string) => void;
  isReadOnly?: boolean;
  excelMapping: ExcelMapping;
  onUpdateExcelMapping: (mapping: ExcelMapping) => void;
  qaExcelTemplate: string | null;
  onUpdateQaExcelTemplate: (template: string | null) => void;
  qaCellMapping: Record<string, any> | null;
  onUpdateQaCellMapping: (mapping: Record<string, any> | null) => void;
}

export default function CriteriaConfig({ 
  criteria, 
  onAddCriterion, 
  onUpdateCriterion, 
  onDeleteCriterion, 
  isReadOnly = false,
  excelMapping,
  onUpdateExcelMapping,
  qaExcelTemplate,
  onUpdateQaExcelTemplate,
  qaCellMapping,
  onUpdateQaCellMapping
}: CriteriaConfigProps) {
  const [subTab, setSubTab] = useState<'matrix' | 'template'>('matrix');
  const [isAdding, setIsAdding] = useState(false);
  const [showMappingPanel, setShowMappingPanel] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  // Create states
  const [newText, setNewText] = useState('');
  const [newType, setNewType] = useState('Porcentagem');
  const [newWeight, setNewWeight] = useState(3);
  const [newNumber, setNewNumber] = useState(criteria.length + 1);

  // Excel Mapping Local States
  const [mapClient, setMapClient] = useState(excelMapping?.client || 'cliente');
  const [mapLine, setMapLine] = useState(excelMapping?.line || 'linha');
  const [mapProjectName, setMapProjectName] = useState(excelMapping?.projectName || 'projeto');
  const [mapPhase, setMapPhase] = useState(excelMapping?.phase || 'fase');
  const [mapManager, setMapManager] = useState(excelMapping?.manager || 'gestor');
  const [mapPptLink, setMapPptLink] = useState(excelMapping?.pptLink || 'ppt');
  const [mapStatus, setMapStatus] = useState(excelMapping?.status || 'status');
  const [mapValidationDate, setMapValidationDate] = useState(excelMapping?.validationDate || 'data');
  const [mapNextQaRequired, setMapNextQaRequired] = useState(excelMapping?.nextQaRequired || 'próximo');
  const [mapPmoObservations, setMapPmoObservations] = useState(excelMapping?.pmoObservations || 'observ');
  const [mapCriteriaPrefix, setMapCriteriaPrefix] = useState(excelMapping?.criteriaPrefix || 'c');

  // Edit states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [editType, setEditType] = useState('');
  const [editWeight, setEditWeight] = useState(3);

  const handleStartEdit = (c: QACriterion) => {
    if (isReadOnly) return;
    setEditingId(c.id);
    setEditText(c.text);
    setEditType(c.type);
    setEditWeight(Math.min(5, c.weight));
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleSaveEdit = (id: string, number: number) => {
    if (!editText) return;
    const finalWeight = Math.min(5, Math.max(1, Number(editWeight)));
    onUpdateCriterion({
      id,
      number,
      text: editText,
      type: editType,
      weight: finalWeight
    });
    setEditingId(null);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText) return;

    const nextNum = criteria.length > 0 ? Math.max(...criteria.map(c => c.number)) + 1 : 1;
    const finalWeight = Math.min(5, Math.max(1, Number(newWeight)));
    
    onAddCriterion({
      id: 'crit-' + Date.now(),
      number: nextNum,
      text: newText,
      type: newType,
      weight: finalWeight
    });

    // Reset
    setNewText('');
    setNewType('Porcentagem');
    setNewWeight(3);
    setNewNumber(nextNum + 1);
    setIsAdding(false);
  };

  const handleSaveMapping = () => {
    onUpdateExcelMapping({
      client: mapClient,
      line: mapLine,
      projectName: mapProjectName,
      phase: mapPhase,
      manager: mapManager,
      pptLink: mapPptLink,
      status: mapStatus,
      validationDate: mapValidationDate,
      nextQaRequired: mapNextQaRequired,
      pmoObservations: mapPmoObservations,
      criteriaPrefix: mapCriteriaPrefix
    });
    setShowMappingPanel(false);
    alert("Modelo de mapeamento do Excel de QA atualizado com sucesso!");
  };

  const handleRestoreDefaultMapping = () => {
    if (confirm("Deseja restaurar as configurações padrão de cabeçalho da Exed?")) {
      setMapClient('cliente');
      setMapLine('linha');
      setMapProjectName('projeto');
      setMapPhase('fase');
      setMapManager('gestor');
      setMapPptLink('ppt');
      setMapStatus('status');
      setMapValidationDate('data');
      setMapNextQaRequired('próximo');
      setMapPmoObservations('observ');
      setMapCriteriaPrefix('c');
      
      onUpdateExcelMapping({
        client: 'cliente',
        line: 'linha',
        projectName: 'projeto',
        phase: 'fase',
        manager: 'gestor',
        pptLink: 'ppt',
        status: 'status',
        validationDate: 'data',
        nextQaRequired: 'próximo',
        pmoObservations: 'observ',
        criteriaPrefix: 'c'
      });
      alert("Configurações originais restauradas.");
    }
  };

  // Helper to translate keys for friendly display
  const getFriendlyKeyLabel = (key: string) => {
    if (key === 'client') return 'Cliente';
    if (key === 'line') return 'Linha';
    if (key === 'projectName') return 'Projeto';
    if (key === 'phase') return 'Fase';
    if (key === 'manager') return 'Gestor';
    if (key === 'pptLink') return 'Link PPT';
    if (key === 'status') return 'Status';
    if (key === 'validationDate') return 'Data Validação';
    if (key === 'nextQaRequired') return 'Próximo QA';
    if (key === 'pmoObservations') return 'Observações PMO';
    if (key.startsWith('c')) return `Critério C${key.substring(1)}`;
    return key;
  };

  // Helper to compute effective cell mapping for display
  const getEffectiveCellMapping = () => {
    if (qaCellMapping) return qaCellMapping;

    const mapping: Record<string, { sheetName: string; r: number; c: number; cellRef: string }> = {
      client: { sheetName: "Avaliação de QA", r: 3, c: 1, cellRef: "B4" },
      line: { sheetName: "Avaliação de QA", r: 4, c: 1, cellRef: "B5" },
      projectName: { sheetName: "Avaliação de QA", r: 5, c: 1, cellRef: "B6" },
      phase: { sheetName: "Avaliação de QA", r: 6, c: 1, cellRef: "B7" },
      manager: { sheetName: "Avaliação de QA", r: 7, c: 1, cellRef: "B8" },
      pptLink: { sheetName: "Avaliação de QA", r: 8, c: 1, cellRef: "B9" },
      status: { sheetName: "Avaliação de QA", r: 9, c: 1, cellRef: "B10" },
      validationDate: { sheetName: "Avaliação de QA", r: 10, c: 1, cellRef: "B11" },
      nextQaRequired: { sheetName: "Avaliação de QA", r: 11, c: 1, cellRef: "B12" },
      pmoObservations: { sheetName: "Avaliação de QA", r: 12, c: 1, cellRef: "B13" },
    };

    criteria.forEach((c, idx) => {
      mapping[`c${c.number}`] = { sheetName: "Avaliação de QA", r: 16 + idx, c: 2, cellRef: `C${17 + idx}` };
    });

    return mapping;
  };

  const handleDownloadTemplate = () => {
    if (qaExcelTemplate) {
      try {
        const binaryString = window.atob(qaExcelTemplate);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const wb = XLSX.read(bytes, { type: 'array' });
        XLSX.writeFile(wb, "Template_Importacao_QA_Custom.xlsx");
        return;
      } catch (err) {
        console.error("Erro ao baixar modelo customizado:", err);
      }
    }

    // Default dynamic template with bracket placeholders in actual cells
    const wb = XLSX.utils.book_new();
    const ws_data = [
      ["PORTAL DE GOVERNANÇA EXED - TEMPLATE DE QUALITY GATE"],
      [""],
      ["INFORMAÇÕES DA ONDA DE QA", "", "INSTRUÇÕES DE PREENCHIMENTO"],
      ["Cliente", "[Cliente]", "", "Preencha as células com colchetes com os valores reais."],
      ["Linha (Onda)", "[Linha]", "", "Substitua [Cliente], [Linha], etc. pelos dados do projeto."],
      ["Projeto", "[Projeto]", "", "Não remova ou altere o local dessas células se utilizar"],
      ["Fase do Projeto", "[Fase]", "", "o mapeamento de células por coordenadas."],
      ["Gestor (GP)", "[Gestor]", "", "Os critérios de C1 a C_N correspondem à nota do checklist."],
      ["Link Apresentação PPT", "[PPT]"],
      ["Status do QA", "[Status]", "", "Use 'Sim', 'Parcial', 'Não', 'N/A' ou uma porcentagem como 95%."],
      ["Data de Validação", "[Data]"],
      ["Próximo QA Necessário?", "[Próximo QA]"],
      ["Observações PMO", "[Observações]"],
      [""],
      ["CRITÉRIOS DE CONFORMIDADE (METODOLOGIA)"],
      ["Nº", "Critério Metodológico", "Avaliação (Substitua os colchetes com a nota)", "Peso"],
    ];

    criteria.forEach((c) => {
      ws_data.push([
        c.number.toString(),
        c.text,
        `[C${c.number}]`,
        c.weight.toString()
      ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(ws_data);
    XLSX.utils.book_append_sheet(wb, ws, "Avaliação de QA");
    XLSX.writeFile(wb, "Template_Importacao_QA.xlsx");
  };

  const handleTemplateUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        const mapping: Record<string, { sheetName: string; r: number; c: number; cellRef: string }> = {};
        let foundCount = 0;

        workbook.SheetNames.forEach(sheetName => {
          const ws = workbook.Sheets[sheetName];
          if (!ws || !ws['!ref']) return;
          const range = XLSX.utils.decode_range(ws['!ref']);
          
          for (let r = range.s.r; r <= range.e.r; r++) {
            for (let c = range.s.c; c <= range.e.c; c++) {
              const cellRef = XLSX.utils.encode_cell({ r, c });
              const cell = ws[cellRef];
              if (cell && typeof cell.v === 'string') {
                const val = cell.v.trim();
                const tag = val.toLowerCase();
                
                let matchedKey: string | null = null;
                if (tag === '[cliente]') matchedKey = 'client';
                else if (tag === '[linha]') matchedKey = 'line';
                else if (tag === '[projeto]') matchedKey = 'projectName';
                else if (tag === '[fase]') matchedKey = 'phase';
                else if (tag === '[gestor]') matchedKey = 'manager';
                else if (tag === '[ppt]' || tag === '[link ppt]') matchedKey = 'pptLink';
                else if (tag === '[status]') matchedKey = 'status';
                else if (tag === '[data]' || tag === '[data validação]' || tag === '[data validacao]') matchedKey = 'validationDate';
                else if (tag === '[próximo qa]' || tag === '[proximo qa]' || tag === '[próximo]' || tag === '[proximo]') matchedKey = 'nextQaRequired';
                else if (tag === '[observações]' || tag === '[observacoes]' || tag === '[observações pmo]') matchedKey = 'pmoObservations';
                else {
                  const match = val.match(/^\[c(\d+)\]$/i);
                  if (match) {
                    matchedKey = `c${match[1]}`;
                  }
                }

                if (matchedKey) {
                  mapping[matchedKey] = { sheetName, r, c, cellRef };
                  foundCount++;
                }
              }
            }
          }
        });

        if (foundCount === 0) {
          alert("Nenhuma tag de preenchimento (ex: [Cliente], [C1], etc.) foi encontrada no arquivo Excel. Verifique se as tags estão escritas corretamente entre colchetes.");
          return;
        }

        // Convert file ArrayBuffer to Base64 string for state/localStorage storage
        let binary = '';
        const bytes = new Uint8Array(data);
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        const base64String = window.btoa(binary);

        onUpdateQaExcelTemplate(base64String);
        onUpdateQaCellMapping(mapping);
        alert(`Sucesso! Modelo de planilha de QA importado e configurado com sucesso. Foram mapeadas ${foundCount} tags de coordenadas.`);
      } catch (err: any) {
        console.error(err);
        alert(`Erro ao processar o arquivo de modelo: ${err.message || err}`);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleResetTemplate = () => {
    if (confirm("Tem certeza que deseja remover o modelo customizado e voltar ao layout padrão autogerado?")) {
      onUpdateQaExcelTemplate(null);
      onUpdateQaCellMapping(null);
      alert("Modelo restaurado para o padrão autogerado.");
    }
  };

  const currentMapping = getEffectiveCellMapping();

  return (
    <div className="space-y-6 font-sans">
      
      {/* Subtabs navigation */}
      <div className="flex border-b border-slate-200 gap-1 overflow-x-auto pb-px">
        <button
          onClick={() => setSubTab('matrix')}
          className={`px-4 py-3 text-xs font-extrabold flex items-center gap-2 border-b-2 transition shrink-0 cursor-pointer ${
            subTab === 'matrix' 
              ? 'border-blue-700 text-blue-700 bg-white font-black' 
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
          }`}
        >
          <SlidersHorizontal size={14} />
          <span>Subaba 1: Matriz de Critérios e Pesos Oficiais</span>
        </button>

        <button
          onClick={() => setSubTab('template')}
          className={`px-4 py-3 text-xs font-extrabold flex items-center gap-2 border-b-2 transition shrink-0 cursor-pointer ${
            subTab === 'template' 
              ? 'border-blue-700 text-blue-700 bg-white font-black' 
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
          }`}
        >
          <FileSpreadsheet size={14} />
          <span>Subaba 2: Modelo de planilha de QA</span>
        </button>
      </div>

      {subTab === 'matrix' ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-fadeIn">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center flex-wrap gap-2">
            <span className="text-xs font-black text-slate-800 uppercase tracking-wider">Matriz de Critérios e Pesos Oficiais</span>
            <div className="flex items-center gap-2">
              {!showMappingPanel && !isReadOnly && (
                <button
                  onClick={() => setShowMappingPanel(true)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                >
                  <SlidersHorizontal size={12} />
                  <span>Alterar mapeamento de colunas (Modo Tabela)</span>
                </button>
              )}
              {!isAdding && !isReadOnly && (
                <button
                  onClick={() => {
                    setNewNumber(criteria.length > 0 ? Math.max(...criteria.map(c => c.number)) + 1 : 1);
                    setIsAdding(true);
                  }}
                  className="bg-blue-700 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-extrabold flex items-center gap-1 transition cursor-pointer"
                >
                  <Plus size={12} />
                  <span>Adicionar Critério</span>
                </button>
              )}
            </div>
          </div>

          {/* Excel Mapping Configuration Panel */}
          {showMappingPanel && !isReadOnly && (
            <div className="p-5 bg-slate-50/80 border-b border-slate-200 space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="text-blue-700" size={16} />
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-tight">Definições do Cabeçalho Excel (Modo Tabela de QAs)</h4>
                </div>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={handleRestoreDefaultMapping}
                    className="bg-white hover:bg-slate-100 text-slate-500 border border-slate-200 px-2.5 py-1 rounded text-[10px] font-bold transition flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw size={10} />
                    <span>Restaurar Padrão</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowMappingPanel(false)}
                    className="bg-white hover:bg-slate-100 text-slate-500 border border-slate-200 px-2 py-1 rounded text-[10px] font-bold transition flex items-center justify-center cursor-pointer"
                  >
                    <X size={12} />
                  </button>
                </div>
              </div>
              
              <p className="text-[11px] text-slate-500 leading-relaxed max-w-4xl">
                Configure os termos buscados nos cabeçalhos quando subir uma lista tabular contendo múltiplos registros de QA de uma só vez.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3.5 pt-1">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-bold text-slate-500 block">Cliente</label>
                  <input 
                    type="text"
                    value={mapClient}
                    onChange={e => setMapClient(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded px-2.5 py-1 text-xs font-bold focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-bold text-slate-500 block">Linha (Onda)</label>
                  <input 
                    type="text"
                    value={mapLine}
                    onChange={e => setMapLine(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded px-2.5 py-1 text-xs font-bold focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-bold text-slate-500 block">Projeto (Nome)</label>
                  <input 
                    type="text"
                    value={mapProjectName}
                    onChange={e => setMapProjectName(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded px-2.5 py-1 text-xs font-bold focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-bold text-slate-500 block">Fase do Projeto</label>
                  <input 
                    type="text"
                    value={mapPhase}
                    onChange={e => setMapPhase(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded px-2.5 py-1 text-xs font-bold focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-bold text-slate-500 block">Gestor (GP)</label>
                  <input 
                    type="text"
                    value={mapManager}
                    onChange={e => setMapManager(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded px-2.5 py-1 text-xs font-bold focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-bold text-slate-500 block">Link PPT</label>
                  <input 
                    type="text"
                    value={mapPptLink}
                    onChange={e => setMapPptLink(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded px-2.5 py-1 text-xs font-bold focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-bold text-slate-500 block">Status</label>
                  <input 
                    type="text"
                    value={mapStatus}
                    onChange={e => setMapStatus(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded px-2.5 py-1 text-xs font-bold focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-bold text-slate-500 block">Data Validação</label>
                  <input 
                    type="text"
                    value={mapValidationDate}
                    onChange={e => setMapValidationDate(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded px-2.5 py-1 text-xs font-bold focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-bold text-slate-500 block">Próximo QA</label>
                  <input 
                    type="text"
                    value={mapNextQaRequired}
                    onChange={e => setMapNextQaRequired(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded px-2.5 py-1 text-xs font-bold focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-bold text-slate-500 block">Observações PMO</label>
                  <input 
                    type="text"
                    value={mapPmoObservations}
                    onChange={e => setMapPmoObservations(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded px-2.5 py-1 text-xs font-bold focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-bold text-slate-500 block">Prefixo de Critério</label>
                  <input 
                    type="text"
                    value={mapCriteriaPrefix}
                    onChange={e => setMapCriteriaPrefix(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded px-2.5 py-1 text-xs font-bold focus:outline-none"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={handleSaveMapping}
                    className="w-full bg-blue-700 hover:bg-blue-600 text-white font-extrabold py-2 rounded text-xs uppercase transition cursor-pointer flex items-center justify-center gap-1 shadow-sm"
                  >
                    <Save size={12} />
                    <span>Salvar Mapeamento</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Adding form */}
          {isAdding && !isReadOnly && (
            <form onSubmit={handleAddSubmit} className="p-4 bg-blue-50/45 border-b border-blue-100 grid grid-cols-1 md:grid-cols-4 gap-4 items-end animate-fadeIn">
              <div className="md:col-span-2 space-y-1">
                <label className="text-[9px] uppercase font-bold text-slate-500">Descrição do Critério</label>
                <input 
                  type="text"
                  value={newText}
                  onChange={e => setNewText(e.target.value)}
                  required
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-blue-500"
                  placeholder="Ex: Todas as assinaturas do blueprint recolhidas"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold text-slate-500">Método de Avaliação</label>
                <select
                  value={newType}
                  onChange={e => setNewType(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-blue-500 font-semibold"
                >
                  <option value="Porcentagem">Porcentagem (0% a 100%)</option>
                  <option value="Sim / Parcial / Não / N/A">Sim / Parcial / Não / N/A</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] uppercase font-bold text-slate-500">Peso de Relevância (Máx 5)</label>
                <div className="flex gap-2 items-center">
                  <input 
                    type="number"
                    min="1"
                    max="5"
                    value={newWeight}
                    onChange={e => setNewWeight(Math.min(5, Number(e.target.value)))}
                    required
                    className="w-20 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-blue-500 font-mono font-bold text-center"
                  />
                  <button
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-500 text-white p-2 rounded-lg text-xs font-bold transition flex items-center justify-center shrink-0 cursor-pointer"
                  >
                    <Check size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAdding(false)}
                    className="bg-white hover:bg-slate-100 text-slate-500 border border-slate-200 p-2 rounded-lg text-xs font-bold transition flex items-center justify-center shrink-0 cursor-pointer"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* List of criteria */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[10px] uppercase font-bold tracking-wider">
                  <th className="py-3 px-4 w-16 text-center">Nº</th>
                  <th className="py-3 px-4">Critério Metodológico</th>
                  <th className="py-3 px-4">Forma de Medição</th>
                  <th className="py-3 px-4 text-center w-24">Peso</th>
                  {!isReadOnly && <th className="py-3 px-4 text-right w-24">Ações</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                {criteria.map(c => {
                  const isEditing = editingId === c.id;
                  return (
                    <tr key={c.id} className="hover:bg-slate-50/30 transition">
                      <td className="py-3.5 px-4 text-center font-mono font-black text-slate-400">
                        {c.number}
                      </td>
                      <td className="py-3.5 px-4">
                        {isEditing ? (
                          <input 
                            type="text"
                            value={editText}
                            onChange={e => setEditText(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1 text-xs focus:outline-none focus:border-blue-500 font-bold"
                          />
                        ) : (
                          <span className="font-extrabold text-slate-800 block">{c.text}</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        {isEditing ? (
                          <select
                            value={editType}
                            onChange={e => setEditType(e.target.value)}
                            className="bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-blue-500 font-bold"
                          >
                            <option value="Porcentagem">Porcentagem (0% a 100%)</option>
                            <option value="Sim / Parcial / Não / N/A">Sim / Parcial / Não / N/A</option>
                          </select>
                        ) : (
                          <span className="text-slate-500 font-mono text-[11px] font-semibold bg-slate-100 px-2 py-0.5 rounded border border-slate-150">
                            {c.type}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {isEditing ? (
                          <input 
                            type="number"
                            min="1"
                            max="5"
                            value={editWeight}
                            onChange={e => setEditWeight(Math.min(5, Number(e.target.value)))}
                            className="w-16 bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs text-center focus:outline-none font-bold font-mono"
                          />
                        ) : (
                          <span className="h-7 w-7 rounded-full bg-blue-50 border border-blue-200 text-blue-700 font-black flex items-center justify-center mx-auto text-xs font-mono">
                            {c.weight}
                          </span>
                        )}
                      </td>
                      {!isReadOnly && (
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {isEditing ? (
                              <>
                                <button
                                  onClick={() => handleSaveEdit(c.id, c.number)}
                                  className="h-7 w-7 rounded bg-emerald-50 border border-emerald-200 text-emerald-600 hover:bg-emerald-100 flex items-center justify-center transition cursor-pointer"
                                  title="Salvar alterações"
                                >
                                  <Check size={12} className="stroke-[3]" />
                                </button>
                                <button
                                  onClick={handleCancelEdit}
                                  className="h-7 w-7 rounded bg-red-50 border border-red-200 text-red-500 hover:bg-red-100 flex items-center justify-center transition cursor-pointer"
                                  title="Cancelar"
                                >
                                  <X size={12} className="stroke-[3]" />
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => handleStartEdit(c)}
                                  className="h-7 w-7 rounded bg-slate-50 border border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-300 flex items-center justify-center transition cursor-pointer"
                                  title="Editar peso ou nome"
                                >
                                  <Edit2 size={12} />
                                </button>
                                <button
                                  onClick={() => {
                                    if (confirm(`Tem certeza que deseja excluir o critério ${c.number}? Isso removerá a métrica das avaliações.`)) {
                                      onDeleteCriterion(c.id);
                                    }
                                  }}
                                  className="h-7 w-7 rounded bg-slate-50 border border-slate-200 text-slate-500 hover:text-red-600 hover:border-red-300 flex items-center justify-center transition cursor-pointer"
                                  title="Excluir critério"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        // Subaba 2: Modelo de Planilha de QA
        <div className="space-y-6 animate-fadeIn">
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Column 1 & 2: Explanations and Bracket Commands Reference */}
            <div className="lg:col-span-2 space-y-6">
              
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="text-blue-700" size={18} />
                  <h3 className="text-sm font-black text-slate-800">Layout de Planilha Baseado em Coordenadas de Célula</h3>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  O Portal Exed permite que você desenhe um formulário em Excel com o design, logotipos e textos que desejar. 
                  Para indicar de qual célula o portal deve extrair cada informação de QA ao processar o upload, você só precisa colocar as tags correspondentes abaixo <strong>entre colchetes [ ]</strong> na respectiva célula do seu modelo.
                </p>
                
                <div className="flex flex-wrap gap-2 pt-2">
                  <button 
                    onClick={handleDownloadTemplate}
                    className="bg-blue-700 hover:bg-blue-600 text-white px-3.5 py-2 rounded-lg text-xs font-extrabold flex items-center gap-1.5 transition cursor-pointer shadow-sm"
                  >
                    <Download size={14} />
                    <span>Baixar Modelo Atual ({qaExcelTemplate ? 'Customizado' : 'Padrão autogerado'})</span>
                  </button>

                  {qaExcelTemplate && (
                    <button 
                      onClick={handleResetTemplate}
                      className="bg-slate-100 hover:bg-slate-200 text-red-600 border border-slate-200 px-3.5 py-2 rounded-lg text-xs font-extrabold flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <RefreshCw size={14} />
                      <span>Voltar para o Padrão Autogerado</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Tags Reference Table */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 bg-slate-50 border-b border-slate-200">
                  <span className="text-xs font-black text-slate-800 uppercase tracking-wider">Lista de Tags Suportadas e Coordenadas de Leitura</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[10px] uppercase font-bold">
                        <th className="py-2.5 px-4">Tag Requerida</th>
                        <th className="py-2.5 px-4">Dado Correspondente</th>
                        <th className="py-2.5 px-4">Aba Mapeada</th>
                        <th className="py-2.5 px-4 text-center">Célula / Coordenada</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                      
                      {/* General fields */}
                      {Object.keys(currentMapping)
                        .filter(key => !key.startsWith('c'))
                        .map(key => {
                          const item = currentMapping[key];
                          return (
                            <tr key={key} className="hover:bg-slate-50/20">
                              <td className="py-2.5 px-4 font-mono font-bold text-blue-700 text-[11px]">
                                [{getFriendlyKeyLabel(key)}]
                              </td>
                              <td className="py-2.5 px-4">
                                {key === 'client' && 'Nome do Cliente / Conta'}
                                {key === 'line' && 'Linha de tecnologia (ex: RISE, FSW)'}
                                {key === 'projectName' && 'Nome da Onda / Projeto de Qualidade'}
                                {key === 'phase' && 'Fase metodológica ativa'}
                                {key === 'manager' && 'GP Responsável pelo Projeto'}
                                {key === 'pptLink' && 'Link da apresentação de slides'}
                                {key === 'status' && 'Status de validação do QA'}
                                {key === 'validationDate' && 'Data do preenchimento do QA'}
                                {key === 'nextQaRequired' && 'Indicação de Próximo QA'}
                                {key === 'pmoObservations' && 'Parecer e considerações do PMO'}
                              </td>
                              <td className="py-2.5 px-4 text-slate-400 font-semibold">
                                {item?.sheetName || 'Qualquer'}
                              </td>
                              <td className="py-2.5 px-4 text-center">
                                <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded font-mono font-black text-slate-700">
                                  {item?.cellRef || `Linha: ${item?.r + 1}, Col: ${item?.c + 1}`}
                                </span>
                              </td>
                            </tr>
                          );
                        })}

                      {/* Criteria title row */}
                      <tr className="bg-slate-50/50">
                        <td colSpan={4} className="py-2 px-4 text-[9px] font-bold uppercase text-slate-400 tracking-wider">
                          Mapeamento dos Critérios Metodológicos Oficiais (Sincronizado)
                        </td>
                      </tr>

                      {/* Criteria fields */}
                      {criteria.map(c => {
                        const key = `c${c.number}`;
                        const item = currentMapping[key];
                        return (
                          <tr key={c.id} className="hover:bg-slate-50/20">
                            <td className="py-2.5 px-4 font-mono font-bold text-emerald-600 text-[11px]">
                              [C{c.number}]
                            </td>
                            <td className="py-2.5 px-4 truncate max-w-[280px]" title={c.text}>
                              <span className="font-semibold text-slate-800">{c.text}</span>
                            </td>
                            <td className="py-2.5 px-4 text-slate-400 font-semibold">
                              {item?.sheetName || 'Qualquer'}
                            </td>
                            <td className="py-2.5 px-4 text-center">
                              {item ? (
                                <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded font-mono font-black">
                                  {item.cellRef || `Linha: ${item.r + 1}, Col: ${item.c + 1}`}
                                </span>
                              ) : (
                                <span className="px-1.5 py-0.5 bg-red-50 text-red-500 rounded text-[10px] font-bold">
                                  Não encontrado
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}

                    </tbody>
                  </table>
                </div>
              </div>

            </div>

            {/* Column 3: Upload zone and configuration parameters */}
            <div className="space-y-6">
              
              {/* Excel Drag & Drop Template Area */}
              {!isReadOnly && (
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center gap-1.5">
                    <Upload className="text-blue-700" size={16} />
                    <h4 className="text-xs font-black uppercase text-slate-800">Subir Novo Modelo</h4>
                  </div>
                  
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Arraste o arquivo Excel modelo contendo as tags entre colchetes em suas respectivas células. O portal detectará e salvará o arquivo para os downloads futuros.
                  </p>

                  <div 
                    onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={e => {
                      e.preventDefault();
                      setIsDragging(false);
                      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                        handleTemplateUpload(e.dataTransfer.files[0]);
                      }
                    }}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-6 text-center transition cursor-pointer flex flex-col items-center justify-center space-y-2 ${
                      isDragging ? 'border-blue-700 bg-blue-50/10' : 'border-slate-200 hover:border-slate-300 bg-slate-50/30'
                    }`}
                  >
                    <FileUp size={28} className={isDragging ? 'text-blue-700 animate-bounce' : 'text-slate-400'} />
                    <span className="text-[11px] font-bold text-slate-600 block">
                      Selecione ou solte o arquivo modelo de QA (.xlsx)
                    </span>
                    <span className="text-[9px] text-slate-400 block">Suporta arquivos Excel estruturados com fórmulas</span>
                  </div>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={e => {
                      if (e.target.files && e.target.files[0]) {
                        handleTemplateUpload(e.target.files[0]);
                      }
                    }} 
                    accept=".xlsx, .xls" 
                    className="hidden" 
                  />
                </div>
              )}

              {/* Status information panel */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3.5">
                <h4 className="text-xs font-black uppercase text-slate-800">Status do Layout</h4>
                <div className="flex items-start gap-2 bg-slate-50 p-3 rounded-lg border border-slate-150">
                  {qaExcelTemplate ? (
                    <>
                      <CheckCircle2 className="text-emerald-600 shrink-0 mt-0.5" size={16} />
                      <div>
                        <span className="text-xs font-bold text-slate-800 block">Modelo Customizado Ativo</span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          O portal está lendo as respostas a partir das coordenadas detectadas na planilha enviada. O modelo padrão foi substituído.
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      <Info className="text-blue-600 shrink-0 mt-0.5" size={16} />
                      <div>
                        <span className="text-xs font-bold text-slate-800 block">Modelo Padrão Autogerado</span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          Você está utilizando o modelo dinâmico original. Ele se adapta automaticamente à quantidade de critérios cadastrados no portal.
                        </span>
                      </div>
                    </>
                  )}
                </div>
                
                {qaCellMapping && (
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Estatísticas do Mapeamento</span>
                    <div className="grid grid-cols-2 gap-2 text-center pt-1">
                      <div className="bg-slate-50 p-2 rounded border border-slate-150">
                        <span className="text-sm font-black font-mono text-blue-700 block">{Object.keys(qaCellMapping).filter(k => !k.startsWith('c')).length}/10</span>
                        <span className="text-[8px] uppercase font-black text-slate-400 tracking-wider">Gerais Mapeados</span>
                      </div>
                      <div className="bg-slate-50 p-2 rounded border border-slate-150">
                        <span className="text-sm font-black font-mono text-emerald-600 block">{Object.keys(qaCellMapping).filter(k => k.startsWith('c')).length}</span>
                        <span className="text-[8px] uppercase font-black text-slate-400 tracking-wider">Critérios Metodol.</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}
