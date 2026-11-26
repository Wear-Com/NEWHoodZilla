/* FILE: js/32-product-grid-render.js
   عرض شبكة المنتجات: render, getList, skeleton, تدوير صور الكروت
   (جزء من HoodZilla — بيتحمّل بالترتيب من index.html، والـ global scope مشترك بين كل الملفات. راجع FILES-GUIDE.md) */
function showSkeleton() {
var grid = $('grid');
grid.innerHTML = '';
$('msg').textContent = '';
for (var i = 0; i < 8; i++) grid.appendChild(el('div', 'skel'));
}
function szLow(z) { return z.inStock && z.max <= (+(window.__hzSET && window.__hzSET['حد_آخر_القطع']) || 3); }
function statOk(st, inS, low) { return st === 'all' || (st === 'in' && inS) || (st === 'out' && !inS) || (st === 'low' && low); }
function getList() {
var q = query.toLowerCase();
var qc = q.replace(/[\s\-]/g, '');
var nSz = Object.keys(selSizes).length, nCl = Object.keys(selColors).length;
var list = ALL.filter(function (p) {
if (filter === 'in' && !p.inStock) return false;
if (filter === 'out' && p.inStock) return false;
if (filter === 'low' && !p.low) return false;
if (nSz || nCl) {
var okc = p.colors.some(function (c) {
if (nCl && !selColors[c.name]) return false;
if (!nSz) return statOk(filter, c.inStock, c.sizes.some(szLow));
return c.sizes.some(function (z) { return selSizes[z.size] && statOk(filter, z.inStock, szLow(z)); });
});
if (!okc) return false;
}
if (!q) return true;
return p.name.toLowerCase().indexOf(q) > -1 ||
p.code.toLowerCase().indexOf(q) > -1 ||
dcode(p.code).toLowerCase().replace(/-/g, '').indexOf(qc) > -1;
});
if (sortMode === 'asc') list.sort(function (a, b) { return cardPrice(a).value -
cardPrice(b).value; });
if (sortMode === 'desc') list.sort(function (a, b) { return cardPrice(b).value -
cardPrice(a).value; });
return list;
}

function render() {
buildFilterChips();
var list = getList();
var grid = $('grid');
if (io) io.disconnect();
grid.innerHTML = '';
rotators = [];
list.forEach(function (p, idx) {
var card = el('div', 'card' + (p.inStock ? '' : ' soldout'));
card.style.animationDelay = Math.min(idx * 0.04, 0.6) + 's';
var wrap = el('div', 'imgwrap');
var list2 = cardImgs(p);
if (list2.length) {
var imgs = list2.map(function (x) {
var im = makeImg(x.id, IMG_W, x.alt);
wrap.appendChild(im);
return im;
});
var state = { i: 0, vis: !io, first: false };
var onVis = function (v) {
state.vis = v;
if (v && !state.first) {
state.first = true;
imgs[0].load();
imgs[0].className = 'on';
if (imgs.length > 1) setTimeout(function () { imgs[1].load(); }, 800);
}
};
wrap._vis = onVis;
if (io) io.observe(wrap); else onVis(true);
if (imgs.length > 1) {
rotators.push(function () {
if (!state.vis) return;
imgs[state.i].className = '';
state.i = (state.i + 1) % imgs.length;
imgs[state.i].load();
imgs[state.i].className = 'on';
});
}
var nc = imgColors(p).length;
if (nc > 1) wrap.appendChild(el('div', 'ccount', nc + ' \u0623\u0644\u0648\u0627\u0646'));
} else {
wrap.appendChild(el('div', 'noimg', '\u0644\u0627 \u062a\u0648\u062c\u062f \u0635\u0648\u0631\u0629'));
}
wrap.appendChild(el('div', 'codechip', dcode(p.code)));
if (p.inStock) wrap.appendChild(p.low ? el('div', 'tag low', '\u0622\u062e\u0631 \u0627\u0644\u0642\u0637\u0639') : el('div', 'tag', '\u0645\u062a\u0648\u0641\u0631'));
else if (p.soon) wrap.appendChild(el('div', 'badge soonx', '\u062c\u0627\u064a \u0642\u0631\u064a\u0628'));
else wrap.appendChild(el('div', 'badge', '\u0646\u0641\u0630'));
if (p.soon && p.inStock) wrap.appendChild(el('div', 'soonb u', '\u062c\u0627\u064a \u0642\u0631\u064a\u0628'));
card.appendChild(wrap);
var info = el('div', 'info');
info.appendChild(el('div', 'name', p.name));
var specList = p.spec ? splitDesc(p.spec) : SPEC_LINES;
if (specList && specList.length) {
var spec = el('div', 'spec');
specList.forEach(function (t) { spec.appendChild(el('div', 'sline', t)); });
info.appendChild(spec);
}
var sizes = el('div', 'sizes');
allSizes(p).forEach(function (s) {
sizes.appendChild(el('span', 'sz' + (s.inStock ? '' : ' out'), s.size));
});
info.appendChild(sizes);
var pr = el('div', 'price');
if (p.inStock) {
var cp = cardPrice(p);
if (cp.differ) pr.appendChild(el('span', 'from', '\u064a\u0628\u062f\u0623 \u0645\u0646'));
pr.appendChild(document.createTextNode(cp.text));
pr.appendChild(el('small', '', CURRENCY));
if (cp.was && wasOn()) { pr.appendChild(el('s', 'was', fmt(cp.was) + ' ' + CURRENCY)); if (pctOn()) pr.appendChild(el('span', 'pct', '-' + Math.round((1 - cp.value / cp.was) * 100) + '%')); }
} else {
var cp0 = cardPrice(p);
if (cp0.differ) pr.appendChild(el('span', 'from', '\u064a\u0628\u062f\u0623 \u0645\u0646'));
pr.appendChild(document.createTextNode(cp0.text));
pr.appendChild(el('small', '', CURRENCY));
pr.className += ' dimp';
}
var prow = el('div', 'prow');
prow.appendChild(pr);
if (!p.inStock) {
var ab = el('button', 'askb', '');
ab.type = 'button';
ab.innerHTML = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/></svg><span>\u0627\u0633\u0623\u0644 \u0639\u0646 \u062a\u0648\u0641\u0631\u0647</span>';
(function (pp, bb, cc) { bb.addEventListener('click', function (e) { e.stopPropagation(); openModal(pp); setTimeout(function () { if (window.__hzAskInCard) window.__hzAskInCard(); }, 450); }); })(p, ab, card);
prow.appendChild(ab);
}
info.appendChild(prow);
card.appendChild(info);
card.addEventListener('click', function () { openModal(p); });
grid.appendChild(card);
});
$('msg').textContent = list.length ? '' : '\u0644\u0627 \u062a\u0648\u062c\u062f \u0645\u0646\u062a\u062c\u0627\u062a \u0645\u0637\u0627\u0628\u0642\u0629';
equalize();
updateFilterUI(list.length);
$('count').textContent = list.length ? list.length + ' \u062f\u064a\u0632\u0627\u064a\u0646' :
'';
}

function equalize() {
var specs = document.querySelectorAll('#grid .spec');
var sizes = document.querySelectorAll('#grid .sizes');
Array.prototype.forEach.call(specs, function (e) { e.style.minHeight = ''; });
Array.prototype.forEach.call(sizes, function (e) { e.style.minHeight = ''; });
var ms = 0, mz = 0;
Array.prototype.forEach.call(specs, function (e) { if (e.offsetHeight > ms) ms = e.offsetHeight;
});
Array.prototype.forEach.call(sizes, function (e) { if (e.offsetHeight > mz) mz = e.offsetHeight;
});
Array.prototype.forEach.call(specs, function (e) { e.style.minHeight = ms + 'px'; });
Array.prototype.forEach.call(sizes, function (e) { e.style.minHeight = mz + 'px'; });
}
var eqT = null;
window.addEventListener('resize', function () { clearTimeout(eqT); eqT = setTimeout(equalize,
120); });
if (document.fonts && document.fonts.ready) document.fonts.ready.then(equalize);

setInterval(function () {
if ($('modal').classList.contains('open')) return;
rotators.forEach(function (fn) { fn(); });
}, ROTATE_MS);
