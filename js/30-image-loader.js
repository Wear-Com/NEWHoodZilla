/* FILE: js/30-image-loader.js
   تحميل الصور: مصادر متعددة، طابور، إعادة محاولة، makeImg
   (جزء من HoodZilla — بيتحمّل بالترتيب من index.html، والـ global scope مشترك بين كل الملفات. راجع FILES-GUIDE.md) */
/* ---------- Images (natural sizes, several sources tried in order) ---------- */
/* ---------- Images: CDN proxy first, then Google sources; global queue + timeouts + retries ---------- */
var IMG_CFG = {
  MAX_PARALLEL: 6,             // أقصى عدد صور بتتحمل مع بعض
  TIMEOUT_MS: 11000,           // مهلة أول جولة (بتزيد مع كل جولة للنت البطيء)
  RETRIES: 3,                  // جولات إعادة المحاولة الصامتة (بتتباعد تدريجياً) طول ما الصورة على الشاشة
  RETRY_BASE_MS: 1800
};
function imgSources(id, w) {
  w = Math.min(w, 900);
  var a = ['https://lh3.googleusercontent.com/d/' + id + '=w' + w, 'https://drive.google.com/thumbnail?id=' + id + '&sz=w' + w];
  if (imgPref[id] === 1) a.reverse();           // لو المصدر التاني هو اللي اشتغل قبل كده نبدأ بيه
  return a;
}
var imgQ = [], imgBusy = 0, imgPref = {};
/* نفس عرض الصورة في الرئيسية والكارت والبانر: الرابط واحد فالمتصفح بيحمّلها مرة واحدة بس (الكارت بيفتح فوراً من الكاش) */
var IMG_W = (window.innerWidth <= 700 ? 640 : 720);
function imgPump() {
  while (imgBusy < IMG_CFG.MAX_PARALLEL && imgQ.length) { var t = imgQ.shift(); if (t.go) { imgBusy++; t.go(); } }
}
function makeImg(id, w, alt) {
var img = document.createElement('img');
img.setAttribute('data-hzi', '1'); img.alt = '';   // الـ alt بيتحط بعد التحميل بس (عشان أيقونة الصورة المكسورة واسم الموديل ميظهروش)
img.referrerPolicy = 'no-referrer';
img.decoding = 'async';
var srcs = imgSources(id, w), n = 0, started = false, round = 0, timer = null, slot = false, tk = null, dead = false, gaveUp = 0, lastAgain = 0;
function free() { if (slot) { slot = false; imgBusy--; imgPump(); } clearTimeout(timer); }
function fail() {
  free();
  if (dead) return;
  if (n + 1 < srcs.length) { n++; enqueue(true); return; }
  if (round < IMG_CFG.RETRIES) {
    round++; n = 0;
    setTimeout(function () { if (document.body.contains(img)) enqueue(false); else { started = false; round = 0; } }, IMG_CFG.RETRY_BASE_MS * round * round);
    return;
  }
  giveUp();
}
function giveUp() {
  // مفيش نص: الصورة بتفضل تحاول لوحدها (كل 20 ثانية، وأول ما النت يرجع أو التبويب يتفتح)، وأيقونة دايرة صغيرة بس لو كله فشل
  var par = img.parentNode;
  if (par && !par.querySelector('.imgretry')) {
    var btn = el('button', 'imgretry', '');
    btn.type = 'button'; btn.setAttribute('aria-label', 'retry');
    btn.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-3-6.7"/><path d="M21 4v5h-5"/></svg>';
    btn.addEventListener('click', function (e) { e.stopPropagation(); again(); });
    par.appendChild(btn);
  }
  try { window.hzReport && window.hzReport('image', 'الصورة فشلت من كل المصادر: ' + id); } catch (e) {}
  if (++gaveUp <= 3) setTimeout(function () { if (!dead && document.body.contains(img) && img.dataset.ok !== '1') again(); }, 30000 * gaveUp);
}
function again() {
  var par = img.parentNode, b = par && par.querySelector('.imgretry'); if (b) b.remove();
  round = 0; n = 0; enqueue(true);
}
function nudge() { if (img.dataset.ok !== '1' && started && document.body.contains(img) && Date.now() - lastAgain > 15000) { lastAgain = Date.now(); again(); } }
window.addEventListener('online', nudge);
document.addEventListener('visibilitychange', function () { if (!document.hidden) nudge(); });
function enqueue(front) {
  if (tk) tk.go = null;
  tk = { go: function () {
    slot = true;
    clearTimeout(timer);
    timer = setTimeout(fail, IMG_CFG.TIMEOUT_MS + round * 4000);
    img.src = srcs[n];
  } };
  if (front) imgQ.unshift(tk); else imgQ.push(tk);
  imgPump();
}
img.onload = function () { free(); if (n === 1) imgPref[id] = 1; img.dataset.ok = '1'; img.alt = alt || ''; var par = img.parentNode, b = par && par.querySelector('.imgretry'); if (b) b.remove(); };
img.onerror = function () { fail(); };
img.load = function () {
  if (started) return;
  started = true;
  enqueue(w >= 700);
};
return img;
}

var io = ('IntersectionObserver' in window) ? new IntersectionObserver(function (ents) {
ents.forEach(function (en) { if (en.target._vis) en.target._vis(en.isIntersecting); });
}, { rootMargin: '300px 0px' }) : null;
