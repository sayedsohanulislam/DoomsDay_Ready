import { useToastContext } from '../context/ToastContext';
import { X, CheckCircle, AlertTriangle, Info } from 'lucide-react';

const iconMap = {
  success: CheckCircle,
  error: AlertTriangle,
  info: Info,
};

const colorMap = {
  success: 'border-emerald-500/40 bg-emerald-500/10',
  error: 'border-marvel-red/40 bg-marvel-red/10',
  info: 'border-blue-500/40 bg-blue-500/10',
};

const iconColorMap = {
  success: 'text-emerald-400',
  error: 'text-marvel-red',
  info: 'text-blue-400',
};

export default function Toast() {
  const { toasts, removeToast } = useToastContext();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const Icon = iconMap[toast.type] || Info;
        return (
          <div
            key={toast.id}
            className={`pointer-events-auto animate-slide-in flex items-start gap-3 px-4 py-3 rounded-xl border ${colorMap[toast.type] || colorMap.info} bg-dark-700 backdrop-blur-sm shadow-lg`}
          >
            <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${iconColorMap[toast.type] || iconColorMap.info}`} />
            <p className="text-sm text-slate-100 flex-1 leading-relaxed">{toast.message}</p>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-200 transition-colors flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
