import React, { useState } from "react";
import { X, Scale, ShieldCheck, Cookie, Accessibility } from "lucide-react";
import { legalTexts } from "../legalTexts";

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: "en" | "he" | "ru";
}

export const LegalModal: React.FC<LegalModalProps> = ({ isOpen, onClose, lang }) => {
  const [activeTab, setActiveTab] = useState<"terms" | "privacy" | "cookies" | "accessibility">("terms");

  if (!isOpen) return null;

  const text = legalTexts[lang] || legalTexts.en;
  const isRtl = lang === "he";

  const getIcon = (tab: string) => {
    switch (tab) {
      case "terms":
        return <Scale className="w-4 h-4" />;
      case "privacy":
        return <ShieldCheck className="w-4 h-4" />;
      case "cookies":
        return <Cookie className="w-4 h-4" />;
      case "accessibility":
        return <Accessibility className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const currentSections = text.sections[activeTab];

  return (
    <div
      id="legal-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        id="legal-modal-container"
        className="relative w-full max-w-2xl bg-white rounded-[8px] shadow-2xl border border-slate-200 flex flex-col max-h-[85vh] animate-scale-up"
        onClick={(e) => e.stopPropagation()}
        dir={isRtl ? "rtl" : "ltr"}
      >
        {/* Header */}
        <div id="legal-modal-header" className="flex items-center justify-between border-b border-slate-100 p-5 shrink-0">
          <div className={`flex items-center gap-2.5 ${isRtl ? "flex-row-reverse" : "flex-row"}`}>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-[4px]">
              {getIcon(activeTab)}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 font-display">
                {text.title}
              </h2>
              <p className="text-[10px] text-slate-400 font-sans">
                {isRtl ? "מסמכים רשמיים, תנאים והצהרות נגישות" : "Official terms, privacy, cookie regulations & accessibility"}
              </p>
            </div>
          </div>
          <button
            id="legal-modal-close-icon-btn"
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-[4px] transition-all cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Tab Selection Row */}
        <div id="legal-modal-tabs" className="bg-slate-50 border-b border-slate-100 px-5 py-2 shrink-0 flex gap-1 overflow-x-auto no-scrollbar scroll-smooth">
          {(["terms", "privacy", "cookies", "accessibility"] as const).map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                id={`legal-tab-btn-${tab}`}
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`py-1.5 px-3 rounded-[4px] text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  isActive
                    ? "bg-white text-slate-900 shadow-xs border border-slate-200/60"
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-200/50"
                }`}
              >
                {getIcon(tab)}
                <span>{text.tabs[tab]}</span>
              </button>
            );
          })}
        </div>

        {/* Content Panel */}
        <div
          id="legal-modal-content-panel"
          className="p-6 overflow-y-auto flex-1 space-y-5 font-sans scroll-smooth"
        >
          {currentSections.map((section, idx) => (
            <div id={`legal-section-${activeTab}-${idx}`} key={idx} className="space-y-2">
              <h3 className={`text-xs font-bold text-slate-900 uppercase tracking-wider ${isRtl ? "text-right" : "text-left"}`}>
                {section.title}
              </h3>
              <div className="space-y-1.5">
                {section.content.map((p, pIdx) => (
                  <p
                    key={pIdx}
                    className={`text-xs text-slate-600 leading-relaxed ${isRtl ? "text-right" : "text-left"}`}
                  >
                    {p}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer actions */}
        <div id="legal-modal-footer" className="bg-slate-50 border-t border-slate-100 p-4 shrink-0 flex justify-end">
          <button
            id="legal-modal-close-action-btn"
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-[4px] shadow-xs transition-colors cursor-pointer"
          >
            {text.closeBtn}
          </button>
        </div>
      </div>
    </div>
  );
};
