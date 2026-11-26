/* FILE: js/39-cart-render-open-close-and-send.js
   رسم السلة renderCart وفتح/قفل السلة وتسجيل الطلب وزر الإرسال
   (جزء من HoodZilla — بيتحمّل بالترتيب من index.html، والـ global scope مشترك بين كل الملفات. راجع FILES-GUIDE.md) */
function buildOrderMsg() {
var pr = calcPricing();
var lines = [T_GREET];
cart.forEach(function (it, i) {
lines.push((i + 1) + ') ' + it.name +
(it.color ? ' - ' + T_COLOR + ' ' + it.color : '') +
(it.size ? ' - ' + T_SIZE + ' ' + it.size : '') +
' (' + T_CODE + ' ' + dcode(it.code) + ') \u00d7 ' + it.qty);
});
lines.push('');
lines.push(T_SUB + ': ' + fmt(pr.sub) + ' ' + CURRENCY);
if (pr.discount > 0) lines.push(T_DISC + ': -' + fmt(pr.discount) + ' ' + CURRENCY);
if (pr.promo > 0 && promoApplied) lines.push(T_PROMO_LINE + ' (' + promoApplied.code +
'): -' + fmt(pr.promo) + ' ' + CURRENCY);
lines.push(T_SHIP + ': ' + (pr.ship === 0 ? T_FREE : fmt(pr.ship) + ' ' + CURRENCY));
lines.push(T_TOTAL + ': ' + fmt(pr.total) + ' ' + CURRENCY);
return lines.join('\n');
}
function sumRow(label, value, cls) {
var r = el('div', 'srow' + (cls ? ' ' + cls : ''));
r.appendChild(el('span', '', label));
r.appendChild(el('b', '', value));
return r;
}
function renderCart() {
var list = $('clist');
var foot = $('cfoot');
var nudge = $('cnudge');
list.innerHTML = '';
if (!cart.length) {
list.appendChild(el('div', 'cempty', T_EMPTY));
foot.style.display = 'none';
nudge.style.display = 'none';
$('promobox').style.display = 'none';
$('csum').style.display = 'none';
return;
}
foot.style.display = 'flex';
$('promobox').style.display = 'flex';
$('csum').style.display = 'flex';
var __fx = false;
cart.forEach(function (it) { var m = maxFor(it); if (it.qty > m && varQty(it) > m) { it.qty = Math.max(0, it.qty - (varQty(it) - m)); __fx = true; } });
if (__fx) { cart = cart.filter(function (i) { return i.qty > 0; }); saveCart(); updateBadge(); if (!cart.length) { renderCart(); return; } }
cart.forEach(function (it) {
var row = el('div', 'citem');
var th = el('div', 'cthumb clk');
if (it.imageId) {
var im = makeImg(it.imageId, IMG_W, it.name);
th.appendChild(im);
im.load();
} else {
th.appendChild(el('div', 'noimg', ''));
}
th.addEventListener('click', function () { editCartItem(it); });
row.appendChild(th);
var info = el('div', 'cinfo');
var nm = el('div', 'cname clk', it.name); nm.addEventListener('click', function () { editCartItem(it); });
info.appendChild(nm);
var meta = [];
if (it.color) meta.push(T_COLOR + ': ' + it.color);
if (it.size) meta.push(T_SIZE + ': ' + it.size);
info.appendChild(el('div', 'cmeta', meta.join(' | ')));
if (it.cx && window.cxParts) { window.cxParts(it.cx).forEach(function (pt) { var d = el('div', 'cx clk'); d.appendChild(el('b', '', pt[0])); d.appendChild(el('span', '', pt[1])); d.addEventListener('click', function () { editCartItem(it); }); info.appendChild(d); }); }
info.appendChild(el('div', 'cprice', fmt((toNum(it.price) + (it.fee || 0)) * it.qty) + ' ' + CURRENCY));
row.appendChild(info);
var side = el('div', 'cside');
side.appendChild(el('div', 'ccode', dcode(it.code)));
var q = el('div', 'qty');
var plus = el('button', '', '+'); plus.type = 'button';
var minus = el('button', '', '\u2212'); minus.type = 'button';
plus.addEventListener('click', function () { changeQty(it, 1); });
minus.addEventListener('click', function () { changeQty(it, -1); });
if (varQty(it) >= maxFor(it)) plus.className = 'dim';
q.appendChild(plus);
q.appendChild(el('span', '', String(it.qty)));
q.appendChild(minus);
side.appendChild(q);
var del = el('button', 'cdel', '\u00d7'); del.type = 'button'; del.setAttribute('aria-label', 'delete');
del.addEventListener('click', function () { removeItem(it); });
side.appendChild(del);
row.appendChild(side);
list.appendChild(row);
});
var pr = calcPricing();

var r = pr.n % 4, msg = '';
if (r === 1) {
msg = T_N_ADD2 + fmt(Math.max(0, BUNDLE2 - pr.last)) + ' ' + CURRENCY + (pr.n === 1
? T_N_FREE : T_N_ONLY);
} else if (r === 2) {
msg = T_N_ADD3 + fmt(Math.max(0, BUNDLE3 - BUNDLE2)) + ' ' + CURRENCY +
T_N_MORE;
} else if (r === 3) {
msg = T_N_ADD4 + fmt(Math.max(0, BUNDLE4 - BUNDLE3)) + ' ' + CURRENCY +
T_N_MORE;
} else {
msg = T_N_BEST;
}
nudge.textContent = msg;
nudge.style.display = 'block';
renderPromoUI();

var sum = $('csum');
sum.innerHTML = '';
sum.appendChild(sumRow(T_SUB, fmt(pr.sub) + ' ' + CURRENCY, ''));
if (pr.discount > 0) sum.appendChild(sumRow(T_DISC, '-' + fmt(pr.discount) + ' ' +
CURRENCY, 'disc'));
if (pr.promo > 0 && promoApplied) sum.appendChild(sumRow(T_PROMO_ROW + ' (' +
promoApplied.code + ')', '-' + fmt(pr.promo) + ' ' + CURRENCY, 'disc'));
sum.appendChild(sumRow(T_SHIP, pr.ship === 0 ? T_FREE : fmt(pr.ship) + ' ' +
CURRENCY, pr.ship === 0 ? 'free' : ''));
sum.appendChild(el('div', 'sins', T_INSPECT));
var tot = $('ctot');
tot.innerHTML = '';
tot.appendChild(document.createTextNode(fmt(pr.total)));
tot.appendChild(el('small', '', CURRENCY));
var send = $('csend');
if (WHATSAPP) {
send.style.display = 'block';
send.href = 'https://wa.me/' + WHATSAPP + '?text=' +
encodeURIComponent(buildOrderMsg());
} else {
send.style.display = 'none';
}
}
function openCart() {
renderCart();
if (cart.length) { var pc = calcPricing(); track('InitiateCheckout', { content_ids:
cart.map(function (i) { return i.code; }), num_items: pc.n, value: pc.total, currency: 'EGP' }); }
$('cart').classList.add('open');
if (!cartPushed) { pushLayer('c', ''); cartPushed = true; }
}
function closeCart(fromPop) {
var wasOpen = $('cart').classList.contains('open');
$('cart').classList.remove('open');
if (cartPushed) {
cartPushed = false;
var two = window.__s2; window.__s2 = false;
if (fromPop !== true && wasOpen) { if ($('modal').classList.contains('open')) { window.__skipPop = true; setTimeout(function () { window.__skipPop = false; }, 700); } try { history.go(two ? -2 : -1); } catch (e) {} }
}
}
$('cartfab').addEventListener('click', openCart);
$('cclose').addEventListener('click', closeCart);
$('cart').addEventListener('click', function (e) { if (e.target === this) closeCart(); });
function logOrder() {
if (!ORDERS_LOG || !cart.length) return;
try {
var pr = calcPricing();
fetch(API_URL, {
method: 'POST', mode: 'no-cors', keepalive: true,
headers: { 'Content-Type': 'text/plain;charset=utf-8' },
body: JSON.stringify({
id: Date.now().toString(36).toUpperCase(),
items: cart.map(function (i) { return { code: dcode(i.code), name: i.name, color: i.color ||
'', size: i.size || '', qty: i.qty }; }),
total: pr.total, promo: promoApplied ? promoApplied.code : ''
})
});
} catch (e) {}
}
$('csend').addEventListener('click', function () {
var pr = calcPricing();
logOrder();
track('Lead', {
content_ids: cart.map(function (i) { return i.code; }),
num_items: pr.n, value: pr.total, currency: 'EGP'
});
});
document.addEventListener('keydown', function (e) {
if (e.key === 'Escape') { closeModal(); closeCart(); }
});
loadCart();
updateBadge();
