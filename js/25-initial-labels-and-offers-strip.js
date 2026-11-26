/* FILE: js/25-initial-labels-and-offers-strip.js
   كتابة النصوص الأولية في الصفحة + شريط العروض buildStrip + زر واتساب العائم
   (جزء من HoodZilla — بيتحمّل بالترتيب من index.html، والـ global scope مشترك بين كل الملفات. راجع FILES-GUIDE.md) */
$('brand').textContent = BRAND;
$('foot').textContent = BRAND + ' \u00A9 ' + new Date().getFullYear();
$('ctitle').textContent = T_CART;
$('ctotlbl').textContent = T_TOTAL;
$('csend').textContent = T_SEND;
$('mshare').innerHTML = '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="18" cy="5" r="2.6"/><circle cx="6" cy="12" r="2.6"/><circle cx="18" cy="19" r="2.6"/><path d="M8.3 10.8l7.4-4.4M8.3 13.2l7.4 4.4"/></svg>'; $('mshare').setAttribute('aria-label', T_SHARE); $('mshare').setAttribute('data-tip', T_SHARE);
$('mdescLbl').textContent = T_ABOUT;
$('blabel').textContent = T_PICKS;
$('pinput').placeholder = T_PROMO_PH;
$('papply').textContent = T_PROMO_BTN;
function offAmount(n, bundle) { return Math.max(0, n * UNIT_PRICE - bundle); }

(function () {
var box = $('offers');
[T_FREESHIP, T_INSPECT].forEach(function (t) {
var s = document.createElement('span');
s.className = 'opill free';
s.textContent = t;
box.appendChild(s);
});
})();

function buildStrip() {
var box = $('ostrip');
box.innerHTML = '';
function tile(title, big, sub, cls) {
var t = document.createElement('div');
t.className = 'otile' + (cls ? ' ' + cls : '');
var a = document.createElement('div'); a.className = 'otitle'; a.textContent = title;
var b = document.createElement('div'); b.className = 'ooff'; b.textContent = big;
var c = document.createElement('div'); c.className = 'osub'; c.textContent = sub;
var m = document.createElement('div'); m.className = 'omid'; m.appendChild(a); m.appendChild(b);
t.appendChild(m); t.appendChild(c);
box.appendChild(t);
}
var d2 = offAmount(2, BUNDLE2), d3 = offAmount(3, BUNDLE3), d4 = offAmount(4,
BUNDLE4);
if (d2 > 0) tile(T_BUY2, T_OFF + ' ' + d2 + ' ' + CURRENCY, T_WITH_FREE, '');
if (d3 > 0) tile(T_BUY3, T_OFF + ' ' + d3 + ' ' + CURRENCY, T_WITH_FREE, '');
if (d4 > 0) tile(T_BUY4, T_OFF + ' ' + d4 + ' ' + CURRENCY, T_WITH_FREE, 'best');
var __S = window.__hzSET || {};
if (String(__S['عرض_بوكس_الكود']) !== 'لا' && (PROMOS.length || window.__hzSET)) tile(T_PR_T, __S['نص_بوكس_الكود'] || T_PR_B, T_PR_S, 'promo');
}
buildStrip();

var fab = $('fab');
if (WHATSAPP) {
var welcome = '\u0645\u0631\u062d\u0628\u0627\u064b ' + BRAND + '\u060c \u062d\u0627\u0628\u0628 \u0623\u0633\u062a\u0641\u0633\u0631 \u0639\u0646 \u0627\u0644\u0645\u0646\u062a\u062c\u0627\u062a';
fab.href = 'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(welcome);
} else {
fab.style.display = 'none';
}
