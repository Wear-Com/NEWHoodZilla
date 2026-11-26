/* FILE: js/33-wide-banner.js
   البانر العريض (سحب + نقط)
   (جزء من HoodZilla — بيتحمّل بالترتيب من index.html، والـ global scope مشترك بين كل الملفات. راجع FILES-GUIDE.md) */
/* ---------- Wide banner (swipe + dots) ---------- */
var bnItems = [], bnVis = 3, bnStep = 0, bnPages = 1, bnTimer = null, bnRaf = 0, bnPause =
0;
function buildBanner() {
var sec = $('banner'), track = $('btrack');
track.innerHTML = '';
bnItems = [];
ALL.forEach(function (p) {
if (!p.inStock || !p.gallery) return;
p.gallery.forEach(function (id) { bnItems.push({ id: id, p: p }); });
});
if (!bnItems.length) { sec.style.display = 'none'; if (bnTimer) { clearInterval(bnTimer); bnTimer
= null; } return; }
sec.style.display = 'block';
bnItems.forEach(function (it) {
var s = el('div', 'bslide');
var im = makeImg(it.id, IMG_W, it.p.name);
im.addEventListener('load', function () { im.className = 'on'; });   // addEventListener: مبنستبدلش دالة التحميل الأصلية (كانت بتسيب الصورة فاضية وتحجز مكان في الطابور)
s.appendChild(im);
var cap = el('div', 'bcap');
cap.appendChild(el('span', 'bname', it.p.name));
cap.appendChild(el('span', 'bcode', dcode(it.p.code)));
s.appendChild(cap);
s.addEventListener('click', function () { openModal(it.p); });
track.appendChild(s);
it.img = im;
it.el = s;
});
bnLayout();
if (bnTimer) clearInterval(bnTimer);
bnTimer = setInterval(function () {
if (document.hidden || Date.now() < bnPause || bnPages < 2) return;
var c = bnCur();
bnGo(c >= bnPages - 1 ? 0 : c + 1);
}, BANNER_MS);
}
function bnLayout() {
if (!bnItems.length) return;
var v = $('bview'), w = v.clientWidth;
if (!w) return;
bnVis = w >= 1000 ? 4 : (w >= 640 ? 3 : 2);
var gap = 12, sw = (w - gap * (bnVis - 1)) / bnVis;
bnItems.forEach(function (it) { it.el.style.width = sw + 'px'; });
bnStep = sw + gap;
bnPages = Math.ceil(bnItems.length / bnVis);
var dots = $('bdots');
dots.innerHTML = '';
if (bnPages > 1) {
for (var i = 0; i < bnPages; i++) {
(function (k) {
var d = el('button', 'bdot'); d.type = 'button';
d.addEventListener('click', function () { bnPause = Date.now() + BANNER_MS; bnGo(k);
});
dots.appendChild(d);
})(i);
}
}
bnSync();
}
function bnCur() {
var v = $('bview');
var max = v.scrollWidth - v.clientWidth;
if (max > 0 && v.scrollLeft >= max - 4) return bnPages - 1;
return Math.max(0, Math.min(bnPages - 1, Math.round(v.scrollLeft / (bnVis * bnStep))));
}
function bnGo(i) {
var v = $('bview');
var left = Math.min(i * bnVis * bnStep, v.scrollWidth - v.clientWidth);
try { v.scrollTo({ left: left, behavior: 'smooth' }); } catch (e) { v.scrollLeft = left; }
}
function bnSync() {
var v = $('bview');
var c = bnCur();
var ds = $('bdots').children;
for (var i = 0; i < ds.length; i++) ds[i].className = 'bdot' + (i === c ? ' on' : '');
var first = Math.max(0, Math.floor(v.scrollLeft / (bnStep || 1)));
var end = Math.min(bnItems.length, first + bnVis * 2 + 1);
for (var k = first; k < end; k++) bnItems[k].img.load();
}
(function () {
var v = $('bview');
v.addEventListener('scroll', function () {
if (bnRaf) return;
bnRaf = requestAnimationFrame(function () { bnRaf = 0; bnSync(); });
}, { passive: true });
v.addEventListener('touchstart', function () { bnPause = Date.now() + BANNER_MS * 2; }, {
passive: true });
v.addEventListener('wheel', function () { bnPause = Date.now() + BANNER_MS * 2; }, {
passive: true });
v.addEventListener('mouseenter', function () { bnPause = Date.now() + 86400000; });
v.addEventListener('mouseleave', function () { bnPause = Date.now() + BANNER_MS; });
})();
window.addEventListener('resize', bnLayout);
