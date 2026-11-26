/* FILE: js/36-promo-codes.js
   أكواد الخصم: تطبيق، تحقق، حفظ، واجهة
   (جزء من HoodZilla — بيتحمّل بالترتيب من index.html، والـ global scope مشترك بين كل الملفات. راجع FILES-GUIDE.md) */
/* ---------- Promo codes ---------- */
function savePromo() {
try {
if (promoApplied) localStorage.setItem('hz_promo', promoApplied.code);
else localStorage.removeItem('hz_promo');
} catch (e) {}
}
var promoBusy = false, promoT = null;
function promoCall(code, cb) {
postApi({ type: 'promo', code: code, phone: window.__hzPhone ? window.__hzPhone() : '', items: cart.map(function (i) { return { code: i.code, color: i.color, size: i.size, qty: i.qty }; }) }, cb, 20000);
}
function promoMsg(r) {
if (!r) return '\u062a\u0639\u0630\u0631 \u0627\u0644\u062a\u062d\u0642\u0642\u060c \u062c\u0631\u0628 \u062a\u0627\u0646\u064a';
return { expired: 'الكود ده انتهى', min_qty: 'الكود ده بيشتغل من ' + (r.min || '') + ' قطع', no_stack: 'الكود ده مش بيتجمع مع عروض الكمية', need_phone: 'اكتب رقم تليفونك في بيانات الطلب الأول', not_eligible: 'الكود ده مش متاح لرقمك', used: 'الكود ده اتستخدم قبل كده على رقمك', item: 'في منتج في السلة اتغيّر أو خلص. شيله وضيفه تاني وجرّب الكود', designs: 'في تصميم خاص في السلة محتاج مراجعة. افتحه وعدّله وجرّب تاني' }[r.reason] || T_P_BAD;
}
function restorePromo() {
var c = '';
try { c = localStorage.getItem('hz_promo') || ''; } catch (e) {}
promoApplied = null;
if (!c || !cart.length) return;
promoCall(c, function (r) { if (r && r.ok && r.discount > 0) { promoApplied = { code: r.code, discount: Number(r.discount) }; renderCart(); } });
}
function applyPromo() {
var code = $('pinput').value.trim(), m = $('pmsg');
if (!code || promoBusy) return;
promoBusy = true; m.className = 'pmsg'; m.textContent = 'بنأكد الكود، استنى لحظة...';
promoCall(code, function (r) {
promoBusy = false;
if (r && r.ok && r.discount > 0) { promoApplied = { code: r.code, discount: Number(r.discount) }; savePromo(); $('pinput').value = ''; renderCart(); return; }
m.className = 'pmsg bad'; m.textContent = promoMsg(r);
});
}
function removePromo() {
promoApplied = null;
savePromo();
renderCart();
}
function renderPromoUI() {
var row = $('prow'), m = $('pmsg');
if (promoApplied) {
row.style.display = 'none';
m.className = 'pmsg ok';
m.innerHTML = '';
m.appendChild(el('span', '', T_P_OK + ': ' + promoApplied.code));
var x = el('button', '', '\u00d7'); x.type = 'button';
x.addEventListener('click', removePromo);
m.appendChild(x);
} else {
row.style.display = 'flex';
if (m.className.indexOf('bad') < 0) { m.className = 'pmsg'; m.textContent = ''; }
}
}
$('papply').addEventListener('click', applyPromo);
$('pinput').addEventListener('keydown', function (e) { if (e.key === 'Enter') applyPromo(); });
$('pinput').addEventListener('input', function () { var m = $('pmsg'); if
(m.className.indexOf('bad') > -1) { m.className = 'pmsg'; m.textContent = ''; } });
