import React, { useState } from "react";
import { Bookmark, Search, Trash2, Calendar, ClipboardList, Check } from "lucide-react";
import { CampaignPreset } from "../types";
import { translations, Language } from "../translations";

interface PresetSelectorProps {
  presets: CampaignPreset[];
  onSelectPreset: (preset: CampaignPreset) => void;
  onSavePreset: (name: string) => void;
  onDeletePreset: (id: string) => void;
  currentPresetId?: string;
  lang?: Language;
}

export default function PresetSelector({
  presets,
  onSelectPreset,
  onSavePreset,
  onDeletePreset,
  currentPresetId,
  lang = "en",
}: PresetSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [newPresetName, setNewPresetName] = useState("");
  const [isSavedSuccessfully, setIsSavedSuccessfully] = useState(false);

  const t = translations[lang];

  const filteredPresets = presets.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPresetName.trim()) return;
    onSavePreset(newPresetName.trim());
    setNewPresetName("");
    setIsSavedSuccessfully(true);
    setTimeout(() => {
      setIsSavedSuccessfully(false);
    }, 2000);
  };

  return (
    <div className="space-y-4">
      {/* Save Preset Header */}
      <div>
        <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-1.5 font-display">
          <Bookmark className="w-4 h-4 text-slate-500" />
          {t.presetTitle}
        </h3>
        <p className="text-[11px] text-slate-400">{t.presetDesc}</p>
      </div>

      {/* Save Current State Form */}
      <form onSubmit={handleSave} className="flex gap-2">
        <input
          type="text"
          placeholder={t.presetInputPlaceholder}
          required
          value={newPresetName}
          onChange={(e) => setNewPresetName(e.target.value)}
          className="flex-1 text-xs px-2.5 py-1.5 border border-slate-300 bg-slate-50/70 focus:bg-white focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 text-slate-900 rounded-[4px] focus:outline-none transition-all font-sans"
        />
        <button
          type="submit"
          className="px-3 py-1.5 text-xs font-semibold text-white bg-[#191c1e] hover:bg-black rounded-[4px] shrink-0 transition-colors flex items-center gap-1 cursor-pointer"
        >
          {isSavedSuccessfully ? (
            <>
              <Check className="w-3.5 h-3.5" />
              {t.presetSavedBtn}
            </>
          ) : (
            t.presetSaveBtn
          )}
        </button>
      </form>

      {/* Search presets */}
      <div className="relative">
        <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-[#64748B]">
          <Search className="w-3.5 h-3.5" />
        </span>
        <input
          type="text"
          placeholder={t.presetSearchPlaceholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full text-xs pl-8 pr-3 py-1.5 border border-slate-300 bg-slate-50/70 focus:bg-white focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 text-slate-900 rounded-[4px] focus:outline-none transition-all font-sans"
        />
      </div>

      {/* Presets List */}
      <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
        {filteredPresets.length > 0 ? (
          filteredPresets.map((preset) => {
            const isActive = currentPresetId === preset.id;
            return (
              <div
                key={preset.id}
                onClick={() => onSelectPreset(preset)}
                className={`group flex items-center justify-between p-2.5 border rounded-[4px] cursor-pointer transition-all ${
                  isActive
                    ? "border-[#191c1e] bg-[#191c1e] text-white"
                    : "border-[#e2e8f0] bg-white hover:border-[#3B82F6] hover:shadow-[0_8px_30px_rgba(59,130,246,0.08)] text-slate-700"
                }`}
              >
                <div className="min-w-0 flex-1 pr-2">
                  <div className="font-semibold text-xs truncate font-sans">{preset.name}</div>
                  <div
                    className={`text-[9px] truncate flex items-center gap-1 mt-0.5 ${
                      isActive ? "text-slate-300" : "text-[#64748B]"
                    }`}
                  >
                    <Calendar className="w-2.5 h-2.5" />
                    {new Date(preset.createdAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {/* Load Badge/Status Indicator */}
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded-[4px] font-semibold ${
                      isActive
                        ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                        : "bg-slate-50 text-[#64748B] group-hover:bg-slate-100"
                    }`}
                  >
                    {isActive ? t.presetActiveBadge : t.presetLoadBadge}
                  </span>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeletePreset(preset.id);
                    }}
                    className={`p-1 rounded-[4px] opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer ${
                      isActive
                        ? "text-slate-400 hover:text-red-400 hover:bg-slate-800"
                        : "text-slate-400 hover:text-red-600 hover:bg-red-50"
                    }`}
                    title={t.presetDeleteTooltip}
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-6 text-center text-xs text-[#64748B] border border-dashed border-[#e2e8f0] rounded-[4px] flex flex-col items-center justify-center gap-1.5 bg-white font-sans">
            <ClipboardList className="w-5 h-5 text-slate-300" />
            <span>{t.presetNoPresets}</span>
          </div>
        )}
      </div>
    </div>
  );
}
