/* FILE: js/41-data-loading.js
   تحميل بيانات الكتالوج (JSONP) والكاش وإعادة المحاولة
   (جزء من HoodZilla — بيتحمّل بالترتيب من index.html، والـ global scope مشترك بين كل الملفات. راجع FILES-GUIDE.md) */
/* ---------- Loading data (patient on slow internet, remembers the last good copy) ---------- */
var CACHE_KEY = 'hz_data_v3';
var lastStr = '';
var inFlight = false;
var attempts = 0;
var jsonpSeq = 0;
function readCache() {
try {
var raw = localStorage.getItem(CACHE_KEY);
return raw ? JSON.parse(raw) : null;
} catch (e) { return null; }
}
function writeCache(str) {
try { localStorage.setItem(CACHE_KEY, str); } catch (e) {}
}
function applyData(data, fromCache) {
var str = JSON.stringify({ products: data.products || [], promos: data.promos || [], s: data.settings || {}, o: data.offers || {}, z: data.sizes || [], p: data.policies || [] });
if (str === lastStr) return;
lastStr = str;
ALL = data.products || [];
PROMOS = data.promos || [];
restorePromo();
render();
buildBanner();
buildStrip();
if (!hashHandled) { hashHandled = true; openFromHash(); }
if (!fromCache) writeCache(JSON.stringify(data));
}
function showSlow() {
if (!ALL.length) $('msg').textContent = T_SLOW;
}
function showError() {
$('grid').innerHTML = '';
var msg = $('msg');
msg.innerHTML = '';
msg.appendChild(document.createTextNode(T_ERR));
msg.appendChild(document.createElement('br'));
var b = el('button', '', T_RETRY);
b.addEventListener('click', function () { attempts = 0; showSkeleton(); fetchData(); });
msg.appendChild(b);
}

function retryLater() {
attempts++;
if (!ALL.length) {
if (navigator.onLine === false || attempts >= 8) showError(); else showSlow();
}
setTimeout(fetchData, Math.min(12000, 2000 * attempts));
}
function fetchData() {
if (inFlight) return;
inFlight = true;
var name = 'cb_' + (++jsonpSeq) + '_' + Date.now();
var done = false;
var s = document.createElement('script');
function cleanup() {
done = true;
inFlight = false;
clearTimeout(timer);
try { delete window[name]; } catch (e) { window[name] = undefined; }
if (s.parentNode) s.parentNode.removeChild(s);
}
window[name] = function (data) {
if (done) return;
cleanup();
if (!data || !data.ok) { retryLater(); return; }
attempts = 0;
applyData(data, false);
};

var timer = setTimeout(function () {
if (done) return;
cleanup();
retryLater();
}, 60000);
s.onerror = function () {
if (done) return;
cleanup();
retryLater();
};
if (attempts >= 2 && window.fetch) {
// بديل لو تحميل السكريبت بيفشل على بعض المتصفحات
cleanup();
inFlight = true;
fetch(API_URL + '?what=catalog').then(function (r) { return r.json(); }).then(function (d) {
inFlight = false;
if (!d || !d.ok) { retryLater(); return; }
attempts = 0; applyData(d, false);
}).catch(function () { inFlight = false; retryLater(); });
return;
}
s.src = API_URL + '?callback=' + name;
document.body.appendChild(s);

setTimeout(function () { if (inFlight && !ALL.length) showSlow(); }, 6000);
}
window.addEventListener('online', function () {
if (!ALL.length) { attempts = 0; showSkeleton(); fetchData(); }
});
