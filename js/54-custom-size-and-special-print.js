/* FILE: js/54-custom-size-and-special-print.js
   المقاس المخصص والطباعة الخاصة داخل نافذة المنتج + السعر
   (جزء من HoodZilla — بيتحمّل بالترتيب من index.html، والـ global scope مشترك بين كل الملفات. راجع FILES-GUIDE.md) */
(function () {
  /* ===================== المقاس المخصص والطباعة الخاصة (داخل نافذة المنتج) ===================== */
  var $$ = function (i) { return document.getElementById(i); }, CX = { sz: null, pr: null }, PRS = null, SZT = [], SPD = { psz: [], pz: [], pt: [] }, SXX = {};
  function S() { return window.__hzSET || SXX || {}; }
  function N(v) { var n = parseFloat(String(v).replace(/[^\d.]/g, '')); return isNaN(n) ? 0 : n; }
  function E(v) { return String(v == null ? '' : v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function typ() { return (curProduct && curProduct.mt) || 'hoodie'; }
  var _ad = applyData;
  applyData = function (d, f) { SZT = d.sizes || []; SPD = { psz: d.psz || [], pz: d.pz || [], pt: d.pt || [] }; SXX = d.settings || {}; window.__hzSSP = d.ssp || {}; _ad(d, f); };

  /* ---- السعر ---- */
  function ptRow(n) { var r = null; SPD.pt.forEach(function (x) { if (x.n === n) r = x; }); return r; }
  window.__hzPrintFee = function (pr) {
    var ds = pr && pr.d || []; if (!ds.length) return 0;
    var row = ptRow(ds.length); if (!row) return N(S()['سعر_الطباعة_الخاصة']);
    var a = 0; ds.forEach(function (d) { a += N(d.w) * N(d.h); });
    var k = row.a2 > row.a1 ? Math.min(1, Math.max(0, (a - row.a1) / (row.a2 - row.a1))) : 0;
    return Math.round((row.min + (row.max - row.min) * k) / 5) * 5;
  };
  window.__hzCx = function () { var o = {}; if (CX.sz) o.sz = CX.sz; if (CX.pr) o.pr = CX.pr; return o.sz || o.pr ? JSON.parse(JSON.stringify(o)) : null; };
  window.__hzCxReset = function () { CX = { sz: null, pr: null }; PRS = null; draw(); };
  var KEYS = { hoodie: [['عرض الصدر', 'chest'], ['طول الصدر', 'length'], ['عرض الكم', 'sleeveW'], ['طول الكم', 'sleeveL']], pants: [['عرض الكمر', 'waist'], ['عرض السمانة', 'calf'], ['طول الرجل', 'inseam']] };
  KEYS.jacket = KEYS.hoodie;
  function zname(code) { var n = code; SPD.pz.forEach(function (z) { if (z.code === code) n = z.name; }); return n; }
  window.cxParts = function (cx) {
    var r = [];
    if (cx && cx.sz) { var a = []; if (cx.sz.base) a.push('المقاس ' + cx.sz.base); KEYS.hoodie.concat(KEYS.pants).forEach(function (k) { if (cx.sz[k[1]]) a.push(k[0] + ' ' + cx.sz[k[1]]); }); if (cx.sz.note) a.push(cx.sz.note); r.push(['مقاس مخصص:', a.join(' | ')]); }
    if (cx && cx.pr && cx.pr.d) r.push(['طباعة خاصة:', cx.pr.d.length + ' تصميم | ' + cx.pr.d.map(function (d) { return zname(d.z) + ' ' + d.w + '×' + d.h + ' سم'; }).join(' + ') + (cx.pr.note ? ' | ' + cx.pr.note : '')]);
    return r;
  };
  window.__hzCxSet = function (cx) { CX = { sz: cx && cx.sz ? JSON.parse(JSON.stringify(cx.sz)) : null, pr: cx && cx.pr ? JSON.parse(JSON.stringify(cx.pr)) : null }; PRS = null; draw(); };
  window.cxText = function (cx) {
    var t = [];
    if (cx && cx.sz) {
      var a = []; if (cx.sz.base) a.push('المقاس ' + cx.sz.base);
      KEYS.hoodie.concat(KEYS.pants).forEach(function (k) { if (cx.sz[k[1]]) a.push(k[0] + ' ' + cx.sz[k[1]]); });
      if (cx.sz.note) a.push(cx.sz.note); t.push('مقاس مخصص: ' + a.join(' | '));
    }
    if (cx && cx.pr && cx.pr.d) {
      t.push('طباعة خاصة: ' + cx.pr.d.length + ' تصميم | ' + cx.pr.d.map(function (d) { return zname(d.z) + ' ' + d.w + '×' + d.h + ' سم'; }).join(' + ') + (cx.pr.note ? ' | ' + cx.pr.note : ''));
    }
    return t.join(' || ');
  };
  var st = document.createElement('style');
  st.textContent = '#hzsp{display:flex;flex-direction:column;gap:8px;margin:12px 0}.hzspr{display:grid;grid-template-columns:1fr 1fr;gap:8px}.hzspc{position:relative;display:flex;flex-direction:column;align-items:flex-start;gap:3px;text-align:right;border:1px solid rgba(216,180,114,.4);background:linear-gradient(135deg,rgba(216,180,114,.1),rgba(216,180,114,.02));color:var(--gold-2);border-radius:14px;padding:10px 12px;font-family:inherit;cursor:pointer}.hzspc:only-child{grid-column:1/-1}.hzspc svg{width:22px;height:22px;fill:none;stroke:var(--gold);stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round}.hzspc b{font-size:14px;color:#fff}.hzspc small{font-size:11.5px;color:var(--muted)}.hzspc.on{border-color:var(--green);background:rgba(84,212,149,.08)}.hzspc.on small{color:var(--green)}' +
    '.hzspsum{display:flex;align-items:center;gap:8px;font-size:12.5px;line-height:1.7;color:var(--gold-2);border:1px solid rgba(84,212,149,.35);border-radius:12px;padding:8px 10px;background:rgba(84,212,149,.06)}.hzspsum img{width:44px;height:44px;border-radius:8px;object-fit:cover}.hzspsum span{flex:1}.hzspsum button{background:none;border:1px solid var(--gold);color:var(--gold-2);border-radius:20px;padding:4px 11px;font-family:inherit;font-size:12px;cursor:pointer}' +
    '#hzszp{z-index:82}#hzsz{z-index:84}#hzszp .hzs{max-width:460px}.hzszf{display:grid;grid-template-columns:1fr 1fr;gap:8px}.hzszf label{display:flex;flex-direction:column;gap:3px;font-size:12px;color:var(--muted)}.hzszf input,.hzszf select,#hzszp textarea{width:100%;padding:10px;border-radius:10px;border:1px solid rgba(216,180,114,.28);background:var(--panel);color:var(--ink);font-family:inherit;font-size:15px}.hzrec{border:1px dashed var(--gold);border-radius:14px;padding:10px 12px;margin:10px 0;text-align:center;line-height:1.9;font-size:13.5px;display:none}.hzrec .bg{font-size:34px;font-weight:900;color:var(--gold-2);line-height:1.1}.hzrec.warn{border-color:var(--red)}.hzlk{background:none;border:0;color:var(--gold-2);text-decoration:underline;font-family:inherit;font-size:13px;cursor:pointer;padding:4px 0}.cxth{width:38px;height:38px;border-radius:7px;object-fit:cover;vertical-align:middle;margin-left:6px}';
  document.head.appendChild(st);
  var IC = { sz: '<svg viewBox="0 0 24 24"><path d="M3 17L17 3l4 4L7 21z"/><path d="M7 13l2 2M10 10l2 2M13 7l2 2"/></svg>', pr: '<svg viewBox="0 0 24 24"><path d="M4 7l4-3h8l4 3-2.5 3.2L16 9v11H8V9l-1.5 1.2z"/><path d="M10.5 12.5l1.5 1.5 2.5-3"/></svg>' };
  function host() {
    var h = $$('hzsp'); if (h) return h;
    var anchor = $$('msizes') && $$('msizes').parentNode; if (!anchor) return null;
    h = document.createElement('div'); h.id = 'hzsp'; anchor.parentNode.insertBefore(h, anchor.nextSibling); return h;
  }
  function fsz() { var v = window.__hzSSP && window.__hzSSP[typ()]; return v != null ? N(v) : N(S()['سعر_المقاس_الخاص']); }
  window.__hzSizeFee = function () { return fsz(); };
  function draw() {
    var h = host(); if (!h) return;
    var a = curProduct && window.__hzElig && window.__hzElig(curProduct, 'sz'), b = curProduct && window.__hzElig && window.__hzElig(curProduct, 'pr');
    if (!a && !b) { h.innerHTML = ''; return; }
    var fp = ptRow(1);
    var html = '<div class="hzspr">';
    if (a) html += '<button type="button" class="hzspc' + (CX.sz ? ' on' : '') + '" data-k="sz">' + IC.sz + '<b>مقاس مخصص</b><small>' + (CX.sz ? 'تم التحديد' : (fsz() ? '+' + fsz() + ' ' + CURRENCY : 'قياساتك بالظبط')) + '</small></button>';
    if (b) html += '<button type="button" class="hzspc' + (CX.pr ? ' on' : '') + '" data-k="pr">' + IC.pr + '<b>طباعة خاصة</b><small>' + (CX.pr ? 'تم التحديد' : (fp ? 'من ' + fp.min + ' ' + CURRENCY : 'تصميمك على المنتج')) + '</small></button>';
    html += '</div>';
    if (CX.sz) html += '<div class="hzspsum"><span>' + E(window.cxText({ sz: CX.sz })) + (fsz() ? '<br><b>+' + fsz() + ' ' + CURRENCY + ' للقطعة</b>' : '') + '</span><button type="button" data-e="sz">تعديل</button><button type="button" data-x="sz">إلغاء</button></div>';
    if (CX.pr) html += '<div class="hzspsum">' + (CX.pr.th ? '<img alt="" src="' + CX.pr.th + '">' : '') + '<span>' + E(window.cxText({ pr: CX.pr })) + '<br><b>+' + window.__hzPrintFee(CX.pr) + ' ' + CURRENCY + ' للقطعة</b></span><button type="button" data-e="pr">تعديل</button><button type="button" data-x="pr">إلغاء</button></div>';
    h.innerHTML = html;
    Array.prototype.forEach.call(h.querySelectorAll('[data-k],[data-e]'), function (x) { x.onclick = function () { openSpecial(x.getAttribute('data-k') || x.getAttribute('data-e')); }; });
    Array.prototype.forEach.call(h.querySelectorAll('[data-x]'), function (x) { x.onclick = function () { var k = x.getAttribute('data-x'); CX[k] = null; if (k === 'pr') PRS = null; draw(); updateInfo(); }; });
  }
  function openSpecial(k) {
    if (!curProduct) return;
    if (!curColor && k === 'sz') { HZ.guide('mcolors', 'اختار اللون الأول'); return; }      // الطباعة الخاصة مش بتطلب لون: بتختاره جوه المصمّم
    if (k === 'sz') sizePanel(); else printPanel();
  }
  window.__hzOpenSpecial = openSpecial;
  var _om = openModal;
  openModal = function (p) { CX = { sz: null, pr: null }; PRS = null; window.__hzPendSz = null; if (window.__hzAskReset) window.__hzAskReset(); _om(p); draw(); };
  var _sc2 = selectColor;
  selectColor = function (c, k) {
    _sc2.apply(this, arguments);
    var s = window.__hzPendSz; if (!s || !curColor) return;
    window.__hzPendSz = null;
    var f = null; curColor.sizes.forEach(function (z) { if (z.size === s) f = z; });
    if (f && f.inStock) { curSize = f; renderSizes(); updateInfo(); showToast('تم اختيار المقاس ' + s); }
    else showToast('المقاس ' + s + ' مش متاح في اللون ده');
  };
  var _ui = updateInfo;
  updateInfo = function () { _ui.apply(this, arguments); draw(); };

  /* ---- المقاس المخصص ---- */
  function ovl(id) { var o = $$(id); if (!o) { o = document.createElement('div'); o.id = id; o.className = 'hzo'; o.innerHTML = '<div class="hzs"></div>'; document.body.appendChild(o); o.addEventListener('click', function (e) { if (e.target === o) o.classList.remove('open'); }); } return o; }
  var LSZ = 'hz_lastsz';
  function lastSz() {
    var a = null, b = null;
    try { b = JSON.parse(localStorage.getItem(LSZ) || 'null'); } catch (e) {}
    try { a = window.__hzGetSz && window.__hzGetSz(); } catch (e) {}
    if (a && (a.w || a.h || a.size)) return { age: a.age || (b && b.age) || '', w: a.w || '', h: a.h || '', size: a.size || '' };
    return b;
  }
  function rememberSz(size, w, h, age) {
    var z = { size: size || '', w: w || '', h: h || '', age: age || '' };
    try { localStorage.setItem(LSZ, JSON.stringify(z)); } catch (e) {}
    try { if (window.__hzSaveSz) window.__hzSaveSz(z); } catch (e) {}
  }
  function tableRows() {
    var pants = typ() === 'pants';
    var rows = pants ? SPD.psz.map(function (r) { return { s: r.s, i: r.i, w: r.w, c: r.c, mw: r.mw, mh: r.mh }; }) : SZT.map(function (r) { return { s: r.s, w: r.w, l: r.l, mw: r.mw, mh: r.mh }; });
    return rows.sort(function (x, y) { return sizeRank(x.s) - sizeRank(y.s); });
  }
  function prodSizes() { var m = {}; curProduct.colors.forEach(function (c) { c.sizes.forEach(function (s) { m[s.size] = 1; }); }); return m; }
  function sizePanel() { sizeUI(true); }
  function sizeUI(special) {
    var pants = typ() === 'pants', rows = tableRows(), ks = KEYS[typ()] || KEYS.hoodie, cur = (special && CX.sz) || {}, o = ovl('hzsz'), box = o.querySelector('.hzs'), ps = prodSizes(), base = cur.base || '', pick = '', lz = lastSz() || {}, vAge = cur.age || lz.age || '', vW = cur.weight || lz.w || '', vH = cur.height || lz.h || '';
    var th = pants ? ['المقاس', 'طول الرجل', 'عرض الكمر', 'عرض السمانة', 'وزن حتى', 'طول حتى'] : ['المقاس', 'العرض', 'الطول', 'وزن حتى', 'طول حتى'];
    function cells(r) { return (pants ? [r.s, r.i, r.w, r.c, r.mw, r.mh] : [r.s, r.w, r.l, r.mw, r.mh]).map(function (v) { return '<td>' + E(v == null || v === '' || v === 0 ? '-' : v) + '</td>'; }).join(''); }
    var h = '<h3><span>' + (special ? 'مقاس مخصص' : 'جدول المقاسات') + '</span><button class="hzx" type="button">×</button></h3>';
    if (special) h += '<h4 class="hzsth">جدول المقاسات</h4>';
    h += '<div style="overflow-x:auto"><table class="hzt2"><tr>' + th.map(function (x) { return '<th>' + x + '</th>'; }).join('') + '</tr>' + rows.map(function (r) { return '<tr data-s="' + E(r.s) + '" class="' + (!special && !ps[r.s] ? 'dim' : '') + (!special && ps[r.s] ? ' pick' : '') + '">' + cells(r) + '</tr>'; }).join('') + '</table></div>' +
      '<p class="hzm">القياسات بالسنتيمتر. الموديلات أوفرسايز: لو بتفضّل لبس ضيق اطلب مقاس أصغر.</p>' + (special ? '' : '<p class="hzm">اضغط على أي مقاس متاح في الجدول عشان تختاره.</p>');
    if (special) h += '<h4 class="hzsth" style="margin-top:12px">اختر مقاسك</h4><div class="hzch" id="hzszc">' + rows.map(function (r) { return '<button type="button" data-b="' + E(r.s) + '" class="' + (base === r.s ? 'sel' : '') + '">' + E(r.s) + '</button>'; }).join('') + '</div><div class="hzm" style="margin:6px 0 0">لو متعرفهوش اعرفه من تحت</div>';
    if (rows.some(function (r) { return N(r.mw) > 0 && N(r.mh) > 0; })) h += '<h4 class="hzsth" style="margin-top:12px">اعرف مقاسك</h4><div class="hzfind"><div class="hzgold empty" id="hzszr"></div><div class="hzfin"><label>السن<input id="hzsza" inputmode="numeric" maxlength="2" value="' + E(vAge) + '"><small>سنة</small></label><label>الوزن<input id="hzszw" inputmode="numeric" maxlength="3" value="' + E(vW) + '"><small>كجم</small></label><label>الطول<input id="hzszh" inputmode="numeric" maxlength="3" value="' + E(vH) + '"><small>سم</small></label></div></div>';
    if (special) h += '<details class="hzadv"' + (ks.some(function (k) { return cur[k[1]]; }) || cur.note ? ' open' : '') + '><summary>إعدادات متقدمة</summary><div class="hzszf">' + ks.map(function (k) { return '<label>' + k[0] + ' (سم)<input data-f="' + k[1] + '" inputmode="decimal" value="' + E(cur[k[1]] || '') + '"></label>'; }).join('') + '</div><textarea id="hzszn" rows="2" placeholder="ملاحظات على المقاس (اختياري)" style="margin-top:8px">' + E(cur.note || '') + '</textarea></details>' +
      '<div class="hzb" id="hzszm"></div><div class="hzm" id="hzszfee"></div><button class="btn add" type="button" id="hzszs" style="margin-top:8px">تأكيد المقاس المخصص</button>';
    else h += '<button class="btn add" type="button" id="hzszu" style="margin-top:10px;display:none">اختار المقاس ده</button>';
    box.innerHTML = h; o.classList.add('open');
    box.querySelector('.hzx').onclick = function () { o.classList.remove('open'); };
    function setBase(s) { base = s; refreshBtn(); updFee(); Array.prototype.forEach.call(box.querySelectorAll('#hzszc button'), function (b) { b.classList.toggle('sel', b.getAttribute('data-b') === s); }); Array.prototype.forEach.call(box.querySelectorAll('tr[data-s]'), function (r) { r.classList.toggle('hit', r.getAttribute('data-s') === s); }); }
    setBase(base);
    if (special) {
      Array.prototype.forEach.call(box.querySelectorAll('#hzszc button'), function (b) { b.onclick = function () { setBase(b.getAttribute('data-b')); }; });
      Array.prototype.forEach.call(box.querySelectorAll('tr[data-s]'), function (r) { r.onclick = function () { setBase(r.getAttribute('data-s')); }; });
    } else {
      Array.prototype.forEach.call(box.querySelectorAll('tr[data-s]'), function (r) { r.onclick = function () { choose(r.getAttribute('data-s'), true); }; });
    }
    function choose(sz, fromRow) {
      if (!sz) return;
      if (fromRow && !ps[sz]) { showToast('المقاس ده مش متاح في المنتج ده'); return; }
      var ez = function (id) { var e = $$(id); return e ? N(e.value) : 0; };
      if (!curColor) { rememberSz(sz, ez('hzszw'), ez('hzszh'), ez('hzsza')); window.__hzPendSz = sz; o.classList.remove('open'); HZ.guide('mcolors', 'اختار اللون وهنحدد لك المقاس ' + sz); return; }
      var f = null; curColor.sizes.forEach(function (z) { if (z.size === sz) f = z; });
      if (!f || !f.inStock) { showToast('المقاس ده نافذ في اللون ده'); return; }
      rememberSz(sz, ez('hzszw'), ez('hzszh'), ez('hzsza'));
      curSize = f; window.__hzPendSz = null; renderSizes(); updateInfo(); o.classList.remove('open'); showToast('تم اختيار المقاس ' + sz);
    }
    function idxOf2(fl, k, v) { for (var i = 0; i < fl.length; i++) if (v <= N(fl[i][k])) return i; return fl.length - 1; }
    function gold(state, big, txt) { var r = $$('hzszr'); r.className = 'hzgold' + (state ? ' ' + state : ''); r.innerHTML = '<div class="bg">' + big + '</div><small>' + txt + '</small>'; }
    function sug() {
      var r = $$('hzszr'); if (!r) return; pick = ''; var bt = $$('hzszu'); if (bt) bt.style.display = 'none';
      var w = N($$('hzszw').value), hh = N($$('hzszh').value), ag = N($$('hzsza').value);
      var fl = rows.filter(function (x) { return N(x.mw) > 0 && N(x.mh) > 0 && (special || ps[x.s]); });
      function showBtn() { if (bt && pick) { bt.textContent = 'اختار المقاس ' + pick; bt.style.display = 'block'; } }
      if (!w || !hh || !fl.length) {
        if (!special && lz.size && ps[lz.size]) { gold('', E(lz.size), 'آخر مقاس اخترته'); pick = lz.size; setBase(pick); showBtn(); }
        else { gold('empty', '—', 'اكتب الوزن والطول'); if (!special) setBase(''); }
        return;
      }
      var mg = N(S()['هامش_المقاس']) || 5, ma = N(S()['سن_أدنى_للمقاسات']) || 14, lastRow = fl[fl.length - 1], i = Math.max(idxOf2(fl, 'mw', w), idxOf2(fl, 'mh', hh)), beyond = w > N(lastRow.mw) + mg || hh > N(lastRow.mh) + mg, rec = fl[Math.min(i, fl.length - 1)], m, kid = ag && ag < ma ? '<br>المقاسات دي للكبار.' : '';
      if (beyond) { gold('warn', '!', 'قياساتك أكبر من آخر مقاس (' + E(lastRow.s) + ')<br><b>' + (special ? 'اكتب قياساتك في الإعدادات المتقدمة' : 'كلمنا على واتساب') + '</b>' + kid); if (!special) setBase(''); return; }
      m = 'المقاس المناسب ليك' + (i === 0 ? '<br>هيطلع واسع شوية، وده ستايل الأوفرسايز' : '') + (special && !ps[rec.s] ? '<br><b>مش متاح عادي في المنتج، هيتطلب كمقاس مخصص</b>' : '') + kid;
      gold('', E(rec.s), m); pick = rec.s;
      if (special) { setBase(pick); fillAdv(rows.filter(function (x) { return x.s === pick; })[0]); } else { setBase(pick); showBtn(); }
    }
    var pendReg = null;
    function refreshBtn() { pendReg = null; var b = $$('hzszs'); if (b) b.textContent = 'تأكيد المقاس المخصص'; }
    // المقاس المختار موجود عادي (في اللون لو متحدد) ومفيش قياسات اتغيّرت عن الجدول ولا ملاحظات
    function regular() {
      if (!special || !base || !ps[base]) return '';
      if (curColor) { var okc = false; curColor.sizes.forEach(function (z) { if (z.size === base && z.inStock) okc = true; }); if (!okc) return ''; }
      var nt = $$('hzszn'); if (nt && nt.value.trim()) return '';
      var row = rows.filter(function (x) { return x.s === base; })[0]; if (!row) return '';
      var map = pants ? { waist: row.w, calf: row.c, inseam: row.i } : { chest: row.w, length: row.l }, same = true;
      Array.prototype.forEach.call(box.querySelectorAll('[data-f]'), function (e) { var v = N(e.value); if (v > 0 && v !== N(map[e.getAttribute('data-f')])) same = false; });
      return same ? base : '';
    }
    function updFee() {
      var e = $$('hzszfee'); if (!e || !special) return;
      var fee = window.__hzSizeFee ? window.__hzSizeFee() : 0, r = regular();
      e.innerHTML = r ? 'المقاس ' + E(r) + ' موجود بالفعل بنفس السعر، من غير رسوم إضافية' : 'سعر المقاس المخصص: ' + (fee ? '<b>+' + fee + ' ' + CURRENCY + ' للقطعة</b>' : 'من غير رسوم إضافية');
    }
    function fillAdv(rec) {
      if (!rec) return;
      var map = pants ? { waist: rec.w, calf: rec.c, inseam: rec.i } : { chest: rec.w, length: rec.l };
      Object.keys(map).forEach(function (k) { var e = box.querySelector('[data-f=' + k + ']'); if (e && !e.value && map[k]) e.value = map[k]; });
      updFee();
    }
    ['hzsza', 'hzszw', 'hzszh'].forEach(function (i) { var e = $$(i); if (e) e.addEventListener('input', function () { this.value = this.value.replace(/\D/g, ''); sug(); updFee(); }); });
    sug();
    Array.prototype.forEach.call(box.querySelectorAll('[data-f],#hzszn'), function (e) { e.addEventListener('input', function () { refreshBtn(); updFee(); }); });
    updFee();
    if ($$('hzszu')) $$('hzszu').onclick = function () { choose(pick, false); };
    if ($$('hzszs')) $$('hzszs').onclick = function () {
      var z = { base: base, age: N($$('hzsza') && $$('hzsza').value) || undefined, weight: N($$('hzszw') && $$('hzszw').value) || undefined, height: N($$('hzszh') && $$('hzszh').value) || undefined, note: $$('hzszn').value.trim().slice(0, 120) }, any = !!base;
      Array.prototype.forEach.call(box.querySelectorAll('[data-f]'), function (e) { var v = N(e.value); if (v > 0) { z[e.getAttribute('data-f')] = v; any = true; } });
      if (!any) { $$('hzszm').textContent = 'اختار مقاسك من فوق أو اكتب قياس واحد على الأقل'; return; }
      var rg = regular();
      if (rg) {
        if (pendReg === rg) { CX.sz = null; draw(); choose(rg, false); return; }
        pendReg = rg; $$('hzszm').textContent = 'المقاس ' + rg + ' موجود بالفعل بنفس السعر، من غير رسوم إضافية. دوس تاني عشان تختاره'; this.textContent = 'اختار المقاس ' + rg; return;
      }
      z.mt = typ(); CX.sz = z; baseSize(z.base); o.classList.remove('open'); draw(); updateInfo(); showToast('تم تحديد المقاس المخصص');
    };
  }
  window.__hzSizeUI = function () { if (curProduct) sizeUI(false); };
  // المخزون بيتخصم من أقرب مقاس متاح في المنتج لو العميل ماحددش مقاس عادي
  function baseSize(base) {
    if (curSize && curSize.inStock) return;
    var best = null, r0 = sizeRank(base || 'M');
    curColor.sizes.forEach(function (s) { if (!s.inStock) return; var d = Math.abs(sizeRank(s.size) - r0); if (!best || d < best.d) best = { d: d, s: s }; });
    if (best) { curSize = best.s; renderSizes(); }
  }

  /* ---- الطباعة الخاصة (المصمّم 3D في print3d.js) ---- */
  function printPanel() {
    if (!window.__hzDesigner) { showToast('جاري تحميل المصمّم، جرب بعد لحظات'); return; }
    var zs = SPD.pz.filter(function (z) { return !z.type || z.type === typ(); });
    if (!zs.length) { showToast('الطباعة غير متاحة للمنتج ده حالياً'); return; }
    window.__hzDesigner.open({
      type: typ(), zones: zs, maxN: N(S()['أقصى_تصاميم_للقطعة']) || 4, maxMB: N(S()['أقصى_حجم_ملف_ميجا']) || 8,
      refCm: N(S()[typ() === 'pants' ? 'طول_مرجع_بنطلون_سم' : typ() === 'jacket' ? 'طول_مرجع_جاكيت_سم' : 'طول_مرجع_هودي_سم']) || 70,
      color: curColor || (function () { var f = null; curProduct.colors.forEach(function (c) { if (!f && c.inStock) f = c; }); return f || curProduct.colors[0] || null; })(), product: curProduct, state: PRS, existing: CX.pr, fee: window.__hzPrintFee, ptable: SPD.pt,
      onSave: function (res) { if (res.color && curProduct && res.color !== curColor) { try { selectColor(res.color, true); } catch (e) {} } CX.pr = res.cx; CX.pr.th = res.th; PRS = res.state; baseSize(''); draw(); updateInfo(); showToast('تم حفظ الطباعة الخاصة'); }
    });
  }
})();
