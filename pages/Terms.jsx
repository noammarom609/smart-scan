import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Home, ChevronLeft, FileText } from 'lucide-react';

export default function TermsPage() {
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
      "name": `תנאי שימוש — ${APP_NAME}`,
      "inLanguage": "he-IL",
      "isPartOf": {
        "@type": "Organization",
        "name": APP_NAME
      },
      "datePublished": new Date().toISOString(),
      "dateModified": new Date().toISOString(),
      "description": `תנאי השימוש בשירות ${APP_NAME}.`,
      "url": `https://${DOMAIN}/terms`
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
    document.title = `תנאי שימוש — ${APP_NAME}`;
    
    // Meta description
    const metaDescription = document.querySelector('meta[name="description"]') || document.createElement('meta');
    metaDescription.name = 'description';
    metaDescription.content = `תנאי השימוש בשירות ${APP_NAME}.`;
    if (!document.head.contains(metaDescription)) {
      document.head.appendChild(metaDescription);
    }

    // Canonical
    const canonical = document.querySelector('link[rel="canonical"]') || document.createElement('link');
    canonical.rel = 'canonical';
    canonical.href = `https://${DOMAIN}/terms`;
    if (!document.head.contains(canonical)) {
      document.head.appendChild(canonical);
    }

    // Open Graph
    const ogTags = [
      { property: 'og:title', content: `תנאי שימוש — ${APP_NAME}` },
      { property: 'og:description', content: `תנאי השימוש בשירות ${APP_NAME}.` },
      { property: 'og:type', content: 'website' },
      { property: 'og:url', content: `https://${DOMAIN}/terms` }
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
      { name: 'twitter:title', content: `תנאי שימוש — ${APP_NAME}` },
      { name: 'twitter:description', content: `תנאי השימוש בשירות ${APP_NAME}.` }
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
            <span>תנאי שימוש</span>
          </nav>
        </div>

        <main id="main-content">
          <h1>
            <FileText className="w-8 h-8 inline ml-3 text-blue-600" />
            תנאי שימוש (Terms of Service)
          </h1>
          
          <div className="content-text">
            <p><strong>תנאי שימוש עבור {APP_NAME}</strong><br />
            תאריך כניסה לתוקף: {EFFECTIVE_DATE}<br />
            יצירת קשר: {SUPPORT_EMAIL}</p>

            <p>ברוך/ה הבא/ה ל־{APP_NAME}. בשימושך בשירות, הינך מאשר/ת שקראת, הבנת והסכמת לתנאים הבאים.</p>

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
              <h2>1) השימוש בשירות</h2>
              <ul>
                <li>עליך להיות בן/בת 18 ומעלה (או באישור הורה/אפוטרופוס).</li>
                <li>אין לעשות שימוש לרעה בשירות, לנסות גישה לא מורשית או להפר חוקים החלים.</li>
              </ul>
            </section>

            <section>
              <h2>2) חשבונות ואימות (OAuth)</h2>
              <ul>
                <li>באפשרותך להתחבר באמצעות חשבון Google.</li>
                <li>באחריותך לשמור על אבטחת החשבון והמכשיר שלך.</li>
                <li>הענקת ההרשאות דרך מסך ההסכמה של Google מאפשרת לנו גישה לנתונים בהתאם ל‑scopes שאישרת בלבד.</li>
              </ul>
            </section>

            <section>
              <h2>3) גישה לנתונים ושימוש בהם</h2>
              <ul>
                <li>אנו ניגשים רק לנתונים הדרושים להפעלת התכונות שבחרת (למשל קריאת אימיילים לצורך סינון/חיפוש).</li>
                <li>שימוש בנתוני Google כפוף ל‑Google API Services User Data Policy (כולל Limited Use).</li>
                <li>תוכל לבטל בכל עת את הגישה דרך הגדרות חשבון Google.</li>
              </ul>
            </section>

            <section>
              <h2>4) תשלום (אם רלוונטי)</h2>
              <p>אם השירות מוצע בתשלום, תנאי התשלום, התקופות וחידושים יוצגו במסך התמחור/הרישום. אי‑תשלום עשוי להוביל להשעיה/סיום גישה.</p>
            </section>

            <section>
              <h2>5) זמינות ושינויים בשירות</h2>
              <ul>
                <li>אנו עשויים לשנות, להשעות או להפסיק חלקים מהשירות בכל עת, עם או בלי הודעה מוקדמת.</li>
                <li>מאמצים ייעשו לשמור על זמינות ואמינות, אך ייתכנו הפסקות תחזוקה ותקלות בלתי צפויות.</li>
              </ul>
            </section>

            <section>
              <h2>6) קניין רוחני</h2>
              <ul>
                <li>כל הזכויות במותג, בקוד, בתכנים ובממשק שמורות ל‑{APP_NAME} או לבעלי הזכויות.</li>
                <li>אין להעתיק, לשכפל או ליצור יצירות נגזרות ללא הרשאה בכתב.</li>
              </ul>
            </section>

            <section>
              <h2>7) הצהרות והתנערות מאחריות</h2>
              <ul>
                <li>השירות מסופק "כפי שהוא" (AS‑IS) ללא אחריות מכל סוג, במידה המותרת על פי דין.</li>
                <li>איננו מתחייבים לכך שהשירות יהיה נקי משגיאות, בטוח לחלוטין או זמין בכל עת.</li>
              </ul>
            </section>

            <section>
              <h2>8) הגבלת אחריות</h2>
              <ul>
                <li>במידה המרבית המותרת בדין, לא נהיה אחראים לכל נזק עקיף/תוצאתי/מיוחד, או לאובדן רווחים/נתונים, הנובע משימושך בשירות.</li>
                <li>אחריותנו הכוללת, אם וככל שקיימת, תוגבל לסכום ששילמת בפועל עבור השירות ב‑[3/12] החודשים שקדמו לאירוע.</li>
              </ul>
            </section>

            <section>
              <h2>9) סיום שימוש</h2>
              <ul>
                <li>באפשרותך להפסיק שימוש בכל עת.</li>
                <li>אנו רשאים להשעות או לסיים את הגישה שלך אם הפרת תנאים אלה או פעלת בניגוד לדין/מדיניות.</li>
              </ul>
            </section>

            <section>
              <h2>10) דין ושיפוט</h2>
              <p>על תנאים אלה יחולו דיני מדינת ישראל (ללא הוראות ברירת דין). סמכות השיפוט הבלעדית נתונה לבתי המשפט המוסמכים במחוז תל‑אביב–יפו, אלא אם הוסכם אחרת בכתב.</p>
            </section>

            <section>
              <h2>11) שינויים בתנאים</h2>
              <p>נעדכן תנאים אלה מעת לעת. נפרסם גרסה מעודכנת ותאריך כניסה לתוקף. המשך שימושך בשירות מהווה הסכמה לתנאים המעודכנים.</p>
            </section>

            <section>
              <h2>12) יצירת קשר</h2>
              <p>לכל שאלה: <strong>{SUPPORT_EMAIL}</strong>.</p>
              
              <blockquote style={{ background: '#f8f9fa', padding: '1rem', borderRight: '4px solid #dee2e6', margin: '2rem 0' }}>
                <strong>הערה</strong>: מסמך זה הוא תבנית בסיסית ואינו מהווה ייעוץ משפטי. מומלץ להתייעץ עם עו"ד לפני פרסום/הטמעה.
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