/* FILE: js/26-pixels-and-tracking.js
   بيكسلات (Meta/TikTok/Google) ودالة track()
   (جزء من HoodZilla — بيتحمّل بالترتيب من index.html، والـ global scope مشترك بين كل الملفات. راجع FILES-GUIDE.md) */
/* ---------- Pixels (Meta / TikTok / Google) ---------- */
var __px=0;function initPixels() {
 if(__px||!(META_PIXEL_ID||TIKTOK_PIXEL_ID||GA_ID||GADS_ID))return; __px=1;
if (META_PIXEL_ID) {
(function (f, b, e, v, n, t, s) {
if (f.fbq) return;
n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) :
n.queue.push(arguments); };
if (!f._fbq) f._fbq = n;
n.push = n; n.loaded = true; n.version = '2.0'; n.queue = [];
t = b.createElement(e); t.async = true; t.src = v;
s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
})(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
window.fbq('init', META_PIXEL_ID);
window.fbq('track', 'PageView');
}
if (TIKTOK_PIXEL_ID) {
(function (w, d, t) {
w.TiktokAnalyticsObject = t; var ttq = w[t] = w[t] || [];
ttq.methods = ['page', 'track', 'identify', 'instances', 'debug', 'on', 'off', 'once', 'ready', 'alias',
'group', 'enableCookie', 'disableCookie'];
ttq.setAndDefer = function (t, e) { t[e] = function () {
t.push([e].concat(Array.prototype.slice.call(arguments, 0))); }; };
for (var i = 0; i < ttq.methods.length; i++) ttq.setAndDefer(ttq, ttq.methods[i]);
ttq.instance = function (t) { for (var e = ttq._i[t] || [], n = 0; n < ttq.methods.length; n++)
ttq.setAndDefer(e, ttq.methods[n]); return e; };
ttq.load = function (e, n) {
var i = 'https://analytics.tiktok.com/i18n/pixel/events.js';
ttq._i = ttq._i || {}; ttq._i[e] = []; ttq._i[e]._u = i; ttq._t = ttq._t || {}; ttq._t[e] = +new Date;
ttq._o = ttq._o || {}; ttq._o[e] = n || {};
var o = document.createElement('script'); o.type = 'text/javascript'; o.async = true; o.src
= i + '?sdkid=' + e + '&lib=' + t;
var a = document.getElementsByTagName('script')[0]; a.parentNode.insertBefore(o, a);
};
ttq.load(TIKTOK_PIXEL_ID); ttq.page();
})(window, document, 'ttq');
}
if (GA_ID || GADS_ID) {
var gs = document.createElement('script'); gs.async = true;
gs.src = 'https://www.googletagmanager.com/gtag/js?id=' + (GA_ID || GADS_ID);
document.head.appendChild(gs);
window.dataLayer = window.dataLayer || [];
window.gtag = function () { window.dataLayer.push(arguments); };
window.gtag('js', new Date());
if (GA_ID) window.gtag('config', GA_ID);
if (GADS_ID) window.gtag('config', GADS_ID);
}
}
var GA_EVENTS = { ViewContent: 'view_item', AddToCart: 'add_to_cart', InitiateCheckout:
'begin_checkout', Lead: 'generate_lead', Search: 'search' };
function track(ev, d) {
d = d || {};
var ids = d.content_ids || [];
try { if (window.fbq) { var __o = {}, __e = d.eventID; for (var __k in d) if (__k !== 'eventID') __o[__k] = d[__k]; if (__e) window.fbq('track', ev, __o, { eventID: __e }); else window.fbq('track', ev, __o); } } catch (e) {}
try {
if (window.ttq) {
window.ttq.track(ev === 'Lead' ? 'Contact' : ev, {
contents: ids.map(function (id) { return { content_id: id, content_type: 'product',
content_name: d.content_name || '' }; }),
content_type: 'product', value: d.value || 0, currency: d.currency || 'EGP', query:
d.search_string
});
}
} catch (e) {}
try {
if (window.gtag) {
if (GA_EVENTS[ev]) {
window.gtag('event', GA_EVENTS[ev], {
currency: d.currency || 'EGP', value: d.value || 0, search_term: d.search_string,
items: ids.map(function (id) { return { item_id: id, item_name: d.content_name || '' }; })
});
}
if (ev === 'Lead' && GADS_ID && GADS_LABEL) window.gtag('event', 'conversion', {
send_to: GADS_ID + '/' + GADS_LABEL, value: d.value || 0, currency: 'EGP' });
}
} catch (e) {}
}
