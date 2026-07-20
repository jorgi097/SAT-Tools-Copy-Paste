import React, { useEffect, useState } from 'react';
import { Header } from './components/Header';
import { QuickLinks } from './components/QuickLinks';
import { BackupRestore } from './components/BackupRestore';
import type { ExtensionMessage, StateResponse } from '../types/extension';

export const App: React.FC = () => {
  const [enabled, setEnabled] = useState<boolean>(true);

  useEffect(() => {
    // Solicitar estado al background service worker
    chrome.runtime.sendMessage<ExtensionMessage, StateResponse>(
      { action: 'getState' },
      (response) => {
        if (response && response.enabled !== undefined) {
          setEnabled(response.enabled);
        }
      }
    );
  }, []);

  const handleToggle = (newStatus: boolean) => {
    setEnabled(newStatus);
    chrome.runtime.sendMessage<ExtensionMessage>({
      action: 'setState',
      enabled: newStatus,
    });

    const taxDeclarationRegex = new RegExp('https://pstcdypisr\\.clouda\\.sat\\.gob\\.mx/.*');

    chrome.tabs.query({ active: true, currentWindow: true }, ([activeTab]) => {
      if (activeTab?.id && activeTab.url) {
        if (
          activeTab.url === 'https://portal.facturaelectronica.sat.gob.mx/Factura/GeneraFactura' ||
          taxDeclarationRegex.test(activeTab.url)
        ) {
          chrome.scripting.executeScript({
            target: { tabId: activeTab.id },
            func: () => location.reload(),
          });
        }
      }
    });
  };

  return (
    <div className="flex flex-col space-y-4">
      <Header enabled={enabled} onToggle={handleToggle} />
      <QuickLinks />
      <BackupRestore />
    </div>
  );
};

export default App;
