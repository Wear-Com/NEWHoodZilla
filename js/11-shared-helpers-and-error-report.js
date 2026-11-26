/* FILE: js/11-shared-helpers-and-error-report.js
   أدوات مشتركة window.HZ (guide/undoBar/tipify) + wasOn/pctOn + إبلاغ أخطاء JS للسيرفر
   (جزء من HoodZilla — بيتحمّل بالترتيب من index.html، والـ global scope مشترك بين كل الملفات. راجع FILES-GUIDE.md) */
(function () {
window.wasOn = function () { return !(window.__hzSET && window.__hzSET['عرض_السعر_قبل_الخصم'] === 'لا'); };
window.pctOn = function () { return !(window.__hzSET && window.__hzSET['عرض_نسبة_الخصم'] === 'لا'); };
/* أدوات مشتركة: إرشاد العميل (سكرول + إطار ذهبي نابض + رسالة) وشريط التراجع في السلة */
var HZ = window.HZ = {
  edit: null,
  tipify: function (b) {                       // اسم الأيقونة بالـ hover وبالضغط المطوّل (زي باقي الأيقونات)
    var tm = null, lp = false;
    b.addEventListener('touchstart', function () { lp = false; tm = setTimeout(function () { lp = true; b.classList.add('tipon'); }, 450); }, { passive: true });
    function end() { clearTimeout(tm); if (lp) setTimeout(function () { b.classList.remove('tipon'); }, 1400); }
    b.addEventListener('touchend', end); b.addEventListener('touchcancel', end);
    b.addEventListener('contextmenu', function (ev) { ev.preventDefault(); });
    b.addEventListener('click', function (ev) { if (lp) { ev.preventDefault(); ev.stopImmediatePropagation(); lp = false; } }, true);
  },
  guide: function (target, msg) {
    var e = typeof target === 'string' ? document.getElementById(target) : target;
    if (msg && typeof showToast === 'function') showToast(msg);
    if (!e) return;
    try { e.scrollIntoView({ block: 'center', behavior: 'smooth' }); } catch (x) { e.scrollIntoView(); }
    e.classList.remove('hzpulse'); void e.offsetWidth; e.classList.add('hzpulse');
    clearTimeout(e._hzp); e._hzp = setTimeout(function () { e.classList.remove('hzpulse'); }, 2300);
  },
  undoBar: function (item, idx) {
    var host = document.getElementById('cscroll'); if (!host) return;
    var old = document.getElementById('hzundo'); if (old) old.remove();
    var bar = document.createElement('div'); bar.id = 'hzundo'; bar.className = 'hzundo';
    var sp = document.createElement('span'); sp.textContent = 'اتشال: ' + item.name;
    var b = document.createElement('button'); b.type = 'button'; b.textContent = 'تراجع';
    b.addEventListener('click', function () { cart.splice(Math.min(idx, cart.length), 0, item); saveCart(); updateBadge(); renderCart(); bar.remove(); });
    bar.appendChild(sp); bar.appendChild(b); host.insertBefore(bar, host.firstChild);
    setTimeout(function () { if (bar.parentNode) bar.remove(); }, 7000);
  }
};
  var seen = {}, cnt = 0, T0 = Date.now();
  window.hzReport = function (where, msg, extra) {
    try {
      var k = where + '|' + String(msg).slice(0, 80); if (seen[k] || cnt >= 12) return; seen[k] = 1; cnt++;
      fetch(API_URL, { method: 'POST', mode: 'no-cors', keepalive: true, headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ type: 'cerr', where: String(where).slice(0, 60), msg: String(msg).slice(0, 300), ua: navigator.userAgent, url: location.href.slice(0, 120), extra: extra || (navigator.onLine === false ? 'offline' : '') }) }).catch(function () {});
    } catch (e) {}
  };
  window.addEventListener('error', function (e) { if (e && e.message && !/ResizeObserver|Script error/i.test(e.message)) window.hzReport('js', e.message + ' @' + String(e.filename || '').split('/').pop() + ':' + (e.lineno || '')); });
  window.addEventListener('unhandledrejection', function (e) { var r = e && e.reason; window.hzReport('promise', r && r.message ? r.message : String(r)); });
})();
