/* FILE: js/40-filters-and-search.js
   البحث والفلاتر (حالة/مقاس/لون/ترتيب)
   (جزء من HoodZilla — بيتحمّل بالترتيب من index.html، والـ global scope مشترك بين كل الملفات. راجع FILES-GUIDE.md) */
/* ---------- Filters ---------- */
var selSizes = {}, selColors = {}, chipSig = '';
function sizeRank(v) {
var o = ['XS', 'S', 'M', 'L', 'XL', '2XL', 'XXL', '3XL', '4XL', '5XL'];
var i = o.indexOf(String(v).toUpperCase());
if (i > -1) return i;
var n = parseFloat(v);
return isNaN(n) ? 100 : 200 + n;
}
function fillChips(id, arr, sel, outs) {
var box = $(id);
box.innerHTML = '';
arr.forEach(function (v) {
var b = el('button', 'fc' + (sel[v] ? ' on' : '') + (outs && outs[v] ? ' dimc' : ''), v);
b.type = 'button';
b.addEventListener('click', function () {
if (sel[v]) { delete sel[v]; b.classList.remove('on'); } else { sel[v] = 1; b.classList.add('on'); }
render();
});
box.appendChild(b);
});
}
function buildFilterChips() {
var sz = {}, cl = {}, szOut = {}, clOut = {};
ALL.forEach(function (p) {
p.colors.forEach(function (c) {
if (c.name) { if (statOk(filter, c.inStock, c.sizes.some(szLow))) { cl[c.name] = 1; if (c.inStock) clOut[c.name] = clOut[c.name] || 0; } if (c.inStock) clOut[c.name] = 2; }
c.sizes.forEach(function (z) { if (z.size && statOk(filter, z.inStock, szLow(z))) { sz[z.size] = 1; } if (z.size && z.inStock) szOut[z.size] = 2; });
});
});
var sizes = Object.keys(sz).sort(function (a, b) { return sizeRank(a) - sizeRank(b); });
var colors = Object.keys(cl);
var o1 = {}, o2 = {};
sizes.forEach(function (k) { if (szOut[k] !== 2) o1[k] = 1; });
colors.forEach(function (k) { if (clOut[k] !== 2) o2[k] = 1; });
var sig = filter + '#' + sizes.map(function (k) { return k + (o1[k] ? '!' : ''); }).join('|') + '#' + colors.map(function (k) { return k + (o2[k] ? '!' : ''); }).join('|');
if (sig === chipSig) return;
chipSig = sig;
fillChips('fsizes', sizes, selSizes, o1);
fillChips('fcolors', colors, selColors, o2);
$('fsizesBox').style.display = sizes.length ? '' : 'none';
$('fcolorsBox').style.display = colors.length ? '' : 'none';
}
function updateFilterUI(n) {
var active = query || filter !== 'all' || sortMode !== 'def' || Object.keys(selSizes).length ||
Object.keys(selColors).length;
$('fdot').style.display = active ? 'block' : 'none';
$('fgo').textContent = '\u0639\u0631\u0636 ' + n + ' \u062f\u064a\u0632\u0627\u064a\u0646';
}
function openF() {
$('fpanel').classList.add('open');
document.body.style.overflow = 'hidden';
if (window.matchMedia && matchMedia('(hover:hover)').matches) setTimeout(function () {
$('search').focus(); }, 120);
}
function closeF() {
if (!$('fpanel').classList.contains('open')) return;
$('fpanel').classList.remove('open');
document.body.style.overflow = '';
if (query) track('Search', { search_string: query });
}
$('fbtn').addEventListener('click', openF);
$('fx').addEventListener('click', closeF);
$('fgo').addEventListener('click', closeF);
$('fpanel').addEventListener('click', function (e) { if (e.target === this) closeF(); });
document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeF(); });
$('freset').addEventListener('click', function () {
query = ''; filter = 'all'; sortMode = 'def';
$('search').value = ''; $('sort').value = 'def';
Object.keys(selSizes).forEach(function (k) { delete selSizes[k]; });
Object.keys(selColors).forEach(function (k) { delete selColors[k]; });
Array.prototype.forEach.call(document.querySelectorAll('.fc.on'), function (b) {
b.classList.remove('on'); });
document.querySelector('.chip.active').classList.remove('active');
document.querySelector('.chip[data-f="all"]').classList.add('active');
render();
});
$('search').addEventListener('input', function () { query = this.value.trim(); render(); });
$('sort').addEventListener('change', function () { sortMode = this.value; render(); });
Array.prototype.forEach.call(document.querySelectorAll('.chip'), function (c) {
c.addEventListener('click', function () {
document.querySelector('.chip.active').classList.remove('active');
c.classList.add('active');
filter = c.getAttribute('data-f');
render();
});
});
