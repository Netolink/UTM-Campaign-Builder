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
import { translations, Language } from "../translations";
import { shortenUrl } from "../lib/shortener";

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
  lang?: Language;
}

export default function BatchCreator({
  settings,
  shortenerService,
  onAddHistoryLogs,
  showNotification,
  lang = "en",
}: BatchCreatorProps) {
  const t = translations[lang];
  const isRtl = lang === "he";

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
          showNotification(t.batchNotificationImportSuccess.replace("{count}", String(newRows.length)));
        } else {
          showNotification(t.batchNotificationImportFail);
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
          showNotification(t.batchNotificationImportSuccess.replace("{count}", String(newRows.length)));
        } else {
          showNotification(t.batchNotificationImportFail);
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
      showNotification(t.batchNotificationAppendSuccess.replace("{count}", String(newRows.length)));
    } else {
      showNotification(t.batchNotificationNoUrls);
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
    if (window.confirm(t.batchConfirmClear)) {
      setRows([]);
      showNotification(t.batchNotificationClearSuccess);
    }
  };

  const handleApplyGlobalUTMs = (overwriteAll: boolean) => {
    if (rows.length === 0) {
      showNotification(lang === "he" ? "אין שורות להחלת פרמטרים. הוסף שורות תחילה." : lang === "ru" ? "Нет строк для применения параметров. Сначала добавьте строки." : "No rows to apply UTM parameters to. Add rows first.");
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
        ? t.batchNotificationApplySuccess
        : t.batchNotificationApplyMissing
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
    showNotification(lang === "he" ? "קובץ ייצוא קבוצתי של CSV הורד." : lang === "ru" ? "Файл экспорта CSV скачан." : "Batch export CSV downloaded.");
  };

  // Copy all links
  const copyAllLinks = (type: "full" | "short") => {
    const list = rows
      .map((r) => (type === "short" && r.shortenedUrl ? r.shortenedUrl : compileUrl(r)))
      .filter(Boolean);
    if (list.length === 0) {
      showNotification(t.batchNotificationNoCompiled);
      return;
    }
    navigator.clipboard.writeText(list.join("\n"));
    showNotification(t.batchNotificationCopySuccess.replace("{count}", String(list.length)));
  };

  // Single Row Link Shortening
  const handleShortenRow = async (rowId: string) => {
    const row = rows.find((r) => r.id === rowId);
    if (!row) return;

    const compiledUrl = compileUrl(row);
    if (!compiledUrl) {
      showNotification(lang === "he" ? "כתובת אתר יעד לא תקינה לעיבוד." : lang === "ru" ? "Неверный базовый URL для компиляции." : "Invalid Base URL for compile.");
      return;
    }

    if (shortenerService === "none") {
      showNotification(t.batchNotificationConfigureService);
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
      showNotification(t.batchNotificationShortenSuccess);
    } catch (err: any) {
      setRows((current) =>
        current.map((r) =>
          r.id === rowId
            ? { ...r, isShortening: false, error: err.message || t.batchNotificationShortenFail }
            : r
        )
      );
      showNotification(err.message || t.batchNotificationShortenFail);
    }
  };

  // Bulk Shorten Row Links
  const handleBulkShorten = async () => {
    const unshortened = rows.filter((r) => !r.shortenedUrl && compileUrl(r));
    if (unshortened.length === 0) {
      showNotification(t.batchNotificationBatchEmpty);
      return;
    }

    if (shortenerService === "none") {
      showNotification(t.batchNotificationConfigureService);
      return;
    }

    setBulkShortening(true);
    showNotification(t.batchNotificationBatchStart.replace("{count}", String(unshortened.length)));

    // Process rows sequentially or with tiny delays to respect API rate limits
    for (const row of unshortened) {
      const compiled = compileUrl(row);
      setRows((curr) =>
        curr.map((r) => (r.id === row.id ? { ...r, isShortening: true, error: "" } : r))
      );

      try {
        const shortUrl = await shortenUrl({
          service: shortenerService,
          longUrl: compiled,
          settings,
          lang,
        });

        setRows((curr) =>
          curr.map((r) =>
            r.id === row.id ? { ...r, shortenedUrl: shortUrl, isShortening: false } : r
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
    showNotification(t.batchNotificationBatchComplete);
  };

  // Send all configured links to Campaign History log
  const handleBulkAddToHistory = () => {
    const validRows = rows.filter((r) => compileUrl(r));
    if (validRows.length === 0) {
      showNotification(t.batchNotificationNoArchive);
      return;
    }

    const newLogs: HistoryLog[] = validRows.map((r) => {
      const compiled = compileUrl(r);
      return {
        id: Math.random().toString(36).substring(2, 9),
        campaignName: r.utmCampaign.trim() || (lang === "he" ? "קמפיין קבוצתי" : lang === "ru" ? "Пакетная кампания" : "Batch Campaign"),
        baseUrl: r.baseUrl,
        fullUrl: compiled,
        shortUrl: r.shortenedUrl || compiled,
        shortenerService: r.shortenedUrl ? shortenerService : "none",
        createdAt: new Date().toISOString(),
      };
    });

    onAddHistoryLogs(newLogs);
    showNotification(t.batchNotificationArchiveSuccess.replace("{count}", String(newLogs.length)));
  };

  return (
    <div className="space-y-6">
      {/* Configuration & File Import Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: File Drop and Manual Paste (Takes 1/3) */}
        <div className="bg-white border border-[#e2e8f0] rounded-[8px] p-5 shadow-xs space-y-4">
          <div>
            <h3 className="text-xs font-bold text-[#191c1e] uppercase tracking-widest flex items-center gap-1.5 font-display">
              <UploadCloud className="w-4 h-4 text-slate-500" />
              {t.batchImportTitle}
            </h3>
            <p className="text-[11px] text-[#64748B] mt-0.5 font-sans">
              {t.batchImportDesc}
            </p>
          </div>

          {/* Drag & Drop File Upload Container */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-[4px] p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
              isDragging
                ? "border-[#3B82F6] bg-blue-50/20 scale-98"
                : "border-slate-200 bg-slate-50/30 hover:border-[#3B82F6]/60 hover:bg-slate-50/60"
            }`}
          >
            <UploadCloud className={`w-8 h-8 transition-transform ${isDragging ? "scale-110 text-[#3B82F6]" : "text-slate-300"}`} />
            <div className="font-sans">
              <span className="text-xs font-bold text-slate-700 block">
                {t.batchDragDropTitle}
              </span>
              <span className="text-[10px] text-[#64748B] block mt-0.5">
                {t.batchDragDropDesc}
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
            <span className="flex-shrink mx-3 text-[10px] font-bold text-slate-300 uppercase tracking-widest font-sans">
              {t.batchOrPasteManually}
            </span>
            <div className="flex-grow border-t border-slate-100"></div>
          </div>

          {/* Paste Textarea Area */}
          <div className="space-y-2 font-sans">
            <textarea
              rows={4}
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              placeholder="https://example.com/item1&#10;https://example.com/item2&#10;https://example.com/item3"
              className="w-full text-xs p-3 border border-slate-300 bg-slate-50/70 focus:bg-white focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 text-slate-900 transition-all font-mono leading-relaxed rounded-[4px] focus:outline-none"
            />
            <button
              onClick={handlePasteSubmit}
              disabled={!pasteText.trim()}
              className="w-full py-2 bg-[#191c1e] text-white rounded-[4px] text-xs font-bold hover:bg-black disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              {t.batchParseAppend}
            </button>
          </div>
        </div>

        {/* Right Columns: Global Base UTM Parameters Override (Takes 2/3) */}
        <div className="lg:col-span-2 bg-white border border-[#e2e8f0] rounded-[8px] p-5 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <h3 className="text-xs font-bold text-[#191c1e] uppercase tracking-widest flex items-center gap-1.5 font-display">
                <Sparkles className="w-4 h-4 text-slate-500" />
                {t.batchGlobalConfigTitle}
              </h3>
              <p className="text-[11px] text-[#64748B] mt-0.5 font-sans">
                {t.batchGlobalConfigDesc}
              </p>
            </div>

            {/* Inputs grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest font-sans">
                  {t.sourceLabel}
                </label>
                <input
                  type="text"
                  placeholder="e.g. facebook"
                  value={globalSource}
                  onChange={(e) => setGlobalSource(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 bg-slate-50/70 focus:bg-white focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 text-slate-900 rounded-[4px] focus:outline-none font-sans"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest font-sans">
                  {t.mediumLabel}
                </label>
                <input
                  type="text"
                  placeholder="e.g. cpc"
                  value={globalMedium}
                  onChange={(e) => setGlobalMedium(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 bg-slate-50/70 focus:bg-white focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 text-slate-900 rounded-[4px] focus:outline-none font-sans"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest font-sans">
                  {t.campaignLabel}
                </label>
                <input
                  type="text"
                  placeholder="e.g. summer_sale"
                  value={globalCampaign}
                  onChange={(e) => setGlobalCampaign(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 bg-slate-50/70 focus:bg-white focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 text-slate-900 rounded-[4px] focus:outline-none font-sans"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest font-sans">
                  {t.termLabel}
                </label>
                <input
                  type="text"
                  placeholder="e.g. marketing"
                  value={globalTerm}
                  onChange={(e) => setGlobalTerm(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 bg-slate-50/70 focus:bg-white focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 text-slate-900 rounded-[4px] focus:outline-none font-sans"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest font-sans">
                  {t.contentLabel}
                </label>
                <input
                  type="text"
                  placeholder="e.g. red_banner"
                  value={globalContent}
                  onChange={(e) => setGlobalContent(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 bg-slate-50/70 focus:bg-white focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 text-slate-900 rounded-[4px] focus:outline-none font-sans"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest font-sans">
                  {t.idLabel}
                </label>
                <input
                  type="text"
                  placeholder="e.g. 98124"
                  value={globalId}
                  onChange={(e) => setGlobalId(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 bg-slate-50/70 focus:bg-white focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 text-slate-900 rounded-[4px] focus:outline-none font-sans"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2 mt-4 pt-4 border-t border-slate-100">
            <button
              onClick={() => handleApplyGlobalUTMs(false)}
              className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 bg-slate-50 hover:bg-slate-100 text-[#191c1e] text-xs font-semibold rounded-[4px] border border-[#e2e8f0] transition-colors cursor-pointer font-sans"
              title="Apply global values to blank fields only"
            >
              {t.batchFillEmpty}
            </button>
            <button
              onClick={() => handleApplyGlobalUTMs(true)}
              className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 bg-[#191c1e] text-white text-xs font-bold rounded-[4px] hover:bg-black transition-colors cursor-pointer font-sans"
              title="Overwrite parameters on all existing rows"
            >
              {t.batchOverwriteAll}
            </button>
            <button
              onClick={handleClearAll}
              disabled={rows.length === 0}
              className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 text-red-600 hover:bg-red-50 text-xs font-semibold rounded-[4px] transition-colors disabled:opacity-40 cursor-pointer sm:ml-auto font-sans"
            >
              <Trash2 className="w-3.5 h-3.5" />
              {lang === "he" ? "נקה רשימה נוכחית" : lang === "ru" ? "Очистить текущий список" : "Clear Current List"}
            </button>
          </div>
        </div>
      </div>

      {/* Main Table Content Panel */}
      <div className="bg-white border border-[#e2e8f0] rounded-[8px] p-5 shadow-xs space-y-4">
        {/* Table Management Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-1 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-[#191c1e] flex items-center gap-1.5 font-display">
              <Layers className="w-4 h-4 text-slate-500" />
              {t.batchLedgerTitle}
              <span className="px-1.5 py-0.5 text-[10px] bg-slate-100 text-slate-600 rounded-full font-bold">
                {rows.length} {lang === "he" ? "שורות" : lang === "ru" ? "строк" : "rows"}
              </span>
            </h3>
            <p className="text-[11px] text-[#64748B] font-sans">
              {t.batchLedgerDesc}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {rows.length > 0 && (
              <>
                <button
                  onClick={handleBulkShorten}
                  disabled={bulkShortening || shortenerService === "none"}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/50 text-emerald-700 text-xs font-semibold rounded-[4px] transition-colors cursor-pointer font-sans"
                  title="Run shortening on all valid links"
                >
                  {bulkShortening ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5" />
                  )}
                  {t.batchBulkShorten}
                </button>
                <button
                  onClick={() => copyAllLinks("full")}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-[4px] border border-[#e2e8f0] transition-colors cursor-pointer font-sans"
                  title="Copy all assembled URLs to clipboard"
                >
                  <Copy className="w-3.5 h-3.5" />
                  {t.batchCopyUtms}
                </button>
                <button
                  onClick={handleBulkAddToHistory}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#191c1e] hover:bg-black text-white text-xs font-bold rounded-[4px] transition-colors cursor-pointer font-sans"
                  title="Persist all compiled rows to general history log"
                >
                  <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
                  {t.batchLogHistory}
                </button>
                <button
                  onClick={exportBatchToCSV}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-[4px] border border-[#e2e8f0] transition-colors cursor-pointer font-sans"
                  title="Export grid data to CSV file"
                >
                  <Download className="w-3.5 h-3.5" />
                  {t.batchDownloadCsv}
                </button>
              </>
            )}
            <button
              onClick={handleAddManualRow}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-[#3B82F6] text-xs font-bold rounded-[4px] border border-blue-100 transition-colors ml-auto sm:ml-0 cursor-pointer font-sans"
            >
              <Plus className="w-3.5 h-3.5" />
              {lang === "he" ? "הוסף שורה" : lang === "ru" ? "Добавить строку" : "Add Row"}
            </button>
          </div>
        </div>

        {/* The Grid / Table View */}
        <div className="overflow-x-auto border border-[#e2e8f0] rounded-[8px]">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-slate-50/80 border-b border-[#e2e8f0] text-[10px] text-[#64748B] font-bold uppercase tracking-widest font-sans">
                <th className="px-3 py-3 w-[22%]">{t.batchTableHeaderUrl}</th>
                <th className="px-3 py-3 w-[10%]">{t.batchTableHeaderSource}</th>
                <th className="px-3 py-3 w-[10%]">{t.batchTableHeaderMedium}</th>
                <th className="px-3 py-3 w-[12%]">{t.batchTableHeaderCampaign}</th>
                <th className="px-3 py-3 w-[28%]">{t.batchTableHeaderOutput}</th>
                <th className="px-3 py-3 w-[8%] text-center">{t.batchTableHeaderQr}</th>
                <th className="px-3 py-3 w-[10%] text-right">{t.batchTableHeaderActions}</th>
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
                          className="w-full text-xs px-2 py-1.5 border border-[#e2e8f0] focus:border-[#3B82F6] bg-white rounded-[4px] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 font-mono"
                        />
                      </td>

                      {/* UTM Source Cell */}
                      <td className="px-3 py-2.5">
                        <input
                          type="text"
                          placeholder="source"
                          value={row.utmSource}
                          onChange={(e) => handleUpdateRow(row.id, "utmSource", e.target.value)}
                          className="w-full text-xs px-2 py-1.5 border border-[#e2e8f0] focus:border-[#3B82F6] bg-white rounded-[4px] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 font-sans"
                        />
                      </td>

                      {/* UTM Medium Cell */}
                      <td className="px-3 py-2.5">
                        <input
                          type="text"
                          placeholder="medium"
                          value={row.utmMedium}
                          onChange={(e) => handleUpdateRow(row.id, "utmMedium", e.target.value)}
                          className="w-full text-xs px-2 py-1.5 border border-[#e2e8f0] focus:border-[#3B82F6] bg-white rounded-[4px] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 font-sans"
                        />
                      </td>

                      {/* UTM Campaign Cell */}
                      <td className="px-3 py-2.5">
                        <input
                          type="text"
                          placeholder="campaign"
                          value={row.utmCampaign}
                          onChange={(e) => handleUpdateRow(row.id, "utmCampaign", e.target.value)}
                          className="w-full text-xs px-2 py-1.5 border border-[#e2e8f0] focus:border-[#3B82F6] bg-white rounded-[4px] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 font-sans"
                        />
                      </td>

                      {/* Compiled / Output Cell */}
                      <td className="px-3 py-2.5 space-y-1">
                        {/* Short Link Display (if shortened) */}
                        {row.shortenedUrl ? (
                          <div className="flex items-center justify-between gap-1.5 p-1 bg-emerald-50 rounded-[4px] border border-emerald-100">
                            <span className="font-mono text-[10.5px] font-bold text-emerald-700 truncate max-w-[170px]">
                              {row.shortenedUrl}
                            </span>
                            <button
                              onClick={() => copyRowLink(row.shortenedUrl, row.id, "short")}
                              className="p-1 hover:bg-emerald-100 rounded-[4px] text-emerald-600 transition-colors cursor-pointer"
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
                          <div className="flex items-center justify-between gap-1.5 p-1 bg-slate-50 rounded-[4px] border border-[#e2e8f0]">
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
                                className="p-1 hover:bg-slate-200 rounded-[4px] text-slate-400 hover:text-slate-600 cursor-pointer"
                                title="Open in new tab"
                              >
                                <ExternalLink className="w-3 h-3" />
                              </a>
                              <button
                                onClick={() => copyRowLink(compiled, row.id, "full")}
                                className="p-1 hover:bg-slate-200 rounded-[4px] text-slate-500 cursor-pointer"
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
                          <span className="text-[10px] text-slate-300 italic font-sans">{t.batchWaitingUrl}</span>
                        )}

                        {row.error && (
                          <span className="text-[9px] text-red-500 block leading-tight font-sans">
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
                              className="p-1.5 bg-slate-50 hover:bg-slate-100 border border-[#e2e8f0] rounded-[4px] text-slate-600 transition-colors relative cursor-pointer"
                              title="Toggle Large QR view / Download"
                            >
                              <QrCode className="w-3.5 h-3.5" />
                            </button>

                            {/* Popup Large QR Code Overlay */}
                            {activeQrRow === row.id && (
                              <div className="absolute right-0 top-12 z-50 bg-white p-3 rounded-[8px] shadow-xl border border-[#e2e8f0] flex flex-col items-center gap-2 animate-fade-in w-36">
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
                                  className="w-full flex items-center justify-center gap-1.5 py-1 bg-blue-50 hover:bg-blue-100 text-[#3B82F6] rounded-[4px] text-[10px] font-bold transition-colors cursor-pointer"
                                >
                                  <Download className="w-3 h-3" />
                                  {lang === "he" ? "הורדה" : lang === "ru" ? "Скачать" : "Download"}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setActiveQrRow(null)}
                                  className="text-[9px] text-[#64748B] hover:text-[#191c1e] underline font-bold cursor-pointer font-sans"
                                >
                                  {lang === "he" ? "סגור" : lang === "ru" ? "Закрыть" : "Close"}
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
                        <div className="flex items-center justify-end gap-1.5 font-sans">
                          {compiled && !row.shortenedUrl && shortenerService !== "none" && (
                            <button
                              onClick={() => handleShortenRow(row.id)}
                              disabled={row.isShortening}
                              className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 text-[10px] font-bold rounded-[4px] border border-emerald-100 transition-colors disabled:opacity-50 cursor-pointer"
                              title="Shorten link"
                            >
                              {row.isShortening ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                t.batchShortenAction
                              )}
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteRow(row.id)}
                            className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-[4px] transition-colors cursor-pointer"
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
                  <td colSpan={7} className="py-12 text-center text-[#64748B]">
                    <div className="flex flex-col items-center justify-center gap-2 font-sans">
                      <Layers className="w-8 h-8 text-slate-200" />
                      <span className="font-bold text-xs text-[#191c1e]">
                        {lang === "he" ? "לא נטענו רשומות בקבוצה" : lang === "ru" ? "Пакетные записи не загружены" : "No batch entries loaded"}
                      </span>
                      <span className="text-[10px] text-[#64748B] max-w-sm mx-auto">
                        {lang === "he" ? "הדבק רשימת קישורים, ייבא קובץ CSV או לחץ על 'הוסף שורה' כדי להתחיל ביצירה המונית." : lang === "ru" ? "Вставьте список URL, импортируйте CSV или нажмите «Добавить строку», чтобы начать пакетную генерацию." : "Paste a list of URLs, import a CSV, or click \"Add Row\" to begin creating links in bulk."}
                      </span>
                      <button
                        onClick={handleAddManualRow}
                        className="mt-2 flex items-center gap-1.5 px-3 py-1.5 bg-[#191c1e] text-white rounded-[4px] text-xs font-bold hover:bg-black transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        {lang === "he" ? "הוסף שורה ראשונה" : lang === "ru" ? "Добавить первую строку" : "Add First Row"}
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
