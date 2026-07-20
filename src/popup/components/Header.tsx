import React from 'react';
import { Power } from 'lucide-react';

interface HeaderProps {
  enabled: boolean;
  onToggle: (newStatus: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({ enabled, onToggle }) => {
  return (
    <header className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
      <div className="flex items-center space-x-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 p-0.5 shadow-lg shadow-blue-500/20 flex items-center justify-center">
          <img src="/src/Logo 48px.png" alt="SAT Tools Logo" className="w-7 h-7 object-contain" />
        </div>
        <div>
          <h1 className="text-base font-bold text-slate-100 tracking-tight leading-tight">
            Herramientas SAT
          </h1>
          <p className="text-xs text-slate-400 font-medium">Copiar, Pegar y Accesos</p>
        </div>
      </div>

      <button
        onClick={() => onToggle(!enabled)}
        className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 shadow-md ${
          enabled
            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25'
            : 'bg-rose-500/15 text-rose-400 border border-rose-500/30 hover:bg-rose-500/25'
        }`}
      >
        <Power className={`w-3.5 h-3.5 ${enabled ? 'text-emerald-400' : 'text-rose-400'}`} />
        <span>{enabled ? 'Activo' : 'Inactivo'}</span>
      </button>
    </header>
  );
};
