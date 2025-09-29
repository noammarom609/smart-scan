import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Home, ChevronLeft, FileText } from 'lucide-react';

export default function PrivacyPage() {
  const [tableOfContents, setTableOfContents] = useState([]);

  // Variables to be replaced - UPDATE THESE VALUES
  const APP_NAME = "סורק הזמנות חכם"; // {{APP_NAME}}
  const DOMAIN = "scannerglut.base44.app"; // {{DOMAIN}}
  const SUPPORT_EMAIL = `support@${DOMAIN}`; // {{SUPPORT_EMAIL}}
  const EFFECTIVE_DATE = new Date().toLocaleDateString('he-IL'); // {{EFFECTIVE_DATE}} - Update as needed

  useEffect(() => {
    // Generate table of contents from H2 headings
    const headings = Array.from(document.querySelectorAll('h2')).map((heading, index) => {
      const id = `section-${index + 1}`;
      heading.id = id;
      return {
        id,
        text: heading.textContent,
      };
    });
    setTableOfContents(headings);

    // Add JSON-LD structured data
    const jsonLD = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": `מדיניות פרטיות — ${APP_NAME}`,
      "inLanguage": "he-IL",
      "isPartOf": {
        "@type": "Organization",
        "name": APP_NAME
      },
      "datePublished": new Date().toISOString(),
      "dateModified": new Date().toISOString(),
      "description": `מדיניות פרטיות של ${APP_NAME} — כיצד אנו אוספים, משתמשים ושומרים על המידע.`,
      "url": `https://${DOMAIN}/privacy`
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(jsonLD);
    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, [APP_NAME, DOMAIN]);

  // Set document title and meta tags
  useEffect(() => {
    document.title = `מדיניות פרטיות — ${APP_NAME}`;
    
    // Meta description
    const metaDescription = document.querySelector('meta[name="description"]') || document.createElement('meta');
    metaDescription.name = 'description';
    metaDescription.content = `מדיניות פרטיות של ${APP_NAME} — כיצד אנו אוספים, משתמשים ושומרים על המידע.`;
    if (!document.head.contains(metaDescription)) {
      document.head.appendChild(metaDescription);
    }

    // Canonical
    const canonical = document.querySelector('link[rel="canonical"]') || document.createElement('link');
    canonical.rel = 'canonical';
    canonical.href = `https://${DOMAIN}/privacy`;
    if (!document.head.contains(canonical)) {
      document.head.appendChild(canonical);
    }

    // Open Graph
    const ogTags = [
      { property: 'og:title', content: `מדיניות פרטיות — ${APP_NAME}` },
      { property: 'og:description', content: `מדיניות פרטיות של ${APP_NAME} — כיצד אנו אוספים, משתמשים ושומרים על המידע.` },
      { property: 'og:type', content: 'website' },
      { property: 'og:url', content: `https://${DOMAIN}/privacy` }
    ];

    ogTags.forEach(({ property, content }) => {
      const tag = document.querySelector(`meta[property="${property}"]`) || document.createElement('meta');
      tag.property = property;
      tag.content = content;
      if (!document.head.contains(tag)) {
        document.head.appendChild(tag);
      }
    });

    // Twitter Cards
    const twitterTags = [
      { name: 'twitter:card', content: 'summary' },
      { name: 'twitter:title', content: `מדיניות פרטיות — ${APP_NAME}` },
      { name: 'twitter:description', content: `מדיניות פרטיות של ${APP_NAME} — כיצד אנו אוספים, משתמשים ושומרים על המידע.` }
    ];

    twitterTags.forEach(({ name, content }) => {
      const tag = document.querySelector(`meta[name="${name}"]`) || document.createElement('meta');
      tag.name = name;
      tag.content = content;
      if (!document.head.contains(tag)) {
        document.head.appendChild(tag);
      }
    });

    // Robots
    const robots = document.querySelector('meta[name="robots"]') || document.createElement('meta');
    robots.name = 'robots';
    robots.content = 'index, follow';
    if (!document.head.contains(robots)) {
      document.head.appendChild(robots);
    }

    // Language and direction
    document.documentElement.lang = 'he-IL';
    document.documentElement.dir = 'rtl';

  }, [APP_NAME, DOMAIN]);

  return (
    <>
      <style>{`
        /* Print styles */
        @media print {
          .no-print, nav, .breadcrumbs, button {
            display: none !important;
          }
          
          a[href]:after {
            content: " (" attr(href) ")";
            font-size: 0.8em;
            color: #666;
          }
          
          body {
            background: white !important;
            color: black !important;
            font-size: 12pt;
            line-height: 1.6;
          }
          
          .page-container {
            max-width: none !important;
            margin: 0 !important;
            padding: 1cm !important;
          }
          
          h1 {
            page-break-before: avoid;
            font-size: 18pt;
          }
          
          h2 {
            page-break-before: avoid;
            font-size: 14pt;
            margin-top: 1cm;
          }
          
          .table-of-contents {
            page-break-after: always;
          }
        }

        /* Typography and accessibility */
        .content-text {
          line-height: 1.7;
          max-width: 75ch;
          font-size: 16px;
        }
        
        .content-text p {
          margin-bottom: 1.2em;
        }
        
        .content-text ul, .content-text ol {
          margin: 1em 0 1.5em 2em;
        }
        
        .content-text li {
          margin-bottom: 0.5em;
        }

        /* Focus styles for accessibility */
        a:focus, button:focus {
          outline: 2px solid #0066cc;
          outline-offset: 2px;
        }

        /* Skip to content link */
        .skip-link {
          position: absolute;
          top: -40px;
          left: 6px;
          background: #0066cc;
          color: white;
          padding: 8px;
          text-decoration: none;
          border-radius: 4px;
          z-index: 1000;
        }
        
        .skip-link:focus {
          top: 6px;
        }

        /* Table of contents */
        .table-of-contents {
          background: #f8f9fa;
          border: 1px solid #e9ecef;
          border-radius: 8px;
          padding: 1.5rem;
          margin: 2rem 0;
        }

        .table-of-contents ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .table-of-contents li {
          margin: 0.5rem 0;
        }

        .table-of-contents a {
          text-decoration: none;
          color: #0066cc;
          padding: 0.25rem 0;
          display: block;
        }

        .table-of-contents a:hover {
          text-decoration: underline;
        }

        /* Breadcrumbs */
        .breadcrumbs {
          margin-bottom: 2rem;
          padding: 1rem 0;
          border-bottom: 1px solid #e9ecef;
        }

        .breadcrumbs nav {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .breadcrumbs a {
          text-decoration: none;
          color: #0066cc;
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .breadcrumbs a:hover {
          text-decoration: underline;
        }

        .breadcrumbs span {
          color: #6c757d;
        }

        /* Section styling */
        section {
          margin: 3rem 0;
        }

        h1 {
          color: #212529;
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 1rem;
          line-height: 1.2;
        }

        h2 {
          color: #495057;
          font-size: 1.75rem;
          font-weight: 600;
          margin-top: 3rem;
          margin-bottom: 1rem;
          padding-top: 1rem;
          border-top: 2px solid #e9ecef;
        }

        h3 {
          color: #495057;
          font-size: 1.25rem;
          font-weight: 600;
          margin-top: 2rem;
          margin-bottom: 0.75rem;
        }

        /* Responsive design */
        .page-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 2rem;
        }

        @media (max-width: 768px) {
          .page-container {
            padding: 1rem;
          }
          
          h1 {
            font-size: 2rem;
          }
          
          h2 {
            font-size: 1.5rem;
          }
          
          .content-text {
            font-size: 14px;
          }
        }

        /* Last updated */
        .last-updated {
          margin-top: 4rem;
          padding-top: 2rem;
          border-top: 1px solid #e9ecef;
          color: #6c757d;
          font-size: 0.875rem;
        }
      `}</style>

      <div className="page-container">
        <a href="#main-content" className="skip-link">דלג לתוכן</a>
        
        {/* Breadcrumbs */}
        <div className="breadcrumbs no-print">
          <nav aria-label="breadcrumb">
            <Link to={createPageUrl("Home")} className="flex items-center">
              <Home className="w-4 h-4" />
              <span className="mr-1">בית</span>
            </Link>
            <ChevronLeft className="w-4 h-4 text-gray-400" />
            <span>משפטי</span>
            <ChevronLeft className="w-4 h-4 text-gray-400" />
            <span>מדיניות פרטיות</span>
          </nav>
        </div>

        <main id="main-content">
          <h1>
            <FileText className="w-8 h-8 inline ml-3 text-blue-600" />
            מדיניות פרטיות (Privacy Policy)
          </h1>
          
          <div className="content-text">
            <p><strong>מדיניות פרטיות עבור {APP_NAME}</strong><br />
            תאריך כניסה לתוקף: {EFFECTIVE_DATE}<br />
            יצירת קשר: {SUPPORT_EMAIL}</p>

            <p>{APP_NAME} ("אנחנו", "שלנו") מכבד/ת את פרטיות המשתמשים ומתחייב/ת להגן עליה. מסמך זה מסביר איזה מידע אנו אוספים, כיצד אנו משתמשים בו, למי אנו משתפים אותו, וכיצד ניתן לפנות אלינו בנושאי פרטיות.</p>

            {/* Table of Contents */}
            <div className="table-of-contents">
              <h3>תוכן העניינים</h3>
              <ul>
                {tableOfContents.map((item) => (
                  <li key={item.id}>
                    <a href={`#${item.id}`}>{item.text}</a>
                  </li>
                ))}
              </ul>
            </div>

            <section>
              <h2>1) המידע שאנו אוספים</h2>
              <ul>
                <li><strong>מידע שאתה מספק</strong>: שם, כתובת אימייל, פרטי חשבון.</li>
                <li><strong>מידע מחשבון Google (אם חיברת)</strong>: נתוני Gmail בהתאם להרשאות שאישרת (למשל <code>gmail.readonly</code>), מזהי הודעות, נושא, שולח/נמען, תאריכים, מטא־דאטה ותוכן הודעה אם אישרת.</li>
                <li><strong>מידע טכני</strong>: כתובת IP, סוג דפדפן/מכשיר, עוגיות (cookies) ו־logs לצורך אבטחה ושיפור השירות.</li>
              </ul>
            </section>

            <section>
              <h2>2) כיצד אנו משתמשים במידע</h2>
              <ul>
                <li>אספקת השירות ושיפורו, כולל שליפה, סינון והצגה של נתוני אימייל לבקשתך.</li>
                <li>אימות וזהוי באמצעות OAuth2 (כולל שימוש ב־Access/Refresh Tokens).</li>
                <li>תקינות, ניטור, מניעת הונאות ואבטחת מידע.</li>
              </ul>
            </section>

            <section>
              <h2>3) מסגרת שימוש מוגבל בנתוני Google (Limited Use)</h2>
              <p>כאשר אנו ניגשים לנתוני Google שלך דרך ה־APIs:</p>
              <ul>
                <li>איננו מוכרים נתוני משתמשים.</li>
                <li>איננו מעבירים נתוני משתמשים לצדדים שלישיים למעט לצורך הפעלת השירות (למשל תשתיות ענן/אחסון) ובאופן התואם את Google API Services User Data Policy (כולל <strong>Limited Use</strong>). ראה מידע נוסף: <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener">https://developers.google.com/terms/api-services-user-data-policy</a></li>
                <li>גישה אנושית לנתונים תתבצע רק עם הסכמה מפורשת ממך, לצורך אבטחה/ציות לחוק, או כאשר הדבר נדרש לצורך תחזוקה/אבחון תקלות.</li>
                <li>נשתמש בנתונים רק כדי לספק או לשפר תכונות ממוקדות־משתמש, ולא לכל מטרה אחרת.</li>
              </ul>
            </section>

            <section>
              <h2>4) שיתוף מידע</h2>
              <ul>
                <li>ספקי שירות טכניים (אחסון, ניטור, אנליטיקה) בכפוף להסכמי עיבוד נתונים ואמצעי אבטחה הולמים.</li>
                <li>רשויות אכיפה/רגולטורים אם נידרש לכך על פי דין.</li>
              </ul>
            </section>

            <section>
              <h2>5) אחסון ואבטחה</h2>
              <ul>
                <li>מפתחות גישה (Tokens) ונתונים רגישים נשמרים מוצפנים, עם בקרות גישה מינימליות (least privilege) ובסטנדרטים מקובלים בתעשייה.</li>
                <li>אנו מפעילים אמצעי ניטור, גיבוי ושחזור, ובודקים תהליכי אבטחה באופן שוטף.</li>
              </ul>
            </section>

            <section>
              <h2>6) שמירת נתונים ומחיקה</h2>
              <ul>
                <li>נשמור נתונים כל עוד נדרש להפעלת השירות ועמידה בחובות חוקיות.</li>
                <li>תוכל לבקש מחיקה/ייצוא נתונים דרך {SUPPORT_EMAIL}.</li>
                <li>תוכל לבטל גישה בכל עת דרך הגדרות החשבון שלך ב־Google (Third‑party access).</li>
              </ul>
            </section>

            <section>
              <h2>7) זכויותיך</h2>
              <p>בכפוף לדין החל, ייתכן ותהיה זכאי/ת לגשת לנתונים, לבקש תיקון/מחיקה, להתנגד לעיבוד או לבקש ניידות נתונים. נענה לבקשות בתוך זמן סביר.</p>
            </section>

            <section>
              <h2>8) קטינים</h2>
              <p>השירות אינו מיועד למי שטרם מלאו לו 18 (או גיל הבגירות החל באזור השיפוט שלך) ללא הסכמת הורה/אפוטרופוס.</p>
            </section>

            <section>
              <h2>9) שינויים במדיניות</h2>
              <p>נעדכן את המדיניות מעת לעת. נפרסם גרסה מעודכנת עם תאריך כניסה לתוקף חדש. שימושך בשירות לאחר העדכון מהווה הסכמה למדיניות המעודכנת.</p>
            </section>

            <section>
              <h2>10) יצירת קשר</h2>
              <p>לשאלות ובקשות: <strong>{SUPPORT_EMAIL}</strong>.</p>
              
              <blockquote style={{ background: '#f8f9fa', padding: '1rem', borderRight: '4px solid #dee2e6', margin: '2rem 0' }}>
                <strong>הערה</strong>: מסמך זה הוא תבנית בסיסית ואינו מהווה ייעוץ משפטי. מומלץ לבדוק עם עו"ד.
              </blockquote>
            </section>

            <div className="last-updated">
              עודכן לאחרונה ב‑{EFFECTIVE_DATE}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}