import React, { useState } from "react";
import { Bookmark, Search, Trash2, Calendar, ClipboardList, Check } from "lucide-react";
import { CampaignPreset } from "../types";

interface PresetSelectorProps {
  presets: CampaignPreset[];
  onSelectPreset: (preset: CampaignPreset) => void;
  onSavePreset: (name: string) => void;
  onDeletePreset: (id: string) => void;
  currentPresetId?: string;
}

export default function PresetSelector({
  presets,
  onSelectPreset,
  onSavePreset,
  onDeletePreset,
  currentPresetId,
}: PresetSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [newPresetName, setNewPresetName] = useState("");
  const [isSavedSuccessfully, setIsSavedSuccessfully] = useState(false);

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
          Saved Presets (Quick Access)
        </h3>
        <p className="text-[11px] text-slate-400">Save and reload complete campaign form configurations</p>
      </div>

      {/* Save Current State Form */}
      <form onSubmit={handleSave} className="flex gap-1.5">
        <input
          type="text"
          placeholder="Save current setup as preset..."
          required
          value={newPresetName}
          onChange={(e) => setNewPresetName(e.target.value)}
          className="flex-1 text-xs px-2.5 py-1.5 border border-slate-200/80 bg-white rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-400 transition-all"
        />
        <button
          type="submit"
          className="px-3 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg shrink-0 transition-colors flex items-center gap-1"
        >
          {isSavedSuccessfully ? (
            <>
              <Check className="w-3.5 h-3.5" />
              Saved
            </>
          ) : (
            "Save"
          )}
        </button>
      </form>

      {/* Search presets */}
      <div className="relative">
        <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
          <Search className="w-3.5 h-3.5" />
        </span>
        <input
          type="text"
          placeholder="Search saved presets..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full text-xs pl-8 pr-3 py-1.5 border border-slate-200/80 bg-slate-50/50 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-400 focus:bg-white transition-all"
        />
      </div>

      {/* Presets List */}
      <div className="space-y-1.5 max-h-[180px] overflow-y-auto pr-1">
        {filteredPresets.length > 0 ? (
          filteredPresets.map((preset) => {
            const isActive = currentPresetId === preset.id;
            return (
              <div
                key={preset.id}
                onClick={() => onSelectPreset(preset)}
                className={`group flex items-center justify-between p-2.5 border rounded-lg cursor-pointer transition-all ${
                  isActive
                    ? "border-slate-800 bg-slate-900 text-white"
                    : "border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50 text-slate-700"
                }`}
              >
                <div className="min-w-0 flex-1 pr-2">
                  <div className="font-medium text-xs truncate">{preset.name}</div>
                  <div
                    className={`text-[9px] truncate flex items-center gap-1 mt-0.5 ${
                      isActive ? "text-slate-300" : "text-slate-400"
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
                    className={`text-[9px] px-1.5 py-0.5 rounded ${
                      isActive
                        ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                        : "bg-slate-50 text-slate-400 group-hover:bg-slate-100"
                    }`}
                  >
                    {isActive ? "Active" : "Load"}
                  </span>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeletePreset(preset.id);
                    }}
                    className={`p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity ${
                      isActive
                        ? "text-slate-400 hover:text-red-400 hover:bg-slate-800"
                        : "text-slate-400 hover:text-red-600 hover:bg-red-50"
                    }`}
                    title="Delete Preset"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-6 text-center text-xs text-slate-400 border border-dashed border-slate-100 rounded-lg flex flex-col items-center justify-center gap-1.5">
            <ClipboardList className="w-5 h-5 text-slate-300" />
            <span>No saved presets found</span>
          </div>
        )}
      </div>
    </div>
  );
}
