import React, { useState, useEffect, useMemo } from "react";
import {
  Link2,
  Globe,
  Sparkles,
  Copy,
  Plus,
  Trash2,
  Settings,
  Share2,
  RotateCcw,
  FileText,
  Check,
  Loader2,
  AlertCircle,
  BookmarkCheck,
  ExternalLink,
  QrCode,
  Download,
  Layers,
  LogIn,
  LogOut,
} from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { onAuthStateChanged } from "firebase/auth";
import {
  auth,
  signInWithGoogle,
  logout,
  getUserData,
  saveUserPreset,
  deleteUserPreset,
  saveUserTemplate,
  deleteUserTemplate,
  saveUserHistoryLog,
  deleteUserHistoryLog,
  saveUserShortenerSettings,
  clearUserHistoryLogs,
  isUsingDummyConfig,
} from "./lib/firebase";

import {
  CampaignPreset,
  UTMTemplate,
  HistoryLog,
  ShortenerSettings,
  CustomParameter,
} from "./types";

import UrlValidator from "./components/UrlValidator";
import SettingsModal from "./components/SettingsModal";
import TemplateManager from "./components/TemplateManager";
import PresetSelector from "./components/PresetSelector";
import HistoryLogTable from "./components/HistoryLogTable";
import BatchCreator from "./components/BatchCreator";

export default function App() {
  // Form State
  const [baseUrl, setBaseUrl] = useState("");
  const [utmSource, setUtmSource] = useState("");
  const [utmMedium, setUtmMedium] = useState("");
  const [utmCampaign, setUtmCampaign] = useState("");
  const [utmTerm, setUtmTerm] = useState("");
  const [utmContent, setUtmContent] = useState("");
  const [utmId, setUtmId] = useState("");
  const [customParams, setCustomParams] = useState<CustomParameter[]>([]);

  // Persistent Collections (LocalStorage state)
  const [presets, setPresets] = useState<CampaignPreset[]>(() => {
    const saved = localStorage.getItem("utm_campaign_presets");
    return saved ? JSON.parse(saved) : [];
  });

  const [customTemplates, setCustomTemplates] = useState<UTMTemplate[]>(() => {
    const saved = localStorage.getItem("utm_custom_templates");
    return saved ? JSON.parse(saved) : [];
  });

  const [historyLogs, setHistoryLogs] = useState<HistoryLog[]>(() => {
    const saved = localStorage.getItem("utm_campaign_history");
    return saved ? JSON.parse(saved) : [];
  });

  const [settings, setSettings] = useState<ShortenerSettings>(() => {
    const saved = localStorage.getItem("utm_shortener_settings");
    const defaults = {
      bitlyToken: "",
      rebrandlyKey: "",
      tinyurlToken: "",
      dubToken: "",
      bitlyDomain: "",
      rebrandlyDomain: "",
      tinyurlDomain: "",
      dubDomain: "",
    };
    return saved ? { ...defaults, ...JSON.parse(saved) } : defaults;
  });

  // Shortener Control States
  const [shortenerService, setShortenerService] = useState<"none" | "bitly" | "rebrandly" | "tinyurl" | "dub">("none");
  const [shortenedUrl, setShortenedUrl] = useState("");
  const [isShortening, setIsShortening] = useState(false);
  const [shorteningError, setShorteningError] = useState("");

  // System UI/Modal States
  const [activeTab, setActiveTab] = useState<"creator" | "batch" | "templates" | "history">("creator");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [currentTemplateId, setCurrentTemplateId] = useState<string | undefined>(undefined);
  const [currentPresetId, setCurrentPresetId] = useState<string | undefined>(undefined);
  const [copiedLink, setCopiedLink] = useState<"full" | "short" | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [qrTarget, setQrTarget] = useState<"full" | "short">("full");
  const [qrColor, setQrColor] = useState("#0F172A");

  // User Authentication State
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [showAuthErrorModal, setShowAuthErrorModal] = useState(false);
  const [authErrorMessage, setAuthErrorMessage] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setIsAuthLoading(true);
      if (user) {
        setCurrentUser(user);
        try {
          const userData = await getUserData(user.uid);
          
          if (userData.presets) setPresets(userData.presets);
          if (userData.templates) setCustomTemplates(userData.templates);
          if (userData.historyLogs) setHistoryLogs(userData.historyLogs);
          if (userData.settings) {
            setSettings(userData.settings);
          } else {
            // Reset to default settings if none saved on Cloud yet
            setSettings({
              bitlyToken: "",
              rebrandlyKey: "",
              tinyurlToken: "",
              dubToken: "",
              bitlyDomain: "",
              rebrandlyDomain: "",
              tinyurlDomain: "",
              dubDomain: "",
            });
          }
        } catch (error) {
          console.error("Error loading user data from cloud:", error);
          showTemporaryNotification("Error loading saved data from Cloud database.");
        }
      } else {
        setCurrentUser(null);
        // Fallback/load from localstorage for guest users
        const savedPresets = localStorage.getItem("utm_campaign_presets");
        setPresets(savedPresets ? JSON.parse(savedPresets) : []);

        const savedTemplates = localStorage.getItem("utm_custom_templates");
        setCustomTemplates(savedTemplates ? JSON.parse(savedTemplates) : []);

        const savedLogs = localStorage.getItem("utm_campaign_history");
        setHistoryLogs(savedLogs ? JSON.parse(savedLogs) : []);

        const savedSettings = localStorage.getItem("utm_shortener_settings");
        const defaults = {
          bitlyToken: "",
          rebrandlyKey: "",
          tinyurlToken: "",
          dubToken: "",
          bitlyDomain: "",
          rebrandlyDomain: "",
          tinyurlDomain: "",
          dubDomain: "",
        };
        setSettings(savedSettings ? { ...defaults, ...JSON.parse(savedSettings) } : defaults);
      }
      setIsAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    if (isUsingDummyConfig) {
      setAuthErrorMessage(
        "נראה שדף ה-GitHub Pages שלך נבנה ללא הגדרות ה-Firebase האמיתיות שלך (מכיוון שהקובץ firebase-applet-config.json נמצא ב-.gitignore ולא עולה ל-GitHub).\n\n" +
        "כדי לאפשר התחברות וסנכרון לענן ב-GitHub Pages, עליך לבצע את השלבים הבאים:\n\n" +
        "1. כנס ל-Repository שלך ב-GitHub.\n" +
        "2. מעבר אל Settings -> Secrets and variables -> Actions.\n" +
        "3. לחץ על 'New repository secret' והוסף את המשתנים הבאים (תוכל להעתיק את הערכים שלהם מקובץ הקונפיגורציה המקומי שלך ב-AI Studio):\n" +
        "   - VITE_FIREBASE_API_KEY\n" +
        "   - VITE_FIREBASE_AUTH_DOMAIN\n" +
        "   - VITE_FIREBASE_PROJECT_ID\n" +
        "   - VITE_FIREBASE_STORAGE_BUCKET\n" +
        "   - VITE_FIREBASE_MESSAGING_SENDER_ID\n" +
        "   - VITE_FIREBASE_APP_ID\n\n" +
        "4. לאחר הוספת ה-Secrets, בצע Push חדש או הפעל מחדש את ה-Workflow כדי לבנות מחדש את האתר עם הפרטים האמיתיים!"
      );
      setShowAuthErrorModal(true);
      return;
    }

    try {
      await signInWithGoogle();
      showTemporaryNotification("Successfully signed in with Google!");
    } catch (err: any) {
      console.error("Sign-in failure:", err);
      const isIframe = window.self !== window.top;
      if (isIframe || err.code === "auth/iframe-directory-not-supported" || err.code === "auth/popup-blocked" || err.message?.includes("iframe")) {
        setAuthErrorMessage(
          "התחברות עם גוגל חסומה בתוך חלון ה-iFrame של התצוגה המקדימה בשל מגבלות אבטחה של הדפדפנים על Cross-Origin. \n\nכדי להתחבר בהצלחה ולסנכרן את הנתונים שלך לענן (Firestore), אנא לחץ על כפתור ה- \"Open in new tab\" (פתח בלשונית חדשה) בפינה הימנית העליונה של מסך התצוגה המקדימה ב-AI Studio, והתחבר משם ללא שום בעיה!"
        );
      } else if (err.code === "auth/unauthorized-domain") {
        setAuthErrorMessage(
          "שגיאת דומיין לא מורשה (Unauthorized Domain).\n\n" +
          "עליך לאשר את הדומיין של GitHub Pages בתוך ממשק הניהול של Firebase:\n\n" +
          "1. היכנס ל-Firebase Console.\n" +
          "2. עבור ללשונית Authentication -> Settings (הגדרות) -> Authorized domains (דומיינים מורשים).\n" +
          "3. לחץ על 'Add domain' והוסף את הדומיין שלך: netolink.github.io\n" +
          "4. שמור ונסה להתחבר מחדש!"
        );
      } else {
        setAuthErrorMessage(err.message || "שגיאה בעת התחברות. אנא ודא שאישרת חלונות קופצים (Popups) בדפדפן, שהדומיין מורשה ב-Firebase Console ונסה שוב.");
      }
      setShowAuthErrorModal(true);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      showTemporaryNotification("Successfully signed out. Switched to local storage.");
    } catch (err: any) {
      console.error("Logout failure:", err);
      showTemporaryNotification("Sign-out failed.");
    }
  };

  // Sync to localStorage (for non-authenticated guest users only)
  useEffect(() => {
    if (!currentUser) {
      localStorage.setItem("utm_campaign_presets", JSON.stringify(presets));
    }
  }, [presets, currentUser]);

  useEffect(() => {
    if (!currentUser) {
      localStorage.setItem("utm_custom_templates", JSON.stringify(customTemplates));
    }
  }, [customTemplates, currentUser]);

  useEffect(() => {
    if (!currentUser) {
      localStorage.setItem("utm_campaign_history", JSON.stringify(historyLogs));
    }
  }, [historyLogs, currentUser]);

  useEffect(() => {
    if (!currentUser) {
      localStorage.setItem("utm_shortener_settings", JSON.stringify(settings));
    }
  }, [settings, currentUser]);

  // Reset shortened URL if the base assembled URL changes
  const fullAssembledUrl = useMemo(() => {
    if (!baseUrl) return "";
    try {
      // Basic validation for protocol
      let targetUrl = baseUrl.trim();
      if (!/^https?:\/\//i.test(targetUrl)) {
        targetUrl = "https://" + targetUrl;
      }
      const urlObj = new URL(targetUrl);

      if (utmSource.trim()) urlObj.searchParams.set("utm_source", utmSource.trim());
      if (utmMedium.trim()) urlObj.searchParams.set("utm_medium", utmMedium.trim());
      if (utmCampaign.trim()) urlObj.searchParams.set("utm_campaign", utmCampaign.trim());
      if (utmTerm.trim()) urlObj.searchParams.set("utm_term", utmTerm.trim());
      if (utmContent.trim()) urlObj.searchParams.set("utm_content", utmContent.trim());
      if (utmId.trim()) urlObj.searchParams.set("utm_id", utmId.trim());

      customParams.forEach((param) => {
        if (param.key.trim() && param.value.trim()) {
          urlObj.searchParams.set(param.key.trim(), param.value.trim());
        }
      });

      return urlObj.toString();
    } catch (e) {
      return "";
    }
  }, [baseUrl, utmSource, utmMedium, utmCampaign, utmTerm, utmContent, utmId, customParams]);

  useEffect(() => {
    setShortenedUrl("");
    setShorteningError("");
    setQrTarget("full");
  }, [fullAssembledUrl]);

  // Form Reset
  const handleResetForm = () => {
    setBaseUrl("");
    setUtmSource("");
    setUtmMedium("");
    setUtmCampaign("");
    setUtmTerm("");
    setUtmContent("");
    setUtmId("");
    setCustomParams([]);
    setCurrentTemplateId(undefined);
    setCurrentPresetId(undefined);
    setShortenedUrl("");
    setShorteningError("");
    showTemporaryNotification("Form fields cleared.");
  };

  // Helper notification toast
  const showTemporaryNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  // Select Template: preserves base url, updates fields
  const handleSelectTemplate = (template: UTMTemplate) => {
    setUtmSource(template.utmSource || "");
    setUtmMedium(template.utmMedium || "");
    setUtmCampaign(template.utmCampaign || "");
    setUtmTerm(template.utmTerm || "");
    setUtmContent(template.utmContent || "");
    setUtmId(template.utmId || "");

    if (template.customParams) {
      setCustomParams(
        template.customParams.map((p, idx) => ({
          id: `tpl-${idx}-${Date.now()}`,
          key: p.key,
          value: p.value,
        }))
      );
    } else {
      setCustomParams([]);
    }

    setCurrentTemplateId(template.id);
    setCurrentPresetId(undefined);
    setActiveTab("creator");
    showTemporaryNotification(`Applied template: ${template.name}`);
  };

  // Save current form setup as template
  const handleSaveCurrentAsTemplate = async (name: string, description: string) => {
    const newTemplate: UTMTemplate = {
      id: `custom-template-${Date.now()}`,
      name,
      description,
      isBuiltIn: false,
      utmSource,
      utmMedium,
      utmCampaign,
      utmTerm,
      utmContent,
      utmId,
      customParams: customParams
        .filter((p) => p.key.trim() && p.value.trim())
        .map((p) => ({ key: p.key.trim(), value: p.value.trim() })),
    };
    setCustomTemplates([newTemplate, ...customTemplates]);
    showTemporaryNotification(`Saved template "${name}" successfully.`);

    if (currentUser) {
      try {
        await saveUserTemplate(currentUser.uid, newTemplate);
      } catch (err) {
        showTemporaryNotification("Failed to save template to Cloud database.");
      }
    }
  };

  // Delete custom template
  const handleDeleteCustomTemplate = async (id: string) => {
    setCustomTemplates(customTemplates.filter((t) => t.id !== id));
    if (currentTemplateId === id) {
      setCurrentTemplateId(undefined);
    }
    showTemporaryNotification("Template removed.");

    if (currentUser) {
      try {
        await deleteUserTemplate(currentUser.uid, id);
      } catch (err) {
        showTemporaryNotification("Failed to delete template from Cloud database.");
      }
    }
  };

  // Select Preset: loads EVERYTHING including destination URL
  const handleSelectPreset = (preset: CampaignPreset) => {
    setBaseUrl(preset.baseUrl);
    setUtmSource(preset.utmSource);
    setUtmMedium(preset.utmMedium);
    setUtmCampaign(preset.utmCampaign);
    setUtmTerm(preset.utmTerm);
    setUtmContent(preset.utmContent);
    setUtmId(preset.utmId);
    setCustomParams(preset.customParams || []);
    setCurrentPresetId(preset.id);
    setCurrentTemplateId(undefined);
    setActiveTab("creator");
    showTemporaryNotification(`Loaded preset: ${preset.name}`);
  };

  // Save Preset
  const handleSavePreset = async (name: string) => {
    const newPreset: CampaignPreset = {
      id: `preset-${Date.now()}`,
      name,
      baseUrl,
      utmSource,
      utmMedium,
      utmCampaign,
      utmTerm,
      utmContent,
      utmId,
      customParams,
      createdAt: new Date().toISOString(),
    };
    setPresets([newPreset, ...presets]);
    setCurrentPresetId(newPreset.id);
    showTemporaryNotification(`Preset "${name}" saved.`);

    if (currentUser) {
      try {
        await saveUserPreset(currentUser.uid, newPreset);
      } catch (err) {
        showTemporaryNotification("Failed to save preset to Cloud database.");
      }
    }
  };

  // Delete Preset
  const handleDeletePreset = async (id: string) => {
    setPresets(presets.filter((p) => p.id !== id));
    if (currentPresetId === id) {
      setCurrentPresetId(undefined);
    }
    showTemporaryNotification("Preset removed.");

    if (currentUser) {
      try {
        await deleteUserPreset(currentUser.uid, id);
      } catch (err) {
        showTemporaryNotification("Failed to delete preset from Cloud database.");
      }
    }
  };

  // Custom parameters management
  const handleAddCustomParam = () => {
    setCustomParams([
      ...customParams,
      { id: `param-${Date.now()}-${Math.random()}`, key: "", value: "" },
    ]);
  };

  const handleUpdateCustomParam = (id: string, field: "key" | "value", value: string) => {
    setCustomParams(
      customParams.map((p) => {
        if (p.id === id) {
          return { ...p, [field]: value };
        }
        return p;
      })
    );
  };

  const handleRemoveCustomParam = (id: string) => {
    setCustomParams(customParams.filter((p) => p.id !== id));
  };

  // URL Shortening triggering via backend API proxy
  const handleShortenLink = async () => {
    if (!fullAssembledUrl) {
      setShorteningError("Please construct a valid destination URL before shortening.");
      return;
    }

    setIsShortening(true);
    setShorteningError("");
    setShortenedUrl("");

    let apiKeyToUse = "";
    let domainToUse = "";

    if (shortenerService === "bitly") {
      apiKeyToUse = settings.bitlyToken;
      domainToUse = settings.bitlyDomain;
    } else if (shortenerService === "rebrandly") {
      apiKeyToUse = settings.rebrandlyKey;
      domainToUse = settings.rebrandlyDomain;
    } else if (shortenerService === "tinyurl") {
      apiKeyToUse = settings.tinyurlToken;
      domainToUse = settings.tinyurlDomain;
    } else if (shortenerService === "dub") {
      apiKeyToUse = settings.dubToken;
      domainToUse = settings.dubDomain;
    }

    try {
      const res = await fetch("/api/shorten", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service: shortenerService,
          longUrl: fullAssembledUrl,
          apiKey: apiKeyToUse || undefined,
          customDomain: domainToUse || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to shorten. Check API Configuration.");
      }

      setShortenedUrl(data.shortUrl);
      setQrTarget("short");
      showTemporaryNotification("Short link generated successfully!");
    } catch (err: any) {
      setShorteningError(err.message || "An unexpected error occurred during link shortening.");
    } finally {
      setIsShortening(false);
    }
  };

  // Copy Full link
  const handleCopyFullUrl = () => {
    if (!fullAssembledUrl) return;
    navigator.clipboard.writeText(fullAssembledUrl);
    setCopiedLink("full");
    setTimeout(() => setCopiedLink(null), 1500);
    showTemporaryNotification("Assembled UTM link copied!");
  };

  // Copy Short Link
  const handleCopyShortUrl = () => {
    if (!shortenedUrl) return;
    navigator.clipboard.writeText(shortenedUrl);
    setCopiedLink("short");
    setTimeout(() => setCopiedLink(null), 1500);
    showTemporaryNotification("Shortened URL copied!");
  };

  // Download QR Code as PNG
  const downloadQRCode = () => {
    const canvas = document.getElementById("qr-code-canvas") as HTMLCanvasElement | null;
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `qr-code-${utmCampaign.trim() || "campaign"}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showTemporaryNotification("QR code downloaded!");
  };

  // Save generated details to History Log
  const handleSaveToHistoryLog = async () => {
    if (!fullAssembledUrl) return;
    
    // Construct campaign title for log
    let campaignLogName = utmCampaign.trim();
    if (!campaignLogName) {
      campaignLogName = `Campaign [Source: ${utmSource || "N/A"}]`;
    }

    const newLog: HistoryLog = {
      id: `log-${Date.now()}`,
      campaignName: campaignLogName,
      baseUrl: baseUrl || fullAssembledUrl,
      fullUrl: fullAssembledUrl,
      shortUrl: shortenedUrl || fullAssembledUrl,
      shortenerService: shortenedUrl ? shortenerService : "none",
      createdAt: new Date().toISOString(),
    };

    setHistoryLogs([newLog, ...historyLogs]);
    showTemporaryNotification("Link archived in history ledger.");

    if (currentUser) {
      try {
        await saveUserHistoryLog(currentUser.uid, newLog);
      } catch (err) {
        showTemporaryNotification("Failed to archive log to Cloud database.");
      }
    }
  };

  const handleDeleteLog = async (id: string) => {
    setHistoryLogs(historyLogs.filter((log) => log.id !== id));
    showTemporaryNotification("Entry removed from ledger.");

    if (currentUser) {
      try {
        await deleteUserHistoryLog(currentUser.uid, id);
      } catch (err) {
        showTemporaryNotification("Failed to delete log from Cloud database.");
      }
    }
  };

  const handleClearAllHistory = async () => {
    if (window.confirm("Are you sure you want to permanently delete all archived history logs? This action cannot be undone.")) {
      const logIds = historyLogs.map((l) => l.id);
      setHistoryLogs([]);
      showTemporaryNotification("All history logs cleared.");

      if (currentUser && logIds.length > 0) {
        try {
          await clearUserHistoryLogs(currentUser.uid, logIds);
        } catch (err) {
          showTemporaryNotification("Failed to clear logs from Cloud database.");
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f9fb] text-[#191c1e] font-sans antialiased pb-16 selection:bg-[#000000] selection:text-white">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/95 border-b border-[#e2e8f0] backdrop-blur-md px-6 py-4 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#000000] text-white rounded-[4px] shadow-sm flex items-center justify-center">
              <Link2 className="w-5.5 h-5.5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-[#191c1e] font-display">UTM Campaign Builder</h1>
              <p className="text-xs text-[#64748B] font-sans">Construct, validate, shorten, and archive enterprise campaign URLs</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Auth Status & Sync */}
            {isAuthLoading ? (
              <div className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 rounded-[4px] border border-slate-100">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-400" />
                <span className="text-[11px] text-slate-400 font-medium font-sans">Checking sync...</span>
              </div>
            ) : currentUser ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-[4px] border border-emerald-100 font-sans" title="Syncing to Google Cloud Firestore database">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-bold tracking-widest uppercase">Cloud</span>
                  {currentUser.photoURL ? (
                    <img
                      src={currentUser.photoURL}
                      alt={currentUser.displayName || "User"}
                      className="w-5 h-5 rounded-full object-cover border border-emerald-200"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-[10px] font-bold">
                      {currentUser.displayName ? currentUser.displayName[0] : "U"}
                    </div>
                  )}
                  <span className="text-xs font-semibold max-w-[100px] truncate hidden md:inline">
                    {currentUser.displayName || currentUser.email}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1 px-2.5 py-2 bg-white hover:bg-red-50 border border-[#e2e8f0] text-slate-500 hover:text-red-600 rounded-[4px] text-xs font-semibold shadow-xs transition-colors cursor-pointer font-sans"
                  title="Sign Out from Google Campaign account"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 text-slate-500 rounded-[4px] border border-slate-100 font-sans" title="Your campaigns are only saved on this device (offline)">
                  <span className="text-[10px] font-bold tracking-widest uppercase text-slate-400">Guest Mode</span>
                </div>
                <button
                  onClick={handleLogin}
                  className="flex items-center gap-2 px-3 py-2 bg-white hover:bg-slate-50 border border-[#e2e8f0] text-slate-700 hover:text-slate-900 rounded-[4px] text-xs font-semibold shadow-xs transition-all cursor-pointer font-sans"
                  title="Connect with Google to save templates, presets, and history logs securely"
                >
                  <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                  </svg>
                  <span>Sign In with Google</span>
                </button>
              </div>
            )}

            <button
              onClick={() => setIsSettingsOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 border border-[#e2e8f0] text-slate-700 rounded-[4px] text-xs font-semibold shadow-xs transition-colors cursor-pointer font-sans"
              title="Configure Bitly / Rebrandly / TinyURL credentials"
            >
              <Settings className="w-3.5 h-3.5" />
              API Integrations
            </button>
            <button
              onClick={handleResetForm}
              className="p-2 bg-white hover:bg-slate-50 border border-[#e2e8f0] text-slate-400 hover:text-slate-700 rounded-[4px] shadow-xs transition-colors cursor-pointer"
              title="Reset form fields"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Tab Navigation Bar */}
      <div className="bg-white border-b border-[#e2e8f0] sticky top-[73px] z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-8 overflow-x-auto whitespace-nowrap">
            <button
              onClick={() => setActiveTab("creator")}
              className={`py-4 px-1 text-sm font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer font-sans ${
                activeTab === "creator"
                  ? "border-[#000000] text-[#191c1e]"
                  : "border-transparent text-[#64748B] hover:text-[#191c1e] hover:border-slate-200"
              }`}
            >
              <Sparkles className="w-4 h-4" />
              Campaign Link Creator
            </button>
            <button
              onClick={() => setActiveTab("batch")}
              className={`py-4 px-1 text-sm font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer font-sans ${
                activeTab === "batch"
                  ? "border-[#000000] text-[#191c1e]"
                  : "border-transparent text-[#64748B] hover:text-[#191c1e] hover:border-slate-200"
              }`}
            >
              <Layers className="w-4 h-4" />
              Batch Creation
            </button>
            <button
              onClick={() => setActiveTab("templates")}
              className={`py-4 px-1 text-sm font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer font-sans ${
                activeTab === "templates"
                  ? "border-[#000000] text-[#191c1e]"
                  : "border-transparent text-[#64748B] hover:text-[#191c1e] hover:border-slate-200"
              }`}
            >
              <FileText className="w-4 h-4" />
              Templates & Presets
              {(customTemplates.length > 0 || presets.length > 0) && (
                <span className="px-1.5 py-0.5 text-[10px] bg-slate-100 text-slate-600 rounded-full font-bold">
                  {customTemplates.length + presets.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`py-4 px-1 text-sm font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer font-sans ${
                activeTab === "history"
                  ? "border-[#000000] text-[#191c1e]"
                  : "border-transparent text-[#64748B] hover:text-[#191c1e] hover:border-slate-200"
              }`}
            >
              <Globe className="w-4 h-4" />
              Campaign History Log
              {historyLogs.length > 0 && (
                <span className="px-1.5 py-0.5 text-[10px] bg-slate-900 text-white rounded-full font-bold">
                  {historyLogs.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid Wrapper */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 mt-8 space-y-8">
        
        {/* Dynamic Status Toast Indicator */}
        {notification && (
          <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-[#191c1e] text-white text-xs font-bold rounded-[4px] shadow-lg border border-[#e2e8f0] animate-slide-up font-sans">
            <BookmarkCheck className="w-4 h-4 text-emerald-400" />
            <span>{notification}</span>
          </div>
        )}

        {/* Tab 1: Campaign Link Creator */}
        {activeTab === "creator" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Construction Panel (Takes 2/3 space) */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Primary Form */}
              <div className="bg-white border border-[#e2e8f0] rounded-[8px] p-6 shadow-xs space-y-6">
                <div className="border-b border-slate-100 pb-4">
                  <h2 className="text-base font-bold text-[#191c1e] flex items-center gap-2 font-display">
                    <Globe className="w-4.5 h-4.5 text-slate-500" />
                    Destination URL & standard UTMs
                  </h2>
                  <p className="text-xs text-[#64748B] mt-0.5 font-sans">Specify destination and associate basic tracking tags</p>
                </div>

                {/* Website Destination Input */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-[#64748B] uppercase tracking-widest text-[10px] font-sans">
                    Website URL <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Globe className="w-4 h-4" />
                    </span>
                    <input
                      type="url"
                      placeholder="e.g. https://mywebsite.com/landing-page"
                      required
                      value={baseUrl}
                      onChange={(e) => setBaseUrl(e.target.value)}
                      className="w-full text-xs pl-10 pr-3 py-3 border border-[#e2e8f0] bg-white focus:bg-white rounded-[4px] focus:outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 transition-all font-mono"
                    />
                  </div>
                  {/* Real-time Validation Component */}
                  <UrlValidator url={baseUrl} />
                </div>

                {/* Core Standard UTM Parameters Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">
                  {/* Campaign Source */}
                  <div className="space-y-1.5 font-sans">
                    <div className="flex justify-between">
                      <label className="block text-xs font-bold text-[#64748B] uppercase tracking-widest text-[10px]">
                        Source <span className="text-red-500">*</span>
                      </label>
                      <span className="text-[9px] text-[#64748B] font-mono">utm_source</span>
                    </div>
                    <input
                      type="text"
                      placeholder="e.g. google, newsletter"
                      required
                      value={utmSource}
                      onChange={(e) => setUtmSource(e.target.value)}
                      className="w-full text-xs px-3 py-2.5 border border-[#e2e8f0] bg-white rounded-[4px] focus:outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20"
                    />
                  </div>

                  {/* Campaign Medium */}
                  <div className="space-y-1.5 font-sans">
                    <div className="flex justify-between">
                      <label className="block text-xs font-bold text-[#64748B] uppercase tracking-widest text-[10px]">
                        Medium <span className="text-red-500">*</span>
                      </label>
                      <span className="text-[9px] text-[#64748B] font-mono">utm_medium</span>
                    </div>
                    <input
                      type="text"
                      placeholder="e.g. cpc, email, banner"
                      required
                      value={utmMedium}
                      onChange={(e) => setUtmMedium(e.target.value)}
                      className="w-full text-xs px-3 py-2.5 border border-[#e2e8f0] bg-white rounded-[4px] focus:outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20"
                    />
                  </div>

                  {/* Campaign Name */}
                  <div className="space-y-1.5 font-sans">
                    <div className="flex justify-between">
                      <label className="block text-xs font-bold text-[#64748B] uppercase tracking-widest text-[10px]">
                        Campaign Name <span className="text-red-500">*</span>
                      </label>
                      <span className="text-[9px] text-[#64748B] font-mono">utm_campaign</span>
                    </div>
                    <input
                      type="text"
                      placeholder="e.g. summer_sale_2026"
                      required
                      value={utmCampaign}
                      onChange={(e) => setUtmCampaign(e.target.value)}
                      className="w-full text-xs px-3 py-2.5 border border-[#e2e8f0] bg-white rounded-[4px] focus:outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20"
                    />
                  </div>

                  {/* Campaign Term */}
                  <div className="space-y-1.5 font-sans">
                    <div className="flex justify-between">
                      <label className="block text-xs font-bold text-[#64748B] uppercase tracking-widest text-[10px]">
                        Campaign Term
                      </label>
                      <span className="text-[9px] text-[#64748B] font-mono">utm_term</span>
                    </div>
                    <input
                      type="text"
                      placeholder="e.g. running+shoes"
                      value={utmTerm}
                      onChange={(e) => setUtmTerm(e.target.value)}
                      className="w-full text-xs px-3 py-2.5 border border-[#e2e8f0] bg-white rounded-[4px] focus:outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20"
                    />
                  </div>

                  {/* Campaign Content */}
                  <div className="space-y-1.5 font-sans">
                    <div className="flex justify-between">
                      <label className="block text-xs font-bold text-[#64748B] uppercase tracking-widest text-[10px]">
                        Campaign Content
                      </label>
                      <span className="text-[9px] text-[#64748B] font-mono">utm_content</span>
                    </div>
                    <input
                      type="text"
                      placeholder="e.g. banner_cta_red"
                      value={utmContent}
                      onChange={(e) => setUtmContent(e.target.value)}
                      className="w-full text-xs px-3 py-2.5 border border-[#e2e8f0] bg-white rounded-[4px] focus:outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20"
                    />
                  </div>

                  {/* Campaign ID */}
                  <div className="space-y-1.5 font-sans">
                    <div className="flex justify-between">
                      <label className="block text-xs font-bold text-[#64748B] uppercase tracking-widest text-[10px]">
                        Campaign ID
                      </label>
                      <span className="text-[9px] text-[#64748B] font-mono">utm_id</span>
                    </div>
                    <input
                      type="text"
                      placeholder="e.g. sales_id_77"
                      value={utmId}
                      onChange={(e) => setUtmId(e.target.value)}
                      className="w-full text-xs px-3 py-2.5 border border-[#e2e8f0] bg-white rounded-[4px] focus:outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20"
                    />
                  </div>
                </div>

                {/* Custom Extra Parameters Accordion / Fields */}
                <div className="border-t border-slate-100 pt-5 space-y-3 font-sans">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-[#191c1e] uppercase tracking-widest text-[10px]">Custom Parameters</h4>
                      <p className="text-[10px] text-[#64748B]">Append custom non-standard tags (e.g., gclid, partner_id, fbclid)</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddCustomParam}
                      className="flex items-center gap-1 text-xs text-[#3B82F6] font-bold bg-blue-50/50 hover:bg-blue-50 px-2.5 py-1 rounded-[4px] transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Parameter
                    </button>
                  </div>

                  {customParams.length > 0 ? (
                    <div className="space-y-2">
                      {customParams.map((param) => (
                        <div key={param.id} className="flex gap-2.5 items-center animate-fade-in">
                          <input
                            type="text"
                            placeholder="Key (e.g. gclid)"
                            value={param.key}
                            onChange={(e) => handleUpdateCustomParam(param.id, "key", e.target.value)}
                            className="flex-1 text-xs px-3 py-2 border border-[#e2e8f0] bg-white rounded-[4px] focus:outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 font-mono"
                          />
                          <input
                            type="text"
                            placeholder="Value (e.g. true)"
                            value={param.value}
                            onChange={(e) => handleUpdateCustomParam(param.id, "value", e.target.value)}
                            className="flex-1 text-xs px-3 py-2 border border-[#e2e8f0] bg-white rounded-[4px] focus:outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 font-mono"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveCustomParam(param.id)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-slate-50 rounded-[4px] transition-colors cursor-pointer"
                            title="Remove Parameter"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-5 text-center text-[11px] text-[#64748B] border border-dashed border-[#e2e8f0] rounded-[4px] bg-slate-50/30">
                      No custom parameters configured yet.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Live URL Output & Shortening Panel (Takes 1/3 space) */}
            <div className="lg:col-span-1 space-y-6">
              {fullAssembledUrl ? (
                <div className="bg-white border border-[#e2e8f0] rounded-[8px] p-6 shadow-xs space-y-6 sticky top-[160px]">
                  <div className="border-b border-slate-100 pb-4">
                    <h3 className="text-base font-bold text-[#191c1e] flex items-center gap-2 font-display">
                      <Sparkles className="w-4.5 h-4.5 text-amber-500 fill-amber-50" />
                      Campaign Destination
                    </h3>
                    <p className="text-xs text-[#64748B] mt-0.5 font-sans">Your tracking link is compiled dynamically below</p>
                  </div>

                  {/* Display Full URL */}
                  <div className="space-y-2 font-sans">
                    <div className="flex items-center justify-between text-[11px] text-[#64748B] font-bold">
                      <span>CONSTRUCTED UTM URL</span>
                      <button
                        onClick={handleCopyFullUrl}
                        className="text-[#3B82F6] hover:text-[#3B82F6]/80 flex items-center gap-1 font-bold hover:underline cursor-pointer"
                      >
                        {copiedLink === "full" ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            Copy Link
                          </>
                        )}
                      </button>
                    </div>
                    <div className="p-3.5 bg-slate-50 border border-[#e2e8f0] rounded-[4px] text-slate-700 text-xs font-mono break-all leading-relaxed max-h-32 overflow-y-auto shadow-inner">
                      {fullAssembledUrl}
                    </div>
                  </div>

                  {/* Shorten Options Grid */}
                  <div className="space-y-3 pt-2 font-sans">
                    <label className="block text-xs font-bold text-[#64748B] uppercase tracking-widest text-[10px]">
                      Select Shortener Service
                    </label>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-2">
                      {/* None */}
                      <div
                        onClick={() => setShortenerService("none")}
                        className={`p-2.5 border rounded-[4px] cursor-pointer text-center flex flex-col items-center justify-center transition-all ${
                          shortenerService === "none"
                            ? "border-[#000000] bg-[#191c1e] text-white font-bold"
                            : "border-[#e2e8f0] bg-white hover:border-[#3B82F6] text-slate-600"
                        }`}
                      >
                        <div className="text-xs font-bold">None</div>
                        <span className="text-[9px] text-[#64748B]">Direct URL</span>
                      </div>

                      {/* Bitly */}
                      <div
                        onClick={() => setShortenerService("bitly")}
                        className={`p-2.5 border rounded-[4px] cursor-pointer text-center flex flex-col items-center justify-center gap-0.5 transition-all ${
                          shortenerService === "bitly"
                            ? "border-orange-500 bg-orange-50 text-orange-950 font-bold"
                            : "border-[#e2e8f0] bg-white hover:border-[#3B82F6] text-slate-600"
                        }`}
                      >
                        <div className="text-xs font-bold">Bitly</div>
                        <span className="text-[9px] text-[#64748B]">bit.ly</span>
                      </div>

                      {/* Rebrandly */}
                      <div
                        onClick={() => setShortenerService("rebrandly")}
                        className={`p-2.5 border rounded-[4px] cursor-pointer text-center flex flex-col items-center justify-center gap-0.5 transition-all ${
                          shortenerService === "rebrandly"
                            ? "border-[#3B82F6] bg-blue-50 text-blue-950 font-bold"
                            : "border-[#e2e8f0] bg-white hover:border-[#3B82F6] text-slate-600"
                        }`}
                      >
                        <div className="text-xs font-bold">Rebrandly</div>
                        <span className="text-[9px] text-[#64748B]">rebrand.ly</span>
                      </div>

                      {/* DUB.co */}
                      <div
                        onClick={() => setShortenerService("dub")}
                        className={`p-2.5 border rounded-[4px] cursor-pointer text-center flex flex-col items-center justify-center gap-0.5 transition-all ${
                          shortenerService === "dub"
                            ? "border-indigo-500 bg-indigo-50 text-indigo-950 font-bold"
                            : "border-[#e2e8f0] bg-white hover:border-[#3B82F6] text-slate-600"
                        }`}
                      >
                        <div className="text-xs font-bold">DUB.co</div>
                        <span className="text-[9px] text-[#64748B]">dub.sh</span>
                      </div>

                      {/* TinyURL */}
                      <div
                        onClick={() => setShortenerService("tinyurl")}
                        className={`p-2.5 border rounded-[4px] cursor-pointer text-center flex flex-col items-center justify-center gap-0.5 transition-all ${
                          shortenerService === "tinyurl"
                            ? "border-emerald-500 bg-emerald-50 text-emerald-950 font-bold"
                            : "border-[#e2e8f0] bg-white hover:border-[#3B82F6] text-slate-600"
                        }`}
                      >
                        <div className="text-xs font-bold">TinyURL</div>
                        <span className="text-[9px] text-[#64748B]">Free / API</span>
                      </div>
                    </div>
                  </div>

                  {/* Shortener Submission Trigger Panel */}
                  {shortenerService !== "none" && (
                    <div className="p-4 border border-[#e2e8f0] bg-slate-50/50 rounded-[4px] flex flex-col gap-3 font-sans">
                      <div className="space-y-1">
                        <div className="text-xs font-bold text-[#191c1e]">
                          Shorten with {shortenerService.toUpperCase()}
                        </div>
                        <p className="text-[10px] text-[#64748B]">
                          {shortenerService === "tinyurl" && !settings.tinyurlToken
                            ? "Will execute using the free anonymous TinyURL API."
                            : `Using credentials configured in settings.`}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={handleShortenLink}
                        disabled={isShortening}
                        className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#191c1e] text-white hover:bg-black disabled:bg-slate-200 disabled:text-[#64748B] rounded-[4px] text-xs font-bold shadow-xs transition-all cursor-pointer"
                      >
                        {isShortening ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-400" />
                            Shortening...
                          </>
                        ) : (
                          "Generate Short Link"
                        )}
                      </button>
                    </div>
                  )}

                  {/* Display Shortener API Errors */}
                  {shorteningError && (
                    <div className="p-3.5 bg-red-50 border border-red-100 rounded-[4px] text-red-700 text-xs flex gap-2.5 items-start font-sans">
                      <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-red-800">API Error:</span> {shorteningError}
                        <div className="text-[10px] text-red-500 mt-1">
                          Check your API Token in the top right integrations menu.
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Display Shortened Link */}
                  {shortenedUrl && (
                    <div className="space-y-2 p-4 bg-emerald-50/40 border border-emerald-100/60 rounded-[4px] animate-fade-in font-sans">
                      <div className="flex items-center justify-between text-[11px] text-emerald-800 font-bold">
                        <span>SHORTENED LINK</span>
                        <button
                          onClick={handleCopyShortUrl}
                          className="text-emerald-700 hover:text-emerald-900 flex items-center gap-1 font-bold hover:underline cursor-pointer"
                        >
                          {copiedLink === "short" ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              Copy
                            </>
                          )}
                        </button>
                      </div>
                      <div className="p-3 bg-white border border-[#e2e8f0] rounded-[4px] text-[#191c1e] font-mono text-xs font-bold flex justify-between items-center">
                        <span className="truncate mr-2">{shortenedUrl}</span>
                        <a
                          href={shortenedUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1 hover:bg-slate-100 rounded-[4px] text-slate-400 hover:text-slate-700 transition-all cursor-pointer"
                          title="Open Shortened Link"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  )}

                  {/* QR Code Generator Section */}
                  <div className="border-t border-slate-100 pt-4 space-y-3 font-sans">
                    <div className="flex items-center justify-between">
                      <h4 className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest flex items-center gap-1.5 font-sans">
                        <QrCode className="w-3.5 h-3.5 text-slate-400" />
                        Campaign QR Code
                      </h4>
                      {shortenedUrl && (
                        <div className="flex bg-slate-100 p-0.5 rounded-[4px] text-[10px]">
                          <button
                            type="button"
                            onClick={() => setQrTarget("full")}
                            className={`px-2 py-0.5 rounded-[4px] font-bold cursor-pointer transition-all ${
                              qrTarget === "full"
                                ? "bg-white text-slate-800 shadow-xs"
                                : "text-slate-500 hover:text-slate-800"
                            }`}
                          >
                            Full UTM
                          </button>
                          <button
                            type="button"
                            onClick={() => setQrTarget("short")}
                            className={`px-2 py-0.5 rounded-[4px] font-bold cursor-pointer transition-all ${
                              qrTarget === "short"
                                ? "bg-white text-slate-800 shadow-xs"
                                : "text-slate-500 hover:text-slate-800"
                            }`}
                          >
                            Short URL
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-50/50 p-3.5 rounded-[4px] border border-[#e2e8f0]">
                      {/* Canvas Container */}
                      <div className="bg-white p-2 rounded-[4px] shadow-xs border border-[#e2e8f0] shrink-0 animate-fade-in">
                        <QRCodeCanvas
                          id="qr-code-canvas"
                          value={qrTarget === "short" && shortenedUrl ? shortenedUrl : fullAssembledUrl}
                          size={110}
                          level="H"
                          bgColor="#FFFFFF"
                          fgColor={qrColor}
                          includeMargin={false}
                        />
                      </div>

                      <div className="space-y-2 flex-1 w-full text-center sm:text-left">
                        <div className="flex items-center justify-center sm:justify-start gap-1.5">
                          <span className="text-[10px] text-[#64748B] font-bold">COLOR:</span>
                          {[
                            { hex: "#0F172A", name: "Slate", bg: "bg-slate-900" },
                            { hex: "#2563EB", name: "Blue", bg: "bg-blue-600" },
                            { hex: "#059669", name: "Emerald", bg: "bg-emerald-600" },
                            { hex: "#D97706", name: "Amber", bg: "bg-amber-600" },
                          ].map((c) => (
                            <button
                              key={c.hex}
                              type="button"
                              onClick={() => setQrColor(c.hex)}
                              className={`w-3.5 h-3.5 rounded-full border cursor-pointer transition-all ${c.bg} ${
                                qrColor === c.hex
                                  ? "ring-2 ring-offset-1 ring-blue-500 scale-110"
                                  : "border-transparent opacity-80 hover:opacity-100"
                              }`}
                              title={c.name}
                            />
                          ))}
                        </div>

                        <div className="text-[10px] text-[#64748B] leading-relaxed font-mono truncate max-w-[180px] sm:max-w-[200px] mx-auto sm:mx-0">
                          Target: <span className="text-slate-600 font-bold">{qrTarget === "short" && shortenedUrl ? shortenedUrl : fullAssembledUrl}</span>
                        </div>

                        <button
                          type="button"
                          onClick={downloadQRCode}
                          className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-[#3B82F6] hover:text-[#3B82F6]/80 rounded-[4px] text-xs font-bold transition-colors cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          Download PNG
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* History Preservation Button */}
                  <div className="border-t border-slate-100 pt-4 flex gap-2.5 font-sans">
                    <button
                      type="button"
                      onClick={handleSaveToHistoryLog}
                      className="w-full flex items-center justify-center gap-1.5 px-4 py-2 bg-[#191c1e] text-white hover:bg-black rounded-[4px] text-xs font-bold transition-colors shadow-xs cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      Save to History Log
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-100/30 border border-dashed border-[#e2e8f0] rounded-[8px] py-12 px-6 text-center space-y-2 text-[#64748B] sticky top-[160px] font-sans">
                  <Globe className="w-8 h-8 mx-auto text-slate-200" />
                  <h4 className="font-bold text-xs text-[#191c1e]">Live URL Constructor</h4>
                  <p className="text-[10px] text-[#64748B] max-w-sm mx-auto">Input your website URL and marketing parameters to compile tracking links and use shorteners here.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab: Batch Creation */}
        {activeTab === "batch" && (
          <BatchCreator
            settings={settings}
            shortenerService={shortenerService}
            onAddHistoryLogs={async (newLogs) => {
              setHistoryLogs([...newLogs, ...historyLogs]);
              if (currentUser) {
                try {
                  for (const log of newLogs) {
                    await saveUserHistoryLog(currentUser.uid, log);
                  }
                } catch (err) {
                  showTemporaryNotification("Failed to sync batch logs to Cloud database.");
                }
              }
            }}
            showNotification={showTemporaryNotification}
          />
        )}

        {/* Tab 2: Saved Templates & Presets */}
        {activeTab === "templates" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white border border-[#e2e8f0] rounded-[8px] p-6 shadow-xs">
              <TemplateManager
                customTemplates={customTemplates}
                onSelectTemplate={handleSelectTemplate}
                onSaveCurrentAsTemplate={handleSaveCurrentAsTemplate}
                onDeleteCustomTemplate={handleDeleteCustomTemplate}
                currentActiveId={currentTemplateId}
              />
            </div>
            <div className="bg-white border border-[#e2e8f0] rounded-[8px] p-6 shadow-xs">
              <PresetSelector
                presets={presets}
                onSelectPreset={handleSelectPreset}
                onSavePreset={handleSavePreset}
                onDeletePreset={handleDeletePreset}
                currentPresetId={currentPresetId}
              />
            </div>
          </div>
        )}

        {/* Tab 3: Campaign History Log */}
        {activeTab === "history" && (
          <div className="bg-white border border-[#e2e8f0] rounded-[8px] p-6 shadow-xs">
            <HistoryLogTable
              logs={historyLogs}
              onDeleteLog={handleDeleteLog}
              onClearAll={handleClearAllHistory}
            />
          </div>
        )}

      </main>

      {/* Settings Modal (Credentials configuration drawer) */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSave={async (newSettings) => {
          setSettings(newSettings);
          if (currentUser) {
            try {
              await saveUserShortenerSettings(currentUser.uid, newSettings);
              showTemporaryNotification("API credentials saved securely to Cloud.");
            } catch (err) {
              showTemporaryNotification("Failed to save credentials to Cloud database.");
            }
          } else {
            showTemporaryNotification("API credentials saved locally.");
          }
        }}
      />

      {/* Auth Error Modal */}
      {showAuthErrorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fade-in" dir="rtl">
          <div className="relative w-full max-w-md bg-white rounded-[8px] shadow-xl border border-[#e2e8f0] p-6 flex flex-col gap-4 text-right">
            <div className="flex items-center gap-3 justify-start border-b border-slate-100 pb-3">
              <div className="p-2 bg-amber-50 text-amber-600 rounded-[4px]">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#191c1e] font-display">התחברות באמצעות גוגל חסומה</h3>
                <p className="text-[10px] text-slate-400 font-sans">Google Sign-In Blocked in Preview Frame</p>
              </div>
            </div>
            
            <div className="text-xs text-slate-700 leading-relaxed font-sans whitespace-pre-wrap">
              {authErrorMessage}
            </div>

            <div className="flex justify-end gap-2 mt-2">
              <button
                onClick={() => setShowAuthErrorModal(false)}
                className="px-4 py-2 bg-slate-900 hover:bg-black text-white text-xs font-semibold rounded-[4px] shadow-sm transition-colors cursor-pointer font-sans"
              >
                הבנתי, תודה
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
