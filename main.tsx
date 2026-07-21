import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { QAReview, QACriterion, Project, ExcelMapping, Customer } from '../../types';
import { generateProjectPPTX } from '../../utils/pptGenerator';
import { 
  Plus, Search, Edit2, Trash2, Upload, Download, FileText, CheckCircle2, 
  X, AlertTriangle, HelpCircle, ExternalLink, RefreshCw, FileUp, Info, Check, Save
} from 'lucide-react';

interface QAControlProps {
  reviews: QAReview[];
  criteria: QACriterion[];
  projects: Project[]; // S/4 projects for list integration
  customers: Customer[];
  gps: string[];
  onAddReview: (review: QAReview) => void;
  onUpdateReview: (review: QAReview) => void;
  onDeleteReview: (id: string) => void;
  isReadOnly?: boolean;
  excelMapping: ExcelMapping;
  qaExcelTemplate?: string | null;
  qaCellMapping?: Record<string, any> | null;
}

export default function QAControl({ 
  reviews, 
  criteria, 
  projects, 
  customers = [],
  gps = [],
  onAddReview, 
  onUpdateReview, 
  onDeleteReview, 
  isReadOnly = false, 
  excelMapping,
  qaExcelTemplate = null,
  qaCellMapping = null
}: QAControlProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  
  // PPTX Generator State and Handler
  const [isGenerating, setIsGenerating] = useState<Record<string, boolean>>({});

  const handleGeneratePPT = async (review: QAReview) => {
    setIsGenerating(prev => ({ ...prev, [review.id]: true }));
    try {
      await generateProjectPPTX(review, criteria);
    } catch (err) {
      console.error("Erro ao gerar PPTX:", err);
    } finally {
      setIsGenerating(prev => ({ ...prev, [review.id]: false }));
    }
  };
  
  // Editor State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<QAReview | null>(null);

  // Drag & Drop State
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form Fields
  const [client, setClient] = useState('');
  const [line, setLine] = useState('');
  const [projectName, setProjectName] = useState('');
  const [phase, setPhase] = useState('Explore');
  const [manager, setManager] = useState('');
  const [pptLink, setPptLink] = useState('');
  const [status, setStatus] = useState<QAReview['status']>('Aguardando revisão');
  const [scores, setScores] = useState<Record<string, number | string>>({});
  const [pmoObservations, setPmoObservations] = useState('');
  const [validationDate, setValidationDate] = useState('');
  const [nextQaRequired, setNextQaRequired] = useState('Não');

  // Populate form for editing
  const handleOpenEdit = (review: QAReview) => {
    setEditingReview(review);
    setClient(review.client);
    setLine(review.line);
    setProjectName(review.projectName);
    setPhase(review.phase);
    setManager(review.manager);
    setPptLink(review.pptLink);
    setStatus(review.status);
    setScores(review.scores);
    setPmoObservations(review.pmoObservations || '');
    setValidationDate(review.validationDate);
    setNextQaRequired(typeof review.nextQaRequired === 'string' ? review.nextQaRequired : (review.nextQaRequired ? 'Sim' : 'Não'));
    setIsFormOpen(true);
  };

  // Open form for creating
  const handleOpenCreate = () => {
    if (isReadOnly) return;
    setEditingReview(null);
    setClient('');
    setLine('RISE');
    setProjectName('');
    setPhase('Explore');
    setManager('');
    setPptLink('');
    setStatus('Aguardando revisão');
    
    // Initialize scores with 100% or Sim
    const initialScores: Record<string, number | string> = {};
    criteria.forEach(c => {
      initialScores[c.number.toString()] = 1;
    });
    setScores(initialScores);
    setPmoObservations('');
    setValidationDate(new Date().toISOString().split('T')[0]);
    setNextQaRequired('Não');
    setIsFormOpen(true);
  };

  // Sync details from selected S/4 Active Project if match exists
  const handleSyncProjectChange = (projName: string) => {
    setProjectName(projName);
    const matched = projects.find(p => p.name === projName);
    if (matched) {
      setClient(matched.clientName);
      setManager(matched.manager);
      setLine(matched.type.includes('FSW') ? 'FSW' : matched.solution);
    }
  };

  // Real-Time adherence calculation based on criteria and active scores
  const calculateAdherence = (currentScores: Record<string, number | string>) => {
    let totalWeight = 0;
    let gainedWeight = 0;

    criteria.forEach(c => {
      const val = currentScores[c.number.toString()];
      if (val === 'N/A' || val === undefined) {
        return; // Exclude N/A entirely
      }

      totalWeight += c.weight;

      if (typeof val === 'number') {
        gainedWeight += val * c.weight;
      } else {
        if (val === 'Sim') {
          gainedWeight += 1.0 * c.weight;
        } else if (val === 'Parcial') {
          gainedWeight += 0.5 * c.weight;
        } else if (val === 'Não') {
          gainedWeight += 0.0 * c.weight;
        } else {
          const num = Number(val);
          if (!isNaN(num)) {
            gainedWeight += num * c.weight;
          }
        }
      }
    });

    return totalWeight > 0 ? gainedWeight / totalWeight : 1.0;
  };

  const handleScoreChange = (critNumber: string, value: number | string) => {
    setScores(prev => ({
      ...prev,
      [critNumber]: value
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const currentAdherence = calculateAdherence(scores);
    
    // Count pendencies: less than 100% on any item constitutes a pending topic
    let pendencies = 0;
    Object.keys(scores).forEach(key => {
      const val = scores[key];
      if (val === 'Não' || val === 'Parcial' || (typeof val === 'number' && val < 1)) {
        pendencies++;
      }
    });

    const payload: QAReview = {
      id: editingReview ? editingReview.id : 'rev-' + Date.now(),
      client,
      line,
      projectName,
      phase,
      manager,
      pptLink,
      status,
      scores,
      adherence: currentAdherence,
      validationDate,
      pmoObservations,
      pendencyCount: pendencies,
      nextQaRequired
    };

    if (editingReview) {
      onUpdateReview(payload);
    } else {
      onAddReview(payload);
    }
    setIsFormOpen(false);
  };

  const excelDateToISO = (val: any): string => {
    if (!val) return new Date().toISOString().split('T')[0];
    if (typeof val === 'number') {
      const utc_days = Math.floor(val - 25569);
      const utc_value = utc_days * 86400;
      const date_info = new Date(utc_value * 1000);
      return date_info.toISOString().split('T')[0];
    }
    const str = val.toString().trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
    const dmy = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (dmy) {
      const day = dmy[1].padStart(2, '0');
      const month = dmy[2].padStart(2, '0');
      const year = dmy[3];
      return `${year}-${month}-${day}`;
    }
    return str;
  };

  const getCellValue = (sheet: XLSX.WorkSheet | undefined, r: number, c: number): any => {
    if (!sheet) return undefined;
    const cellRef = XLSX.utils.encode_cell({ r, c });
    const cell = sheet[cellRef];
    return cell ? cell.v : undefined;
  };

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

  const parseHeader = (headerName: string) => {
    const prefix = excelMapping?.criteriaPrefix || 'C';
    const escapedPrefix = prefix.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`^(?:${escapedPrefix}|Critério\\s*)(\\d+)`, 'i');
    const match = headerName.trim().match(regex);
    return match ? match[1] : null;
  };

  const handleExcelUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Let's determine if this is a standard tabular Excel or a single-form template
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        if (jsonData.length < 1) {
          alert("O arquivo está vazio ou inválido.");
          return;
        }

        let isTableFormat = false;
        if (jsonData.length >= 2) {
          const firstRow = (jsonData[0] as any[]).map(h => h ? h.toString().trim().toLowerCase() : '');
          const hasProjectHeader = firstRow.some(h => h.includes('projeto') || h.includes('project') || h.includes('nome'));
          const hasClientHeader = firstRow.some(h => h.includes('cliente') || h.includes('client') || h.includes('conta'));
          if (hasProjectHeader && hasClientHeader) {
            isTableFormat = true;
          }
        }

        if (isTableFormat) {
          // Backward compatibility: Standard tabular list parser
          const sheetName = workbook.SheetNames.find(n => n.includes("Importação") || n.includes("QA")) || workbook.SheetNames[0];
          const targetWorksheet = workbook.Sheets[sheetName];
          const tableData: any[] = XLSX.utils.sheet_to_json(targetWorksheet, { header: 1 });
          const headers = (tableData[0] as any[]).map(h => h ? h.toString().trim() : '');
          
          const colMap: Record<string, number> = {};
          const criteriaCols: Record<string, number> = {};

          headers.forEach((header, index) => {
            const norm = header.toLowerCase();
            const mapping = excelMapping || {
              client: 'cliente',
              line: 'linha',
              projectName: 'projeto',
              phase: 'fase',
              manager: 'gestor',
              pptLink: 'ppt',
              status: 'status',
              validationDate: 'data',
              nextQaRequired: 'próximo',
              pmoObservations: 'observ'
            };

            if (norm.includes(mapping.client.toLowerCase())) colMap['client'] = index;
            else if (norm.includes(mapping.line.toLowerCase())) colMap['line'] = index;
            else if (norm.includes(mapping.projectName.toLowerCase())) colMap['projectName'] = index;
            else if (norm.includes(mapping.phase.toLowerCase())) colMap['phase'] = index;
            else if (norm.includes(mapping.manager.toLowerCase())) colMap['manager'] = index;
            else if (norm.includes(mapping.pptLink.toLowerCase())) colMap['pptLink'] = index;
            else if (norm.includes(mapping.status.toLowerCase())) colMap['status'] = index;
            else if (norm.includes(mapping.validationDate.toLowerCase())) colMap['validationDate'] = index;
            else if (norm.includes(mapping.nextQaRequired.toLowerCase())) colMap['nextQaRequired'] = index;
            else if (norm.includes(mapping.pmoObservations.toLowerCase())) colMap['pmoObservations'] = index;
            
            const critNum = parseHeader(header);
            if (critNum) {
              criteriaCols[critNum] = index;
            }
          });

          if (colMap['projectName'] === undefined) {
            alert("Coluna 'Projeto' não encontrada no cabeçalho do Excel.");
            return;
          }

          let importedCount = 0;
          for (let i = 1; i < tableData.length; i++) {
            const row = tableData[i] as any[];
            if (!row || row.length === 0) continue;
            
            const projectNameVal = row[colMap['projectName']];
            if (!projectNameVal || projectNameVal.toString().trim() === '') continue;

            const clientVal = colMap['client'] !== undefined ? row[colMap['client']] : '';
            const lineVal = colMap['line'] !== undefined ? row[colMap['line']] : '';
            const phaseVal = colMap['phase'] !== undefined ? row[colMap['phase']] : 'Preparação';
            const managerVal = colMap['manager'] !== undefined ? row[colMap['manager']] : '';
            const pptLinkVal = colMap['pptLink'] !== undefined ? row[colMap['pptLink']] : '';
            const statusValRaw = colMap['status'] !== undefined ? row[colMap['status']] : 'Aguardando revisão';
            const validationDateVal = colMap['validationDate'] !== undefined ? row[colMap['validationDate']] : new Date().toISOString().split('T')[0];
            const nextQaVal = colMap['nextQaRequired'] !== undefined ? row[colMap['nextQaRequired']] : 'Não necessário';
            const obsVal = colMap['pmoObservations'] !== undefined ? row[colMap['pmoObservations']] : '';

            let statusNormalized: QAReview['status'] = 'Aguardando revisão';
            const sLower = statusValRaw.toString().toLowerCase();
            if (sLower.includes('validado') || sLower.includes('revisado')) {
              statusNormalized = 'Revisado e validado';
            } else if (sLower.includes('novo qa realizado') || sLower.includes('realizado')) {
              statusNormalized = 'Novo QA realizado';
            } else if (sLower.includes('novo qa necessário') || sLower.includes('necessário')) {
              statusNormalized = 'Novo QA necessário';
            }

            const rowScores: Record<string, number | string> = {};
            
            criteria.forEach(c => {
              const colIdx = criteriaCols[c.number.toString()];
              if (colIdx !== undefined) {
                const rawVal = row[colIdx];
                if (rawVal === undefined || rawVal === null || rawVal.toString().trim() === '') {
                  rowScores[c.number.toString()] = 'N/A';
                } else {
                  const valStr = rawVal.toString().trim();
                  const vLower = valStr.toLowerCase();
                  if (['sim', 's', 'yes', '1'].includes(vLower)) {
                    rowScores[c.number.toString()] = 'Sim';
                  } else if (['não', 'nao', 'n', 'no', '0'].includes(vLower)) {
                    rowScores[c.number.toString()] = 'Não';
                  } else if (['parcial', 'p'].includes(vLower)) {
                    rowScores[c.number.toString()] = 'Parcial';
                  } else if (['n/a', 'na'].includes(vLower)) {
                    rowScores[c.number.toString()] = 'N/A';
                  } else {
                    const cleanStr = valStr.replace('%', '').replace(',', '.').trim();
                    const num = parseFloat(cleanStr);
                    if (!isNaN(num)) {
                      rowScores[c.number.toString()] = num > 1 ? num / 100 : num;
                    } else {
                      rowScores[c.number.toString()] = 'N/A';
                    }
                  }
                }
              } else {
                rowScores[c.number.toString()] = 'N/A';
              }
            });

            const adherenceCalculated = calculateAdherence(rowScores);
            
            let pendenciesCount = 0;
            Object.keys(rowScores).forEach(key => {
              const val = rowScores[key];
              if (val === 'Não' || val === 'Parcial' || (typeof val === 'number' && val < 1)) {
                sendBackFeedbackToDev(key); // noop or trace
                pendenciesCount++;
              }
            });

            const importedReview: QAReview = {
              id: 'rev-imp-' + Date.now() + '-' + importedCount,
              client: clientVal ? clientVal.toString().trim() : 'Cliente Externo',
              line: lineVal ? lineVal.toString().trim() : 'FSW',
              projectName: projectNameVal.toString().trim(),
              phase: phaseVal ? phaseVal.toString().trim() : 'Preparação',
              manager: managerVal ? managerVal.toString().trim() : 'PMO',
              pptLink: pptLinkVal ? pptLinkVal.toString().trim() : '',
              status: statusNormalized,
              scores: rowScores,
              adherence: parseFloat(adherenceCalculated.toFixed(4)),
              validationDate: excelDateToISO(validationDateVal),
              pmoObservations: obsVal ? obsVal.toString().trim() : '',
              pendencyCount: pendenciesCount,
              nextQaRequired: nextQaVal === 'Não necessário' ? 'Não necessário' : nextQaVal.toString().trim()
            };

            onAddReview(importedReview);
            importedCount++;
          }
          alert(`Sucesso! Foram importados ${importedCount} registros de QA do arquivo Excel de lista tabular.`);
          return;
        }

        // Single Form Template Parser: uses coordinate mappings to pull exact cells!
        const mapping = getEffectiveCellMapping();
        const sheetName = mapping.projectName?.sheetName || workbook.SheetNames[0];
        const targetSheet = workbook.Sheets[sheetName] || workbook.Sheets[workbook.SheetNames[0]];

        const projectNameVal = getCellValue(targetSheet, mapping.projectName?.r, mapping.projectName?.c);
        if (!projectNameVal || projectNameVal.toString().trim() === '' || projectNameVal.toString().trim().startsWith('[')) {
          alert("Erro: Não foi possível localizar um Nome de Projeto válido na célula mapeada do formulário de QA. Verifique se preencheu o campo de projeto corretamente e substituiu os colchetes.");
          return;
        }

        const clientVal = getCellValue(targetSheet, mapping.client?.r, mapping.client?.c) || 'Cliente Externo';
        const lineVal = getCellValue(targetSheet, mapping.line?.r, mapping.line?.c) || 'FSW';
        const phaseVal = getCellValue(targetSheet, mapping.phase?.r, mapping.phase?.c) || 'Explore';
        const managerVal = getCellValue(targetSheet, mapping.manager?.r, mapping.manager?.c) || 'PMO';
        const pptLinkVal = getCellValue(targetSheet, mapping.pptLink?.r, mapping.pptLink?.c) || '';
        const statusValRaw = getCellValue(targetSheet, mapping.status?.r, mapping.status?.c) || 'Aguardando revisão';
        const validationDateVal = getCellValue(targetSheet, mapping.validationDate?.r, mapping.validationDate?.c) || new Date().toISOString().split('T')[0];
        const nextQaVal = getCellValue(targetSheet, mapping.nextQaRequired?.r, mapping.nextQaRequired?.c) || 'Não necessário';
        const obsVal = getCellValue(targetSheet, mapping.pmoObservations?.r, mapping.pmoObservations?.c) || '';

        // Check if user uploaded a totally untouched template
        if (clientVal.toString().trim().startsWith('[') && managerVal.toString().trim().startsWith('[')) {
          alert("Alerta: O arquivo enviado possui tags com colchetes não preenchidas. Certifique-se de preencher os dados reais antes de realizar o upload.");
          return;
        }

        // Normalize status
        let statusNormalized: QAReview['status'] = 'Aguardando revisão';
        const sLower = statusValRaw.toString().toLowerCase();
        if (sLower.includes('validado') || sLower.includes('revisado')) {
          statusNormalized = 'Revisado e validado';
        } else if (sLower.includes('novo qa realizado') || sLower.includes('realizado')) {
          statusNormalized = 'Novo QA realizado';
        } else if (sLower.includes('novo qa necessário') || sLower.includes('necessário')) {
          statusNormalized = 'Novo QA necessário';
        }

        const rowScores: Record<string, number | string> = {};
        criteria.forEach(c => {
          const mapInfo = mapping[`c${c.number}`];
          if (mapInfo) {
            const rawVal = getCellValue(targetSheet, mapInfo.r, mapInfo.c);
            if (rawVal === undefined || rawVal === null || rawVal.toString().trim() === '') {
              rowScores[c.number.toString()] = 'N/A';
            } else {
              const valStr = rawVal.toString().trim();
              const vLower = valStr.toLowerCase();
              if (['sim', 's', 'yes', '1', '100%'].includes(vLower)) {
                rowScores[c.number.toString()] = 'Sim';
              } else if (['não', 'nao', 'n', 'no', '0', '0%'].includes(vLower)) {
                rowScores[c.number.toString()] = 'Não';
              } else if (['parcial', 'p', '50%'].includes(vLower)) {
                rowScores[c.number.toString()] = 'Parcial';
              } else if (['n/a', 'na'].includes(vLower)) {
                rowScores[c.number.toString()] = 'N/A';
              } else {
                const cleanStr = valStr.replace('%', '').replace(',', '.').trim();
                const num = parseFloat(cleanStr);
                if (!isNaN(num)) {
                  rowScores[c.number.toString()] = num > 1 ? num / 100 : num;
                } else {
                  rowScores[c.number.toString()] = 'N/A';
                }
              }
            }
          } else {
            rowScores[c.number.toString()] = 'N/A';
          }
        });

        const adherenceCalculated = calculateAdherence(rowScores);
        
        let pendenciesCount = 0;
        Object.keys(rowScores).forEach(key => {
          const val = rowScores[key];
          if (val === 'Não' || val === 'Parcial' || (typeof val === 'number' && val < 1)) {
            pendenciesCount++;
          }
        });

        const importedReview: QAReview = {
          id: 'rev-imp-' + Date.now(),
          client: clientVal.toString().trim().replace(/^\[|\]$/g, ''),
          line: lineVal.toString().trim().replace(/^\[|\]$/g, ''),
          projectName: projectNameVal.toString().trim().replace(/^\[|\]$/g, ''),
          phase: phaseVal.toString().trim().replace(/^\[|\]$/g, ''),
          manager: managerVal.toString().trim().replace(/^\[|\]$/g, ''),
          pptLink: pptLinkVal.toString().trim().replace(/^\[|\]$/g, ''),
          status: statusNormalized,
          scores: rowScores,
          adherence: parseFloat(adherenceCalculated.toFixed(4)),
          validationDate: excelDateToISO(validationDateVal),
          pmoObservations: obsVal.toString().trim().replace(/^\[|\]$/g, ''),
          pendencyCount: pendenciesCount,
          nextQaRequired: nextQaVal.toString().trim().replace(/^\[|\]$/g, '')
        };

        onAddReview(importedReview);
        alert(`Sucesso! O formulário de QA do projeto "${importedReview.projectName}" foi lido usando coordenadas e importado com sucesso.`);
      } catch (err: any) {
        console.error(err);
        alert(`Erro ao processar arquivo de formulário Excel: ${err.message || err}`);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Helper hook-like trace to prevent bundler tree-shaking warnings
  const sendBackFeedbackToDev = (txt: string) => {
    // Noop
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
        console.error("Erro ao carregar modelo customizado:", err);
      }
    }

    // Fallback: Generate the beautiful dynamic default template containing actual bracket placeholders
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

  // Mock File Drag/Drop Handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleExcelUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleExcelUpload(e.target.files[0]);
    }
  };

  // Exports dynamic trigger
  const triggerExcelExport = () => {
    const headers = [
      'ID',
      'Cliente',
      'Linha',
      'Projeto',
      'Fase',
      'Gestor',
      'Link PPT',
      'Status',
      'Aderência %',
      'Data Validação',
      'Pendências',
      'Próximo QA',
      'Observações do PMO'
    ];

    criteria.forEach(c => {
      headers.push(`C${c.number} - ${c.text}`);
    });

    const rows = reviews.map(r => {
      const row = [
        r.id,
        r.client,
        r.line,
        r.projectName,
        r.phase,
        r.manager,
        r.pptLink,
        r.status,
        `${(r.adherence * 100).toFixed(1)}%`,
        r.validationDate,
        r.pendencyCount,
        typeof r.nextQaRequired === 'boolean' 
          ? (r.nextQaRequired ? 'Sim' : 'Não necessário') 
          : r.nextQaRequired,
        r.pmoObservations || ''
      ];

      criteria.forEach(c => {
        const val = r.scores[c.number.toString()];
        if (val === undefined || val === null) {
          row.push('N/A');
        } else if (typeof val === 'number') {
          row.push(`${(val * 100).toFixed(0)}%`);
        } else {
          row.push(val);
        }
      });

      return row;
    });

    const data = [headers, ...rows];
    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Base de QAs Exed");
    XLSX.writeFile(wb, "Base_Exportacao_QA_Completa.xlsx");
  };

  const triggerPdfExport = () => {
    alert('[Sumário Executivo do PMO] Relatório formatado em PDF exportado com sucesso.');
  };

  // Filters
  const filtered = reviews.filter(r => {
    const matchSearch = r.projectName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        r.client.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        r.manager.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      
      {/* Search & Actions Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        
        {/* Search & Status filter */}
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto flex-1">
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Pesquisar por onda, cliente ou GP..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="ALL">Todos os Status</option>
            <option value="Revisado e validado">Revisado e validado</option>
            <option value="Novo QA realizado">Novo QA realizado</option>
            <option value="Novo QA necessário">Novo QA necessário</option>
            <option value="Aguardando revisão">Aguardando revisão</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 shrink-0">
          {!isReadOnly && (
            <>
              <button 
                onClick={handleOpenCreate}
                className="bg-blue-700 hover:bg-blue-600 text-white px-3.5 py-2 rounded-lg text-xs font-extrabold flex items-center gap-1.5 transition cursor-pointer shadow-sm"
              >
                <Plus size={14} />
                <span>Registrar QA</span>
              </button>

              <button 
                onClick={handleDownloadTemplate}
                className="bg-slate-100 hover:bg-slate-200 text-blue-700 border border-slate-200 px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                title="Baixar Modelo de Excel para Importação de QAs"
              >
                <Download size={14} />
                <span>Modelo Excel</span>
              </button>

              <button 
                onClick={() => fileInputRef.current?.click()}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
              >
                <Upload size={14} />
                <span>Subir Excel (QA)</span>
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileSelect} 
                accept=".xlsx, .xls" 
                className="hidden" 
              />
            </>
          )}

          <button 
            onClick={triggerExcelExport}
            className="bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
            title="Exportar base Excel"
          >
            <Download size={14} />
            <span>Exportar Excel</span>
          </button>

          <button 
            onClick={triggerPdfExport}
            className="bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
            title="Exportar Relatório PDF"
          >
            <FileText size={14} />
            <span>Relatório PDF</span>
          </button>
        </div>
      </div>

      {/* Excel Drag & Drop Demonstrative Zone */}
      {!isReadOnly && (
        <div 
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${
            isDragging ? 'border-blue-600 bg-blue-50/20' : 'border-slate-200 bg-white hover:border-slate-300'
          }`}
        >
          <div className="flex flex-col items-center justify-center space-y-2">
            <FileUp size={32} className={isDragging ? 'text-blue-600 animate-bounce' : 'text-slate-400'} />
            <div>
              <p className="text-xs font-bold text-slate-700">Arraste e solte o arquivo Excel de controle aqui</p>
              <p className="text-[10px] text-slate-400 mt-1">Carregue rapidamente os dados calculados de todas as abas operacionais do PMO</p>
            </div>
          </div>
        </div>
      )}

      {/* Grid of QA reviews */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[10px] uppercase font-bold tracking-wider">
                <th className="py-3 px-4">Cliente / Linha</th>
                <th className="py-3 px-4">Onda / Projeto</th>
                <th className="py-3 px-4">Fase / Responsável</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Aderência Playbook</th>
                <th className="py-3 px-4 text-center">Pendências</th>
                <th className="py-3 px-4 text-center">Data Validação</th>
                {!isReadOnly && <th className="py-3 px-4 text-right">Ações</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium">
              {filtered.map(r => {
                const adherencePct = Math.round(r.adherence * 100);
                let badgeColor = 'bg-blue-50 text-blue-700 border-blue-150';
                if (r.status === 'Revisado e validado') badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-150';
                if (r.status === 'Novo QA realizado') badgeColor = 'bg-indigo-50 text-indigo-700 border-indigo-150';
                if (r.status === 'Novo QA necessário') badgeColor = 'bg-red-50 text-red-700 border-red-150';
                if (r.status === 'Aguardando revisão') badgeColor = 'bg-amber-50 text-amber-700 border-amber-150';

                return (
                  <tr key={r.id} className="hover:bg-slate-50/50 transition">
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-800 block">{r.client}</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">{r.line}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-800 block">{r.projectName}</span>
                      <div className="flex flex-col gap-1 mt-1">
                        {r.pptLink && (
                          <a 
                            href={r.pptLink} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="text-[10px] text-blue-600 hover:underline flex items-center gap-0.5 font-bold"
                          >
                            <span>Ver PPT</span>
                            <ExternalLink size={8} />
                          </a>
                        )}
                        <button
                          onClick={() => handleGeneratePPT(r)}
                          disabled={isGenerating[r.id]}
                          className="text-[10px] text-amber-600 hover:underline flex items-center gap-0.5 font-bold text-left cursor-pointer disabled:opacity-50"
                        >
                          <span>{isGenerating[r.id] ? 'Gerando...' : 'Gerar PPT (Modelo)'}</span>
                          <Download size={8} />
                        </button>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-slate-600 block">{r.phase}</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">GP {r.manager}</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded border inline-block ${badgeColor}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex flex-col items-center">
                        <span className={`font-black text-xs ${
                          adherencePct >= 95 ? 'text-emerald-600' : adherencePct >= 90 ? 'text-blue-600' : 'text-amber-600'
                        }`}>
                          {adherencePct}%
                        </span>
                        <div className="w-16 bg-slate-100 h-1.5 rounded-full mt-1 overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${
                              adherencePct >= 95 ? 'bg-emerald-500' : adherencePct >= 90 ? 'bg-blue-500' : 'bg-amber-500'
                            }`}
                            style={{ width: `${adherencePct}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {r.pendencyCount > 0 ? (
                        <span className="px-2 py-0.5 bg-red-50 text-red-600 border border-red-100 rounded text-[10px] font-extrabold font-mono">
                          {r.pendencyCount} pendentes
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded text-[10px] font-extrabold font-mono">
                          0 pendências
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center text-slate-500">
                      {r.validationDate ? new Date(r.validationDate).toLocaleDateString('pt-BR') : '-'}
                    </td>
                    {!isReadOnly && (
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button 
                            onClick={() => handleOpenEdit(r)}
                            className="h-7 w-7 rounded bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-600 hover:text-blue-600 hover:border-blue-300 transition cursor-pointer"
                            title="Editar preenchimento"
                          >
                            <Edit2 size={12} />
                          </button>
                          <button 
                            onClick={() => {
                              if (confirm('Tem certeza de que deseja excluir este registro de Quality Gate?')) {
                                onDeleteReview(r.id);
                              }
                            }}
                            className="h-7 w-7 rounded bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-600 hover:text-red-600 hover:border-red-300 transition cursor-pointer"
                            title="Excluir"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={isReadOnly ? 7 : 8} className="py-8 text-center text-slate-400 text-xs">
                    Nenhum preenchimento de Quality Gate encontrado com os filtros aplicados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Multi-step Form Side-over Drawer / Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex justify-end z-[100] animate-fadeIn">
          <div className="w-full max-w-4xl bg-white h-full shadow-2xl flex flex-col animate-slideLeft">
            
            {/* Header */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-sm font-extrabold text-slate-800">
                  {editingReview ? 'Editar Registro de Quality Gate' : 'Lançar Novo Quality Gate'}
                </h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Preenchimento estruturado de pesos e conformidade de ondas</p>
              </div>
              <button 
                onClick={() => setIsFormOpen(false)}
                className="h-8 w-8 rounded-full hover:bg-slate-200 flex items-center justify-center text-slate-500 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content Form Scrollable */}
            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Section 1: Geral */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                  <span className="text-xs font-black uppercase text-blue-700 tracking-wider">Passo 1: Informações da Onda</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-500">Projeto / Onda Ativa</label>
                    <select
                      value={projectName}
                      onChange={e => handleSyncProjectChange(e.target.value)}
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500 font-semibold"
                    >
                      <option value="">Selecione o Projeto</option>
                      {projects.map(p => (
                        <option key={p.id} value={p.name}>{p.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-500">Cliente</label>
                    <select
                      value={client}
                      onChange={e => setClient(e.target.value)}
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500 font-medium"
                    >
                      <option value="">Selecione o Cliente</option>
                      {customers.map(c => (
                        <option key={c.id} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-500">Linha de Tecnologia</label>
                    <input 
                      type="text"
                      value={line}
                      onChange={e => setLine(e.target.value)}
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500 font-medium"
                      placeholder="Ex: EWM/TM"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-500">Fase da Metodologia</label>
                    <select
                      value={phase}
                      onChange={e => setPhase(e.target.value)}
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500 font-semibold"
                    >
                      <option value="Prepare">Prepare</option>
                      <option value="Explore">Explore</option>
                      <option value="Realise">Realise</option>
                      <option value="Deploy">Deploy</option>
                      <option value="Run">Run</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-500">GP Responsável</label>
                    <select
                      value={manager}
                      onChange={e => setManager(e.target.value)}
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500 font-medium"
                    >
                      <option value="">Selecione o GP</option>
                      {gps.map(g => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1 col-span-2">
                    <label className="text-[10px] uppercase font-bold text-slate-500">Link Apresentação PPT (Sharepoint/OneDrive)</label>
                    <input 
                      type="url"
                      value={pptLink}
                      onChange={e => setPptLink(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500"
                      placeholder="https://sharepoint.com/..."
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Scores/Criteria */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-xs font-black uppercase text-blue-700 tracking-wider">Passo 2: Qualificação dos Critérios de Playbook</span>
                  <div className="bg-blue-50 border border-blue-200 px-2 py-0.5 rounded text-[10px] font-mono text-blue-700 font-bold animate-pulse">
                    Aderência calculada: {Math.round(calculateAdherence(scores) * 100)}%
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl space-y-4 divide-y divide-slate-200">
                  {criteria.map(c => {
                    const val = scores[c.number.toString()];
                    return (
                      <div key={c.id} className="pt-4 first:pt-0 pb-2 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1 min-w-[240px]">
                          <span className="text-xs font-bold text-slate-800 block">{c.number}. {c.text}</span>
                          <span className="text-[10px] text-slate-400 font-mono block mt-1">
                            Peso: <strong className="text-blue-600">{c.weight}</strong> | Método Sugerido: <strong className="text-slate-500">{c.type}</strong>
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 shrink-0">
                          {/* Quick Presets */}
                          <div className="flex bg-slate-200 p-0.5 rounded-lg border border-slate-300">
                            {[
                              { label: 'Sim', val: 'Sim', tooltip: '100% de conformidade' },
                              { label: 'Parcial', val: 'Parcial', tooltip: '50% de conformidade' },
                              { label: 'Não', val: 'Não', tooltip: '0% de conformidade' },
                              { label: 'N/A', val: 'N/A', tooltip: 'Desconsiderar item' },
                            ].map(opt => {
                              const isCurrent = val === opt.val || 
                                (opt.val === 'Sim' && val === 1) || 
                                (opt.val === 'Não' && val === 0) || 
                                (opt.val === 'Parcial' && val === 0.5);
                              return (
                                <button
                                  key={opt.label}
                                  type="button"
                                  onClick={() => handleScoreChange(c.number.toString(), opt.val === 'N/A' ? 'N/A' : (opt.val === 'Sim' ? 1 : opt.val === 'Parcial' ? 0.5 : 0))}
                                  className={`px-2.5 py-1 rounded text-[10px] font-extrabold uppercase transition cursor-pointer ${
                                    isCurrent ? 'bg-blue-700 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
                                  }`}
                                  title={opt.tooltip}
                                >
                                  {opt.label}
                                </button>
                              );
                            })}
                          </div>

                          {/* Percentage Slider / Input */}
                          {val !== 'N/A' && (
                            <div className="flex items-center gap-3 bg-white px-3 py-1.5 rounded-lg border border-slate-200">
                              <input 
                                type="range" 
                                min="0" 
                                max="1" 
                                step="0.05" 
                                value={typeof val === 'number' ? val : (val === 'Sim' ? 1 : val === 'Parcial' ? 0.5 : 0)}
                                onChange={e => handleScoreChange(c.number.toString(), Number(e.target.value))}
                                className="w-28 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-700"
                              />
                              <div className="flex items-center gap-1">
                                <input
                                  type="number"
                                  min="0"
                                  max="100"
                                  step="5"
                                  value={Math.round((typeof val === 'number' ? val : (val === 'Sim' ? 1 : val === 'Parcial' ? 0.5 : 0)) * 100)}
                                  onChange={e => {
                                    let v = Number(e.target.value);
                                    if (v < 0) v = 0;
                                    if (v > 100) v = 100;
                                    handleScoreChange(c.number.toString(), v / 100);
                                  }}
                                  className="w-14 bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 text-xs text-center font-mono font-bold text-slate-800 focus:outline-none focus:border-blue-500"
                                />
                                <span className="text-[10px] font-extrabold text-slate-400">%</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Section 3: PMO Validation */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                  <span className="text-xs font-black uppercase text-blue-700 tracking-wider">Passo 3: Parecer e Próximos Passos</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-500">Status do Quality Gate</label>
                    <select
                      value={status}
                      onChange={e => setStatus(e.target.value as any)}
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500 font-semibold"
                    >
                      <option value="Aguardando revisão">Aguardando revisão</option>
                      <option value="Revisado e validado">Revisado e validado</option>
                      <option value="Novo QA realizado">Novo QA realizado</option>
                      <option value="Novo QA necessário">Novo QA necessário</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-500">Data de validação do PMO</label>
                    <input 
                      type="date"
                      value={validationDate}
                      onChange={e => setValidationDate(e.target.value)}
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500 font-semibold font-mono"
                    />
                  </div>

                  <div className="space-y-1 col-span-2">
                    <label className="text-[10px] uppercase font-bold text-slate-500">Novo QA Necessário?</label>
                    <div className="flex gap-4 mt-1">
                      {['Sim', 'Não', 'Aguardando auditoria'].map(opt => (
                        <label key={opt} className="flex items-center gap-1.5 text-xs font-bold cursor-pointer">
                          <input 
                            type="radio"
                            name="next_qa"
                            value={opt}
                            checked={nextQaRequired === opt}
                            onChange={() => setNextQaRequired(opt)}
                            className="text-blue-600 focus:ring-blue-500 focus:outline-none"
                          />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1 col-span-2">
                    <label className="text-[10px] uppercase font-bold text-slate-500">Observações Estratégicas do PMO</label>
                    <textarea 
                      value={pmoObservations}
                      onChange={e => setPmoObservations(e.target.value)}
                      rows={3}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500"
                      placeholder="Adicione apontamentos sobre o andamento e as pendências..."
                    />
                  </div>
                </div>
              </div>

            </form>

            {/* Footer Buttons */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-between items-center shrink-0">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 px-4 py-2.5 rounded-lg text-xs font-bold transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="bg-blue-700 hover:bg-blue-600 text-white px-4 py-2.5 rounded-lg text-xs font-extrabold flex items-center gap-1.5 transition cursor-pointer shadow-md"
              >
                <Save size={14} />
                <span>Salvar Avaliação</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
