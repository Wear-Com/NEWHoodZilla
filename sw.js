/* HoodZilla service worker. غيّر رقم VERSION مع كل تحديث للموقع (أي تعديل في أي ملف css/ أو js/ أو index.html) عشان العملاء ياخدوا النسخة الجديدة */
var VERSION = 'hz-v8';
/* قايمة الملفات اللي بتتحفظ للأوفلاين. لو ضفت أو شلت ملف css/js في index.html لازم تعدّلها هنا كمان (راجع FILES-GUIDE.md) */
var SHELL = ['./', 'index.html', 'manifest.json', 'Assets/icon-192.png', 'Assets/icon-512.png', 'Assets/favicon.ico', 'Assets/favicon-32.png', 'Assets/apple-touch-icon.png', 'css/01-base-variables-reset.css', 'css/02-background-aurora.css', 'css/03-hero.css', 'css/04-toolbar.css', 'css/05-offers-strip.css', 'css/06-wide-banner.css', 'css/07-product-cards.css', 'css/08-product-modal.css', 'css/09-floating-buttons.css', 'css/10-toast.css', 'css/11-cart-drawer.css', 'css/12-search-and-filter-panel.css', 'css/13-v2-patches.css', 'js/01-early-install-capture.js', 'js/02-boot-splash.js', 'js/10-i18n-english-dictionary.js', 'js/11-shared-helpers-and-error-report.js', 'js/20-api-client.js', 'js/21-site-constants.js', 'js/22-app-state.js', 'js/23-arabic-ui-texts.js', 'js/24-core-dom-utils.js', 'js/25-initial-labels-and-offers-strip.js', 'js/26-pixels-and-tracking.js', 'js/30-image-loader.js', 'js/31-product-data-helpers.js', 'js/32-product-grid-render.js', 'js/33-wide-banner.js', 'js/34-deeplink-history-share.js', 'js/35-product-modal.js', 'js/36-promo-codes.js', 'js/37-cart-state-and-pricing.js', 'js/38-cart-add-edit-remove.js', 'js/39-cart-render-open-close-and-send.js', 'js/40-filters-and-search.js', 'js/41-data-loading.js', 'js/50-checkout-and-order-flow.js', 'js/51-modal-bundle-offers-and-ask-stock.js', 'js/52-size-guide-and-policies.js', 'js/53-cart-two-step-flow.js', 'js/54-custom-size-and-special-print.js', 'js/55-account-orders-tracking.js', 'js/56-side-menu-header-support-lang.js', 'js/57-small-ui-tweaks.js', 'js/58-print-designer-3d.js', 'js/59-home-offers-messages-ask.js', 'js/60-side-menu-glass-and-social.js', 'js/61-modal-header-account-styles.js', 'js/62-deeplink-go-track.js', 'js/63-extra-style-patches.js', 'js/64-english-translation-and-rtl.js', 'js/65-pwa-service-worker-install-hint.js', 'js/66-v5-extras-watermark-scrolllock-restore-viewers.js', 'js/99-start-app.js', 'css/90-v5-final-overrides.css'];
self.addEventListener('install', function (e) {
  /* كل ملف بيتحفظ لوحده: لو ملف واحد فشل (مثلاً أيقونة ناقصة) باقي الملفات تتحفظ عادي */
  e.waitUntil(caches.open(VERSION).then(function (c) { return Promise.all(SHELL.map(function (f) { return c.add(f).catch(function () {}); })); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) { return Promise.all(ks.filter(function (k) { return k !== VERSION; }).map(function (k) { return caches.delete(k); })); }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  var r = e.request, u = new URL(r.url);
  if (r.method !== 'GET' || u.origin !== location.origin) return;          // الـ API والصور من برّه مبنلمسهاش
  if (r.mode === 'navigate') {                                              // الصفحة: النت الأول (عشان التحديثات)، والكاش لو مفيش نت
    e.respondWith(fetch(r).then(function (res) { var cp = res.clone(); caches.open(VERSION).then(function (c) { c.put('index.html', cp); }); return res; }).catch(function () { return caches.match('index.html').then(function (m) { return m || caches.match('./'); }); }));
    return;
  }
  if (/\.(?:js|css)$/.test(u.pathname)) {                                  // ملفات الكود (css/ و js/): النت الأول زي الصفحة، عشان متحصلش نسخ مخلوطة قديمة/جديدة
    e.respondWith(fetch(r).then(function (res) { if (res && res.ok) { var cp = res.clone(); caches.open(VERSION).then(function (c) { c.put(r, cp); }); } return res; }).catch(function () { return caches.match(r); }));
    return;
  }
  e.respondWith(caches.match(r).then(function (m) { var n = fetch(r).then(function (res) { if (res && res.ok) { var cp = res.clone(); caches.open(VERSION).then(function (c) { c.put(r, cp); }); } return res; }).catch(function () { return m; }); return m || n; }));
});
