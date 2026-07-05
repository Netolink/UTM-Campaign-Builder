export interface LegalSection {
  title: string;
  content: string[];
}

export interface LegalTranslation {
  title: string;
  tabs: {
    terms: string;
    privacy: string;
    cookies: string;
    accessibility: string;
  };
  closeBtn: string;
  sections: {
    terms: LegalSection[];
    privacy: LegalSection[];
    cookies: LegalSection[];
    accessibility: LegalSection[];
  };
}

export const legalTexts: Record<"en" | "he" | "ru", LegalTranslation> = {
  en: {
    title: "Legal Terms & Policies",
    closeBtn: "Close",
    tabs: {
      terms: "Terms of Use",
      privacy: "Privacy Policy",
      cookies: "Cookie Policy",
      accessibility: "Accessibility",
    },
    sections: {
      terms: [
        {
          title: "1. Acceptance of Terms",
          content: [
            "By using the UTM Campaign Builder tool, you agree to comply with and be bound by these Terms of Use.",
            "If you do not agree to these terms, please do not use the tool."
          ]
        },
        {
          title: "2. Permitted Use",
          content: [
            "This tool is designed to construct, organize, validate, and shorten UTM campaign URLs for legitimate marketing and analytics purposes.",
            "You may not use this tool to generate spam links, malicious redirects, phishing URLs, or any content that violates applicable laws or third-party rights.",
            "Abuse of shortening APIs or automated scraping of the service is strictly prohibited."
          ]
        },
        {
          title: "3. Disclaimers",
          content: [
            "The tool is provided on an 'as-is' and 'as-available' basis without warranties of any kind, either express or implied.",
            "While we strive to provide real-time validation and active link verification, we do not guarantee the uptime or reliability of external destination sites or third-party shortener APIs (Bitly, Rebrandly, Dub, TinyURL)."
          ]
        },
        {
          title: "4. Limitation of Liability",
          content: [
            "In no event shall Netolink, its affiliates, or developers be liable for any direct, indirect, incidental, or consequential damages resulting from the use or inability to use this tool, including lost traffic, tracking inaccuracies, or account suspension on third-party platforms."
          ]
        }
      ],
      privacy: [
        {
          title: "1. Data Collection & Processing",
          content: [
            "Guest Mode: If you use the tool without signing in, all generated URLs, templates, presets, and history records are stored 100% locally in your browser's LocalStorage. No data is sent to our servers.",
            "Authenticated Users: When signing in with Google, we securely store your basic profile information (Email, Name, User ID) and synchronize your custom campaign templates, presets, and history logs to our Firestore Cloud database to keep your workspace synced across devices."
          ]
        },
        {
          title: "2. Third-Party Integrations",
          content: [
            "Shortening Services: When you choose to shorten a URL using Bitly, Rebrandly, Dub, or TinyURL, the destination URL is transmitted to the selected third-party service.",
            "API Keys and Tokens: The API credentials you enter in the settings are stored securely in your LocalStorage or your encrypted cloud user profile and are processed purely to proxy authorization headers for these third-party platforms."
          ]
        },
        {
          title: "3. Security & Retaining Data",
          content: [
            "We employ strict client-side encryption and Firestore security rules to prevent unauthorized access to your synchronized data.",
            "You may clear your local browser cache at any time to delete local records, or click 'Sign Out' and purge your cloud history through the user dashboard."
          ]
        }
      ],
      cookies: [
        {
          title: "1. What are Cookies and Local Storage?",
          content: [
            "This application utilizes local storage mechanisms (LocalStorage) and standard authentication cookies to deliver an optimal, persistent user experience."
          ]
        },
        {
          title: "2. Essential Cookies & Storage",
          content: [
            "Firebase Authentication: Uses secure cookies and local tokens to keep you logged in securely while you navigate the application.",
            "Local Preferences: LocalStorage is used to persist your chosen language, UI preferences, custom UTM templates, preset definitions, and campaign history logs."
          ]
        },
        {
          title: "3. Managing Your Choices",
          content: [
            "Since local storage is entirely browser-dependent, you can clear it anytime through your browser's Developer Tools or Privacy settings.",
            "Blocking all storage might prevent features like Google Sign-In, saving API configurations, or retaining your UTM creation history."
          ]
        }
      ],
      accessibility: [
        {
          title: "1. Accessibility Commitment",
          content: [
            "We believe in digital inclusivity. This tool has been developed using modern web standards to ensure maximum accessibility for all users, including individuals with disabilities."
          ]
        },
        {
          title: "2. Standards & Adjustments",
          content: [
            "We target WCAG 2.1 AA guidelines in our color contrast, structural markup, and keyboard interactive focus states.",
            "The interface is fully responsive, supporting screen zoom, text resizing, and features RTL (Right-to-Left) optimization for Hebrew speaking audiences.",
            "Interactive buttons and selection tabs feature clear semantic roles, focus indicators, and screen-reader accessibility labels."
          ]
        },
        {
          title: "3. Contact & Feedback",
          content: [
            "If you encounter any accessibility barriers while using this builder, please reach out to us at netolink.ltd@gmail.com, and we will do our best to address the issue promptly."
          ]
        }
      ],
    },
  },
  he: {
    title: "תנאים משפטיים ומדיניות",
    closeBtn: "סגור",
    tabs: {
      terms: "תנאי שימוש",
      privacy: "מדיניות פרטיות",
      cookies: "מדיניות עוגיות",
      accessibility: "הצהרת נגישות",
    },
    sections: {
      terms: [
        {
          title: "1. קבלת התנאים",
          content: [
            "בעצם השימוש בכלי יוצר קישורי ה-UTM, הינך מסכים לתנאי שימוש אלו במלואם ומחויב לפעול לפיהם.",
            "אם אינך מסכים לתנאים אלו, אנא הימנע משימוש בכלי זה."
          ]
        },
        {
          title: "2. שימוש מורשה ומותר",
          content: [
            "כלי זה נועד לבנייה, ארגון, אימות וקיצור של קישורי UTM למטרות שיווקיות ואנליטיות לגיטימיות בלבד.",
            "חל איסור מוחלט להשתמש בכלי זה ליצירת קישורי ספאם, הפניות זדוניות, פישינג (דיוג), או כל תוכן אחר המפר את החוק או פוגע בזכויות צד שלישי.",
            "שימוש לרעה ב-APIs של קיצור קישורים או הפעלת סקריפטים אוטומטיים על השירות הינם אסורים בהחלט."
          ]
        },
        {
          title: "3. הגבלת אחריות והצהרות",
          content: [
            "השירות מוענק כפי שהוא ('As-Is') וללא כל התחייבות או מצג מפורש או משתמע.",
            "אנו שואפים לספק אימות בזמן אמת וזמינות מלאה, אך איננו מתחייבים לפעילות רציפה ותקינה של אתרי היעד או שירותי קיצור הקישורים החיצוניים (Bitly, Rebrandly, Dub, TinyURL)."
          ]
        },
        {
          title: "4. חבות ופיצויים",
          content: [
            "בשום מקרה Netolink, שותפיה או מפתחיה לא יהיו אחראים לכל נזק ישיר, עקיף, מקרי או תוצאתי הנובע מהשימוש או מאי-היכולת להשתמש בכלי זה, כולל אובדן תנועת גולשים, חוסר דיוק במעקב או השעיית חשבונות בפלטפורמות חיצוניות."
          ]
        }
      ],
      privacy: [
        {
          title: "1. איסוף ועיבוד נתונים",
          content: [
            "מצב אורח: אם הינך משתמש בכלי ללא התחברות, כל הקישורים הנוצרים, התבניות, הערכות וההיסטוריה נשמרים ב-100% באופן מקומי בדפדפן שלך (LocalStorage). שום מידע אינו נשלח לשרתים שלנו.",
            "משתמשים רשומים: בעת התחברות עם חשבון גוגל, אנו שומרים באופן מאובטח פרטי פרופיל בסיסיים (אימייל, שם ומזהה משתמש) ומסנכרנים את התבניות, הערכות ויומני ההיסטוריה שלך למסד הנתונים בענן Firestore, כדי לאפשר לך גישה אחידה מכל מכשיר."
          ]
        },
        {
          title: "2. שירותי צד שלישי",
          content: [
            "שירותי קיצור קישורים: בעת בחירה בקיצור קישור באמצעות Bitly, Rebrandly, Dub או TinyURL, כתובת היעד נשלחת לשירות החיצוני שנבחר לצורך יצירת הקישור המקוצר.",
            "מפתחות API ואישורים: אישורי ה-API שאתה מזין בהגדרות נשמרים מקומית ב-LocalStorage או בפרופיל הענן המאובטח שלך, ומועברים אך ורק ככותרות הרשאה מאובטחות (Proxied Headers) לפלטפורמות השותפות."
          ]
        },
        {
          title: "3. אבטחת מידע ושמירה",
          content: [
            "אנו משתמשים בכללי אבטחה קפדניים של Firestore ואבטחה מצד הלקוח כדי למנוע גישה לא מורשית לנתונים המסונכרנים שלך.",
            "באפשרותך לנקות את היסטוריית הדפדפן והמטמון בכל עת כדי למחוק רשומות מקומיות, או להתנתק ולנקות את היסטוריית הענן דרך לוח הבקרה."
          ]
        }
      ],
      cookies: [
        {
          title: "1. מהן עוגיות ואחסון מקומי?",
          content: [
            "אפליקציה זו משתמשת במנגנוני אחסון מקומיים של הדפדפן (LocalStorage) ובעוגיות אבטחה סטנדרטיות כדי להציע חוויית שימוש רציפה, מותאמת ושמורה."
          ]
        },
        {
          title: "2. עוגיות חיוניות ואחסון נתונים",
          content: [
            "אימות Firebase: משתמש בעוגיות אבטחה ובמזהים מקומיים כדי לשמור על חיבורך למערכת בצורה מאובטחת בזמן הניווט באפליקציה.",
            "העדפות משתמש: LocalStorage משמש לשמירת השפה הנבחרת, הגדרות ממשק, תבניות ה-UTM השמורות שלך, יומני היסטוריית קישורים ואישורי ה-API."
          ]
        },
        {
          title: "3. ניהול ובחירה",
          content: [
            "מכיוון שאחסון מקומי מנוהל לחלוטין על ידי הדפדפן, באפשרותך לנקותו בכל עת דרך הגדרות הפרטיות בדפדפן שלך.",
            "שים לב כי חסימת אפשרות זו עלולה למנוע חלק מהפונקציונליות, כמו התחברות למערכת, שמירת מפתחות ה-API או שמירת היסטוריית הקמפיינים."
          ]
        }
      ],
      accessibility: [
        {
          title: "1. מחויבות לנגישות דיגיטלית",
          content: [
            "אנו מאמינים בשוויון הזדמנויות ובנגישות מלאה ברשת. כלי זה פותח תוך הקפדה על תקני אינטרנט מודרניים כדי לאפשר שימוש נוח ומותאם לכלל המשתמשים, כולל אנשים עם מוגבלויות."
          ]
        },
        {
          title: "2. התאמות שבוצעו בפועל",
          content: [
            "אנו שואפים לעמוד בהנחיות WCAG 2.1 ברמת AA מבחינת ניגודיות צבעים, תיוג סמנטי, וניווט מקלדת מלא.",
            "ממשק המשתמש הינו רספונסיבי לחלוטין, תומך בהגדלת תצוגה וגופנים, וכולל התאמה מלאה לכתיבה וקריאה מימין לשמאל (RTL) עבור דוברי עברית.",
            "לכפתורים ולשדות האינטראקטיביים ישנם תפקידים ברורים (Semantic Roles), מחווני פוקוס ברורים ותוויות נגישות המיועדות לקוראי מסך."
          ]
        },
        {
          title: "3. יצירת קשר ומשוב",
          content: [
            "אם נתקלת בקושי כלשהו בנגישות בעת השימוש במחולל זה, נשמח אם תפנה אלינו לכתובת netolink.ltd@gmail.com כדי שנוכל לבחון ולשפר את הנושא בהקדם האפשרי."
          ]
        }
      ],
    },
  },
  ru: {
    title: "Юридические соглашения и правила",
    closeBtn: "Закрыть",
    tabs: {
      terms: "Условия использования",
      privacy: "Конфиденциальность",
      cookies: "Файлы cookie",
      accessibility: "Доступность",
    },
    sections: {
      terms: [
        {
          title: "1. Принятие условий",
          content: [
            "Используя инструмент UTM Campaign Builder, вы соглашаетесь соблюдать настоящие Условия использования.",
            "Если вы не согласны с данными условиями, пожалуйста, прекратите использование этого инструмента."
          ]
        },
        {
          title: "2. Разрешенное использование",
          content: [
            "Этот инструмент предназначен для создания, организации, проверки и сокращения ссылок UTM в законных маркетинговых и аналитических целях.",
            "Запрещается использовать этот инструмент для создания спам-ссылок, вредоносных перенаправлений, фишинга или любого контента, нарушающего закон или права третьих лиц.",
            "Злоупотребление API сокращения или автоматический сбор данных с помощью скриптов строго запрещены."
          ]
        },
        {
          title: "3. Отказ от ответственности",
          content: [
            "Инструмент предоставляется на условиях 'как есть' ('as-is') без каких-либо явных или подразумеваемых гарантий.",
            "Мы стремимся обеспечить проверку в реальном времени, однако не гарантируем бесперебойную работу внешних целевых сайтов или сторонних API (Bitly, Rebrandly, Dub, TinyURL)."
          ]
        },
        {
          title: "4. Ограничение ответственности",
          content: [
            "Ни при каких обстоятельствах Netolink, ее партнеры или разработчики не несут ответственности за любые прямые, косвенные или сопутствующие убытки, связанные с использованием или невозможностью использования этого инструмента."
          ]
        }
      ],
      privacy: [
        {
          title: "1. Сбор и обработка данных",
          content: [
            "Гостевой режим: если вы используете инструмент без входа в систему, все данные сохраняются исключительно локально в вашем браузере (LocalStorage). Данные не передаются на наши серверы.",
            "Зарегистрированные пользователи: при входе через Google мы безопасно сохраняем базовую информацию вашего профиля (Email, имя, ID пользователя) и синхронизируем ваши шаблоны и историю с базой данных Firestore Cloud."
          ]
        },
        {
          title: "2. Сторонние интеграции",
          content: [
            "Сервисы сокращения: при сокращении ссылки через Bitly, Rebrandly, Dub или TinyURL целевой URL передается выбранному сервису.",
            "Ключи API: учетные данные API сохраняются локально в LocalStorage или в вашем защищенном облачном профиле и используются исключительно для авторизации запросов."
          ]
        },
        {
          title: "3. Безопасность данных",
          content: [
            "Мы применяем строгие правила безопасности Firestore для предотвращения несанкционированного доступа к вашим синхронизированным данным.",
            "Вы можете в любой момент очистить кеш браузера, чтобы удалить локальные записи, или выйти и очистить историю в облаке."
          ]
        }
      ],
      cookies: [
        {
          title: "1. Что такое файлы cookie и локальное хранилище?",
          content: [
            "Это приложение использует механизмы локального хранилища (LocalStorage) и стандартные файлы cookie для авторизации, чтобы обеспечить бесперебойную работу."
          ]
        },
        {
          title: "2. Необходимые файлы cookie и хранилище",
          content: [
            "Авторизация Firebase: использует безопасные файлы cookie для сохранения сессии при навигации.",
            "Пользовательские настройки: LocalStorage используется для сохранения выбранного языка, настроек интерфейса, ваших шаблонов UTM, пресетов и истории кампаний."
          ]
        },
        {
          title: "3. Управление настройками",
          content: [
            "Поскольку локальное хранилище зависит от браузера, вы можете очистить его в любой момент в настройках конфиденциальности вашего браузера."
          ]
        }
      ],
      accessibility: [
        {
          title: "1. Обязательства по доступности",
          content: [
            "Мы верим в цифровое равенство возможностей. Этот инструмент разработан в соответствии с современными стандартами для обеспечения максимальной доступности для всех пользователей."
          ]
        },
        {
          title: "2. Реализованные стандарты",
          content: [
            "Мы стремимся соответствовать рекомендациям WCAG 2.1 уровня AA по контрастности цветов, семантической разметке и навигации с клавиатуры.",
            "Интерфейс полностью адаптивен, поддерживает масштабирование текста и включает поддержку чтения справа налево (RTL) для иврита."
          ]
        },
        {
          title: "3. Обратная связь",
          content: [
            "Если у вас возникли сложности с доступностью при использовании этого конструктора, пожалуйста, напишите нам по адресу netolink.ltd@gmail.com."
          ]
        }
      ],
    },
  },
};
