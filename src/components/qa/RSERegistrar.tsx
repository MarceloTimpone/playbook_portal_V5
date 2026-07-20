import React, { useState } from 'react';
import { RSERecord, Project } from '../../types';
import { Plus, Trash2, Calendar, FileText, CheckCircle2, AlertTriangle, Info, Save, Search, X, Edit2 } from 'lucide-react';

interface RSERegistrarProps {
  records: RSERecord[];
  projects: Project[];
  onAddRecord: (record: RSERecord) => void;
  onUpdateRecord: (record: RSERecord) => void;
  onDeleteRecord: (id: string) => void;
  isReadOnly?: boolean;
}

export default function RSERegistrar({ 
  records, 
  projects, 
  onAddRecord, 
  onUpdateRecord, 
  onDeleteRecord,
  isReadOnly = false
}: RSERegistrarProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<RSERecord | null>(null);

  // Form states
  const [client, setClient] = useState('');
  const [line, setLine] = useState('');
  const [projectName, setProjectName] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [delayed, setDelayed] = useState<'Sim' | 'Não'>('Não');
  const [pendencies, setPendencies] = useState('Nenhuma');
  const [observations, setObservations] = useState('');

  const handleProjectChange = (projName: string) => {
    setProjectName(projName);
    const matched = projects.find(p => p.name === projName);
    if (matched) {
      setClient(matched.clientName);
      setLine(matched.type.includes('FSW') ? 'FSW' : matched.solution);
    }
  };

  const handleOpenCreate = () => {
    setEditingRecord(null);
    setClient('');
    setLine('');
    setProjectName('');
    setDate(new Date().toISOString().split('T')[0]);
    setDelayed('Não');
    setPendencies('Nenhuma');
    setObservations('');
    setIsFormOpen(true);
  };

  const handleOpenEdit = (rec: RSERecord) => {
    setEditingRecord(rec);
    setClient(rec.client);
    setLine(rec.line);
    setProjectName(rec.projectName);
    setDate(rec.date);
    setDelayed(rec.delayed);
    setPendencies(rec.pendencies);
    setObservations(rec.observations || '');
    setIsFormOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName) return;

    const payload: RSERecord = {
      id: editingRecord ? editingRecord.id : 'rse-' + Date.now(),
      client,
      line,
      projectName,
      date,
      delayed,
      pendencies,
      observations
    };

    if (editingRecord) {
      onUpdateRecord(payload);
    } else {
      onAddRecord(payload);
    }
    
    setIsFormOpen(false);

    // Reset
    setEditingRecord(null);
    setClient('');
    setLine('');
    setProjectName('');
    setDate(new Date().toISOString().split('T')[0]);
    setDelayed('Não');
    setPendencies('Nenhuma');
    setObservations('');
  };

  const filteredRecords = records.filter(rec => {
    return rec.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           rec.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
           (rec.observations && rec.observations.toLowerCase().includes(searchTerm.toLowerCase()));
  });

  return (
    <div className="space-y-6">
      
      {/* Control Actions Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 max-w-md w-full">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Pesquisar por RSE de projeto ou observações..."
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {!isReadOnly && (
          <button
            onClick={handleOpenCreate}
            className="bg-blue-700 hover:bg-blue-600 text-white px-3.5 py-2 rounded-lg text-xs font-extrabold flex items-center gap-1.5 transition cursor-pointer shadow-sm w-full sm:w-auto justify-center"
          >
            <Plus size={14} />
            <span>Lançar Relatório RSE</span>
          </button>
        )}
      </div>

      {/* RSE Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[10px] uppercase font-bold tracking-wider">
                <th className="py-3 px-4">Cliente / Linha</th>
                <th className="py-3 px-4">Onda / Projeto</th>
                <th className="py-3 px-4 text-center">Data Envio</th>
                <th className="py-3 px-4 text-center">Atrasado?</th>
                <th className="py-3 px-4 text-center">Gravidade Pendências</th>
                <th className="py-3 px-4">Observações</th>
                {!isReadOnly && <th className="py-3 px-4 text-right">Ações</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium">
              {filteredRecords.map(rec => (
                <tr key={rec.id} className="hover:bg-slate-50/50 transition">
                  <td className="py-3 px-4">
                    <span className="font-bold text-slate-800 block">{rec.client}</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">{rec.line}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-bold text-slate-800 block">{rec.projectName}</span>
                  </td>
                  <td className="py-3 px-4 text-center font-mono text-slate-600">
                    {new Date(rec.date).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {rec.delayed === 'Sim' ? (
                      <span className="px-2 py-0.5 bg-red-50 text-red-600 border border-red-100 rounded text-[10px] font-extrabold font-mono uppercase">
                        SIM
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded text-[10px] font-extrabold font-mono uppercase">
                        NÃO
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {rec.pendencies === 'Graves' && (
                      <span className="px-2 py-0.5 bg-red-50 text-red-700 border border-red-100 rounded text-[10px] font-extrabold font-mono uppercase flex items-center justify-center gap-1 max-w-[120px] mx-auto">
                        <AlertTriangle size={10} />
                        Graves
                      </span>
                    )}
                    {rec.pendencies === 'Simples/Moderadas' && (
                      <span className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-100 rounded text-[10px] font-extrabold font-mono uppercase flex items-center justify-center gap-1 max-w-[140px] mx-auto">
                        Simples/Mod
                      </span>
                    )}
                    {rec.pendencies === 'Nenhuma' && (
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded text-[10px] font-extrabold font-mono uppercase flex items-center justify-center gap-1 max-w-[100px] mx-auto">
                        Nenhuma
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-slate-500 max-w-sm truncate" title={rec.observations}>
                    {rec.observations || '-'}
                  </td>
                  {!isReadOnly && (
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button 
                          onClick={() => handleOpenEdit(rec)}
                          className="h-7 w-7 rounded bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-600 hover:text-blue-600 hover:border-blue-300 transition cursor-pointer"
                          title="Editar RSE"
                        >
                          <Edit2 size={12} />
                        </button>
                        <button 
                          onClick={() => {
                            if (confirm('Deseja excluir este log de status RSE?')) {
                              onDeleteRecord(rec.id);
                            }
                          }}
                          className="h-7 w-7 rounded bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-600 hover:text-red-600 hover:border-red-300 transition cursor-pointer"
                          title="Excluir RSE"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}

              {filteredRecords.length === 0 && (
                <tr>
                  <td colSpan={isReadOnly ? 6 : 7} className="py-8 text-center text-slate-400 text-xs">
                    Nenhum relatório RSE lançado para visualização.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Input Drawer Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-[100] p-4 animate-fadeIn">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-scaleUp">
            
            {/* Header */}
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-slate-800">
                  {editingRecord ? 'Editar Relatório RSE' : 'Lançar Relatório RSE'}
                </h3>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {editingRecord ? 'Modifique os detalhes salvos deste status RSE' : 'Informe os detalhes do status periódico de entrega'}
                </p>
              </div>
              <button 
                onClick={() => setIsFormOpen(false)}
                className="h-8 w-8 rounded-full hover:bg-slate-200 flex items-center justify-center text-slate-500 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSave} className="p-5 space-y-4">
              
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-500">Projeto / Onda Ativa</label>
                <select
                  value={projectName}
                  onChange={e => handleProjectChange(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500 font-semibold"
                >
                  <option value="">Selecione a Onda</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.name}>{p.name}</option>
                  ))}
                  <option value="Personalizado">Digitação Manual...</option>
                </select>
              </div>

              {projectName === 'Personalizado' && (
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-500">Nome do Projeto customizado</label>
                  <input 
                    type="text"
                    value={projectName}
                    onChange={e => setProjectName(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500"
                    placeholder="Nome da onda"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-500">Cliente</label>
                  <input 
                    type="text"
                    value={client}
                    onChange={e => setClient(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500"
                    placeholder="Cliente"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-500">Linha de Tecnologia</label>
                  <input 
                    type="text"
                    value={line}
                    onChange={e => setLine(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500"
                    placeholder="EWM/TM, RISE, etc."
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-500">Data de Envio</label>
                  <input 
                    type="date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500 font-semibold font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-500">Envio em Atraso?</label>
                  <select
                    value={delayed}
                    onChange={e => setDelayed(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500 font-bold"
                  >
                    <option value="Não">NÃO</option>
                    <option value="Sim">SIM</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-500">Severidade de Pendências</label>
                <select
                  value={pendencies}
                  onChange={e => setPendencies(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500 font-bold"
                >
                  <option value="Nenhuma">Nenhuma pendência operacional</option>
                  <option value="Simples/Moderadas">Pendências Simples ou Moderadas</option>
                  <option value="Graves">Pendências Graves / Críticas</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-500">Detalhes / Observações</label>
                <textarea 
                  value={observations}
                  onChange={e => setObservations(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500"
                  placeholder="Se houver atrasos ou pendências, descreva as razões de forma resumida..."
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 px-3 py-2 rounded-lg text-xs font-bold transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-blue-700 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-extrabold flex items-center gap-1.5 transition cursor-pointer shadow-sm"
                >
                  <Save size={14} />
                  <span>{editingRecord ? 'Salvar Alterações' : 'Salvar RSE'}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
