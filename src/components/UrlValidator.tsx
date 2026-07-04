import React, { useState, useEffect, useCallback } from "react";
import { CheckCircle2, AlertTriangle, Loader2, RefreshCw, HelpCircle } from "lucide-react";

interface UrlValidatorProps {
  url: string;
  onValidationChange?: (isValid: boolean) => void;
}

export default function UrlValidator({ url, onValidationChange }: UrlValidatorProps) {
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
      setDetails({ error: "Invalid URL format. Include http:// or https://" });
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

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const data = await response.json();
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
      setStatus("invalid");
      setDetails({ error: err.message || "Failed to validate URL due to network error." });
      if (onValidationChange) onValidationChange(false);
    }
  }, [onValidationChange]);

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
    <div className="flex items-center gap-3 text-xs border border-slate-100 bg-slate-50/70 p-2.5 rounded-lg">
      <div className="font-medium text-slate-500 uppercase tracking-wider text-[10px]">Real-time Validation:</div>
      <div className="flex-1 flex items-center gap-2">
        {status === "idle" && (
          <span className="flex items-center gap-1.5 text-slate-400">
            <HelpCircle className="w-4 h-4 text-slate-300" />
            Enter a destination URL to validate
          </span>
        )}

        {status === "loading" && (
          <span className="flex items-center gap-1.5 text-blue-600 font-medium">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            Testing destination availability...
          </span>
        )}

        {status === "valid" && (
          <span className="flex items-center gap-1.5 text-emerald-600 font-medium">
            <CheckCircle2 className="w-4 h-4 fill-emerald-50 text-emerald-600" />
            Destination is Active {details.code ? `(${details.code} ${details.text || "OK"})` : ""}
          </span>
        )}

        {status === "invalid" && (
          <span className="flex items-center gap-1.5 text-amber-600 font-medium break-all">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
            <span>
              {details.error || `Failed: Code ${details.code} ${details.text || ""}`}
            </span>
          </span>
        )}
      </div>

      {url && (
        <button
          type="button"
          onClick={() => validateUrl(url)}
          className="p-1 hover:bg-slate-200/60 rounded-md text-slate-400 hover:text-slate-600 transition-colors"
          title="Force Re-validate"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
