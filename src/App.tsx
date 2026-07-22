import React, { useState, useEffect, useRef } from 'react';
import { 
  AppUser, 
  AppLog, 
  Customer, 
  Project, 
  QACriterion, 
  QAReview, 
  RSERecord,
  MeetingSummary,
  ExcelMapping,
  AppNotification
} from './types';
import { SEED_CUSTOMERS, SEED_PROJECTS } from './data/seedData';
import { SEED_QA_CRITERIA, SEED_QA_REVIEWS, SEED_RSE_RECORDS, SEED_MEETING_SUMMARIES } from './data/qaSeedData';

import QADashboard from './components/qa/QADashboard';
import QAControl from './components/qa/QAControl';
import RSERegistrar from './components/qa/RSERegistrar';
import CriteriaConfig from './components/qa/CriteriaConfig';
import MeetingsSummarySub from './components/qa/MeetingsSummary';
import AdminSettings from './components/qa/AdminSettings';
import ManagersRanking from './components/qa/ManagersRanking';
import NotificationCenter from './components/qa/NotificationCenter';
import { LOGO_AZUL, LOGO_BRANCO, LOGO_PRETO } from './assets/logos';

import { 
  Database, 
  Settings, 
  User, 
  ShieldCheck, 
  LayoutDashboard, 
  LogOut, 
  Lock, 
  Eye, 
  EyeOff, 
  ClipboardList, 
  Clock, 
  ShieldAlert, 
  Shield, 
  History, 
  X,
  Bell
} from 'lucide-react';

const DEFAULT_EXCEL_MAPPING: ExcelMapping = {
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
};

const LogoExed = ({ className = "h-8 w-auto", variant = "branco" }: { className?: string, variant?: "branco" | "azul" | "preto" }) => {
  const [hasError, setHasError] = useState(false);
  const srcMap = {
    branco: LOGO_BRANCO,
    azul: LOGO_AZUL,
    preto: LOGO_PRETO
  };
  
  if (hasError) {
    const textColor = variant === "branco" ? "text-white" : "text-[#00508F]";
    const subColor = variant === "branco" ? "text-white/60" : "text-[#7b1a2c]";
    return (
      <div className="flex items-center gap-2 select-none shrink-0">
        <svg viewBox="0 0 100 100" className="h-7 w-7 filter drop-shadow-sm" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M50 12 L82 44 L50 76 L18 44 Z" fill={variant === "branco" ? "#ffffff" : "#00508F"} />
          <path d="M50 24 L70 44 L50 64 L30 44 Z" fill={variant === "branco" ? "#7b1a2c" : "#7b1a2c"} />
          <circle cx="50" cy="44" r="6" fill="#b89640" />
        </svg>
        <div className="leading-none text-left">
          <span className={`font-black tracking-tight text-sm ${textColor} font-sans block`}>EXED</span>
          <span className={`text-[7px] font-black tracking-widest ${subColor} uppercase font-sans block`}>CONSULTING</span>
        </div>
      </div>
    );
  }

  return (
    <img
      src={srcMap[variant]}
      alt="Exed Consulting"
      className={className}
      onError={() => setHasError(true)}
      referrerPolicy="no-referrer"
    />
  );
};

const DEFAULT_APP_USERS: AppUser[] = [
  {
    id: 'usr-marcelo',
    username: 'marcelo.timpone@exedconsulting.com',
    name: 'Marcelo Timpone de Oliveira',
    role: 'PMO ADM',
    password: 'PMO2026',
    isFirstLogin: false,
    active: true,
    email: 'marcelo.timpone@exedconsulting.com'
  },
  {
    id: 'usr-demo',
    username: 'demonstrativo@exedconsulting.com',
    name: 'Usuário Demonstrativo',
    role: 'Demonstrativo',
    password: 'PMO2026',
    isFirstLogin: true,
    active: true,
    email: 'demonstrativo@exedconsulting.com'
  },
  {
    id: 'usr-pmo',
    username: 'pmo@exedconsulting.com',
    name: 'Consultor PMO',
    role: 'PMO',
    password: 'PMO2026',
    isFirstLogin: true,
    active: true,
    email: 'pmo@exedconsulting.com'
  },
  {
    id: 'usr-adm',
    username: 'pmo_adm@exedconsulting.com',
    name: 'PMO Administrador',
    role: 'PMO ADM',
    password: 'PMO2026',
    isFirstLogin: true,
    active: true,
    email: 'pmo_adm@exedconsulting.com'
  }
];

export default function App() {
  // Theme state
  const [theme, setTheme] = useState<'exed' | 'dark'>(() => {
    const saved = localStorage.getItem('exed_qa_theme');
    return (saved === 'exed' || saved === 'dark') ? saved : 'exed';
  });

  // Helper to load initial state from localStorage fallback
  const getInitialState = <T,>(key: string, seed: T): T => {
    try {
      const saved = localStorage.getItem(`exed_qa_${key}`);
      return saved ? JSON.parse(saved) : seed;
    } catch {
      return seed;
    }
  };

  // Excel Import Mapping configuration
  const [excelMapping, setExcelMapping] = useState<ExcelMapping>(() => getInitialState('excelMapping', DEFAULT_EXCEL_MAPPING));

  // Custom Excel QA Template and Cell Coordinate Mapping
  const [qaExcelTemplate, setQaExcelTemplate] = useState<string | null>(() => getInitialState('qaExcelTemplate', null));
  const [qaCellMapping, setQaCellMapping] = useState<Record<string, any> | null>(() => getInitialState('qaCellMapping', null));

  // Core Data Lists
  const [customers, setCustomers] = useState<Customer[]>(() => getInitialState('customers', SEED_CUSTOMERS));
  const [projects, setProjects] = useState<Project[]>(() => getInitialState('projects', SEED_PROJECTS));
  const [criteria, setCriteria] = useState<QACriterion[]>(() => getInitialState('criteria', SEED_QA_CRITERIA));
  const [reviews, setReviews] = useState<QAReview[]>(() => getInitialState('reviews', SEED_QA_REVIEWS));
  const [rseRecords, setRseRecords] = useState<RSERecord[]>(() => getInitialState('rse_records', SEED_RSE_RECORDS));
  const [gps, setGps] = useState<string[]>(() => getInitialState('gps', []));

  // User Management State
  const [appUsers, setAppUsers] = useState<AppUser[]>(() => getInitialState('users', []));

  // Notifications State
  const [notifications, setNotifications] = useState<AppNotification[]>(() => getInitialState('notifications', []));

  // Logs History State
  const [appLogs, setAppLogs] = useState<AppLog[]>(() => getInitialState('logs', [
    {
      id: 'log-1',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      user: 'Sistema',
      action: 'Inicialização',
      details: 'Portal de Quality Gates & Playbooks inicializado com sucesso.'
    }
  ]));

  // Active User session state
  const [loggedUser, setLoggedUser] = useState<AppUser | null>(() => {
    const saved = sessionStorage.getItem('exed_logged_user');
    if (!saved) return null;
    try {
      const u = JSON.parse(saved);
      if (u && u.username && !u.username.includes('@')) {
        u.username = u.username + '@exedconsulting.com';
        u.email = u.username;
      }
      return u;
    } catch {
      return null;
    }
  });

  // Login form states
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [shake, setShake] = useState(false);

  // Password Setup states (First Login Flow)
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSetupError, setPasswordSetupError] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Active App Tab
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isVersionHistoryOpen, setIsVersionHistoryOpen] = useState(false);

  // Sync state tracking refs
  const lastSyncedJsonRef = useRef<string>('');
  const pendingDeletedIds = useRef<{
    projects: string[];
    reviews: string[];
    rseRecords: string[];
    criteria: string[];
    customers: string[];
    users: string[];
    notifications: string[];
  }>({
    projects: [],
    reviews: [],
    rseRecords: [],
    criteria: [],
    customers: [],
    users: [],
    notifications: []
  });
  const isLogClearTriggered = useRef<boolean>(false);

  // Load database from server when user is authenticated
  useEffect(() => {
    const fetchDb = async () => {
      if (!loggedUser) return;
      try {
        const headers: Record<string, string> = {};
        if ((loggedUser as any).userToken) {
          headers['X-User-Session'] = (loggedUser as any).userToken;
        }
        const response = await fetch('/api/db/load', { headers });
        if (response.ok) {
          const db = await response.json();
          
          const mergeLists = <T extends { id: string }>(localList: T[], serverList: T[]): T[] => {
            const map = new Map<string, T>();
            localList.forEach(item => map.set(item.id, item));
            serverList.forEach(item => {
              if (!map.has(item.id)) {
                map.set(item.id, item);
              }
            });
            return Array.from(map.values());
          };

          if (db.customers) setCustomers(prev => mergeLists(prev, db.customers));
          if (db.projects) setProjects(prev => mergeLists(prev, db.projects));
          if (db.criteria) setCriteria(prev => mergeLists(prev, db.criteria));
          if (db.reviews) setReviews(prev => mergeLists(prev, db.reviews));
          if (db.rseRecords) setRseRecords(prev => mergeLists(prev, db.rseRecords));
          if (db.users) setAppUsers(prev => mergeLists(prev, db.users));
          if (db.notifications) setNotifications(prev => mergeLists(prev, db.notifications));
          
          if (db.gps) {
            setGps(prev => {
              const combined = Array.from(new Set([...prev, ...(db.gps || [])]));
              return combined.length > 0 ? combined : prev;
            });
          }
          
          if (db.logs && db.logs.length > 0) {
            setAppLogs(prev => {
              const combined = mergeLists(prev, db.logs) as AppLog[];
              return combined.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
            });
          }

          if (db.settings) {
            if (db.settings.theme) setTheme(db.settings.theme);
            if (db.settings.excelMapping) setExcelMapping(db.settings.excelMapping);
            if (db.settings.qaExcelTemplate) setQaExcelTemplate(db.settings.qaExcelTemplate);
            if (db.settings.qaCellMapping) setQaCellMapping(db.settings.qaCellMapping);
            if (db.settings.logConfig) setLogConfig(db.settings.logConfig);
          }

          // Initialize lastSyncedJsonRef to avoid redundant sync on initial load
          lastSyncedJsonRef.current = JSON.stringify({
            projects: db.projects || [],
            reviews: db.reviews || [],
            rseRecords: db.rseRecords || [],
            criteria: db.criteria || [],
            customers: db.customers || [],
            users: db.users || [],
            gps: db.gps || [],
            notifications: db.notifications || [],
            settings: {
              theme: db.settings?.theme || 'exed',
              excelMapping: db.settings?.excelMapping || DEFAULT_EXCEL_MAPPING,
              qaExcelTemplate: db.settings?.qaExcelTemplate || null,
              qaCellMapping: db.settings?.qaCellMapping || null,
              logConfig: db.settings?.logConfig || logConfig
            }
          });
        } else if (response.status === 401) {
          // NOTE: We intentionally do NOT force-logout the user here.
          // This is a background sync call — a transient 401 (e.g. a cold-start
          // race right after login) must not silently kill the whole session,
          // especially while the first-login "set new password" screen is open.
          // Real, persistent session issues will surface clearly the next time
          // the user takes an explicit action (each handler already shows a
          // proper error message and lets them retry or log in again).
          console.warn('Database sync returned 401 — session may be stale. Will retry on next explicit action.');
        }
      } catch (err) {
        console.error('Failed to load database from server:', err);
      }
    };
    fetchDb();
  }, [loggedUser]);

  // Fetch logged-in user specific preferences
  useEffect(() => {
    if (loggedUser) {
      const fetchUserSettings = async () => {
        try {
          const headers: Record<string, string> = {};
          if ((loggedUser as any).userToken) {
            headers['X-User-Session'] = (loggedUser as any).userToken;
          }
          const res = await fetch(`/api/user/settings/${loggedUser.id}`, { headers });
          if (res.ok) {
            const data = await res.json();
            if (data.theme) setTheme(data.theme);
          }
        } catch (e) {
          console.error('Error fetching user settings:', e);
        }
      };
      fetchUserSettings();
    }
  }, [loggedUser]);

  // Save logged-in user specific theme preference
  useEffect(() => {
    if (loggedUser) {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if ((loggedUser as any).userToken) {
        headers['X-User-Session'] = (loggedUser as any).userToken;
      }
      fetch(`/api/user/settings/${loggedUser.id}`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ theme })
      }).catch(e => console.error('Failed to save user settings:', e));
    }
    localStorage.setItem('exed_qa_theme', theme);
  }, [theme, loggedUser]);

  // Session storage synchronization
  useEffect(() => {
    if (loggedUser) {
      sessionStorage.setItem('exed_logged_user', JSON.stringify(loggedUser));
    } else {
      sessionStorage.removeItem('exed_logged_user');
    }
  }, [loggedUser]);

  // Save all database changes to localStorage dynamically
  useEffect(() => {
    try {
      localStorage.setItem('exed_qa_customers', JSON.stringify(customers));
      localStorage.setItem('exed_qa_projects', JSON.stringify(projects));
      localStorage.setItem('exed_qa_criteria', JSON.stringify(criteria));
      localStorage.setItem('exed_qa_reviews', JSON.stringify(reviews));
      localStorage.setItem('exed_qa_rse_records', JSON.stringify(rseRecords));
      localStorage.setItem('exed_qa_gps', JSON.stringify(gps));
      localStorage.setItem('exed_qa_users', JSON.stringify(appUsers));
      localStorage.setItem('exed_qa_notifications', JSON.stringify(notifications));
      localStorage.setItem('exed_qa_logs', JSON.stringify(appLogs));
      localStorage.setItem('exed_qa_excelMapping', JSON.stringify(excelMapping));
      if (qaExcelTemplate !== null) {
        localStorage.setItem('exed_qa_qaExcelTemplate', JSON.stringify(qaExcelTemplate));
      }
      if (qaCellMapping !== null) {
        localStorage.setItem('exed_qa_qaCellMapping', JSON.stringify(qaCellMapping));
      }
    } catch (e) {
      console.error('Error writing to localStorage:', e);
    }
  }, [customers, projects, criteria, reviews, rseRecords, gps, appUsers, notifications, appLogs, excelMapping, qaExcelTemplate, qaCellMapping]);

  // Configuração de logs por ação (PMO ADM)
  const [logConfig, setLogConfig] = useState<Record<string, boolean>>({
    'Login realizado': true,
    'Login simplificado': true,
    'Logout efetuado': true,
    'Alteração de senha': true,
    'Registrar QA': true,
    'Editar QA': true,
    'Excluir QA': true,
    'Lançar RSE': true,
    'Editar RSE': true,
    'Excluir RSE': true,
    'Criar Critério': true,
    'Editar Critério': true,
    'Excluir Critério': true,
    'Criar Usuário': true,
    'Atualizar Usuário': true,
    'Excluir Usuário': true,
    'Resetar Senha': true,
  });

  const handleUpdateLogConfig = (newConfig: Record<string, boolean>) => {
    setLogConfig(newConfig);
  };

  const addErrorNotificationLocal = (title: string, message: string) => {
    const newNotif: AppNotification = {
      id: 'notif-err-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
      userId: loggedUser ? loggedUser.username : 'all',
      title,
      message,
      timestamp: new Date().toISOString(),
      read: false,
      type: 'error'
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const addNotification = (title: string, message: string, type: 'error' | 'success' | 'info' | 'warning' = 'info', targetUser: string = 'all') => {
    const newNotif: AppNotification = {
      id: 'notif-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
      userId: targetUser,
      title,
      message,
      timestamp: new Date().toISOString(),
      read: false,
      type
    };
    setNotifications(prev => {
      const updated = [newNotif, ...prev];
      syncStateWithServer(projects, reviews, rseRecords, criteria, customers, appUsers, updated);
      return updated;
    });
  };

  // Synchronize state with backend API
  const syncStateWithServer = async (
    currentProjects = projects,
    currentReviews = reviews,
    currentRseRecords = rseRecords,
    currentCriteria = criteria,
    currentCustomers = customers,
    currentUsers = appUsers,
    currentGps = gps,
    currentNotifications = notifications,
    currentSettings = { theme, excelMapping, qaExcelTemplate, qaCellMapping, logConfig }
  ): Promise<boolean> => {
    if (!loggedUser) return false;

    const currentPayload = JSON.stringify({
      projects: currentProjects,
      reviews: currentReviews,
      rseRecords: currentRseRecords,
      criteria: currentCriteria,
      customers: currentCustomers,
      users: currentUsers,
      gps: currentGps,
      notifications: currentNotifications,
      settings: currentSettings
    });

    if (currentPayload === lastSyncedJsonRef.current && 
        pendingDeletedIds.current.projects.length === 0 &&
        pendingDeletedIds.current.reviews.length === 0 &&
        pendingDeletedIds.current.rseRecords.length === 0 &&
        pendingDeletedIds.current.criteria.length === 0 &&
        pendingDeletedIds.current.customers.length === 0 &&
        pendingDeletedIds.current.users.length === 0 &&
        pendingDeletedIds.current.notifications.length === 0 &&
        !isLogClearTriggered.current) {
      return true; // No client changes to synchronize
    }

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if ((loggedUser as any).userToken) {
        headers['X-User-Session'] = (loggedUser as any).userToken;
      }
      const response = await fetch('/api/db/sync', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          projects: currentProjects,
          reviews: currentReviews,
          rseRecords: currentRseRecords,
          criteria: currentCriteria,
          customers: currentCustomers,
          users: currentUsers,
          gps: currentGps,
          notifications: currentNotifications,
          settings: currentSettings,
          deletedIds: pendingDeletedIds.current,
          clearLogs: isLogClearTriggered.current
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Clear any local buffers
          pendingDeletedIds.current = {
            projects: [],
            reviews: [],
            rseRecords: [],
            criteria: [],
            customers: [],
            users: [],
            notifications: []
          };
          isLogClearTriggered.current = false;

          // Update client-side arrays with newly consolidated server-side merged arrays
          if (data.projects) setProjects(data.projects);
          if (data.reviews) setReviews(data.reviews);
          if (data.rseRecords) setRseRecords(data.rseRecords);
          if (data.criteria) setCriteria(data.criteria);
          if (data.customers) setCustomers(data.customers);
          if (data.users) setAppUsers(data.users);
          if (data.gps) setGps(data.gps);
          if (data.logs) setAppLogs(data.logs);
          if (data.notifications) setNotifications(data.notifications);

          // Update the last synced ref to prevent double-syncing of this updated state
          lastSyncedJsonRef.current = JSON.stringify({
            projects: data.projects,
            reviews: data.reviews,
            rseRecords: data.rseRecords,
            criteria: data.criteria,
            customers: data.customers,
            users: data.users,
            gps: data.gps,
            notifications: data.notifications,
            settings: data.settings
          });
          return true;
        }
      }
      addErrorNotificationLocal('Erro de Sincronização', 'Não foi possível sincronizar as alterações com o servidor.');
      return false;
    } catch (e) {
      console.error('Failed to sync state with server:', e);
      addErrorNotificationLocal('Erro de Conexão', 'Falha na conexão com o servidor. Verifique sua internet.');
      return false;
    }
  };

  // Sync automatically on state changes
  useEffect(() => {
    if (!loggedUser) return;
    const timer = setTimeout(() => {
      syncStateWithServer();
    }, 1500);
    return () => clearTimeout(timer);
  }, [projects, reviews, rseRecords, criteria, customers, appUsers, notifications, theme, excelMapping, qaExcelTemplate, qaCellMapping, logConfig, loggedUser]);

  const handleRestoreBackup = (backupData: any) => {
    if (backupData.projects) setProjects(backupData.projects);
    if (backupData.reviews) setReviews(backupData.reviews);
    if (backupData.rseRecords) setRseRecords(backupData.rseRecords);
    if (backupData.criteria) setCriteria(backupData.criteria);
    if (backupData.users) setAppUsers(backupData.users);
    
    // Create restore log entry
    const restoreLog: AppLog = {
      id: 'log-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      timestamp: new Date().toISOString(),
      user: loggedUser ? loggedUser.name : 'Sistema',
      action: 'Restaurar Backup',
      details: 'Restauração completa do sistema realizada com sucesso através de arquivo JSON.'
    };
    setAppLogs(prev => [restoreLog, ...prev]);
  };

  // Logging function
  const addLog = (user: string, action: string, details: string) => {
    if (logConfig[action] === false) {
      return;
    }
    const newLog: AppLog = {
      id: 'log-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      timestamp: new Date().toISOString(),
      user,
      action,
      details
    };
    setAppLogs(prev => [newLog, ...prev]);
  };

  // Auth Submit
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const emailInput = loginUsername.trim().toLowerCase();

    if (!emailInput.endsWith('@exedconsulting.com')) {
      setLoginError('Apenas e-mails corporativos da Exed (@exedconsulting.com) são permitidos.');
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: emailInput, password: loginPassword })
      });
      
      const data = await response.json();
      if (response.ok && data.success) {
        const userWithToken = { ...data.user, userToken: data.userToken };
        setLoggedUser(userWithToken);
        addLog(data.user.name, 'Login realizado', `Usuário ${data.user.email || data.user.username} efetuou login no sistema.`);
        setLoginUsername('');
        setLoginPassword('');
      } else {
        setLoginError(data.message || 'Senha incorreta.');
        setShake(true);
        setTimeout(() => setShake(false), 500);
      }
    } catch (err) {
      setLoginError('Erro de comunicação com o servidor.');
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  // Logout Handler
  const handleLogout = async () => {
    if (loggedUser) {
      addLog(loggedUser.name, 'Logout efetuado', 'Sessão encerrada voluntariamente pelo usuário.');
      
      const headers: Record<string, string> = {};
      if ((loggedUser as any).userToken) {
        headers['X-User-Session'] = (loggedUser as any).userToken;
      }
      try {
        await fetch('/api/auth/logout', { method: 'POST', headers });
      } catch (err) {
        console.error('Auth logout call failed:', err);
      }
    }
    setLoggedUser(null);
    setActiveTab('dashboard');
  };

  // First Password Setup Submission
  const handlePasswordSetupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordSetupError('');

    if (!loggedUser) return;
    if (newPassword.length < 6) {
      setPasswordSetupError('A nova senha deve possuir ao menos 6 caracteres.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordSetupError('As senhas digitadas não coincidem.');
      return;
    }

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if ((loggedUser as any).userToken) {
        headers['X-User-Session'] = (loggedUser as any).userToken;
      }
      const response = await fetch('/api/auth/update-password', {
        method: 'POST',
        headers,
        body: JSON.stringify({ userId: loggedUser.id, password: newPassword })
      });
      
      const data = await response.json();
      if (response.ok && data.success) {
        // Update user state locally
        const updatedUsers = appUsers.map(u => 
          u.id === loggedUser.id ? { ...u, isFirstLogin: false } : u
        );
        setAppUsers(updatedUsers);

        const updatedActiveUser = { ...loggedUser, isFirstLogin: false };
        setLoggedUser(updatedActiveUser);

        addLog(loggedUser.name, 'Alteração de senha', 'Definição de senha personalizada efetuada no primeiro acesso.');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPasswordSetupError(data.message || 'Erro ao definir nova senha.');
      }
    } catch (err) {
      setPasswordSetupError('Erro de comunicação com o servidor.');
    }
  };

  // --- QA state mutating actions with Auditor logs ---

  // QA Reviews
  const handleAddReview = (newReview: QAReview) => {
    setReviews(prev => [newReview, ...prev]);
    if (loggedUser) {
      addLog(
        loggedUser.name, 
        'Registrar QA', 
        `Novo QA registrado para o projeto "${newReview.projectName}" (Cliente: ${newReview.client}) com aderência de ${Math.round(newReview.adherence * 100)}%.`
      );
    }
  };

  const handleUpdateReview = (updatedReview: QAReview) => {
    setReviews(prev => prev.map(r => r.id === updatedReview.id ? updatedReview : r));
    if (loggedUser) {
      addLog(
        loggedUser.name, 
        'Editar QA', 
        `QA modificado para o projeto "${updatedReview.projectName}" com nova aderência de ${Math.round(updatedReview.adherence * 100)}%.`
      );
    }
  };

  const handleDeleteReview = (id: string) => {
    const target = reviews.find(r => r.id === id);
    if (loggedUser && target) {
      pendingDeletedIds.current.reviews.push(id);
    }
    setReviews(prev => prev.filter(r => r.id !== id));
  };

  // RSE Records
  const handleAddRSERecord = (newRecord: RSERecord) => {
    setRseRecords(prev => [newRecord, ...prev]);
    if (loggedUser) {
      addLog(
        loggedUser.name, 
        'Lançar RSE', 
        `Relatório RSE lançado para o projeto "${newRecord.projectName}" (Atrasado: ${newRecord.delayed}, Severidade de Pendências: ${newRecord.pendencies}).`
      );
    }
  };

  const handleUpdateRSERecord = (updatedRecord: RSERecord) => {
    setRseRecords(prev => prev.map(r => r.id === updatedRecord.id ? updatedRecord : r));
    if (loggedUser) {
      addLog(
        loggedUser.name, 
        'Editar RSE', 
        `Relatório RSE atualizado para o projeto "${updatedRecord.projectName}" (Atrasado: ${updatedRecord.delayed}, Pendências: ${updatedRecord.pendencies}).`
      );
    }
  };

  const handleDeleteRSERecord = (id: string) => {
    const target = rseRecords.find(r => r.id === id);
    if (loggedUser && target) {
      pendingDeletedIds.current.rseRecords.push(id);
    }
    setRseRecords(prev => prev.filter(r => r.id !== id));
  };

  // Criteria Configuration Matrix
  const handleAddCriterion = (newCrit: QACriterion) => {
    setCriteria(prev => [...prev, newCrit]);
    if (loggedUser) {
      addLog(
        loggedUser.name, 
        'Criar Critério', 
        `Critério de playbook cadastrado: nº ${newCrit.number} - "${newCrit.text}" (Peso: ${newCrit.weight}, Tipo: ${newCrit.type}).`
      );
    }
  };

  const handleUpdateCriterion = (updatedCrit: QACriterion) => {
    setCriteria(prev => prev.map(c => c.id === updatedCrit.id ? updatedCrit : c));
    if (loggedUser) {
      addLog(
        loggedUser.name, 
        'Editar Critério', 
        `Critério de playbook nº ${updatedCrit.number} modificado para peso ${updatedCrit.weight}.`
      );
    }
  };

  const handleDeleteCriterion = (id: string) => {
    const target = criteria.find(c => c.id === id);
    if (loggedUser && target) {
      pendingDeletedIds.current.criteria.push(id);
    }
    setCriteria(prev => prev.filter(c => c.id !== id));
  };

  // User Administration callbacks
  const handleAddAppUser = (newUser: AppUser) => {
    setAppUsers(prev => [...prev, newUser]);
    if (loggedUser) {
      addLog(loggedUser.name, 'Criar Usuário', `Conta de usuário criada para "${newUser.name}" (login: ${newUser.username}, perfil: ${newUser.role}).`);
    }
  };

  const handleUpdateAppUser = (updatedUser: AppUser) => {
    setAppUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    if (loggedUser) {
      addLog(loggedUser.name, 'Atualizar Usuário', `Conta de usuário "${updatedUser.name}" modificada.`);
    }
  };

  const handleDeleteAppUser = (id: string) => {
    const target = appUsers.find(u => u.id === id);
    if (loggedUser && target) {
      pendingDeletedIds.current.users.push(id);
    }
    setAppUsers(prev => prev.filter(u => u.id !== id));
  };

  const handleAddCustomer = (newCustomer: Customer) => {
    setCustomers(prev => {
      const updated = [...prev, newCustomer];
      // Sync with server immediately
      syncStateWithServer(projects, reviews, rseRecords, criteria, updated);
      return updated;
    });
    if (loggedUser) {
      addLog(loggedUser.name, 'Criar Cliente', `Cliente "${newCustomer.name}" (CNPJ: ${newCustomer.cnpj}, Código: ${newCustomer.code}) cadastrado no banco.`);
    }
  };

  const handleAddProject = (newProject: Project) => {
    setProjects(prev => {
      const updated = [...prev, newProject];
      // Sync with server immediately
      syncStateWithServer(updated);
      return updated;
    });
    if (loggedUser) {
      addLog(loggedUser.name, 'Criar Projeto', `Projeto/Onda "${newProject.name}" (Cliente: ${newProject.clientName}, GP: ${newProject.manager}) cadastrado no banco.`);
    }
  };

  const handleAddGp = (newGp: string) => {
    setGps(prev => {
      if (prev.includes(newGp)) return prev;
      const updated = [...prev, newGp];
      // Sync with server immediately
      syncStateWithServer(projects, reviews, rseRecords, criteria, customers, appUsers, updated);
      return updated;
    });
    if (loggedUser) {
      addLog(loggedUser.name, 'Criar GP', `Gestor de Projeto (GP) "${newGp}" cadastrado no banco de dados.`);
    }
  };

  const handleResetPassword = (id: string) => {
    const target = appUsers.find(u => u.id === id);
    if (!target) return;

    const updated = appUsers.map(u => 
      u.id === id ? { ...u, password: 'PMO2026', isFirstLogin: true } : u
    );
    setAppUsers(updated);

    if (loggedUser) {
      addLog(loggedUser.name, 'Resetar Senha', `Senha do usuário "${target.name}" resetada para o padrão 'PMO2026'.`);
      alert(`Senha de ${target.name} resetada com sucesso para PMO2026.`);
    }
  };

  const handleClearLogs = () => {
    if (loggedUser) {
      isLogClearTriggered.current = true;
      setAppLogs([
        {
          id: 'log-' + Date.now(),
          timestamp: new Date().toISOString(),
          user: loggedUser.name,
          action: 'Limpeza de Logs',
          details: 'Histórico completo de auditoria limpo pelo administrador.'
        }
      ]);
    }
  };

  // Notification Management callbacks
  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => {
      const updated = prev.map(n => n.id === id ? { ...n, read: true } : n);
      syncStateWithServer(projects, reviews, rseRecords, criteria, customers, appUsers, updated);
      return updated;
    });
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => {
      const updated = prev.map(n => {
        if (n.userId === 'all' || (loggedUser && n.userId.toLowerCase() === loggedUser.username.toLowerCase())) {
          return { ...n, read: true };
        }
        return n;
      });
      syncStateWithServer(projects, reviews, rseRecords, criteria, customers, appUsers, updated);
      return updated;
    });
  };

  const handleDeleteNotification = (id: string) => {
    pendingDeletedIds.current.notifications.push(id);
    setNotifications(prev => {
      const updated = prev.filter(n => n.id !== id);
      syncStateWithServer(projects, reviews, rseRecords, criteria, customers, appUsers, updated);
      return updated;
    });
  };

  const handleClearAllNotifications = () => {
    const userNotifs = notifications.filter(n => 
      n.userId === 'all' || 
      (loggedUser && n.userId.toLowerCase() === loggedUser.username.toLowerCase())
    );
    userNotifs.forEach(n => {
      pendingDeletedIds.current.notifications.push(n.id);
    });
    setNotifications(prev => {
      const updated = prev.filter(n => 
        n.userId !== 'all' && 
        (!loggedUser || n.userId.toLowerCase() !== loggedUser.username.toLowerCase())
      );
      syncStateWithServer(projects, reviews, rseRecords, criteria, customers, appUsers, updated);
      return updated;
    });
  };

  const handleSendNotification = (title: string, message: string, type: 'info' | 'success' | 'warning' | 'error', targetUser: string) => {
    addNotification(title, message, type, targetUser);
    if (loggedUser) {
      addLog(loggedUser.name, 'Enviar Notificação', `Notificação personalizada enviada para ${targetUser === 'all' ? 'todos' : targetUser}.`);
    }
  };

  // Action to launch new QA on select from summaries tab
  const handleTriggerNewQaForProject = (projName: string) => {
    setActiveTab('control');
    setTimeout(() => {
      const btn = document.querySelector('button[class*="bg-blue-700"]') as HTMLButtonElement;
      if (btn) {
        btn.click();
        setTimeout(() => {
          const select = document.querySelector('select[class*="w-full"]') as HTMLSelectElement;
          if (select) {
            select.value = projName;
            const event = new Event('change', { bubbles: true });
            select.dispatchEvent(event);
          }
        }, 150);
      }
    }, 100);
  };

  // 1. NOT AUTHENTICATED: RENDER EXQUISITE SECURITIZED LOGIN PAGE
  if (!loggedUser) {
    return (
      <div className="bg-[#0f1c2a] flex items-center justify-center min-h-screen text-slate-100 p-4 font-sans selection:bg-[#7b1a2c]/40">
        <div className={`w-full max-w-md bg-[#152534] border border-[#26384a] p-8 rounded-2xl shadow-2xl space-y-6 transition-all duration-300 ${shake ? 'animate-shake' : ''}`}>
          <div className="flex flex-col items-center justify-center space-y-3 text-center">
            <LogoExed variant="branco" className="h-9 w-auto mb-1" />
            <h1 className="text-base font-black tracking-tight text-white flex items-center gap-1.5 justify-center">
              <span>Quality Gates & Playbook Portal</span>
            </h1>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold font-sans">
              Portal de Gestão de Qualidade
            </p>
          </div>
          
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-slate-400 block">E-mail Exed</label>
              <input 
                type="text"
                value={loginUsername}
                onChange={(e) => {
                  setLoginUsername(e.target.value);
                  setLoginError('');
                }}
                placeholder="Ex: usuario@exedconsulting.com" 
                required
                className="w-full bg-slate-950 border border-slate-800 text-slate-100 px-4 py-2.5 rounded-xl text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition font-mono font-semibold"
              />
            </div>

            <div className="space-y-1 relative">
              <label className="text-[10px] uppercase font-bold text-slate-400 block">Senha de Acesso</label>
              <input 
                type={showPassword ? 'text' : 'password'}
                value={loginPassword}
                onChange={(e) => {
                  setLoginPassword(e.target.value);
                  setLoginError('');
                }}
                placeholder="••••••••" 
                required
                className="w-full bg-slate-950 border border-slate-800 text-slate-100 pl-4 pr-12 py-2.5 rounded-xl text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition font-mono font-semibold"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-[28px] text-slate-500 hover:text-slate-300 focus:outline-none transition cursor-pointer p-1 rounded-lg hover:bg-slate-800/50"
                title={showPassword ? "Ocultar Senha" : "Mostrar Senha"}
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            
            <button 
              type="submit" 
              className="w-full bg-[#7b1a2c] hover:bg-[#94212f] text-white font-extrabold py-3 rounded-xl text-xs uppercase tracking-wider transition focus:outline-none focus:ring-2 focus:ring-[#b89640] focus:ring-offset-2 focus:ring-offset-[#152534] shadow-lg shadow-[#7b1a2c]/25 active:scale-[0.98] cursor-pointer"
            >
              Acessar Portal
            </button>
            
            <p className={`text-xs text-red-400 text-center font-medium min-h-[16px] transition-opacity duration-200 ${loginError ? 'opacity-100' : 'opacity-0'}`}>
              {loginError || 'Error'}
            </p>
          </form>
        </div>
      </div>
    );
  }

  // 2. FIRST ACCESS GATED FLOW: MUST CUSTOMIZE DEFAULT PASSWORD
  if (loggedUser.isFirstLogin) {
    return (
      <div className="bg-slate-950 flex items-center justify-center min-h-screen text-slate-100 p-4 font-sans">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl space-y-6">
          <div className="flex flex-col items-center justify-center space-y-2 text-center">
            <div className="h-12 w-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 mb-2">
              <ShieldAlert size={26} />
            </div>
            <h1 className="text-base font-black tracking-tight text-white">
              Primeiro Acesso ao Sistema
            </h1>
            <p className="text-xs text-slate-400 leading-relaxed max-w-xs">
              Olá, <strong>{loggedUser.name}</strong>. Por motivos de governança e segurança, você deve alterar a sua senha padrão antes de continuar.
            </p>
          </div>
          
          <form onSubmit={handlePasswordSetupSubmit} className="space-y-4">
            <div className="space-y-1 relative">
              <label className="text-[10px] uppercase font-bold text-slate-400 block">Nova Senha Personalizada (Mín. 6 caracteres)</label>
              <input 
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setPasswordSetupError('');
                }}
                placeholder="Sua nova senha" 
                required
                className="w-full bg-slate-950 border border-slate-800 text-slate-100 pl-4 pr-12 py-2.5 rounded-xl text-xs focus:outline-none focus:border-blue-500 font-mono"
              />
              <button 
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3.5 top-[28px] text-slate-500 hover:text-slate-300 focus:outline-none transition cursor-pointer p-1 rounded-lg hover:bg-slate-800/50"
                title={showNewPassword ? "Ocultar Senha" : "Mostrar Senha"}
              >
                {showNewPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>

            <div className="space-y-1 relative">
              <label className="text-[10px] uppercase font-bold text-slate-400 block">Confirmar Nova Senha</label>
              <input 
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setPasswordSetupError('');
                }}
                placeholder="Repita a nova senha" 
                required
                className="w-full bg-slate-950 border border-slate-800 text-slate-100 pl-4 pr-12 py-2.5 rounded-xl text-xs focus:outline-none focus:border-blue-500 font-mono"
              />
              <button 
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3.5 top-[28px] text-slate-500 hover:text-slate-300 focus:outline-none transition cursor-pointer p-1 rounded-lg hover:bg-slate-800/50"
                title={showConfirmPassword ? "Ocultar Senha" : "Mostrar Senha"}
              >
                {showConfirmPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            
            <button 
              type="submit" 
              className="w-full bg-blue-700 hover:bg-blue-600 text-white font-extrabold py-3 rounded-xl text-xs uppercase tracking-wider transition focus:outline-none cursor-pointer"
            >
              Salvar Senha & Acessar App
            </button>
            
            <p className={`text-xs text-red-400 text-center font-medium min-h-[16px] transition-opacity duration-200 ${passwordSetupError ? 'opacity-100' : 'opacity-0'}`}>
              {passwordSetupError || 'Error'}
            </p>
          </form>
        </div>
      </div>
    );
  }

  // Determine read only flag based on Demonstrativo role
  const isReadOnly = loggedUser.role === 'Demonstrativo';

  // 3. MAIN APPLICATION INTERFACE
  return (
    <div className={`min-h-screen bg-slate-50 flex flex-col text-slate-800 antialiased font-sans theme-${theme}`}>
      
      {/* HEADER SECTION (EXED DESIGN) */}
      <header className="bg-white border-b border-slate-200 text-slate-800 sticky top-0 z-50 shadow-sm">
        <div className="max-w-[98%] mx-auto px-2 sm:px-4 h-16 flex items-center justify-between">
          
          <div className="flex items-center gap-3">
            <LogoExed variant="branco" className="h-8 w-auto shrink-0" />
            <div className="hidden sm:block border-l border-white/20 pl-3">
              <span className="font-extrabold tracking-tight text-sm text-white font-sans block">Quality Gates &amp; Playbook Portal</span>
              <span className="text-[10px] text-white/60 block tracking-wider uppercase font-semibold font-sans">Auditoria Metodológica e Gestão de Qualidade</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            
            {/* Seletor de Tema (Light, Dark) */}
            <div className="relative">
              <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
                <button 
                  onClick={() => setTheme('exed')}
                  className={`px-2 py-1 rounded text-[10px] font-bold uppercase transition cursor-pointer ${theme === 'exed' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                  title="Tema Claro"
                >
                  Claro
                </button>
                <button 
                  onClick={() => setTheme('dark')}
                  className={`px-2 py-1 rounded text-[10px] font-bold uppercase transition cursor-pointer ${theme === 'dark' ? 'bg-slate-800 text-blue-400 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                  title="Tema Escuro"
                >
                  Escuro
                </button>
              </div>
            </div>

            {/* Histórico de Versões Button */}
            <button
              onClick={() => setIsVersionHistoryOpen(true)}
              className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-blue-400 rounded-lg transition cursor-pointer flex items-center gap-1"
              title="Histórico de Versões"
            >
              <History size={14} />
              <span className="text-[10px] font-bold uppercase hidden md:inline">v1.0.0</span>
            </button>

            {/* Authenticated User Session Info Box */}
            <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl shadow-xs">
              <div className="h-7 w-7 rounded-full bg-blue-700 text-white font-bold text-xs flex items-center justify-center uppercase shrink-0">
                {loggedUser.name.substring(0, 2)}
              </div>
              <div className="text-left leading-none max-w-[140px] truncate">
                <span className="text-slate-800 font-extrabold text-[11px] block truncate leading-tight">{loggedUser.name}</span>
                <span className="text-[8px] font-bold text-blue-700 uppercase tracking-wider font-mono">{loggedUser.role}</span>
              </div>
              <button
                onClick={handleLogout}
                className="h-6 w-6 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 border border-transparent hover:border-red-100 flex items-center justify-center transition shrink-0 cursor-pointer"
                title="Efetuar Logout"
              >
                <LogOut size={12} />
              </button>
            </div>

            {/* Notification Bell Button */}
            <button
              onClick={() => setActiveTab('notifications')}
              className={`relative p-2 rounded-xl transition cursor-pointer border flex items-center justify-center ${
                activeTab === 'notifications'
                  ? 'bg-blue-50 text-blue-700 border-blue-200 shadow-xs'
                  : 'bg-white border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 shadow-xs'
              }`}
              title="Central de Notificações"
            >
              <Bell size={16} />
              {notifications.filter(n => !n.read && (n.userId === 'all' || n.userId.toLowerCase() === loggedUser.username.toLowerCase())).length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[9px] font-black text-white ring-2 ring-white animate-bounce">
                  {notifications.filter(n => !n.read && (n.userId === 'all' || n.userId.toLowerCase() === loggedUser.username.toLowerCase())).length}
                </span>
              )}
            </button>

          </div>

        </div>
      </header>

      {/* CORE WEBAPP LAYOUT CONTAINER */}
      <div className="flex-1 max-w-[98%] w-full mx-auto px-2 sm:px-4 py-4 space-y-4">
        
        {/* Banner principal */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-xl bg-blue-700 flex items-center justify-center text-white shadow-md shadow-blue-700/20 shrink-0">
              <ShieldCheck size={22} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight text-slate-800">Gestão de Quality Gates & Playbook de Projetos</h2>
              <p className="text-xs text-slate-400">Auditoria metodológica de qualidade, acompanhamento de RSEs e diagnósticos de conformidade</p>
            </div>
          </div>
        </div>

        {/* Tab Navigation Menu of the webapp */}
        <div className="flex border-b border-slate-200 gap-1 overflow-x-auto pb-px">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-3 text-xs font-bold flex items-center gap-2 border-b-2 transition shrink-0 cursor-pointer ${
              activeTab === 'dashboard' 
                ? 'border-blue-700 text-blue-700 bg-white font-extrabold' 
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
            }`}
          >
            <LayoutDashboard size={14} />
            <span>Dashboard de Qualidade</span>
          </button>

          <button
            onClick={() => setActiveTab('control')}
            className={`px-4 py-3 text-xs font-bold flex items-center gap-2 border-b-2 transition shrink-0 cursor-pointer ${
              activeTab === 'control' 
                ? 'border-blue-700 text-blue-700 bg-white font-extrabold' 
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
            }`}
          >
            <Database size={14} />
            <span>Controle de QAs</span>
          </button>

          <button
            onClick={() => setActiveTab('rse')}
            className={`px-4 py-3 text-xs font-bold flex items-center gap-2 border-b-2 transition shrink-0 cursor-pointer ${
              activeTab === 'rse' 
                ? 'border-blue-700 text-blue-700 bg-white font-extrabold' 
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
            }`}
          >
            <ClipboardList size={14} />
            <span>Registro de RSE</span>
          </button>

          <button
            onClick={() => setActiveTab('meetings')}
            className={`px-4 py-3 text-xs font-bold flex items-center gap-2 border-b-2 transition shrink-0 cursor-pointer ${
              activeTab === 'meetings' 
                ? 'border-blue-700 text-blue-700 bg-white font-extrabold' 
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
            }`}
          >
            <Clock size={14} />
            <span>Resumo e Pendências</span>
          </button>

          <button
            onClick={() => setActiveTab('managers_ranking')}
            className={`px-4 py-3 text-xs font-bold flex items-center gap-2 border-b-2 transition shrink-0 cursor-pointer ${
              activeTab === 'managers_ranking' 
                ? 'border-blue-700 text-blue-700 bg-white font-extrabold' 
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
            }`}
          >
            <History size={14} />
            <span>Ranking de Gestores</span>
          </button>

          <button
            onClick={() => setActiveTab('criteria')}
            className={`px-4 py-3 text-xs font-bold flex items-center gap-2 border-b-2 transition shrink-0 cursor-pointer ${
              activeTab === 'criteria' 
                ? 'border-blue-700 text-blue-700 bg-white font-extrabold' 
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
            }`}
          >
            <Settings size={14} />
            <span>Critérios & Pesos</span>
          </button>

          {/* Conditional Admin Only Tabs */}
          {loggedUser.role === 'PMO ADM' && (
            <button
              onClick={() => setActiveTab('admin_settings')}
              className={`px-4 py-3 text-xs font-bold flex items-center gap-2 border-b-2 transition shrink-0 cursor-pointer text-red-600 hover:text-red-700 hover:border-red-300 ${
                activeTab === 'admin_settings' 
                  ? 'border-red-600 text-red-700 bg-white font-extrabold' 
                  : 'border-transparent'
              }`}
            >
              <Shield size={14} />
              <span>Administração </span>
            </button>
          )}
        </div>

        {/* RENDER SELECTED TAB CONTENT */}
        <main className="min-h-[400px]">
          {activeTab === 'dashboard' && (
            <QADashboard 
              reviews={reviews} 
              rseRecords={rseRecords} 
              meetingSummaries={SEED_MEETING_SUMMARIES}
              criteria={criteria}
              projects={projects}
              currentUser={loggedUser}
            />
          )}

          {activeTab === 'control' && (
            <QAControl 
              reviews={reviews} 
              criteria={criteria} 
              projects={projects}
              customers={customers}
              gps={gps}
              onAddReview={handleAddReview}
              onUpdateReview={handleUpdateReview}
              onDeleteReview={handleDeleteReview}
              isReadOnly={isReadOnly}
              excelMapping={excelMapping}
              qaExcelTemplate={qaExcelTemplate}
              qaCellMapping={qaCellMapping}
            />
          )}

          {activeTab === 'rse' && (
            <RSERegistrar 
              records={rseRecords}
              projects={projects}
              onAddRecord={handleAddRSERecord}
              onUpdateRecord={handleUpdateRSERecord}
              onDeleteRecord={handleDeleteRSERecord}
              isReadOnly={isReadOnly}
            />
          )}

          {activeTab === 'meetings' && (
            <MeetingsSummarySub 
              reviews={reviews}
              projects={projects}
              onTriggerNewQa={handleTriggerNewQaForProject}
            />
          )}

          {activeTab === 'managers_ranking' && (
            <ManagersRanking 
              reviews={reviews}
              projects={projects}
            />
          )}

          {activeTab === 'criteria' && (
            <CriteriaConfig 
              criteria={criteria}
              onAddCriterion={handleAddCriterion}
              onUpdateCriterion={handleUpdateCriterion}
              onDeleteCriterion={handleDeleteCriterion}
              isReadOnly={isReadOnly}
              excelMapping={excelMapping}
              onUpdateExcelMapping={setExcelMapping}
              qaExcelTemplate={qaExcelTemplate}
              onUpdateQaExcelTemplate={setQaExcelTemplate}
              qaCellMapping={qaCellMapping}
              onUpdateQaCellMapping={setQaCellMapping}
            />
          )}

           {activeTab === 'admin_settings' && loggedUser.role === 'PMO ADM' && (
             <AdminSettings
               users={appUsers}
               customers={customers}
               gps={gps}
               projects={projects}
               criteria={criteria}
               reviews={reviews}
               rseRecords={rseRecords}
               logs={appLogs}
               onAddUser={handleAddAppUser}
               onUpdateUser={handleUpdateAppUser}
               onDeleteUser={handleDeleteAppUser}
               onResetPassword={handleResetPassword}
               onClearLogs={handleClearLogs}
               currentUserId={loggedUser.id}
               onForceSync={() => syncStateWithServer(projects, reviews, rseRecords, criteria, customers, appUsers, gps)}
               logConfig={logConfig}
               onUpdateLogConfig={handleUpdateLogConfig}
               onRestoreBackup={handleRestoreBackup}
               notifications={notifications}
               onSendNotification={handleSendNotification}
               onAddCustomer={handleAddCustomer}
               onAddProject={handleAddProject}
               onAddGp={handleAddGp}
             />
           )}

           {activeTab === 'notifications' && (
             <NotificationCenter
               notifications={notifications}
               currentUsername={loggedUser.username}
               onMarkAsRead={handleMarkAsRead}
               onMarkAllAsRead={handleMarkAllAsRead}
               onDeleteNotification={handleDeleteNotification}
               onClearAll={handleClearAllNotifications}
             />
           )}
        </main>

      </div>

      {/* FOOTER BAR */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-4 text-center text-xs mt-auto">
        <div className="max-w-[98%] mx-auto px-2 sm:px-4 flex flex-col sm:flex-row justify-between items-center gap-2">
          <p>© 2026 Exed Consulting Quality Gates & Playbook Portal. Todos os direitos reservados.</p>
        </div>
      </footer>

      {isVersionHistoryOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-[100] p-4">
          <div className="w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden text-slate-800 dark:text-slate-100">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/50">
              <div className="flex items-center gap-2">
                <History className="text-blue-700 dark:text-blue-400 animate-pulse" size={18} />
                <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">Histórico de Versões do Portal</h3>
              </div>
              <button 
                onClick={() => setIsVersionHistoryOpen(false)}
                className="h-8 w-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6">
              
              {/* v1.0.0 */}
              <div className="relative pl-6 border-l-2 border-blue-600 dark:border-blue-500">
                <div className="absolute -left-[7px] top-1.5 h-3 w-3 rounded-full bg-blue-600 dark:bg-blue-500 border-2 border-white dark:border-slate-900" />
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-black text-blue-700 dark:text-blue-400 font-mono">v1.0.0 (Versão Oficial)</span>
                  <span className="text-[10px] text-slate-400 font-bold">Julho 2026</span>
                </div>
                <h4 className="text-[11px] font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-2 font-sans">Lançamento Consolidado do Portal</h4>
                
                <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-100 dark:border-slate-800 space-y-2 mb-4">
                  <div className="text-[11px] text-slate-600 dark:text-slate-300">
                    <span className="font-extrabold uppercase tracking-wider text-[10px] text-slate-400 block mb-0.5">Responsável</span>
                    <span className="text-xs font-black text-slate-800 dark:text-slate-100">Marcelo Timpone de Oliveira</span>
                  </div>
                  <div className="text-[11px] text-slate-600 dark:text-slate-300 pt-1.5 border-t border-slate-200/50 dark:border-slate-800/50">
                    <span className="font-extrabold uppercase tracking-wider text-[10px] text-slate-400 block mb-0.5">Escopo de Governança</span>
                    Portal unificado de Quality Gates, Auditoria de Qualidade (QA), Registros RSE, acompanhamento de atrasos e recalibração dinâmica do modelo Excel.
                  </div>
                </div>

                <ul className="text-[11px] text-slate-500 dark:text-slate-400 space-y-2 list-disc pl-4 leading-relaxed">
                  <li><strong>Controle de Qualidade (QA):</strong> Avaliação e recalibração de conformidades de projetos baseadas em pesos.</li>
                  <li><strong>Registros de RSE:</strong> Histórico de status, atrasos, pendências e conformidade de entregas operacionais.</li>
                  <li><strong>Importador Customizável:</strong> Possibilidade de configurar termos do cabeçalho Excel de QA para adaptar-se a novos modelos sem reescrever código.</li>
                  <li><strong>Design Fluido e Responsivo:</strong> Fontes otimizadas com proporção ampliada em 30% e larguras estendidas para melhor visibilidade de relatórios densos.</li>
                </ul>
              </div>

            </div>
            
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/30 flex justify-end">
              <button 
                onClick={() => setIsVersionHistoryOpen(false)}
                className="bg-blue-700 hover:bg-blue-600 text-white font-extrabold px-4 py-2 rounded-xl text-xs uppercase tracking-wider transition cursor-pointer shadow-sm animate-pulse"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
