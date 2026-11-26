/* FILE: js/65-pwa-service-worker-install-hint.js
   تسجيل sw.js وتلميح الإضافة للشاشة الرئيسية
   (جزء من HoodZilla — بيتحمّل بالترتيب من index.html، والـ global scope مشترك بين كل الملفات. راجع FILES-GUIDE.md) */
(function () {
  /* ===================== PWA: تسجيل الـ service worker + تلميح الإضافة للشاشة الرئيسية ===================== */
  if ('serviceWorker' in navigator && location.protocol.indexOf('http') === 0) window.addEventListener('load', function () { navigator.serviceWorker.register('sw.js').catch(function () {}); });
  var ios = /iphone|ipad|ipod/i.test(navigator.userAgent), standalone = (window.navigator.standalone === true) || (window.matchMedia && matchMedia('(display-mode: standalone)').matches);
  var seen; try { seen = localStorage.getItem('hz_a2hs'); } catch (e) {}
  if (ios && !standalone && !seen) setTimeout(function () {
    var b = document.createElement('div'); b.style.cssText = 'position:fixed;left:10px;right:10px;bottom:12px;z-index:70;background:#241f17;border:1px solid var(--gold);border-radius:14px;padding:12px 40px 12px 14px;color:var(--gold-2);font-size:13px;line-height:1.7;box-shadow:0 10px 40px rgba(0,0,0,.6)';
    b.textContent = 'ضيف الموقع لشاشتك الرئيسية: اضغط زرار المشاركة ثم "Add to Home Screen".';
    var x = document.createElement('button'); x.textContent = '×'; x.style.cssText = 'position:absolute;top:6px;right:8px;background:none;border:0;color:var(--gold-2);font-size:22px;cursor:pointer';
    x.onclick = function () { b.remove(); try { localStorage.setItem('hz_a2hs', '1'); } catch (e) {} }; b.appendChild(x); document.body.appendChild(b);
  }, 9000);
  var dp = null; window.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); dp = e; var hb = document.getElementById('hzhb'); if (!hb || document.getElementById('hzin')) return; var t = document.createElement('button'); t.id = 'hzin'; t.className = 'hzib'; t.type = 'button'; t.setAttribute('data-tip', 'تثبيت التطبيق'); t.innerHTML = '<svg viewBox="0 0 24 24"><path d="M12 3v12M7 10l5 5 5-5M5 21h14"/></svg>'; t.onclick = function () { try { dp.prompt(); } catch (e) {} t.remove(); }; hb.appendChild(t); });
})();
