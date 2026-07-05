import React, { useState } from "react";
import { Search, Plus, Trash2, Tag, Copy, Sparkles, FolderHeart } from "lucide-react";
import { UTMTemplate } from "../types";
import { BUILT_IN_TEMPLATES } from "../constants";
import { translations, Language } from "../translations";

interface TemplateManagerProps {
  customTemplates: UTMTemplate[];
  onSelectTemplate: (template: UTMTemplate) => void;
  onSaveCurrentAsTemplate: (name: string, description: string) => void;
  onDeleteCustomTemplate: (id: string) => void;
  currentActiveId?: string;
  lang?: Language;
}

export default function TemplateManager({
  customTemplates,
  onSelectTemplate,
  onSaveCurrentAsTemplate,
  onDeleteCustomTemplate,
  currentActiveId,
  lang = "en",
}: TemplateManagerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState("");
  const [newTemplateDesc, setNewTemplateDesc] = useState("");

  const t = translations[lang];

  const allTemplates = [...BUILT_IN_TEMPLATES, ...customTemplates];
  const filteredTemplates = allTemplates.filter(
    (tpl) =>
      tpl.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (tpl.description && tpl.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTemplateName.trim()) return;
    onSaveCurrentAsTemplate(newTemplateName, newTemplateDesc);
    setNewTemplateName("");
    setNewTemplateDesc("");
    setShowSaveForm(false);
  };

  return (
    <div className="space-y-4">
      {/* Header & Save Custom */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div>
          <h3 className="text-sm font-bold text-[#191c1e] flex items-center gap-1.5 font-display">
            <Tag className="w-4 h-4 text-slate-500" />
            {t.tplTitle}
          </h3>
          <p className="text-[11px] text-[#64748B] font-sans">{t.tplDesc}</p>
        </div>
        <button
          type="button"
          onClick={() => setShowSaveForm(!showSaveForm)}
          className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold bg-[#e2e8f0] hover:bg-slate-200 text-slate-800 rounded-[4px] transition-all shrink-0 self-start sm:self-auto cursor-pointer font-sans"
        >
          <Plus className="w-3.5 h-3.5" />
          {t.tplSaveCurrentBtn}
        </button>
      </div>

      {/* Save Template Form inline overlay */}
      {showSaveForm && (
        <form
          onSubmit={handleSave}
          className="p-3.5 border border-[#3B82F6]/20 bg-blue-50/20 rounded-[8px] space-y-3 animate-fade-in"
        >
          <div className="flex justify-between items-center">
            <h4 className="text-xs font-bold text-[#3B82F6] flex items-center gap-1 font-display">
              <Sparkles className="w-3.5 h-3.5 text-[#3B82F6]" />
              {t.tplSaveAsCustomTitle}
            </h4>
            <button
              type="button"
              onClick={() => setShowSaveForm(false)}
              className="text-[10px] text-[#64748B] hover:text-[#191c1e] cursor-pointer"
            >
              {lang === "he" ? "ביטול" : lang === "ru" ? "Отмена" : "Cancel"}
            </button>
          </div>
          <div className="grid grid-cols-1 gap-2.5">
            <div>
              <label className="block text-[10px] font-semibold text-[#64748B] mb-0.5 uppercase tracking-wider font-sans">{t.tplNameLabel}</label>
              <input
                type="text"
                placeholder={lang === "he" ? "לדוגמה: קמפיין שותפים רבעוני" : lang === "ru" ? "например: Партнерская кампания Q3" : "e.g. Q3 Affiliate Campaign"}
                required
                value={newTemplateName}
                onChange={(e) => setNewTemplateName(e.target.value)}
                className="w-full text-xs px-2.5 py-1.5 border border-slate-300 bg-slate-50/70 focus:bg-white focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 text-slate-900 rounded-[4px] focus:outline-none font-sans"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-[#64748B] mb-0.5 uppercase tracking-wider font-sans">{t.tplDescLabel}</label>
              <input
                type="text"
                placeholder={lang === "he" ? "תיאור קצר למעקב..." : lang === "ru" ? "Краткое описание..." : "Brief tracking description..."}
                value={newTemplateDesc}
                onChange={(e) => setNewTemplateDesc(e.target.value)}
                className="w-full text-xs px-2.5 py-1.5 border border-slate-300 bg-slate-50/70 focus:bg-white focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 text-slate-900 rounded-[4px] focus:outline-none font-sans"
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full py-1.5 text-xs font-semibold text-white bg-[#3B82F6] hover:bg-blue-600 rounded-[4px] transition-colors cursor-pointer"
          >
            {t.tplCreateBtn}
          </button>
        </form>
      )}

      {/* Search Input */}
      <div className="relative">
        <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-[#64748B]">
          <Search className="w-3.5 h-3.5" />
        </span>
        <input
          type="text"
          placeholder={t.tplSearchPlaceholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full text-xs pl-8 pr-3 py-1.5 border border-slate-300 bg-slate-50/70 focus:bg-white focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 text-slate-900 rounded-[4px] focus:outline-none transition-all font-sans"
        />
      </div>

      {/* Templates List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[220px] overflow-y-auto pr-1">
        {filteredTemplates.length > 0 ? (
          filteredTemplates.map((tpl) => {
            const isActive = currentActiveId === tpl.id;
            return (
              <div
                key={tpl.id}
                onClick={() => onSelectTemplate(tpl)}
                className={`group relative text-left p-3 border rounded-[4px] cursor-pointer transition-all ${
                  isActive
                    ? "border-[#191c1e] bg-[#191c1e] text-white shadow-sm"
                    : "border-[#e2e8f0] bg-white hover:border-[#3B82F6] hover:shadow-[0_8px_30px_rgba(59,130,246,0.08)] text-slate-700"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="font-bold text-xs truncate max-w-[80%] font-sans">
                    {tpl.name}
                  </div>
                  {tpl.isBuiltIn ? (
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded-[4px] font-semibold uppercase tracking-wider ${
                        isActive ? "bg-slate-800 text-slate-300" : "bg-slate-50 text-[#64748B]"
                      }`}
                    >
                      {t.tplOfficialBadge}
                    </span>
                  ) : (
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded-[4px] font-semibold uppercase tracking-wider flex items-center gap-0.5 ${
                        isActive ? "bg-blue-900 text-blue-200" : "bg-blue-50 text-[#3B82F6]"
                      }`}
                    >
                      <FolderHeart className="w-2.5 h-2.5" />
                      {t.tplCustomBadge}
                    </span>
                  )}
                </div>

                <p
                  className={`text-[10px] mt-1 line-clamp-2 ${
                    isActive ? "text-slate-300" : "text-[#64748B]"
                  }`}
                >
                  {tpl.description || t.tplDefaultDesc}
                </p>

                {/* Badges preview */}
                <div className="flex flex-wrap gap-1 mt-2">
                  {tpl.utmSource && (
                    <span className={`text-[8px] font-mono px-1 rounded-[4px] ${isActive ? 'bg-slate-800 text-slate-200' : 'bg-slate-50 text-[#64748B]'}`}>
                      src:{tpl.utmSource}
                    </span>
                  )}
                  {tpl.utmMedium && (
                    <span className={`text-[8px] font-mono px-1 rounded-[4px] ${isActive ? 'bg-slate-800 text-slate-200' : 'bg-slate-50 text-[#64748B]'}`}>
                      med:{tpl.utmMedium}
                    </span>
                  )}
                </div>

                {/* Delete button for custom templates */}
                {!tpl.isBuiltIn && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteCustomTemplate(tpl.id);
                    }}
                    className="absolute bottom-2.5 right-2.5 opacity-0 group-hover:opacity-100 p-1 rounded-[4px] hover:bg-red-50 text-slate-400 hover:text-red-600 transition-all cursor-pointer"
                    title={t.tplDeleteTooltip}
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          })
        ) : (
          <div className="col-span-2 py-6 text-center text-xs text-[#64748B] border border-dashed border-[#e2e8f0] rounded-[8px] bg-white font-sans">
            {t.tplNoMatches.replace("{query}", searchQuery)}
          </div>
        )}
      </div>
    </div>
  );
}
