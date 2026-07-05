import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Middleware for parsing JSON
app.use(express.json());

// API: Shorten URL
app.post("/api/shorten", async (req: express.Request, res: express.Response): Promise<any> => {
  const { service, longUrl, apiKey, customDomain } = req.body;

  if (!longUrl || typeof longUrl !== "string") {
    return res.status(400).json({ error: "Missing or invalid longUrl parameter" });
  }

  // Active keys: request-supplied key (setting screen) has precedence over server environment variables
  const activeBitlyToken = apiKey || process.env.BITLY_ACCESS_TOKEN;
  const activeRebrandlyKey = apiKey || process.env.REBRANDLY_API_KEY;
  const activeTinyUrlToken = apiKey || process.env.TINYURL_API_TOKEN;
  const activeDubToken = apiKey || process.env.DUB_API_TOKEN || process.env.DUB_TOKEN;

  try {
    if (service === "bitly") {
      if (!activeBitlyToken) {
        return res.status(400).json({ error: "Bitly Access Token is required. Please supply your own token in the UI Settings or configure BITLY_ACCESS_TOKEN on the server." });
      }

      const bitlyBody: any = { long_url: longUrl };
      if (customDomain) {
        bitlyBody.domain = customDomain;
      }

      const response = await fetch("https://api-ssl.bitly.com/v4/shorten", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${activeBitlyToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bitlyBody),
      });

      const data: any = await response.json();
      if (!response.ok) {
        return res.status(response.status).json({
          error: data.message || data.description || "Bitly API returned an error.",
          details: data,
        });
      }

      return res.json({ shortUrl: data.link });
    } else if (service === "rebrandly") {
      if (!activeRebrandlyKey) {
        return res.status(400).json({ error: "Rebrandly API Key is required. Please supply your own API key in the UI Settings or configure REBRANDLY_API_KEY on the server." });
      }

      const rebrandlyBody: any = { destination: longUrl };
      if (customDomain) {
        rebrandlyBody.domain = { fullName: customDomain };
      }

      const response = await fetch("https://api.rebrandly.com/v1/links", {
        method: "POST",
        headers: {
          "apikey": activeRebrandlyKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(rebrandlyBody),
      });

      const data: any = await response.json();
      if (!response.ok) {
        return res.status(response.status).json({
          error: data.message || "Rebrandly API returned an error.",
          details: data,
        });
      }

      let shortUrl = data.shortUrl;
      if (shortUrl && !shortUrl.startsWith("http://") && !shortUrl.startsWith("https://")) {
        shortUrl = `https://${shortUrl}`;
      }
      return res.json({ shortUrl });
    } else if (service === "tinyurl") {
      if (activeTinyUrlToken) {
        const response = await fetch("https://api.tinyurl.com/create", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${activeTinyUrlToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            url: longUrl,
            domain: customDomain || "tinyurl.com",
          }),
        });

        const data: any = await response.json();
        if (!response.ok) {
          const errorMsg = data.errors && data.errors.length > 0
            ? (typeof data.errors[0] === "object" ? JSON.stringify(data.errors) : data.errors.join(", "))
            : (data.message || "TinyURL API returned an error.");
          return res.status(response.status).json({
            error: errorMsg,
            details: data,
          });
        }
        return res.json({ shortUrl: data.data.tiny_url });
      } else {
        // Fallback to anonymous plain-text TinyURL API creator
        const response = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(longUrl)}`);
        if (!response.ok) {
          const text = await response.text();
          return res.status(response.status).json({ error: text || "TinyURL anonymous API returned an error." });
        }
        const shortUrl = await response.text();
        return res.json({ shortUrl });
      }
    } else if (service === "dub") {
      if (!activeDubToken) {
        return res.status(400).json({ error: "DUB API Token is required. Please supply your API token in the UI Settings or configure DUB_API_TOKEN on the server." });
      }

      const response = await fetch("https://api.dub.co/links", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${activeDubToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: longUrl,
          domain: customDomain || "dub.sh",
        }),
      });

      const data: any = await response.json();
      if (!response.ok) {
        const errorMsg = data.error?.message || data.message || "DUB API returned an error.";
        return res.status(response.status).json({
          error: errorMsg,
          details: data,
        });
      }
      return res.json({ shortUrl: data.shortLink });
    } else {
      return res.status(400).json({ error: `Unsupported shortener service: ${service}` });
    }
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "An internal error occurred while shortening the URL." });
  }
});

// Vite & Static file handler integration
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req: express.Request, res: express.Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`UTM Campaign Builder running at http://localhost:${PORT}`);
  });
}

startServer();
