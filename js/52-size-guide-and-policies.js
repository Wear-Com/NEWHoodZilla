/* FILE: js/52-size-guide-and-policies.js
   جدول المقاسات وسياسات الاسترجاع/الاستبدال
   (جزء من HoodZilla — بيتحمّل بالترتيب من index.html، والـ global scope مشترك بين كل الملفات. راجع FILES-GUIDE.md) */
(function () {
  var SZ = [], POL = [], SX = {}, $$ = function (i) { return document.getElementById(i); };
  function N(v) { var n = parseFloat(v); return isNaN(n) ? 0 : n; }
  var _a = applyData;
  applyData = function (d, f) {
    SZ = d.sizes || []; POL = d.policies || []; SX = d.settings || {};
    var ks = Object.keys(d.offers || {}), o = ks.length ? d.offers[ks[0]] : null;
    if (o) o.forEach(function (t) { if (t.ref > 0) UNIT_PRICE = t.ref; if (t.n === 2) BUNDLE2 = t.price; if (t.n === 3) BUNDLE3 = t.price; if (t.n === 4) BUNDLE4 = t.price; });
    _a(d, f);
    var pl = $$('hzpl2'); if (pl) pl.style.display = POL.length ? '' : 'none';
  };
  var st = document.createElement('style');
  st.textContent = '.hzo{position:fixed;top:0;right:0;bottom:0;left:0;z-index:80;background:rgba(0,0,0,.78);display:none;align-items:center;justify-content:center;padding:14px}.hzo.open{display:flex}.hzs{background:linear-gradient(180deg,#2b251c,#1e1913);border:1px solid rgba(216,180,114,.38);border-radius:18px;width:100%;max-width:520px;max-height:90vh;overflow:auto;padding:18px;box-shadow:0 30px 80px rgba(0,0,0,.6)}.hzs h3{color:var(--gold-2);margin-bottom:12px;font-size:18px;display:flex;justify-content:space-between;align-items:center}.hzx{background:none;border:1px solid rgba(216,180,114,.4);color:var(--gold-2);width:32px;height:32px;border-radius:50%;cursor:pointer;font-size:18px}.hzt2{width:100%;border-collapse:separate;border-spacing:0;border:1px solid var(--line);border-radius:12px;overflow:hidden;text-align:center;font-size:14px}.hzt2 th{background:linear-gradient(135deg,var(--gold-2),var(--gold));color:#1a1408;padding:9px;font-weight:800}.hzt2 td{padding:9px;border-top:1px solid rgba(216,180,114,.14)}.hzt2 td:first-child{color:var(--gold-2);font-weight:800}.hzt2 tr.dim td{opacity:.3}.hzs input{width:100%;padding:10px 34px 10px 10px;border-radius:10px;border:1px solid rgba(216,180,114,.25);background:var(--panel);color:var(--ink);font-family:inherit;font-size:16px}.hzf2{display:flex;gap:8px;margin:12px 0}.hzf2 div{flex:1;position:relative}.hzf2 span{position:absolute;left:10px;top:50%;transform:translateY(-50%);font-size:11px;color:var(--muted)}.hzres{display:none;align-items:center;gap:12px;background:rgba(216,180,114,.08);border:1px dashed rgba(216,180,114,.45);border-radius:14px;padding:12px;margin:10px 0}.hzbig{flex:none;width:58px;height:58px;border-radius:50%;background:linear-gradient(135deg,var(--gold-2),var(--gold));color:#1a1408;display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:900}.hzs p{font-size:13px;line-height:1.8;color:var(--muted);margin-top:8px;white-space:pre-line}.hzs details{border-bottom:1px solid var(--line);padding:8px 0}.hzs summary{cursor:pointer;font-weight:700;color:var(--gold-2)}.hzlink{background:none;border:0;color:var(--gold-2);font-family:inherit;font-size:12px;text-decoration:underline;cursor:pointer}.hzpill{display:inline-flex;align-items:center;gap:6px;border:1px solid var(--gold);background:rgba(216,180,114,.08);color:var(--gold-2);border-radius:30px;padding:3px 12px;font-family:inherit;font-size:12px;font-weight:700;cursor:pointer;margin-right:10px}.hzpill svg{width:15px;height:15px}.hznote{display:flex;align-items:center;justify-content:space-between;gap:10px;border:1px dashed rgba(216,180,114,.55);background:rgba(216,180,114,.08);border-radius:12px;padding:10px 12px;color:var(--gold-2);font-size:12px;line-height:1.6}.hzgb{flex:none;border:0;border-radius:20px;padding:6px 14px;background:linear-gradient(135deg,var(--gold-2),var(--gold));color:#1a1408;font-family:inherit;font-weight:800;font-size:12px;cursor:pointer}';
  document.head.appendChild(st);
  function ov(id) {
    var o = $$(id);
    if (!o) { o = document.createElement('div'); o.id = id; o.className = 'hzo'; o.innerHTML = '<div class="hzs"></div>'; document.body.appendChild(o); o.addEventListener('click', function (e) { if (e.target === o) o.classList.remove('open'); }); }
    return o;
  }
  function psizes() { var m = {}; curProduct.colors.forEach(function (c) { c.sizes.forEach(function (s) { m[s.size] = 1; }); }); return Object.keys(m).sort(function (a, b) { return sizeRank(a) - sizeRank(b); }); }
  function idx(rows, k, v) { for (var i = 0; i < rows.length; i++) if (v <= N(rows[i][k])) return i; return rows.length - 1; }
  var pick = '';
  function sug() {
    var a = N($$('hzsa').value), w = N($$('hzsw').value), h = N($$('hzsh').value), ps = psizes(), b = $$('hzsb'), bx = $$('hzres');
    var rows = SZ.filter(function (r) { return ps.indexOf(r.s) > -1 && N(r.mw) > 0 && N(r.mh) > 0; }).sort(function (x, y) { return sizeRank(x.s) - sizeRank(y.s); });
    b.style.display = 'none'; bx.style.display = 'none';
    if (!w || !h || !rows.length) return;
    var i = Math.max(idx(rows, 'mw', w), idx(rows, 'mh', h)), r = rows[i], last = rows[rows.length - 1], mg = N(SX['هامش_المقاس']) || 5, ma = N(SX['سن_أدنى_للمقاسات']) || 14;
    var m = 'المقاس المناسب ليك';
    if (w > N(last.mw) + mg || h > N(last.mh) + mg) m += '\nأكبر مقاس متاح للمنتج ده هو ' + last.s + ' وممكن يطلع ضيق، كلمنا على واتساب.';
    else if (i === 0) m += '\nهيطلع واسع عليك شوية، وده ستايل الأوفرسايز.';
    if (a && a < ma) m += '\nالمقاسات دي للكبار.';
    $$('hzbig').textContent = r.s; $$('hzsr').style.whiteSpace = 'pre-line'; $$('hzsr').textContent = m; pick = r.s; bx.style.display = 'flex'; b.style.display = 'block';
  }
  window.__hzOpenSizes = function () { openSizes(); };
  function openSizes() {
    if (window.__hzSizeUI) return window.__hzSizeUI();
    var ps = psizes(), rows = SZ.slice().sort(function (a, b) { return sizeRank(a.s) - sizeRank(b.s); });
    var h = '<h3><span>جدول المقاسات</span><button class="hzx" type="button">×</button></h3><table class="hzt2"><tr><th>المقاس</th><th>العرض (سم)</th><th>الطول (سم)</th></tr>' + rows.map(function (r) { return '<tr class="' + (ps.indexOf(r.s) < 0 ? 'dim' : '') + '"><td>' + r.s + '</td><td>' + r.w + '</td><td>' + r.l + '</td></tr>'; }).join('') + '</table><p>القياسات بالسنتيمتر والهودي مفرود. الموديلات أوفرسايز: لو بتفضّل لبس أقل اتساعاً اختار مقاس أصغر.</p>';
    if (rows.some(function (r) { return N(r.mw) > 0 && N(r.mh) > 0; })) h += '<h3 style="margin-top:14px"><span>اعرف مقاسك</span></h3><div class="hzf2"><div><input id="hzsa" inputmode="numeric" placeholder="السن"><span>سنة</span></div><div><input id="hzsw" inputmode="numeric" placeholder="الوزن"><span>كجم</span></div><div><input id="hzsh" inputmode="numeric" placeholder="الطول"><span>سم</span></div></div><div class="hzres" id="hzres"><div class="hzbig" id="hzbig"></div><div id="hzsr" class="hzm"></div></div><button class="btn add" id="hzsb" type="button" style="display:none">اختيار المقاس</button>';
    var o = ov('hzsz'); o.querySelector('.hzs').innerHTML = h; o.classList.add('open');
    o.querySelector('.hzx').addEventListener('click', function () { o.classList.remove('open'); });
    ['hzsa', 'hzsw', 'hzsh'].forEach(function (i) { var e = $$(i); if (e) e.addEventListener('input', function () { this.value = this.value.replace(/\D/g, ''); sug(); }); });
    var b = $$('hzsb');
    if (b) b.addEventListener('click', function () {
      if (!curColor) { showToast('اختار اللون الأول'); return; }
      var f = null; curColor.sizes.forEach(function (s) { if (s.size === pick) f = s; });
      if (!f || !f.inStock) { showToast('المقاس ده نافذ في اللون ده'); return; }
      curSize = f; renderSizes(); updateInfo(); o.classList.remove('open');
    });
  }
  var _om = openModal;
  openModal = function (p) {
    _om(p);
    var l = $$('msizes').previousElementSibling;
    if (l && !l.querySelector('.hzpill')) { var b = el('button', 'hzpill'); b.type = 'button'; b.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 17L17 3l4 4L7 21z"/><path d="M7 13l2 2M10 10l2 2M13 7l2 2"/></svg>جدول المقاسات'; b.addEventListener('click', openSizes); l.appendChild(b); }
  };
  function openPol() {
    var o = ov('hzpo'), s = o.querySelector('.hzs'); s.innerHTML = '<h3><span>سياسة الشغل والاسترجاع</span><button class="hzx" type="button" aria-label="إغلاق"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button></h3>';
    POL.forEach(function (p) { var d = el('details'), u = el('summary', '', p.t), t = el('p', '', p.x); d.appendChild(u); d.appendChild(t); s.appendChild(d); });
    var ct = String((window.__hzSET || {})['نص_ختام_السياسة'] || '').replace(/[\u{1F000}-\u{1FAFF}\u2600-\u27BF\uFE0F\u200D]/gu, '').trim();
    if (ct) { var cp = el('p', 'hzthx'); cp.appendChild(document.createTextNode(ct + ' ')); cp.insertAdjacentHTML('beforeend', '<svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" style="vertical-align:-2px;color:var(--gold-2)" aria-hidden="true"><path d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 2.8 5 6.2 5c2 0 3.2 1 3.8 2 .6-1 1.8-2 3.8-2 3.4 0 5.3 3.400 3.800 6.800C19.500 16.400 12 21 12 21z"/></svg>'); s.appendChild(cp); }
    o.classList.add('open'); s.querySelector('.hzx').onclick = function () { o.classList.remove('open'); };
  }
  var ft = $$('foot'), fb = el('button', 'hzlink', 'سياسة الموقع'); fb.id = 'hzpl2'; fb.type = 'button'; fb.style.display = 'block'; fb.style.margin = '8px auto 0'; fb.addEventListener('click', openPol); ft.appendChild(fb);
  var cf = el('div', 'hzm'); cf.style.textAlign = 'center'; cf.innerHTML = 'بإتمام الطلب أنت موافق على '; var cb = el('button', 'hzlink', 'سياسة الموقع'); cb.type = 'button'; cb.addEventListener('click', openPol); cf.appendChild(cb);
  $$('cfoot').insertBefore(cf, $$('cclear'));
})();
