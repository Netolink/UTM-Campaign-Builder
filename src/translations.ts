export type Language = "en" | "he" | "ru";

export interface TranslationDict {
  title: string;
  subtitle: string;
  creatorTab: string;
  batchTab: string;
  templatesTab: string;
  historyTab: string;
  apiIntegrations: string;
  checkingSync: string;
  guestMode: string;
  cloudSync: string;
  signOut: string;
  signInWithGoogle: string;
  resetForm: string;
  
  // Creator Form
  urlTitle: string;
  urlLabel: string;
  urlPlaceholder: string;
  urlHelp: string;
  
  sourceLabel: string;
  sourcePlaceholder: string;
  sourceHelp: string;
  
  mediumLabel: string;
  mediumPlaceholder: string;
  mediumHelp: string;
  
  campaignLabel: string;
  campaignPlaceholder: string;
  campaignHelp: string;
  
  termLabel: string;
  termPlaceholder: string;
  termHelp: string;
  
  contentLabel: string;
  contentPlaceholder: string;
  contentHelp: string;
  
  idLabel: string;
  idPlaceholder: string;
  idHelp: string;
  
  customParamsTitle: string;
  addParamBtn: string;
  paramKeyPlaceholder: string;
  paramValuePlaceholder: string;
  
  // Output sections
  assembledTitle: string;
  shortenedTitle: string;
  fullUrlLabel: string;
  shortUrlLabel: string;
  copyBtn: string;
  copiedBtn: string;
  shortenBtn: string;
  shorteningBtn: string;
  saveHistoryBtn: string;
  qrCodeBtn: string;
  
  // Batch Tab
  batchTitle: string;
  batchSubtitle: string;
  batchPastePlaceholder: string;
  batchDragDropText: string;
  batchUploadBtn: string;
  batchGlobalTitle: string;
  batchApplyGlobals: string;
  batchProcessBtn: string;
  batchProcessing: string;
  batchExportBtn: string;
  batchClearBtn: string;
  batchAddRow: string;
  
  // Templates Tab
  templatesTitle: string;
  templatesSubtitle: string;
  builtInSection: string;
  customSection: string;
  createNewTemplate: string;
  templateNameLabel: string;
  templateDescLabel: string;
  saveTemplateBtn: string;
  useTemplateBtn: string;
  deleteTemplateBtn: string;
  
  // History Tab
  historyTitle: string;
  historySubtitle: string;
  clearAllHistory: string;
  tableCampaign: string;
  tableUrls: string;
  tableDate: string;
  tableActions: string;
  noHistoryMsg: string;
  
  // Auth error modal
  authBlockedTitle: string;
  authBlockedSubtitle: string;
  authBlockedClose: string;
  authBlockedIframeMessage: string;
  authBlockedUnauthorizedDomainMessage: string;
  
  // Common UI words
  close: string;
  save: string;
  cancel: string;
  allRightsReserved: string;
  legalTermsLink: string;

  // Real-time validation
  realTimeValidation: string;
  enterDestinationToValidate: string;
  testingDestination: string;
  destinationActive: string;
  forceRevalidate: string;
  invalidUrlFormat: string;
  validationNetworkError: string;
  validationStaticHost: string;

  // API Integration settings modal
  apiSettingsTitle: string;
  apiSettingsSubtitle: string;
  securityPolicyTitle: string;
  securityPolicyDesc: string;
  securityPolicyDescLogged: string;
  bitlyTitle: string;
  rebrandlyTitle: string;
  dubTitle: string;
  tinyurlTitle: string;
  getBitlyToken: string;
  getRebrandlyKey: string;
  getDubToken: string;
  getTinyurlToken: string;
  accessTokenLabel: string;
  customDomainLabel: string;
  apiKeyLabel: string;
  apiTokenLabel: string;
  brandedDomainLabel: string;
  tinyurlFallbackNote: string;
  settingsSavedBtn: string;
  saveConfigBtn: string;

  // Batch Creator & Templates/Presets Translation Additions
  batchImportTitle: string;
  batchImportDesc: string;
  batchDragDropTitle: string;
  batchDragDropDesc: string;
  batchOrPasteManually: string;
  batchParseAppend: string;
  batchGlobalConfigTitle: string;
  batchGlobalConfigDesc: string;
  batchFillEmpty: string;
  batchOverwriteAll: string;
  batchLedgerTitle: string;
  batchLedgerDesc: string;
  batchBulkShorten: string;
  batchCopyUtms: string;
  batchLogHistory: string;
  batchDownloadCsv: string;
  batchTableHeaderUrl: string;
  batchTableHeaderSource: string;
  batchTableHeaderMedium: string;
  batchTableHeaderCampaign: string;
  batchTableHeaderOutput: string;
  batchTableHeaderQr: string;
  batchTableHeaderActions: string;
  batchWaitingUrl: string;
  batchShortenAction: string;
  batchConfirmClear: string;
  batchNotificationImportSuccess: string;
  batchNotificationImportFail: string;
  batchNotificationAppendSuccess: string;
  batchNotificationNoUrls: string;
  batchNotificationApplySuccess: string;
  batchNotificationApplyMissing: string;
  batchNotificationClearSuccess: string;
  batchNotificationNoCompiled: string;
  batchNotificationCopySuccess: string;
  batchNotificationShortenSuccess: string;
  batchNotificationShortenFail: string;
  batchNotificationBatchStart: string;
  batchNotificationBatchEmpty: string;
  batchNotificationConfigureService: string;
  batchNotificationBatchComplete: string;
  batchNotificationNoArchive: string;
  batchNotificationArchiveSuccess: string;

  tplTitle: string;
  tplDesc: string;
  tplSaveCurrentBtn: string;
  tplSaveAsCustomTitle: string;
  tplNameLabel: string;
  tplDescLabel: string;
  tplCreateBtn: string;
  tplSearchPlaceholder: string;
  tplNoMatches: string;
  tplOfficialBadge: string;
  tplCustomBadge: string;
  tplDefaultDesc: string;
  tplDeleteTooltip: string;

  presetTitle: string;
  presetDesc: string;
  presetInputPlaceholder: string;
  presetSaveBtn: string;
  presetSavedBtn: string;
  presetSearchPlaceholder: string;
  presetActiveBadge: string;
  presetLoadBadge: string;
  presetDeleteTooltip: string;
  presetNoPresets: string;
}

export const translations: Record<Language, TranslationDict> = {
  en: {
    title: "UTM Campaign Builder",
    subtitle: "Construct, validate, shorten, and archive enterprise campaign URLs",
    creatorTab: "Campaign Link Creator",
    batchTab: "Batch Creation",
    templatesTab: "Templates & Presets",
    historyTab: "Campaign History Log",
    apiIntegrations: "API Integrations",
    checkingSync: "Checking sync...",
    guestMode: "Guest Mode",
    cloudSync: "Cloud",
    signOut: "Sign Out",
    signInWithGoogle: "Sign In with Google",
    resetForm: "Reset Form",
    
    // Creator Form
    urlTitle: "Website Details",
    urlLabel: "Website URL *",
    urlPlaceholder: "e.g., https://example.com/landing-page",
    urlHelp: "The full web address of your campaign page (HTTP/HTTPS supported)",
    
    sourceLabel: "Campaign Source (utm_source) *",
    sourcePlaceholder: "e.g., google, newsletter, facebook",
    sourceHelp: "Referrer of traffic (e.g. search engine, newsletter, forum)",
    
    mediumLabel: "Campaign Medium (utm_medium) *",
    mediumPlaceholder: "e.g., cpc, email, paid-social",
    mediumHelp: "Marketing medium used (e.g. banner ad, social post, email)",
    
    campaignLabel: "Campaign Name (utm_campaign) *",
    campaignPlaceholder: "e.g., summer_promo_2026, launch_event",
    campaignHelp: "Product promo, slogan, or general identifier",
    
    termLabel: "Campaign Term (utm_term)",
    termPlaceholder: "e.g., marketing_strategy, keyword_phrase",
    termHelp: "Identify paid search keywords for keyword-based ads",
    
    contentLabel: "Campaign Content (utm_content)",
    contentPlaceholder: "e.g., side_banner, header_cta, logo_version",
    contentHelp: "Differentiate ads/links pointing to the same URL (A/B testing)",
    
    idLabel: "Campaign ID (utm_id)",
    idPlaceholder: "e.g., promo_code_123, cid_9901",
    idHelp: "Unique identifier for Google Analytics campaign matching",
    
    customParamsTitle: "Custom Parameters (Optional)",
    addParamBtn: "Add Parameter",
    paramKeyPlaceholder: "Key (e.g., user_segment)",
    paramValuePlaceholder: "Value (e.g., premium)",
    
    // Output sections
    assembledTitle: "Assembled Campaign Link",
    shortenedTitle: "Shortened Link Integration",
    fullUrlLabel: "Full Campaign URL",
    shortUrlLabel: "Short Link",
    copyBtn: "Copy Link",
    copiedBtn: "Copied!",
    shortenBtn: "Generate Short Link",
    shorteningBtn: "Shortening...",
    saveHistoryBtn: "Save to Ledger History",
    qrCodeBtn: "Generate QR Code",
    
    // Batch Tab
    batchTitle: "Batch Campaign Generator",
    batchSubtitle: "Construct and shorten multiple campaign URLs at once via CSV upload or bulk paste",
    batchPastePlaceholder: "Paste CSV lines here (comma-separated with headers, e.g., URL,Source,Medium,Campaign...)",
    batchDragDropText: "Drag & drop CSV files here, or click to browse",
    batchUploadBtn: "Parse CSV Data",
    batchGlobalTitle: "Apply Globals to Empty Fields",
    batchApplyGlobals: "Apply Globals",
    batchProcessBtn: "Compile Batch Links",
    batchProcessing: "Processing...",
    batchExportBtn: "Export to CSV",
    batchClearBtn: "Reset Batch Engine",
    batchAddRow: "Add Row",
    
    // Templates Tab
    templatesTitle: "Campaign Templates & Quick Presets",
    templatesSubtitle: "Define and store campaign tracking patterns to streamline repetitive marketing setups",
    builtInSection: "Standard Tracking Presets (Built-In)",
    customSection: "Your Saved Custom Tracking Templates",
    createNewTemplate: "Create New Template Preset",
    templateNameLabel: "Preset Name",
    templateDescLabel: "Preset Description",
    saveTemplateBtn: "Save Preset",
    useTemplateBtn: "Use Preset",
    deleteTemplateBtn: "Delete",
    
    // History Tab
    historyTitle: "Campaign Tracking Archive Ledger",
    historySubtitle: "A record of compiled, validated, and shortened tracking links generated on your account",
    clearAllHistory: "Purge Archive",
    tableCampaign: "Campaign Name",
    tableUrls: "Destination & Shortened URLs",
    tableDate: "Creation Date",
    tableActions: "Actions",
    noHistoryMsg: "No logs registered. Start building and tracking links to populate your campaign history!",
    
    // Auth error modal
    authBlockedTitle: "Google Sign-In Blocked",
    authBlockedSubtitle: "Security & Configuration Notice",
    authBlockedClose: "Understood, thanks",
    authBlockedIframeMessage: "Google Sign-In is blocked inside the preview iframe due to browser cross-origin security policies.\n\nTo log in successfully and synchronize your data to Firestore Cloud, click the 'Open in new tab' button at the top right corner of the AI Studio preview window, and sign in from there!",
    authBlockedUnauthorizedDomainMessage: "Unauthorized Domain Error.\n\nYour current domain is not authorized in your Firebase Project.\n\nTo fix this, you need to add your domain to the authorized list in Firebase Console:\n\n1. Open your Firebase Console.\n2. Go to Authentication -> Settings -> Authorized domains.\n3. Click 'Add domain' and input your current domain:\n   👉  {domain}  👈\n4. (Optional) Also authorize netolink.github.io if deploying to GitHub Pages.\n5. Click Save, wait a moment, and try signing in again!",
    
    // Common UI words
    close: "Close",
    save: "Save Settings",
    cancel: "Cancel",
    allRightsReserved: "All rights reserved.",
    legalTermsLink: "Terms & Policies",

    // Real-time validation
    realTimeValidation: "Real-time Validation:",
    enterDestinationToValidate: "Enter a destination URL to validate",
    testingDestination: "Testing destination availability...",
    destinationActive: "Destination is Active",
    forceRevalidate: "Force Re-validate",
    invalidUrlFormat: "Invalid URL format. Include http:// or https://",
    validationNetworkError: "URL is formatted correctly! However, live check failed due to a network or connection issue (the site might be offline or blocking external requests).",
    validationStaticHost: "URL format is valid! (Verified via browser-side connection check since there is no backend server).",

    // API Integration settings modal
    apiSettingsTitle: "API Integration Settings",
    apiSettingsSubtitle: "Configure link shorteners with your own API credentials",
    securityPolicyTitle: "Security Policy:",
    securityPolicyDesc: "Credentials entered here are saved 100% locally in your own browser's localStorage. They never touch third-party databases and are proxied securely to prevent client-side credential leaking.",
    securityPolicyDescLogged: "Because you are signed in, your API credentials are saved securely in your personal Cloud account (Firestore) and synced across your devices. They are proxied securely on the server to prevent client-side leaks.",
    bitlyTitle: "Bitly Configuration",
    rebrandlyTitle: "Rebrandly Configuration",
    dubTitle: "DUB.co Configuration",
    tinyurlTitle: "TinyURL Configuration",
    getBitlyToken: "Get Bitly Token",
    getRebrandlyKey: "Get Rebrandly Key",
    getDubToken: "Get DUB API Token",
    getTinyurlToken: "Get TinyURL Token",
    accessTokenLabel: "Access Token",
    customDomainLabel: "Custom Domain (Optional)",
    apiKeyLabel: "API Key",
    apiTokenLabel: "API Token",
    brandedDomainLabel: "Branded Domain (Optional)",
    tinyurlFallbackNote: "* Note: If TinyURL Token is left empty, the application will automatically fallback to TinyURL's free anonymous API for shortening!",
    settingsSavedBtn: "Settings Saved!",
    saveConfigBtn: "Save Configuration",

    // Batch Creator & Templates/Presets English Translation
    batchImportTitle: "Import Base URL List",
    batchImportDesc: "Upload a TXT/CSV file or paste newline-separated destination links",
    batchDragDropTitle: "Drag & Drop files here",
    batchDragDropDesc: "or click to browse from system (.csv or .txt)",
    batchOrPasteManually: "or paste manually",
    batchParseAppend: "Parse URLs & Append",
    batchGlobalConfigTitle: "Global / Bulk UTM Builder Config",
    batchGlobalConfigDesc: "Configure common tracking tags to apply instantly or fill empty cells in your list",
    batchFillEmpty: "Fill Empty Row Fields",
    batchOverwriteAll: "Overwrite All Row Parameters",
    batchLedgerTitle: "Batch URL Builder Ledger",
    batchLedgerDesc: "Review, edit, and bulk-process campaign links in real-time",
    batchBulkShorten: "Bulk Shorten",
    batchCopyUtms: "Copy UTMs",
    batchLogHistory: "Log to History",
    batchDownloadCsv: "Download CSV",
    batchTableHeaderUrl: "Website Destination Base URL",
    batchTableHeaderSource: "Source",
    batchTableHeaderMedium: "Medium",
    batchTableHeaderCampaign: "Campaign",
    batchTableHeaderOutput: "Compiled Outputs",
    batchTableHeaderQr: "QR Code",
    batchTableHeaderActions: "Actions",
    batchWaitingUrl: "Waiting for URL...",
    batchShortenAction: "Shorten",
    batchConfirmClear: "Are you sure you want to clear all batch rows?",
    batchNotificationImportSuccess: "Successfully imported {count} URLs!",
    batchNotificationImportFail: "Could not parse any valid URLs from the file.",
    batchNotificationAppendSuccess: "Added {count} URLs to the table.",
    batchNotificationNoUrls: "No valid URLs found in paste input.",
    batchNotificationApplySuccess: "Applied global UTM parameters to all rows!",
    batchNotificationApplyMissing: "Filled missing parameters with global values.",
    batchNotificationClearSuccess: "Cleared all batch entries.",
    batchNotificationNoCompiled: "No compiled URLs to copy.",
    batchNotificationCopySuccess: "Copied {count} links to clipboard!",
    batchNotificationShortenSuccess: "URL shortened successfully!",
    batchNotificationShortenFail: "Shortening service failure.",
    batchNotificationBatchStart: "Starting batch shortening for {count} links...",
    batchNotificationBatchEmpty: "All valid rows are already shortened or empty.",
    batchNotificationConfigureService: "Please configure and select a Shortening Service in top-right menu.",
    batchNotificationBatchComplete: "Batch shortening operation complete!",
    batchNotificationNoArchive: "No compiled links to archive.",
    batchNotificationArchiveSuccess: "Archived {count} links to the history log!",

    tplTitle: "Parameter Templates",
    tplDesc: "Select standard channels or custom tracking blueprints",
    tplSaveCurrentBtn: "Save Current Config",
    tplSaveAsCustomTitle: "Save Setup as Custom Template",
    tplNameLabel: "Template Name",
    tplDescLabel: "Description (Optional)",
    tplCreateBtn: "Create Custom Template",
    tplSearchPlaceholder: "Search templates...",
    tplNoMatches: "No templates matching \"{query}\"",
    tplOfficialBadge: "Official",
    tplCustomBadge: "Custom",
    tplDefaultDesc: "Custom tracking templates.",
    tplDeleteTooltip: "Delete Custom Template",

    presetTitle: "Saved Presets (Quick Access)",
    presetDesc: "Save and reload complete campaign form configurations",
    presetInputPlaceholder: "Save current setup as preset...",
    presetSaveBtn: "Save",
    presetSavedBtn: "Saved",
    presetSearchPlaceholder: "Search saved presets...",
    presetActiveBadge: "Active",
    presetLoadBadge: "Load",
    presetDeleteTooltip: "Delete Preset",
    presetNoPresets: "No saved presets found"
  },
  he: {
    title: "יוצר קישורי UTM",
    subtitle: "בנייה, אימות, קיצור וארכוב של כתובות קישורי קמפיין ברמה ארגונית",
    creatorTab: "יוצר קישורים",
    batchTab: "יצירה קבוצתית (Batch)",
    templatesTab: "תבניות וערכות מוכנות",
    historyTab: "יומן היסטוריית קמפיינים",
    apiIntegrations: "אינטגרציות API",
    checkingSync: "בודק סנכרון...",
    guestMode: "מצב אורח",
    cloudSync: "ענן",
    signOut: "התנתק",
    signInWithGoogle: "התחבר עם גוגל",
    resetForm: "איפוס טופס",
    
    // Creator Form
    urlTitle: "פרטי אתר האינטרנט",
    urlLabel: "כתובת אתר (Website URL) *",
    urlPlaceholder: "לדוגמה: https://example.com/landing-page",
    urlHelp: "כתובת האינטרנט המלאה של דף הקמפיין שלך (נתמך ב-HTTP/HTTPS)",
    
    sourceLabel: "מקור הקמפיין (utm_source) *",
    sourcePlaceholder: "לדוגמה: google, newsletter, facebook",
    sourceHelp: "הגורם המפנה (למשל מנוע חיפוש, ניוזלטר, פורום)",
    
    mediumLabel: "אמצעי הקמפיין (utm_medium) *",
    mediumPlaceholder: "לדוגמה: cpc, email, paid-social",
    mediumHelp: "סוג המדיה השיווקית שבה נעשה שימוש (למשל באנר, פוסט חברתי, אימייל)",
    
    campaignLabel: "שם הקמפיין (utm_campaign) *",
    campaignPlaceholder: "לדוגמה: summer_promo_2026, launch_event",
    campaignHelp: "קידום מוצר, סלוגן שיווקי או מזהה קמפיין כללי",
    
    termLabel: "מונח קמפיין (utm_term)",
    termPlaceholder: "לדוגמה: marketing_strategy, keyword_phrase",
    termHelp: "זיהוי מילות מפתח ממומנות עבור מודעות מבוססות חיפוש",
    
    contentLabel: "תוכן קמפיין (utm_content)",
    contentPlaceholder: "לדוגמה: side_banner, header_cta, logo_version",
    contentHelp: "להבחנה בין מודעות/קישורים המפנים לאותו קהל יעד (מבחני A/B)",
    
    idLabel: "מזהה קמפיין (utm_id)",
    idPlaceholder: "לדוגמה: promo_code_123, cid_9901",
    idHelp: "מזהה ייחודי המשמש להתאמת קמפיינים ב-Google Analytics",
    
    customParamsTitle: "פרמטרים מותאמים אישית (אופציונלי)",
    addParamBtn: "הוסף פרמטר",
    paramKeyPlaceholder: "מפתח (למשל: user_segment)",
    paramValuePlaceholder: "ערך (למשל: premium)",
    
    // Output sections
    assembledTitle: "קישור קמפיין מורכב",
    shortenedTitle: "אינטגרציה לקישור קצר",
    fullUrlLabel: "קישור קמפיין מלא",
    shortUrlLabel: "קישור קצר",
    copyBtn: "העתק קישור",
    copiedBtn: "הועתק!",
    shortenBtn: "צור קישור קצר",
    shorteningBtn: "מקצר...",
    saveHistoryBtn: "שמור ביומן ההיסטוריה",
    qrCodeBtn: "צור קוד QR",
    
    // Batch Tab
    batchTitle: "מחולל קישורים קבוצתי",
    batchSubtitle: "בנייה וקיצור של מספר קישורי UTM במקביל באמצעות העלאת קובץ CSV או הדבקה המונית",
    batchPastePlaceholder: "הדבק שורות CSV כאן (מופרדות בפסיק עם כותרות, למשל: URL,Source,Medium,Campaign...)",
    batchDragDropText: "גרור ושחרר קובצי CSV כאן, או לחץ לבחירת קובץ",
    batchUploadBtn: "נתח נתוני CSV",
    batchGlobalTitle: "החל ערכים גלובליים על שדות ריקים",
    batchApplyGlobals: "החל ערכים גלובליים",
    batchProcessBtn: "עבד קישורים קבוצתיים",
    batchProcessing: "מעבד...",
    batchExportBtn: "ייצא ל-CSV",
    batchClearBtn: "אפס מנוע קבוצתי",
    batchAddRow: "הוסף שורה",
    
    // Templates Tab
    templatesTitle: "תבניות קמפיין וערכות מהירות",
    templatesSubtitle: "הגדר ושמור דפוסי מעקב שיווקיים קבועים כדי לחסוך זמן בהקמת קמפיינים חוזרים",
    builtInSection: "תבניות מעקב סטנדרטיות מובנות",
    customSection: "תבניות המעקב השמורות שלך",
    createNewTemplate: "צור תבנית קמפיין חדשה",
    templateNameLabel: "שם התבנית",
    templateDescLabel: "תיאור התבנית",
    saveTemplateBtn: "שמור תבנית",
    useTemplateBtn: "השתמש בתבנית",
    deleteTemplateBtn: "מחק",
    
    // History Tab
    historyTitle: "ארכיון מעקב קמפיינים",
    historySubtitle: "רישום היסטורי של קישורי קמפיין מלאים, מאומתים ומקוצרים שנוצרו בחשבונך",
    clearAllHistory: "נקה היסטוריה לחלוטין",
    tableCampaign: "שם הקמפיין",
    tableUrls: "קישורי יעד ומקוצרים",
    tableDate: "תאריך יצירה",
    tableActions: "פעולות",
    noHistoryMsg: "אין רישומים בהיסטוריה. התחל לבנות קישורים כדי למלא את יומן הקמפיינים שלך!",
    
    // Auth error modal
    authBlockedTitle: "התחברות באמצעות גוגל חסומה",
    authBlockedSubtitle: "הודעת אבטחה והגדרות מערכת",
    authBlockedClose: "הבנתי, תודה",
    authBlockedIframeMessage: "התחברות באמצעות גוגל חסומה בתוך ה-iframe של התצוגה המקדימה עקב מדיניות אבטחה של דפדפנים (Cross-Origin).\n\nכדי להתחבר בהצלחה ולסנכרן את הנתונים שלך לענן Firestore, לחץ על כפתור 'פתח בלשונית חדשה' (Open in new tab) בפינה הימנית העליונה של חלון התצוגה המקדימה ב-AI Studio, והתחבר משם!",
    authBlockedUnauthorizedDomainMessage: "שגיאת דומיין לא מורשה (Unauthorized Domain Error).\n\nהדומיין הנוכחי שלך אינו מורשה בפרויקט Firebase שלך.\n\nכדי לתקן זאת, עליך להוסיף את הדומיין לרשימת הדומיינים המורשים בקונסולת Firebase:\n\n1. פתח את קונסולת Firebase (Firebase Console).\n2. עבור אל Authentication -> Settings -> Authorized domains.\n3. לחץ על 'Add domain' והזן את הדומיין הנוכחי שלך:\n   👉  {domain}  👈\n4. (אופציונלי) הוסף גם את netolink.github.io במידה ואתה מעלה ל-GitHub Pages.\n5. לחץ על שמירה (Save), המתן רגע ונסה להתחבר שוב!",
    
    // Common UI words
    close: "סגור",
    save: "שמור הגדרות",
    cancel: "ביטול",
    allRightsReserved: "כל הזכויות שמורות.",
    legalTermsLink: "תנאי שימוש ומדיניות",

    // Real-time validation
    realTimeValidation: "אימות בזמן אמת:",
    enterDestinationToValidate: "הזן כתובת אתר יעד כדי לאמת אותה",
    testingDestination: "בודק את זמינות היעד...",
    destinationActive: "כתובת היעד פעילה ומחוברת",
    forceRevalidate: "אימות מחדש",
    invalidUrlFormat: "פורמט כתובת אתר לא תקין. יש לכלול http:// או https://",
    validationNetworkError: "פורמט הכתובת תקין לחלוטין! עם זאת, הבדיקה נכשלה עקב שגיאת חיבור או רשת (ייתכן שהאתר לא פעיל, חוסם פניות חיצוניות או שאין חיבור תקין לשרת הבדיקה).",
    validationStaticHost: "פורמט הכתובת תקין! (אומת באמצעות בדיקת חיבור מהדפדפן מכיוון שהאתר רץ ללא שרת אחורי).",

    // API Integration settings modal
    apiSettingsTitle: "הגדרות אינטגרציה של API",
    apiSettingsSubtitle: "הגדר מקצרי קישורים באמצעות אישורי API משלך",
    securityPolicyTitle: "מדיניות אבטחה:",
    securityPolicyDesc: "האישורים המוזנים כאן נשמרים ב-100% באופן מקומי בדפדפן שלך ב-localStorage. הם אינם מגיעים למסדי נתונים של צד שלישי ומעוברים דרך פרוקסי מאובטח למניעת דליפת אישורים לקוח.",
    securityPolicyDescLogged: "מכיוון שאתה מחובר לחשבונך, אישורי ה-API שלך נשמרים בצורה מאובטחת בחשבון הענן האישי שלך (Firestore) כדי להסתנכרן בין המכשירים שלך. הם מעוברים דרך פרוקסי שרת מאובטח למניעת דליפת אישורים.",
    bitlyTitle: "הגדרת Bitly",
    rebrandlyTitle: "הגדרת Rebrandly",
    dubTitle: "הגדרת DUB.co",
    tinyurlTitle: "הגדרת TinyURL",
    getBitlyToken: "קבל מפתח Bitly",
    getRebrandlyKey: "קבל מפתח Rebrandly",
    getDubToken: "קבל מפתח DUB API",
    getTinyurlToken: "קבל מפתח TinyURL",
    accessTokenLabel: "מפתח גישה (Access Token)",
    customDomainLabel: "דומיין מותאם אישית (אופציונלי)",
    apiKeyLabel: "מפתח API (API Key)",
    apiTokenLabel: "מפתח API Token",
    brandedDomainLabel: "דומיין מותג (אופציונלי)",
    tinyurlFallbackNote: "* הערה: אם מפתח TinyURL יישאר ריק, האפליקציה תשתמש אוטומטית ב-API החינמי והאנונימי של TinyURL לצורך קיצור!",
    settingsSavedBtn: "ההגדרות נשמרו!",
    saveConfigBtn: "שמור הגדרות",

    // Batch Creator & Templates/Presets Hebrew Translation
    batchImportTitle: "ייבוא רשימת כתובות אתר",
    batchImportDesc: "העלה קובץ TXT/CSV או הדבק קישורי יעד המופרדים בשורה חדשה",
    batchDragDropTitle: "גרור ושחרר קבצים כאן",
    batchDragDropDesc: "או לחץ כדי לדפדף במערכת (.csv או .txt)",
    batchOrPasteManually: "או הדבק ידנית",
    batchParseAppend: "נתח והוסף כתובות URL",
    batchGlobalConfigTitle: "הגדרות UTM גלובליות / קבוצתיות",
    batchGlobalConfigDesc: "הגדר תגי מעקב נפוצים להחלה מיידית או למילוי תאים ריקים ברשימה שלך",
    batchFillEmpty: "מלא שדות ריקים בשורות",
    batchOverwriteAll: "דרוס פרמטרים בכל השורות",
    batchLedgerTitle: "יומן מחולל הקישורים הקבוצתי",
    batchLedgerDesc: "סקור, ערוך ועבד קישורי קמפיין בכמויות בזמן אמת",
    batchBulkShorten: "קיצור המוני",
    batchCopyUtms: "העתק קישורים",
    batchLogHistory: "שמור בהיסטוריה",
    batchDownloadCsv: "הורד קובץ CSV",
    batchTableHeaderUrl: "כתובת אתר יעד",
    batchTableHeaderSource: "מקור (Source)",
    batchTableHeaderMedium: "אמצעי (Medium)",
    batchTableHeaderCampaign: "קמפיין (Campaign)",
    batchTableHeaderOutput: "קישורים שנוצרו",
    batchTableHeaderQr: "קוד QR",
    batchTableHeaderActions: "פעולות",
    batchWaitingUrl: "ממתין לכתובת URL...",
    batchShortenAction: "קצר קישור",
    batchConfirmClear: "האם אתה בטוח שברצונך למחוק את כל השורות בקבוצה?",
    batchNotificationImportSuccess: "ייבוא בהצלחה של {count} כתובות URL!",
    batchNotificationImportFail: "לא ניתן לנתח כתובות URL תקינות מהקובץ.",
    batchNotificationAppendSuccess: "נוספו {count} כתובות URL לטבלה.",
    batchNotificationNoUrls: "לא נמצאו כתובות URL תקינות בהדבקה.",
    batchNotificationApplySuccess: "פרמטרי UTM גלובליים הוחלו על כל השורות!",
    batchNotificationApplyMissing: "שדות ריקים מולאו בערכים הגלובליים.",
    batchNotificationClearSuccess: "כל הרשומות בקבוצה נמחקו.",
    batchNotificationNoCompiled: "אין קישורים מוכנים להעתקה.",
    batchNotificationCopySuccess: "הועתקו {count} קישורים ללוח הגזירים!",
    batchNotificationShortenSuccess: "הקישור קוצר בהצלחה!",
    batchNotificationShortenFail: "שגיאה בשירות קיצור הקישורים.",
    batchNotificationBatchStart: "מתחיל קיצור המוני עבור {count} קישורים...",
    batchNotificationBatchEmpty: "כל השורות התקינות כבר מקוצרות או ריקות.",
    batchNotificationConfigureService: "אנא הגדר ובחר שירות קיצור קישורים בתפריט הימני העליון.",
    batchNotificationBatchComplete: "פעולת הקיצור ההמוני הושלמה!",
    batchNotificationNoArchive: "אין קישורים מוכנים לארכוב.",
    batchNotificationArchiveSuccess: "אורכבו בהצלחה {count} קישורים ביומן ההיסטוריה!",

    tplTitle: "תבניות פרמטרים",
    tplDesc: "בחר ערוצים סטנדרטיים או תבניות מעקב מותאמות אישית",
    tplSaveCurrentBtn: "שמור הגדרות נוכחיות",
    tplSaveAsCustomTitle: "שמור הגדרה כתבנית מותאמת אישית",
    tplNameLabel: "שם התבנית",
    tplDescLabel: "תיאור (אופציונלי)",
    tplCreateBtn: "צור תבנית מותאמת אישית",
    tplSearchPlaceholder: "חפש תבניות...",
    tplNoMatches: "לא נמצאו תבניות המתאימות ל-\"{query}\"",
    tplOfficialBadge: "רשמי",
    tplCustomBadge: "מותאם אישית",
    tplDefaultDesc: "תבנית מעקב מותאמת אישית.",
    tplDeleteTooltip: "מחק תבנית שמורה",

    presetTitle: "ערכות שמורות (גישה מהירה)",
    presetDesc: "שמור וטען מחדש הגדרות טופס קמפיין מלאות",
    presetInputPlaceholder: "שמור הגדרה נוכחית כערכה...",
    presetSaveBtn: "שמור",
    presetSavedBtn: "נשמר",
    presetSearchPlaceholder: "חפש ערכות שמורות...",
    presetActiveBadge: "פעיל",
    presetLoadBadge: "טען ערכה",
    presetDeleteTooltip: "מחק ערכה שמורה",
    presetNoPresets: "לא נמצאו ערכות שמורות"
  },
  ru: {
    title: "Конструктор ссылок UTM",
    subtitle: "Создание, проверка, сокращение и архивирование ссылок для кампаний корпоративного уровня",
    creatorTab: "Конструктор ссылок",
    batchTab: "Пакетное создание (Batch)",
    templatesTab: "Шаблоны и пресеты",
    historyTab: "Журнал истории кампаний",
    apiIntegrations: "Интеграция API",
    checkingSync: "Проверка синхронизации...",
    guestMode: "Гостевой режим",
    cloudSync: "Облако",
    signOut: "Выйти",
    signInWithGoogle: "Войти через Google",
    resetForm: "Сбросить форму",
    
    // Creator Form
    urlTitle: "Информация о веб-сайте",
    urlLabel: "URL-адрес сайта (Website URL) *",
    urlPlaceholder: "например, https://example.com/landing-page",
    urlHelp: "Полный веб-адрес целевой страницы вашей кампании (поддерживается HTTP/HTTPS)",
    
    sourceLabel: "Источник кампании (utm_source) *",
    sourcePlaceholder: "например, google, newsletter, facebook",
    sourceHelp: "Реферер трафика (например, поисковая система, рассылка, форум)",
    
    mediumLabel: "Тип трафика (utm_medium) *",
    mediumPlaceholder: "например, cpc, email, paid-social",
    mediumHelp: "Используемый маркетинговый канал (например, баннер, пост в соцсети, email)",
    
    campaignLabel: "Название кампании (utm_campaign) *",
    campaignPlaceholder: "например, summer_promo_2026, launch_event",
    campaignHelp: "Рекламная акция, слоган или общий идентификатор продукта",
    
    termLabel: "Ключевое слово (utm_term)",
    termPlaceholder: "например, marketing_strategy, keyword_phrase",
    termHelp: "Ключевые слова для поисковой рекламы",
    
    contentLabel: "Содержание кампании (utm_content)",
    contentPlaceholder: "например, side_banner, header_cta, logo_version",
    contentHelp: "Различие объявлений или ссылок, ведущих на один URL (A/B тестирование)",
    
    idLabel: "ID кампании (utm_id)",
    idPlaceholder: "например, promo_code_123, cid_9901",
    idHelp: "Уникальный идентификатор кампании Google Analytics",
    
    customParamsTitle: "Дополнительные параметры (необязательно)",
    addParamBtn: "Добавить параметр",
    paramKeyPlaceholder: "Ключ (например, user_segment)",
    paramValuePlaceholder: "Значение (например, premium)",
    
    // Output sections
    assembledTitle: "Собранная ссылка кампании",
    shortenedTitle: "Интеграция коротких ссылок",
    fullUrlLabel: "Полный URL-адрес",
    shortUrlLabel: "Короткая ссылка",
    copyBtn: "Копировать ссылку",
    copiedBtn: "Скопировано!",
    shortenBtn: "Создать короткую ссылку",
    shorteningBtn: "Сокращение...",
    saveHistoryBtn: "Сохранить в историю журнала",
    qrCodeBtn: "Создать QR-код",
    
    // Batch Tab
    batchTitle: "Групповой генератор кампаний",
    batchSubtitle: "Создавайте и сокращайте несколько ссылок UTM одновременно через загрузку CSV или вставку списка",
    batchPastePlaceholder: "Вставьте строки CSV сюда (через запятую, с заголовками, например: URL,Source,Medium,Campaign...)",
    batchDragDropText: "Перетащите файлы CSV сюда или нажмите для выбора файла",
    batchUploadBtn: "Анализировать данные CSV",
    batchGlobalTitle: "Применить глобальные параметры к пустым полям",
    batchApplyGlobals: "Применить глобальные",
    batchProcessBtn: "Обработать пакет ссылок",
    batchProcessing: "Обработка...",
    batchExportBtn: "Экспорт в CSV",
    batchClearBtn: "Сбросить пакетный движок",
    batchAddRow: "Добавить строку",
    
    // Templates Tab
    templatesTitle: "Шаблоны кампаний и быстрые пресеты",
    templatesSubtitle: "Определяйте и сохраняйте постоянные шаблоны отслеживания для экономии времени",
    builtInSection: "Стандартные встроенные пресеты отслеживания",
    customSection: "Ваши сохраненные шаблоны отслеживания",
    createNewTemplate: "Создать новый шаблон кампании",
    templateNameLabel: "Название шаблона",
    templateDescLabel: "Описание шаблона",
    saveTemplateBtn: "Сохранить шаблон",
    useTemplateBtn: "Использовать шаблон",
    deleteTemplateBtn: "Удалить",
    
    // History Tab
    historyTitle: "Архив отслеживания кампаний",
    historySubtitle: "История всех созданных, проверенных и сокращенных ссылок отслеживания в вашем аккаунте",
    clearAllHistory: "Очистить архив полностью",
    tableCampaign: "Название кампании",
    tableUrls: "Целевые и короткие ссылки",
    tableDate: "Дата создания",
    tableActions: "Действия",
    noHistoryMsg: "Записей нет. Начните создавать ссылки для наполнения вашей истории кампаний!",
    
    // Auth error modal
    authBlockedTitle: "Авторизация через Google заблокирована",
    authBlockedSubtitle: "Уведомление о безопасности и настройках",
    authBlockedClose: "Понятно, спасибо",
    authBlockedIframeMessage: "Вход через Google заблокирован внутри встроенного фрейма (iframe) предварительного просмотра из-за политики безопасности браузера (cross-origin).\n\nЧтобы успешно войти в систему и синхронизировать свои данные с облаком Firestore, нажмите кнопку «Открыть в новой вкладке» (Open in new tab) в правом верхнем углу окна предварительного просмотра AI Studio и выполните вход оттуда!",
    authBlockedUnauthorizedDomainMessage: "Ошибка: неавторизованный домен (Unauthorized Domain Error).\n\nВаш текущий домен не авторизован в проекте Firebase.\n\nЧтобы исправить это, добавьте ваш домен в список разрешенных в консоли Firebase:\n\n1. Откройте консоль Firebase (Firebase Console).\n2. Перейдите в раздел Authentication -> Settings -> Authorized domains.\n3. Нажмите кнопку «Add domain» и введите ваш текущий домен:\n   👉  {domain}  👈\n4. (Опционально) Также добавьте netolink.github.io, если вы развертываете приложение на GitHub Pages.\n5. Нажмите «Сохранить» (Save), подождите пару секунд и попробуйте войти снова!",
    
    // Common UI words
    close: "Закрыть",
    save: "Сохранить настройки",
    cancel: "Отмена",
    allRightsReserved: "Все права защищены.",
    legalTermsLink: "Условия и конфиденциальность",

    // Real-time validation
    realTimeValidation: "Проверка в реальном времени:",
    enterDestinationToValidate: "Введите URL-адрес для проверки доступности",
    testingDestination: "Проверка доступности сайта...",
    destinationActive: "Сайт доступен и активен",
    forceRevalidate: "Проверить повторно",
    invalidUrlFormat: "Неверный формат URL. Должен содержать http:// или https://",
    validationNetworkError: "Формат ссылки верен! Однако проверка доступности не удалась из-за сетевой ошибки или проблем с подключением (сайт может быть офлайн или блокировать запросы).",
    validationStaticHost: "Формат ссылки верен! (Проверено через браузерный запрос, так как приложение работает без бэкенда).",

    // API Integration settings modal
    apiSettingsTitle: "Настройки интеграции API",
    apiSettingsSubtitle: "Настройте сокращатели ссылок с помощью ваших собственных ключей API",
    securityPolicyTitle: "Политика безопасности:",
    securityPolicyDesc: "Введенные учетные данные сохраняются на 100% локально в вашем браузере (localStorage). Они не передаются сторонним базам данных и безопасно проксируются для предотвращения утечки.",
    securityPolicyDescLogged: "Поскольку вы вошли в систему, ваши учетные данные API надежно сохраняются в вашем личном облачном аккаунте (Firestore) для синхронизации между устройствами. Они безопасно проксируются для предотвращения утечки.",
    bitlyTitle: "Настройка Bitly",
    rebrandlyTitle: "Настройка Rebrandly",
    dubTitle: "Настройка DUB.co",
    tinyurlTitle: "Настройка TinyURL",
    getBitlyToken: "Получить токен Bitly",
    getRebrandlyKey: "Получить ключ Rebrandly",
    getDubToken: "Получить токен DUB API",
    getTinyurlToken: "Получить токен TinyURL",
    accessTokenLabel: "Токен доступа (Access Token)",
    customDomainLabel: "Собственный домен (опционально)",
    apiKeyLabel: "Ключ API (API Key)",
    apiTokenLabel: "Токен API",
    brandedDomainLabel: "Брендированный домен (опционально)",
    tinyurlFallbackNote: "* Примечание: Если токен TinyURL не указан, будет использован бесплатный анонимный API TinyURL!",
    settingsSavedBtn: "Настройки сохранены!",
    saveConfigBtn: "Сохранить конфигурацию",

    // Batch Creator & Templates/Presets Russian Translation
    batchImportTitle: "Импорт списка базовых URL",
    batchImportDesc: "Загрузите файл TXT/CSV или вставьте ссылки назначения, разделенные новой строкой",
    batchDragDropTitle: "Перетащите файлы сюда",
    batchDragDropDesc: "или нажмите для выбора в системе (.csv или .txt)",
    batchOrPasteManually: "или вставьте вручную",
    batchParseAppend: "Разобрать ссылки и добавить",
    batchGlobalConfigTitle: "Глобальная конфигурация UTM",
    batchGlobalConfigDesc: "Настройте общие теги отслеживания для мгновенного применения или заполнения пустых ячеек в списке",
    batchFillEmpty: "Заполнить пустые поля строк",
    batchOverwriteAll: "Перезаписать параметры всех строк",
    batchLedgerTitle: "Реестр пакетного создания ссылок",
    batchLedgerDesc: "Просматривайте, редактируйте и массово обрабатывайте ссылки на кампании в реальном времени",
    batchBulkShorten: "Массовое сокращение",
    batchCopyUtms: "Копировать ссылки",
    batchLogHistory: "Записать в историю",
    batchDownloadCsv: "Скачать CSV",
    batchTableHeaderUrl: "Базовый URL назначения веб-сайта",
    batchTableHeaderSource: "Источник (Source)",
    batchTableHeaderMedium: "Канал (Medium)",
    batchTableHeaderCampaign: "Кампания (Campaign)",
    batchTableHeaderOutput: "Скомпилированные ссылки",
    batchTableHeaderQr: "QR-код",
    batchTableHeaderActions: "Действия",
    batchWaitingUrl: "Ожидание URL...",
    batchShortenAction: "Сократить",
    batchConfirmClear: "Вы уверены, что хотите очистить весь список?",
    batchNotificationImportSuccess: "Успешно импортировано URL-адресов: {count}!",
    batchNotificationImportFail: "Не удалось разобрать валидные URL-адреса из файла.",
    batchNotificationAppendSuccess: "Добавлено {count} URL-адресов в таблицу.",
    batchNotificationNoUrls: "В буфере обмена не найдено валидных URL-адресов.",
    batchNotificationApplySuccess: "Глобальные параметры UTM применены ко всем строкам!",
    batchNotificationApplyMissing: "Пустые поля заполнены глобальными значениями.",
    batchNotificationClearSuccess: "Все записи пакетного генератора удалены.",
    batchNotificationNoCompiled: "Нет скомпилированных URL для копирования.",
    batchNotificationCopySuccess: "Скопировано {count} ссылок в буфер обмена!",
    batchNotificationShortenSuccess: "Ссылка успешно сокращена!",
    batchNotificationShortenFail: "Ошибка службы сокращения ссылок.",
    batchNotificationBatchStart: "Запуск массового сокращения для {count} ссылок...",
    batchNotificationBatchEmpty: "Все валидные строки уже сокращены или пусты.",
    batchNotificationConfigureService: "Пожалуйста, настройте и выберите службу сокращения ссылок в меню сверху справа.",
    batchNotificationBatchComplete: "Пакетное сокращение завершено!",
    batchNotificationNoArchive: "Нет готовых ссылок для архивирования.",
    batchNotificationArchiveSuccess: "Архивировано {count} ссылок в журнал истории!",

    tplTitle: "Шаблоны параметров",
    tplDesc: "Выберите стандартные каналы или собственные схемы отслеживания",
    tplSaveCurrentBtn: "Сохранить текущую конфигурацию",
    tplSaveAsCustomTitle: "Сохранить настройки как шаблон",
    tplNameLabel: "Имя шаблона",
    tplDescLabel: "Описание (необязательно)",
    tplCreateBtn: "Создать шаблон",
    tplSearchPlaceholder: "Поиск шаблонов...",
    tplNoMatches: "Нет шаблонов, соответствующих вашему запросу: \"{query}\"",
    tplOfficialBadge: "Официальный",
    tplCustomBadge: "Свой",
    tplDefaultDesc: "Пользовательский шаблон отслеживания.",
    tplDeleteTooltip: "Удалить шаблон",

    presetTitle: "Сохраненные пресеты (Быстрый доступ)",
    presetDesc: "Сохраняйте и загружайте полные конфигурации полей кампании",
    presetInputPlaceholder: "Сохранить текущую настройку как пресет...",
    presetSaveBtn: "Сохранить",
    presetSavedBtn: "Сохранено",
    presetSearchPlaceholder: "Поиск сохраненных пресетов...",
    presetActiveBadge: "Активен",
    presetLoadBadge: "Загрузить пресет",
    presetDeleteTooltip: "Удалить пресет",
    presetNoPresets: "Сохраненные пресеты не найдены"
  }
};
