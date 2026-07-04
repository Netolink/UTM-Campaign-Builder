import React, { useState } from "react";
import { X, ShieldCheck, Key, HelpCircle, ExternalLink, Settings, Check } from "lucide-react";
import { ShortenerSettings } from "../types";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ShortenerSettings;
  onSave: (settings: ShortenerSettings) => void;
}

export default function SettingsModal({ isOpen, onClose, settings, onSave }: SettingsModalProps) {
  const [localSettings, setLocalSettings] = useState<ShortenerSettings>({ ...settings });
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(localSettings);
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-xl border border-slate-100 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-slate-50 text-slate-700 rounded-xl">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 font-display">API Integration Settings</h3>
              <p className="text-xs text-slate-400">Configure link shorteners with your own API credentials</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="bg-amber-50/60 border border-amber-100 rounded-xl p-3.5 flex gap-3 text-xs text-amber-800">
            <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Security Policy:</span> Credentials entered here are saved 100% locally in your own browser's <code className="bg-amber-100/60 px-1 py-0.5 rounded text-amber-950 font-mono">localStorage</code>. They never touch third-party databases and are proxied securely to prevent client-side credential leaking.
            </div>
          </div>

          {/* Bitly config */}
          <div className="space-y-3 pb-5 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
                Bitly Configuration
              </span>
              <a
                href="https://bitly.com/a/oauth_apps"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-blue-500 hover:text-blue-600 flex items-center gap-1 hover:underline"
              >
                Get Bitly Token <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Access Token</label>
                <input
                  type="password"
                  placeholder="e.g. 4a87c10b..."
                  value={localSettings.bitlyToken}
                  onChange={(e) => setLocalSettings({ ...localSettings, bitlyToken: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-slate-200 bg-slate-50 focus:bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Custom Domain (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. bit.ly"
                  value={localSettings.bitlyDomain}
                  onChange={(e) => setLocalSettings({ ...localSettings, bitlyDomain: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-slate-200 bg-slate-50 focus:bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-mono"
                />
              </div>
            </div>
          </div>

          {/* Rebrandly config */}
          <div className="space-y-3 pb-5 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                Rebrandly Configuration
              </span>
              <a
                href="https://app.rebrandly.com/settings/api-keys"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-blue-500 hover:text-blue-600 flex items-center gap-1 hover:underline"
              >
                Get Rebrandly Key <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">API Key</label>
                <input
                  type="password"
                  placeholder="e.g. ab89d2df..."
                  value={localSettings.rebrandlyKey}
                  onChange={(e) => setLocalSettings({ ...localSettings, rebrandlyKey: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-slate-200 bg-slate-50 focus:bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Custom Domain (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. rebrand.ly"
                  value={localSettings.rebrandlyDomain}
                  onChange={(e) => setLocalSettings({ ...localSettings, rebrandlyDomain: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-slate-200 bg-slate-50 focus:bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-mono"
                />
              </div>
            </div>
          </div>

          {/* DUB.co Config */}
          <div className="space-y-3 pb-5 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
                DUB.co Configuration
              </span>
              <a
                href="https://app.dub.co/settings/tokens"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-blue-500 hover:text-blue-600 flex items-center gap-1 hover:underline"
              >
                Get DUB API Token <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">API Token</label>
                <input
                  type="password"
                  placeholder="e.g. dub_api_..."
                  value={localSettings.dubToken || ""}
                  onChange={(e) => setLocalSettings({ ...localSettings, dubToken: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-slate-200 bg-slate-50 focus:bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Custom Domain (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. dub.sh"
                  value={localSettings.dubDomain || ""}
                  onChange={(e) => setLocalSettings({ ...localSettings, dubDomain: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-slate-200 bg-slate-50 focus:bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-mono"
                />
              </div>
            </div>
          </div>

          {/* TinyURL config */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                TinyURL Configuration
              </span>
              <a
                href="https://tinyurl.com/app/settings/api"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-blue-500 hover:text-blue-600 flex items-center gap-1 hover:underline"
              >
                Get TinyURL Token <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <p className="text-[11px] text-slate-400">
              * Note: If TinyURL Token is left empty, the application will automatically fallback to TinyURL's free anonymous API for shortening!
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">API Token (Optional)</label>
                <input
                  type="password"
                  placeholder="e.g. d68a3fb..."
                  value={localSettings.tinyurlToken}
                  onChange={(e) => setLocalSettings({ ...localSettings, tinyurlToken: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-slate-200 bg-slate-50 focus:bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Branded Domain (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. tinyurl.com"
                  value={localSettings.tinyurlDomain}
                  onChange={(e) => setLocalSettings({ ...localSettings, tinyurlDomain: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-slate-200 bg-slate-50 focus:bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-mono"
                />
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-4 border-t border-slate-100 bg-slate-50/70 rounded-b-2xl gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSaved}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white hover:bg-slate-800 disabled:bg-emerald-600 text-xs font-medium rounded-lg shadow-sm transition-all"
          >
            {isSaved ? (
              <>
                <Check className="w-3.5 h-3.5 text-white" />
                Settings Saved!
              </>
            ) : (
              <>
                Save Configuration
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
