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
    urlTitle: "1. Website Details",
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

    // Real-time validation
    realTimeValidation: "Real-time Validation:",
    enterDestinationToValidate: "Enter a destination URL to validate",
    testingDestination: "Testing destination availability...",
    destinationActive: "Destination is Active",
    forceRevalidate: "Force Re-validate",
    invalidUrlFormat: "Invalid URL format. Include http:// or https://",
    validationNetworkError: "URL is formatted correctly! However, live check failed due to a network or connection issue (the site might be offline or blocking external requests).",
    validationStaticHost: "URL format is valid! (Live ping verification is skipped as the app is running as a static site without a backend).",

    // API Integration settings modal
    apiSettingsTitle: "API Integration Settings",
    apiSettingsSubtitle: "Configure link shorteners with your own API credentials",
    securityPolicyTitle: "Security Policy:",
    securityPolicyDesc: "Credentials entered here are saved 100% locally in your own browser's localStorage. They never touch third-party databases and are proxied securely to prevent client-side credential leaking.",
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
    saveConfigBtn: "Save Configuration"
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
    urlTitle: "1. פרטי אתר האינטרנט",
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

    // Real-time validation
    realTimeValidation: "אימות בזמן אמת:",
    enterDestinationToValidate: "הזן כתובת אתר יעד כדי לאמת אותה",
    testingDestination: "בודק את זמינות היעד...",
    destinationActive: "כתובת היעד פעילה ומחוברת",
    forceRevalidate: "אימות מחדש",
    invalidUrlFormat: "פורמט כתובת אתר לא תקין. יש לכלול http:// או https://",
    validationNetworkError: "פורמט הכתובת תקין לחלוטין! עם זאת, הבדיקה נכשלה עקב שגיאת חיבור או רשת (ייתכן שהאתר לא פעיל, חוסם פניות חיצוניות או שאין חיבור תקין לשרת הבדיקה).",
    validationStaticHost: "פורמט הכתובת תקין! (בדיקת הזמינות דורשת שרת אחורי ואינה פעילה כאשר האפליקציה רצה כאתר סטטי ללא שרת).",

    // API Integration settings modal
    apiSettingsTitle: "הגדרות אינטגרציה של API",
    apiSettingsSubtitle: "הגדר מקצרי קישורים באמצעות אישורי API משלך",
    securityPolicyTitle: "מדיניות אבטחה:",
    securityPolicyDesc: "האישורים המוזנים כאן נשמרים ב-100% באופן מקומי בדפדפן שלך ב-localStorage. הם אינם מגיעים למסדי נתונים של צד שלישי ומעוברים דרך פרוקסי מאובטח למניעת דליפת אישורים לקוח.",
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
    saveConfigBtn: "שמור הגדרות"
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
    urlTitle: "1. Информация о веб-сайте",
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

    // Real-time validation
    realTimeValidation: "Проверка в реальном времени:",
    enterDestinationToValidate: "Введите URL-адрес для проверки доступности",
    testingDestination: "Проверка доступности сайта...",
    destinationActive: "Сайт доступен и активен",
    forceRevalidate: "Проверить повторно",
    invalidUrlFormat: "Неверный формат URL. Должен содержать http:// или https://",
    validationNetworkError: "Формат ссылки верен! Однако проверка доступности не удалась из-за сетевой ошибки или проблем с подключением (сайт может быть офлайн или блокировать запросы).",
    validationStaticHost: "Формат ссылки верен! (Живая проверка пропущена, так как приложение работает как статический сайт без бэкенда).",

    // API Integration settings modal
    apiSettingsTitle: "Настройки интеграции API",
    apiSettingsSubtitle: "Настройте сокращатели ссылок с помощью ваших собственных ключей API",
    securityPolicyTitle: "Политика безопасности:",
    securityPolicyDesc: "Введенные учетные данные сохраняются на 100% локально в вашем браузере (localStorage). Они не передаются сторонним базам данных и безопасно проксируются для предотвращения утечки.",
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
    saveConfigBtn: "Сохранить конфигурацию"
  }
};
