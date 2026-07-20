import React, { useRef, useState } from 'react';
import { Download, Upload, CheckCircle2, AlertCircle } from 'lucide-react';

export const BackupRestore: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleBackup = () => {
    chrome.storage.local.get(null, (data) => {
      if (chrome.runtime.lastError) {
        showToast('Error al leer datos locales.', 'error');
        return;
      }

      delete data.enabled;
      delete data.selectedRegime;

      if (Object.keys(data).length === 0) {
        showToast('No hay datos guardados para respaldar.', 'error');
        return;
      }

      const fileName = `HerramientasSatBackup-${new Date()
        .toISOString()
        .replace(/[-:tT]*/g, '')}.json`;

      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showToast('Respaldo descargado con éxito.', 'success');
    });
  };

  const handleRestoreClick = () => {
    fileInputRef.current?.click();
  };

  const validateAndMergeData = (data: Record<string, unknown>) => {
    if (typeof data !== 'object' || data === null || Object.keys(data).length === 0) {
      throw new Error('El archivo de respaldo no es válido o está vacío.');
    }

    chrome.storage.local.get(null, (existingData) => {
      const mergedData: Record<string, unknown> = { ...existingData };

      Object.keys(data).forEach((key) => {
        if (key === 'enabled' || key === 'selectedRegime') return;

        const incomingArray = data[key];
        const existingArray = mergedData[key];

        if (!existingArray) {
          mergedData[key] = incomingArray;
        } else if (Array.isArray(existingArray) && Array.isArray(incomingArray)) {
          incomingArray.forEach((incomingClient: { rfc?: string; [key: string]: unknown }) => {
            const index = (existingArray as Array<{ rfc?: string }>).findIndex(
              (c) => c.rfc === incomingClient.rfc
            );
            if (index !== -1) {
              (existingArray as Array<unknown>)[index] = incomingClient;
            } else {
              (existingArray as Array<unknown>).push(incomingClient);
            }
          });
        }
      });

      chrome.storage.local.set(mergedData, () => {
        showToast('Datos restaurados correctamente.', 'success');
      });
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const content = JSON.parse(event.target?.result as string);
          validateAndMergeData(content);
        } catch (err) {
          showToast('Formato JSON de respaldo no válido.', 'error');
        }
      };
      reader.readAsText(file);
    }
    // Reset file input
    e.target.value = '';
  };

  return (
    <div className="pt-3 border-t border-slate-800 space-y-2">
      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
        Copia de Seguridad
      </h3>
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={handleBackup}
          className="flex items-center justify-center space-x-1.5 p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium transition-all shadow-sm"
        >
          <Download className="w-3.5 h-3.5 text-blue-400" />
          <span>Respaldar</span>
        </button>

        <button
          onClick={handleRestoreClick}
          className="flex items-center justify-center space-x-1.5 p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium transition-all shadow-sm"
        >
          <Upload className="w-3.5 h-3.5 text-emerald-400" />
          <span>Restaurar</span>
        </button>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".json"
        className="hidden"
      />

      {notification && (
        <div
          className={`flex items-center space-x-2 p-2 rounded-lg text-xs font-medium animate-fadeIn ${
            notification.type === 'success'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span className="truncate">{notification.message}</span>
        </div>
      )}
    </div>
  );
};
