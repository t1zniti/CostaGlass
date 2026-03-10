import 'dotenv/config';
import { mkdirSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const API_BASE = 'https://rankyak.com/api/v1';
const SITE_URL = 'https://costaglass.com';
const API_KEY = process.env.RANKYAK_API_KEY;

if (!API_KEY) {
  console.error('❌ RANKYAK_API_KEY not found in .env');
  process.exit(1);
}

const headers = { 'X-Api-Key': API_KEY, 'Content-Type': 'application/json' };

// ── Helpers ──────────────────────────────────────────────────────────────────

async function fetchWithRetry(url, options = {}, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    const res = await fetch(url, options);

    if (res.status === 429) {
      const wait = Math.min(2 ** attempt * 1000, 30_000);
      console.warn(`⏳ Rate-limited. Waiting ${wait / 1000}s before retry ${attempt}/${retries}…`);
      await new Promise((r) => setTimeout(r, wait));
      continue;
    }

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new Error(`HTTP ${res.status} from ${url}: ${body}`);
    }

    return res;
  }
  throw new Error(`Failed after ${retries} retries (rate-limited): ${url}`);
}

// ── Fetch all articles (paginated) ──────────────────────────────────────────

async function fetchAllArticles() {
  const articles = [];
  let page = 1;

  while (true) {
    console.log(`📡 Fetching articles page ${page}…`);
    const res = await fetchWithRetry(
      `${API_BASE}/articles?page=${page}&per_page=100`,
      { headers }
    );
    const json = await res.json();
    const data = json.data ?? [];

    if (data.length === 0) break;
    articles.push(...data);

    // Stop if we got fewer than a full page
    if (data.length < 100) break;
    page++;
  }

  return articles;
}

// ── Submit live URL back to RankYak ─────────────────────────────────────────

async function reportExternalUrl(articleId, liveUrl) {
  try {
    await fetchWithRetry(
      `${API_BASE}/articles/${encodeURIComponent(articleId)}/external-url`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify({ external_url: liveUrl }),
      }
    );
    console.log(`  ✔ Reported URL → ${liveUrl}`);
  } catch (err) {
    // Non-fatal — article was still generated
    console.warn(`  ⚠ Could not report URL for article ${articleId}: ${err.message}`);
  }
}

// ── HTML template ───────────────────────────────────────────────────────────

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function buildPage(article) {
  const title = escapeHtml(article.meta_title || article.title);
  const description = escapeHtml(article.meta_description || '');
  const heroImage = article.header_image_url || '/Assets/products/glass%20curtain%20walls/8-768x467.webp';
  const canonical = `${SITE_URL}/blog/${article.slug}/`;
  const today = new Date().toISOString().slice(0, 10);

  return `<!DOCTYPE html>
<html lang="es-ES">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <meta name="description" content="${description}">
    <link rel="canonical" href="${canonical}">
    <link rel="icon" href="/Assets/logo/favicon.png" type="image/png">
    <meta property="og:type" content="article">
    <meta property="og:locale" content="es_ES">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${description}">
    <meta property="og:url" content="${canonical}">
    <meta property="og:site_name" content="Costa Glass">
    <meta property="og:image" content="${escapeHtml(heroImage)}">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Playfair+Display:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="/css/styles.css">

    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": "${title}",
      "description": "${description}",
      "image": "${escapeHtml(heroImage)}",
      "author": {
        "@type": "Organization",
        "name": "CostaGlass",
        "url": "https://costaglass.com"
      },
      "publisher": {
        "@type": "Organization",
        "name": "CostaGlass",
        "logo": {
          "@type": "ImageObject",
          "url": "https://costaglass.com/Assets/logo/download.webp"
        }
      },
      "datePublished": "${article.published_at?.slice(0, 10) || today}",
      "dateModified": "${article.updated_at?.slice(0, 10) || today}",
      "mainEntityOfPage": "${canonical}"
    }
    </script>

    <style>
        .article-breadcrumb {
            background: #f8fafc; border-bottom: 1px solid #e2e8f0;
            padding: 14px 0; font-size: 0.8rem; color: #64748b;
        }
        .article-breadcrumb .container { display: flex; align-items: center; flex-wrap: wrap; gap: 4px; }
        .article-breadcrumb a { color: #64748b; text-decoration: none; transition: color 0.2s; }
        .article-breadcrumb a:hover { color: #0ea5e9; }
        .article-breadcrumb span { color: #94a3b8; margin: 0 2px; }

        .article-hero { position: relative; height: 500px; overflow: hidden; }
        .article-hero img { width: 100%; height: 100%; object-fit: cover; }
        .article-hero-overlay {
            position: absolute; inset: 0;
            background: linear-gradient(to bottom, rgba(10,15,28,0.2) 0%, rgba(10,15,28,0.78) 100%);
        }
        .article-hero-header { position: absolute; bottom: 0; left: 0; right: 0; padding: 0 24px 52px; }
        .article-hero-header .inner { max-width: 860px; margin: 0 auto; }
        .article-hero-header h1 {
            font-family: 'Playfair Display', serif;
            font-size: clamp(1.6rem, 3.2vw, 2.5rem);
            font-weight: 700; color: #fff; line-height: 1.22; margin: 0;
        }

        .article-layout {
            display: grid; grid-template-columns: 1fr 300px;
            gap: 64px; max-width: 1160px; margin: 0 auto;
            padding: 80px 24px 100px; align-items: start;
        }
        @media (max-width: 960px) {
            .article-layout { grid-template-columns: 1fr; gap: 48px; padding: 48px 20px 72px; }
            .article-hero { height: 320px; }
            .article-hero-header { padding: 0 20px 36px; }
        }

        .article-body h2 {
            font-family: 'Playfair Display', serif; font-size: 1.6rem; font-weight: 700;
            color: #0f172a; margin: 56px 0 18px; padding-top: 20px; border-top: 3px solid #0ea5e9;
        }
        .article-body h3 { font-size: 1.12rem; font-weight: 700; color: #0f172a; margin: 30px 0 10px; }
        .article-body p { font-size: 1.02rem; line-height: 1.85; color: #475569; margin-bottom: 18px; }
        .article-body ul, .article-body ol { padding-left: 22px; margin-bottom: 20px; }
        .article-body li { font-size: 1rem; line-height: 1.8; color: #475569; margin-bottom: 8px; }
        .article-body a { color: #0284c7; font-weight: 600; text-decoration: underline; text-underline-offset: 3px; }
        .article-body a:hover { color: #0369a1; }
        .article-body strong { color: #1e293b; }
        .article-body img { width: 100%; border-radius: 14px; margin: 36px 0 8px; display: block; box-shadow: 0 8px 30px rgba(0,0,0,0.11); }

        .article-sidebar { position: sticky; top: 100px; }
        .sidebar-card {
            background: #f8fafc; border: 1px solid #e2e8f0;
            border-radius: 16px; padding: 28px; margin-bottom: 24px;
        }
        .sidebar-card h4 {
            font-size: 0.8rem; font-weight: 700; text-transform: uppercase;
            letter-spacing: 0.08em; color: #0f172a; margin: 0 0 18px;
        }
        .sidebar-cta-btn {
            display: block; background: #0ea5e9; color: #fff;
            text-align: center; font-weight: 700; font-size: 0.9rem;
            padding: 14px 20px; border-radius: 50px; text-decoration: none;
            transition: background 0.2s, transform 0.2s; margin-bottom: 12px;
        }
        .sidebar-cta-btn:hover { background: #0284c7; transform: translateY(-1px); }
        .sidebar-cta-btn.secondary {
            background: transparent; border: 2px solid #0ea5e9; color: #0ea5e9;
        }
        .sidebar-cta-btn.secondary:hover { background: #0ea5e9; color: #fff; }
        .sidebar-products { list-style: none; padding: 0; margin: 0; }
        .sidebar-products li { margin-bottom: 9px; }
        .sidebar-products a {
            font-size: 0.87rem; color: #475569; text-decoration: none;
            display: flex; align-items: center; gap: 8px; transition: color 0.2s;
        }
        .sidebar-products a::before { content: "▸"; color: #0ea5e9; font-size: 1.1em; }
        .sidebar-products a:hover { color: #0ea5e9; }

        .back-to-blog {
            display: inline-flex; align-items: center; gap: 8px;
            font-size: 0.87rem; font-weight: 600; color: #0284c7;
            text-decoration: none; margin-bottom: 36px; transition: gap 0.2s;
        }
        .back-to-blog:hover { gap: 12px; }
    </style>

    <!-- Google Consent Mode V2 -->
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('consent', 'default', {
        'analytics_storage': 'denied',
        'ad_storage': 'denied',
        'ad_user_data': 'denied',
        'ad_personalization': 'denied',
        'wait_for_update': 1000
      });
    </script>
    <!-- Google Analytics 4 -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-3GZ6B4G65Y"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-3GZ6B4G65Y');
      gtag('config', 'GT-TBB98WMX');
    </script>
</head>
<body>

    <!-- ========== NAVIGATION ========== -->
    <nav class="navbar scrolled" id="navbar">
        <div class="nav-container">
            <a href="/" class="nav-logo">
                <img src="/Assets/logo/download.webp" alt="Costa Glass Logo">
            </a>
            <ul class="nav-links" id="navLinks">
                <li><a href="/">Inicio</a></li>
                <li class="nav-dropdown">
                    <a href="/#products" class="dropdown-trigger">Productos <svg width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1L5 5L9 1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></a>
                    <ul class="dropdown-menu">
                        <li><a href="/cortinas-de-cristal/">Cortinas de Cristal</a></li>
                        <li><a href="/pergolas-bioclimaticas/">Pérgolas Bioclimáticas</a></li>
                        <li><a href="/guillotina-de-cristal/">Guillotina Cristal</a></li>
                        <li><a href="/toldo-zip/">Toldo Zip</a></li>
                        <li><a href="/retractable-pvc-roof/">Sistemas de Techo Retráctil</a></li>
                        <li><a href="/paraviento-de-cristal/">Paravientos de Cristal</a></li>
                    </ul>
                </li>
                <li><a href="/company/">Empresa</a></li>
                <li><a href="/blog/" class="active">Blog</a></li>
                <li><a href="/contact/">Contacto</a></li>
            </ul>
            <a href="tel:+34951074067" class="nav-phone">+34 951 074 067</a>
            <a href="/contact/" class="nav-cta">Consulta Gratuita</a>
            <button class="mobile-toggle" id="mobileToggle" aria-label="Toggle menu">
                <span></span><span></span><span></span>
            </button>
        </div>
    </nav>

    <!-- ========== MOBILE MENU ========== -->
    <div class="mobile-menu" id="mobileMenu">
        <div class="mobile-menu-content">
            <a href="/">Inicio</a>
            <div class="mobile-dropdown">
                <button class="mobile-dropdown-trigger">Productos <svg width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1L5 5L9 1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
                <div class="mobile-dropdown-menu">
                    <a href="/cortinas-de-cristal/">Cortinas de Cristal</a>
                    <a href="/pergolas-bioclimaticas/">Pérgolas Bioclimáticas</a>
                    <a href="/guillotina-de-cristal/">Guillotina Cristal</a>
                    <a href="/toldo-zip/">Toldo Zip</a>
                    <a href="/retractable-pvc-roof/">Sistemas de Techo Retráctil</a>
                    <a href="/paraviento-de-cristal/">Paravientos de Cristal</a>
                </div>
            </div>
            <a href="/company/">Empresa</a>
            <a href="/blog/">Blog</a>
            <a href="/contact/">Contacto</a>
            <a href="/contact/" class="mobile-cta">Consulta Gratuita</a>
        </div>
    </div>

    <!-- ========== BREADCRUMB ========== -->
    <nav class="article-breadcrumb" aria-label="Breadcrumb">
        <div class="container">
            <a href="/">Inicio</a>
            <span>›</span>
            <a href="/blog/">Blog</a>
            <span>›</span>
            <span>${escapeHtml(article.title)}</span>
        </div>
    </nav>

    <!-- ========== ARTICLE HERO ========== -->
    <div class="article-hero">
        <img src="${escapeHtml(heroImage)}" alt="${title}" loading="eager">
        <div class="article-hero-overlay"></div>
        <div class="article-hero-header">
            <div class="inner">
                <h1>${escapeHtml(article.title)}</h1>
            </div>
        </div>
    </div>

    <!-- ========== ARTICLE CONTENT ========== -->
    <div class="article-layout">

        <!-- ── Main Body ── -->
        <article class="article-body">

            <a href="/blog/" class="back-to-blog">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
                Volver al Blog
            </a>

            ${article.html}

        </article>

        <!-- ── Sidebar ── -->
        <aside class="article-sidebar">
            <div class="sidebar-card">
                <h4>Consulta Gratuita</h4>
                <p style="font-size:0.9rem;color:#475569;margin:0 0 18px;line-height:1.6;">¿Tienes un proyecto en mente? Nuestro equipo en Estepona te asesora sin compromiso.</p>
                <a href="/contact/" class="sidebar-cta-btn">Pedir Presupuesto</a>
                <a href="tel:+34951074067" class="sidebar-cta-btn secondary">+34 951 074 067</a>
            </div>
            <div class="sidebar-card">
                <h4>Nuestros Productos</h4>
                <ul class="sidebar-products">
                    <li><a href="/cortinas-de-cristal/">Cortinas de Cristal</a></li>
                    <li><a href="/pergolas-bioclimaticas/">Pérgolas Bioclimáticas</a></li>
                    <li><a href="/guillotina-de-cristal/">Guillotina Cristal</a></li>
                    <li><a href="/toldo-zip/">Toldo Zip</a></li>
                    <li><a href="/retractable-pvc-roof/">Techo Retráctil PVC</a></li>
                    <li><a href="/paraviento-de-cristal/">Paravientos de Cristal</a></li>
                </ul>
            </div>
        </aside>
    </div>

    <!-- ========== BLOG CTA ========== -->
    <section class="cta-section">
        <div class="cta-bg"></div>
        <div class="container">
            <div class="cta-content fade-up">
                <h2>¿Listo para transformar tu terraza?</h2>
                <p>Contacta con nuestro equipo en Estepona y recibe un presupuesto detallado y sin compromiso para tu proyecto en la Costa del Sol.</p>
                <a href="/contact/" class="btn btn-white">Solicitar Presupuesto Gratuito</a>
            </div>
        </div>
    </section>

    <!-- ========== FOOTER ========== -->
    <footer class="footer">
        <div class="container">
            <div class="footer-grid">
                <div class="footer-brand">
                    <img src="/Assets/logo/download.webp" alt="Costa Glass">
                    <p>Sistemas innovadores de pérgolas, techos corredizos y toldos zip. Diseño, confort y elegancia para sus espacios exteriores.</p>
                    <div class="footer-social">
                        <a href="https://www.facebook.com/cortinasdecristalcosta" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg></a>
                        <a href="http://www.youtube.com/@cortinasdecristalbioclimaticas" target="_blank" rel="noopener noreferrer" aria-label="YouTube"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19.1c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.43z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="#fff"/></svg></a>
                    </div>
                </div>
                <div class="footer-col"><h4>Productos</h4><ul><li><a href="/cortinas-de-cristal/">Cortinas de Cristal</a></li><li><a href="/pergolas-bioclimaticas/">Pérgolas Bioclimáticas</a></li><li><a href="/guillotina-de-cristal/">Guillotina Cristal</a></li><li><a href="/toldo-zip/">Toldo Zip</a></li><li><a href="/retractable-pvc-roof/">Techo Retráctil</a></li><li><a href="/paraviento-de-cristal/">Paravientos</a></li></ul></div>
                <div class="footer-col"><h4>Enlaces Rápidos</h4><ul><li><a href="/">Inicio</a></li><li><a href="/company/">Empresa</a></li><li><a href="/blog/">Blog</a></li><li><a href="/contact/">Contacto</a></li></ul></div>
                <div class="footer-col"><h4>Legal</h4><ul><li><a href="/politica-de-privacidad/">Política de Privacidad</a></li><li><a href="/politica-de-cookies/">Política de Cookies</a></li></ul></div>
            </div>
            <div class="footer-bottom"><p>&copy; ${new Date().getFullYear()} Costa Glass. Todos los derechos reservados.</p></div>
        </div>
    </footer>

    <!-- ========== LANGUAGE WIDGET ========== -->
    <div class="lang-widget" id="langWidget">
        <button class="lang-widget-toggle" id="langToggle" aria-label="Change Language"><img src="https://flagcdn.com/w40/es.png" class="lang-flag" id="currentFlag" width="40" height="27" alt="Español"><span class="lang-code" id="currentLang">ES</span></button>
        <div class="lang-widget-menu" id="langMenu">
            <button class="lang-option" data-lang="en"><img src="https://flagcdn.com/w40/gb.png" alt="English"><span>English</span></button>
            <button class="lang-option" data-lang="es"><img src="https://flagcdn.com/w40/es.png" alt="Español"><span>Español</span></button>
            <button class="lang-option" data-lang="fr"><img src="https://flagcdn.com/w40/fr.png" alt="Français"><span>Français</span></button>
            <button class="lang-option" data-lang="de"><img src="https://flagcdn.com/w40/de.png" alt="Deutsch"><span>Deutsch</span></button>
            <button class="lang-option" data-lang="ru"><img src="https://flagcdn.com/w40/ru.png" alt="Русский"><span>Русский</span></button>
            <button class="lang-option" data-lang="ar"><img src="https://flagcdn.com/w40/sa.png" alt="العربية"><span>العربية</span></button>
        </div>
    </div>

    <div id="google_translate_element" style="display:none;"></div>
    <script type="module" src="/js/main.js"></script>
    <script>
        function googleTranslateElementInit() {
            new google.translate.TranslateElement({ pageLanguage: 'es', includedLanguages: 'es,en,fr,de,ru,ar', autoDisplay: false }, 'google_translate_element');
        }
    </script>
    <script src="https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"></script>
    <script type="module" src="/js/consent.js"></script>
</body>
</html>`;
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🚀 generate-blog.js — Fetching articles from RankYak…\n');

  const articles = await fetchAllArticles();
  console.log(`\n📝 Found ${articles.length} article(s)\n`);

  if (articles.length === 0) {
    console.log('Nothing to generate. Exiting.');
    return;
  }

  let generated = 0;

  for (const article of articles) {
    if (!article.slug || !article.html) {
      console.warn(`⚠ Skipping article id=${article.id} — missing slug or html`);
      continue;
    }

    const dir = join(__dirname, 'blog', article.slug);
    const filePath = join(dir, 'index.html');

    mkdirSync(dir, { recursive: true });
    writeFileSync(filePath, buildPage(article), 'utf-8');
    console.log(`📄 blog/${article.slug}/index.html`);
    generated++;

    // Report the live URL back to RankYak
    const liveUrl = `${SITE_URL}/blog/${article.slug}/`;
    await reportExternalUrl(article.id, liveUrl);
  }

  console.log(`\n✅ Generated ${generated} blog page(s)\n`);
}

main().catch((err) => {
  console.error('❌ generate-blog.js failed:', err);
  process.exit(1);
});
