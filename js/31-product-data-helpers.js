/* FILE: js/31-product-data-helpers.js
   دوال بيانات المنتج: imgColors, cardImgs, allSizes, cardPrice
   (جزء من HoodZilla — بيتحمّل بالترتيب من index.html، والـ global scope مشترك بين كل الملفات. راجع FILES-GUIDE.md) */
function imgColors(p) {
var a = p.colors.filter(function (c) { return c.imageId && c.inStock; });
if (!a.length) a = p.colors.filter(function (c) { return c.imageId; });
return a;
}

function cardImgs(p) {
if (p._imgs) return p._imgs;
var out = [], seen = {};
imgColors(p).forEach(function (c) {
if (!seen[c.imageId]) { seen[c.imageId] = true; out.push({ id: c.imageId, alt: p.name + ' ' +
c.name }); }
});
(p.gallery || []).forEach(function (id) {
if (!seen[id]) { seen[id] = true; out.push({ id: id, alt: p.name }); }
});
p._imgs = shuffle(out);
return p._imgs;
}
function allSizes(p) {
var order = [], map = {};
p.colors.forEach(function (c) {
c.sizes.forEach(function (s) {
if (!s.size) return;
if (!map[s.size]) { map[s.size] = { size: s.size, inStock: false }; order.push(s.size); }
if (s.inStock) map[s.size].inStock = true;
});
});
return order.map(function (k) { return map[k]; });
}
function cardPrice(p) {
var all = [];
p.colors.forEach(function (c) { c.sizes.forEach(function (s) { all.push(s); }); });
var pool = all.filter(function (s) { return s.inStock; });
if (!pool.length) pool = all;
var min = null, txt = '', differ = false, was = 0;
pool.forEach(function (s) {
var n = toNum(s.price);
if (min === null) { min = n; txt = s.price; was = s.was || 0; }
else { if (n !== min) differ = true; if (n < min) { min = n; txt = s.price; was = s.was || 0; } }
});
return { value: min === null ? 0 : min, text: txt, differ: differ, was: (was > min ? was : 0) };
}
