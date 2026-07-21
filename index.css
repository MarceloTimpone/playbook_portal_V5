import React, { useState } from 'react';
import { 
  Bell, 
  Trash2, 
  CheckCheck, 
  AlertCircle, 
  CheckCircle, 
  Info, 
  AlertTriangle,
  XCircle,
  Eye,
  Calendar,
  X,
  Mail,
  User
} from 'lucide-react';
import { AppNotification } from '../../types';

interface NotificationCenterProps {
  notifications: AppNotification[];
  currentUsername: string;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDeleteNotification: (id: string) => void;
  onClearAll: () => void;
}

export default function NotificationCenter({
  notifications,
  currentUsername,
  onMarkAsRead,
  onMarkAllAsRead,
  onDeleteNotification,
  onClearAll
}: NotificationCenterProps) {
  const [filter, setFilter] = useState<'all' | 'unread' | 'info' | 'success' | 'warning' | 'error'>('all');

  // Filter notifications for current user (either targeted specifically to them, or to 'all')
  const userNotifications = notifications.filter(n => 
    n.userId === 'all' || 
    n.userId.toLowerCase() === currentUsername.toLowerCase()
  );

  const filteredNotifications = userNotifications.filter(n => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !n.read;
    return n.type === filter;
  });

  const unreadCount = userNotifications.filter(n => !n.read).length;

  const getIcon = (type: 'info' | 'success' | 'warning' | 'error') => {
    switch (type) {
      case 'success':
        return <CheckCircle className="text-emerald-500 h-5 w-5" />;
      case 'error':
        return <XCircle className="text-rose-500 h-5 w-5" />;
      case 'warning':
        return <AlertTriangle className="text-amber-500 h-5 w-5" />;
      default:
        return <Info className="text-blue-500 h-5 w-5" />;
    }
  };

  const getTypeBadge = (type: 'info' | 'success' | 'warning' | 'error') => {
    switch (type) {
      case 'success':
        return <span className="bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 px-2 py-0.5 rounded text-[9px] font-bold uppercase">Sucesso</span>;
      case 'error':
        return <span className="bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 px-2 py-0.5 rounded text-[9px] font-bold uppercase">Erro</span>;
      case 'warning':
        return <span className="bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 px-2 py-0.5 rounded text-[9px] font-bold uppercase">Aviso</span>;
      default:
        return <span className="bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 px-2 py-0.5 rounded text-[9px] font-bold uppercase">Info</span>;
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-6">
      
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-700">
            <Bell className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-800">Central de Notificações</h3>
            <p className="text-xs text-slate-400">Avisos do sistema, alertas de erro e comunicados da administração</p>
          </div>
        </div>

        {userNotifications.length > 0 && (
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <button
                onClick={onMarkAllAsRead}
                className="px-3 py-1.5 border border-slate-200 text-slate-600 hover:text-blue-700 hover:border-blue-200 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer bg-white"
              >
                <CheckCheck size={14} />
                <span>Lidas</span>
              </button>
            )}
            <button
              onClick={onClearAll}
              className="px-3 py-1.5 border border-slate-200 text-slate-600 hover:text-red-600 hover:border-red-200 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer bg-white"
            >
              <Trash2 size={14} />
              <span>Limpar Tudo</span>
            </button>
          </div>
        )}
      </div>

      {/* FILTER BUTTONS */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 select-none">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            filter === 'all'
              ? 'bg-blue-700 text-white font-extrabold shadow-sm'
              : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100'
          }`}
        >
          Todas ({userNotifications.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            filter === 'unread'
              ? 'bg-blue-700 text-white font-extrabold shadow-sm'
              : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100'
          }`}
        >
          Não lidas ({unreadCount})
        </button>
        <button
          onClick={() => setFilter('info')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            filter === 'info'
              ? 'bg-blue-50 text-blue-700 border border-blue-200'
              : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100'
          }`}
        >
          Info
        </button>
        <button
          onClick={() => setFilter('success')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            filter === 'success'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100'
          }`}
        >
          Sucesso
        </button>
        <button
          onClick={() => setFilter('warning')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            filter === 'warning'
              ? 'bg-amber-50 text-amber-700 border border-amber-200'
              : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100'
          }`}
        >
          Avisos
        </button>
        <button
          onClick={() => setFilter('error')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            filter === 'error'
              ? 'bg-rose-50 text-rose-700 border border-rose-200'
              : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100'
          }`}
        >
          Erros
        </button>
      </div>

      {/* NOTIFICATIONS LIST */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-12 bg-slate-50 border border-dashed border-slate-200 rounded-xl space-y-3">
            <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
              <Mail className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-600">Nenhuma notificação encontrada</p>
              <p className="text-[10px] text-slate-400 mt-1">Você está em dia com todos os alertas do portal.</p>
            </div>
          </div>
        ) : (
          filteredNotifications.map(notification => (
            <div 
              key={notification.id}
              className={`p-4 border rounded-xl flex items-start justify-between gap-4 transition duration-200 ${
                notification.read 
                  ? 'bg-white border-slate-150 opacity-75' 
                  : 'bg-blue-50/20 border-blue-100 hover:bg-blue-50/35 shadow-xs'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 shrink-0">
                  {getIcon(notification.type)}
                </div>
                <div className="space-y-1.5 text-left">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-xs font-bold ${notification.read ? 'text-slate-600' : 'text-slate-900 font-extrabold'}`}>
                      {notification.title}
                    </span>
                    {getTypeBadge(notification.type)}
                    {notification.userId !== 'all' && (
                      <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-[8px] font-bold flex items-center gap-0.5 uppercase tracking-wide">
                        <User size={8} /> Exclusivo
                      </span>
                    )}
                  </div>
                  
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {notification.message}
                  </p>

                  <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-medium">
                    <Calendar size={10} />
                    <span>{new Date(notification.timestamp).toLocaleString('pt-BR')}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {!notification.read && (
                  <button
                    onClick={() => onMarkAsRead(notification.id)}
                    className="p-1 text-slate-400 hover:text-blue-700 hover:bg-slate-100 rounded transition cursor-pointer"
                    title="Marcar como lida"
                  >
                    <CheckCheck size={14} />
                  </button>
                )}
                <button
                  onClick={() => onDeleteNotification(notification.id)}
                  className="p-1 text-slate-400 hover:text-red-600 hover:bg-slate-100 rounded transition cursor-pointer"
                  title="Excluir notificação"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
}
