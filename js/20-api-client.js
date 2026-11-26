/* FILE: js/20-api-client.js
   رابط الـ API (Google Apps Script) ودالة postApi
   (جزء من HoodZilla — بيتحمّل بالترتيب من index.html، والـ global scope مشترك بين كل الملفات. راجع FILES-GUIDE.md) */
var API_URL = 'https://script.google.com/macros/s/AKfycbw5pl33_CMKXgk694ZYlbfHe9Wd6glaslerrY3K1JZQ1qp6qgvLcYiSdjmHsfDVkarwiA/exec';
function postApi(obj, cb, ms) {
  var done = false, ctl = window.AbortController ? new AbortController() : null;
  var t = setTimeout(function () { if (done) return; done = true; try { if (ctl) ctl.abort(); } catch (e) {} if (obj && obj.type !== 'cerr' && obj.type !== 'vw') window.hzReport('api-timeout', obj.type + ' بعد ' + Math.round((ms || 30000) / 1000) + ' ث'); cb(null); }, ms || 30000);
  try {
    fetch(API_URL, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(obj), signal: ctl ? ctl.signal : undefined })
      .then(function (r) { return r.json(); })
      .then(function (j) { if (done) return; done = true; clearTimeout(t); cb(j); })
      .catch(function (er) { if (done) return; done = true; clearTimeout(t); if (obj && obj.type !== 'cerr' && obj.type !== 'vw') window.hzReport('api-fail', obj.type + ': ' + (er && er.message ? er.message : 'network')); cb(null); });
  } catch (e) { if (!done) { done = true; clearTimeout(t); cb(null); } }
}
