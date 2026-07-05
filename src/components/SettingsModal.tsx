import React, { useState } from "react";
import { X, ShieldCheck, ExternalLink, Settings, Check } from "lucide-react";
import { ShortenerSettings } from "../types";
import { translations, Language } from "../translations";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ShortenerSettings;
  onSave: (settings: ShortenerSettings) => void;
  lang?: string;
}

export default function SettingsModal({
  isOpen,
  onClose,
  settings,
  onSave,
  lang = "en",
}: SettingsModalProps) {
  const [localSettings, setLocalSettings] = useState<ShortenerSettings>({ ...settings });
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen) return null;

  const t = translations[lang as Language] || translations.en;
  const isRtl = lang === "he";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fade-in">
      <div className="relative w-full max-w-xl bg-white rounded-[8px] shadow-xl border border-[#e2e8f0] flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b border-[#e2e8f0] ${isRtl ? "flex-row-reverse" : ""}`}>
          <div className={`flex items-center gap-2.5 ${isRtl ? "flex-row-reverse" : ""}`}>
            <div className="p-2 bg-slate-50 text-slate-700 rounded-[4px]">
              <Settings className="w-5 h-5" />
            </div>
            <div className={isRtl ? "text-right" : "text-left"}>
              <h3 className="text-lg font-bold text-[#191c1e] font-display">{t.apiSettingsTitle}</h3>
              <p className="text-xs text-[#64748B] font-sans">{t.apiSettingsSubtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#64748B] hover:text-[#191c1e] hover:bg-slate-50 rounded-[4px] transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className={`bg-amber-50/40 border border-amber-100 rounded-[8px] p-3.5 flex gap-3 text-xs text-amber-800 ${isRtl ? "flex-row-reverse text-right" : "text-left"}`}>
            <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="font-sans">
              <span className="font-bold">{t.securityPolicyTitle}</span> {t.securityPolicyDesc}
            </div>
          </div>

          {/* Bitly config */}
          <div className="space-y-3 pb-5 border-b border-[#e2e8f0]">
            <div className={`flex items-center justify-between ${isRtl ? "flex-row-reverse" : ""}`}>
              <span className={`text-sm font-bold text-[#191c1e] flex items-center gap-2 font-display ${isRtl ? "flex-row-reverse" : ""}`}>
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
                {t.bitlyTitle}
              </span>
              <a
                href="https://app.bitly.com/settings/api"
                target="_blank"
                rel="noreferrer"
                className={`text-xs text-[#3B82F6] hover:text-blue-600 flex items-center gap-1 hover:underline cursor-pointer font-sans ${isRtl ? "flex-row-reverse" : ""}`}
              >
                {t.getBitlyToken} <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className={isRtl ? "text-right" : "text-left"}>
                <label className="block text-xs font-semibold text-[#64748B] mb-1 font-sans">{t.accessTokenLabel}</label>
                <input
                  type="password"
                  placeholder="e.g. 4a87c10b..."
                  value={localSettings.bitlyToken}
                  onChange={(e) => setLocalSettings({ ...localSettings, bitlyToken: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-slate-300 bg-slate-50/70 focus:bg-white focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 text-slate-900 rounded-[4px] focus:outline-none transition-all font-mono"
                />
              </div>
              <div className={isRtl ? "text-right" : "text-left"}>
                <label className="block text-xs font-semibold text-[#64748B] mb-1 font-sans">{t.customDomainLabel}</label>
                <input
                  type="text"
                  placeholder="e.g. bit.ly"
                  value={localSettings.bitlyDomain}
                  onChange={(e) => setLocalSettings({ ...localSettings, bitlyDomain: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-slate-300 bg-slate-50/70 focus:bg-white focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 text-slate-900 rounded-[4px] focus:outline-none transition-all font-mono"
                />
              </div>
            </div>
          </div>

          {/* Rebrandly config */}
          <div className="space-y-3 pb-5 border-b border-[#e2e8f0]">
            <div className={`flex items-center justify-between ${isRtl ? "flex-row-reverse" : ""}`}>
              <span className={`text-sm font-bold text-[#191c1e] flex items-center gap-2 font-display ${isRtl ? "flex-row-reverse" : ""}`}>
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                {t.rebrandlyTitle}
              </span>
              <a
                href="https://app.rebrandly.com/settings/api-keys"
                target="_blank"
                rel="noreferrer"
                className={`text-xs text-[#3B82F6] hover:text-blue-600 flex items-center gap-1 hover:underline cursor-pointer font-sans ${isRtl ? "flex-row-reverse" : ""}`}
              >
                {t.getRebrandlyKey} <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className={isRtl ? "text-right" : "text-left"}>
                <label className="block text-xs font-semibold text-[#64748B] mb-1 font-sans">{t.apiKeyLabel}</label>
                <input
                  type="password"
                  placeholder="e.g. ab89d2df..."
                  value={localSettings.rebrandlyKey}
                  onChange={(e) => setLocalSettings({ ...localSettings, rebrandlyKey: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-slate-300 bg-slate-50/70 focus:bg-white focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 text-slate-900 rounded-[4px] focus:outline-none transition-all font-mono"
                />
              </div>
              <div className={isRtl ? "text-right" : "text-left"}>
                <label className="block text-xs font-semibold text-[#64748B] mb-1 font-sans">{t.customDomainLabel}</label>
                <input
                  type="text"
                  placeholder="e.g. rebrand.ly"
                  value={localSettings.rebrandlyDomain}
                  onChange={(e) => setLocalSettings({ ...localSettings, rebrandlyDomain: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-slate-300 bg-slate-50/70 focus:bg-white focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 text-slate-900 rounded-[4px] focus:outline-none transition-all font-mono"
                />
              </div>
            </div>
          </div>

          {/* DUB.co Config */}
          <div className="space-y-3 pb-5 border-b border-[#e2e8f0]">
            <div className={`flex items-center justify-between ${isRtl ? "flex-row-reverse" : ""}`}>
              <span className={`text-sm font-bold text-[#191c1e] flex items-center gap-2 font-display ${isRtl ? "flex-row-reverse" : ""}`}>
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
                {t.dubTitle}
              </span>
              <a
                href="https://app.dub.co/settings/tokens"
                target="_blank"
                rel="noreferrer"
                className={`text-xs text-[#3B82F6] hover:text-blue-600 flex items-center gap-1 hover:underline cursor-pointer font-sans ${isRtl ? "flex-row-reverse" : ""}`}
              >
                {t.getDubToken} <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className={isRtl ? "text-right" : "text-left"}>
                <label className="block text-xs font-semibold text-[#64748B] mb-1 font-sans">{t.apiTokenLabel}</label>
                <input
                  type="password"
                  placeholder="e.g. dub_api_..."
                  value={localSettings.dubToken || ""}
                  onChange={(e) => setLocalSettings({ ...localSettings, dubToken: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-slate-300 bg-slate-50/70 focus:bg-white focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 text-slate-900 rounded-[4px] focus:outline-none transition-all font-mono"
                />
              </div>
              <div className={isRtl ? "text-right" : "text-left"}>
                <label className="block text-xs font-semibold text-[#64748B] mb-1 font-sans">{t.customDomainLabel}</label>
                <input
                  type="text"
                  placeholder="e.g. dub.sh"
                  value={localSettings.dubDomain || ""}
                  onChange={(e) => setLocalSettings({ ...localSettings, dubDomain: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-slate-300 bg-slate-50/70 focus:bg-white focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 text-slate-900 rounded-[4px] focus:outline-none transition-all font-mono"
                />
              </div>
            </div>
          </div>

          {/* TinyURL config */}
          <div className="space-y-3">
            <div className={`flex items-center justify-between ${isRtl ? "flex-row-reverse" : ""}`}>
              <span className={`text-sm font-bold text-[#191c1e] flex items-center gap-2 font-display ${isRtl ? "flex-row-reverse" : ""}`}>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                {t.tinyurlTitle}
              </span>
              <a
                href="https://tinyurl.com/app/settings/api"
                target="_blank"
                rel="noreferrer"
                className={`text-xs text-[#3B82F6] hover:text-blue-600 flex items-center gap-1 hover:underline cursor-pointer font-sans ${isRtl ? "flex-row-reverse" : ""}`}
              >
                {t.getTinyurlToken} <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <p className={`text-[11px] text-[#64748B] font-sans ${isRtl ? "text-right" : "text-left"}`}>
              {t.tinyurlFallbackNote}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className={isRtl ? "text-right" : "text-left"}>
                <label className="block text-xs font-semibold text-[#64748B] mb-1 font-sans">{t.apiTokenLabel} ({lang === "he" ? "אופציונלי" : lang === "ru" ? "опционально" : "Optional"})</label>
                <input
                  type="password"
                  placeholder="e.g. d68a3fb..."
                  value={localSettings.tinyurlToken}
                  onChange={(e) => setLocalSettings({ ...localSettings, tinyurlToken: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-slate-300 bg-slate-50/70 focus:bg-white focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 text-slate-900 rounded-[4px] focus:outline-none transition-all font-mono"
                />
              </div>
              <div className={isRtl ? "text-right" : "text-left"}>
                <label className="block text-xs font-semibold text-[#64748B] mb-1 font-sans">{t.brandedDomainLabel}</label>
                <input
                  type="text"
                  placeholder="e.g. tinyurl.com"
                  value={localSettings.tinyurlDomain}
                  onChange={(e) => setLocalSettings({ ...localSettings, tinyurlDomain: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-slate-300 bg-slate-50/70 focus:bg-white focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 text-slate-900 rounded-[4px] focus:outline-none transition-all font-mono"
                />
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className={`flex items-center justify-end px-6 py-4 border-t border-[#e2e8f0] bg-slate-50/70 rounded-b-[8px] gap-3 ${isRtl ? "flex-row-reverse" : ""}`}>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-[#64748B] hover:text-[#191c1e] transition-colors cursor-pointer font-sans"
          >
            {t.cancel}
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSaved}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#191c1e] text-white hover:bg-black disabled:bg-emerald-600 text-xs font-semibold rounded-[4px] shadow-sm transition-all cursor-pointer font-sans"
          >
            {isSaved ? (
              <>
                <Check className="w-3.5 h-3.5 text-white" />
                {t.settingsSavedBtn}
              </>
            ) : (
              <>
                {t.saveConfigBtn}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
