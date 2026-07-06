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
import { doc, getDoc, updateDoc, increment, arrayUnion } from "firebase/firestore";
import {
  auth,
  db,
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

import { translations, Language } from "./translations";

import { shortenUrl } from "./lib/shortener";
import { encryptSettings, decryptSettings } from "./lib/encryption";
import SettingsModal from "./components/SettingsModal";
import TemplateManager from "./components/TemplateManager";
import PresetSelector from "./components/PresetSelector";
import HistoryLogTable from "./components/HistoryLogTable";
import BatchCreator from "./components/BatchCreator";
import { LegalModal } from "./components/LegalModal";

export default function App() {
  // Language Support
  const [lang, setLang] = useState<Language>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const urlLang = params.get("lang")?.toLowerCase();
      if (urlLang === "he" || urlLang === "ru" || urlLang === "en") {
        return urlLang as Language;
      }
    }
    const saved = localStorage.getItem("utm_campaign_lang");
    return (saved as Language) || "en";
  });

  useEffect(() => {
    localStorage.setItem("utm_campaign_lang", lang);
  }, [lang]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const urlLang = params.get("lang")?.toLowerCase();
      if (urlLang === "he" || urlLang === "ru" || urlLang === "en") {
        setLang(urlLang as Language);
      }
    }
  }, []);

  const t = translations[lang];
  const isRtl = lang === "he";

  // Form State
  const [baseUrl, setBaseUrl] = useState("");
  const [destinationType, setDestinationType] = useState<"website" | "playstore" | "appstore">("website");
  const [utmSource, setUtmSource] = useState("");
  const [utmMedium, setUtmMedium] = useState("");
  const [utmCampaign, setUtmCampaign] = useState("");
  const [utmTerm, setUtmTerm] = useState("");
  const [utmContent, setUtmContent] = useState("");
  const [utmId, setUtmId] = useState("");
  const [appStorePt, setAppStorePt] = useState("");
  const [appStoreMt, setAppStoreMt] = useState("8");
  const [appStoreAt, setAppStoreAt] = useState("");
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
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return decryptSettings({ ...defaults, ...parsed });
      } catch (e) {
        return defaults;
      }
    }
    return defaults;
  });

  const settingsRef = React.useRef(settings);
  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  // Shortener Control States
  const [shortenerService, setShortenerService] = useState<"none" | "bitly" | "rebrandly" | "tinyurl" | "dub">("none");
  const [shortenedUrl, setShortenedUrl] = useState("");
  const [isShortening, setIsShortening] = useState(false);
  const [shorteningError, setShorteningError] = useState("");

  // System UI/Modal States
  const [activeTab, setActiveTab] = useState<"creator" | "batch" | "templates" | "history">("creator");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLegalOpen, setIsLegalOpen] = useState(false);
  const [currentTemplateId, setCurrentTemplateId] = useState<string | undefined>(undefined);
  const [currentPresetId, setCurrentPresetId] = useState<string | undefined>(undefined);
  const [copiedLink, setCopiedLink] = useState<"full" | "short" | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [qrTarget, setQrTarget] = useState<"full" | "short">("full");
  const [qrColor, setQrColor] = useState("#0F172A");

  // Redirection tracker state
  const [redirectState, setRedirectState] = useState<{
    status: "idle" | "loading" | "error";
    message?: string;
  }>({ status: "idle" });

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const rParam = searchParams.get("r");
    if (rParam) {
      handleRedirection(rParam);
    }
  }, []);

  const handleRedirection = async (param: string) => {
    setRedirectState({ status: "loading" });
    try {
      // Format is: userId_logId
      const underscoreIndex = param.indexOf("_");
      if (underscoreIndex === -1) {
        throw new Error("Invalid tracker link format.");
      }
      const userId = param.substring(0, underscoreIndex);
      const logId = param.substring(underscoreIndex + 1);

      if (!userId || !logId) {
        throw new Error("Invalid tracker parameters.");
      }

      // Fetch the log document
      const logDocRef = doc(db, "users", userId, "history", logId);
      const logDoc = await getDoc(logDocRef);
      if (!logDoc.exists()) {
        throw new Error("Tracking link not found or expired.");
      }

      const logData = logDoc.data() as HistoryLog;
      const targetUrl = logData.shortUrl || logData.fullUrl;
      if (!targetUrl) {
        throw new Error("No destination URL found.");
      }

      // Record click analytics
      const userAgent = navigator.userAgent;
      const referrer = document.referrer || "Direct";
      const timestamp = new Date().toISOString();

      try {
        await updateDoc(logDocRef, {
          clicks: increment(1),
          clickDetails: arrayUnion({
            timestamp,
            userAgent,
            referrer,
          }),
        });
      } catch (updateErr) {
        console.error("Failed to write analytics click:", updateErr);
      }

      // Perform redirection
      window.location.replace(targetUrl);
    } catch (err: any) {
      console.error("Redirection tracking error:", err);
      setRedirectState({
        status: "error",
        message: err.message || "An unexpected error occurred.",
      });
    }
  };

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
            // Check if there are any current settings (from guest/local storage) we should preserve and save to Cloud
            const currentKeys = settingsRef.current;
            const hasExistingKeys = Object.values(currentKeys).some(val => val !== "");
            if (hasExistingKeys) {
              await saveUserShortenerSettings(user.uid, currentKeys);
              showTemporaryNotification("Synced local API credentials to your cloud account securely!");
            } else {
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
          }
        } catch (error: any) {
          console.error("Error loading user data from cloud:", error);
          showTemporaryNotification(`Error loading saved data from Cloud database: ${error?.message || error}`);
        }
      } else {
        setCurrentUser(null);
        // Clear settings on sign out so no sensitive keys remain locally
        localStorage.removeItem("utm_shortener_settings");
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

        // Fallback/load from localstorage for guest users
        const savedPresets = localStorage.getItem("utm_campaign_presets");
        setPresets(savedPresets ? JSON.parse(savedPresets) : []);

        const savedTemplates = localStorage.getItem("utm_custom_templates");
        setCustomTemplates(savedTemplates ? JSON.parse(savedTemplates) : []);

        const savedLogs = localStorage.getItem("utm_campaign_history");
        setHistoryLogs(savedLogs ? JSON.parse(savedLogs) : []);
      }
      setIsAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    if (isUsingDummyConfig) {
      setAuthErrorMessage(
        "It looks like your GitHub Pages site is built without your live Firebase credentials (since the firebase-applet-config.json file is ignored by Git and not pushed to GitHub).\n\n" +
        "To enable Google Sign-In and cloud sync on GitHub Pages, follow these steps:\n\n" +
        "1. Go to your GitHub repository.\n" +
        "2. Navigate to Settings -> Secrets and variables -> Actions.\n" +
        "3. Click 'New repository secret' and add the following keys with the values from your local config in AI Studio:\n" +
        "   - VITE_FIREBASE_API_KEY\n" +
        "   - VITE_FIREBASE_AUTH_DOMAIN\n" +
        "   - VITE_FIREBASE_PROJECT_ID\n" +
        "   - VITE_FIREBASE_STORAGE_BUCKET\n" +
        "   - VITE_FIREBASE_MESSAGING_SENDER_ID\n" +
        "   - VITE_FIREBASE_APP_ID\n\n" +
        "4. Once added, run a new build workflow to redeploy your site with live sync support!"
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
      if (
        isIframe ||
        err.code === "auth/iframe-directory-not-supported" ||
        err.code === "auth/popup-blocked" ||
        err.message?.includes("iframe")
      ) {
        setAuthErrorMessage(t.authBlockedIframeMessage);
      } else if (
        err.code === "auth/unauthorized-domain" ||
        err.message?.includes("unauthorized-domain")
      ) {
        const currentDomain = typeof window !== "undefined" ? window.location.hostname : "localhost";
        setAuthErrorMessage(t.authBlockedUnauthorizedDomainMessage.replace("{domain}", currentDomain));
      } else {
        setAuthErrorMessage(
          err.message ||
            (lang === "he"
              ? "אירעה שגיאה במהלך ההתחברות. אנא ודא שחלונות קופצים מותרים, שהדומיין שלך מורשה ב-Firebase, ונסה שוב."
              : lang === "ru"
              ? "Произошла ошибка при входе. Убедитесь, что всплывающие окна разрешены, домен авторизован в Firebase, и попробуйте снова."
              : "An error occurred during sign-in. Please ensure popups are allowed, your domain is authorized in Firebase, and try again.")
        );
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
    const encrypted = encryptSettings(settings);
    localStorage.setItem("utm_shortener_settings", JSON.stringify(encrypted));
  }, [settings]);

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

      if (destinationType === "playstore") {
        // Collect all standard and custom params for the 'referrer'
        const referrerParams = new URLSearchParams();
        if (utmSource.trim()) referrerParams.set("utm_source", utmSource.trim());
        if (utmMedium.trim()) referrerParams.set("utm_medium", utmMedium.trim());
        if (utmCampaign.trim()) referrerParams.set("utm_campaign", utmCampaign.trim());
        if (utmTerm.trim()) referrerParams.set("utm_term", utmTerm.trim());
        if (utmContent.trim()) referrerParams.set("utm_content", utmContent.trim());
        if (utmId.trim()) referrerParams.set("utm_id", utmId.trim());

        customParams.forEach((param) => {
          if (param.key.trim() && param.value.trim()) {
            referrerParams.set(param.key.trim(), param.value.trim());
          }
        });

        // Strip existing UTM params from play store URL to avoid clutter
        const paramsToStrip = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "utm_id", "referrer"];
        paramsToStrip.forEach(p => urlObj.searchParams.delete(p));

        const referrerString = referrerParams.toString();
        if (referrerString) {
          urlObj.searchParams.set("referrer", referrerString);
        }
      } else if (destinationType === "appstore") {
        // Standard UTMs
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

        // App Store Specific parameters
        // ct: Campaign Token (equivalent to utm_campaign)
        if (utmCampaign.trim()) {
          urlObj.searchParams.set("ct", utmCampaign.trim());
        } else {
          urlObj.searchParams.delete("ct");
        }
        
        // pt: Provider Token
        if (appStorePt.trim()) {
          urlObj.searchParams.set("pt", appStorePt.trim());
        } else {
          urlObj.searchParams.delete("pt");
        }

        // mt: Media Type (default to 8 for apps)
        if (appStoreMt.trim()) {
          urlObj.searchParams.set("mt", appStoreMt.trim());
        } else {
          urlObj.searchParams.delete("mt");
        }

        // at: Affiliate Token
        if (appStoreAt.trim()) {
          urlObj.searchParams.set("at", appStoreAt.trim());
        } else {
          urlObj.searchParams.delete("at");
        }
      } else {
        // Default standard website
        if (utmSource.trim()) urlObj.searchParams.set("utm_source", utmSource.trim());
        if (utmMedium.trim()) urlObj.searchParams.set("utm_medium", utmMedium.trim());
        if (utmCampaign.trim()) urlObj.searchParams.set("utm_campaign", utmCampaign.trim());
        if (utmTerm.trim()) urlObj.searchParams.set("utm_term", utmTerm.trim());
        if (utmContent.trim()) urlObj.searchParams.set("utm_content", utmContent.trim());
        if (utmId.trim()) urlObj.searchParams.set("utm_id", utmId.trim());

        // Apple specific query tokens might exist if preset/template was switched, clear them in pure standard website mode
        urlObj.searchParams.delete("ct");
        urlObj.searchParams.delete("pt");
        urlObj.searchParams.delete("mt");
        urlObj.searchParams.delete("at");

        customParams.forEach((param) => {
          if (param.key.trim() && param.value.trim()) {
            urlObj.searchParams.set(param.key.trim(), param.value.trim());
          }
        });
      }

      return urlObj.toString();
    } catch (e) {
      return "";
    }
  }, [baseUrl, destinationType, utmSource, utmMedium, utmCampaign, utmTerm, utmContent, utmId, customParams, appStorePt, appStoreMt, appStoreAt]);

  useEffect(() => {
    setShortenedUrl("");
    setShorteningError("");
    setQrTarget("full");
  }, [fullAssembledUrl]);

  // Form Reset
  const handleResetForm = () => {
    setBaseUrl("");
    setDestinationType("website");
    setUtmSource("");
    setUtmMedium("");
    setUtmCampaign("");
    setUtmTerm("");
    setUtmContent("");
    setUtmId("");
    setAppStorePt("");
    setAppStoreMt("8");
    setAppStoreAt("");
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
    setDestinationType(template.destinationType || "website");
    setUtmSource(template.utmSource || "");
    setUtmMedium(template.utmMedium || "");
    setUtmCampaign(template.utmCampaign || "");
    setUtmTerm(template.utmTerm || "");
    setUtmContent(template.utmContent || "");
    setUtmId(template.utmId || "");
    setAppStorePt(template.appStorePt || "");
    setAppStoreMt(template.appStoreMt || "8");
    setAppStoreAt(template.appStoreAt || "");

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
      destinationType,
      utmSource,
      utmMedium,
      utmCampaign,
      utmTerm,
      utmContent,
      utmId,
      appStorePt,
      appStoreMt,
      appStoreAt,
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
    setDestinationType(preset.destinationType || "website");
    setUtmSource(preset.utmSource);
    setUtmMedium(preset.utmMedium);
    setUtmCampaign(preset.utmCampaign);
    setUtmTerm(preset.utmTerm);
    setUtmContent(preset.utmContent);
    setUtmId(preset.utmId);
    setAppStorePt(preset.appStorePt || "");
    setAppStoreMt(preset.appStoreMt || "8");
    setAppStoreAt(preset.appStoreAt || "");
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
      destinationType,
      utmSource,
      utmMedium,
      utmCampaign,
      utmTerm,
      utmContent,
      utmId,
      appStorePt,
      appStoreMt,
      appStoreAt,
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

    try {
      const shortUrl = await shortenUrl({
        service: shortenerService,
        longUrl: fullAssembledUrl,
        settings,
        lang,
      });

      setShortenedUrl(shortUrl);
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

  if (redirectState.status === "loading") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-6 font-sans" dir={isRtl ? "rtl" : "ltr"}>
        <div className="max-w-md w-full text-center space-y-6 bg-white border border-[#e2e8f0] rounded-[12px] p-8 shadow-sm">
          <div className="flex justify-center">
            <Loader2 className="w-12 h-12 text-slate-900 animate-spin" />
          </div>
          <div className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900 font-display">
              {lang === "he" ? "מנתב אותך ליעד..." : lang === "ru" ? "Перенаправление..." : "Redirecting you..."}
            </h2>
            <p className="text-sm text-slate-500 font-sans">
              {lang === "he" ? "רושם את הקליק ומעביר אותך בצורה מאובטחת." : lang === "ru" ? "Регистрируем клик и безопасно перенаправляем вас." : "We are registering your click and securely redirecting you."}
            </p>
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            {window.location.host}
          </div>
        </div>
      </div>
    );
  }

  if (redirectState.status === "error") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-6 font-sans" dir={isRtl ? "rtl" : "ltr"}>
        <div className="max-w-md w-full text-center space-y-6 bg-white border border-red-200 rounded-[12px] p-8 shadow-sm">
          <div className="flex justify-center text-red-500">
            <AlertCircle className="w-12 h-12" />
          </div>
          <div className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900 font-display">
              {lang === "he" ? "שגיאת ניתוב" : lang === "ru" ? "Ошибка перенаправления" : "Redirection Error"}
            </h2>
            <p className="text-sm text-red-600 font-sans">
              {redirectState.message}
            </p>
          </div>
          <button
            onClick={() => {
              window.location.href = window.location.origin;
            }}
            className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-[6px] transition-colors cursor-pointer"
          >
            {lang === "he" ? "חזרה לאפליקציה" : lang === "ru" ? "Вернуться на главную" : "Go to Main App"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div dir={isRtl ? "rtl" : "ltr"} className="flex flex-col min-h-screen bg-[#f7f9fb] text-[#191c1e] font-sans antialiased selection:bg-[#000000] selection:text-white">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/95 border-b border-[#e2e8f0] backdrop-blur-md px-6 py-4 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#000000] text-white rounded-[4px] shadow-sm flex items-center justify-center">
              <Link2 className="w-5.5 h-5.5" />
            </div>
            <div className={isRtl ? "text-right" : "text-left"}>
              <h1 className="text-xl font-bold tracking-tight text-[#191c1e] font-display">{t.title}</h1>
              <p className="text-xs text-[#64748B] font-sans">{t.subtitle}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Language Selector */}
            <div className="flex items-center gap-1 bg-slate-50 border border-[#e2e8f0] p-1 rounded-[4px] shadow-xs" dir="ltr">
              {(["en", "he", "ru"] as Language[]).map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLang(l)}
                  className={`px-2 py-1 text-[10px] font-bold rounded-[3px] transition-all cursor-pointer ${
                    lang === l
                      ? "bg-slate-900 text-white shadow-xs"
                      : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                  }`}
                >
                  {l === "en" ? "EN" : l === "he" ? "עב" : "RU"}
                </button>
              ))}
            </div>
            {/* Auth Status & Sync */}
            {isAuthLoading ? (
              <div className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 rounded-[4px] border border-slate-100">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-400" />
                <span className="text-[11px] text-slate-400 font-medium font-sans">{t.checkingSync}</span>
              </div>
            ) : currentUser ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-[4px] border border-emerald-100 font-sans" title="Syncing to Google Cloud Firestore database">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-bold tracking-widest uppercase">{t.cloudSync}</span>
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
                  <span className="hidden sm:inline">{t.signOut}</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 text-slate-500 rounded-[4px] border border-slate-100 font-sans" title="Your campaigns are only saved on this device (offline)">
                  <span className="text-[10px] font-bold tracking-widest uppercase text-slate-400">{t.guestMode}</span>
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
                  <span>{t.signInWithGoogle}</span>
                </button>
              </div>
            )}

            <button
              onClick={() => setIsSettingsOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 border border-[#e2e8f0] text-slate-700 rounded-[4px] text-xs font-semibold shadow-xs transition-colors cursor-pointer font-sans"
              title="Configure Bitly / Rebrandly / TinyURL credentials"
            >
              <Settings className="w-3.5 h-3.5" />
              {t.apiIntegrations}
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
              {t.creatorTab}
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
              {t.batchTab}
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
              {t.templatesTab}
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
              {t.historyTab}
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
                  <h2 className={`text-base font-bold text-[#191c1e] flex items-center gap-2 font-display ${isRtl ? "text-right" : "text-left"}`}>
                    <Globe className="w-4.5 h-4.5 text-slate-500" />
                    {destinationType === "playstore" ? (lang === "he" ? "1. פרטי אפליקציה ב-Google Play" : "1. Google Play App Details") : destinationType === "appstore" ? (lang === "he" ? "1. פרטי אפליקציה ב-App Store" : "1. App Store App Details") : t.urlTitle}
                  </h2>
                </div>

                {/* Destination Type Selector */}
                <div className="space-y-2">
                  <label className={`block text-xs font-bold text-slate-700 uppercase tracking-widest text-[10px] font-sans ${isRtl ? "text-right" : "text-left"}`}>
                    {lang === "he" ? "סוג יעד הקמפיין" : lang === "ru" ? "Тип назначения кампании" : "Campaign Destination Type"}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setDestinationType("website");
                      }}
                      className={`py-2 px-3 text-xs font-bold rounded-[4px] border transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                        destinationType === "website"
                          ? "bg-slate-900 border-slate-900 text-white shadow-xs"
                          : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100/70"
                      }`}
                    >
                      <Globe className="w-4 h-4" />
                      <span>{lang === "he" ? "אתר אינטרנט" : lang === "ru" ? "Веб-сайт" : "Website"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDestinationType("playstore");
                      }}
                      className={`py-2 px-3 text-xs font-bold rounded-[4px] border transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                        destinationType === "playstore"
                          ? "bg-slate-900 border-slate-900 text-white shadow-xs"
                          : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100/70"
                      }`}
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M3,5.27V18.73L16.55,12L3,5.27M17,12L21,14.25V9.75L17,12Z" />
                      </svg>
                      <span>Google Play</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDestinationType("appstore");
                      }}
                      className={`py-2 px-3 text-xs font-bold rounded-[4px] border transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                        destinationType === "appstore"
                          ? "bg-slate-900 border-slate-900 text-white shadow-xs"
                          : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100/70"
                      }`}
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18.71,19.5C17.88,20.74 17,21.95 15.66,21.97C14.32,22 13.89,21.18 12.37,21.18C10.84,21.18 10.37,21.95 9.1,22C7.79,22.05 6.8,20.68 5.96,19.47C4.25,17 2.94,12.45 4.7,9.39C5.57,7.87 7.13,6.91 8.82,6.88C10.1,6.86 11.32,7.75 12.11,7.75C12.89,7.75 14.37,6.68 15.92,6.84C16.57,6.87 18.39,7.1 19.56,8.82C19.47,8.88 17.39,10.1 17.41,12.63C17.44,15.65 20.06,16.66 20.1,16.67C20.08,16.74 19.67,18.11 18.71,19.5M15.97,4.17C16.63,3.37 17.07,2.28 16.95,1C16,1.04 14.9,1.6 14.24,2.38C13.68,3.04 13.19,4.14 13.34,5.39C14.39,5.47 15.4,4.88 15.97,4.17Z" />
                      </svg>
                      <span>App Store</span>
                    </button>
                  </div>
                </div>

                {/* Website Destination Input */}
                <div className="space-y-2">
                  <label className={`block text-xs font-bold text-slate-700 uppercase tracking-widest text-[10px] font-sans ${isRtl ? "text-right" : "text-left"}`}>
                    {destinationType === "playstore"
                      ? (lang === "he" ? "כתובת אפליקציה ב-Google Play *" : "Google Play App URL *")
                      : destinationType === "appstore"
                      ? (lang === "he" ? "כתובת אפליקציה ב-App Store *" : "App Store App URL *")
                      : t.urlLabel}
                  </label>
                  <div className="relative">
                    <span className={`absolute inset-y-0 ${isRtl ? "right-3.5" : "left-3.5"} flex items-center pointer-events-none text-slate-400`}>
                      <Globe className="w-4 h-4" />
                    </span>
                    <input
                      type="url"
                      placeholder={
                        destinationType === "playstore"
                          ? "https://play.google.com/store/apps/details?id=com.example.app"
                          : destinationType === "appstore"
                          ? "https://apps.apple.com/app/id123456789"
                          : t.urlPlaceholder
                      }
                      required
                      value={baseUrl}
                      onChange={(e) => setBaseUrl(e.target.value)}
                      className={`w-full text-xs ${isRtl ? "pr-10 pl-3.5" : "pl-10 pr-3"} py-3 border border-slate-300 bg-slate-50/70 hover:bg-slate-50 focus:bg-white text-slate-900 rounded-[4px] focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10 transition-all font-mono placeholder:text-slate-400`}
                    />
                  </div>
                  {destinationType === "playstore" && (
                    <p className={`text-[10px] text-slate-500 font-sans ${isRtl ? "text-right" : "text-left"}`}>
                      {lang === "he" 
                        ? "קישורי קמפיין של Google Play משתמשים בפרמטר 'referrer' כדי להעביר את נתוני ה-UTM בצורה מאובטחת להתקנות אפליקציה."
                        : "Google Play Campaign URLs use the 'referrer' parameter to pass UTM campaign details securely during app install attribution."}
                    </p>
                  )}
                  {destinationType === "appstore" && (
                    <p className={`text-[10px] text-slate-500 font-sans ${isRtl ? "text-right" : "text-left"}`}>
                      {lang === "he" 
                        ? "קישורי קמפיין של iOS App Store תומכים במזהה מעקב של Apple (CT, PT) לצד פרמטרי UTM מסורתיים של Google Analytics."
                        : "App Store campaign URLs support native Apple tracking parameters (CT, PT) alongside standard UTM parameters."}
                    </p>
                  )}
                </div>

                {/* Core Standard UTM Parameters Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">
                  {/* Campaign Source */}
                  <div className="space-y-1.5 font-sans">
                    <div className="flex justify-between items-center">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest text-[10px]">
                        {lang === "he" ? "מקור הקמפיין" : lang === "ru" ? "Источник" : "Source"} <span className="text-red-500">*</span>
                      </label>
                      <span className="text-[9px] text-[#64748B] font-mono">utm_source</span>
                    </div>
                    <input
                      type="text"
                      placeholder={t.sourcePlaceholder}
                      required
                      value={utmSource}
                      onChange={(e) => setUtmSource(e.target.value)}
                      className="w-full text-xs px-3 py-2.5 border border-slate-300 bg-slate-50/70 hover:bg-slate-50 focus:bg-white text-slate-900 rounded-[4px] focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10 transition-all placeholder:text-slate-400"
                    />
                  </div>

                  {/* Campaign Medium */}
                  <div className="space-y-1.5 font-sans">
                    <div className="flex justify-between items-center">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest text-[10px]">
                        {lang === "he" ? "אמצעי הקמפיין" : lang === "ru" ? "Тип трафика" : "Medium"} <span className="text-red-500">*</span>
                      </label>
                      <span className="text-[9px] text-[#64748B] font-mono">utm_medium</span>
                    </div>
                    <input
                      type="text"
                      placeholder={t.mediumPlaceholder}
                      required
                      value={utmMedium}
                      onChange={(e) => setUtmMedium(e.target.value)}
                      className="w-full text-xs px-3 py-2.5 border border-slate-300 bg-slate-50/70 hover:bg-slate-50 focus:bg-white text-slate-900 rounded-[4px] focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10 transition-all placeholder:text-slate-400"
                    />
                  </div>

                  {/* Campaign Name */}
                  <div className="space-y-1.5 font-sans">
                    <div className="flex justify-between items-center">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest text-[10px]">
                        {lang === "he" ? "שם הקמפיין" : lang === "ru" ? "Название" : "Campaign Name"} <span className="text-red-500">*</span>
                      </label>
                      <span className="text-[9px] text-[#64748B] font-mono">utm_campaign</span>
                    </div>
                    <input
                      type="text"
                      placeholder={t.campaignPlaceholder}
                      required
                      value={utmCampaign}
                      onChange={(e) => setUtmCampaign(e.target.value)}
                      className="w-full text-xs px-3 py-2.5 border border-slate-300 bg-slate-50/70 hover:bg-slate-50 focus:bg-white text-slate-900 rounded-[4px] focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10 transition-all placeholder:text-slate-400"
                    />
                  </div>

                  {/* Campaign Term */}
                  <div className="space-y-1.5 font-sans">
                    <div className="flex justify-between items-center">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest text-[10px]">
                        {lang === "he" ? "מונח קמפיין" : lang === "ru" ? "Ключевое слово" : "Campaign Term"}
                      </label>
                      <span className="text-[9px] text-[#64748B] font-mono">utm_term</span>
                    </div>
                    <input
                      type="text"
                      placeholder={t.termPlaceholder}
                      value={utmTerm}
                      onChange={(e) => setUtmTerm(e.target.value)}
                      className="w-full text-xs px-3 py-2.5 border border-slate-300 bg-slate-50/70 hover:bg-slate-50 focus:bg-white text-slate-900 rounded-[4px] focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10 transition-all placeholder:text-slate-400"
                    />
                  </div>

                  {/* Campaign Content */}
                  <div className="space-y-1.5 font-sans">
                    <div className="flex justify-between items-center">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest text-[10px]">
                        {lang === "he" ? "תוכן קמפיין" : lang === "ru" ? "Контент" : "Campaign Content"}
                      </label>
                      <span className="text-[9px] text-[#64748B] font-mono">utm_content</span>
                    </div>
                    <input
                      type="text"
                      placeholder={t.contentPlaceholder}
                      value={utmContent}
                      onChange={(e) => setUtmContent(e.target.value)}
                      className="w-full text-xs px-3 py-2.5 border border-slate-300 bg-slate-50/70 hover:bg-slate-50 focus:bg-white text-slate-900 rounded-[4px] focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10 transition-all placeholder:text-slate-400"
                    />
                  </div>

                  {/* Campaign ID */}
                  <div className="space-y-1.5 font-sans">
                    <div className="flex justify-between items-center">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest text-[10px]">
                        {lang === "he" ? "מזהה קמפיין" : lang === "ru" ? "ID кампании" : "Campaign ID"}
                      </label>
                      <span className="text-[9px] text-[#64748B] font-mono">utm_id</span>
                    </div>
                    <input
                      type="text"
                      placeholder={t.idPlaceholder}
                      value={utmId}
                      onChange={(e) => setUtmId(e.target.value)}
                      className="w-full text-xs px-3 py-2.5 border border-slate-300 bg-slate-50/70 hover:bg-slate-50 focus:bg-white text-slate-900 rounded-[4px] focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10 transition-all placeholder:text-slate-400"
                    />
                  </div>
                </div>

                {/* App Store Attribution Parameters (Apple Specific) */}
                {destinationType === "appstore" && (
                  <div className="border-t border-slate-100 pt-5 space-y-4 font-sans animate-fade-in">
                    <div className={isRtl ? "text-right" : "text-left"}>
                      <h4 className="text-xs font-bold text-blue-800 uppercase tracking-widest text-[10px]">
                        {lang === "he" ? "פרמטרי מעקב של Apple App Store" : "Apple App Store Tracking Parameters"}
                      </h4>
                      <p className="text-[10px] text-slate-500">
                        {lang === "he" 
                          ? "ערכים אלו נדרשים כדי לעקוב אחר רכישות והורדות דרך המערכת הפנימית App Analytics של Apple."
                          : "These variables are required to track campaign performance, downloads, and revenue inside Apple App Analytics."}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {/* Provider Token (pt) */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center">
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest text-[10px]">
                            {lang === "he" ? "מזהה ספק (PT) *" : "Provider Token (PT) *"}
                          </label>
                          <span className="text-[9px] text-[#64748B] font-mono">pt</span>
                        </div>
                        <input
                          type="text"
                          placeholder="e.g. 123456"
                          value={appStorePt}
                          onChange={(e) => setAppStorePt(e.target.value)}
                          className="w-full text-xs px-3 py-2.5 border border-slate-300 bg-slate-50/70 hover:bg-slate-50 focus:bg-white text-slate-900 rounded-[4px] focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10 transition-all placeholder:text-slate-400"
                        />
                        <p className="text-[9px] text-slate-400">
                          {lang === "he" ? "מזהה ה-Provider הייחודי שלך ב-App Store Connect" : "Your unique iTunes Connect Provider ID"}
                        </p>
                      </div>

                      {/* Media Type (mt) */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center">
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest text-[10px]">
                            {lang === "he" ? "סוג מדיה (MT)" : "Media Type (MT)"}
                          </label>
                          <span className="text-[9px] text-[#64748B] font-mono">mt</span>
                        </div>
                        <input
                          type="text"
                          placeholder="8"
                          value={appStoreMt}
                          onChange={(e) => setAppStoreMt(e.target.value)}
                          className="w-full text-xs px-3 py-2.5 border border-slate-300 bg-slate-50/70 hover:bg-slate-50 focus:bg-white text-slate-900 rounded-[4px] focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10 transition-all placeholder:text-slate-400"
                        />
                        <p className="text-[9px] text-slate-400">
                          {lang === "he" ? "ערך מומלץ למשחקים ואפליקציות: 8" : "Recommended value for Apps & Games is 8"}
                        </p>
                      </div>

                      {/* Affiliate Token (at) */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center">
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-widest text-[10px]">
                            {lang === "he" ? "מזהה שותף (AT)" : "Affiliate Token (AT)"}
                          </label>
                          <span className="text-[9px] text-[#64748B] font-mono">at</span>
                        </div>
                        <input
                          type="text"
                          placeholder="e.g. 10l1234"
                          value={appStoreAt}
                          onChange={(e) => setAppStoreAt(e.target.value)}
                          className="w-full text-xs px-3 py-2.5 border border-slate-300 bg-slate-50/70 hover:bg-slate-50 focus:bg-white text-slate-900 rounded-[4px] focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10 transition-all placeholder:text-slate-400"
                        />
                        <p className="text-[9px] text-slate-400">
                          {lang === "he" ? "מזהה שותף אופציונלי לתוכניות שותפים של Apple" : "Optional Apple Affiliate Network token"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Custom Extra Parameters Accordion / Fields */}
                <div className="border-t border-slate-100 pt-5 space-y-3 font-sans">
                  <div className="flex items-center justify-between">
                    <div className={isRtl ? "text-right" : "text-left"}>
                      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-widest text-[10px]">{t.customParamsTitle}</h4>
                      <p className="text-[10px] text-[#64748B]">{lang === "he" ? "הוסף פרמטרים מותאמים אישית שאינם UTM רגילים (כגון fbclid, gclid)" : lang === "ru" ? "Добавьте нестандартные теги к ссылке (например, fbclid, gclid)" : "Append custom non-standard tags (e.g., gclid, partner_id, fbclid)"}</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddCustomParam}
                      className="flex items-center gap-1 text-xs text-blue-600 font-bold bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-[4px] transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      {t.addParamBtn}
                    </button>
                  </div>

                  {customParams.length > 0 ? (
                    <div className="space-y-2">
                      {customParams.map((param) => (
                        <div key={param.id} className="flex gap-2.5 items-center animate-fade-in">
                          <input
                            type="text"
                            placeholder={t.paramKeyPlaceholder}
                            value={param.key}
                            onChange={(e) => handleUpdateCustomParam(param.id, "key", e.target.value)}
                            className="flex-1 text-xs px-3 py-2 border border-slate-300 bg-slate-50/70 hover:bg-slate-50 focus:bg-white text-slate-900 rounded-[4px] focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10 transition-all font-mono placeholder:text-slate-400"
                          />
                          <input
                            type="text"
                            placeholder={t.paramValuePlaceholder}
                            value={param.value}
                            onChange={(e) => handleUpdateCustomParam(param.id, "value", e.target.value)}
                            className="flex-1 text-xs px-3 py-2 border border-slate-300 bg-slate-50/70 hover:bg-slate-50 focus:bg-white text-slate-900 rounded-[4px] focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900/10 transition-all font-mono placeholder:text-slate-400"
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
                      {lang === "he" ? "אין פרמטרים מותאמים אישית מוגדרים." : lang === "ru" ? "Дополнительные параметры пока не настроены." : "No custom parameters configured yet."}
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
                    <h3 className={`text-base font-bold text-[#191c1e] flex items-center gap-2 font-display ${isRtl ? "text-right" : "text-left"}`}>
                      <Sparkles className="w-4.5 h-4.5 text-amber-500 fill-amber-50" />
                      {t.assembledTitle}
                    </h3>
                    <p className={`text-xs text-[#64748B] mt-0.5 font-sans ${isRtl ? "text-right" : "text-left"}`}>
                      {lang === "he" ? "קישור המעקב שלך מיוצר כאן באופן דינמי" : lang === "ru" ? "Ваша ссылка формируется автоматически ниже" : "Your tracking link is compiled dynamically below"}
                    </p>
                  </div>

                  {/* Display Full URL */}
                  <div className="space-y-2 font-sans">
                    <div className="flex items-center justify-between text-[11px] text-[#64748B] font-bold">
                      <span>{lang === "he" ? "כתובת ה-UTM שנוצרה" : lang === "ru" ? "СФОРМИРОВАННЫЙ URL" : "CONSTRUCTED UTM URL"}</span>
                      <button
                        onClick={handleCopyFullUrl}
                        className="text-[#3B82F6] hover:text-[#3B82F6]/80 flex items-center gap-1 font-bold hover:underline cursor-pointer"
                      >
                        {copiedLink === "full" ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            {lang === "he" ? "הועתק!" : lang === "ru" ? "Скопировано!" : "Copied!"}
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            {lang === "he" ? "העתק קישור" : lang === "ru" ? "Копировать" : "Copy Link"}
                          </>
                        )}
                      </button>
                    </div>
                    <div className="p-3.5 bg-slate-50 border border-slate-300 rounded-[4px] text-slate-800 text-xs font-mono break-all leading-relaxed max-h-32 overflow-y-auto shadow-inner">
                      {fullAssembledUrl}
                    </div>
                  </div>

                  {/* Shorten Options Grid */}
                  <div className="space-y-3 pt-2 font-sans">
                    <label className={`block text-xs font-bold text-[#64748B] uppercase tracking-widest text-[10px] ${isRtl ? "text-right" : "text-left"}`}>
                      {t.shortenedTitle}
                    </label>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-2" dir="ltr">
                      {/* None */}
                      <div
                        onClick={() => setShortenerService("none")}
                        className={`p-2.5 border rounded-[4px] cursor-pointer text-center flex flex-col items-center justify-center transition-all ${
                          shortenerService === "none"
                            ? "border-[#000000] bg-[#191c1e] text-white font-bold"
                            : "border-slate-300 bg-white hover:border-slate-800 text-slate-600"
                        }`}
                      >
                        <div className="text-xs font-bold">{lang === "he" ? "ללא" : lang === "ru" ? "Нет" : "None"}</div>
                        <span className="text-[9px] text-[#64748B]">Direct URL</span>
                      </div>

                      {/* Bitly */}
                      <div
                        onClick={() => setShortenerService("bitly")}
                        className={`p-2.5 border rounded-[4px] cursor-pointer text-center flex flex-col items-center justify-center gap-0.5 transition-all ${
                          shortenerService === "bitly"
                            ? "border-orange-500 bg-orange-50 text-orange-950 font-bold"
                            : "border-slate-300 bg-white hover:border-slate-800 text-slate-600"
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
                            : "border-slate-300 bg-white hover:border-slate-800 text-slate-600"
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
                            : "border-slate-300 bg-white hover:border-slate-800 text-slate-600"
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
                            : "border-slate-300 bg-white hover:border-slate-800 text-slate-600"
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
                      <div className={`space-y-1 ${isRtl ? "text-right" : "text-left"}`}>
                        <div className="text-xs font-bold text-[#191c1e]">
                          {lang === "he" ? "קצר קישור עם" : lang === "ru" ? "Сократить с помощью" : "Shorten with"} {shortenerService.toUpperCase()}
                        </div>
                        <p className="text-[10px] text-[#64748B]">
                          {shortenerService === "tinyurl" && !settings.tinyurlToken
                            ? (lang === "he" ? "יבוצע באמצעות ה-API החינמי והאנונימי של TinyURL." : lang === "ru" ? "Будет выполнено через бесплатный анонимный API TinyURL." : "Will execute using the free anonymous TinyURL API.")
                            : (lang === "he" ? "משתמש באישורים שהוגדרו בהגדרות." : lang === "ru" ? "Используются учетные данные из настроек." : "Using credentials configured in settings.")}
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
                            {t.shorteningBtn}
                          </>
                        ) : (
                          t.shortenBtn
                        )}
                      </button>
                    </div>
                  )}

                  {/* Display Shortener API Errors */}
                  {shorteningError && (
                    <div className="p-3.5 bg-red-50 border border-red-100 rounded-[4px] text-red-700 text-xs flex gap-2.5 items-start font-sans">
                      <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                      <div className={isRtl ? "text-right" : "text-left"}>
                        <span className="font-bold text-red-800">{lang === "he" ? "שגיאת API:" : lang === "ru" ? "Ошибка API:" : "API Error:"}</span> {shorteningError}
                        <div className="text-[10px] text-red-500 mt-1">
                          {lang === "he" ? "בדוק את מפתח ה-API שלך בתפריט האינטגרציות למעלה." : lang === "ru" ? "Проверьте ваш API-токен в верхнем меню интеграций." : "Check your API Token in the top right integrations menu."}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Display Shortened Link */}
                  {shortenedUrl && (
                    <div className="space-y-2 p-4 bg-emerald-50/40 border border-emerald-100/60 rounded-[4px] animate-fade-in font-sans">
                      <div className="flex items-center justify-between text-[11px] text-emerald-800 font-bold">
                        <span>{lang === "he" ? "קישור מקוצר" : lang === "ru" ? "СОКРАЩЕННАЯ ССЫЛКА" : "SHORTENED LINK"}</span>
                        <button
                          onClick={handleCopyShortUrl}
                          className="text-emerald-700 hover:text-emerald-900 flex items-center gap-1 font-bold hover:underline cursor-pointer"
                        >
                          {copiedLink === "short" ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              {lang === "he" ? "הועתק!" : lang === "ru" ? "Скопировано!" : "Copied!"}
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              {lang === "he" ? "העתק" : lang === "ru" ? "Копировать" : "Copy"}
                            </>
                          )}
                        </button>
                      </div>
                      <div className="p-3 bg-white border border-[#e2e8f0] rounded-[4px] text-[#191c1e] font-mono text-xs font-bold flex justify-between items-center" dir="ltr">
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
                        {t.qrCodeBtn}
                      </h4>
                      {shortenedUrl && (
                        <div className="flex bg-slate-100 p-0.5 rounded-[4px] text-[10px]" dir="ltr">
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
                      <div className="bg-white p-2 rounded-[4px] shadow-xs border border-slate-300 shrink-0 animate-fade-in">
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

                      <div className={`space-y-2 flex-1 w-full text-center ${isRtl ? "sm:text-right" : "sm:text-left"}`}>
                        <div className="flex items-center justify-center sm:justify-start gap-1.5">
                          <span className="text-[10px] text-[#64748B] font-bold">{lang === "he" ? "צבע:" : lang === "ru" ? "ЦВЕТ:" : "COLOR:"}</span>
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

                        <div className="text-[10px] text-[#64748B] leading-relaxed font-mono truncate max-w-[180px] sm:max-w-[200px] mx-auto sm:mx-0" dir="ltr">
                          Target: <span className="text-slate-600 font-bold">{qrTarget === "short" && shortenedUrl ? shortenedUrl : fullAssembledUrl}</span>
                        </div>

                        <button
                          type="button"
                          onClick={downloadQRCode}
                          className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-[#3B82F6] hover:text-[#3B82F6]/80 rounded-[4px] text-xs font-bold transition-colors cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          {lang === "he" ? "הורד PNG" : lang === "ru" ? "Скачать PNG" : "Download PNG"}
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
                      {t.saveHistoryBtn}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-100/30 border border-dashed border-[#e2e8f0] rounded-[8px] py-12 px-6 text-center space-y-2 text-[#64748B] sticky top-[160px] font-sans">
                  <Globe className="w-8 h-8 mx-auto text-slate-200" />
                  <h4 className="font-bold text-xs text-[#191c1e]">{lang === "he" ? "יוצר קישורים בזמן אמת" : lang === "ru" ? "Конструктор ссылок" : "Live URL Constructor"}</h4>
                  <p className="text-[10px] text-[#64748B] max-w-sm mx-auto">{lang === "he" ? "הזן את כתובת האתר ופרמטרי השיווק כדי לייצר כאן קישורי מעקב וקיצורים." : lang === "ru" ? "Введите URL сайта и параметры маркетинга для создания ссылок." : "Input your website URL and marketing parameters to compile tracking links and use shorteners here."}</p>
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
            lang={lang}
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
                lang={lang}
              />
            </div>
            <div className="bg-white border border-[#e2e8f0] rounded-[8px] p-6 shadow-xs">
              <PresetSelector
                presets={presets}
                onSelectPreset={handleSelectPreset}
                onSavePreset={handleSavePreset}
                onDeletePreset={handleDeletePreset}
                currentPresetId={currentPresetId}
                lang={lang}
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
              lang={lang}
              userId={currentUser?.uid}
            />
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="mt-auto py-8 border-t border-[#e2e8f0] bg-white">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-sans">
          <div className={isRtl ? "text-right" : "text-left"}>
            &copy; {new Date().getFullYear()} Netolink. {t.allRightsReserved}
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-400" dir="ltr">
            <button
              id="footer-legal-btn"
              type="button"
              onClick={() => setIsLegalOpen(true)}
              className="hover:underline text-slate-500 hover:text-slate-800 font-bold transition-colors cursor-pointer"
            >
              {t.legalTermsLink}
            </button>
            <span>&bull;</span>
            <span>UTM Campaign Builder v1.1.0</span>
          </div>
        </div>
      </footer>

      {/* Settings Modal (Credentials configuration drawer) */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        lang={lang}
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

      {/* Legal terms, privacy policy, cookie policy, accessibility modal */}
      <LegalModal
        isOpen={isLegalOpen}
        onClose={() => setIsLegalOpen(false)}
        lang={lang}
      />

      {/* Auth Error Modal */}
      {showAuthErrorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fade-in" dir={isRtl ? "rtl" : "ltr"}>
          <div className={`relative w-full max-w-md bg-white rounded-[8px] shadow-xl border border-[#e2e8f0] p-6 flex flex-col gap-4 ${isRtl ? "text-right" : "text-left"}`}>
            <div className={`flex items-center gap-3 justify-start border-b border-slate-100 pb-3 ${isRtl ? "flex-row-reverse" : "flex-row"}`}>
              <div className="p-2 bg-amber-50 text-amber-600 rounded-[4px]">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#191c1e] font-display">{t.authBlockedTitle}</h3>
                <p className="text-[10px] text-slate-400 font-sans">{t.authBlockedSubtitle}</p>
              </div>
            </div>
            
            <div className="text-xs text-slate-700 leading-relaxed font-sans whitespace-pre-wrap">
              {authErrorMessage}
            </div>

            <div className={`flex gap-2 mt-2 ${isRtl ? "justify-start" : "justify-end"}`}>
              <button
                type="button"
                onClick={() => setShowAuthErrorModal(false)}
                className="px-4 py-2 bg-slate-900 hover:bg-black text-white text-xs font-semibold rounded-[4px] shadow-sm transition-colors cursor-pointer font-sans"
              >
                {t.authBlockedClose}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
