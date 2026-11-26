/* FILE: js/38-cart-add-edit-remove.js
   إضافة/تعديل/حذف عناصر السلة
   (جزء من HoodZilla — بيتحمّل بالترتيب من index.html، والـ global scope مشترك بين كل الملفات. راجع FILES-GUIDE.md) */
function addToCart() {
if (!curProduct || !curColor || !curSize) return;
var key = [curProduct.code, curColor.name || '', curSize.size || ''].join('|');
var found = null;
for (var i = 0; i < cart.length; i++) { if (cart[i].key === key) { found = cart[i]; break; } }
if (found) {
found.qty = Math.min(99, found.qty + modalQty);
} else {
var imgId = curColor.imageId || curProduct.main || '';
if (!imgId) {
for (var k = 0; k < curProduct.colors.length; k++) {
if (curProduct.colors[k].imageId) { imgId = curProduct.colors[k].imageId; break; }
}
}
cart.push({
key: key, code: curProduct.code, name: curProduct.name,
color: curColor.name || '', size: curSize.size || '',
price: curSize.price, imageId: imgId, qty: modalQty
});
}
saveCart();
updateBadge();
bumpCart();
track('AddToCart', { content_ids: [curProduct.code], content_name: curProduct.name,
content_type: 'product', value: toNum(curSize.price) * modalQty, currency: 'EGP' });
closeModal();
showToast(T_ADDED);
}
$('madd').addEventListener('click', addToCart);
function maxFor(it) {
for (var a = 0; a < ALL.length; a++) { if (ALL[a].code !== it.code) continue; var cs = ALL[a].colors; for (var b = 0; b < cs.length; b++) { if (cs[b].name !== it.color) continue; for (var c = 0; c < cs[b].sizes.length; c++) { var z = cs[b].sizes[c]; if (z.size === it.size) return z.max == null ? 99 : z.max; } } }
return 99;
}
function varQty(it) { var t = 0; cart.forEach(function (x) { if (x.code === it.code && x.color === it.color && x.size === it.size) t += x.qty; }); return t; }
function changeQty(item, d) {
if (d > 0 && varQty(item) >= maxFor(item)) { showToast('دي أقصى كمية متاحة'); return; }
item.qty += d;
if (item.qty > 99) item.qty = 99;
if (item.qty <= 0) removeItem(item); else { saveCart(); renderCart(); updateBadge(); }
}
function removeItem(item) {
var idx = cart.indexOf(item);
cart = cart.filter(function (x) { return x !== item; });
saveCart();
renderCart();
updateBadge();
if (idx > -1) HZ.undoBar(item, idx);
}
/* تعديل منتج من السلة: بنفتح كارت المنتج بنفس اللون والمقاس والكمية والمقاس المخصص/الطباعة، وزرار الإضافة بيبقى "تحديث" */
function editCartItem(it) {
var p = null; ALL.forEach(function (x) { if (x.code === it.code) p = x; });
if (!p) { showToast('المنتج ده مبقاش متاح'); return; }
closeCart();
setTimeout(function () {
openModal(p);
var c = null; p.colors.forEach(function (x) { if ((x.name || '') === (it.color || '')) c = x; });
if (c) { selectColor(c, true); var s = null; c.sizes.forEach(function (z) { if (z.size === it.size) s = z; }); if (s && s.inStock) { curSize = s; renderSizes(); } }
HZ.edit = it; if (window.__hzCxSet) window.__hzCxSet(it.cx);
modalQty = Math.max(1, Math.min(99, it.qty)); $('mqty').textContent = modalQty;
updateInfo();
}, 140);
}
