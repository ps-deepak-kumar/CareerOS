import React, { useState, useEffect } from 'react';
import { WifiOff, X } from 'lucide-react';
import { onOfflineStateChange } from '../services/mcp/resourceMcp';

/**
 * OfflineBanner — Phase 4
 *
 * Non-blocking top banner that appears when any MCP call falls back to mock data.
 * Dismissible per session. Shows helpful message about degraded mode.
 */
export const OfflineBanner: React.FC = () => {
  const [isOffline, setIsOffline] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    onOfflineStateChange((offline) => {
      setIsOffline(offline);
      if (offline) setDismissed(false); // re-show if we go offline again
    });
  }, []);

  if (!isOffline || dismissed) return null;

  return (
    <div
      role="alert"
      aria-live="polite"
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-2.5 text-xs font-sans font-medium"
      style={{
        background: 'linear-gradient(90deg, #f59e0b, #d97706)',
        color: '#1c1917',
      }}
    >
      <div className="flex items-center gap-2">
        <WifiOff size={13} className="shrink-0" />
        <span>
          <strong>⚡ Offline / Demo mode</strong> — Some API data is unavailable. Showing cached data.
          Add your API keys in <code className="bg-amber-800/20 px-1 rounded">.env</code> for live results.
        </span>
      </div>
      <button
        onClick={() => setDismissed(true)}
        aria-label="Dismiss offline banner"
        className="ml-4 p-1 rounded hover:bg-amber-800/20 transition-colors shrink-0"
      >
        <X size={13} />
      </button>
    </div>
  );
};

export default OfflineBanner;
