/* FILE: js/99-start-app.js
   نقطة البداية start(): قراءة الكاش وتشغيل fetchData
   (جزء من HoodZilla — بيتحمّل بالترتيب من index.html، والـ global scope مشترك بين كل الملفات. راجع FILES-GUIDE.md) */
(function start() {
var c = readCache();
if (c && c.products && c.products.length) applyData(c, true);
else showSkeleton();
fetchData();
})();
