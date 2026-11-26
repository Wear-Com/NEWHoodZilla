/* FILE: js/35-product-modal.js
   نافذة المنتج: صور، لون، مقاس، كمية، عروض، openModal/closeModal
   (جزء من HoodZilla — بيتحمّل بالترتيب من index.html، والـ global scope مشترك بين كل الملفات. راجع FILES-GUIDE.md) */
/* ---------- Product modal ---------- */
function stopModalTimer() { if (modalTimer) { clearInterval(modalTimer); modalTimer = null; } }
function startModalTimer() {
stopModalTimer();
if (modalImgs.length > 1) {
modalTimer = setInterval(function () { showModalImg((modalIdx + 1) % modalImgs.length);
}, ROTATE_MS);
}
}
function showModalImg(i) {
modalImgs.forEach(function (m, k) { m.img.className = k === i ? 'on' : ''; });
if (modalImgs[i]) modalImgs[i].img.load();
modalIdx = i;
}


function buildModalPics(p) {
var pic = $('mpic');
pic.innerHTML = '';
modalImgs = [];
stopModalTimer();
var cols = p.colors.filter(function (c) { return c.imageId; });
if (!cols.length && !p.main) { pic.appendChild(el('div', 'noimg', '\u0644\u0627 \u062a\u0648\u062c\u062f \u0635\u0648\u0631\u0629')); return; }
if (p.main) {
var im0 = makeImg(p.main, IMG_W, p.name);
pic.appendChild(im0);
modalImgs.push({ color: null, img: im0 });
}
cols.forEach(function (c) {
var im = makeImg(c.imageId, IMG_W, p.name + ' ' + c.name);
pic.appendChild(im);
modalImgs.push({ color: c, img: im });
});
showModalImg(0);
if (!p.main) startModalTimer();
}
function selectColor(c, keepMain) {
curColor = c;
curSize = null;
for (var i = 0; i < c.sizes.length; i++) {
if (c.sizes[i].inStock) { curSize = c.sizes[i]; break; }
}
stopModalTimer();
if (!keepMain) {
var found = false;
for (var k = 0; k < modalImgs.length; k++) {
if (modalImgs[k].color === c) { showModalImg(k); found = true; break; }
}
if (!found && curProduct.main) showModalImg(0);
}
renderColors();
renderSizes();
updateInfo();
}

function deselectColor() {
curColor = null;
curSize = null;
if (curProduct.main) { showModalImg(0); stopModalTimer(); }
else startModalTimer();
renderColors();
renderSizes();
updateInfo();
}
function renderColors() {
var box = $('mcolors');
box.innerHTML = '';
curProduct.colors.forEach(function (c) {
var b = el('button', 'opt' + (c.inStock ? '' : ' out') + (c === curColor ? ' sel' : ''), c.name || '-');
b.type = 'button';
if (c.inStock) b.addEventListener('click', function () {
if (c === curColor) deselectColor(); else selectColor(c);
});
box.appendChild(b);
});
$('colorName').textContent = curColor ? curColor.name : '';
$('chint').textContent = curColor ? T_CHINT2 : T_CHINT1;
}
function renderSizes() {
var box = $('msizes');
box.innerHTML = '';
var seen = {}, names = [];
curProduct.colors.forEach(function (c) { c.sizes.forEach(function (s) { if (!seen[s.size]) { seen[s.size] = 1; names.push(s.size); } }); });
names.sort(function (a, b) { return sizeRank(a) - sizeRank(b); });
names.forEach(function (nm) {
var s = null; if (curColor) curColor.sizes.forEach(function (z) { if (z.size === nm) s = z; });
var cls = 'opt';
if (!curColor) cls += ' wait'; else if (!s) cls += ' out nos'; else if (!s.inStock) cls += ' out';
if (s && s === curSize) cls += ' sel';
var b = el('button', cls, nm || '-');
b.type = 'button';
b.addEventListener('click', function () {
if (!curColor) { HZ.guide('mcolors', 'اختار اللون الأول'); return; }
if (s && s.inStock) { curSize = s; renderSizes(); updateInfo(); }
});
box.appendChild(b);
});
}
function updateInfo() {
var p = curProduct;
var st = $('mstatus');
var add = $('madd');
var pr = $('mprice');
if (curSize) {
pr.textContent = curSize.price + ' ' + CURRENCY;
st.textContent = '\u0645\u062a\u0648\u0641\u0631 \u0641\u064a \u0627\u0644\u0645\u062e\u0632\u0648\u0646';
st.className = 'status ok';
} else if (!curColor && p.inStock) {
var cp = cardPrice(p);
pr.textContent = (cp.differ ? '\u064a\u0628\u062f\u0623 \u0645\u0646 ' : '') + cp.text + ' ' +
CURRENCY;
st.textContent = '';
st.className = 'status';
} else {
pr.textContent = (!p.inStock) ? (function () { var c0 = cardPrice(p); return (c0.differ ? '\u064a\u0628\u062f\u0623 \u0645\u0646 ' : '') + c0.text + ' ' + CURRENCY; })() : '';
st.textContent = '\u0646\u0641\u0630 \u0645\u0646 \u0627\u0644\u0645\u062e\u0632\u0648\u0646';
st.className = 'status no';
}
pr.className = 'price' + (!p.inStock ? ' dimp' : '');
$('moffer').className = ($('moffer').className || '').replace(/\bdimo\b/g, '').trim() + (!p.inStock ? ' dimo' : '');
if (curColor && curSize) {
add.className = 'btn add';
add.textContent = T_ADD;
} else {
add.className = 'btn add off';
add.textContent = p.inStock ? '\u0627\u062e\u062a\u0631 \u0627\u0644\u0644\u0648\u0646 \u0648\u0627\u0644\u0645\u0642\u0627\u0633' :
'\u063a\u064a\u0631 \u0645\u062a\u0648\u0641\u0631 \u062d\u0627\u0644\u064a\u0627\u064b';
}

var out = !p.inStock;
$('qrow').className = 'qrow' + (out ? ' dis' : '');
$('mqplus').disabled = out;
$('mqminus').disabled = out;
}
function setQty(n) {
if (curProduct && !curProduct.inStock) return;
modalQty = Math.max(1, Math.min(99, n));
$('mqty').textContent = modalQty;
}
$('mqplus').addEventListener('click', function () { setQty(modalQty + 1); });
$('qrow').addEventListener('click', function () { if (this.className.indexOf('dis') > -1 && curProduct && curProduct.inStock) { if (!curColor) HZ.guide('mcolors', 'اختار اللون الأول'); else HZ.guide('msizes', 'اختار المقاس'); } });
$('mqminus').addEventListener('click', function () { setQty(modalQty - 1); });
function buildModalOffers() {
var box = $('moffer');
box.innerHTML = '';
[[T_2PCS, BUNDLE2, 2], [T_3PCS, BUNDLE3, 3], [T_4PCS, BUNDLE4,
4]].forEach(function (o) {
var d = offAmount(o[2], o[1]);
if (d > 0) box.appendChild(el('span', 'ochip', o[0] + ': ' + T_OFF + ' ' + d + ' ' + CURRENCY
+ ' + ' + T_FREESHIP_S));
});
box.appendChild(el('span', 'mnote', T_SHIP + ' ' + SHIP_FEE + ' ' + CURRENCY +
T_ONEPC));
var __on = (window.__hzSET && window.__hzSET['نص_تنويه_العروض']) || ''; if (__on) box.appendChild(el('div', 'honote', __on));
}
function openModal(p) {
curProduct = p;
curColor = null;
curSize = null;
modalQty = 1;
$('mqty').textContent = '1';
$('mcode').textContent = dcode(p.code);
$('mname').textContent = p.name;
var list = splitDesc(p.desc);
var ul = $('mdesc');
ul.innerHTML = '';
list.forEach(function (t) { ul.appendChild(el('li', '', t)); });
$('mdescBlock').style.display = list.length ? 'block' : 'none';
buildModalOffers();
buildModalPics(p);
var hasColors = p.colors.some(function (c) { return c.name; });
$('colorBlock').style.display = hasColors ? 'block' : 'none';
var avail = p.colors.filter(function (c) { return c.inStock; });
if (!hasColors || avail.length === 1) {
if (avail.length) { selectColor(avail[0], !!p.main); }
else { renderColors(); renderSizes(); updateInfo(); }
} else {
renderColors();
renderSizes();
updateInfo();
}
$('modal').classList.add('open');
if (!modalPushed) { pushLayer('m', '#p-' + encodeURIComponent(p.code)); modalPushed =
true; }
else setHash(p.code);
track('ViewContent', { content_ids: [p.code], content_name: p.name, content_type: 'product',
currency: 'EGP' });
}
function closeModal(fromPop) {
HZ.edit = null;
stopModalTimer();
var wasOpen = $('modal').classList.contains('open');
$('modal').classList.remove('open');
if (modalPushed) {
modalPushed = false;
if (fromPop !== true) { try { history.back(); } catch (e) {} }
} else if (wasOpen) {
clearHash();
}
}
$('close').addEventListener('click', closeModal);
$('modal').addEventListener('click', function (e) { if (e.target === this) closeModal(); });
