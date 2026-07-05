# UTM Campaign Builder 🚀

An enterprise-grade, high-performance web application designed to construct, validate, shorten, and archive marketing campaign URLs with ease. Fully localized and responsive for desktop and mobile devices.

👉 **[Try the UTM Campaign Builder Live](https://netolink.github.io/UTM-Campaign-Builder/)**

---

## 🌍 Multilingual Support
The application features complete translation and localization across multiple languages. You can switch instantly between:
- **English** (Default)
- **Hebrew (עברית)** (Full Right-to-Left RTL alignment, custom localized terms, alerts, and placeholders)
- **Russian (Русский)**

---

## 🌟 Key Features

### 1. Dynamic Link Constructor
- Assemble URLs instantly with standard Google Analytics parameters:
  - `utm_source`
  - `utm_medium`
  - `utm_campaign`
  - `utm_term`
  - `utm_content`
  - `utm_id`
- Easily append custom tracking parameters (e.g., `gclid`, `fbclid`, or custom analytical identifiers).
- Auto-validation checks for trailing slashes, protocols (`http`/`https`), and URL encoding integrity.

### 2. Batch URL Builder Ledger
- **Flexible Data Import**: Paste newline-separated URLs manually, drag & drop, or upload TXT/CSV files containing base destination URLs.
- **Bulk Action Ledger**: Edit individual cells within an interactive grid spreadsheet.
- **Global UTM Configuration**: Set source, medium, campaign, term, content, or ID globally to either fill missing empty fields or overwrite all row parameters at once.
- **Bulk Action Operations**:
  - Bulk Shorten: Sequentially request short URLs for all valid rows with elegant rate-limit handling.
  - Bulk Copy: Instantly extract full UTMs or shortened versions straight to your clipboard.
  - Bulk Archive: Send all compiled configurations into your campaign history with a single click.
  - CSV Export: Download your entire structured grid back into a clean CSV spreadsheet.

### 3. Smart Templates
- **Built-in Official Blueprints**: Standard official presets for Google Search, Facebook Ads, LinkedIn Organic, Newsletter, and Twitter/X campaigns.
- **Custom Templates**: Configure custom combinations of tracking keys, name them, and save them for instant recurring usage.
- Integrated templates search engine and deletion tool.

### 4. Campaign Presets
- Capture the entire current form state (Base URL, all UTM fields, custom parameters) and store it as a quick-access campaign preset.
- Instantly recall full campaigns with one click.
- Full search functionality to easily find, apply, or delete custom presets.

### 5. URL Shortener Integrations
Shorten links instantly using your preferred service directly from the interface:
- **TinyURL**: Anonymous free service, or token-authenticated domains and aliases.
- **Bitly**: Authenticate via personal access tokens to register click statistics.
- **Rebrandly**: Customize with custom branded domains and workspace APIs.
- **Dub.co**: Modern high-performance links shortening with advanced targeting support.

### 6. Live QR Code Generator
- Real-time generation of high-contrast, scalable QR codes for any created campaign URL.
- Customize foreground colors to align with your corporate brand guidelines.
- Fast downloadable image export directly to your local file system.

### 7. Storage & Secure Persistence
- **Guest Mode**: Safely saves templates, presets, and history using client-side `localStorage`.
- **Cloud Database Synchronization**: Login with Google Credentials (via Firebase Auth) to seamlessly back up and synchronize all templates, presets, and campaign history logs securely to Firestore.

---

## 🔗 Shortening Service APIs & Documentation
For developers looking to integrate or configure keys within the application, here are the links to the official API docs for each service:

| Service | Official Developers Portal | Key Requirements |
| :--- | :--- | :--- |
| **TinyURL** | [TinyURL API Documentation 📖](https://tinyurl.com/app/dev) | API Token / Custom Domains / Free Tier Available |
| **Bitly** | [Bitly Developer Center 📖](https://dev.bitly.com/) | OAuth2 Access Tokens / Advanced Click Tracking |
| **Rebrandly** | [Rebrandly API Reference 📖](https://developers.rebrandly.com/) | API Key / Custom Branded Domains / Workspaces |
| **Dub.co** | [Dub.co Developers Platform 📖](https://dub.co/docs) | Dub SDK & Bearer Token / Advanced Geo-analytics |

---

## 🛠️ Technology Stack
- **Frontend Framework**: React 18 with Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database & Auth**: Firebase Firestore & Firebase Authentication
- **Icons**: Lucide React
- **Animations**: Motion (framer-motion)

---

Developed with ❤️ for marketers, agencies, and publishers.
