/* ============================================
   COSTA GLASS — Cookie Consent (GA4 + Consent Mode V2)
   ============================================ */
(function () {
  'use strict';

  var STORAGE_KEY = 'cookieConsent';

  /* Send a consent update via gtag (defined in <head> before this script) */
  function updateConsent(state) {
    if (typeof window.gtag === 'function') {
      window.gtag('consent', 'update', {
        analytics_storage: state,
        ad_storage: state,
        ad_user_data: state,
        ad_personalization: state
      });
    }
  }

  /* Apply stored preference immediately — runs before DOMContentLoaded
     so the update arrives within the wait_for_update window */
  var stored = localStorage.getItem(STORAGE_KEY);

  if (stored === 'accepted') {
    updateConsent('granted');
    return; /* Banner not needed */
  }

  if (stored === 'rejected') {
    return; /* Default already denied — nothing to do */
  }

  /* ---- First visit: show the consent banner once the DOM is ready ---- */

  function injectStyles() {
    if (document.getElementById('cg-consent-style')) return;
    var s = document.createElement('style');
    s.id = 'cg-consent-style';
    s.textContent =
      '#cg-consent{' +
        'position:fixed;bottom:24px;left:24px;z-index:99999;' +
        'background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;' +
        'box-shadow:0 4px 24px rgba(0,0,0,.13);' +
        'padding:18px 20px;max-width:300px;' +
        'font-family:Inter,system-ui,sans-serif;font-size:13px;' +
        'color:#374151;line-height:1.55;' +
      '}' +
      '#cg-consent p{margin:0 0 14px;}' +
      '.cg-btns{display:flex;gap:8px;}' +
      '.cg-btns button{' +
        'flex:1;padding:9px 0;border-radius:6px;' +
        'border:1.5px solid #1a56a6;font-size:13px;font-weight:600;' +
        'cursor:pointer;transition:opacity .15s;' +
      '}' +
      '.cg-btns button:hover{opacity:.82;}' +
      '#cg-accept{background:#1a56a6;color:#fff;}' +
      '#cg-reject{background:#fff;color:#1a56a6;}';
    document.head.appendChild(s);
  }

  function createBanner() {
    var el = document.createElement('div');
    el.id = 'cg-consent';
    el.innerHTML =
      '<p>Usamos cookies anal&iacute;ticas para mejorar tu experiencia. ' +
      '&iquest;Aceptas las cookies?</p>' +
      '<div class="cg-btns">' +
        '<button id="cg-accept">Aceptar</button>' +
        '<button id="cg-reject">Rechazar</button>' +
      '</div>';
    document.body.appendChild(el);

    document.getElementById('cg-accept').addEventListener('click', function () {
      localStorage.setItem(STORAGE_KEY, 'accepted');
      updateConsent('granted');
      el.remove();
    });

    document.getElementById('cg-reject').addEventListener('click', function () {
      localStorage.setItem(STORAGE_KEY, 'rejected');
      /* Consent stays denied — no update needed */
      el.remove();
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    injectStyles();
    createBanner();
  });
}());
