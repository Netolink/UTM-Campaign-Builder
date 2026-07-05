import { ShortenerSettings } from "../types";

export interface ShortenParams {
  service: "none" | "bitly" | "rebrandly" | "tinyurl" | "dub";
  longUrl: string;
  settings: ShortenerSettings;
  lang?: string;
}

/**
 * Perform a client-side direct call to the shortener API.
 * This is used as a fallback when the backend API proxy is unavailable
 * (e.g., when the app is hosted on static servers like GitHub Pages).
 */
async function shortenDirectlyOnClient({ service, longUrl, settings }: ShortenParams): Promise<string> {
  if (service === "bitly") {
    const token = settings.bitlyToken;
    if (!token) {
      throw new Error("MISSING_CREDENTIALS");
    }
    const body: any = { long_url: longUrl };
    if (settings.bitlyDomain) {
      body.domain = settings.bitlyDomain;
    }

    const response = await fetch("https://api-ssl.bitly.com/v4/shorten", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || data.description || "Bitly direct API error");
    }
    return data.link;
  }

  if (service === "rebrandly") {
    const key = settings.rebrandlyKey;
    if (!key) {
      throw new Error("MISSING_CREDENTIALS");
    }
    const body: any = { destination: longUrl };
    if (settings.rebrandlyDomain) {
      body.domain = { fullName: settings.rebrandlyDomain };
    }

    const response = await fetch("https://api.rebrandly.com/v1/links", {
      method: "POST",
      headers: {
        "apikey": key,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Rebrandly direct API error");
    }
    let shortUrl = data.shortUrl;
    if (shortUrl && !shortUrl.startsWith("http://") && !shortUrl.startsWith("https://")) {
      shortUrl = `https://${shortUrl}`;
    }
    return shortUrl;
  }

  if (service === "dub") {
    const token = settings.dubToken;
    if (!token) {
      throw new Error("MISSING_CREDENTIALS");
    }
    const response = await fetch("https://api.dub.co/links", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: longUrl,
        domain: settings.dubDomain || "dub.sh",
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error?.message || data.message || "Dub direct API error");
    }
    return data.shortLink;
  }

  if (service === "tinyurl") {
    const token = settings.tinyurlToken;
    if (token) {
      const response = await fetch("https://api.tinyurl.com/create", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: longUrl,
          domain: settings.tinyurlDomain || "tinyurl.com",
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        const errorMsg = data.errors && data.errors.length > 0
          ? (typeof data.errors[0] === "object" ? JSON.stringify(data.errors) : data.errors.join(", "))
          : (data.message || "TinyURL direct API error");
        throw new Error(errorMsg);
      }
      return data.data.tiny_url;
    } else {
      // Fallback to anonymous plain-text TinyURL API creator (supports client-side CORS)
      const response = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(longUrl)}`);
      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "TinyURL anonymous direct API error");
      }
      return await response.text();
    }
  }

  throw new Error("Unsupported service");
}

/**
 * Unified shortening function with smart fallback.
 * First tries the backend proxy /api/shorten.
 * If the response is HTML (static hosting/GitHub Pages fallback) or JSON parsing fails with a non-JSON response,
 * it automatically switches to a direct client-side call using the configured credentials.
 */
export async function shortenUrl({ service, longUrl, settings, lang = "en" }: ShortenParams): Promise<string> {
  if (service === "none") {
    return longUrl;
  }

  let apiKeyToUse = "";
  let domainToUse = "";

  if (service === "bitly") {
    apiKeyToUse = settings.bitlyToken;
    domainToUse = settings.bitlyDomain;
  } else if (service === "rebrandly") {
    apiKeyToUse = settings.rebrandlyKey;
    domainToUse = settings.rebrandlyDomain;
  } else if (service === "tinyurl") {
    apiKeyToUse = settings.tinyurlToken;
    domainToUse = settings.tinyurlDomain;
  } else if (service === "dub") {
    apiKeyToUse = settings.dubToken;
    domainToUse = settings.dubDomain;
  }

  // 1. Try backend proxy
  try {
    const res = await fetch("/api/shorten", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        service,
        longUrl,
        apiKey: apiKeyToUse || undefined,
        customDomain: domainToUse || undefined,
      }),
    });

    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("text/html") || !res.ok && res.status === 404) {
      // Backend is absent (static deployment / GitHub Pages fallback).
      // Fallback to direct client-side request.
      return await shortenDirectlyOnClient({ service, longUrl, settings, lang });
    }

    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      // JSON parse failed (likely HTML response). Fallback directly.
      if (text.trim().startsWith("<")) {
        return await shortenDirectlyOnClient({ service, longUrl, settings, lang });
      }
      throw e;
    }

    if (!res.ok) {
      throw new Error(data.error || "Failed to shorten via backend.");
    }

    return data.shortUrl;
  } catch (err: any) {
    // If the error was specifically "MISSING_CREDENTIALS" during fallback
    if (err.message === "MISSING_CREDENTIALS") {
      throw createFriendlyMissingCredentialsError(service, lang);
    }

    // If it was some other error, but we haven't tried direct call yet (and it wasn't a manual throw)
    // we try direct call as a last resort.
    try {
      return await shortenDirectlyOnClient({ service, longUrl, settings, lang });
    } catch (directErr: any) {
      if (directErr.message === "MISSING_CREDENTIALS") {
        throw createFriendlyMissingCredentialsError(service, lang);
      }
      // Combine errors or provide user friendly message
      throw new Error(getFriendlyErrorMessage(directErr.message || err.message, service, lang));
    }
  }
}

function createFriendlyMissingCredentialsError(service: string, lang: string): Error {
  const serviceName = service.toUpperCase();
  if (lang === "he") {
    return new Error(
      `דרוש מפתח API עבור קיצור ב-${serviceName}.\nאנא לחץ על גלגל השיניים ⚙️ בפינה הימנית העליונה והזן את מפתח ה-API האישי שלך.`
    );
  }
  if (lang === "ru") {
    return new Error(
      `Требуется API-ключ для сокращения через ${serviceName}.\nПожалуйста, нажмите на шестеренку ⚙️ в правом верхнем углу и настройте ваши ключи API.`
    );
  }
  return new Error(
    `API credentials are required for ${serviceName}.\nPlease click the gear icon ⚙️ in the top right corner to enter your API credentials.`
  );
}

function getFriendlyErrorMessage(rawMessage: string, service: string, lang: string): string {
  const serviceName = service.toUpperCase();
  const isHtml = rawMessage.includes("<html") || rawMessage.includes("Unexpected token '<'") || rawMessage.includes("is not valid JSON");
  
  if (isHtml) {
    if (lang === "he") {
      return `לא ניתן להתחבר לשרת הקיצור.\nמכיוון שהאפליקציה רצה כשרת סטטי (למשל ב-GitHub Pages), עליך להגדיר מפתח API אישי משלך.\n\nאנא לחץ על גלגל השיניים ⚙️ בפינה הימנית העליונה כדי להזין את מפתח ה-API עבור ${serviceName}.`;
    }
    if (lang === "ru") {
      return `Не удалось подключиться к серверу сокращения.\nПоскольку приложение работает как статический сайт (например, на GitHub Pages), вам необходимо настроить собственный API-ключ.\n\nНажмите на шестеренку ⚙️ в правом верхнем углу, чтобы ввести API-ключ для ${serviceName}.`;
    }
    return `Unable to connect to the shortening server proxy.\nSince this app is running on a static hosting (like GitHub Pages), you need to configure your own API credentials.\n\nClick the gear icon ⚙️ in the top right to set your API key for ${serviceName}.`;
  }

  // General API error
  if (lang === "he") {
    return `שגיאה משרת ה-API של ${serviceName}: ${rawMessage}\nאנא ודא שהגדרת מפתח תקין ופעיל תחת תפריט ההגדרות (סמל גלגל השיניים ⚙️ מצד ימין למעלה).`;
  }
  if (lang === "ru") {
    return `Ошибка API ${serviceName}: ${rawMessage}\nПожалуйста, убедитесь, что вы настроили действительный ключ в меню настроек (иконка шестеренки ⚙️ в правом верхнем углу).`;
  }
  return `API error from ${serviceName}: ${rawMessage}\nPlease verify you have set a valid and active token under the Integration Settings (gear icon ⚙️ in the top right).`;
}
