import React, { useState, useEffect, useCallback } from "react";
import { CheckCircle2, AlertTriangle, Loader2, RefreshCw, HelpCircle } from "lucide-react";
import { translations, Language } from "../translations";

interface UrlValidatorProps {
  url: string;
  onValidationChange?: (isValid: boolean) => void;
  lang?: Language;
}

export default function UrlValidator({ url, onValidationChange, lang = "en" }: UrlValidatorProps) {
  const t = translations[lang];
  const isRtl = lang === "he";
  const [status, setStatus] = useState<"idle" | "loading" | "valid" | "invalid">("idle");
  const [details, setDetails] = useState<{
    code?: number;
    text?: string;
    error?: string;
  }>({});

  const validateUrl = useCallback(async (targetUrl: string) => {
    if (!targetUrl) {
      setStatus("idle");
      setDetails({});
      if (onValidationChange) onValidationChange(false);
      return;
    }

    // Quick client-side format validation before making API call
    try {
      new URL(targetUrl);
    } catch (e) {
      setStatus("invalid");
      setDetails({ error: t.invalidUrlFormat });
      if (onValidationChange) onValidationChange(false);
      return;
    }

    setStatus("loading");
    setDetails({});

    try {
      const response = await fetch("/api/validate-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: targetUrl }),
      });

      const contentType = response.headers.get("content-type") || "";
      if (contentType.includes("text/html") || response.status === 404) {
        throw new Error("STATIC_HOSTING_NO_BACKEND");
      }

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      let data;
      try {
        data = await response.json();
      } catch (e) {
        throw new Error("STATIC_HOSTING_NO_BACKEND");
      }

      if (data.valid) {
        setStatus("valid");
        setDetails({ code: data.status, text: data.statusText });
        if (onValidationChange) onValidationChange(true);
      } else {
        setStatus("invalid");
        setDetails({ error: data.error, code: data.status, text: data.statusText });
        if (onValidationChange) onValidationChange(false);
      }
    } catch (err: any) {
      if (err.message === "STATIC_HOSTING_NO_BACKEND") {
        setStatus("valid");
        setDetails({ error: t.validationStaticHost });
        if (onValidationChange) onValidationChange(true);
      } else {
        setStatus("invalid");
        setDetails({ error: t.validationNetworkError });
        if (onValidationChange) onValidationChange(false);
      }
    }
  }, [onValidationChange, t.invalidUrlFormat, t.validationNetworkError, t.validationStaticHost]);

  // Debounce validation on URL changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (url) {
        validateUrl(url);
      } else {
        setStatus("idle");
        setDetails({});
        if (onValidationChange) onValidationChange(false);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [url, validateUrl, onValidationChange]);

  return (
    <div className={`flex items-center gap-3 text-xs border border-[#e2e8f0] bg-white p-2.5 rounded-[4px] ${isRtl ? "flex-row-reverse" : ""}`}>
      <div className="font-semibold text-[#64748B] uppercase tracking-wider text-[10px] font-sans shrink-0">
        {t.realTimeValidation}
      </div>
      <div className={`flex-1 flex items-center gap-2 ${isRtl ? "flex-row-reverse" : ""}`}>
        {status === "idle" && (
          <span className={`flex items-center gap-1.5 text-[#64748B] ${isRtl ? "flex-row-reverse" : ""}`}>
            <HelpCircle className="w-4 h-4 text-slate-300 shrink-0" />
            <span className="text-right">{t.enterDestinationToValidate}</span>
          </span>
        )}

        {status === "loading" && (
          <span className={`flex items-center gap-1.5 text-[#3B82F6] font-medium ${isRtl ? "flex-row-reverse" : ""}`}>
            <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
            <span>{t.testingDestination}</span>
          </span>
        )}

        {status === "valid" && (
          <span className={`flex items-center gap-1.5 text-emerald-600 font-semibold ${isRtl ? "flex-row-reverse" : ""}`}>
            <CheckCircle2 className="w-4 h-4 fill-emerald-50 text-emerald-600 shrink-0" />
            <span className={isRtl ? "text-right text-xs" : "text-left text-xs"}>
              {details.error || `${t.destinationActive} ${details.code ? `(${details.code} ${details.text || "OK"})` : ""}`}
            </span>
          </span>
        )}

        {status === "invalid" && (
          <span className={`flex items-center gap-1.5 text-amber-600 font-semibold break-all ${isRtl ? "flex-row-reverse" : ""}`}>
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
            <span className={isRtl ? "text-right text-xs" : "text-left text-xs"}>
              {details.error || (details.code ? `Failed: Code ${details.code} ${details.text || ""}` : "Verification failed")}
            </span>
          </span>
        )}
      </div>

      {url && (
        <button
          type="button"
          onClick={() => validateUrl(url)}
          className="p-1 hover:bg-slate-100 rounded-[4px] text-slate-400 hover:text-slate-600 transition-colors cursor-pointer shrink-0"
          title={t.forceRevalidate}
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
