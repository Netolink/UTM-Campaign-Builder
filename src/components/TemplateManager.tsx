import React, { useState } from "react";
import { Search, Plus, Trash2, Tag, Copy, Sparkles, FolderHeart } from "lucide-react";
import { UTMTemplate } from "../types";
import { BUILT_IN_TEMPLATES } from "../constants";

interface TemplateManagerProps {
  customTemplates: UTMTemplate[];
  onSelectTemplate: (template: UTMTemplate) => void;
  onSaveCurrentAsTemplate: (name: string, description: string) => void;
  onDeleteCustomTemplate: (id: string) => void;
  currentActiveId?: string;
}

export default function TemplateManager({
  customTemplates,
  onSelectTemplate,
  onSaveCurrentAsTemplate,
  onDeleteCustomTemplate,
  currentActiveId,
}: TemplateManagerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState("");
  const [newTemplateDesc, setNewTemplateDesc] = useState("");

  const allTemplates = [...BUILT_IN_TEMPLATES, ...customTemplates];
  const filteredTemplates = allTemplates.filter(
    (t) =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase()))
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
          <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-1.5 font-display">
            <Tag className="w-4 h-4 text-slate-500" />
            Parameter Templates
          </h3>
          <p className="text-[11px] text-slate-400">Select standard channels or custom tracking blueprints</p>
        </div>
        <button
          type="button"
          onClick={() => setShowSaveForm(!showSaveForm)}
          className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-all shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          Save Current Config
        </button>
      </div>

      {/* Save Template Form inline overlay */}
      {showSaveForm && (
        <form
          onSubmit={handleSave}
          className="p-3.5 border border-blue-100 bg-blue-50/50 rounded-xl space-y-3 animate-fade-in"
        >
          <div className="flex justify-between items-center">
            <h4 className="text-xs font-semibold text-blue-900 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-blue-500" />
              Save Setup as Custom Template
            </h4>
            <button
              type="button"
              onClick={() => setShowSaveForm(false)}
              className="text-[10px] text-slate-400 hover:text-slate-600"
            >
              Cancel
            </button>
          </div>
          <div className="grid grid-cols-1 gap-2.5">
            <div>
              <label className="block text-[10px] font-medium text-slate-500 mb-0.5">Template Name</label>
              <input
                type="text"
                placeholder="e.g. Q3 Affiliate Campaign"
                required
                value={newTemplateName}
                onChange={(e) => setNewTemplateName(e.target.value)}
                className="w-full text-xs px-2.5 py-1.5 border border-slate-200 bg-white rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-[10px] font-medium text-slate-500 mb-0.5">Description (Optional)</label>
              <input
                type="text"
                placeholder="Brief tracking description..."
                value={newTemplateDesc}
                onChange={(e) => setNewTemplateDesc(e.target.value)}
                className="w-full text-xs px-2.5 py-1.5 border border-slate-200 bg-white rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            Create Custom Template
          </button>
        </form>
      )}

      {/* Search Input */}
      <div className="relative">
        <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
          <Search className="w-3.5 h-3.5" />
        </span>
        <input
          type="text"
          placeholder="Search templates..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full text-xs pl-8 pr-3 py-1.5 border border-slate-200/80 bg-slate-50/50 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-400 focus:bg-white transition-all"
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
                className={`group relative text-left p-3 border rounded-xl cursor-pointer transition-all ${
                  isActive
                    ? "border-slate-800 bg-slate-900 text-white shadow-sm"
                    : "border-slate-100 bg-white hover:border-slate-300 hover:bg-slate-50 text-slate-700"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="font-medium text-xs truncate max-w-[80%]">
                    {tpl.name}
                  </div>
                  {tpl.isBuiltIn ? (
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${
                        isActive ? "bg-slate-800 text-slate-300" : "bg-slate-50 text-slate-500"
                      }`}
                    >
                      Official
                    </span>
                  ) : (
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded font-medium flex items-center gap-0.5 ${
                        isActive ? "bg-blue-900 text-blue-200" : "bg-blue-50 text-blue-600"
                      }`}
                    >
                      <FolderHeart className="w-2.5 h-2.5" />
                      Custom
                    </span>
                  )}
                </div>

                <p
                  className={`text-[10px] mt-1 line-clamp-2 ${
                    isActive ? "text-slate-300" : "text-slate-400"
                  }`}
                >
                  {tpl.description || "Custom tracking templates."}
                </p>

                {/* Badges preview */}
                <div className="flex flex-wrap gap-1 mt-2">
                  {tpl.utmSource && (
                    <span className="text-[8px] font-mono px-1 bg-slate-100 group-hover:bg-slate-200 text-slate-600 rounded">
                      src:{tpl.utmSource}
                    </span>
                  )}
                  {tpl.utmMedium && (
                    <span className="text-[8px] font-mono px-1 bg-slate-100 group-hover:bg-slate-200 text-slate-600 rounded">
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
                    className="absolute bottom-2.5 right-2.5 opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-50 text-slate-400 hover:text-red-600 transition-all"
                    title="Delete Custom Template"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          })
        ) : (
          <div className="col-span-2 py-6 text-center text-xs text-slate-400 border border-dashed border-slate-100 rounded-xl">
            No templates matching "{searchQuery}"
          </div>
        )}
      </div>
    </div>
  );
}
