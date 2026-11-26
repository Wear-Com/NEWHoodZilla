/* FILE: js/37-cart-state-and-pricing.js
   حالة السلة والتسعير: loadCart/saveCart/calcPricing/updateBadge/showToast
   (جزء من HoodZilla — بيتحمّل بالترتيب من index.html، والـ global scope مشترك بين كل الملفات. راجع FILES-GUIDE.md) */
/* ---------- Cart ---------- */
function loadCart() {
try {
var raw = localStorage.getItem('hz_cart');
cart = raw ? JSON.parse(raw) : [];
if (!Array.isArray(cart)) cart = [];
} catch (e) { cart = []; }
}
function reverifyPromo() {
clearTimeout(promoT);
if (!promoApplied) return;
promoT = setTimeout(function () {
if (!promoApplied) return;
promoCall(promoApplied.code, function (r) {
if (!r) return;
if (r.ok && r.discount > 0) { if (Number(r.discount) !== promoApplied.discount) { promoApplied.discount = Number(r.discount); renderCart(); } }
else { promoApplied = null; savePromo(); renderCart(); showToast(promoMsg(r)); }
});
}, 700);
}
function saveCart() {
reverifyPromo();
try { localStorage.setItem('hz_cart', JSON.stringify(cart)); } catch (e) {}
}
function cartCount() {
return cart.reduce(function (a, i) { return a + i.qty; }, 0);
}

function calcPricing() {
var units = [];
cart.forEach(function (it) {
var p = toNum(it.price);
for (var i = 0; i < it.qty; i++) units.push(p);
});
units.sort(function (a, b) { return b - a; });
var n = units.length, sub = 0, discount = 0, i = 0;
units.forEach(function (u) { sub += u; });
while (n - i >= 4) {
discount += Math.max(0, units[i] + units[i + 1] + units[i + 2] + units[i + 3] - BUNDLE4);
i += 4;
}
var rest = n - i;
if (rest === 3) discount += Math.max(0, units[i] + units[i + 1] + units[i + 2] - BUNDLE3);
else if (rest === 2) discount += Math.max(0, units[i] + units[i + 1] - BUNDLE2);
var base = sub - discount;
var promo = promoApplied ? Math.min(promoApplied.discount, base) : 0;
var ship = n === 1 ? SHIP_FEE : 0;
return { n: n, sub: sub, discount: discount, promo: promo, ship: ship, total: Math.max(0, base
- promo + ship), last: n ? units[n - 1] : 0 };
}
function updateBadge() {
var b = $('cbadge');
var n = cartCount();
b.textContent = n;
b.style.display = n ? 'flex' : 'none';
}
function showToast(text, ms) {
var t = $('toast');
t.textContent = text;
t.classList[ms ? 'add' : 'remove']('long');
t.classList.add('show');
clearTimeout(toastTimer);
toastTimer = setTimeout(function () { t.classList.remove('show'); }, ms || 1800);
}
function bumpCart() {
var f = $('cartfab');
f.classList.remove('bump');
void f.offsetWidth;
f.classList.add('bump');
}
