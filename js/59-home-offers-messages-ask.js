/* FILE: js/59-home-offers-messages-ask.js
   v4 الرئيسية: العروض، رسائل الشيت، اسأل عن توفره
   (جزء من HoodZilla — بيتحمّل بالترتيب من index.html، والـ global scope مشترك بين كل الملفات. راجع FILES-GUIDE.md) */
  /* ===================== v4: الرئيسية (عروض، رسائل، اسأل عن توفره، أيقونات الكروت) ===================== */
  (function () {
    var $$ = function (i) { return document.getElementById(i); }, S = function () { return window.__hzSET || {}; };
    var st = document.createElement('style');
    st.textContent = '.otile{justify-content:space-between;padding:10px 14px}.omid{flex:1;display:flex;flex-direction:column;justify-content:center;gap:1px}.osub{margin-top:auto}' +
      '.ostrip .otile[data-g="1"]{border-color:rgba(216,180,114,.42);background:linear-gradient(135deg,rgba(216,180,114,.13),rgba(216,180,114,.03))}' +
      '.ostrip .otile[data-g="2"]{border-color:rgba(228,192,126,.6);background:linear-gradient(135deg,rgba(228,192,126,.20),rgba(228,192,126,.06))}' +
      '.ostrip .otile[data-g="3"]{border-color:rgba(243,220,166,.82);background:linear-gradient(135deg,rgba(243,220,166,.28),rgba(243,220,166,.10));box-shadow:0 0 18px rgba(243,220,166,.12)}' +
      '.prow{flex-wrap:wrap;row-gap:6px;display:flex;align-items:center;justify-content:space-between;gap:8px}.prow .price{flex:1;min-width:0}.dimp{opacity:.55}.dimo{opacity:.55;pointer-events:none}.fc.dimc{opacity:.45}' +
      '.askb{display:inline-flex;align-items:center;gap:5px;flex:none;padding:5px 10px;border-radius:30px;border:1px solid rgba(216,180,114,.55);background:rgba(216,180,114,.1);color:var(--gold-2);font:700 11px Cairo,sans-serif;cursor:pointer;white-space:nowrap}.askb:hover{background:rgba(216,180,114,.22)}' +
      '.hzspic{left:auto;right:8px}.opill.link{cursor:pointer;font-family:inherit}' +
      '#hzav{position:fixed;inset:0;z-index:95}#hzav .bx{position:fixed;width:min(310px,calc(100vw - 16px));background:var(--panel);border:1px solid var(--gold);border-radius:16px;padding:12px;box-shadow:0 18px 50px rgba(0,0,0,.7);color:var(--ink)}' +
      '#hzav h4{font-size:13px;color:var(--gold-2);margin:0 0 8px;display:flex;justify-content:space-between;align-items:center;gap:8px}#hzav h4 button{background:none;border:0;color:var(--gold-2);font-size:20px;cursor:pointer;line-height:1}' +
      '#hzav .lb{font-size:11px;color:var(--muted);margin:6px 0 4px}#hzav .ch{display:flex;flex-wrap:wrap;gap:6px}#hzav .ch button{padding:5px 12px;border-radius:30px;border:1px solid rgba(216,180,114,.5);background:transparent;color:var(--gold-2);font:700 12px Cairo,sans-serif;cursor:pointer}' +
      '#hzav .ch button.sel{background:var(--gold);color:#1a1408}#hzav .ch button.av{opacity:.4}#hzav .nt{font-size:11px;color:var(--muted);margin:10px 0 6px;min-height:16px}#hzav .go{width:100%;padding:10px;border-radius:12px;border:0;background:#25d366;color:#06240f;font:800 13px Cairo,sans-serif;cursor:pointer}#hzav .go.off{opacity:.4;cursor:not-allowed}' +
      '.askpic{z-index:1}';
    document.head.appendChild(st);
    window.__hzHasOut = function (p) { return !p.inStock || p.colors.some(function (c) { return !c.inStock || c.sizes.some(function (z) { return !z.inStock; }); }); };
    /* رسائل الرئيسية من الشيت */
    function msgs() {
      var box = $$('offers'), s = S(); if (!box || !window.__hzSET || s['رسالة_رئيسية_1_نص'] === undefined) return;
      box.innerHTML = '';
      for (var i = 1; i <= 3; i++) {
        var tx = s['رسالة_رئيسية_' + i + '_نص'], on = String(s['رسالة_رئيسية_' + i + '_تفعيل']);
        if (!tx || on === 'لا') continue;
        var e = document.createElement(i === 3 ? 'button' : 'span'); e.className = 'opill free' + (i === 3 ? ' link' : ''); e.textContent = tx;
        if (i === 3) { e.type = 'button'; e.onclick = function () { var d = $$('hzd3'); if (d) d.click(); }; }
        box.appendChild(e);
      }
    }
    function grad() {
      var t = document.querySelectorAll('#ostrip .otile:not(.promo)'), n = t.length;
      Array.prototype.forEach.call(t, function (e, i) { e.setAttribute('data-g', n > 1 ? Math.round(1 + i * 2 / (n - 1)) : 2); });
    }
    var _a = window.applyData; window.applyData = function () { var r = _a.apply(this, arguments); try { msgs(); grad(); } catch (e) {} return r; };
    var _b = window.buildStrip; if (_b) window.buildStrip = function () { var r = _b.apply(this, arguments); try { grad(); } catch (e) {} return r; };
    try { msgs(); grad(); } catch (e) {}
    /* تلميح أيقونات الكارت بالضغط المطوّل */
    var lp = null;
    document.addEventListener('touchstart', function (e) { var i = e.target.closest && e.target.closest('.hzspic i'); if (!i) return; clearTimeout(lp); lp = setTimeout(function () { showToast(i.getAttribute('title') || ''); }, 450); }, { passive: true });
    ['touchend', 'touchmove', 'touchcancel'].forEach(function (n) { document.addEventListener(n, function () { clearTimeout(lp); }, { passive: true }); });
    /* اسأل عن توفره */
    var curAsk = null;
    function closeAsk() { var o = $$('hzav'); if (o) o.remove(); if (curAsk && curAsk.pic) curAsk.pic.remove(); curAsk = null; window.removeEventListener('scroll', onSc, true); }
    function onSc(e) { var o = $$('hzav'); if (o && e.target && o.contains(e.target)) return; closeAsk(); }
    window.__hzAsk = function (p, card, btn) {
      closeAsk();
      var o = document.createElement('div'); o.id = 'hzav'; o.addEventListener('click', function (e) { if (e.target === o) closeAsk(); });
      var bx = document.createElement('div'); bx.className = 'bx'; o.appendChild(bx);
      var named = p.colors.some(function (c) { return c.name; }), selC = null, selZ = null; curAsk = { pic: null };
      function draw() {
        var h = '<h4><span>' + p.name.replace(/</g, '&lt;') + '</span><button type="button" id="hzakx">×</button></h4>';
        if (named) { h += '<div class="lb">اللون</div><div class="ch">' + p.colors.map(function (c, i) { return '<button type="button" data-c="' + i + '" class="' + (selC === c ? 'sel' : '') + (c.sizes.every(function (z) { return z.inStock; }) ? ' av' : '') + '">' + c.name.replace(/</g, '&lt;') + '</button>'; }).join('') + '</div>'; }
        if (selC || !named) { var cc = selC || p.colors[0]; h += '<div class="lb">المقاس</div><div class="ch">' + cc.sizes.map(function (z, i) { return '<button type="button" data-z="' + i + '" class="' + (selZ === z ? 'sel' : '') + (z.inStock ? ' av' : '') + '">' + z.size + '</button>'; }).join('') + '</div>'; }
        var ready = (!named || selC) && selZ;
        h += '<div class="nt">' + (ready ? 'هنبعت رسالة على واتساب نسأل عن توفر ' + (selC && selC.name ? selC.name + ' - ' : '') + selZ.size : 'حدد اللون والمقاس الأول') + '</div><button type="button" class="go' + (ready ? '' : ' off') + '" id="hzago">ابعت على واتساب</button>';
        bx.innerHTML = h;
        bx.querySelector('#hzakx').onclick = closeAsk;
        Array.prototype.forEach.call(bx.querySelectorAll('[data-c]'), function (b) { b.onclick = function () {
          var c = p.colors[+b.getAttribute('data-c')];
          if (c.sizes.every(function (z) { return z.inStock; })) { showToast('اللون ده متوفر أصلاً، تقدر تطلبه من الموقع'); return; }
          selC = c; selZ = null; showPic(c); draw(); }; });
        Array.prototype.forEach.call(bx.querySelectorAll('[data-z]'), function (b) { b.onclick = function () {
          var z = (selC || p.colors[0]).sizes[+b.getAttribute('data-z')];
          if (z.inStock) { showToast('المقاس ده متوفر أصلاً، تقدر تطلبه من الموقع'); return; }
          selZ = z; draw(); }; });
        var go = bx.querySelector('#hzago'); go.onclick = function () {
          if (!ready) { showToast('حدد اللون والمقاس الأول'); return; }
          var cn = (selC && selC.name) || '', msg = 'مرحباً ' + BRAND + '، عايز أسأل عن توفر: ' + p.name + ' (' + dcode(p.code) + ')' + (cn ? ' - اللون: ' + cn : '') + ' - المقاس: ' + selZ.size;
          try { postApi({ type: 'avail', anon: true, code: p.code, name: p.name, color: cn, size: selZ.size }, function () {}, 15000); } catch (e) {}
          if (WHATSAPP) window.open('https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(msg), '_blank');
          closeAsk();
        };
      }
      function showPic(c) {
        if (curAsk.pic) { curAsk.pic.remove(); curAsk.pic = null; }
        var w = card && card.querySelector('.imgwrap'); if (!w || !c.imageId) return;
        var im = makeImg(c.imageId, IMG_W, c.name); im.className = 'on askpic'; w.appendChild(im); im.load(); curAsk.pic = im;
      }
      document.body.appendChild(o); draw();
      var r = card.getBoundingClientRect(), W = Math.min(310, innerWidth - 16), H = bx.offsetHeight;
      bx.style.left = Math.max(8, Math.min(r.left + (r.width - W) / 2, innerWidth - W - 8)) + 'px';
      bx.style.top = Math.max(8, Math.min(r.bottom - H - 8, innerHeight - H - 8)) + 'px';
      setTimeout(function () { if (curAsk) window.addEventListener('scroll', onSc, true); }, 500);
    };
  })();
