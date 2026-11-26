/* FILE: js/24-core-dom-utils.js
   دوال أساسية: $ و dcode و el و toNum و fmt و shuffle و splitDesc
   (جزء من HoodZilla — بيتحمّل بالترتيب من index.html، والـ global scope مشترك بين كل الملفات. راجع FILES-GUIDE.md) */
function $(id) { return document.getElementById(id); }
function dcode(c) { return CODE_PREFIX + c; }
function el(tag, cls, text) {
var e = document.createElement(tag);
if (cls) e.className = cls;
if (text !== undefined) e.textContent = text;
return e;
}
function toNum(v) {
var n = parseFloat(String(v).replace(/[^\d.,]/g, '').replace(',', '.'));
return isNaN(n) ? 0 : n;
}
function fmt(n) { return String(Math.round(n * 100) / 100); }
function shuffle(a) {
for (var i = a.length - 1; i > 0; i--) {
var j = Math.floor(Math.random() * (i + 1));
var t = a[i]; a[i] = a[j]; a[j] = t;
}
return a;
}

function splitDesc(s) {
s = String(s || '');
s = s.replace(/(\d)\.(\d)/g, '$1\u0001$2').replace(/(\d),(\d)/g, '$1\u0002$2');
return s.split(/[\u060c,.|;\n]+/).map(function (x) {
return x.replace(/\u0001/g, '.').replace(/\u0002/g, ',').trim();
}).filter(function (x) { return x.length > 0; });
}
