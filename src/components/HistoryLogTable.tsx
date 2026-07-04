import React, { useState } from "react";
import { Download, Search, Trash2, Copy, Check, FileJson, Link as LinkIcon, Sparkles } from "lucide-react";
import { HistoryLog } from "../types";

interface HistoryLogTableProps {
  logs: HistoryLog[];
  onDeleteLog: (id: string) => void;
  onClearAll: () => void;
}

export default function HistoryLogTable({ logs, onDeleteLog, onClearAll }: HistoryLogTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copyType, setCopyType] = useState<"short" | "full" | null>(null);

  const filteredLogs = logs.filter((log) =>
    log.campaignName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.baseUrl.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.fullUrl.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.shortUrl.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCopy = (text: string, id: string, type: "short" | "full") => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setCopyType(type);
    setTimeout(() => {
      setCopiedId(null);
      setCopyType(null);
    }, 1500);
  };

  // Real CSV Export
  const exportToCSV = () => {
    if (filteredLogs.length === 0) return;

    const headers = ["Campaign Name", "Date Created", "Base URL", "Full UTM URL", "Shortened URL", "Shortener Service"];
    const rows = filteredLogs.map((log) => [
      `"${log.campaignName.replace(/"/g, '""')}"`,
      `"${new Date(log.createdAt).toLocaleString()}"`,
      `"${log.baseUrl.replace(/"/g, '""')}"`,
      `"${log.fullUrl.replace(/"/g, '""')}"`,
      `"${log.shortUrl.replace(/"/g, '""')}"`,
      `"${log.shortenerService}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `utm_campaigns_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Real JSON Export
  const exportToJSON = () => {
    if (filteredLogs.length === 0) return;

    const jsonString = JSON.stringify(filteredLogs, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `utm_campaigns_${new Date().toISOString().split("T")[0]}.json`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs space-y-4">
      {/* Header and exports */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-1.5 font-display">
            <LinkIcon className="w-4 h-4 text-slate-500" />
            Campaign History Master Log
          </h3>
          <p className="text-[11px] text-slate-400">Master ledger of generated marketing links and tracking logs</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {logs.length > 0 && (
            <>
              <button
                onClick={exportToCSV}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-medium rounded-lg border border-slate-200/80 transition-colors"
                title="Export filtered records to Excel/CSV"
              >
                <Download className="w-3.5 h-3.5" />
                Export CSV
              </button>
              <button
                onClick={exportToJSON}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-medium rounded-lg border border-slate-200/80 transition-colors"
                title="Export filtered records to raw JSON"
              >
                <FileJson className="w-3.5 h-3.5" />
                Export JSON
              </button>
              <button
                onClick={onClearAll}
                className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-red-50 text-red-600 text-xs font-medium rounded-lg transition-colors"
                title="Delete all records in local history"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear All
              </button>
            </>
          )}
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
          <Search className="w-4 h-4" />
        </span>
        <input
          type="text"
          placeholder="Filter campaigns by name, destination, or shortened link..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full text-xs pl-9 pr-3 py-2 border border-slate-200 bg-slate-50/50 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-400 focus:bg-white transition-all"
        />
      </div>

      {/* History Table Container */}
      <div className="overflow-x-auto border border-slate-100 rounded-xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
              <th className="px-4 py-3">Campaign Details</th>
              <th className="px-4 py-3">Destination Base</th>
              <th className="px-4 py-3">Generated Connections</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 text-xs text-slate-700">
            {filteredLogs.length > 0 ? (
              filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                  {/* Campaign Name & Date */}
                  <td className="px-4 py-3.5 min-w-[150px]">
                    <div className="font-semibold text-slate-900 flex items-center gap-1">
                      {log.campaignName || "Unnamed Campaign"}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                      {new Date(log.createdAt).toLocaleDateString()} at{" "}
                      {new Date(log.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </td>

                  {/* Destination Base URL */}
                  <td className="px-4 py-3.5 max-w-[200px] truncate">
                    <span className="font-mono text-[11px] text-slate-500 break-all" title={log.baseUrl}>
                      {log.baseUrl}
                    </span>
                  </td>

                  {/* Generated links */}
                  <td className="px-4 py-3.5 min-w-[240px] space-y-1">
                    {/* Short link */}
                    {log.shortUrl && log.shortUrl !== log.fullUrl && (
                      <div className="flex items-center justify-between gap-2 p-1.5 bg-emerald-50/60 rounded-lg border border-emerald-100/50">
                        <span className="font-mono text-[11px] font-semibold text-emerald-700 truncate max-w-[170px]">
                          {log.shortUrl}
                        </span>
                        <button
                          onClick={() => handleCopy(log.shortUrl, log.id, "short")}
                          className="p-1 hover:bg-emerald-100 rounded text-emerald-600 transition-colors flex items-center"
                          title="Copy shortened URL"
                        >
                          {copiedId === log.id && copyType === "short" ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    )}

                    {/* Full link */}
                    <div className="flex items-center justify-between gap-2 p-1.5 bg-slate-50 rounded-lg border border-slate-200/50">
                      <span className="font-mono text-[10px] text-slate-600 truncate max-w-[170px]" title={log.fullUrl}>
                        {log.fullUrl}
                      </span>
                      <button
                        onClick={() => handleCopy(log.fullUrl, log.id, "full")}
                        className="p-1 hover:bg-slate-200 rounded text-slate-500 transition-colors flex items-center"
                        title="Copy full UTM URL"
                      >
                        {copiedId === log.id && copyType === "full" ? (
                          <Check className="w-3 h-3 text-slate-800" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  </td>

                  {/* Row actions */}
                  <td className="px-4 py-3.5 text-right">
                    <button
                      onClick={() => onDeleteLog(log.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove from master log"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="py-8 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-1.5">
                    <Sparkles className="w-6 h-6 text-slate-200" />
                    <span className="font-medium text-xs">No campaign logs in this ledger</span>
                    <span className="text-[10px] text-slate-300">Generate a URL and click "Save to History Log"</span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
