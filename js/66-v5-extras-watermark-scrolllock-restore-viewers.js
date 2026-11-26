/* FILE: js/66-v5-extras-watermark-scrolllock-restore-viewers.js
   v5: علامة مائية، قفل السكرول، استرجاع الصفحة، عدّاد المشاهدين، خصّص قطعتك، لمعة التلميحات
   (جزء من HoodZilla — بيتحمّل بالترتيب من index.html، والـ global scope مشترك بين كل الملفات. راجع FILES-GUIDE.md) */
/* ===================== v5: علامة مائية + قفل سكرول + حفظ الصفحة + مشاهدين حقيقيين + خصّص قطعتك + شاشة البداية ===================== */
(function () {
  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function S() { return window.__hzSET || {}; }
  function isEn() { return lsGet('hz_lang') === 'en'; }
  /* ---- أصول الموقع (لوجو/علامة مائية): بيدوّر png وبعدها jpg وjpeg وwebp وبيفتكر اللي لقاه ---- */
  var ASSET_EXT = ['png', 'jpg', 'jpeg', 'webp'], ASSET_MEMO = {};
  function findAsset(name, cb) {
    if (ASSET_MEMO[name] !== undefined) return cb(ASSET_MEMO[name]);
    var i = 0;
    (function next() {
      if (i >= ASSET_EXT.length) { ASSET_MEMO[name] = ''; return cb(''); }
      var u = 'Assets/' + name + '.' + ASSET_EXT[i++], im = new Image();
      im.onload = function () { ASSET_MEMO[name] = u; cb(u); };
      im.onerror = next;
      im.src = u;
    })();
  }
  /* ---- شعار الكلمة في الهيدر (لو الملف موجود، وإلا بيفضل النص) ---- */
  (function () {
    var b = document.getElementById('brand'); if (!b) return;
    findAsset('logo_wordmark', function (u) { if (!u) return; var im = new Image(); im.onload = function () { b.textContent = ''; im.className = 'brandimg'; im.alt = BRAND; b.appendChild(im); b.classList.add('hasimg'); }; im.src = u; });
  })();
  /* ---- شاشة البداية (جوه التطبيق المتثبت بس) ---- */
  (function () {
    var bt = document.getElementById('hzboot'); if (!bt) return;
    var kill = function () { if (!bt.parentNode) return; bt.style.opacity = '0'; setTimeout(function () { if (bt.parentNode) bt.remove(); }, 450); };
    window.addEventListener('load', function () { setTimeout(kill, 700); });
    setTimeout(kill, 3500);
  })();
  /* ---- علامة مائية على الصور (من الشيت: علامة_مائية_شغالة / علامة_مائية_نوع) ---- */
  function wmApply() {
    var s = S(), on = s['علامة_مائية_شغالة'] === 'نعم', pat = s['علامة_مائية_نوع'] === 'نمط';
    document.body.classList.toggle('hzwm', on); document.body.classList.toggle('hzwm-pat', on && pat);
    if (!on) return;
    findAsset('watermark_corner', function (u) { if (u) document.documentElement.style.setProperty('--hzwm-c', 'url("' + u + '")'); });
    if (pat) findAsset('watermark_pattern', function (u) { if (u) document.documentElement.style.setProperty('--hzwm-p', 'url("' + u + '")'); });
    var hosts = Array.prototype.slice.call(document.querySelectorAll('.imgwrap, #mpic, .hzspg .pc .im'));
    Array.prototype.forEach.call(document.querySelectorAll('#banner img'), function (i) { if (i.parentNode && hosts.indexOf(i.parentNode) < 0) hosts.push(i.parentNode); });
    hosts.forEach(function (c) { if (!c.querySelector(':scope > i.hzwmk')) { var i = document.createElement('i'); i.className = 'hzwmk'; c.appendChild(i); } });
  }
  var wmT = null; function wmSoon() { clearTimeout(wmT); wmT = setTimeout(wmApply, 120); }
  /* ---- قفل سكرول الخلفية لما أي بوكس يتفتح ---- */
  var LOCKQ = '#modal.open,#cart.open,.hzo.open,#hzdr.open,#hzspg.open,#hzav,.hzpd.open,.hzsp.open,.hzzoom.open', locked = false, sy = 0, lockT = null;
  function syncLock() {
    var any = !!document.querySelector(LOCKQ), b = document.body;
    if (any && !locked) { locked = true; sy = window.pageYOffset || document.documentElement.scrollTop || 0; b.style.top = (-sy) + 'px'; b.classList.add('hzlock'); document.documentElement.classList.add('hzlock'); }
    else if (!any && locked) { locked = false; b.classList.remove('hzlock'); document.documentElement.classList.remove('hzlock'); b.style.top = ''; window.scrollTo(0, sy); }
  }
  function lockSoon() { if (lockT) return; lockT = requestAnimationFrame(function () { lockT = null; syncLock(); }); }
  new MutationObserver(function () { lockSoon(); wmSoon(); try { moveAsk(); } catch (e) {} }).observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ['class'] });
  /* ---- رجوع لنفس الصفحة بعد ريلود أو غياب (آخر 30 دقيقة) ---- */
  var KEY = 'hz_state2';
  function curView() {
    var m = document.getElementById('modal'), c = document.getElementById('cart'), a = document.getElementById('hztr');
    if (m && m.classList.contains('open') && window.curProduct) return { v: 'modal', code: curProduct.code };
    if (c && c.classList.contains('open')) return { v: 'cart' };
    if (a && a.classList.contains('open')) return { v: 'account' };
    return { v: '' };
  }
  function saveState() { try { var s = curView(); s.t = Date.now(); s.y = locked ? sy : (window.pageYOffset || 0); localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {} }
  window.addEventListener('pagehide', saveState); document.addEventListener('visibilitychange', function () { if (document.hidden) saveState(); });
  setInterval(saveState, 4000);
  var restored = false;
  function restore() {
    if (restored || !window.ALL || !ALL.length) return; restored = true;
    var st = null; try { st = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) {}
    if (!st || Date.now() - st.t > 30 * 60000) return;
    setTimeout(function () {
      if (st.y) window.scrollTo(0, st.y);
      if (st.v === 'modal') { var p = null; ALL.forEach(function (x) { if (x.code === st.code) p = x; }); if (p) openModal(p); }
      else if (st.v === 'cart') { if (cart.length) openCart(); }
      else if (st.v === 'account') { var b = document.getElementById('hzab'); if (b) b.click(); }
    }, 350);
  }
  /* ---- عدّاد المشاهدين الحقيقي (زوار فاتحين نفس الكارت) ---- */
  var vw = { t: null, p: null }, SID = lsGet('hz_sid') || (function () { var s = Math.random().toString(36).slice(2, 12); lsSet('hz_sid', s); return s; })();
  function vwOn() { return S()['عداد_المشاهدين_شغال'] !== 'لا'; }
  function vwShow(n) {
    var host = document.getElementById('mpic'); if (!host) return;
    var el = document.getElementById('hzvw'), min = parseInt(S()['عداد_المشاهدين_أقل_عدد'], 10) || 3;
    if (n < min) { if (el) el.remove(); return; }
    if (!el) { el = document.createElement('div'); el.id = 'hzvw'; el.className = 'hzvw'; host.appendChild(el); }
    var low = false; if (vw.p) vw.p.colors.forEach(function (c) { c.sizes.forEach(function (z) { if (szLow(z)) low = true; }); });
    el.innerHTML = '<span class="hzvwr"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg><b>' + n + '</b> ' + (isEn() ? 'viewing this now' : 'بيشاهدوه المنتج دلوقتي') + '</span>' + (low ? '<small>' + (isEn() ? 'Hurry before someone else orders it' : 'الحق قبل ما غيرك يطلب') + '</small>' : '');
  }
  function vwPing(leave) {
    if (!vw.p) return;
    postApi({ type: 'vw', code: vw.p.code, sid: SID, leave: leave ? 1 : 0 }, function (r) { if (!leave && r && r.ok && vw.p) vwShow(r.n || 0); }, 8000);
  }
  function vwStart(p) { vwStop(); if (!vwOn()) return; vw.p = p; setTimeout(function () { vwPing(false); }, 800); vw.t = setInterval(function () { if (!document.hidden) vwPing(false); }, 45000); }
  function vwStop() { if (vw.t) { clearInterval(vw.t); vw.t = null; } if (vw.p) { vwPing(true); vw.p = null; } var e = document.getElementById('hzvw'); if (e) e.remove(); }
  var _om5 = openModal; openModal = function (p) { var r = _om5.apply(this, arguments); try { vwStart(p); var q = document.getElementById('qrow'), pr = document.getElementById('mprice'); if (q && pr && q.nextSibling !== pr) q.parentNode.insertBefore(pr, q.nextSibling); } catch (e) {} return r; };
  var _cm5 = closeModal; closeModal = function () { try { vwStop(); } catch (e) {} return _cm5.apply(this, arguments); };
  /* ---- خصّص قطعتك: الجملة التالتة في الهيدر بتفتح اختيار (مقاس مخصص / طباعة خاصة) ---- */
  function customSheet() {
    var o = document.getElementById('hzcus'); if (o) o.remove();
    o = document.createElement('div'); o.id = 'hzcus'; o.className = 'hzo open';
    var cs = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 17l14-14 4 4L7 21H3z"/><path d="M13 7l4 4M9 11l2 2M6 14l2 2"/></svg>';
    var cp = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3L3 6l2.5 3.5L8 8.5V21h8V8.5l2.5 1L21 6l-5-3c-.6 1.6-2 2.4-4 2.4S8.6 4.6 8 3z"/></svg>';
    o.innerHTML = '<div class="hzs hzcusb"><h3><span>' + (isEn() ? 'Customise your piece your way' : 'خصّص قطعتك على ذوقك') + '</span><button class="hzx" type="button" aria-label="close"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button></h3><div class="hzcusg"><button type="button" data-k="sz">' + cs + '<b>' + (isEn() ? 'Custom size' : 'مقاس مخصص') + '</b><small>' + (isEn() ? 'Your exact measurements' : 'مقاسك بالظبط') + '</small></button><button type="button" data-k="pr">' + cp + '<b>' + (isEn() ? 'Custom printing' : 'طباعة خاصة') + '</b><small>' + (isEn() ? 'Upload your design' : 'ارفع تصميمك') + '</small></button></div></div>';
    document.body.appendChild(o);
    var close = function () { o.remove(); };
    o.addEventListener('click', function (e) { if (e.target === o) close(); }); o.querySelector('.hzx').onclick = close;
    Array.prototype.forEach.call(o.querySelectorAll('[data-k]'), function (b) { b.onclick = function () { close(); var d = document.getElementById(b.getAttribute('data-k') === 'sz' ? 'hzd2' : 'hzd3'); if (d) d.click(); }; });
  }
  function hookChip() {
    var b = document.querySelector('#offers button.link'); if (!b || b._hz5) return; b._hz5 = 1;
    b.onclick = null; b.addEventListener('click', function (e) { e.preventDefault(); customSheet(); });
    if (!b.querySelector('.hzchev')) { var c = document.createElement('i'); c.className = 'hzchev'; c.innerHTML = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 6l-6 6 6 6"/></svg>'; b.appendChild(c); }
    if (S()['تلميحات_الضغط'] !== 'لا') b.classList.add('hzhint');
  }
  /* ---- بوكس كود الخصم في العروض: يفتح السلة ويظلل خانة الكود ---- */
  document.addEventListener('click', function (e) {
    var t = e.target.closest && e.target.closest('.otile.promo'); if (!t) return;
    if (!cart.length) { showToast(isEn() ? 'Choose products first' : 'اختار منتجات الأول'); return; }
    openCart(); setTimeout(function () { var i = document.getElementById('pinput'); if (i) { HZ.guide(i.parentNode || i, ''); try { i.focus({ preventScroll: true }); } catch (x) {} } }, 380);
  });
  Array.prototype.forEach.call(document.querySelectorAll('#strip .otile'), function () {});
  /* تلميحات الضغط: لمعة ذهبيه مستمرة خفيفه على العناصر اللي ينفع تتداس (بتتقفل من الشيت) */
  function moveAsk() {
    Array.prototype.forEach.call(document.querySelectorAll('#grid .card.soldout'), function (c) {
      var b = c.querySelector('.askb'), bd = c.querySelector('.imgwrap .badge'); if (!b || !bd || b.classList.contains('askbadge')) return;
      var sn = bd.classList.contains('soonx');
      b.classList.add('askbadge', 'badge'); b.classList.remove('askb'); bd.replaceWith(b);
      if (sn) { var iw = c.querySelector('.imgwrap'); if (iw && !iw.querySelector('.soonb')) { var sp = document.createElement('div'); sp.className = 'soonb'; sp.textContent = 'جاي قريب'; iw.appendChild(sp); } }
    });
  }
  function hints() {
    var on = S()['تلميحات_الضغط'] !== 'لا';
    document.body.classList.toggle('hzhints', on);
    Array.prototype.forEach.call(document.querySelectorAll('.otile.promo'), function (t) { t.classList.toggle('hzhint', on); });
  }
  var _ad5 = window.applyData; window.applyData = function () { var r = _ad5.apply(this, arguments); try { hookChip(); hints(); wmApply(); restore(); moveAsk(); } catch (e) {} return r; };
  try { hookChip(); hints(); wmApply(); } catch (e) {}
  setTimeout(function () { try { hookChip(); hints(); wmApply(); restore(); moveAsk(); } catch (e) {} }, 1500);
})();
