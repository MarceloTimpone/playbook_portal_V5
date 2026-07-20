import React, { useState, useEffect, useRef } from 'react';
import { AppUser, AppLog, Customer, Project, QACriterion, QAReview, RSERecord, AppNotification } from '../../types';
import { 
  UserPlus, 
  Shield, 
  Key, 
  Search, 
  Trash2, 
  Check, 
  X, 
  ClipboardList, 
  Filter, 
  Calendar,
  Globe,
  Terminal,
  RefreshCw,
  Eye,
  EyeOff,
  Copy,
  Cpu,
  Lock,
  CheckCircle2,
  Download,
  Upload,
  Settings,
  Database,
  Save,
  Bell,
  Send
} from 'lucide-react';

interface AdminSettingsProps {
  users: AppUser[];
  logs: AppLog[];
  customers: Customer[];
  projects: Project[];
  gps?: string[];
  criteria: QACriterion[];
  reviews: QAReview[];
  rseRecords: RSERecord[];
  onAddUser: (user: AppUser) => void;
  onUpdateUser: (user: AppUser) => void;
  onDeleteUser: (id: string) => void;
  onResetPassword: (id: string) => void;
  onClearLogs?: () => void;
  currentUserId: string;
  onForceSync?: () => Promise<boolean>; // Callback to trigger state synchronization to server
  logConfig: Record<string, boolean>;
  onUpdateLogConfig: (newConfig: Record<string, boolean>) => void;
  onRestoreBackup: (backupData: any) => void;
  notifications?: AppNotification[];
  onSendNotification?: (title: string, message: string, type: 'info' | 'success' | 'warning' | 'error', targetUser: string) => void;
  onAddCustomer?: (customer: Customer) => void;
  onAddProject?: (project: Project) => void;
  onAddGp?: (gp: string) => void;
}

export default function AdminSettings({
  users,
  logs,
  customers,
  projects,
  gps = [],
  criteria,
  reviews,
  rseRecords,
  onAddUser,
  onUpdateUser,
  onDeleteUser,
  onResetPassword,
  onClearLogs,
  currentUserId,
  onForceSync,
  logConfig,
  onUpdateLogConfig,
  onRestoreBackup,
  notifications = [],
  onSendNotification,
  onAddCustomer,
  onAddProject,
  onAddGp
}: AdminSettingsProps) {
  const [activeSubTab, setActiveSubTab] = useState<'users' | 'logs' | 'api_keys' | 'system' | 'database' | 'send_notifications'>('users');
  const backupInputRef = useRef<HTMLInputElement>(null);

  // Toast notification state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Database Explorer state
  const [selectedDbTable, setSelectedDbTable] = useState<'customers' | 'projects' | 'criteria' | 'reviews' | 'rseRecords' | 'users' | 'logs' | 'gps'>('projects');
  const [dbSearchQuery, setDbSearchQuery] = useState('');
  const [selectedDbRecord, setSelectedDbRecord] = useState<any | null>(null);

  // Modal states for adding entities
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [isAddProjectOpen, setIsAddProjectOpen] = useState(false);
  const [isAddGpOpen, setIsAddGpOpen] = useState(false);

  // Form states for adding entities
  const [custName, setCustName] = useState('');
  const [custCode, setCustCode] = useState('');
  const [custCnpj, setCustCnpj] = useState('');
  const [custCountry, setCustCountry] = useState('Brasil');

  const [projSapId, setProjSapId] = useState('');
  const [projName, setProjName] = useState('');
  const [projClientName, setProjClientName] = useState('');
  const [projManager, setProjManager] = useState('');
  const [projSolution, setProjSolution] = useState('SAP S/4HANA');

  const [gpName, setGpName] = useState('');

  // Custom Notifications Composer state
  const [notifTitle, setNotifTitle] = useState('');
  const [notifMessage, setNotifMessage] = useState('');
  const [notifType, setNotifType] = useState<'info' | 'success' | 'warning' | 'error'>('info');
  const [notifTarget, setNotifTarget] = useState('all');

  const getFilteredDbRecords = () => {
    let list: any[] = [];
    switch (selectedDbTable) {
      case 'customers': list = customers || []; break;
      case 'projects': list = projects || []; break;
      case 'criteria': list = criteria || []; break;
      case 'reviews': list = reviews || []; break;
      case 'rseRecords': list = rseRecords || []; break;
      case 'users': list = users || []; break;
      case 'logs': list = logs || []; break;
      case 'gps': list = gps.map((name, idx) => ({ id: idx.toString(), name })) || []; break;
    }

    if (!dbSearchQuery.trim()) return list;

    const query = dbSearchQuery.toLowerCase().trim();
    return list.filter(item => {
      return Object.values(item).some(val => {
        if (val === null || val === undefined) return false;
        if (typeof val === 'object') {
          try {
            return JSON.stringify(val).toLowerCase().includes(query);
          } catch {
            return false;
          }
        }
        return String(val).toLowerCase().includes(query);
      });
    });
  };

  const handleSaveCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!custName.trim() || !custCode.trim()) {
      showToast('Por favor, preencha Nome e Código', 'error');
      return;
    }
    const newCust: Customer = {
      id: 'cust_' + Date.now(),
      code: custCode.toUpperCase().trim(),
      name: custName.trim(),
      cnpj: custCnpj.trim() || '00.000.000/0000-00',
      countryOfOrigin: custCountry.trim(),
      status: 'ACTIVE'
    };
    if (onAddCustomer) {
      onAddCustomer(newCust);
      showToast(`Cliente "${newCust.name}" cadastrado com sucesso!`);
      // Reset
      setCustName('');
      setCustCode('');
      setCustCnpj('');
      setCustCountry('Brasil');
      setIsAddCustomerOpen(false);
    }
  };

  const handleSaveProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projName.trim() || !projSapId.trim() || !projClientName || !projManager) {
      showToast('Por favor, preencha todos os campos obrigatórios', 'error');
      return;
    }
    const matchedClient = customers.find(c => c.name === projClientName);
    const clientId = matchedClient?.id || ('cust_' + Date.now());
    const clientCode = matchedClient?.code || 'CUST';
    const clientCnpj = matchedClient?.cnpj || '00.000.000/0000-00';
    const country = matchedClient?.countryOfOrigin || 'Brasil';

    const newProj: Project = {
      id: 'proj_' + Date.now(),
      sapProjectId: projSapId.toUpperCase().trim(),
      name: projName.trim(),
      type: 'Fixed Price',
      solution: projSolution,
      clientId,
      clientName: projClientName,
      clientCode,
      clientCnpj,
      country,
      manager: projManager,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      notes: 'Cadastrado via Portal de Controle de Qualidade',
      mirrorCurrency: false,
      isGlobalFinance: false,
      status: 'APPROVED',
      requestedBy: 'PMO ADM',
      createdAt: new Date().toISOString().split('T')[0]
    };
    if (onAddProject) {
      onAddProject(newProj);
      showToast(`Projeto "${newProj.name}" cadastrado com sucesso!`);
      // Reset
      setProjSapId('');
      setProjName('');
      setProjClientName('');
      setProjManager('');
      setProjSolution('SAP S/4HANA');
      setIsAddProjectOpen(false);
    }
  };

  const handleSaveGp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gpName.trim()) {
      showToast('Por favor, preencha o nome do GP', 'error');
      return;
    }
    if (onAddGp) {
      onAddGp(gpName.trim());
      showToast(`Gestor "${gpName}" cadastrado com sucesso!`);
      setGpName('');
      setIsAddGpOpen(false);
    }
  };

  const handleExportDbTable = (format: 'csv' | 'json') => {
    const list = getFilteredDbRecords();
    if (format === 'json') {
      const blob = new Blob([JSON.stringify(list, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `db_dump_${selectedDbTable}_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      if (list.length === 0) {
        alert('Nenhum registro para exportar.');
        return;
      }
      const headers = Object.keys(list[0]);
      const csvRows = list.map(item => {
        return headers.map(header => {
          const val = item[header];
          if (val === null || val === undefined) return '""';
          if (typeof val === 'object') {
            return `"${JSON.stringify(val).replace(/"/g, '""')}"`;
          }
          return `"${String(val).replace(/"/g, '""')}"`;
        }).join(';');
      });
      const csvContent = "\uFEFF" + [headers.join(';'), ...csvRows].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `db_dump_${selectedDbTable}_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };
  
  // User Management state
  const [isNewUserFormOpen, setIsNewUserFormOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'Demonstrativo' | 'PMO' | 'PMO ADM'>('PMO');
  const [editingUser, setEditingUser] = useState<AppUser | null>(null);

  // Search state for logs
  const [logSearch, setLogSearch] = useState('');
  const [logActionFilter, setLogActionFilter] = useState('');

  // Public API state
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [newKeyLabel, setNewKeyLabel] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoadingKeys, setIsLoadingKeys] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);
  const [revealedKeys, setRevealedKeys] = useState<Record<string, boolean>>({});
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);

  // Fetch API keys on subtab activation
  useEffect(() => {
    if (activeSubTab === 'api_keys') {
      fetchApiKeys();
    }
  }, [activeSubTab]);

  const fetchApiKeys = async () => {
    setIsLoadingKeys(true);
    try {
      const response = await fetch('/api/admin/api-keys');
      if (response.ok) {
        const data = await response.json();
        setApiKeys(data);
      }
    } catch (err) {
      console.error('Error fetching api keys:', err);
    } finally {
      setIsLoadingKeys(false);
    }
  };

  const handleGenerateApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyLabel.trim()) return;

    setIsGenerating(true);
    try {
      const response = await fetch('/api/admin/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label: newKeyLabel.trim() })
      });
      if (response.ok) {
        setNewKeyLabel('');
        fetchApiKeys();
      }
    } catch (err) {
      console.error('Error generating API key:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeleteApiKey = async (id: string) => {
    if (!confirm('Deseja revogar esta chave de API? Qualquer integração utilizando esta chave perderá o acesso imediatamente.')) {
      return;
    }
    try {
      const response = await fetch(`/api/admin/api-keys/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        fetchApiKeys();
      }
    } catch (err) {
      console.error('Error deleting API key:', err);
    }
  };

  const handleTriggerSync = async () => {
    if (!onForceSync) return;
    setSyncing(true);
    setSyncSuccess(false);
    try {
      const ok = await onForceSync();
      if (ok) {
        setSyncSuccess(true);
        setTimeout(() => setSyncSuccess(false), 3000);
      }
    } catch (e) {
      console.error('Sync error:', e);
    } finally {
      setSyncing(false);
    }
  };

  // Backup & Restore
  const handleDownloadBackup = () => {
    try {
      const backupData = {
        appName: "Exed Quality Gates & Playbook Portal",
        timestamp: new Date().toISOString(),
        version: "1.0.0",
        projects: JSON.parse(localStorage.getItem('exed_projects') || '[]'),
        reviews: JSON.parse(localStorage.getItem('exed_reviews') || '[]'),
        rseRecords: JSON.parse(localStorage.getItem('exed_rse_records') || '[]'),
        criteria: JSON.parse(localStorage.getItem('exed_criteria') || '[]'),
        users: JSON.parse(localStorage.getItem('exed_app_users') || '[]'),
      };
      
      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup_portal_exed_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert('Erro ao gerar arquivo de backup: ' + err.message);
    }
  };

  const handleUploadBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const backup = JSON.parse(event.target?.result as string);
        if (!backup.projects || !backup.reviews || !backup.criteria) {
          alert('Erro: O arquivo JSON de backup fornecido não é válido ou está incompleto.');
          return;
        }
        if (confirm('Atenção: A restauração de backup irá sobrescrever TODAS as informações atuais do sistema (Projetos, Auditorias, Critérios e Contas). Esta ação é definitiva. Deseja prosseguir?')) {
          onRestoreBackup(backup);
          alert('Backup restaurado com sucesso! Os dados foram importados e recarregados.');
        }
      } catch (err: any) {
        alert('Erro ao decodificar arquivo JSON de backup: ' + err.message);
      }
    };
    reader.readAsText(file);
    if (e.target) {
      e.target.value = ''; // Reset input selection
    }
  };

  // Download Logs in CSV Format
  const handleDownloadLogs = () => {
    try {
      const headers = ['Data/Hora', 'Usuário', 'Ação', 'Detalhes'];
      const rows = logs.map(l => [
        new Date(l.timestamp).toLocaleString('pt-BR'),
        l.user,
        l.action,
        l.details
      ]);
      const csvContent = "\uFEFF" + [headers, ...rows].map(e => e.map(val => `"${val.replace(/"/g, '""')}"`).join(";")).join("\n");
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `historico_logs_exed_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert('Erro ao exportar logs: ' + err.message);
    }
  };

  // Log Actions Configuration Toggle Metadata
  const logActionsMetadata = [
    { key: 'Login realizado', label: 'Login padrão (Com Senha)', desc: 'Audita tentativas de login bem-sucedidas com credenciais do usuário.' },
    { key: 'Login simplificado', label: 'Acesso Simplificado ADM', desc: 'Audita acessos diretos rápidos via ferramenta de bypass para administradores.' },
    { key: 'Logout efetuado', label: 'Encerramento de Sessão', desc: 'Registra o momento em que o usuário encerra voluntariamente seu acesso.' },
    { key: 'Alteração de senha', label: 'Alteração de Senhas', desc: 'Audita a definição de senhas próprias ou personalizadas.' },
    { key: 'Registrar QA', label: 'Registrar Qualificação (QA)', desc: 'Registra a inclusão de novas auditorias de Quality Gates em ondas de projetos.' },
    { key: 'Editar QA', label: 'Editar Qualificação (QA)', desc: 'Audita edições e calibrações em auditorias registradas anteriormente.' },
    { key: 'Excluir QA', label: 'Excluir Qualificação (QA)', desc: 'Registra a exclusão permanente de dados de auditorias.' },
    { key: 'Lançar RSE', label: 'Lançar Status de Entrega (RSE)', desc: 'Registra a inserção de novos boletins de saúde de projeto (RSE).' },
    { key: 'Editar RSE', label: 'Editar Status de Entrega (RSE)', desc: 'Audita modificações de pendências ou atrasos em RSEs.' },
    { key: 'Excluir RSE', label: 'Excluir Status de Entrega (RSE)', desc: 'Registra a exclusão permanente de históricos RSE.' },
    { key: 'Criar Critério', label: 'Criar Critério do Playbook', desc: 'Audita novos critérios incluídos na matriz metodológica do Playbook.' },
    { key: 'Editar Critério', label: 'Editar Critério do Playbook', desc: 'Audita alterações de pesos, textos ou tipos de critérios.' },
    { key: 'Excluir Critério', label: 'Excluir Critério do Playbook', desc: 'Audita a remoção de itens do playbook que recalcula as auditorias.' },
    { key: 'Criar Usuário', label: 'Criar Conta de Usuário', desc: 'Registra a criação de novas contas e credenciais de acesso.' },
    { key: 'Atualizar Usuário', label: 'Atualizar Perfil de Usuário', desc: 'Audita edições de perfis, nomes e permissões de usuários.' },
    { key: 'Excluir Usuário', label: 'Excluir Conta de Usuário', desc: 'Registra a exclusão definitiva de contas do sistema.' },
    { key: 'Resetar Senha', label: 'Resetar Senha do Usuário', desc: 'Audita o reset de senhas de usuários para o padrão temporário.' },
  ];

  const handleToggleLogAction = (actionKey: string) => {
    const updated = { ...logConfig, [actionKey]: !logConfig[actionKey] };
    onUpdateLogConfig(updated);
  };

  const handleToggleAllLogs = (enable: boolean) => {
    const updated = { ...logConfig };
    Object.keys(updated).forEach(k => {
      updated[k] = enable;
    });
    onUpdateLogConfig(updated);
  };

  const toggleRevealKey = (id: string) => {
    setRevealedKeys(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopyKey = (id: string, keyValue: string) => {
    navigator.clipboard.writeText(keyValue);
    setCopiedKeyId(id);
    setTimeout(() => setCopiedKeyId(null), 2000);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !name) return;

    let finalEmail = username.toLowerCase().trim();
    if (!finalEmail.includes('@')) {
      finalEmail = finalEmail + '@exedconsulting.com';
    } else if (!finalEmail.endsWith('@exedconsulting.com')) {
      alert('O e-mail inserido deve obrigatoriamente pertencer ao domínio @exedconsulting.com');
      return;
    }

    if (users.some(u => u.username.toLowerCase() === finalEmail || (u.email && u.email.toLowerCase() === finalEmail))) {
      alert('Este e-mail Exed já está cadastrado.');
      return;
    }

    const newUser: AppUser = {
      id: 'usr-' + Date.now(),
      username: finalEmail,
      email: finalEmail,
      name: name.trim(),
      role,
      password: 'PMO2026',
      isFirstLogin: true,
      active: true
    };

    onAddUser(newUser);
    setUsername('');
    setName('');
    setRole('PMO');
    setIsNewUserFormOpen(false);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    const updated: AppUser = {
      ...editingUser,
      name: name.trim(),
      role
    };

    onUpdateUser(updated);
    setEditingUser(null);
    setName('');
    setUsername('');
  };

  const handleSubmitNotification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifTitle.trim() || !notifMessage.trim()) return;
    if (onSendNotification) {
      onSendNotification(notifTitle.trim(), notifMessage.trim(), notifType, notifTarget);
      showToast('Notificação enviada com sucesso!', 'success');
      setNotifTitle('');
      setNotifMessage('');
      setNotifType('info');
      setNotifTarget('all');
    }
  };

  const handleStartEdit = (user: AppUser) => {
    setEditingUser(user);
    setName(user.name);
    setUsername(user.username);
    setRole(user.role);
    setIsNewUserFormOpen(false);
  };

  const uniqueActions = Array.from(new Set(logs.map(l => l.action)));

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.user.toLowerCase().includes(logSearch.toLowerCase()) ||
      log.action.toLowerCase().includes(logSearch.toLowerCase()) ||
      log.details.toLowerCase().includes(logSearch.toLowerCase());
    const matchesFilter = logActionFilter === '' || log.action === logActionFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6 relative">
      {/* Toast Popup Notification */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-3 transition-all duration-300 transform translate-y-0 scale-100">
          <div className={`w-2 h-2 rounded-full ${toast.type === 'success' ? 'bg-emerald-500' : toast.type === 'error' ? 'bg-rose-500' : 'bg-blue-500'}`} />
          <span className="text-xs font-bold leading-none">{toast.message}</span>
        </div>
      )}
      
      {/* Tab select bar */}
      <div className="flex border-b border-slate-200 bg-white p-2 rounded-xl border gap-1">
        <button
          onClick={() => setActiveSubTab('users')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition cursor-pointer flex items-center justify-center gap-2 ${
            activeSubTab === 'users'
              ? 'bg-blue-50 text-blue-700 font-extrabold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Shield size={14} />
          <span>Gestão de Usuários</span>
        </button>
        <button
          onClick={() => setActiveSubTab('logs')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition cursor-pointer flex items-center justify-center gap-2 ${
            activeSubTab === 'logs'
              ? 'bg-blue-50 text-blue-700 font-extrabold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <ClipboardList size={14} />
          <span>Histórico de Logs</span>
        </button>
        <button
          onClick={() => setActiveSubTab('api_keys')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition cursor-pointer flex items-center justify-center gap-2 ${
            activeSubTab === 'api_keys'
              ? 'bg-blue-50 text-blue-700 font-extrabold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Globe size={14} />
          <span>Configuração de API Pública</span>
        </button>
        <button
          onClick={() => setActiveSubTab('system')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition cursor-pointer flex items-center justify-center gap-2 ${
            activeSubTab === 'system'
              ? 'bg-blue-50 text-blue-700 font-extrabold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Settings size={14} />
          <span>Manutenção &amp; Backup</span>
        </button>
        <button
          onClick={() => setActiveSubTab('database')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition cursor-pointer flex items-center justify-center gap-2 ${
            activeSubTab === 'database'
              ? 'bg-blue-50 text-blue-700 font-extrabold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Database size={14} />
          <span>Banco de Dados</span>
        </button>
        <button
          onClick={() => setActiveSubTab('send_notifications')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition cursor-pointer flex items-center justify-center gap-2 ${
            activeSubTab === 'send_notifications'
              ? 'bg-blue-50 text-blue-700 font-extrabold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Bell size={14} />
          <span>Enviar Notificações</span>
        </button>
      </div>

      {/* SUBTAB 1: USERS MANAGEMENT */}
      {activeSubTab === 'users' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-slate-800">Contas de Usuários</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Adicione, edite ou resete senhas dos usuários com acesso ao sistema</p>
            </div>

            {!isNewUserFormOpen && !editingUser && (
              <button
                onClick={() => setIsNewUserFormOpen(true)}
                className="bg-blue-700 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-extrabold flex items-center gap-1.5 transition cursor-pointer shadow-sm"
              >
                <UserPlus size={14} />
                <span>Adicionar Usuário</span>
              </button>
            )}
          </div>

          {(isNewUserFormOpen || editingUser) && (
            <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl space-y-4 animate-scaleUp">
              <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
                  {editingUser ? 'Editar Usuário' : 'Novo Usuário do Sistema'}
                </span>
                <button 
                  onClick={() => {
                    setIsNewUserFormOpen(false);
                    setEditingUser(null);
                    setUsername('');
                    setName('');
                  }}
                  className="h-6 w-6 rounded-full hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>

              <form onSubmit={editingUser ? handleEditSubmit : handleAddSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-500">Nome Completo</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Ex: Pedro Santos"
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-500">E-mail Exed (@exedconsulting.com)</label>
                  <input
                    type="text"
                    required
                    disabled={!!editingUser}
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder="Ex: pedro.santos@exedconsulting.com"
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-blue-500 font-mono disabled:opacity-50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-500">Perfil de Acesso</label>
                  <select
                    value={role}
                    onChange={e => setRole(e.target.value as any)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-blue-500 font-semibold"
                  >
                    <option value="Demonstrativo">Demonstrativo (Visualiza apenas)</option>
                    <option value="PMO">PMO (Acesso total)</option>
                    <option value="PMO ADM">PMO ADM (Acesso total + Admin)</option>
                  </select>
                </div>

                <div className="md:col-span-3 flex justify-end gap-2 pt-2 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => {
                      setIsNewUserFormOpen(false);
                      setEditingUser(null);
                      setUsername('');
                      setName('');
                    }}
                    className="bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-700 hover:bg-blue-600 text-white px-4 py-1.5 rounded-lg text-xs font-extrabold transition cursor-pointer shadow-sm"
                  >
                    {editingUser ? 'Salvar Alterações' : 'Criar Conta'}
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[10px] uppercase font-bold tracking-wider">
                    <th className="py-3 px-4">Nome</th>
                    <th className="py-3 px-4">E-mail Exed</th>
                    <th className="py-3 px-4">Perfil</th>
                    <th className="py-3 px-4 text-center">Status de Senha</th>
                    <th className="py-3 px-4 text-center">Ativo?</th>
                    <th className="py-3 px-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-medium">
                  {users.map(u => {
                    let roleBadge = 'bg-slate-100 text-slate-700 border-slate-200';
                    if (u.role === 'PMO ADM') roleBadge = 'bg-red-50 text-red-700 border-red-150 font-black';
                    if (u.role === 'PMO') roleBadge = 'bg-blue-50 text-blue-700 border-blue-150 font-black';
                    if (u.role === 'Demonstrativo') roleBadge = 'bg-slate-50 text-slate-600 border-slate-200';

                    return (
                      <tr key={u.id} className={`hover:bg-slate-50/50 transition ${u.id === currentUserId ? 'bg-blue-50/10' : ''}`}>
                        <td className="py-3 px-4 font-bold text-slate-800">
                          {u.name} {u.id === currentUserId && <span className="text-[9px] font-extrabold uppercase bg-blue-100 text-blue-700 px-1 py-0.25 rounded ml-1.5 font-sans">Você</span>}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-500">{u.username}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded border text-[10px] ${roleBadge}`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {u.isFirstLogin ? (
                            <span className="px-1.5 py-0.5 bg-amber-50 text-amber-600 border border-amber-100 rounded text-[9px] font-bold uppercase">
                              Primeiro Acesso (Padrão)
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded text-[9px] font-bold uppercase">
                              Personalizada
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => {
                              if (u.id === currentUserId) return;
                              onUpdateUser({ ...u, active: !u.active });
                            }}
                            disabled={u.id === currentUserId}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition ${
                              u.active 
                                ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100/50' 
                                : 'bg-red-50 text-red-700 hover:bg-red-100/50'
                            } disabled:opacity-50`}
                          >
                            {u.active ? 'Ativo' : 'Inativo'}
                          </button>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleStartEdit(u)}
                              className="h-7 w-7 rounded bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-600 hover:text-blue-600 hover:border-blue-300 transition cursor-pointer"
                              title="Editar Nome e Perfil"
                            >
                              <Shield size={12} />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Deseja resetar a senha de ${u.name} para o padrão 'PMO2026'? O usuário precisará definir uma senha no próximo login.`)) {
                                  onResetPassword(u.id);
                                }
                              }}
                              className="h-7 w-7 rounded bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-600 hover:text-amber-600 hover:border-amber-300 transition cursor-pointer"
                              title="Resetar Senha para Padrão"
                            >
                              <Key size={12} />
                            </button>
                            {u.id !== currentUserId && (
                              <button
                                onClick={() => {
                                  if (confirm(`Tem certeza de que deseja excluir permanentemente o usuário ${u.name}?`)) {
                                    onDeleteUser(u.id);
                                  }
                                }}
                                className="h-7 w-7 rounded bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-600 hover:text-red-600 hover:border-red-300 transition cursor-pointer"
                                title="Excluir Usuário"
                              >
                                <Trash2 size={12} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: ACTIVITY LOGS */}
      {activeSubTab === 'logs' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div>
              <h3 className="text-sm font-black text-slate-800">Logs de Auditoria do App</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Acompanhamento detalhado em tempo real de todas as ações de qualidade realizadas no sistema</p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleDownloadLogs}
                className="bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                title="Exportar logs para arquivo CSV"
              >
                <Download size={14} />
                <span>Exportar Logs (CSV)</span>
              </button>

              {onClearLogs && (
                <button
                  onClick={() => {
                    if (confirm('Deseja limpar todo o histórico de logs? Esta ação é irreversível.')) {
                      onClearLogs();
                    }
                  }}
                  className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer"
                >
                  Limpar Logs
                </button>
              )}
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text"
                value={logSearch}
                onChange={e => setLogSearch(e.target.value)}
                placeholder="Pesquisar por usuário, ação ou detalhe..."
                className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-4 py-1.5 text-xs font-semibold focus:outline-none"
              />
            </div>

            <div className="flex gap-2">
              <div className="relative">
                <select
                  value={logActionFilter}
                  onChange={e => setLogActionFilter(e.target.value)}
                  className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold focus:outline-none"
                >
                  <option value="">Filtrar Ação (Todas)</option>
                  {uniqueActions.map(act => (
                    <option key={act} value={act}>{act}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-y-auto max-h-[480px]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[10px] uppercase font-bold tracking-wider sticky top-0 z-10">
                    <th className="py-2.5 px-4 w-36">Data / Hora</th>
                    <th className="py-2.5 px-4 w-32">Usuário</th>
                    <th className="py-2.5 px-4 w-32">Ação</th>
                    <th className="py-2.5 px-4">Detalhes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-medium font-mono text-slate-600">
                  {filteredLogs.map(log => {
                    let actionColor = 'text-slate-700 bg-slate-100';
                    if (log.action.includes('Login') || log.action.includes('Senha')) actionColor = 'text-blue-700 bg-blue-50';
                    if (log.action.includes('Criar') || log.action.includes('Adicionar')) actionColor = 'text-emerald-700 bg-emerald-50';
                    if (log.action.includes('Excluir') || log.action.includes('Remover')) actionColor = 'text-red-700 bg-red-50';
                    if (log.action.includes('Editar') || log.action.includes('Alterar')) actionColor = 'text-amber-700 bg-amber-50';

                    return (
                      <tr key={log.id} className="hover:bg-slate-50/50 transition">
                        <td className="py-2 px-4 whitespace-nowrap text-slate-400 font-sans text-[10px]">
                          {new Date(log.timestamp).toLocaleString('pt-BR')}
                        </td>
                        <td className="py-2 px-4 text-slate-800 font-sans font-bold">
                          {log.user}
                        </td>
                        <td className="py-2 px-4">
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-sans font-bold uppercase inline-block ${actionColor}`}>
                            {log.action}
                          </span>
                        </td>
                        <td className="py-2 px-4 text-slate-500 font-sans text-xs break-all leading-normal">
                          {log.details}
                        </td>
                      </tr>
                    );
                  })}

                  {filteredLogs.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-slate-400 text-xs font-sans">
                        Nenhum registro de log encontrado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 3: PUBLIC API KEYS CONFIGURATION */}
      {activeSubTab === 'api_keys' && (
        <div className="space-y-6">
          
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-sm font-black text-slate-800 flex items-center gap-1.5">
                  <Globe size={16} className="text-blue-700" />
                  <span>Public API Credentials Setup</span>
                </h3>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Gere tokens de autenticação seguros para que webapps parceiros acessem os KPIs e conformidades do Exed Quality Gates de forma legível.
                </p>
              </div>

              {onForceSync && (
                <div className="flex items-center gap-2">
                  {syncSuccess && (
                    <span className="text-[10px] text-emerald-600 font-extrabold flex items-center gap-1 animate-fade-in font-mono bg-emerald-50 px-2 py-1 rounded border border-emerald-100">
                      <CheckCircle2 size={11} />
                      Sincronizado!
                    </span>
                  )}
                  <button
                    onClick={handleTriggerSync}
                    disabled={syncing}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 border border-slate-200 rounded-lg text-[10px] font-bold flex items-center gap-1.5 transition disabled:opacity-50 cursor-pointer shadow-xs"
                    title="Forçar sincronização de dados do frontend para a API Pública do servidor"
                  >
                    <RefreshCw size={12} className={syncing ? 'animate-spin' : ''} />
                    <span>{syncing ? 'Sincronizando...' : 'Sincronizar Portfólio'}</span>
                  </button>
                </div>
              )}
            </div>

            {/* API Key Creator Form */}
            <form onSubmit={handleGenerateApiKey} className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex flex-col sm:flex-row gap-3 items-end">
              <div className="flex-1 space-y-1.5 w-full">
                <label className="text-[10px] uppercase font-bold text-slate-400 block">Identificador do Cliente API (Sistemas, Dashboards BI ou Webapps)</label>
                <input
                  type="text"
                  required
                  value={newKeyLabel}
                  onChange={e => setNewKeyLabel(e.target.value)}
                  placeholder="Ex: Microsoft PowerBI, Portal de Governança Interno, Dashboard RH..."
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500 font-semibold"
                />
              </div>
              <button
                type="submit"
                disabled={isGenerating}
                className="bg-blue-700 hover:bg-blue-600 disabled:bg-slate-400 text-white px-4 py-2 rounded-lg text-[10px] font-extrabold uppercase tracking-wider transition w-full sm:w-auto cursor-pointer"
              >
                {isGenerating ? 'Gerando...' : 'Gerar Chave de API'}
              </button>
            </form>

            {/* List of Keys */}
            {isLoadingKeys ? (
              <div className="py-6 text-center text-slate-400 text-xs">
                Carregando credenciais cadastradas...
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[10px] uppercase font-bold tracking-wider">
                      <th className="py-2.5 px-4">Identificação</th>
                      <th className="py-2.5 px-4 font-mono">Token de Acesso (Bearer Token)</th>
                      <th className="py-2.5 px-4 text-center">Criado em</th>
                      <th className="py-2.5 px-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs font-medium">
                    {apiKeys.map(k => {
                      const isRevealed = !!revealedKeys[k.id];
                      const isCopied = copiedKeyId === k.id;
                      
                      return (
                        <tr key={k.id} className="hover:bg-slate-50/50 transition">
                          <td className="py-3 px-4">
                            <span className="font-extrabold text-slate-800 block">{k.label}</span>
                            <span className="text-[9px] text-slate-400 block font-mono">App Cliente Autorizado</span>
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-500 max-w-xs">
                            <div className="flex items-center gap-1 bg-slate-50 border border-slate-100 rounded-lg px-2.5 py-1 text-[11px] font-semibold">
                              <Lock size={10} className="text-slate-400 shrink-0" />
                              <span className="truncate flex-1">
                                {isRevealed ? k.key : `${k.key.substring(0, 14)}••••••••••••••••••••••••`}
                              </span>
                              <button
                                type="button"
                                onClick={() => toggleRevealKey(k.id)}
                                className="text-slate-400 hover:text-slate-700 p-0.5 cursor-pointer"
                                title={isRevealed ? "Ocultar Token" : "Mostrar Token"}
                              >
                                {isRevealed ? <EyeOff size={11} /> : <Eye size={11} />}
                              </button>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center font-mono text-slate-400 text-[10px]">
                            {new Date(k.createdAt).toLocaleDateString('pt-BR')}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleCopyKey(k.id, k.key)}
                                className={`px-2 py-1 rounded text-[10px] font-bold uppercase transition flex items-center gap-1 cursor-pointer border ${
                                  isCopied 
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                                }`}
                              >
                                {isCopied ? <Check size={11} /> : <Copy size={11} />}
                                <span>{isCopied ? 'Copiado!' : 'Copiar'}</span>
                              </button>
                              <button
                                onClick={() => handleDeleteApiKey(k.id)}
                                className="h-7 w-7 rounded bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 flex items-center justify-center transition cursor-pointer"
                                title="Revogar/Deletar Chave de API"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}

                    {apiKeys.length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-slate-400 text-xs italic">
                          Nenhuma chave de API gerada no momento. Registre um cliente acima para gerar as primeiras credenciais.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Public API Interactive Docs */}
          <div className="bg-slate-900 text-slate-100 rounded-xl p-5 border border-slate-800 space-y-4">
            <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Terminal size={14} className="text-blue-400" />
              <span>Documentação Simplificada da API Pública</span>
            </h4>
            
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Consuma o portfólio consolidado em tempo real fazendo requisições REST autenticadas. O endpoint público retorna todos os projetos ativos, indices de conformidade geral e datas das auditorias de Quality Gate.
            </p>

            <div className="space-y-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider font-mono">Endpoint de Consulta</span>
                <div className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-blue-400 flex items-center gap-2 mt-1 select-all break-all">
                  <span className="px-1.5 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded text-[9px] font-sans font-bold">GET</span>
                  <span>{window.location.origin}/api/public/portfolio</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider font-mono">Exemplo com cURL (Shell)</span>
                <pre className="bg-slate-950 p-3 rounded-lg text-[10px] text-slate-300 font-mono overflow-x-auto border border-slate-850 mt-1 select-all leading-relaxed whitespace-pre">
{`curl -X GET "${window.location.origin}/api/public/portfolio" \\
  -H "Authorization: Bearer exed_pub_sua_chave_de_api"`}
                </pre>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider font-mono">Estrutura de Resposta (JSON)</span>
                <pre className="bg-slate-950 p-3 rounded-lg text-[9px] text-emerald-400 font-mono overflow-x-auto border border-slate-850 mt-1 max-h-60 leading-normal">
{`{
  "success": true,
  "authorizedClient": "Microsoft PowerBI Dashboard",
  "extractedAt": "2026-07-20T14:32:00.000Z",
  "summary": {
    "portfolioName": "Exed S/4 Public Quality Gates Portfolio",
    "totalActiveProjects": 5,
    "totalAuditsConducted": 12,
    "portfolioComplianceIndex": "88.4%",
    "activeRSERecords": 3
  },
  "projects": [
    {
      "id": "proj-1",
      "name": "Onda RISE 1",
      "client": "Coca-Cola",
      "solution": "RISE with SAP",
      "type": "T&M (Time & Materials)",
      "manager": "Marcelo Silva",
      "sapProjectId": "PRJ-001316-01",
      "auditStatus": "Novo QA realizado",
      "playbookAdherence": "95.5%",
      "lastAuditDate": "2026-06-15"
    }
  ]
}`}
                </pre>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* SUBTAB 4: SYSTEM MAINTENANCE & BACKUP */}
      {activeSubTab === 'system' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-scaleUp">
          
          {/* Card 1: Backup & Restore */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Database className="text-blue-700" size={18} />
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">Backup &amp; Restauração do Portal</h3>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Exporte uma cópia de segurança completa contendo todo o estado consolidado da plataforma. 
                Em caso de migração ou falhas, você pode reimportar o arquivo JSON para restabelecer todos os projetos, auditorias de qualidade, parâmetros do playbook e contas de usuário instantaneamente.
              </p>
              
              <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 text-[10px] text-amber-700 font-semibold leading-relaxed">
                ⚠️ ATENÇÃO: Restaurar um arquivo de backup substituirá todos os registros atuais do portal no seu navegador e no servidor. Certifique-se de que o arquivo JSON é uma cópia válida exportada por este sistema.
              </div>
            </div>

            <div className="space-y-2 pt-4 border-t border-slate-100 flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={handleDownloadBackup}
                className="flex-1 bg-blue-700 hover:bg-blue-600 text-white px-4 py-2.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Download size={14} />
                <span>Exportar Backup (JSON)</span>
              </button>

              <button
                type="button"
                onClick={() => backupInputRef.current?.click()}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 px-4 py-2.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Upload size={14} />
                <span>Restaurar Backup</span>
              </button>

              <input 
                type="file"
                ref={backupInputRef}
                onChange={handleUploadBackup}
                accept=".json"
                className="hidden"
              />
            </div>
          </div>

          {/* Card 2: Logs Toggle Configurations */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Settings className="text-blue-700" size={18} />
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">Geração de Logs de Auditoria</h3>
              </div>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => handleToggleAllLogs(true)}
                  className="text-[9px] font-bold uppercase text-blue-700 bg-blue-50 hover:bg-blue-100/55 px-1.5 py-0.5 rounded transition cursor-pointer"
                >
                  Habilitar Todos
                </button>
                <button
                  type="button"
                  onClick={() => handleToggleAllLogs(false)}
                  className="text-[9px] font-bold uppercase text-slate-500 bg-slate-50 hover:bg-slate-100 px-1.5 py-0.5 rounded transition cursor-pointer"
                >
                  Desativar Todos
                </button>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              Ative ou desative seletivamente a gravação automática de logs para cada evento do sistema.
            </p>

            {/* List of Toggles */}
            <div className="max-h-[290px] overflow-y-auto space-y-2 pr-1 scrollbar-thin">
              {logActionsMetadata.map(action => {
                const isEnabled = logConfig[action.key] !== false;
                return (
                  <div key={action.key} className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-100 rounded-xl transition hover:bg-slate-100/40">
                    <div className="flex-1 pr-4">
                      <span className="text-[11px] font-bold text-slate-800 block">{action.label}</span>
                      <span className="text-[9px] text-slate-400 block mt-0.5 leading-tight">{action.desc}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleToggleLogAction(action.key)}
                      className={`relative inline-flex h-4 w-8 shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        isEnabled ? 'bg-blue-600' : 'bg-slate-200'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-xs transition duration-200 ease-in-out ${
                          isEnabled ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* SUBTAB 5: DATABASE EXPLORER */}
      {activeSubTab === 'database' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h3 className="text-sm font-black text-slate-800">Acesso Direto ao Banco de Dados</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Navegue pelas tabelas relacionais em tempo real, execute buscas e exporte dumps estruturados.</p>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleExportDbTable('json')}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer border border-slate-200"
              >
                <Download size={13} />
                <span>Exportar JSON</span>
              </button>
              <button
                onClick={() => handleExportDbTable('csv')}
                className="bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg text-xs font-extrabold flex items-center gap-1.5 transition cursor-pointer border border-blue-200"
              >
                <ClipboardList size={13} />
                <span>Exportar CSV</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Table/Collection List */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-2 shadow-xs lg:col-span-1">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-2 px-1">Tabelas Disponíveis</span>
              
              {[
                { id: 'projects', label: 'Projetos (projects)', count: projects?.length || 0, icon: Settings },
                { id: 'customers', label: 'Clientes (customers)', count: customers?.length || 0, icon: Shield },
                { id: 'gps', label: 'GPs (gps)', count: gps?.length || 0, icon: UserPlus },
                { id: 'criteria', label: 'Critérios (criteria)', count: criteria?.length || 0, icon: ClipboardList },
                { id: 'reviews', label: 'Avaliações QA (reviews)', count: reviews?.length || 0, icon: CheckCircle2 },
                { id: 'rseRecords', label: 'Status RSE (rseRecords)', count: rseRecords?.length || 0, icon: Calendar },
                { id: 'users', label: 'Usuários (users)', count: users?.length || 0, icon: Key },
                { id: 'logs', label: 'Logs de Auditoria (logs)', count: logs?.length || 0, icon: Terminal },
              ].map(tbl => {
                const IconComponent = tbl.icon;
                const isSelected = selectedDbTable === tbl.id;
                return (
                  <button
                    key={tbl.id}
                    onClick={() => {
                      setSelectedDbTable(tbl.id as any);
                      setSelectedDbRecord(null);
                      setDbSearchQuery('');
                    }}
                    className={`w-full text-left px-3 py-2.5 rounded-xl transition flex items-center justify-between text-xs cursor-pointer ${
                      isSelected 
                        ? 'bg-blue-600 text-white font-extrabold shadow-sm' 
                        : 'hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-transparent hover:border-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <IconComponent size={14} className={isSelected ? 'text-white' : 'text-slate-400'} />
                      <span>{tbl.label.split(' ')[0]}</span>
                    </div>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-black ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                      {tbl.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Records Explorer Area */}
            <div className="lg:col-span-3 space-y-4">
              {/* Search & Filter Bar */}
              <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
                <div className="flex items-center gap-2 w-full sm:max-w-md">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    <input
                      type="text"
                      value={dbSearchQuery}
                      onChange={e => setDbSearchQuery(e.target.value)}
                      placeholder={`Buscar na tabela de ${selectedDbTable}...`}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-1.5 text-xs focus:outline-none focus:border-blue-500 focus:bg-white font-medium"
                    />
                    {dbSearchQuery && (
                      <button 
                        onClick={() => setDbSearchQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        <X size={12} />
                      </button>
                    )}
                  </div>

                  {selectedDbTable === 'customers' && (
                    <button
                      onClick={() => setIsAddCustomerOpen(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-[11px] font-extrabold flex items-center gap-1 transition cursor-pointer shrink-0 shadow-xs"
                    >
                      <UserPlus size={13} />
                      <span>+ Cliente</span>
                    </button>
                  )}

                  {selectedDbTable === 'projects' && (
                    <button
                      onClick={() => setIsAddProjectOpen(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-[11px] font-extrabold flex items-center gap-1 transition cursor-pointer shrink-0 shadow-xs"
                    >
                      <UserPlus size={13} />
                      <span>+ Projeto</span>
                    </button>
                  )}

                  {selectedDbTable === 'gps' && (
                    <button
                      onClick={() => setIsAddGpOpen(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-[11px] font-extrabold flex items-center gap-1 transition cursor-pointer shrink-0 shadow-xs"
                    >
                      <UserPlus size={13} />
                      <span>+ GP</span>
                    </button>
                  )}
                </div>
                
                <div className="text-[10px] text-slate-400 font-bold self-end sm:self-center">
                  Mostrando {getFilteredDbRecords().length} de {
                    selectedDbTable === 'customers' ? customers.length :
                    selectedDbTable === 'projects' ? projects.length :
                    selectedDbTable === 'gps' ? gps.length :
                    selectedDbTable === 'criteria' ? criteria.length :
                    selectedDbTable === 'reviews' ? reviews.length :
                    selectedDbTable === 'rseRecords' ? rseRecords.length :
                    selectedDbTable === 'users' ? users.length : logs.length
                  } registros
                </div>
              </div>

              {/* Table rendering based on selectedDbTable */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="max-h-[480px] overflow-y-auto scrollbar-thin">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[9px] uppercase font-bold tracking-wider sticky top-0 z-10">
                        {selectedDbTable === 'customers' && (
                          <>
                            <th className="py-2.5 px-4">Código / ID</th>
                            <th className="py-2.5 px-4">Nome</th>
                            <th className="py-2.5 px-4">CNPJ</th>
                            <th className="py-2.5 px-4">País</th>
                            <th className="py-2.5 px-4 text-center">Status</th>
                          </>
                        )}
                        {selectedDbTable === 'gps' && (
                          <>
                            <th className="py-2.5 px-4">Nome do GP</th>
                            <th className="py-2.5 px-4 text-center">Status</th>
                          </>
                        )}
                        {selectedDbTable === 'projects' && (
                          <>
                            <th className="py-2.5 px-4">ID do Projeto</th>
                            <th className="py-2.5 px-4">Nome da Onda</th>
                            <th className="py-2.5 px-4">Cliente</th>
                            <th className="py-2.5 px-4">GP Responsável</th>
                            <th className="py-2.5 px-4">Solução SAP</th>
                            <th className="py-2.5 px-4 text-center">Status</th>
                          </>
                        )}
                        {selectedDbTable === 'criteria' && (
                          <>
                            <th className="py-2.5 px-4 text-center">Nº</th>
                            <th className="py-2.5 px-4">Critério Metodológico Oficial</th>
                            <th className="py-2.5 px-4">Tipo</th>
                            <th className="py-2.5 px-4 text-right">Peso</th>
                          </>
                        )}
                        {selectedDbTable === 'reviews' && (
                          <>
                            <th className="py-2.5 px-4">Projeto</th>
                            <th className="py-2.5 px-4">Cliente</th>
                            <th className="py-2.5 px-4">Fase</th>
                            <th className="py-2.5 px-4 text-center">Pontuação</th>
                            <th className="py-2.5 px-4 text-center">Status QA</th>
                          </>
                        )}
                        {selectedDbTable === 'rseRecords' && (
                          <>
                            <th className="py-2.5 px-4">Projeto</th>
                            <th className="py-2.5 px-4">Data Ref.</th>
                            <th className="py-2.5 px-4 text-center">Atrasado?</th>
                            <th className="py-2.5 px-4">Pendências</th>
                          </>
                        )}
                        {selectedDbTable === 'users' && (
                          <>
                            <th className="py-2.5 px-4">Nome</th>
                            <th className="py-2.5 px-4">E-mail Corporativo</th>
                            <th className="py-2.5 px-4">Perfil</th>
                            <th className="py-2.5 px-4 text-center">Status</th>
                          </>
                        )}
                        {selectedDbTable === 'logs' && (
                          <>
                            <th className="py-2.5 px-4">Data/Hora</th>
                            <th className="py-2.5 px-4">Usuário</th>
                            <th className="py-2.5 px-4">Ação</th>
                            <th className="py-2.5 px-4">Detalhes</th>
                          </>
                        )}
                        <th className="py-2.5 px-4 text-right">Dados</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-[11px] font-medium">
                      {getFilteredDbRecords().length === 0 ? (
                        <tr>
                          <td colSpan={10} className="py-8 text-center text-slate-400">
                            Nenhum registro encontrado correspondente aos filtros aplicados.
                          </td>
                        </tr>
                      ) : (
                        getFilteredDbRecords().map((item, idx) => (
                          <tr 
                            key={item.id || idx} 
                            onClick={() => setSelectedDbRecord(selectedDbRecord?.id === item.id ? null : item)}
                            className={`hover:bg-slate-50/70 transition cursor-pointer ${selectedDbRecord?.id === item.id ? 'bg-blue-50/30' : ''}`}
                          >
                            {selectedDbTable === 'gps' && (
                              <>
                                <td className="py-2.5 px-4 font-black text-slate-800">{item.name}</td>
                                <td className="py-2.5 px-4 text-center">
                                  <span className="px-1.5 py-0.25 rounded text-[8px] font-black bg-emerald-50 text-emerald-700 border border-emerald-100">
                                    ATIVO
                                  </span>
                                </td>
                              </>
                            )}
                            {selectedDbTable === 'customers' && (
                              <>
                                <td className="py-2.5 px-4 font-mono font-bold text-slate-600">{item.code || item.id}</td>
                                <td className="py-2.5 px-4 font-black text-slate-800">{item.name}</td>
                                <td className="py-2.5 px-4 font-mono text-slate-500">{item.cnpj}</td>
                                <td className="py-2.5 px-4 text-slate-500">{item.countryOfOrigin}</td>
                                <td className="py-2.5 px-4 text-center">
                                  <span className={`px-1.5 py-0.25 rounded text-[8px] font-black ${item.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-amber-50 text-amber-700 border border-amber-100'}`}>
                                    {item.status}
                                  </span>
                                </td>
                              </>
                            )}
                            {selectedDbTable === 'projects' && (
                              <>
                                <td className="py-2.5 px-4 font-mono font-bold text-slate-500">{item.sapProjectId || item.id}</td>
                                <td className="py-2.5 px-4 font-black text-slate-800">{item.name}</td>
                                <td className="py-2.5 px-4 text-slate-500">{item.clientName}</td>
                                <td className="py-2.5 px-4 font-bold text-slate-600">{item.manager}</td>
                                <td className="py-2.5 px-4 text-slate-500">{item.solution}</td>
                                <td className="py-2.5 px-4 text-center">
                                  <span className="px-1.5 py-0.25 rounded text-[8px] font-bold bg-slate-100 text-slate-700">
                                    {item.status}
                                  </span>
                                </td>
                              </>
                            )}
                            {selectedDbTable === 'criteria' && (
                              <>
                                <td className="py-2.5 px-4 text-center font-black text-slate-600">{item.number}</td>
                                <td className="py-2.5 px-4 font-bold text-slate-800">{item.text}</td>
                                <td className="py-2.5 px-4 text-slate-500">{item.type}</td>
                                <td className="py-2.5 px-4 text-right font-black font-mono text-blue-700">{item.weight}%</td>
                              </>
                            )}
                            {selectedDbTable === 'reviews' && (
                              <>
                                <td className="py-2.5 px-4 font-black text-slate-800">{item.projectName}</td>
                                <td className="py-2.5 px-4 text-slate-500">{item.client}</td>
                                <td className="py-2.5 px-4 text-slate-600 font-bold">{item.phase}</td>
                                <td className="py-2.5 px-4 text-center font-black font-mono text-emerald-600">{item.adherence}%</td>
                                <td className="py-2.5 px-4 text-center text-slate-500">{item.status}</td>
                              </>
                            )}
                            {selectedDbTable === 'rseRecords' && (
                              <>
                                <td className="py-2.5 px-4 font-black text-slate-800">{item.projectName}</td>
                                <td className="py-2.5 px-4 text-slate-500">{new Date(item.date).toLocaleDateString('pt-BR')}</td>
                                <td className="py-2.5 px-4 text-center">
                                  <span className={`px-1.5 py-0.25 rounded text-[8px] font-bold ${item.delayed === 'Sim' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
                                    {item.delayed}
                                  </span>
                                </td>
                                <td className="py-2.5 px-4 text-slate-600 font-bold">{item.pendencies}</td>
                              </>
                            )}
                            {selectedDbTable === 'users' && (
                              <>
                                <td className="py-2.5 px-4 font-black text-slate-800">{item.name}</td>
                                <td className="py-2.5 px-4 font-mono text-slate-500">{item.username}</td>
                                <td className="py-2.5 px-4">
                                  <span className="px-1.5 py-0.25 rounded text-[8px] font-bold bg-blue-50 text-blue-700">
                                    {item.role}
                                  </span>
                                </td>
                                <td className="py-2.5 px-4 text-center">
                                  <span className={`px-1.5 py-0.25 rounded text-[8px] font-bold ${item.active ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                                    {item.active ? 'Ativo' : 'Inativo'}
                                  </span>
                                </td>
                              </>
                            )}
                            {selectedDbTable === 'logs' && (
                              <>
                                <td className="py-2.5 px-4 font-mono text-slate-400 text-[10px]">{new Date(item.timestamp).toLocaleString('pt-BR')}</td>
                                <td className="py-2.5 px-4 font-bold text-slate-700">{item.user}</td>
                                <td className="py-2.5 px-4 font-black text-blue-700">{item.action}</td>
                                <td className="py-2.5 px-4 text-slate-500 truncate max-w-[200px]">{item.details}</td>
                              </>
                            )}
                            <td className="py-2.5 px-4 text-right">
                              <span className="text-blue-600 hover:text-blue-800 text-[10px] font-extrabold uppercase hover:underline">
                                {selectedDbRecord?.id === item.id ? 'Fechar' : 'Ver JSON'}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* JSON Inspector View */}
              {selectedDbRecord && (
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3 animate-scaleUp text-slate-200">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                    <div className="flex items-center gap-2">
                      <Terminal className="text-emerald-500" size={14} />
                      <span className="text-[10px] font-black text-emerald-500 uppercase tracking-wider font-mono">
                        Visualizador de Atributos JSON (Registro Selecionado)
                      </span>
                    </div>
                    <button 
                      onClick={() => setSelectedDbRecord(null)}
                      className="text-slate-500 hover:text-slate-300 cursor-pointer"
                    >
                      <X size={14} />
                    </button>
                  </div>
                  <pre className="text-[10px] font-mono leading-relaxed bg-slate-950/80 p-3 rounded-lg border border-slate-800/60 overflow-x-auto max-h-[300px] scrollbar-thin text-emerald-400">
                    {JSON.stringify(selectedDbRecord, null, 2)}
                  </pre>
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] text-slate-500 font-mono">
                      ID: {selectedDbRecord.id || 'Sem ID'}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(JSON.stringify(selectedDbRecord, null, 2));
                        alert('Objeto JSON copiado para a área de transferência!');
                      }}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded text-[10px] font-bold flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Copy size={12} />
                      <span>Copiar JSON</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 6: SEND NOTIFICATIONS */}
      {activeSubTab === 'send_notifications' && (
        <div className="space-y-6 animate-scaleUp">
          <div>
            <h3 className="text-sm font-black text-slate-800">Enviar Notificações do Sistema</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Dispare mensagens, alertas de erro ou comunicados personalizados para um usuário específico ou para todos simultaneamente.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Form Composer Card */}
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block border-b border-slate-100 pb-2">Compor Notificação</span>
              
              <form onSubmit={handleSubmitNotification} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Recipient */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-slate-500">Destinatário</label>
                    <select
                      value={notifTarget}
                      onChange={e => setNotifTarget(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:border-blue-500 focus:bg-white"
                    >
                      <option value="all">📢 Todos os Usuários (Geral)</option>
                      {users.map(u => (
                        <option key={u.id} value={u.username}>
                          👤 {u.name} ({u.username})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Notification Type */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-slate-500">Tipo/Gravidade</label>
                    <div className="grid grid-cols-4 gap-1.5">
                      {[
                        { type: 'info', label: 'Info', color: 'border-blue-200 text-blue-700 bg-blue-50/40 hover:bg-blue-50', activeColor: 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700' },
                        { type: 'success', label: 'Sucesso', color: 'border-emerald-200 text-emerald-700 bg-emerald-50/40 hover:bg-emerald-50', activeColor: 'bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700' },
                        { type: 'warning', label: 'Aviso', color: 'border-amber-200 text-amber-700 bg-amber-50/40 hover:bg-amber-50', activeColor: 'bg-amber-500 text-white border-amber-500 hover:bg-amber-600' },
                        { type: 'error', label: 'Erro', color: 'border-rose-200 text-rose-700 bg-rose-50/40 hover:bg-rose-50', activeColor: 'bg-rose-600 text-white border-rose-600 hover:bg-rose-700' }
                      ].map(item => {
                        const isSelected = notifType === item.type;
                        return (
                          <button
                            key={item.type}
                            type="button"
                            onClick={() => setNotifType(item.type as any)}
                            className={`py-2 px-1.5 rounded-lg text-[10px] font-black border text-center transition cursor-pointer ${
                              isSelected ? item.activeColor : `${item.color}`
                            }`}
                          >
                            {item.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Title */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-slate-500">Título da Notificação</label>
                  <input
                    type="text"
                    required
                    value={notifTitle}
                    onChange={e => setNotifTitle(e.target.value)}
                    placeholder="Ex: Atualização metodológica no Playbook ou Alerta de consistência de dados"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500 focus:bg-white font-semibold"
                  />
                </div>

                {/* Message */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-slate-500">Mensagem / Conteúdo</label>
                  <textarea
                    required
                    rows={4}
                    value={notifMessage}
                    onChange={e => setNotifMessage(e.target.value)}
                    placeholder="Digite a mensagem detalhada que o destinatário visualizará no painel de notificações..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500 focus:bg-white font-medium resize-none leading-relaxed"
                  />
                </div>

                {/* Submit button */}
                <div className="flex justify-end gap-2 pt-2 border-t border-slate-150">
                  <button
                    type="button"
                    onClick={() => {
                      setNotifTitle('');
                      setNotifMessage('');
                      setNotifType('info');
                      setNotifTarget('all');
                    }}
                    className="bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer"
                  >
                    Limpar Formulário
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-700 hover:bg-blue-600 text-white px-4 py-1.5 rounded-lg text-xs font-extrabold flex items-center gap-1.5 transition cursor-pointer shadow-sm"
                  >
                    <Send size={12} />
                    <span>Enviar Notificação</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Recent Notifications List Panel */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block border-b border-slate-100 pb-2">Notificações Recentes</span>
              
              <div className="max-h-[340px] overflow-y-auto space-y-2 pr-1 scrollbar-thin">
                {notifications.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 text-xs italic">
                    Nenhuma notificação cadastrada ou sincronizada no sistema.
                  </div>
                ) : (
                  [...notifications].sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 10).map(n => {
                    let typeBadge = 'bg-blue-50 text-blue-700 border-blue-100';
                    if (n.type === 'success') typeBadge = 'bg-emerald-50 text-emerald-700 border-emerald-100';
                    if (n.type === 'warning') typeBadge = 'bg-amber-50 text-amber-700 border-amber-100';
                    if (n.type === 'error') typeBadge = 'bg-rose-50 text-rose-700 border-rose-100';

                    return (
                      <div key={n.id} className="p-3 border border-slate-100 bg-slate-50/50 rounded-xl space-y-1 text-left">
                        <div className="flex items-center justify-between">
                          <span className={`px-1.5 py-0.25 rounded text-[8px] font-black border uppercase tracking-wide ${typeBadge}`}>
                            {n.type}
                          </span>
                          <span className="text-[8px] font-mono text-slate-400">
                            {new Date(n.timestamp).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-800 line-clamp-1">{n.title}</h4>
                        <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed">{n.message}</p>
                        <div className="text-[8px] text-slate-400 font-bold font-mono">
                          Para: {n.userId === 'all' ? 'Todos os usuários' : n.userId}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: ADD CUSTOMER */}
      {isAddCustomerOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-[100]">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-xl space-y-4 text-left animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-800">Cadastrar Novo Cliente</h3>
              <button 
                onClick={() => setIsAddCustomerOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveCustomer} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-500 block">Nome do Cliente *</label>
                <input 
                  type="text"
                  required
                  value={custName}
                  onChange={e => setCustName(e.target.value)}
                  placeholder="Ex: Ball Corporation"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500 focus:bg-white font-semibold text-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-500 block">Código Interno (ID) *</label>
                <input 
                  type="text"
                  required
                  value={custCode}
                  onChange={e => setCustCode(e.target.value)}
                  placeholder="Ex: BALL"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500 focus:bg-white font-semibold text-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-500 block">CNPJ</label>
                <input 
                  type="text"
                  value={custCnpj}
                  onChange={e => setCustCnpj(e.target.value)}
                  placeholder="Ex: 00.000.000/0000-00"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500 focus:bg-white font-mono text-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-500 block">País de Origem</label>
                <input 
                  type="text"
                  value={custCountry}
                  onChange={e => setCustCountry(e.target.value)}
                  placeholder="Ex: Brasil"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500 focus:bg-white font-semibold text-slate-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddCustomerOpen(false)}
                  className="bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-blue-700 hover:bg-blue-600 text-white px-4 py-1.5 rounded-lg text-xs font-extrabold transition cursor-pointer shadow-sm"
                >
                  Salvar Cliente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD PROJECT */}
      {isAddProjectOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-[100]">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-xl space-y-4 text-left animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-800">Cadastrar Novo Projeto</h3>
              <button 
                onClick={() => setIsAddProjectOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveProject} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-500 block">ID do Projeto (SAP) *</label>
                <input 
                  type="text"
                  required
                  value={projSapId}
                  onChange={e => setProjSapId(e.target.value)}
                  placeholder="Ex: P-0001"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500 focus:bg-white font-mono font-bold text-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-500 block">Nome da Onda / Projeto *</label>
                <input 
                  type="text"
                  required
                  value={projName}
                  onChange={e => setProjName(e.target.value)}
                  placeholder="Ex: Onda 1 - Rollout México"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500 focus:bg-white font-semibold text-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-500 block">Cliente Associado *</label>
                <select
                  required
                  value={projClientName}
                  onChange={e => setProjClientName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500 focus:bg-white font-semibold text-slate-800"
                >
                  <option value="">Selecione o Cliente</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-500 block">GP Responsável *</label>
                <select
                  required
                  value={projManager}
                  onChange={e => setProjManager(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500 focus:bg-white font-semibold text-slate-800"
                >
                  <option value="">Selecione o GP</option>
                  {gps.map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-500 block">Solução / Linha de Tecnologia</label>
                <input 
                  type="text"
                  value={projSolution}
                  onChange={e => setProjSolution(e.target.value)}
                  placeholder="Ex: SAP S/4HANA EWM"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500 focus:bg-white font-semibold text-slate-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddProjectOpen(false)}
                  className="bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-blue-700 hover:bg-blue-600 text-white px-4 py-1.5 rounded-lg text-xs font-extrabold transition cursor-pointer shadow-sm"
                >
                  Salvar Projeto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: ADD GP */}
      {isAddGpOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-[100]">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-sm w-full p-6 shadow-xl space-y-4 text-left animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-800">Cadastrar Novo GP</h3>
              <button 
                onClick={() => setIsAddGpOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveGp} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-500 block">Nome do GP *</label>
                <input 
                  type="text"
                  required
                  value={gpName}
                  onChange={e => setGpName(e.target.value)}
                  placeholder="Ex: Felipe Beni"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500 focus:bg-white font-semibold text-slate-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddGpOpen(false)}
                  className="bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-blue-700 hover:bg-blue-600 text-white px-4 py-1.5 rounded-lg text-xs font-extrabold transition cursor-pointer shadow-sm"
                >
                  Salvar GP
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
