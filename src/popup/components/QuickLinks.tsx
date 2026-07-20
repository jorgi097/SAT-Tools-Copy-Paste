import React, { useState, useEffect } from 'react';
import { ExternalLink, ChevronDown, ChevronUp, Layers } from 'lucide-react';

interface LinkItem {
  url: string;
  nombre: string;
  order?: number;
}

interface SectionData {
  titulo?: string;
  [key: string]: unknown;
}

interface LinksData {
  general: Record<string, SectionData>;
  fisica: Record<string, SectionData>;
  moral: Record<string, SectionData>;
  certificados: Record<string, SectionData>;
  [key: string]: Record<string, SectionData>;
}

export const QuickLinks: React.FC = () => {
  const [links, setLinks] = useState<LinksData | null>(null);
  const [regime, setRegime] = useState<'fisica' | 'moral'>('fisica');
  const [isCertificadosOpen, setIsCertificadosOpen] = useState(false);

  useEffect(() => {
    // Cargar régimen guardado en storage
    chrome.storage.local.get(['selectedRegime'], (result) => {
      if (result.selectedRegime === 'moral' || result.selectedRegime === 'fisica') {
        setRegime(result.selectedRegime);
      }
    });

    // Fetch links.json desde public/popup
    fetch(chrome.runtime.getURL('popup/links.json'))
      .then(res => res.json())
      .then((data: LinksData) => setLinks(data))
      .catch(err => console.error('Error cargando links.json:', err));
  }, []);

  const handleRegimeChange = (newRegime: 'fisica' | 'moral') => {
    setRegime(newRegime);
    chrome.storage.local.set({ selectedRegime: newRegime });
  };

  const renderSection = (sectionMap: Record<string, SectionData>) => {
    return Object.entries(sectionMap).map(([subKey, subData]) => {
      if (typeof subData !== 'object' || subData === null) return null;

      const title = subData.titulo || subKey;
      const extractedLinks: LinkItem[] = [];

      Object.values(subData).forEach(item => {
        if (item && typeof item === 'object' && 'url' in item && 'nombre' in item) {
          extractedLinks.push(item as LinkItem);
        }
      });

      extractedLinks.sort((a, b) => (a.order || 0) - (b.order || 0));

      if (extractedLinks.length === 0) return null;

      return (
        <div key={subKey} className="mb-3.5">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            {title}
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {extractedLinks.map((link, idx) => (
              <button
                key={idx}
                onClick={() => window.open(link.url, '_blank')}
                className="group flex items-center justify-between p-2 rounded-lg bg-slate-800/80 hover:bg-blue-600/20 border border-slate-700/60 hover:border-blue-500/40 text-slate-200 hover:text-white transition-all text-xs font-medium text-left shadow-sm"
              >
                <span className="truncate mr-1">{link.nombre}</span>
                <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-blue-400 shrink-0 transition-colors" />
              </button>
            ))}
          </div>
        </div>
      );
    });
  };

  if (!links) return <div className="text-xs text-slate-400 py-4 text-center">Cargando enlaces...</div>;

  return (
    <div className="space-y-4">
      {/* Selector de Régimen */}
      <div className="flex items-center justify-between bg-slate-800/60 p-2 rounded-xl border border-slate-700/50">
        <div className="flex items-center space-x-2 pl-1">
          <Layers className="w-4 h-4 text-blue-400" />
          <span className="text-xs font-semibold text-slate-300">Régimen:</span>
        </div>
        <div className="flex space-x-1 bg-slate-900/80 p-1 rounded-lg border border-slate-700/60">
          <button
            onClick={() => handleRegimeChange('fisica')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
              regime === 'fisica'
                ? 'bg-blue-600 text-white shadow-sm font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Persona Física
          </button>
          <button
            onClick={() => handleRegimeChange('moral')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
              regime === 'moral'
                ? 'bg-blue-600 text-white shadow-sm font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Persona Moral
          </button>
        </div>
      </div>

      {/* Servicios Clave General */}
      {links.general && renderSection(links.general)}

      {/* Sección Dinámica (Física / Moral) */}
      {links[regime] && renderSection(links[regime])}

      {/* Certificados (Desplegable) */}
      {links.certificados && (
        <div className="border border-slate-700/50 rounded-xl bg-slate-800/40 overflow-hidden">
          <button
            onClick={() => setIsCertificadosOpen(!isCertificadosOpen)}
            className="w-full flex items-center justify-between p-3 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/80 transition-all"
          >
            <span>Gestión de Certificados</span>
            {isCertificadosOpen ? (
              <ChevronUp className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {isCertificadosOpen && (
            <div className="p-3 pt-0 border-t border-slate-700/40">
              {renderSection(links.certificados)}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
