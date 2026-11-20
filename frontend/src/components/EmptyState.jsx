import { Film } from 'lucide-react';

export default function EmptyState({ icon: Icon = Film, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
      <div className="w-16 h-16 rounded-2xl bg-stone-100 border border-stone-200 flex items-center justify-center mb-5 shadow-sm">
        <Icon className="w-8 h-8 text-stone-400" />
      </div>
      <h3 className="text-lg font-serif font-bold text-stone-900 mb-2">{title}</h3>
      <p className="text-sm text-stone-500 text-center max-w-xs mb-6">{description}</p>
      {action && action}
    </div>
  );
}
