import React, { useState, useMemo } from "react";
import {
  Download,
  Search,
  Trash2,
  Copy,
  Check,
  FileJson,
  Link as LinkIcon,
  Sparkles,
  BarChart3,
  MousePointerClick,
  Calendar,
  X,
  Globe,
  Laptop,
  Smartphone,
  Tablet,
  Compass,
  Chrome,
  AlertCircle
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip
} from "recharts";
import { HistoryLog, ClickDetail } from "../types";

interface HistoryLogTableProps {
  logs: HistoryLog[];
  onDeleteLog: (id: string) => void;
  onClearAll: () => void;
  lang?: string;
  userId?: string;
}

// User Agent Parser
function parseUserAgent(ua: string) {
  let device = "Desktop";
  let browser = "Other";

  const lowerUA = ua.toLowerCase();

  // Device detection
  if (lowerUA.includes("mobi") || lowerUA.includes("iphone") || lowerUA.includes("android")) {
    device = "Mobile";
  } else if (lowerUA.includes("tablet") || lowerUA.includes("ipad")) {
    device = "Tablet";
  }

  // Browser detection
  if (lowerUA.includes("chrome") || lowerUA.includes("chromium")) {
    browser = "Chrome";
  } else if (lowerUA.includes("safari") && !lowerUA.includes("chrome")) {
    browser = "Safari";
  } else if (lowerUA.includes("firefox")) {
    browser = "Firefox";
  } else if (lowerUA.includes("edge") || lowerUA.includes("edg")) {
    browser = "Edge";
  }

  return { device, browser };
}

interface AnalyticsData {
  dailyClicks: { date: string; clicks: number }[];
  referrers: { name: string; value: number }[];
  devices: { name: string; value: number }[];
  browsers: { name: string; value: number }[];
}

function computeAnalytics(clickDetails: ClickDetail[] = []): AnalyticsData {
  const dailyMap: { [key: string]: number } = {};
  const referrerMap: { [key: string]: number } = {};
  const deviceMap: { [key: string]: number } = {};
  const browserMap: { [key: string]: number } = {};

  clickDetails.forEach((detail) => {
    // 1. Group by date (last 7 days or any recorded dates)
    if (detail.timestamp) {
      const dateStr = new Date(detail.timestamp).toLocaleDateString([], { month: "short", day: "numeric" });
      dailyMap[dateStr] = (dailyMap[dateStr] || 0) + 1;
    }

    // 2. Referrers
    const referrer = detail.referrer || "Direct";
    let cleanedReferrer = "Direct";
    if (referrer.toLowerCase().includes("google")) cleanedReferrer = "Google";
    else if (referrer.toLowerCase().includes("facebook") || referrer.toLowerCase().includes("fb")) cleanedReferrer = "Facebook";
    else if (referrer.toLowerCase().includes("linkedin") || referrer.toLowerCase().includes("lnkd")) cleanedReferrer = "LinkedIn";
    else if (referrer.toLowerCase().includes("twitter") || referrer.toLowerCase().includes("t.co") || referrer.toLowerCase().includes("x.com")) cleanedReferrer = "Twitter/X";
    else if (referrer.toLowerCase().includes("instagram")) cleanedReferrer = "Instagram";
    else if (referrer !== "Direct") {
      try {
        const url = new URL(referrer);
        cleanedReferrer = url.hostname.replace("www.", "");
      } catch (e) {
        cleanedReferrer = referrer;
      }
    }
    referrerMap[cleanedReferrer] = (referrerMap[cleanedReferrer] || 0) + 1;

    // 3. User-Agent parsing
    const ua = detail.userAgent || "";
    const { device, browser } = parseUserAgent(ua);
    deviceMap[device] = (deviceMap[device] || 0) + 1;
    browserMap[browser] = (browserMap[browser] || 0) + 1;
  });

  // Convert to chart-friendly formats
  const dailyClicks = Object.keys(dailyMap).map((date) => ({
    date,
    clicks: dailyMap[date],
  })).slice(-7);

  const referrers = Object.keys(referrerMap).map((name) => ({
    name,
    value: referrerMap[name],
  })).sort((a, b) => b.value - a.value);

  const devices = Object.keys(deviceMap).map((name) => ({
    name,
    value: deviceMap[name],
  })).sort((a, b) => b.value - a.value);

  const browsers = Object.keys(browserMap).map((name) => ({
    name,
    value: browserMap[name],
  })).sort((a, b) => b.value - a.value);

  return { dailyClicks, referrers, devices, browsers };
}

export default function HistoryLogTable({
  logs,
  onDeleteLog,
  onClearAll,
  lang = "en",
  userId,
}: HistoryLogTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copyType, setCopyType] = useState<"short" | "full" | "trackable" | null>(null);
  const [selectedLog, setSelectedLog] = useState<HistoryLog | null>(null);
  const [subTab, setSubTab] = useState<"logs" | "analytics">("logs");

  const isRtl = lang === "he";

  const past7Days = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(d);
    }
    return days;
  }, []);

  const formattedDays = useMemo(() => {
    return past7Days.map((d) => {
      const dateKey = d.toISOString().split("T")[0]; // YYYY-MM-DD
      const displayLabel = d.toLocaleDateString([], { month: "short", day: "numeric" });
      return { dateKey, displayLabel };
    });
  }, [past7Days]);

  const { last7DaysChartData, total7DayClicks } = useMemo(() => {
    const dailyClicksMap: { [key: string]: number } = {};
    formattedDays.forEach((day) => {
      dailyClicksMap[day.dateKey] = 0;
    });

    let total = 0;
    logs.forEach((log) => {
      if (log.clickDetails) {
        log.clickDetails.forEach((click) => {
          if (click.timestamp) {
            const clickDateStr = click.timestamp.split("T")[0];
            if (clickDateStr in dailyClicksMap) {
              dailyClicksMap[clickDateStr]++;
              total++;
            }
          }
        });
      }
    });

    const last7DaysChartData = formattedDays.map((day) => ({
      date: day.displayLabel,
      clicks: dailyClicksMap[day.dateKey],
    }));

    return { last7DaysChartData, total7DayClicks: total };
  }, [logs, formattedDays]);

  const campaignsChartData = useMemo(() => {
    return logs
      .map((log) => ({
        name: log.campaignName || (lang === "he" ? "קמפיין ללא שם" : "Unnamed Link"),
        clicks: log.clicks || 0,
      }))
      .sort((a, b) => b.clicks - a.clicks);
  }, [logs, lang]);

  const topCampaignsData = useMemo(() => {
    return campaignsChartData.slice(0, 8);
  }, [campaignsChartData]);

  const filteredLogs = logs.filter((log) =>
    log.campaignName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.baseUrl.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.fullUrl.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.shortUrl.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCopy = (text: string, id: string, type: "short" | "full" | "trackable") => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setCopyType(type);
    setTimeout(() => {
      setCopiedId(null);
      setCopyType(null);
    }, 1500);
  };

  // CSV Export
  const exportToCSV = () => {
    if (filteredLogs.length === 0) return;

    const headers = ["Campaign Name", "Date Created", "Base URL", "Full UTM URL", "Shortened URL", "Trackable URL", "Clicks Count", "Shortener Service"];
    const rows = filteredLogs.map((log) => [
      `"${log.campaignName.replace(/"/g, '""')}"`,
      `"${new Date(log.createdAt).toLocaleString()}"`,
      `"${log.baseUrl.replace(/"/g, '""')}"`,
      `"${log.fullUrl.replace(/"/g, '""')}"`,
      `"${log.shortUrl.replace(/"/g, '""')}"`,
      userId ? `"${window.location.origin}/?r=${userId}_${log.id}"` : '""',
      log.clicks || 0,
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

  // JSON Export
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

  // Extract UTM parameters to display in analytics
  const getUtmParams = (urlStr: string) => {
    try {
      const url = new URL(urlStr);
      const params = [];
      const keys = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "utm_id"];
      for (const key of keys) {
        const val = url.searchParams.get(key);
        if (val) {
          params.push({ key: key.replace("utm_", ""), val });
        }
      }
      return params;
    } catch (e) {
      return [];
    }
  };

  const analytics = selectedLog ? computeAnalytics(selectedLog.clickDetails || []) : null;

  return (
    <div className="bg-white border border-[#e2e8f0] rounded-[8px] p-6 shadow-xs space-y-4" dir={isRtl ? "rtl" : "ltr"}>
      {/* Header and exports */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-[#191c1e] flex items-center gap-1.5 font-display">
            <LinkIcon className="w-4 h-4 text-slate-500" />
            {lang === "he" ? "יומן היסטוריית קמפיינים" : lang === "ru" ? "Архив отслеживания кампаний" : "Campaign History Master Log"}
          </h3>
          <p className="text-[11px] text-[#64748B] font-sans">
            {lang === "he" ? "יומן מרכזי של קישורי שיווק ויומני מעקב שנוצרו" : lang === "ru" ? "История всех созданных, проверенных и сокращенных ссылок отслеживания" : "Master ledger of generated marketing links and tracking logs"}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {logs.length > 0 && (
            <>
              <button
                onClick={exportToCSV}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-[4px] border border-[#e2e8f0] transition-colors cursor-pointer font-sans"
                title="Export filtered records to Excel/CSV"
              >
                <Download className="w-3.5 h-3.5" />
                {lang === "he" ? "ייצוא CSV" : lang === "ru" ? "Экспорт CSV" : "Export CSV"}
              </button>
              <button
                onClick={exportToJSON}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-[4px] border border-[#e2e8f0] transition-colors cursor-pointer font-sans"
                title="Export filtered records to raw JSON"
              >
                <FileJson className="w-3.5 h-3.5" />
                {lang === "he" ? "ייצוא JSON" : lang === "ru" ? "Экспорт JSON" : "Export JSON"}
              </button>
              <button
                onClick={onClearAll}
                className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-red-50 text-red-600 text-xs font-semibold rounded-[4px] transition-colors cursor-pointer font-sans"
                title="Delete all records in local history"
              >
                <Trash2 className="w-3.5 h-3.5" />
                {lang === "he" ? "נקה הכל" : lang === "ru" ? "Очистить все" : "Clear All"}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Sub-tabs for Log vs Analytics */}
      <div className="flex border-b border-[#e2e8f0] pb-1 gap-4">
        <button
          onClick={() => setSubTab("logs")}
          className={`pb-2 px-1 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer font-sans ${
            subTab === "logs"
              ? "border-slate-900 text-slate-900"
              : "border-transparent text-slate-400 hover:text-slate-900"
          }`}
        >
          <Search className="w-3.5 h-3.5" />
          {lang === "he" ? "רשימת קישורים" : lang === "ru" ? "Список ссылок" : "Link Registry"}
        </button>
        <button
          onClick={() => setSubTab("analytics")}
          className={`pb-2 px-1 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer font-sans ${
            subTab === "analytics"
              ? "border-slate-900 text-slate-900"
              : "border-transparent text-slate-400 hover:text-slate-900"
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          {lang === "he" ? "לוח אנליטיקס" : lang === "ru" ? "Аналитическая панель" : "Analytics Dashboard"}
        </button>
      </div>

      {subTab === "logs" ? (
        <>
          {/* Search Input */}
          <div className="relative">
            <span className={`absolute inset-y-0 ${isRtl ? "right-0 pr-3" : "left-0 pl-3"} flex items-center pointer-events-none text-[#64748B]`}>
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder={lang === "he" ? "סנן קמפיינים לפי שם, יעד או קישור מקוצר..." : lang === "ru" ? "Фильтровать кампании по имени, адресу или короткой ссылке..." : "Filter campaigns by name, destination, or shortened link..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full text-xs ${isRtl ? "pr-9 pl-3" : "pl-9 pr-3"} py-2 border border-slate-300 bg-slate-50/70 focus:bg-white focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 text-slate-900 rounded-[4px] focus:outline-none transition-all font-sans`}
            />
          </div>

          {/* History Table Container */}
          <div className="overflow-x-auto border border-[#e2e8f0] rounded-[8px]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-[#e2e8f0] text-[10px] text-[#64748B] font-bold uppercase tracking-widest font-sans">
                  <th className={`px-4 py-3 ${isRtl ? "text-right" : "text-left"}`}>{lang === "he" ? "פרטי קמפיין" : lang === "ru" ? "Детали кампании" : "Campaign Details"}</th>
                  <th className={`px-4 py-3 ${isRtl ? "text-right" : "text-left"}`}>{lang === "he" ? "כתובת יעד" : lang === "ru" ? "Адрес назначения" : "Destination Base"}</th>
                  <th className={`px-4 py-3 ${isRtl ? "text-right" : "text-left"}`}>{lang === "he" ? "קישורי מעקב" : lang === "ru" ? "Созданные ссылки" : "Generated Connections"}</th>
                  <th className={`px-4 py-3 ${isRtl ? "text-right" : "text-left"}`}>{lang === "he" ? "קליקים ואנליטיקס" : lang === "ru" ? "Клики и аналитика" : "Clicks & Analytics"}</th>
                  <th className={`px-4 py-3 text-right`}>{lang === "he" ? "פעולות" : lang === "ru" ? "Действия" : "Actions"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-xs text-slate-700">
                {filteredLogs.length > 0 ? (
                  filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                      {/* Campaign Name & Date */}
                      <td className="px-4 py-3.5 min-w-[150px]">
                        <div className="font-bold text-slate-900 font-sans">
                          {log.campaignName || "Unnamed Campaign"}
                        </div>
                        <div className="text-[10px] text-[#64748B] font-mono mt-0.5" dir="ltr">
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
                      <td className="px-4 py-3.5 min-w-[240px] space-y-1" dir="ltr">
                        {/* Short link */}
                        {log.shortUrl && log.shortUrl !== log.fullUrl && (
                          <div className="flex items-center justify-between gap-2 p-1.5 bg-emerald-50/60 rounded-[4px] border border-emerald-100/50">
                            <span className="font-mono text-[11px] font-bold text-emerald-700 truncate max-w-[170px]">
                              {log.shortUrl}
                            </span>
                            <button
                              onClick={() => handleCopy(log.shortUrl, log.id, "short")}
                              className="p-1 hover:bg-emerald-100 rounded-[4px] text-emerald-600 transition-colors flex items-center cursor-pointer"
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

                        {/* Trackable smart link (if userId exists) */}
                        {userId && (
                          <div className="flex items-center justify-between gap-2 p-1.5 bg-blue-50/70 rounded-[4px] border border-blue-100/50">
                            <span className="font-mono text-[10px] font-bold text-blue-700 truncate max-w-[170px]" title="Trackable redirect link">
                              {`${window.location.origin}/?r=${userId}_${log.id}`}
                            </span>
                            <button
                              onClick={() => handleCopy(`${window.location.origin}/?r=${userId}_${log.id}`, log.id, "trackable")}
                              className="p-1 hover:bg-blue-100 rounded-[4px] text-blue-600 transition-colors flex items-center cursor-pointer"
                              title="Copy trackable link"
                            >
                              {copiedId === log.id && copyType === "trackable" ? (
                                <Check className="w-3 h-3 text-blue-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        )}

                        {/* Full link */}
                        <div className="flex items-center justify-between gap-2 p-1.5 bg-slate-50 rounded-[4px] border border-slate-200/50">
                          <span className="font-mono text-[10px] text-slate-600 truncate max-w-[170px]" title={log.fullUrl}>
                            {log.fullUrl}
                          </span>
                          <button
                            onClick={() => handleCopy(log.fullUrl, log.id, "full")}
                            className="p-1 hover:bg-slate-200 rounded-[4px] text-slate-500 transition-colors flex items-center cursor-pointer"
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

                      {/* Clicks & Analytics */}
                      <td className="px-4 py-3.5 min-w-[160px]">
                        {userId ? (
                          <div className="flex items-center gap-3">
                            <div className="bg-slate-100 px-2.5 py-1 rounded-[4px] font-mono text-[11px] font-bold text-slate-700 flex items-center gap-1">
                              <MousePointerClick className="w-3 h-3 text-slate-500" />
                              {log.clicks || 0}
                            </div>
                            <button
                              onClick={() => setSelectedLog(log)}
                              className="flex items-center gap-1 text-[11px] text-slate-600 hover:text-slate-900 font-semibold bg-slate-50 hover:bg-slate-100 border border-[#e2e8f0] px-2 py-1 rounded-[4px] transition-colors cursor-pointer"
                            >
                              <BarChart3 className="w-3 h-3" />
                              {lang === "he" ? "נתונים" : lang === "ru" ? "Аналитика" : "Stats"}
                            </button>
                          </div>
                        ) : (
                          <div className="text-[10px] text-slate-400 bg-slate-50 border border-slate-100 px-2 py-1 rounded-[4px] inline-flex items-center gap-1">
                            <AlertCircle className="w-3 h-3 text-slate-400" />
                            {lang === "he" ? "מצב מקומי בלבד" : lang === "ru" ? "Локальный режим" : "Local mode only"}
                          </div>
                        )}
                      </td>

                      {/* Row actions */}
                      <td className="px-4 py-3.5 text-right">
                        <button
                          onClick={() => onDeleteLog(log.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-[4px] transition-colors cursor-pointer"
                          title="Remove from master log"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-[#64748B]">
                      <div className="flex flex-col items-center justify-center gap-1.5">
                        <Sparkles className="w-6 h-6 text-slate-200" />
                        <span className="font-bold text-xs font-sans">
                          {lang === "he" ? "אין קמפיינים שמורים" : lang === "ru" ? "Записей нет в архиве" : "No campaign logs in this ledger"}
                        </span>
                        <span className="text-[10px] text-[#64748B] font-sans">
                          {lang === "he" ? "צור קישור ולחץ על 'שמור ביומן היסטוריה'" : lang === "ru" ? "Начните создавать ссылки для наполнения вашей истории!" : "Generate a URL and click 'Save to History Log'"}
                        </span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="space-y-6 pt-2 animate-fade-in">
          {/* Summary Widgets Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Links */}
            <div className="bg-slate-50 border border-[#e2e8f0] p-4 rounded-[6px] flex items-center gap-3">
              <div className="p-2 bg-slate-900 text-white rounded-[4px]">
                <LinkIcon className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-[#64748B] block font-bold uppercase tracking-wider">
                  {lang === "he" ? "סה\"כ קישורים" : lang === "ru" ? "Всего ссылок" : "TOTAL LINKS"}
                </span>
                <span className="text-lg font-extrabold text-slate-900 font-mono leading-tight">
                  {logs.length}
                </span>
              </div>
            </div>

            {/* Total Clicks */}
            <div className="bg-slate-50 border border-[#e2e8f0] p-4 rounded-[6px] flex items-center gap-3">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-[4px]">
                <MousePointerClick className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-[#64748B] block font-bold uppercase tracking-wider">
                  {lang === "he" ? "סה\"כ קליקים" : lang === "ru" ? "Всего кликов" : "TOTAL CLICKS"}
                </span>
                <span className="text-lg font-extrabold text-slate-900 font-mono leading-tight">
                  {logs.reduce((sum, l) => sum + (l.clicks || 0), 0)}
                </span>
              </div>
            </div>

            {/* Active Links */}
            <div className="bg-slate-50 border border-[#e2e8f0] p-4 rounded-[6px] flex items-center gap-3">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-[4px]">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-[#64748B] block font-bold uppercase tracking-wider">
                  {lang === "he" ? "קישורים פעילים" : lang === "ru" ? "Активные ссылки" : "ACTIVE LINKS"}
                </span>
                <span className="text-lg font-extrabold text-slate-900 font-mono leading-tight">
                  {logs.filter((l) => (l.clicks || 0) > 0).length}
                </span>
              </div>
            </div>

            {/* 7 Day Clicks */}
            <div className="bg-slate-50 border border-[#e2e8f0] p-4 rounded-[6px] flex items-center gap-3">
              <div className="p-2 bg-amber-50 text-amber-600 rounded-[4px]">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-[#64748B] block font-bold uppercase tracking-wider">
                  {lang === "he" ? "קליקים (7 ימים)" : lang === "ru" ? "Кликов (7 дн.)" : "7-DAY CLICKS"}
                </span>
                <span className="text-lg font-extrabold text-slate-900 font-mono leading-tight">
                  {total7DayClicks}
                </span>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          {logs.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Chart 1: Last 7 Days Click Distribution */}
              <div className="border border-[#e2e8f0] p-5 rounded-[8px] bg-white shadow-xs">
                <div className="mb-4">
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-slate-500" />
                    {lang === "he" ? "התפלגות קליקים ב-7 הימים האחרונים" : lang === "ru" ? "Распределение кликов за 7 дней" : "Clicks Distribution Over Last 7 Days"}
                  </h4>
                  <p className="text-[10px] text-slate-400 font-sans">
                    {lang === "he" ? "נפח קליקים יומי משולב של כל הקישורים הפעילים" : lang === "ru" ? "Общий ежедневный объем кликов по всем активным ссылкам" : "Combined daily click volume across all active tracking links"}
                  </p>
                </div>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={last7DaysChartData}>
                      <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} allowDecimals={false} />
                      <Tooltip
                        contentStyle={{ background: "#0F172A", border: "none", borderRadius: "6px" }}
                        labelStyle={{ color: "#FFF", fontSize: "11px", fontWeight: "bold" }}
                        itemStyle={{ color: "#38BDF8", fontSize: "11px" }}
                      />
                      <Bar dataKey="clicks" fill="#0F172A" radius={[4, 4, 0, 0]} name={lang === "he" ? "קליקים" : "Clicks"} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 2: Clicks Per Campaign (Top 8) */}
              <div className="border border-[#e2e8f0] p-5 rounded-[8px] bg-white shadow-xs">
                <div className="mb-4">
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <BarChart3 className="w-4 h-4 text-slate-500" />
                    {lang === "he" ? "קליקים לפי קמפיין (מובילים)" : lang === "ru" ? "Клики по кампаниям (Топ)" : "Clicks Per Campaign / Link (Top Performances)"}
                  </h4>
                  <p className="text-[10px] text-slate-400 font-sans">
                    {lang === "he" ? "ביצועי הקמפיינים המובילים לפי כמות הקליקים שנצברו" : lang === "ru" ? "Сравнение эффективности лучших кампаний по числу кликов" : "Performance comparison of top generated campaigns by total accumulated clicks"}
                  </p>
                </div>
                <div className="h-64 w-full">
                  {campaignsChartData.some(c => c.clicks > 0) ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={topCampaignsData} layout="vertical">
                        <XAxis type="number" stroke="#94a3b8" fontSize={10} tickLine={false} allowDecimals={false} />
                        <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={9} tickLine={false} width={100} />
                        <Tooltip
                          contentStyle={{ background: "#0F172A", border: "none", borderRadius: "6px" }}
                          labelStyle={{ color: "#FFF", fontSize: "11px", fontWeight: "bold" }}
                          itemStyle={{ color: "#38BDF8", fontSize: "11px" }}
                        />
                        <Bar dataKey="clicks" fill="#3B82F6" radius={[0, 4, 4, 0]} name={lang === "he" ? "קליקים" : "Clicks"} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 border border-dashed border-slate-100 rounded-[6px]">
                      <MousePointerClick className="w-8 h-8 text-slate-200 mb-1" />
                      <span className="text-[11px] font-bold">
                        {lang === "he" ? "אין נתוני קליקים להצגה" : lang === "ru" ? "Нет данных о кликах" : "No click data to display yet"}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="border border-dashed border-[#e2e8f0] rounded-[8px] py-16 text-center text-[#64748B]">
              <Sparkles className="w-8 h-8 mx-auto text-slate-200 mb-2" />
              <h4 className="font-bold text-xs text-[#191c1e] mb-1">
                {lang === "he" ? "אין קמפיינים פעילים ביומן" : lang === "ru" ? "Архив пуст" : "No Active Campaigns in Ledger"}
              </h4>
              <p className="text-[10px] text-[#64748B] max-w-sm mx-auto">
                {lang === "he" ? "צור קישור מעקב, הפעל אותו ואסוף קליקים כדי לצפות בלוח האנליטיקס!" : lang === "ru" ? "Создайте ссылки для отслеживания и начните собирать переходы!" : "Construct some tracking links, drive traffic, and register clicks to unlock advanced dashboard distribution statistics!"}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Analytics Modal */}
      {selectedLog && analytics && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-[12px] border border-slate-200 shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col font-sans">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[#e2e8f0] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block font-sans">
                  {lang === "he" ? "אנליטיקס וקליקים" : lang === "ru" ? "АНАЛИТИКА КЛИКОВ" : "CLICK ANALYTICS"}
                </span>
                <h3 className="text-sm font-bold text-slate-900 mt-0.5">
                  {selectedLog.campaignName || "Campaign Analytics"}
                </h3>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-[6px] transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Scroll Content */}
            <div className="p-6 overflow-y-auto space-y-6 max-h-[calc(90vh-120px)]">
              {/* Top Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Click counter */}
                <div className="bg-slate-50 border border-[#e2e8f0] p-4 rounded-[8px] flex items-center gap-4">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-[6px]">
                    <MousePointerClick className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-[#64748B] block font-semibold uppercase tracking-wider">
                      {lang === "he" ? "סה\"כ קליקים" : lang === "ru" ? "Всего кликов" : "TOTAL CLICKS"}
                    </span>
                    <span className="text-xl font-bold text-slate-900 font-mono leading-none mt-1 block">
                      {selectedLog.clicks || 0}
                    </span>
                  </div>
                </div>

                {/* Service Used */}
                <div className="bg-slate-50 border border-[#e2e8f0] p-4 rounded-[8px] flex items-center gap-4">
                  <div className="p-3 bg-emerald-50 text-emerald-600 rounded-[6px]">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-[#64748B] block font-semibold uppercase tracking-wider">
                      {lang === "he" ? "שירות קיצור" : lang === "ru" ? "Сервис сокращения" : "SHORTENER SERVICE"}
                    </span>
                    <span className="text-sm font-bold text-slate-900 leading-none mt-1 block capitalize font-mono">
                      {selectedLog.shortenerService === "none" ? "None (Direct)" : selectedLog.shortenerService}
                    </span>
                  </div>
                </div>

                {/* Creation date */}
                <div className="bg-slate-50 border border-[#e2e8f0] p-4 rounded-[8px] flex items-center gap-4">
                  <div className="p-3 bg-amber-50 text-amber-600 rounded-[6px]">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-[#64748B] block font-semibold uppercase tracking-wider">
                      {lang === "he" ? "תאריך יצירה" : lang === "ru" ? "Дата создания" : "CREATION DATE"}
                    </span>
                    <span className="text-xs font-bold text-slate-900 leading-none mt-1 block font-mono">
                      {new Date(selectedLog.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* UTM parameters badge bar */}
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-[8px]">
                <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                  {lang === "he" ? "פרמטרי UTM המזוהים" : lang === "ru" ? "Обнаруженные параметры UTM" : "Identified UTM Parameters"}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {getUtmParams(selectedLog.fullUrl).length > 0 ? (
                    getUtmParams(selectedLog.fullUrl).map((param, index) => (
                      <div key={index} className="bg-white border border-slate-300 rounded-[4px] px-2 py-1 flex items-center gap-1.5 text-[11px] font-mono shadow-2xs">
                        <span className="font-bold text-slate-400 uppercase text-[9px]">{param.key}:</span>
                        <span className="font-bold text-slate-800">{param.val}</span>
                      </div>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400 font-sans italic">
                      {lang === "he" ? "אין פרמטרים של UTM בכתובת זו." : lang === "ru" ? "В данном URL нет параметров UTM." : "No active UTM parameters found in this URL."}
                    </span>
                  )}
                </div>
              </div>

              {/* Chart & Breakdowns Area */}
              {(selectedLog.clickDetails && selectedLog.clickDetails.length > 0) ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Chart side */}
                  <div className="border border-[#e2e8f0] p-4 rounded-[8px]">
                    <h4 className="text-xs font-bold text-slate-900 mb-4 flex items-center gap-1.5">
                      <BarChart3 className="w-4 h-4 text-slate-500" />
                      {lang === "he" ? "קליקים ב-7 הימים האחרונים" : lang === "ru" ? "Клики за последние 7 дней" : "Clicks in the Last 7 Days"}
                    </h4>
                    <div className="h-56 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={analytics.dailyClicks}>
                          <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} />
                          <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} allowDecimals={false} />
                          <Tooltip
                            contentStyle={{ background: "#0F172A", border: "none", borderRadius: "6px" }}
                            labelStyle={{ color: "#FFF", fontSize: "11px", fontWeight: "bold" }}
                            itemStyle={{ color: "#38BDF8", fontSize: "11px" }}
                          />
                          <Bar dataKey="clicks" fill="#0F172A" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Breakdowns side */}
                  <div className="space-y-4">
                    {/* Referrers */}
                    <div className="border border-[#e2e8f0] p-4 rounded-[8px]">
                      <h4 className="text-xs font-bold text-slate-900 mb-3 flex items-center gap-1.5">
                        <Compass className="w-4 h-4 text-slate-500" />
                        {lang === "he" ? "מקורות תנועה מובילים" : lang === "ru" ? "Источники трафика" : "Top Referrers"}
                      </h4>
                      <div className="space-y-2">
                        {analytics.referrers.map((ref) => {
                          const total = selectedLog.clickDetails?.length || 1;
                          const percent = Math.round((ref.value / total) * 100);
                          return (
                            <div key={ref.name} className="space-y-1">
                              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700">
                                <span>{ref.name}</span>
                                <span className="font-mono text-slate-500">{ref.value} ({percent}%)</span>
                              </div>
                              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-slate-900 h-full rounded-full" style={{ width: `${percent}%` }}></div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Device & Browser side-by-side */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Devices */}
                      <div className="border border-[#e2e8f0] p-4 rounded-[8px]">
                        <h4 className="text-xs font-bold text-slate-900 mb-3 flex items-center gap-1.5">
                          <Laptop className="w-4 h-4 text-slate-500" />
                          {lang === "he" ? "סוגי מכשירים" : lang === "ru" ? "Устройства" : "Devices"}
                        </h4>
                        <div className="space-y-2.5">
                          {analytics.devices.map((dev) => {
                            const total = selectedLog.clickDetails?.length || 1;
                            const percent = Math.round((dev.value / total) * 100);
                            return (
                              <div key={dev.name} className="flex items-center justify-between text-[11px]">
                                <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                                  {dev.name === "Mobile" ? (
                                    <Smartphone className="w-3.5 h-3.5 text-slate-500" />
                                  ) : dev.name === "Tablet" ? (
                                    <Tablet className="w-3.5 h-3.5 text-slate-500" />
                                  ) : (
                                    <Laptop className="w-3.5 h-3.5 text-slate-500" />
                                  )}
                                  <span>{dev.name}</span>
                                </div>
                                <span className="font-mono font-bold text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded">
                                  {dev.value}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Browsers */}
                      <div className="border border-[#e2e8f0] p-4 rounded-[8px]">
                        <h4 className="text-xs font-bold text-slate-900 mb-3 flex items-center gap-1.5">
                          <Chrome className="w-4 h-4 text-slate-500" />
                          {lang === "he" ? "דפדפנים" : lang === "ru" ? "Браузеры" : "Browsers"}
                        </h4>
                        <div className="space-y-2.5">
                          {analytics.browsers.map((brow) => (
                            <div key={brow.name} className="flex items-center justify-between text-[11px]">
                              <span className="font-semibold text-slate-700">{brow.name}</span>
                              <span className="font-mono font-bold text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded">
                                {brow.value}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="border border-dashed border-[#e2e8f0] rounded-[8px] py-12 text-center text-[#64748B]">
                  <MousePointerClick className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                  <h4 className="font-bold text-xs text-[#191c1e] mb-1">
                    {lang === "he" ? "אין קליקים מוקלטים עדיין" : lang === "ru" ? "Кликов еще нет" : "No Clicks Recorded Yet"}
                  </h4>
                  <p className="text-[10px] text-[#64748B] max-w-sm mx-auto">
                    {lang === "he" ? "שתף את הקישור הניתן למעקב שלך עם לקוחות כדי להתחיל לאסוף נתונים וסטטיסטיקות בזמן אמת!" : lang === "ru" ? "Поделитесь вашей ссылкой с отслеживанием, чтобы начать собирать клики и подробную статистику в реальном времени!" : "Share your trackable redirect link with your audience to start gathering real-time clicks, device timelines, and detailed referrer breakdowns!"}
                  </p>
                </div>
              )}

              {/* Detailed Click History Log List */}
              {selectedLog.clickDetails && selectedLog.clickDetails.length > 0 && (
                <div className="border border-[#e2e8f0] rounded-[8px] overflow-hidden">
                  <div className="bg-slate-50 px-4 py-3 border-b border-[#e2e8f0]">
                    <h4 className="text-xs font-bold text-slate-900">
                      {lang === "he" ? "יומן קליקים מפורט" : lang === "ru" ? "Детальный журнал кликов" : "Detailed Click Stream Ledger"}
                    </h4>
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50/50 border-b border-[#e2e8f0] text-[9px] text-[#64748B] font-bold uppercase font-sans">
                          <th className={`px-4 py-2 ${isRtl ? "text-right" : "text-left"}`}>{lang === "he" ? "זמן קליק" : lang === "ru" ? "Время клика" : "Timestamp"}</th>
                          <th className={`px-4 py-2 ${isRtl ? "text-right" : "text-left"}`}>{lang === "he" ? "דפדפן ומכשיר" : lang === "ru" ? "Браузер и Устройство" : "Browser & Device"}</th>
                          <th className={`px-4 py-2 ${isRtl ? "text-right" : "text-left"}`}>{lang === "he" ? "מקור מפנה" : lang === "ru" ? "Реферер" : "Referrer Source"}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-[10px] font-mono text-slate-600">
                        {selectedLog.clickDetails.slice().reverse().map((click, index) => {
                          const parsed = parseUserAgent(click.userAgent || "");
                          return (
                            <tr key={index} className="hover:bg-slate-50/30 transition-colors">
                              <td className="px-4 py-2" dir="ltr">
                                {new Date(click.timestamp).toLocaleString()}
                              </td>
                              <td className="px-4 py-2">
                                <span className="font-sans font-medium text-slate-700">{parsed.browser}</span> on <span className="font-sans font-medium text-slate-700">{parsed.device}</span>
                              </td>
                              <td className="px-4 py-2 truncate max-w-[200px]" title={click.referrer}>
                                {click.referrer || "Direct"}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-[#e2e8f0] flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-black text-white text-xs font-semibold rounded-[4px] transition-colors cursor-pointer"
              >
                {lang === "he" ? "סגור" : lang === "ru" ? "Закрыть" : "Close"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
