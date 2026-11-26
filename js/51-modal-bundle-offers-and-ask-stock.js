/* FILE: js/51-modal-bundle-offers-and-ask-stock.js
   شريط علوي من الشيت + بكسلات من الإعدادات + عروض القطع داخل النافذة + اسأل عن التوفر
   (جزء من HoodZilla — بيتحمّل بالترتيب من index.html، والـ global scope مشترك بين كل الملفات. راجع FILES-GUIDE.md) */
(function () {
  var OF = {}, SS = {}, OUT = {}, $$ = function (i) { return document.getElementById(i); };
  function N(v) { var n = parseFloat(v); return isNaN(n) ? 0 : n; }

  function pxbar(s) {
    if (s.META_PIXEL_ID) META_PIXEL_ID = String(s.META_PIXEL_ID); if (s.TIKTOK_PIXEL_ID) TIKTOK_PIXEL_ID = String(s.TIKTOK_PIXEL_ID); if (s.GA_ID) GA_ID = String(s.GA_ID); initPixels();
    var tx = s['نص_الشريط'], ex = s['ينتهي_في']; if (!tx || $$('hzbar') || (ex && new Date(ex) < new Date())) return;
    var b = el('div'); b.id = 'hzbar'; b.style.cssText = 'background:linear-gradient(135deg,#f3dca6,#d8b472);color:#1a1408;font-weight:700;font-size:13px;text-align:center;padding:8px 36px;position:relative'; b.textContent = tx;
    var x = el('button', '', '×'); x.style.cssText = 'position:absolute;left:8px;top:2px;background:none;border:0;font-size:20px;cursor:pointer'; x.onclick = function () { b.remove(); };
    b.appendChild(x); document.body.insertBefore(b, document.body.firstChild);
  }
  var _ap = applyData;
  applyData = function (d, f) {
    OF = d.offers || {}; SS = d.settings || {}; OUT = {}; pxbar(SS);
    (d.products || []).forEach(function (p) {
      var ins = {};
      p.colors.forEach(function (c) { if (c.imageId && c.inStock) ins[c.imageId] = 1; });
      p.colors.forEach(function (c) { if (c.imageId && !c.inStock && !ins[c.imageId]) OUT[c.imageId] = 1; });
      if (!p.inStock) { (p.gallery || []).forEach(function (id) { OUT[id] = 1; }); p.colors.forEach(function (c) { if (c.imageId) OUT[c.imageId] = 1; }); if (p.main) OUT[p.main] = 1; }
    });
    _ap(d, f);
  };

  var css = document.createElement('style');
  css.textContent = '#mpic.outnow::after{content:"نفذ";position:absolute;bottom:12px;right:12px;z-index:3;font-size:13px;font-weight:800;color:#fff;background:rgba(229,107,88,.95);padding:4px 16px;border-radius:30px}.hzt{width:100%;text-align:center;border-top:1px dashed rgba(216,180,114,.3);padding-top:8px;margin-top:2px}.hzvcb{display:inline-flex;align-items:center;justify-content:center;gap:8px}.hzvcb svg{width:18px;height:18px;flex:none;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}.opt.out{cursor:pointer}.ochip.hit{background:linear-gradient(135deg,var(--gold-2),var(--gold));color:#1a1408;border-color:var(--gold)}.hzt{font-size:19px;font-weight:900;color:var(--gold-2)}.hzm{font-size:12px;font-weight:700;color:var(--muted)}.hzm a{color:var(--gold-2)}.hzrow{display:flex;gap:8px}.hzrow .btn{width:auto;flex:1}#hzvc{flex:0 0 auto;display:none;background:transparent;border:1px solid var(--gold);color:var(--gold-2)}.hzask{background:transparent;border:1px solid var(--gold);color:var(--gold-2);display:none}#hzpan{display:none;flex-direction:column;gap:8px}#hzpan input{padding:10px 12px;border-radius:10px;border:1px solid rgba(216,180,114,.25);background:var(--panel);color:var(--ink);font-family:inherit;font-size:16px;direction:ltr}';
  document.head.appendChild(css);

  // كل ألوان المنتج في صور الكارت (حتى النافذ) + شارة "نفذ" تتبع الصورة الظاهرة
  cardImgs = function (p) {
    if (p._imgs) return p._imgs;
    var out = [], seen = {};
    p.colors.forEach(function (c) { if (c.imageId && !seen[c.imageId]) { seen[c.imageId] = 1; out.push({ id: c.imageId, alt: p.name + ' ' + c.name }); } });
    (p.gallery || []).forEach(function (id) { if (!seen[id]) { seen[id] = 1; out.push({ id: id, alt: p.name }); } });
    p._imgs = shuffle(out); return p._imgs;
  };

  function pieces(p) { var n = 0; cart.forEach(function (i) { if (i.code === p.code) n += i.qty; }); return n; }
  function sumP(p) { var s = 0; cart.forEach(function (i) { if (i.code === p.code) s += toNum(i.price) * i.qty; }); return s; }
  function vq() { var n = 0; cart.forEach(function (i) { if (i.code === curProduct.code && i.color === (curColor.name || '') && i.size === (curSize.size || '')) n += i.qty; }); return n; }
  function room() { if (!curColor || !curSize || !curSize.inStock) return 0; return Math.max(0, (curSize.max == null ? 99 : curSize.max) - vq()); }
  function tier(code, n) { return (OF[code] || []).filter(function (x) { return x.n <= n; }).sort(function (a, b) { return b.n - a.n; })[0] || null; }

  setQty = function (n) {
    if (!curProduct || !curProduct.inStock) return;
    modalQty = Math.max(1, Math.min(Math.max(1, room()), n)); $$('mqty').textContent = modalQty; updateInfo();
  };

  // اللون/المقاس النافذ بيتضغط (شطبة صغيرة) ويظهر "اسأل عن توفره"
  renderColors = function () {
    var box = $$('mcolors'); box.innerHTML = '';
    curProduct.colors.forEach(function (c) {
      var b = el('button', 'opt' + (c.inStock ? '' : ' out') + (c === curColor ? ' sel' : ''), c.name || '-'); b.type = 'button';
      b.addEventListener('click', function () { if (c === curColor) deselectColor(); else selectColor(c); });
      box.appendChild(b);
    });
    $$('colorName').textContent = curColor ? curColor.name : ''; $$('chint').textContent = curColor ? T_CHINT2 : T_CHINT1;
  };
  renderSizes = function () {
    /* المقاسات ظاهرة على طول: باهتة لحد ما يختار اللون، ولو داس عليها قبلها بنوجّهه للألوان */
    var box = $$('msizes'); box.innerHTML = '';
    if (askSel && (!curColor || curColor.sizes.indexOf(askSel) < 0)) askSel = null;
    var seen = {}, names = [];
    curProduct.colors.forEach(function (c) { c.sizes.forEach(function (z) { if (!seen[z.size]) { seen[z.size] = 1; names.push(z.size); } }); });
    names.sort(function (a, b) { return sizeRank(a) - sizeRank(b); });
    names.forEach(function (nm) {
      var s = null; if (curColor) curColor.sizes.forEach(function (z) { if (z.size === nm) s = z; });
      var cls = 'opt'; if (!curColor) cls += ' wait'; else if (!s) cls += ' out nos'; else if (!s.inStock) cls += ' out';
      if (s && (s === curSize || s === askSel)) cls += ' sel';
      var b = el('button', cls, nm || '-'); b.type = 'button';
      b.addEventListener('click', function () {
        if (!curColor) { HZ.guide('mcolors', 'اختار اللون الأول'); return; }
        if (s && s.inStock) { if (askMode) { askMode = false; askSel = null; showToast('المقاس ده متوفر أصلاً، تقدر تضيفه للسلة'); } curSize = s; renderSizes(); updateInfo(); }
        else if (askMode && s) { askSel = s; curSize = null; renderSizes(); updateInfo(); }
      });
      box.appendChild(b);
    });
  };

  buildModalOffers = function () {
    var box = $$('moffer'); box.innerHTML = '';
    var free = N(SS['شحن_مجاني_من_قطع']) || 2;
    (OF[curProduct.offer] || []).slice().sort(function (a, b) { return a.n - b.n; }).forEach(function (t) {
      var rf = t.ref > 0 ? t.ref : toNum(cardPrice(curProduct).text), d = Math.max(0, t.n * rf - t.price), c = el('span', 'ochip', t.n + ' قطع: ' + T_OFF + ' ' + d + ' ' + CURRENCY + (t.n >= free ? ' + ' + T_FREESHIP_S : '')); c.setAttribute('data-n', t.n); box.appendChild(c);
    });
  };

  var askMode = false, askSel = null;
  window.__hzAskReset = function () { askMode = false; askSel = null; var pn = $$('hzpan'); if (pn) pn.style.display = 'none'; };
  window.__hzAskInCard = function () {
    if (!curProduct) return;
    askMode = true;
    if (!curColor) { HZ.guide('mcolors', 'اختار اللون والمقاس'); return; }
    renderSizes(); HZ.guide('msizes', 'اختار اللون والمقاس');
  };
  function init() {
    if ($$('hztot')) return;
    var add = $$('madd'), par = add.parentNode;
    function mk(tag, id, cls) { var e = el(tag, cls || ''); e.id = id; par.insertBefore(e, add); return e; }
    mk('div', 'hztot', 'hzt'); mk('div', 'hznote', 'hzm'); var __hm = el('div', 'hzm hzqm'); __hm.id = 'hzmsg'; $$('qrow').appendChild(__hm);
    var ask = mk('button', 'hzask', 'btn hzask'); ask.type = 'button'; ask.textContent = 'اسأل عن توفره';
    var pan = mk('div', 'hzpan');
    var more = mk('div', 'hzmore');
    more.innerHTML = '<div class=\"hzm\" id=\"hzmoret\"></div><div class=\"hzmq\"><button type=\"button\" id=\"hzmm\" aria-label=\"-\">−</button><b id=\"hzmn\">2</b><button type=\"button\" id=\"hzmp\" aria-label=\"+\">+</button></div><a class=\"btn wa\" id=\"hzmwa\" target=\"_blank\" rel=\"noopener\">اطلب الكمية دي على واتساب</a>';
    var mst = el('style'); mst.textContent = '#hzmore{display:none;flex-direction:column;gap:8px;margin:8px 0;padding:10px 12px;border:1px dashed var(--gold);border-radius:12px;background:rgba(216,180,114,.06)}#hzmore .hzmq{display:flex;align-items:center;justify-content:center;gap:14px}#hzmore .hzmq button{width:34px;height:34px;border-radius:50%;border:1px solid var(--gold);background:none;color:var(--gold-2);font-size:18px;font-family:inherit;cursor:pointer}#hzmore .hzmq b{min-width:28px;text-align:center;font-size:16px;color:#fff}'; document.head.appendChild(mst);
    var mKey = '', mMax = 0, mN = 2;
    function mxNow() { return curSize && curSize.max != null ? curSize.max : 99; }
    function mWa() {
      var cap = N(SS['سقف_الكمية_المرسلة']) || 10, mx = mxNow();
      $$('hzmn').textContent = mN;
      $$('hzmwa').href = 'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent('مرحباً، عايز ' + mN + ' قطعة من ' + curProduct.name + ' (' + dcode(curProduct.code) + ') - لون ' + curColor.name + ' - مقاس ' + curSize.size + (mx < cap ? '، والمتاح على الموقع ' + mx + ' بس' : '، والحد الأقصى للطلب على الموقع ' + mx) + '. ينفع تدبّرلي الكمية دي؟');
    }
    function mShow() {
      var cap = N(SS['سقف_الكمية_المرسلة']) || 10, mx = mxNow();
      mKey = [curProduct.code, curColor.name, curSize.size].join('|'); mMax = mx; mN = mx + 1;
      $$('hzmoret').textContent = mx < cap ? 'المتاح ' + mx + (mx === 1 ? ' قطعة' : ' قطع') + ' بس، محتاج أكتر؟' : 'أقصى كمية للطلب ' + mx + ' قطع، محتاج أكتر؟';
      more.style.display = 'flex'; mWa();
    }
    $$('mqplus').addEventListener('click', function (e) { if (this.className.indexOf('dim') > -1 && curColor && curSize && curSize.inStock) { e.stopImmediatePropagation(); e.preventDefault(); mShow(); } }, true);
    $$('hzmm').addEventListener('click', function () { if (mN > mMax + 1) { mN--; mWa(); } });
    $$('hzmp').addEventListener('click', function () { if (mN < 99) { mN++; mWa(); } });
    window.__hzMoreSync = function () {
      if (more.style.display === 'none') return;
      var dim = $$('mqplus').className.indexOf('dim') > -1;
      if (!dim || !curColor || !curSize || [curProduct.code, curColor.name, curSize.size].join('|') !== mKey) more.style.display = 'none';
    };
    pan.innerHTML = '<div class="hzm">اكتب رقمك وهنبلغك لما يتوفر. رقمك بيستخدم لإبلاغك بالتوفر فقط.</div><input id="hzph" type="tel" placeholder="01xxxxxxxxx"><button class="btn add" id="hzsendask" type="button">تأكيد</button><a class="hzm" id="hzwa" target="_blank" rel="noopener">أو كلمنا على واتساب</a>';
    var row = el('div', 'hzrow'); par.insertBefore(row, add); row.appendChild(add);
    $$('hznote').addEventListener('click', function (e) { if (e.target.closest && e.target.closest('button')) { openCart(); } });
    add.addEventListener('click', function (e) { e.stopImmediatePropagation(); if (!curColor) { HZ.guide('mcolors', 'اختار اللون الأول'); return; } if (!curSize || !curSize.inStock) { HZ.guide('msizes', 'اختار المقاس'); return; } doAdd(); }, true);
    ask.addEventListener('click', function () {
      if (!curColor || !curSize) { showToast('اختار اللون والمقاس الأول'); return; }
      pan.style.display = 'flex';
      $$('hzwa').href = 'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent('مرحباً، عايز أعرف هيتوفر إمتى: ' + curProduct.name + ' (' + dcode(curProduct.code) + ') - لون ' + curColor.name + ' - مقاس ' + curSize.size);
    });
    $$('hzsendask').addEventListener('click', function () {
      var ph = $$('hzph').value.replace(/\D/g, '');
      if (!askSel || !curColor) return;
      if (!/^01\d{9}$/.test(ph)) { showToast('اكتب رقم موبايل صحيح'); return; }
      try { fetch(API_URL, { method: 'POST', mode: 'no-cors', keepalive: true, headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ type: 'avail', code: curProduct.code, name: curProduct.name, color: curColor.name, size: askSel.size, phone: ph }) }); } catch (x) {}
      askMode = false; askSel = null; renderSizes(); updateInfo(); pan.style.display = 'none'; showToast('تمام، هنبلغك على واتساب لما يتوفر');
    });
    new MutationObserver(function () { if (!$$('cart').classList.contains('open') && $$('modal').classList.contains('open')) updateInfo(); }).observe($$('cart'), { attributes: true, attributeFilter: ['class'] });
  }

  // الكارت يفضل مفتوح بعد الإضافة، والكمية ترجع 1
  function doAdd() {
    if (!curProduct || !curColor || !curSize || !curSize.inStock) return;
    var edit = HZ.edit; if (edit) { cart = cart.filter(function (x) { return x !== edit; }); }
    var q = Math.min(modalQty, room()); if (q < 1) return;
    var cxo = window.__hzCx ? window.__hzCx() : null, key = [curProduct.code, curColor.name || '', curSize.size || ''].join('|') + (cxo ? '|x' + JSON.stringify(cxo) : ''), f = null;
    cart.forEach(function (i) { if (i.key === key) f = i; });
    if (f) f.qty += q;
    else cart.push({ key: key, code: curProduct.code, name: curProduct.name, color: curColor.name || '', size: curSize.size || '', price: curSize.price, imageId: curColor.imageId || curProduct.main || '', qty: q, max: curSize.max, cx: cxo || undefined, fee: cxo && window.__hzFee ? window.__hzFee(cxo) : 0 });
    if (window.__hzCxReset) window.__hzCxReset();
    saveCart(); updateBadge(); bumpCart();
    track('AddToCart', { content_ids: [curProduct.code], content_name: curProduct.name, content_type: 'product', value: toNum(curSize.price) * q, currency: 'EGP' });
    modalQty = 1; HZ.edit = null; deselectColor(); showToast(edit ? 'اتحدّث الطلب' : T_ADDED); updateInfo();
    if (edit) { closeModal(); setTimeout(openCart, 200); }
  }

  updateInfo = function () {
    var p = curProduct, st = $$('mstatus'), add = $$('madd'), pr = $$('mprice'); init();
    var inS = !!(curSize && curSize.inStock), r = room();
    if (modalQty > Math.max(1, r)) modalQty = Math.max(1, r);
    $$('mqty').textContent = modalQty;
    var cp = cardPrice(p), fromTxt = (cp.differ ? 'يبدأ من ' : '') + cp.text + ' ' + CURRENCY, dimP = false;
    if (inS) { var fe = 0; try { var cxo = window.__hzCx && window.__hzCx(); if (cxo && cxo.sz && window.__hzFee) fe = window.__hzFee({ sz: cxo.sz }); } catch (e) { fe = 0; } var pf = toNum(curSize.price) + fe, wf = curSize.was + fe; pr.textContent = (fe ? pf : curSize.price) + ' ' + CURRENCY; if (curSize.was > toNum(curSize.price) && wasOn()) { var ws = document.createElement('s'); ws.className = 'was'; ws.textContent = fmt(wf) + ' ' + CURRENCY; pr.appendChild(ws); if (pctOn()) { var pc = document.createElement('span'); pc.className = 'pct'; pc.textContent = '-' + Math.round((1 - pf / wf) * 100) + '%'; pr.appendChild(pc); } } st.textContent = 'متوفر في المخزون'; st.className = 'status ok'; }
    else if (curSize || (curColor && !curColor.inStock)) { pr.textContent = fromTxt; dimP = true; st.textContent = 'نفذ من المخزون'; st.className = 'status no'; }
    else if (!curColor && p.inStock) { pr.textContent = fromTxt; st.textContent = ''; st.className = 'status'; }
    else { pr.textContent = fromTxt; dimP = true; st.textContent = p.inStock ? '' : 'نفذ من المخزون'; st.className = 'status no'; }
    pr.className = 'p' + (dimP || !p.inStock ? ' dimp' : '');
    var can = curColor && inS && r > 0;
    add.className = 'btn add' + (can ? '' : ' off');
    add.textContent = can ? (HZ.edit ? 'تحديث الطلب' : T_ADD) : (inS && r === 0 ? 'وصلت لأقصى كمية متاحة' : (p.inStock ? 'اختر اللون والمقاس' : 'غير متاح حالياً'));
    $$('qrow').className = 'qrow' + (inS ? '' : ' dis');
    var cnt = pieces(p) + (inS ? modalQty : 0), tot = sumP(p) + (inS ? toNum(curSize.price) * modalQty : 0), t = tier(p.offer, cnt), tx = '';
    if (cnt >= 1 && (inS || cnt >= 2)) { var rf = t && t.ref > 0 ? t.ref : tot / cnt, d = t && rf > 0 ? Math.round(tot * (1 - t.price / (t.n * rf))) : 0; tx = 'إجمالي المنتج ده (' + (cnt === 1 ? 'قطعة' : cnt + ' قطع') + '): <b>' + fmt(tot - d) + ' ' + CURRENCY + '</b><small>قبل باقي منتجات السلة</small>'; }
    $$('hztot').innerHTML = '';   // إجمالي المنتج اتشال (السعر الأساسي بيفضل زي ما هو)
    Array.prototype.forEach.call(document.querySelectorAll('#moffer .ochip'), function (c) { c.className = 'ochip' + (t && +c.getAttribute('data-n') === t.n ? ' hit' : ''); });
    var cap = N(SS['سقف_الكمية_المرسلة']) || 10;
    $$('hzmsg').textContent = inS && (r === 0 || modalQty >= r) ? (curSize.max != null && curSize.max < cap ? 'آخر كمية متاحة' : 'أقصى كمية للطلب') : '';
    var oth = 0;
    cart.forEach(function (i) { var q = ALL.filter(function (x) { return x.code === i.code; })[0]; if (i.code !== p.code && q && p.offer && q.offer === p.offer) oth += i.qty; });
    var __cc = cartCount(); $$('hznote').className = __cc ? 'hzm hznote' : 'hzm'; $$('hznote').innerHTML = __cc ? '<span>' + (oth ? 'في سلتك قطع من موديلات تانية، والعرض بيتحسب على كل القطع مع بعض، فالسعر النهائي ممكن يبقى أقل.' : 'في سلتك ' + __cc + (__cc === 1 ? ' قطعة' : ' قطع')) + '</span><button type="button" class="hzgb hzvcb"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 7h12l1 13H5L6 7z"/><path d="M9 7V6a3 3 0 0 1 6 0v1"/></svg><span>عرض السلة</span></button>' : '';
    $$('mqplus').className = inS && modalQty >= Math.max(1, r) ? 'dim' : ''; $$('mpic').classList.toggle('outnow', curColor ? !curColor.inStock : !p.inStock);
    $$('hzask').style.display = curColor && (curSize ? !inS : !curColor.inStock) ? 'block' : 'none';
    var pn = $$('hzpan'); if (askMode && askSel && curColor) { pn.style.display = 'flex'; $$('hzwa').href = 'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent('مرحباً، عايز أعرف هيتوفر إمتى: ' + curProduct.name + ' (' + dcode(curProduct.code) + ')' + (curColor.name ? ' - لون ' + curColor.name : '') + ' - مقاس ' + askSel.size); } else pn.style.display = 'none';
    if (window.__hzMoreSync) window.__hzMoreSync();
  };
})();
