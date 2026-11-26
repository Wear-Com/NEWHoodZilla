/* FILE: js/34-deeplink-history-share.js
   اللينكات المباشرة #p-كود وزر الرجوع (history) ومشاركة المنتج
   (جزء من HoodZilla — بيتحمّل بالترتيب من index.html، والـ global scope مشترك بين كل الملفات. راجع FILES-GUIDE.md) */
/* ---------- Direct links + back button ---------- */
function setHash(code) {
try { history.replaceState(history.state, '', location.pathname + location.search + '#p-' +
encodeURIComponent(code)); } catch (e) {}
}
function clearHash() {
try { history.replaceState(history.state, '', location.pathname + location.search); } catch (e) {}
}
function pushLayer(kind, hash) {
try { history.pushState({ hz: kind }, '', location.pathname + location.search + (hash || '')); }
catch (e) {}
}
function openFromHash() {
var m = /^#p-(.+)$/.exec(location.hash || '');
if (!m) return;
var code;
try { code = decodeURIComponent(m[1]); } catch (e) { return; }
for (var i = 0; i < ALL.length; i++) {
if (ALL[i].code === code) { clearHash(); openModal(ALL[i]); return; }
}
}

window.addEventListener('popstate', function () {
if (window.__skipPop) { window.__skipPop = false; return; }
var __pd = document.getElementById('hzpd'); if (__pd && __pd.classList.contains('open')) return;
if (window.__s2 && $('cart').classList.contains('open')) { window.__s2 = false; if (window.__s2back) window.__s2back(); return; }
if ($('cart').classList.contains('open')) closeCart(true);
else if ($('modal').classList.contains('open')) closeModal(true);
});
function shareProduct() {
if (!curProduct) return;
var url = location.href.split('#')[0] + '#p-' + encodeURIComponent(curProduct.code);
if (navigator.share) {
navigator.share({ title: curProduct.name + ' - ' + BRAND, url: url }).catch(function () {});
return;
}
function fallback() { try { window.prompt('', url); } catch (e) {} }
if (navigator.clipboard && navigator.clipboard.writeText) {
navigator.clipboard.writeText(url).then(function () { showToast(T_COPIED); }, fallback);
} else {
fallback();
}
}
$('mshare').addEventListener('click', shareProduct);
