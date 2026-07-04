import React, { useState, useRef, useMemo } from "react";
import {
  UploadCloud,
  FileText,
  Layers,
  Download,
  Trash2,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Plus,
  Loader2,
  ExternalLink,
  Globe,
  QrCode,
  CheckSquare,
} from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { HistoryLog, ShortenerSettings } from "../types";

interface BatchRow {
  id: string;
  baseUrl: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  utmTerm: string;
  utmContent: string;
  utmId: string;
  shortenedUrl: string;
  isShortening: boolean;
  error: string;
}

interface BatchCreatorProps {
  settings: ShortenerSettings;
  shortenerService: "none" | "bitly" | "rebrandly" | "tinyurl" | "dub";
  onAddHistoryLogs: (logs: HistoryLog[]) => void;
  showNotification: (msg: string) => void;
}

export default function BatchCreator({
  settings,
  shortenerService,
  onAddHistoryLogs,
  showNotification,
}: BatchCreatorProps) {
  // State for rows
  const [rows, setRows] = useState<BatchRow[]>([]);
  const [pasteText, setPasteText] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Global defaults state
  const [globalSource, setGlobalSource] = useState("");
  const [globalMedium, setGlobalMedium] = useState("");
  const [globalCampaign, setGlobalCampaign] = useState("");
  const [globalTerm, setGlobalTerm] = useState("");
  const [globalContent, setGlobalContent] = useState("");
  const [globalId, setGlobalId] = useState("");

  // UI state
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedType, setCopiedType] = useState<"full" | "short" | null>(null);
  const [bulkShortening, setBulkShortening] = useState(false);
  const [activeQrRow, setActiveQrRow] = useState<string | null>(null);

  // Compiled full URL helper
  const compileUrl = (row: BatchRow) => {
    if (!row.baseUrl) return "";
    try {
      let targetUrl = row.baseUrl.trim();
      if (!/^https?:\/\//i.test(targetUrl)) {
        targetUrl = "https://" + targetUrl;
      }
      const urlObj = new URL(targetUrl);

      const source = row.utmSource.trim();
      const medium = row.utmMedium.trim();
      const campaign = row.utmCampaign.trim();
      const term = row.utmTerm.trim();
      const content = row.utmContent.trim();
      const utmId = row.utmId.trim();

      if (source) urlObj.searchParams.set("utm_source", source);
      if (medium) urlObj.searchParams.set("utm_medium", medium);
      if (campaign) urlObj.searchParams.set("utm_campaign", campaign);
      if (term) urlObj.searchParams.set("utm_term", term);
      if (content) urlObj.searchParams.set("utm_content", content);
      if (utmId) urlObj.searchParams.set("utm_id", utmId);

      return urlObj.toString();
    } catch (e) {
      return "";
    }
  };

  // Safe split CSV lines
  const parseCSVContent = (text: string) => {
    const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
    if (lines.length === 0) return [];

    const firstLine = lines[0].toLowerCase();
    const hasHeader =
      firstLine.includes("url") ||
      firstLine.includes("source") ||
      firstLine.includes("medium") ||
      firstLine.includes("campaign");

    if (hasHeader && lines.length > 1) {
      const splitCSVLine = (line: string) => {
        const result = [];
        let current = "";
        let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === "," && !inQuotes) {
            result.push(current.trim());
            current = "";
          } else {
            current += char;
          }
        }
        result.push(current.trim());
        return result;
      };

      const headers = splitCSVLine(lines[0]).map((h) => h.replace(/^"|"$/g, "").toLowerCase());

      const urlIdx = headers.findIndex(
        (h) =>
          h.includes("url") ||
          h.includes("destination") ||
          h.includes("link") ||
          h.includes("base")
      );
      const sourceIdx = headers.findIndex((h) => h.includes("source"));
      const mediumIdx = headers.findIndex((h) => h.includes("medium"));
      const campaignIdx = headers.findIndex((h) => h.includes("campaign") || h.includes("name"));
      const termIdx = headers.findIndex((h) => h.includes("term") || h.includes("keyword"));
      const contentIdx = headers.findIndex((h) => h.includes("content"));
      const idIdx = headers.findIndex((h) => h.includes("id"));

      const parsedRows: BatchRow[] = [];
      for (let i = 1; i < lines.length; i++) {
        const cols = splitCSVLine(lines[i]);
        if (cols.length === 0 || (cols.length === 1 && !cols[0])) continue;

        const targetUrlIdx = urlIdx !== -1 ? urlIdx : 0;
        const baseUrlRaw = cols[targetUrlIdx] ? cols[targetUrlIdx].replace(/^"|"$/g, "") : "";
        if (!baseUrlRaw) continue;

        parsedRows.push({
          id: Math.random().toString(36).substring(2, 9),
          baseUrl: baseUrlRaw,
          utmSource: sourceIdx !== -1 && cols[sourceIdx] ? cols[sourceIdx].replace(/^"|"$/g, "") : "",
          utmMedium: mediumIdx !== -1 && cols[mediumIdx] ? cols[mediumIdx].replace(/^"|"$/g, "") : "",
          utmCampaign:
            campaignIdx !== -1 && cols[campaignIdx] ? cols[campaignIdx].replace(/^"|"$/g, "") : "",
          utmTerm: termIdx !== -1 && cols[termIdx] ? cols[termIdx].replace(/^"|"$/g, "") : "",
          utmContent:
            contentIdx !== -1 && cols[contentIdx] ? cols[contentIdx].replace(/^"|"$/g, "") : "",
          utmId: idIdx !== -1 && cols[idIdx] ? cols[idIdx].replace(/^"|"$/g, "") : "",
          shortenedUrl: "",
          isShortening: false,
          error: "",
        });
      }
      return parsedRows;
    } else {
      return lines.map((line) => {
        let rawUrl = line.replace(/^"|"$/g, "");
        if (rawUrl.includes(",")) {
          rawUrl = rawUrl.split(",")[0].trim().replace(/^"|"$/g, "");
        }
        return {
          id: Math.random().toString(36).substring(2, 9),
          baseUrl: rawUrl,
          utmSource: "",
          utmMedium: "",
          utmCampaign: "",
          utmTerm: "",
          utmContent: "",
          utmId: "",
          shortenedUrl: "",
          isShortening: false,
          error: "",
        };
      });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        const newRows = parseCSVContent(text);
        if (newRows.length > 0) {
          setRows([...rows, ...newRows]);
          showNotification(`Successfully imported ${newRows.length} URLs!`);
        } else {
          showNotification("Could not parse any valid URLs from the file.");
        }
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        const newRows = parseCSVContent(text);
        if (newRows.length > 0) {
          setRows([...rows, ...newRows]);
          showNotification(`Successfully imported ${newRows.length} URLs!`);
        } else {
          showNotification("Could not parse any valid URLs from the file.");
        }
      }
    };
    reader.readAsText(file);
  };

  const handlePasteSubmit = () => {
    if (!pasteText.trim()) return;
    const newRows = parseCSVContent(pasteText);
    if (newRows.length > 0) {
      setRows([...rows, ...newRows]);
      setPasteText("");
      showNotification(`Added ${newRows.length} URLs to the table.`);
    } else {
      showNotification("No valid URLs found in paste input.");
    }
  };

  const handleAddManualRow = () => {
    const newRow: BatchRow = {
      id: Math.random().toString(36).substring(2, 9),
      baseUrl: "",
      utmSource: globalSource,
      utmMedium: globalMedium,
      utmCampaign: globalCampaign,
      utmTerm: globalTerm,
      utmContent: globalContent,
      utmId: globalId,
      shortenedUrl: "",
      isShortening: false,
      error: "",
    };
    setRows([...rows, newRow]);
  };

  const handleUpdateRow = (id: string, field: keyof BatchRow, value: string) => {
    setRows(
      rows.map((r) => {
        if (r.id === id) {
          return { ...r, [field]: value, shortenedUrl: "" }; // Clear short link on manual edit to force refresh
        }
        return r;
      })
    );
  };

  const handleDeleteRow = (id: string) => {
    setRows(rows.filter((r) => r.id !== id));
  };

  const handleClearAll = () => {
    if (window.confirm("Are you sure you want to clear all batch rows?")) {
      setRows([]);
      showNotification("Cleared all batch entries.");
    }
  };

  const handleApplyGlobalUTMs = (overwriteAll: boolean) => {
    if (rows.length === 0) {
      showNotification("No rows to apply UTM parameters to. Add rows first.");
      return;
    }
    setRows(
      rows.map((r) => {
        return {
          ...r,
          utmSource: overwriteAll || !r.utmSource ? globalSource : r.utmSource,
          utmMedium: overwriteAll || !r.utmMedium ? globalMedium : r.utmMedium,
          utmCampaign: overwriteAll || !r.utmCampaign ? globalCampaign : r.utmCampaign,
          utmTerm: overwriteAll || !r.utmTerm ? globalTerm : r.utmTerm,
          utmContent: overwriteAll || !r.utmContent ? globalContent : r.utmContent,
          utmId: overwriteAll || !r.utmId ? globalId : r.utmId,
          shortenedUrl: "", // Reset shortened if parameters change
        };
      })
    );
    showNotification(
      overwriteAll
        ? "Applied global UTM parameters to all rows!"
        : "Filled missing parameters with global values."
    );
  };

  // Copy Row Link to Clipboard
  const copyRowLink = (text: string, rowId: string, type: "full" | "short") => {
    navigator.clipboard.writeText(text);
    setCopiedId(rowId);
    setCopiedType(type);
    setTimeout(() => {
      setCopiedId(null);
      setCopiedType(null);
    }, 1500);
  };

  // Download QR Code as PNG for a specific row
  const downloadRowQRCode = (rowId: string, filename: string) => {
    const canvas = document.getElementById(`qr-row-canvas-${rowId}`) as HTMLCanvasElement | null;
    if (!canvas) {
      showNotification("Could not find QR Code preview canvas.");
      return;
    }
    try {
      const url = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = url;
      a.download = `qr-${filename || "campaign"}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      showNotification("QR code downloaded!");
    } catch (e) {
      showNotification("Error downloading QR Code.");
    }
  };

  // Export Table back to CSV
  const exportBatchToCSV = () => {
    if (rows.length === 0) return;
    const headers = [
      "Base URL",
      "UTM Source",
      "UTM Medium",
      "UTM Campaign",
      "UTM Term",
      "UTM Content",
      "UTM ID",
      "Compiled URL",
      "Shortened URL",
    ];
    const csvRows = rows.map((r) => {
      const compiled = compileUrl(r);
      return [
        `"${r.baseUrl.replace(/"/g, '""')}"`,
        `"${r.utmSource.replace(/"/g, '""')}"`,
        `"${r.utmMedium.replace(/"/g, '""')}"`,
        `"${r.utmCampaign.replace(/"/g, '""')}"`,
        `"${r.utmTerm.replace(/"/g, '""')}"`,
        `"${r.utmContent.replace(/"/g, '""')}"`,
        `"${r.utmId.replace(/"/g, '""')}"`,
        `"${compiled.replace(/"/g, '""')}"`,
        `"${r.shortenedUrl.replace(/"/g, '""')}"`,
      ];
    });

    const csvContent = [headers.join(","), ...csvRows.map((e) => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `utm_batch_export_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotification("Batch export CSV downloaded.");
  };

  // Copy all links
  const copyAllLinks = (type: "full" | "short") => {
    const list = rows
      .map((r) => (type === "short" && r.shortenedUrl ? r.shortenedUrl : compileUrl(r)))
      .filter(Boolean);
    if (list.length === 0) {
      showNotification("No compiled URLs to copy.");
      return;
    }
    navigator.clipboard.writeText(list.join("\n"));
    showNotification(`Copied ${list.length} links to clipboard!`);
  };

  // Single Row Link Shortening
  const handleShortenRow = async (rowId: string) => {
    const row = rows.find((r) => r.id === rowId);
    if (!row) return;

    const compiledUrl = compileUrl(row);
    if (!compiledUrl) {
      showNotification("Invalid Base URL for compile.");
      return;
    }

    if (shortenerService === "none") {
      showNotification("Select an API Integration service first.");
      return;
    }

    setRows((current) =>
      current.map((r) => (r.id === rowId ? { ...r, isShortening: true, error: "" } : r))
    );

    try {
      const response = await fetch("/api/shorten", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: compiledUrl,
          service: shortenerService,
          settings,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to shorten URL.");
      }

      setRows((current) =>
        current.map((r) =>
          r.id === rowId ? { ...r, shortenedUrl: data.shortUrl, isShortening: false } : r
        )
      );
      showNotification("URL shortened successfully!");
    } catch (err: any) {
      setRows((current) =>
        current.map((r) =>
          r.id === rowId
            ? { ...r, isShortening: false, error: err.message || "Shortener error" }
            : r
        )
      );
      showNotification(err.message || "Shortening service failure.");
    }
  };

  // Bulk Shorten Row Links
  const handleBulkShorten = async () => {
    const unshortened = rows.filter((r) => !r.shortenedUrl && compileUrl(r));
    if (unshortened.length === 0) {
      showNotification("All valid rows are already shortened or empty.");
      return;
    }

    if (shortenerService === "none") {
      showNotification("Please configure and select a Shortening Service in top-right menu.");
      return;
    }

    setBulkShortening(true);
    showNotification(`Starting batch shortening for ${unshortened.length} links...`);

    // Process rows sequentially or with tiny delays to respect API rate limits
    for (const row of unshortened) {
      const compiled = compileUrl(row);
      setRows((curr) =>
        curr.map((r) => (r.id === row.id ? { ...r, isShortening: true, error: "" } : r))
      );

      try {
        const response = await fetch("/api/shorten", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            url: compiled,
            service: shortenerService,
            settings,
          }),
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Rate limited or authentication error");
        }

        setRows((curr) =>
          curr.map((r) =>
            r.id === row.id ? { ...r, shortenedUrl: data.shortUrl, isShortening: false } : r
          )
        );
      } catch (err: any) {
        setRows((curr) =>
          curr.map((r) =>
            r.id === row.id
              ? { ...r, isShortening: false, error: err.message || "Service error" }
              : r
          )
        );
      }
      // Brief sleep to be courteous to APIs
      await new Promise((res) => setTimeout(res, 200));
    }

    setBulkShortening(false);
    showNotification("Batch shortening operation complete!");
  };

  // Send all configured links to Campaign History log
  const handleBulkAddToHistory = () => {
    const validRows = rows.filter((r) => compileUrl(r));
    if (validRows.length === 0) {
      showNotification("No compiled links to archive.");
      return;
    }

    const newLogs: HistoryLog[] = validRows.map((r) => {
      const compiled = compileUrl(r);
      return {
        id: Math.random().toString(36).substring(2, 9),
        campaignName: r.utmCampaign.trim() || "Batch Campaign",
        baseUrl: r.baseUrl,
        fullUrl: compiled,
        shortUrl: r.shortenedUrl || compiled,
        shortenerService: r.shortenedUrl ? shortenerService : "none",
        createdAt: new Date().toISOString(),
      };
    });

    onAddHistoryLogs(newLogs);
    showNotification(`Archived ${newLogs.length} links to the history log!`);
  };

  return (
    <div className="space-y-6">
      {/* Configuration & File Import Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: File Drop and Manual Paste (Takes 1/3) */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs space-y-4">
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <UploadCloud className="w-4 h-4 text-slate-500" />
              Import Base URL List
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Upload a TXT/CSV file or paste newline-separated destination links
            </p>
          </div>

          {/* Drag & Drop File Upload Container */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
              isDragging
                ? "border-slate-800 bg-slate-50 scale-98"
                : "border-slate-200 bg-slate-50/30 hover:border-slate-400 hover:bg-slate-50/60"
            }`}
          >
            <UploadCloud className={`w-8 h-8 transition-transform ${isDragging ? "scale-110 text-slate-800" : "text-slate-300"}`} />
            <div>
              <span className="text-xs font-semibold text-slate-700 block">
                Drag & Drop files here
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                or click to browse from system (.csv or .txt)
              </span>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".csv,.txt"
              className="hidden"
            />
          </div>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-100"></div>
            <span className="flex-shrink mx-3 text-[10px] font-bold text-slate-300 uppercase tracking-widest">
              or paste manually
            </span>
            <div className="flex-grow border-t border-slate-100"></div>
          </div>

          {/* Paste Textarea Area */}
          <div className="space-y-2">
            <textarea
              rows={4}
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              placeholder="https://example.com/item1&#10;https://example.com/item2&#10;https://example.com/item3"
              className="w-full text-xs p-3 border border-slate-200 bg-slate-50/30 hover:bg-slate-50/10 focus:bg-white rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-800 focus:border-slate-800 transition-all font-mono leading-relaxed"
            />
            <button
              onClick={handlePasteSubmit}
              disabled={!pasteText.trim()}
              className="w-full py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Parse URLs & Append
            </button>
          </div>
        </div>

        {/* Right Columns: Global Base UTM Parameters Override (Takes 2/3) */}
        <div className="lg:col-span-2 bg-white border border-slate-100 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-slate-500" />
                Global / Bulk UTM Builder Config
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Configure common tracking tags to apply instantly or fill empty cells in your list
              </p>
            </div>

            {/* Inputs grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Source
                </label>
                <input
                  type="text"
                  placeholder="e.g. facebook"
                  value={globalSource}
                  onChange={(e) => setGlobalSource(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 bg-slate-50/50 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Medium
                </label>
                <input
                  type="text"
                  placeholder="e.g. cpc"
                  value={globalMedium}
                  onChange={(e) => setGlobalMedium(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 bg-slate-50/50 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Campaign Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. summer_sale"
                  value={globalCampaign}
                  onChange={(e) => setGlobalCampaign(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 bg-slate-50/50 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Term (Keyword)
                </label>
                <input
                  type="text"
                  placeholder="e.g. marketing"
                  value={globalTerm}
                  onChange={(e) => setGlobalTerm(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 bg-slate-50/50 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Content (Ad Variation)
                </label>
                <input
                  type="text"
                  placeholder="e.g. red_banner"
                  value={globalContent}
                  onChange={(e) => setGlobalContent(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 bg-slate-50/50 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Campaign ID
                </label>
                <input
                  type="text"
                  placeholder="e.g. 98124"
                  value={globalId}
                  onChange={(e) => setGlobalId(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 bg-slate-50/50 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-800"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2 mt-4 pt-4 border-t border-slate-100">
            <button
              onClick={() => handleApplyGlobalUTMs(false)}
              className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition-colors cursor-pointer"
              title="Apply global values to blank fields only"
            >
              Fill Empty Row Fields
            </button>
            <button
              onClick={() => handleApplyGlobalUTMs(true)}
              className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
              title="Overwrite parameters on all existing rows"
            >
              Overwrite All Row Parameters
            </button>
            <button
              onClick={handleClearAll}
              disabled={rows.length === 0}
              className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 text-red-600 hover:bg-red-50 text-xs font-semibold rounded-xl transition-colors disabled:opacity-40 cursor-pointer sm:ml-auto"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear Current List
            </button>
          </div>
        </div>
      </div>

      {/* Main Table Content Panel */}
      <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs space-y-4">
        {/* Table Management Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-1 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-1.5 font-display">
              <Layers className="w-4 h-4 text-slate-500" />
              Batch URL Builder Ledger
              <span className="px-1.5 py-0.5 text-[10px] bg-slate-100 text-slate-600 rounded-full font-bold">
                {rows.length} rows
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Review, edit, and bulk-process campaign links in real-time
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {rows.length > 0 && (
              <>
                <button
                  onClick={handleBulkShorten}
                  disabled={bulkShortening || shortenerService === "none"}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/50 text-emerald-700 text-xs font-semibold rounded-lg transition-colors"
                  title="Run shortening on all valid links"
                >
                  {bulkShortening ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5" />
                  )}
                  Bulk Shorten
                </button>
                <button
                  onClick={() => copyAllLinks("full")}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 transition-colors"
                  title="Copy all assembled URLs to clipboard"
                >
                  <Copy className="w-3.5 h-3.5" />
                  Copy UTMs
                </button>
                <button
                  onClick={handleBulkAddToHistory}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors"
                  title="Persist all compiled rows to general history log"
                >
                  <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
                  Log to History
                </button>
                <button
                  onClick={exportBatchToCSV}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 transition-colors"
                  title="Export grid data to CSV file"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download CSV
                </button>
              </>
            )}
            <button
              onClick={handleAddManualRow}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-semibold rounded-lg border border-blue-200 transition-colors ml-auto sm:ml-0"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Row
            </button>
          </div>
        </div>

        {/* The Grid / Table View */}
        <div className="overflow-x-auto border border-slate-100 rounded-xl">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                <th className="px-3 py-3 w-[22%]">Website Destination Base URL</th>
                <th className="px-3 py-3 w-[10%]">Source</th>
                <th className="px-3 py-3 w-[10%]">Medium</th>
                <th className="px-3 py-3 w-[12%]">Campaign</th>
                <th className="px-3 py-3 w-[28%]">Compiled Outputs</th>
                <th className="px-3 py-3 w-[8%] text-center">QR Code</th>
                <th className="px-3 py-3 w-[10%] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-xs text-slate-700">
              {rows.length > 0 ? (
                rows.map((row) => {
                  const compiled = compileUrl(row);
                  return (
                    <tr key={row.id} className="hover:bg-slate-50/30 transition-colors">
                      {/* Base URL Cell */}
                      <td className="px-3 py-2.5">
                        <input
                          type="url"
                          placeholder="https://example.com/item"
                          value={row.baseUrl}
                          onChange={(e) => handleUpdateRow(row.id, "baseUrl", e.target.value)}
                          className="w-full text-xs px-2 py-1.5 border border-slate-100 focus:border-slate-400 bg-transparent rounded-lg focus:outline-none focus:bg-white font-mono"
                        />
                      </td>

                      {/* UTM Source Cell */}
                      <td className="px-3 py-2.5">
                        <input
                          type="text"
                          placeholder="source"
                          value={row.utmSource}
                          onChange={(e) => handleUpdateRow(row.id, "utmSource", e.target.value)}
                          className="w-full text-xs px-2 py-1.5 border border-slate-100 focus:border-slate-400 bg-transparent rounded-lg focus:outline-none focus:bg-white"
                        />
                      </td>

                      {/* UTM Medium Cell */}
                      <td className="px-3 py-2.5">
                        <input
                          type="text"
                          placeholder="medium"
                          value={row.utmMedium}
                          onChange={(e) => handleUpdateRow(row.id, "utmMedium", e.target.value)}
                          className="w-full text-xs px-2 py-1.5 border border-slate-100 focus:border-slate-400 bg-transparent rounded-lg focus:outline-none focus:bg-white"
                        />
                      </td>

                      {/* UTM Campaign Cell */}
                      <td className="px-3 py-2.5">
                        <input
                          type="text"
                          placeholder="campaign"
                          value={row.utmCampaign}
                          onChange={(e) => handleUpdateRow(row.id, "utmCampaign", e.target.value)}
                          className="w-full text-xs px-2 py-1.5 border border-slate-100 focus:border-slate-400 bg-transparent rounded-lg focus:outline-none focus:bg-white"
                        />
                      </td>

                      {/* Compiled / Output Cell */}
                      <td className="px-3 py-2.5 space-y-1">
                        {/* Short Link Display (if shortened) */}
                        {row.shortenedUrl ? (
                          <div className="flex items-center justify-between gap-1.5 p-1 bg-emerald-50 rounded border border-emerald-100">
                            <span className="font-mono text-[10.5px] font-semibold text-emerald-700 truncate max-w-[170px]">
                              {row.shortenedUrl}
                            </span>
                            <button
                              onClick={() => copyRowLink(row.shortenedUrl, row.id, "short")}
                              className="p-1 hover:bg-emerald-100 rounded text-emerald-600 transition-colors"
                              title="Copy Short URL"
                            >
                              {copiedId === row.id && copiedType === "short" ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        ) : null}

                        {/* Assembled Link Display */}
                        {compiled ? (
                          <div className="flex items-center justify-between gap-1.5 p-1 bg-slate-50 rounded border border-slate-100">
                            <span
                              className="font-mono text-[10px] text-slate-500 truncate max-w-[170px]"
                              title={compiled}
                            >
                              {compiled}
                            </span>
                            <div className="flex items-center gap-1">
                              <a
                                href={compiled}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-600"
                                title="Open in new tab"
                              >
                                <ExternalLink className="w-3 h-3" />
                              </a>
                              <button
                                onClick={() => copyRowLink(compiled, row.id, "full")}
                                className="p-1 hover:bg-slate-200 rounded text-slate-500"
                                title="Copy Full UTM URL"
                              >
                                {copiedId === row.id && copiedType === "full" ? (
                                  <Check className="w-3 h-3 text-slate-800" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-300 italic">Waiting for URL...</span>
                        )}

                        {row.error && (
                          <span className="text-[9px] text-red-500 block leading-tight">
                            {row.error}
                          </span>
                        )}
                      </td>

                      {/* QR Code Cell */}
                      <td className="px-3 py-2.5 text-center relative">
                        {compiled ? (
                          <div className="inline-flex flex-col items-center gap-1">
                            {/* Hidden canvas used for the high-quality PNG download */}
                            <div className="hidden">
                              <QRCodeCanvas
                                id={`qr-row-canvas-${row.id}`}
                                value={row.shortenedUrl || compiled}
                                size={200}
                                level="H"
                                bgColor="#FFFFFF"
                                fgColor="#0F172A"
                                includeMargin={true}
                              />
                            </div>

                            {/* Tiny preview / Interactive QR code popover button */}
                            <button
                              type="button"
                              onClick={() =>
                                setActiveQrRow(activeQrRow === row.id ? null : row.id)
                              }
                              className="p-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-600 transition-colors relative cursor-pointer"
                              title="Toggle Large QR view / Download"
                            >
                              <QrCode className="w-3.5 h-3.5" />
                            </button>

                            {/* Popup Large QR Code Overlay */}
                            {activeQrRow === row.id && (
                              <div className="absolute right-0 top-12 z-50 bg-white p-3 rounded-xl shadow-xl border border-slate-100 flex flex-col items-center gap-2 animate-fade-in w-36">
                                <QRCodeCanvas
                                  value={row.shortenedUrl || compiled}
                                  size={100}
                                  level="M"
                                  bgColor="#FFFFFF"
                                  fgColor="#0F172A"
                                  includeMargin={false}
                                />
                                <button
                                  type="button"
                                  onClick={() =>
                                    downloadRowQRCode(row.id, row.utmCampaign || "batch-qr")
                                  }
                                  className="w-full flex items-center justify-center gap-1.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-[10px] font-semibold transition-colors"
                                >
                                  <Download className="w-3 h-3" />
                                  Download
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setActiveQrRow(null)}
                                  className="text-[9px] text-slate-400 hover:text-slate-600 underline font-semibold cursor-pointer"
                                >
                                  Close
                                </button>
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-200 font-mono">-</span>
                        )}
                      </td>

                      {/* Actions / Shorten / Delete Cell */}
                      <td className="px-3 py-2.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {compiled && !row.shortenedUrl && shortenerService !== "none" && (
                            <button
                              onClick={() => handleShortenRow(row.id)}
                              disabled={row.isShortening}
                              className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 text-[10px] font-bold rounded border border-emerald-100 transition-colors disabled:opacity-50"
                              title="Shorten link"
                            >
                              {row.isShortening ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                "Shorten"
                              )}
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteRow(row.id)}
                            className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Remove row"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Layers className="w-8 h-8 text-slate-200" />
                      <span className="font-semibold text-xs text-slate-500">
                        No batch entries loaded
                      </span>
                      <span className="text-[10px] text-slate-400 max-w-sm mx-auto">
                        Paste a list of URLs, import a CSV, or click "Add Row" to begin creating links in bulk.
                      </span>
                      <button
                        onClick={handleAddManualRow}
                        className="mt-2 flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add First Row
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
