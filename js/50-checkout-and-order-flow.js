/* FILE: js/50-checkout-and-order-flow.js
   إعدادات الموقع + الدفع/التحويل + العناوين + رفع صورة التحويل + رسالة الواتساب + شاشة التأكيد
   (جزء من HoodZilla — بيتحمّل بالترتيب من index.html، والـ global scope مشترك بين كل الملفات. راجع FILES-GUIDE.md) */
(function () {
  /* ===================== إعدادات الموقع (غيّر من هنا بسهولة) ===================== */
  var HZ = {
    UPLOAD_MAX_PX: 1400,          // أقصى أبعاد صورة التحويل بعد الضغط
    UPLOAD_TIMEOUT: 45000,        // مهلة رفع صورة التحويل (مللي ثانية)
    ORDER_TIMEOUT: 45000,         // مهلة انتظار رد تسجيل الطلب (مللي ثانية)
    DONE_KEEP_HOURS: 6,           // شاشة التأكيد بتفضل متخزنة كام ساعة
    OPEN_WA_DELAY: 900,           // على الموبايل: تأخير بسيط قبل فتح واتساب (مللي ثانية)
    T_UPLOADED: 'تم رفع الصورة وهيتم مراجعة التحويل',
    T_UPLOADING: 'بنرفع الصورة، لحظة...',
    T_UPFAIL: 'تعذر رفع الصورة. اضغط هنا لإعادة المحاولة',
    T_SENDING: 'بنسجّل طلبك، استنى لحظة...',
    T_WAITUP: 'بنكمّل رفع الصورة، استنى لحظة...'
  };
  var OFFERS = {}, SET = {}, GEO = null, CUST = {}, PAY = 'cod', geoLoading = false, T0 = Date.now();
  var PF = null, UP = { state: 'idle', thumb: '', b64: '' }, sending = false, pendingSend = false, OID = '', CF = '', cfId = null, payKey = '', abT = null, abSig = '', PROF = null, popWin = null;
  try { CUST = JSON.parse(localStorage.getItem('hz_cust') || '{}'); } catch (e) {}
  try { var sp = JSON.parse(localStorage.getItem('hz_pf') || 'null'); if (sp && Date.now() - sp.t < 5 * 3600 * 1000) { PF = sp.pf; UP.state = 'done'; } } catch (e) {}
  try { PROF = JSON.parse(localStorage.getItem('hz_prof') || 'null'); } catch (e) {}
  try { var fq = /[?&]fbclid=([^&]+)/.exec(location.search); if (fq) localStorage.setItem('hz_fbc', 'fb.1.' + Date.now() + '.' + fq[1]); } catch (e) {}
  PAY = CUST.pay || 'cod';
  function save() { try { localStorage.setItem('hz_cust', JSON.stringify(CUST)); } catch (e) {} }
  function savePF() { try { if (PF) localStorage.setItem('hz_pf', JSON.stringify({ t: Date.now(), pf: PF })); else localStorage.removeItem('hz_pf'); } catch (e) {} }
  function N(v) { var n = parseFloat(v); return isNaN(n) ? 0 : n; }
  var $$ = function (id) { return document.getElementById(id); };
  var isDesk = function () { try { return matchMedia('(hover:hover) and (pointer:fine)').matches; } catch (e) { return false; } };
  window.__hzLoadGeo = function () { loadGeo(); };
  window.__hzPhone = function () { return CUST.phone || (PROF && PROF.phone) || ''; };
  function on(k, d) { var v = SET[k]; return v === undefined || v === '' || v === null ? d : String(v) !== 'لا'; }
  function depOn() { return on('العربون_مفعل', true); }
  function fullOn() { return on('الدفع_الكامل_متاح', true); }
  function proofReq() { return on('صورة_التحويل_مطلوبة', true); }
  function transferOn() { return !!(SET['رقم_المحفظة'] || SET['رقم_إنستاباي']); }
  function payNeeded() { return transferOn() && (PAY === 'full' || (PAY === 'cod' && depOn())); }
  function step() { return N(SET['خطوة_زيادة_المبلغ']) || 10; }

  var css = document.createElement('style');
  css.textContent = '#hzf{display:flex;flex-direction:column;gap:8px}#hzf h4{color:var(--gold-2);font-size:14px;margin-top:6px}#hzf input,#hzf select,#hzf textarea{width:100%;padding:10px 12px;border-radius:10px;border:1px solid rgba(216,180,114,.25);background:var(--panel);color:var(--ink);font-family:inherit;font-size:16px}#hzf textarea{min-height:64px}#hzf option:disabled{color:#766d5b}.hzr{display:flex;gap:8px}.hzr>*{flex:1}.hzp{border:1px solid rgba(216,180,114,.3);border-radius:12px;padding:10px;cursor:pointer;font-size:13px;font-weight:700;text-align:center}.hzp.on{background:linear-gradient(135deg,var(--gold-2),var(--gold));color:#1a1408}.hzn{font-size:12px;line-height:1.7;color:var(--muted)}.hzb{font-size:12px;font-weight:700;color:var(--red)}.hzd{border:1px dashed rgba(216,180,114,.5);border-radius:10px;padding:10px;font-size:13px;line-height:1.7;color:var(--gold-2)}.hzc{background:rgba(216,180,114,.12);border:1px solid var(--gold);color:var(--gold-2);border-radius:20px;padding:4px 14px;font-family:inherit;font-size:12px;font-weight:700;cursor:pointer}#csend.off{background:#2f291f;color:#766d5b;pointer-events:none}' +
    '#hzhp{position:absolute;left:-9999px;width:1px;height:1px;opacity:0}#hzeta{font-size:12.5px;font-weight:700;color:var(--green)}' +
    '.hzpay{display:flex;flex-direction:column;gap:10px;border:1px solid rgba(216,180,114,.35);border-radius:16px;padding:14px;background:linear-gradient(180deg,rgba(216,180,114,.09),rgba(216,180,114,.02))}.hzamt{text-align:center;display:flex;flex-direction:column;gap:4px;align-items:center}.hzamt small{font-size:12px;color:var(--muted)}.hzamt .big{font-size:30px;font-weight:900;color:var(--gold-2);line-height:1.2}.hzamt span{font-size:12px;color:var(--muted)}' +
    '.hzacc{display:flex;align-items:center;justify-content:space-between;gap:10px;background:var(--panel);border:1px solid rgba(216,180,114,.22);border-radius:12px;padding:10px 12px}.hzacc small{display:block;font-size:11.5px;color:var(--muted)}.hzacc b{font-size:17px;letter-spacing:.5px;color:var(--ink);direction:ltr;display:inline-block}' +
    '.hzsteps{list-style:none;counter-reset:s;display:flex;flex-direction:column;gap:6px;font-size:13px;color:var(--ink)}.hzsteps li{counter-increment:s;display:flex;align-items:center;gap:10px}.hzsteps li::before{content:counter(s);flex:none;width:22px;height:22px;border-radius:50%;background:var(--gold);color:#1a1408;font-weight:900;font-size:12px;display:flex;align-items:center;justify-content:center}' +
    '.hzst{display:flex;align-items:center;gap:10px;justify-content:center}#hzf .hzst input{width:150px;flex:none;text-align:center;font-weight:900;font-size:26px;color:var(--gold-2);background:transparent;border:1px solid rgba(216,180,114,.35);padding:6px}.hzst button{flex:none;width:44px;height:44px;border-radius:50%;border:1px solid var(--gold);background:linear-gradient(135deg,var(--gold-2),var(--gold));color:#1a1408;font-size:24px;font-weight:800;cursor:pointer;font-family:inherit;line-height:1}.hzst button:disabled{opacity:.35;cursor:not-allowed}' +
    '.hzprf{display:flex;align-items:center;gap:10px;background:var(--panel);border:1px solid rgba(216,180,114,.3);border-radius:12px;padding:8px}.hzprf img{width:62px;height:62px;border-radius:8px;object-fit:cover;flex:none;background:#2a241b}.hzprf .ph{width:62px;height:62px;border-radius:8px;flex:none;background:#2a241b;display:flex;align-items:center;justify-content:center;color:var(--gold)}.hzprf .tx{flex:1;font-size:12.5px;line-height:1.6;color:var(--gold-2);font-weight:700}.hzprf .ac{display:flex;flex-direction:column;gap:6px}.hzprf .ac button{background:transparent;border:1px solid rgba(216,180,114,.5);color:var(--gold-2);border-radius:20px;padding:4px 12px;font-family:inherit;font-size:12px;font-weight:700;cursor:pointer}.hzprf .ac button.rm{border-color:rgba(229,107,88,.6);color:#ffb3a6}' +
    '.hzspin{display:inline-block;width:14px;height:14px;border:2px solid rgba(216,180,114,.3);border-top-color:var(--gold);border-radius:50%;animation:hzsp .8s linear infinite;vertical-align:middle;margin-left:6px}@keyframes hzsp{to{transform:rotate(360deg)}}' +
    '#hzdn .hzs{text-align:center}#hzdn .hzchk{width:64px;height:64px;border-radius:50%;margin:4px auto 10px;background:rgba(84,212,149,.15);border:2px solid var(--green);color:var(--green);display:flex;align-items:center;justify-content:center;font-size:34px}#hzdn h3{justify-content:center;font-size:20px}#hzdn .hzsum{text-align:right;background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:10px 12px;margin:12px 0;font-size:13px;line-height:1.9}#hzdn ol{text-align:right;margin:10px 18px;font-size:13px;line-height:1.9;color:var(--muted)}#hzdn .btn{margin-top:8px}' +
    '.hzsv{display:flex;flex-direction:column;gap:6px}.hzsv .hzr{align-items:center}.hzsv button{background:transparent;border:1px solid rgba(216,180,114,.5);color:var(--gold-2);border-radius:20px;padding:6px 14px;font-family:inherit;font-size:12px;font-weight:700;cursor:pointer;white-space:nowrap}.hzsv input{flex:1}' +
    '.cfoot{gap:6px!important;padding:10px 16px 12px!important}.cfoot .hzm{margin:0}.cfoot .clear{padding:2px 0}.cfoot .ctotal{margin-bottom:0}.cx{font-size:11.5px;color:var(--gold);line-height:1.6;margin:-2px 0 4px}.cqmax{font-size:11px;font-weight:700;color:#f0924a;white-space:nowrap}.qty button.dim{opacity:.3;cursor:not-allowed}';
  document.head.appendChild(css);

  var _ap = applyData;
  applyData = function (d, f) { OFFERS = d.offers || {}; SET = d.settings || {}; window.__hzSET = SET; if (PAY === 'full' && !fullOn()) { PAY = 'cod'; CUST.pay = 'cod'; } _ap(d, f); payKey = ''; if ($$('cart').classList.contains('open')) renderCart(); };

  function zone() {
    if (!GEO || !CUST.gov || !CUST.city) return null;
    var l = GEO[CUST.gov] || [];
    for (var i = 0; i < l.length; i++) if (l[i].c === CUST.city) return l[i];
    return null;
  }
  // السيرفر بيبعت المحافظات مضغوطة (g: {محافظة: [[مدينة, رقم_المنطقة]]} و z: قايمة الأسعار)، هنا بنفكّها للشكل اللي باقي الكود شغال بيه
  var geoTry = 0, geoErr = false;
  function expandGeo(d) {
    if (d.geo) return d.geo;
    var G = {}; Object.keys(d.g || {}).forEach(function (k) { G[k] = d.g[k].map(function (x) { var z = x[1] >= 0 ? (d.z || [])[x[1]] : null; return { c: x[0], ok: !!z, p: z ? z.p : 0, e: z ? z.e : '' }; }); });
    return G;
  }
  function geoFail() { if (geoTry < 3) { geoTry++; setTimeout(function () { if (!GEO) loadGeo(); }, 2000 * geoTry); } else { geoErr = true; fillGov(); } }
  function loadGeo() {
    if (GEO || geoLoading) return;
    geoLoading = true;
    var nm = 'geo_' + Date.now(), s = document.createElement('script');
    window[nm] = function (d) { geoLoading = false; if (d && d.ok && (d.g || d.geo)) { GEO = expandGeo(d); window.__hzGeo = GEO; geoErr = false; fillGov(); upd(); } else geoFail(); delete window[nm]; s.remove(); };
    s.onerror = function () { geoLoading = false; geoFail(); s.remove(); };
    s.src = API_URL + '?what=geo&callback=' + nm;
    document.body.appendChild(s);
  }
  function needAmt(total, dep) {
    if (PAY === 'full') return total;
    if (!depOn()) return 0;
    var a = CUST.amt === undefined || CUST.amt === '' ? dep : N(CUST.amt);
    return Math.min(total, Math.max(dep, a));
  }
  function proofPaid(total) { return payNeeded() && PF && PF.verdict === 'ok' && PF.amount > 0 ? Math.min(N(PF.amount), total) : 0; }

  function nameValid(n) { var w = String(n || '').trim().split(/\s+/); if (w.length < 2) return false; for (var i = 0; i < w.length; i++) if (!/^[A-Za-z\u0600-\u06FF]{2,}$/.test(w[i])) return false; return true; }
  // رسوم القطع الخاصة (مقاس/طباعة) من الإعدادات
  window.__hzFee = function (cx) {
    var f = 0; if (!cx) return 0;
    if (cx.sz && on('المقاس_الخاص_مفعل', true)) { var sp = window.__hzSSP && window.__hzSSP[cx.sz.mt]; f += sp != null ? N(sp) : N(SET['سعر_المقاس_الخاص']); }
    if (cx.pr && on('الطباعة_الخاصة_مفعلة', true)) f += window.__hzPrintFee ? window.__hzPrintFee(cx.pr) : N(SET['سعر_الطباعة_الخاصة']);
    return f;
  };
  function calcFor(items, extraUnit) {
    var g = {}, sub = 0, n = 0, disc = 0, low = 0;
    items.forEach(function (it) {
      var p = ALL.filter(function (x) { return x.code === it.code; })[0], k = (p && p.offer) || '', pr = toNum(it.price), fee = it.fee || 0;
      g[k] = g[k] || { n: 0, s: 0 }; g[k].n += it.qty; g[k].s += pr * it.qty; sub += (pr + fee) * it.qty; n += it.qty; if (!low || pr < low) low = pr;
    });
    Object.keys(g).forEach(function (k) {
      var t = (OFFERS[k] || []).filter(function (x) { return x.n <= g[k].n; }).sort(function (a, b) { return b.n - a.n; })[0];
      if (k && t) disc += Math.round(g[k].s * (1 - t.price / (t.n * (t.ref > 0 ? t.ref : g[k].s / g[k].n))));
    });
    var promo = extraUnit ? 0 : (promoApplied ? Math.min(promoApplied.discount, sub - disc) : 0), z = zone();
    var ship = n >= (N(SET['شحن_مجاني_من_قطع']) || 2) ? 0 : (z && z.p ? z.p : 0);
    return { n: n, sub: sub, discount: disc, promo: promo, ship: ship, total: Math.max(0, sub - disc - promo + ship), last: low };
  }
  calcPricing = function () {
    var r = calcFor(cart), dep = PAY === 'full' || !depOn() ? 0 : (r.n === 1 ? N(SET['عربون_قطعة']) : N(SET['عربون_قطعتين_فأكثر']));
    r.dep = dep; r.paid = proofPaid(r.total); r.left = Math.max(0, r.total - r.paid); return r;
  };
  // "زوّد قطعة وهتوفر X": X = إجمالي توفيرك (خصم العروض + الشحن المجاني) بعد إضافة قطعة
  function nudgeText() {
    if (!cart.length) return '';
    var base = N(SET['شحن_مجاني_من_قطع']) || 2, z = zone(), shipBase = z && z.p ? z.p : SHIP_FEE;
    var p0 = calcFor(cart), cheap = null;
    cart.forEach(function (i) { if (!cheap || toNum(i.price) < toNum(cheap.price)) cheap = i; });
    var plus = cart.map(function (i) { return i; }).concat([{ code: cheap.code, price: cheap.price, qty: 1, fee: 0 }]), p1 = calcFor(plus, true);
    var s0 = p0.discount + (p0.n >= base ? shipBase : 0), s1 = p1.discount + (p1.n >= base ? shipBase : 0);
    if (s1 <= s0) return '';
    return 'زوّد قطعة وهتوفر ' + fmt(s1 - s0) + ' ' + CURRENCY + ' · إجمالي توفيرك ' + fmt(s1) + ' ' + CURRENCY;
  }

  function formValid() {
    var z = zone(), p = /^01\d{9}$/;
    if (!CUST.name || !nameValid(CUST.name) || !/^\d{2}$/.test(CUST.age || '') || +CUST.age < 10 || !p.test(CUST.phone || '') || (CUST.phone2 && !p.test(CUST.phone2)) || !CUST.gov || !CUST.city || !z || !z.ok || !CUST.address || CUST.address.length < 6) return false;
    return cart.length > 0;
  }
  function payValid() { if (!payNeeded() || !proofReq()) return true; return UP.state === 'up' || UP.state === 'done' || (UP.state === 'fail' && UP.skip === true); }
  function valid() { return formValid() && payValid(); }

  function fillGov() {
    var g = $$('hzg'); if (!g) return;
    if (!GEO) { g.innerHTML = '<option value="">' + (geoErr ? 'تعذّر تحميل المحافظات، دوس هنا للمحاولة تاني' : 'جاري تحميل المحافظات...') + '</option>'; g.onfocus = g.onmousedown = function () { if (!GEO && !geoLoading) { geoTry = 0; geoErr = false; loadGeo(); } }; return; }
    g.onfocus = g.onmousedown = null;
    g.innerHTML = '<option value="">اختار المحافظة</option>';
    Object.keys(GEO).forEach(function (k) {
      var ok = GEO[k].some(function (c) { return c.ok; }), o = el('option', '', k + (ok ? '' : ' (غير متاح)')); o.value = k; if (!ok) o.disabled = true; g.appendChild(o);
    });
    g.value = CUST.gov || ''; fillCity();
  }
  function fillCity() {
    var c = $$('hzc'); if (!c) return;
    c.innerHTML = '<option value="">اختار المدينة</option>';
    (GEO && GEO[CUST.gov] || []).forEach(function (x) { var o = el('option', '', x.c + (x.ok ? '' : ' (غير متاح)')); o.value = x.c; if (!x.ok) o.disabled = true; c.appendChild(o); });
    c.value = CUST.city || '';
  }

  // ---- عناوين محفوظة (من حساب العميل) ----
  var NEWADDR = false;
  function addrBox() {
    var b = $$('hzsvb'); if (!b) return;
    var a = PROF && PROF.addrs || [], h = '';
    var si = -1; a.forEach(function (x, i) { if (si < 0 && x.gov === CUST.gov && x.city === CUST.city && x.a === CUST.address) si = i; });
    var savedMode = a.length && si >= 0 && !NEWADDR;
    if (a.length) {
      h += '<select id="hzsvs"><option value="">اختار عنوان محفوظ</option>' + a.map(function (x, i) { return '<option value="' + i + '">' + (x.l || 'عنوان') + ' - ' + x.city + '</option>'; }).join('') + '<option value="new">استخدم عنوان تاني</option></select>';
    }
    var hide = savedMode ? 'none' : '';
    ['hzg', 'hzc'].forEach(function (i) { if ($$(i)) $$(i).parentNode.style.display = hide; });
    if ($$('hzad')) $$('hzad').style.display = hide; if ($$('hzw')) $$('hzw').style.display = hide;
    var same = a.some(function (x) { return x.gov === CUST.gov && x.city === CUST.city && x.a === CUST.address; });
    var b2 = $$('hzsvb2'); if (!b2 && $$('hzad')) { b2 = document.createElement('div'); b2.id = 'hzsvb2'; b2.className = 'hzsv'; $$('hzad').parentNode.insertBefore(b2, $$('hzad').nextSibling); }
    var sv = '';
    if (window.__hzAuth && window.__hzAuth() && CUST.gov && CUST.city && CUST.address && CUST.address.length > 5 && !same) sv = '<div class="hzr"><input id="hzsvl" placeholder="اسم العنوان (البيت / الشغل)"><button type="button" id="hzsvg">احفظ العنوان ده</button></div>';
    if (b2) b2.innerHTML = sv;
    b.innerHTML = h;
    var s = $$('hzsvs');
    if (s) s.value = savedMode ? String(si) : (NEWADDR ? 'new' : '');
    if (s) s.onchange = function () {
      NEWADDR = this.value === 'new';
      if (this.value === 'new') { CUST.gov = ''; CUST.city = ''; CUST.address = ''; }
      else if (this.value !== '') { var x = a[+this.value]; CUST.gov = x.gov; CUST.city = x.city; CUST.address = x.a; }
      else return;
      save(); $$('hzad').value = CUST.address || ''; fillGov(); renderCart(); addrBox();
    };
    var g = $$('hzsvg');
    if (g) g.onclick = function () { var l = ($$('hzsvl').value || 'عنوان').trim(); g.disabled = true; window.__hzSaveAddr({ l: l, gov: CUST.gov, city: CUST.city, a: CUST.address }, function (ok) { showToast(ok ? 'اتحفظ العنوان' : 'معرفناش نحفظه، جرب تاني'); if (ok) addrBox(); else g.disabled = false; }); };
  }
  document.addEventListener('hzprof', function (e) {
    PROF = e.detail || null; try { localStorage.setItem('hz_prof', JSON.stringify(PROF)); } catch (x) {}
    if (PROF) {
      var ch = false;
      if (!CUST.name && PROF.name) { CUST.name = PROF.name; ch = true; }
      if (!CUST.age && PROF.age) { CUST.age = PROF.age; ch = true; }
      if (!CUST.phone && PROF.phone) { CUST.phone = PROF.phone; ch = true; }
      if (!CUST.phone2 && PROF.ph2) { CUST.phone2 = PROF.ph2; ch = true; }
      if (!CUST.address && PROF.addrs && PROF.addrs[0]) { var x = PROF.addrs[0]; CUST.gov = x.gov; CUST.city = x.city; CUST.address = x.a; ch = true; }
      if (ch) { save(); var f = $$('hzf'); if (f) { f.remove(); } if ($$('cart').classList.contains('open') && cart.length) renderCart(); }
    }
    addrBox();
  });

  function build() {
    if ($$('hzf')) return;
    if (PROF) {
      if (!CUST.name && PROF.name) CUST.name = PROF.name; if (!CUST.age && PROF.age) CUST.age = PROF.age; if (!CUST.phone && PROF.phone) CUST.phone = PROF.phone; if (!CUST.phone2 && PROF.ph2) CUST.phone2 = PROF.ph2;
      if (!CUST.address && PROF.addrs && PROF.addrs[0]) { var x0 = PROF.addrs[0]; CUST.gov = x0.gov; CUST.city = x0.city; CUST.address = x0.a; }
    }
    var f = el('div'); f.id = 'hzf';
    f.innerHTML = '<h4>بيانات العميل</h4><input id="hzn" placeholder="الاسم الثنائي (الأول والأخير)" autocomplete="name"><div id="hzne" class="hzb"></div><div class="hzr"><input id="hza" type="text" inputmode="numeric" maxlength="2" placeholder="السن"><input id="hzt" type="tel" dir="ltr" placeholder="رقم التليفون"></div><input id="hzt2" type="tel" dir="ltr" placeholder="رقم تاني (اختياري)"><div class="hzsv" id="hzsvb"></div><div class="hzr"><select id="hzg"></select><select id="hzc"></select></div><div id="hzw" class="hzb"></div><div id="hzeta"></div><textarea id="hzad" placeholder="العنوان بالتفصيل"></textarea><textarea id="hzno" placeholder="ملاحظات للتوصيل (اختياري)"></textarea><input id="hzhp" type="text" tabindex="-1" autocomplete="off" aria-hidden="true"><div id="hzpayh"></div><div id="hzpi"></div><div id="hzts"></div><div id="hzmsg2" class="hzb"></div>';
    $$('cscroll').insertBefore(f, $$('promobox'));
    var map = { hzn: 'name', hza: 'age', hzt: 'phone', hzt2: 'phone2', hzad: 'address', hzno: 'notes' };
    Object.keys(map).forEach(function (id) { $$(id).value = CUST[map[id]] || ''; $$(id).addEventListener('input', function () { var v = this.value.trim(); if (id === 'hza') { v = v.replace(/\D/g, '').slice(0, 2); this.value = v; } if (id === 'hzt' || id === 'hzt2') { v = v.replace(/[^\d]/g, ''); } CUST[map[id]] = v; save(); upd(); abandonSoon(); if (id === 'hzad') addrBox(); }); });
    $$('hzg').addEventListener('change', function () { CUST.gov = this.value; CUST.city = ''; save(); fillCity(); renderCart(); });
    $$('hzc').addEventListener('change', function () { CUST.city = this.value; save(); renderCart(); addrBox(); });
    fillGov(); addrBox(); $$('hzad').addEventListener('change', addrBox);
  }

  function cp(t) { try { navigator.clipboard.writeText(t); showToast(T_COPIED); } catch (e) { window.prompt('', t); } }
  function acct(label, v) { return '<div class="hzacc"><div><small>' + label + '</small><b>' + v + '</b></div><button type="button" class="hzc" data-c="' + v + '">نسخ</button></div>'; }

  // ---- صورة التحويل: ضغط + رفع في الخلفية + مصغّرة ----
  function compress(file, cb) {
    var img = new Image(), u = URL.createObjectURL(file);
    img.onload = function () {
      try {
        var m = HZ.UPLOAD_MAX_PX, r = Math.min(1, m / Math.max(img.width, img.height)), c = document.createElement('canvas');
        c.width = Math.round(img.width * r); c.height = Math.round(img.height * r);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(u);
        var t = document.createElement('canvas'), tr = 120 / Math.max(c.width, c.height); t.width = Math.round(c.width * tr); t.height = Math.round(c.height * tr);
        t.getContext('2d').drawImage(c, 0, 0, t.width, t.height);
        cb(c.toDataURL('image/jpeg', 0.82).split(',')[1], t.toDataURL('image/jpeg', 0.7));
      } catch (e) { cb(null); }
    };
    img.onerror = function () { URL.revokeObjectURL(u); cb(null); };
    img.src = u;
  }
  function pickFile(f) {
    if (!f || !/^image\//.test(f.type)) { showToast('اختار صورة التحويل'); return; }
    compress(f, function (b64, thumb) {
      if (!b64) { showToast('معرفناش نقرأ الصورة، جرب صورة تانية'); return; }
      PF = null; savePF(); UP = { state: 'up', thumb: thumb, b64: b64 }; renderProof(); upd(); doUpload();
    });
  }
  function doUpload() {
    var pr = calcPricing(), need = needAmt(pr.total, pr.dep), mine = UP.b64;
    UP.state = 'up'; renderProof();
    postApi({ type: 'proof', img: UP.b64, mime: 'image/jpeg', expected: need }, function (r) {
      if (UP.b64 !== mine) return;                                // اتبدّلت بصورة تانية
      if (r && r.ok) { PF = { ref: r.ref, verdict: r.verdict, amount: N(r.amount) }; UP.state = 'done'; savePF(); }
      else { UP.state = 'fail'; UP.fails = (UP.fails || 0) + 1; try { window.hzReport('proof-upload', (r && r.error ? 'رد السيرفر: ' + r.error : 'مفيش رد (مهلة أو شبكة)') + ' | حجم الصورة ' + Math.round(UP.b64.length / 1024) + 'KB'); } catch (e) {} }
      renderCart();
      if (UP.state === 'done' && pendingSend) { pendingSend = false; submit(); }
      else if (UP.state === 'fail' && pendingSend) { pendingSend = false; sending = false; closePop(); upd(); showToast('رفع الصورة فشل. جرب تاني أو كمّل بدون صورة'); }
    }, HZ.UPLOAD_TIMEOUT || 45000);
  }
  function clearProof() { PF = null; savePF(); UP = { state: 'idle', thumb: '', b64: '' }; pendingSend = false; renderCart(); }
  function renderProof() {
    var b = $$('hzprf'); if (!b) return;
    if (UP.state === 'idle') { b.innerHTML = '<button type="button" class="btn add" id="hzpick">ارفع صورة التحويل (سكرين شوت)</button>'; $$('hzpick').onclick = function () { $$('hzfile').click(); }; return; }
    var th = UP.thumb ? '<img alt="" src="' + UP.thumb + '">' : '<div class="ph"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M21 16l-5-5-8 8"/></svg></div>';
    var tx = UP.state === 'up' ? '<span class="hzspin"></span>' + HZ.T_UPLOADING : (UP.state === 'fail' ? (UP.skip ? 'هنكمّل الطلب من غير صورة، وهنراجع التحويل معاك على واتساب. <a href="#" id="hzretry" style="color:#f3dca6">ارفع الصورة</a>' : '<a href="#" id="hzretry" style="color:#ffb3a6">' + HZ.T_UPFAIL + '</a><br><a href="#" id="hzskip" style="color:#f3dca6;font-size:12px">كمّل الطلب من غير صورة (آخر حل)</a>') : HZ.T_UPLOADED);
    b.innerHTML = '<div class="hzprf">' + th + '<div class="tx">' + tx + '</div><div class="ac"><button type="button" id="hzrep">استبدال</button><button type="button" class="rm" id="hzrm">حذف</button></div></div>';
    $$('hzrep').onclick = function () { $$('hzfile').click(); }; $$('hzrm').onclick = clearProof;
    var rt = $$('hzretry'); if (rt) rt.onclick = function (e) { e.preventDefault(); UP.skip = false; if (UP.b64) doUpload(); else clearProof(); };
    var sk = $$('hzskip'); if (sk) sk.onclick = function (e) { e.preventDefault(); UP.skip = true; renderProof(); upd(); };
  }
  function buildPay(pr) {
    var h = '', head = '';
    var showChoice = fullOn(), hasPay = depOn() || fullOn();
    if (hasPay && transferOn()) {
      head = '<h4>طريقة الدفع</h4>' + (showChoice ? '<div class="hzr"><div class="hzp" id="hzp1">' + (depOn() ? 'عند الاستلام (بعربون)' : 'عند الاستلام') + '</div><div class="hzp" id="hzp2">دفع كامل بالمحفظة / إنستاباي</div></div>' : '');
    } else if (!depOn() && !fullOn()) head = '<h4>طريقة الدفع</h4><div class="hzn">الدفع عند الاستلام.</div>';
    $$('hzpayh').innerHTML = head;
    if ($$('hzp1')) { $$('hzp1').onclick = function () { PAY = 'cod'; CUST.pay = PAY; CUST.amt = ''; save(); renderCart(); }; $$('hzp2').onclick = function () { PAY = 'full'; CUST.pay = PAY; CUST.amt = ''; save(); renderCart(); }; }
    if (!payNeeded()) { $$('hzpi').innerHTML = ''; return; }
    var full = PAY === 'full', need = needAmt(pr.total, pr.dep), w = SET['رقم_المحفظة'], ip = SET['رقم_إنستاباي'], nm = SET['اسم_مستلم_التحويل'];
    if (!full) h += '<div class="hzd">العربون لجدية الحجز بيتخصم من إجمالي طلبك عند الاستلام.<br>• بيترد لك كامل لو الطلب اتلغى قبل الشحن، أو لو في عيب أو مشكلة من ناحيتنا.<br>• لو رفضت الاستلام من غير عيب، بيتخصم لتغطية مصاريف الشحن ذهاباً وإياباً.</div>';
    h += '<div class="hzpay"><div class="hzamt"><small>المطلوب تحويله دلوقتي</small>';
    if (!full) h += '<div class="hzst"><button type="button" id="hzpp" aria-label="زيادة">+</button><input id="hzamt" inputmode="numeric" value="' + fmt(need) + '"><button type="button" id="hzm" aria-label="تقليل">−</button></div><span>' + CURRENCY + ' · الحد الأدنى ' + fmt(pr.dep) + '</span><span id="hzrest"></span>';
    else h += '<div class="big">' + fmt(need) + ' ' + CURRENCY + '</div><span>قيمة الطلب كامل</span>';
    h += '</div>';
    h += (w ? acct('محفظة وي باي' + (nm ? ' - ' + nm : ''), w) : '') + (ip ? acct('إنستاباي' + (nm ? ' - ' + nm : ''), ip) : '');
    h += '<ol class="hzsteps"><li>حوّل المبلغ على أحد الأرقام فوق</li><li>خد سكرين شوت لصفحة نجاح التحويل</li><li>ارفعه هنا وكمّل طلبك على طول</li></ol>';
    h += '<input type="file" id="hzfile" accept="image/*" hidden><div id="hzprf"></div></div>';
    $$('hzpi').innerHTML = h;
    Array.prototype.forEach.call(document.querySelectorAll('#hzpi .hzc'), function (b) { b.addEventListener('click', function () { cp(b.getAttribute('data-c')); }); });
    if ($$('hzamt')) {
      var setA = function (v) { v = Math.max(pr.dep, Math.min(pr.total, Math.round(v))); CUST.amt = String(v); save(); payKey = ''; renderCart(); };
      $$('hzm').onclick = function () { setA(N($$('hzamt').value) - step()); };
      $$('hzpp').onclick = function () { setA(N($$('hzamt').value) + step()); };
      $$('hzamt').onchange = function () { setA(N(this.value)); };
      $$('hzm').disabled = need <= pr.dep; $$('hzpp').disabled = need >= pr.total;
    }
    $$('hzfile').onchange = function () { pickFile(this.files && this.files[0]); this.value = ''; };
    renderProof();
  }

  function upd() {
    if (!$$('hzf')) return;
    var pr = calcPricing(), z = zone(), w = $$('hzw');
    if ($$('hzp1')) { $$('hzp1').className = 'hzp' + (PAY === 'cod' ? ' on' : ''); $$('hzp2').className = 'hzp' + (PAY === 'full' ? ' on' : ''); }
    w.innerHTML = ''; $$('hzne').textContent = CUST.name && !nameValid(CUST.name) ? 'اكتب الاسم ثنائي على الأقل (كل كلمة حرفين أو أكتر)' : '';
    if (CUST.gov && CUST.city && z && !z.ok) w.textContent = 'الشحن غير متاح لهذه المدينة';
    else if (CUST.gov && GEO && !(GEO[CUST.gov] || []).some(function (c) { return c.ok; })) w.textContent = 'الشحن غير متاح لهذه المحافظة';
    if (w.textContent) { var a = el('a', '', ' كلمنا على واتساب'); a.href = $$('fab').href; a.target = '_blank'; w.appendChild(a); }
    $$('hzeta').textContent = z && z.ok && z.e ? 'موعد التسليم المتوقع: ' + z.e : '';
    var key = [PAY, needAmt(pr.total, pr.dep), depOn(), fullOn(), SET['رقم_المحفظة'], SET['رقم_إنستاباي'], SET['اسم_مستلم_التحويل']].join('|');
    if (key !== payKey || !$$('hzpayh').firstChild && !$$('hzpi').firstChild) { payKey = key; buildPay(pr); }
    renderProof();
    var rs = $$('hzrest'); if (rs) rs.textContent = 'المتبقي عند الاستلام: ' + fmt(Math.max(0, pr.total - needAmt(pr.total, pr.dep))) + ' ' + CURRENCY;
    var s = $$('csend'), ok = valid();
    s.className = 'btn wa' + (ok && !sending ? '' : ' off');
    s.removeAttribute('href');
    $$('hzmsg2').textContent = formValid() && !payValid() ? 'ارفع صورة التحويل عشان تقدر تكمّل الطلب' : '';
    if (!s.getAttribute('data-t')) s.setAttribute('data-t', s.textContent);
    s.textContent = sending ? (pendingSend ? HZ.T_WAITUP : HZ.T_SENDING) : s.getAttribute('data-t');
    initTS();
  }

  var _rc = renderCart;
  renderCart = function () {
    _rc(); if (!cart.length) return; build(); loadGeo();
    var pr = calcPricing();
    var nt = nudgeText(), nd = $$('cnudge'); nd.textContent = nt; nd.style.display = nt ? 'block' : 'none';
    if (pr.paid > 0) {
      var sum = $$('csum'), ins = sum.querySelector('.sins');
      sum.insertBefore(sumRow('تحويل مؤكد', '-' + fmt(pr.paid) + ' ' + CURRENCY, 'disc'), ins);
      var t = $$('ctot'); t.innerHTML = ''; t.appendChild(document.createTextNode(fmt(pr.left))); t.appendChild(el('small', '', CURRENCY));
      window.__hzLbl = 'المتبقي عند الاستلام';
    } else window.__hzLbl = '';
    upd();
  };

  // ---- رسالة الواتساب: المنتجات ثم الفاتورة ثم بيانات العميل ثم الإجماليات ثم اللينك ----
  function cxLines(it) { return it.cx && window.cxText ? '\n   ' + window.cxText(it.cx).replace(/ \|\| /g, '\n   ') : ''; }
  function msgFor(inv, trackUrl, pr, snap) {
    var L = [T_GREET];
    snap.forEach(function (it, i) { L.push((i + 1) + ') ' + it.name + (it.color ? ' - ' + T_COLOR + ' ' + it.color : '') + (it.size ? ' - ' + T_SIZE + ' ' + it.size : '') + ' (' + T_CODE + ' ' + dcode(it.code) + ') × ' + it.qty + cxLines(it)); });
    L.push(''); L.push('رقم الفاتورة: ' + inv); L.push('');
    L.push('الاسم: ' + CUST.name, 'السن: ' + CUST.age, 'تليفون: ' + CUST.phone + (CUST.phone2 ? ' - ' + CUST.phone2 : ''), 'العنوان: ' + CUST.gov + ' - ' + CUST.city + ' - ' + CUST.address);
    if (CUST.notes) L.push('ملاحظات: ' + CUST.notes);
    L.push('');
    L.push(T_SUB + ': ' + fmt(pr.sub) + ' ' + CURRENCY);
    if (pr.discount > 0) L.push(T_DISC + ': -' + fmt(pr.discount) + ' ' + CURRENCY);
    if (pr.promo > 0 && promoApplied) L.push(T_PROMO_LINE + ' (' + promoApplied.code + '): -' + fmt(pr.promo) + ' ' + CURRENCY);
    L.push(T_SHIP + ': ' + (pr.ship === 0 ? T_FREE : fmt(pr.ship) + ' ' + CURRENCY));
    L.push(T_TOTAL + ': ' + fmt(pr.total) + ' ' + CURRENCY);
    if (payNeeded()) L.push('الدفع: ' + (PAY === 'full' ? 'دفع كامل بالمحفظة' : 'عند الاستلام بعربون ' + fmt(needAmt(pr.total, pr.dep)) + ' ' + CURRENCY));
    else L.push('الدفع: عند الاستلام');
    if (pr.paid) { L.push('تحويل مؤكد: ' + fmt(pr.paid) + ' ' + CURRENCY); L.push('المتبقي عند الاستلام: ' + fmt(pr.left) + ' ' + CURRENCY); }
    if (trackUrl) { L.push(''); L.push('تابع طلبك: ' + trackUrl); }
    return L.join('\n');
  }
  buildOrderMsg = function () { var pr = calcPricing(); return msgFor('(هيتحدد بعد التسجيل)', '', pr, cart); };
  logOrder = function () {};

  function initTS() {
    var key = SET['TURNSTILE_SITE_KEY']; if (!key || cfId !== null || !$$('hzts')) return;
    cfId = -1;
    var s = document.createElement('script'); s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'; s.async = true;
    s.onload = function () { try { cfId = window.turnstile.render('#hzts', { sitekey: key, theme: 'dark', callback: function (t) { CF = t; }, 'expired-callback': function () { CF = ''; }, 'error-callback': function () { CF = ''; } }); } catch (e) { cfId = null; } };
    s.onerror = function () { cfId = null; };
    document.head.appendChild(s);
  }

  function abandonSoon() {
    if (SET['السلة_المتروكة'] === 'لا' || !/^01\d{9}$/.test(CUST.phone || '') || !cart.length) return;
    clearTimeout(abT); abT = setTimeout(function () {
      var sig = CUST.phone + '|' + cart.map(function (i) { return i.key + i.qty; }).join(',');
      if (sig === abSig) return; abSig = sig;
      postApi({ type: 'abandon', phone: CUST.phone, total: calcPricing().total, items: cart.map(function (i) { return { code: i.code, name: i.name, color: i.color, size: i.size, qty: i.qty }; }) }, function () {}, 20000);
    }, 4000);
  }
  var _sc = saveCart; saveCart = function () { _sc(); abandonSoon(); };

  window.__hzStock = function (cb) {
    postApi({ type: 'stock', items: cart.map(function (i) { return { code: i.code, color: i.color, size: i.size, qty: i.qty }; }) }, function (r) {
      if (!r || !r.ok || !r.items || !r.items.length) { cb(true); return; }
      fixStock(r.items); cb(false);
    }, 25000);
  };
  function fixStock(bad) {
    var msgs = [];
    bad.forEach(function (b) {
      cart.forEach(function (i) { if (i.code === b.code && i.color === b.color && i.size === b.size) { if (b.left > 0) { msgs.push(b.name + ' ' + b.size + ': المتاح ' + b.left + ' بس'); i.qty = Math.min(i.qty, b.left); } else { msgs.push(b.name + ' ' + b.color + ' ' + b.size + ' خلص'); i.qty = 0; } } });
    });
    cart = cart.filter(function (i) { return i.qty > 0; }); saveCart(); updateBadge(); renderCart();
    showToast(msgs.join(' | ') || 'في صنف اتغيّر في المخزون');
  }

  // ---- شاشة التأكيد: بتتخزن وبتتفتح تاني لو رجع بالـ Back ----
  function newOid() { return Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 8).toUpperCase(); }
  function beacon(o) { try { var b = JSON.stringify(o); if (!(navigator.sendBeacon && navigator.sendBeacon(API_URL, b))) fetch(API_URL, { method: 'POST', keepalive: true, mode: 'no-cors', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: b }); } catch (e) {} }
  function closePop() { try { if (popWin && !popWin.closed) popWin.close(); } catch (e) {} popWin = null; }
  function showDone(D, fresh) {
    var res = D.res, o = $$('hzdn');
    if (!o) { o = document.createElement('div'); o.id = 'hzdn'; o.className = 'hzo'; o.innerHTML = '<div class="hzs"></div>'; document.body.appendChild(o); }
    var s = o.querySelector('.hzs'), pr = D.pr || {};
    s.innerHTML = '<div class="hzchk">✓</div><h3>تم استلام طلبك</h3><div class="hzm" style="font-size:15px">رقم الفاتورة: <b dir="ltr" style="color:var(--gold-2)">' + res.inv + '</b></div>' +
      '<div class="hzsum">' + D.items.map(function (i) { return i.name + ' - ' + i.color + ' - ' + i.size + ' ×' + i.qty; }).join('<br>') + '<hr style="border:0;border-top:1px solid var(--line);margin:8px 0">الإجمالي: <b>' + fmt(res.net) + ' ' + CURRENCY + '</b>' + (res.proof ? '<br>تحويل مؤكد: <b>' + fmt(res.proof) + ' ' + CURRENCY + '</b><br>المتبقي عند الاستلام: <b>' + fmt(Math.max(0, res.net - res.proof)) + ' ' + CURRENCY + '</b>' : '') + (res.eta ? '<br>موعد التسليم المتوقع: <b>' + res.eta + '</b>' : '') + '</div>' +
      '<ol><li>ابعت رسالة الطلب على واتساب عشان نأكده معاك</li><li>هنتواصل معاك ونأكد الطلب' + (res.special ? ' (وفيه قطعة خاصة هنتفق معاك على تفاصيلها)' : '') + '</li><li>بعد التأكيد بنشحنه ونبعتلك رقم المندوب</li></ol>' +
      '<a class="btn wa" id="hzdwa" target="_blank" rel="noopener" href="' + D.wa + '">افتح واتساب لتأكيد الطلب</a>' +
      '<button class="btn add" type="button" id="hztrk">تتبع طلبك</button><button class="hzlink" type="button" id="hzdx" style="margin-top:10px">كمّل تسوق</button>';
    o.classList.add('open');
    $$('hzdwa').onclick = function () { beacon({ type: 'wa_click', inv: res.inv, tk: res.tk }); };
    $$('hzdx').onclick = function () { dismissDone(); closeCart(); };
    $$('hztrk').onclick = function () { dismissDone(); closeCart(); if (window.__hzTrack) window.__hzTrack(res.inv + '.' + res.tk); };
    if (fresh) { try { sessionStorage.setItem('hz_done', JSON.stringify({ t: Date.now(), D: D })); history.pushState({ hz: 'done' }, '', location.pathname + location.search); } catch (e) {} }
  }
  function dismissDone() {
    var o = $$('hzdn'); if (o) o.classList.remove('open');
    try { sessionStorage.removeItem('hz_done'); } catch (e) {}
    if (history.state && history.state.hz === 'done') { try { history.back(); } catch (e) {} }
  }
  window.addEventListener('popstate', function () { var o = $$('hzdn'); if (o && o.classList.contains('open') && !(history.state && history.state.hz === 'done')) { o.classList.remove('open'); try { sessionStorage.removeItem('hz_done'); } catch (e) {} } });
  (function restore() {
    try {
      var d = JSON.parse(sessionStorage.getItem('hz_done') || 'null');
      if (d && Date.now() - d.t < HZ.DONE_KEEP_HOURS * 3600000) { if (history.state && history.state.hz === 'done') setTimeout(function () { showDone(d.D, false); }, 50); else sessionStorage.removeItem('hz_done'); }
    } catch (e) {}
  })();

  function fbData() {
    function ck(n) { var m = document.cookie.match('(?:^|; )' + n + '=([^;]*)'); return m ? decodeURIComponent(m[1]) : ''; }
    var fbc = ck('_fbc'); if (!fbc) { try { fbc = localStorage.getItem('hz_fbc') || ''; } catch (e) {} }
    return { fbp: ck('_fbp'), fbc: fbc, ua: navigator.userAgent, eid: OID, url: location.href.split('#')[0] };
  }
  function submit() {
    if (sending && !pendingSend) return;
    if (!valid()) return;
    if (UP.state === 'up') { sending = true; pendingSend = true; upd(); return; }           // استنى لحد ما الصورة تخلص رفع
    if (UP.state === 'fail' && !UP.skip && payNeeded() && proofReq()) { showToast('الصورة محتاجة ترفع تاني. اضغط على إعادة المحاولة'); return; }
    sending = true; OID = OID || newOid(); upd();
    var pr = calcPricing(), snap = cart.map(function (i) { return { name: i.name, color: i.color, size: i.size, qty: i.qty, code: i.code, cx: i.cx }; });
    var payload = {
      type: 'order', oid: OID, hp: ($$('hzhp') || {}).value || '', ft: Date.now() - T0, cf: CF, proofRef: PF && payNeeded() ? PF.ref : '', noProof: !!(UP.skip && payNeeded() && proofReq() && !(PF && PF.ref)), fb: fbData(),
      items: cart.map(function (i) { return { code: i.code, color: i.color, size: i.size, qty: i.qty, cx: i.cx ? JSON.parse(JSON.stringify(i.cx, function (k, v) { return k === 'th' ? undefined : v; })) : undefined }; }),
      customer: { name: CUST.name, age: CUST.age, phone: CUST.phone, phone2: CUST.phone2 || '', gov: CUST.gov, city: CUST.city, address: CUST.address, notes: CUST.notes || '' },
      promo: promoApplied ? promoApplied.code : '', pay: { method: PAY, amount: needAmt(pr.total, pr.dep) }, src: (location.search.match(/utm_source=([^&]+)/) || [])[1] || ''
    };
    var tries = 0;
    (function go() {
      postApi(payload, function (r) {
        if (!r && ++tries < 3) { setTimeout(go, 1500 * tries); return; }
        sending = false;
        if (r && r.ok) {
          track('Lead', { content_ids: snap.map(function (i) { return i.code; }), num_items: pr.n, value: pr.total, currency: 'EGP', eventID: OID });
          var wa = 'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(msgFor(r.inv, r.trackUrl, pr, snap));
          cart = []; saveCart(); updateBadge(); promoApplied = null; savePromo(); PF = null; savePF(); UP = { state: 'idle', thumb: '', b64: '' }; OID = ''; CUST.amt = ''; save(); payKey = '';
          if (window.turnstile && cfId !== null && cfId !== -1) { try { window.turnstile.reset(cfId); } catch (e) {} } CF = '';
          var D = { res: r, wa: wa, pr: pr, items: snap };
          renderCart(); showDone(D, true);
          if (isDesk()) {                                                   // الكمبيوتر: واتساب في تاب جديد، والموقع يفضل قدامه
            if (popWin && !popWin.closed) { try { popWin.location.href = wa; beacon({ type: 'wa_click', inv: r.inv, tk: r.tk }); } catch (e) {} popWin = null; }
          } else {                                                          // الموبايل: واتساب على طول (الموقع يفضل ورا)
            setTimeout(function () { beacon({ type: 'wa_click', inv: r.inv, tk: r.tk }); window.location.href = wa; }, HZ.OPEN_WA_DELAY);
          }
          return;
        }
        closePop();
        var e = r && r.error, m = { stock: 'في صنف خلص من المخزون', closed: 'الطلبات متوقفة مؤقتاً، كلمنا على واتساب', rate: 'الموقع مشغول لحظات، استنى نص دقيقة وجرب تاني. طلبك مش هيتسجل مرتين.', designs: 'عدد التصاميم في القطعة أكبر من المسموح', human: 'محتاجين نتأكد إنك مش روبوت، استنى لحظة وجرب تاني', blocked: 'مقدرناش نكمّل الطلب ده. كلمنا على واتساب', too_many: 'عندك طلبات مفتوحة كتير، كلمنا على واتساب', shipping_unavailable: 'الشحن غير متاح للمدينة دي', invalid: 'راجع بياناتك وجرب تاني', item: 'في صنف في السلة اتغيّر، حدّث الصفحة' }[e] || 'حصل خطأ، جرب تاني. طلبك مش هيتسجل مرتين.';
        if (e === 'stock' && r.items) fixStock(r.items); else showToast(m);
        if (e === 'human' && window.turnstile && cfId !== null && cfId !== -1) { try { window.turnstile.reset(cfId); } catch (x) {} }
        if (e !== 'rate' && e !== 'human' && e !== 'server' && e) OID = '';
        upd();
      }, HZ.ORDER_TIMEOUT);
    })();
  }
  $$('csend').addEventListener('click', function (e) {
    e.preventDefault(); e.stopImmediatePropagation();
    if (!formValid()) { showToast('كمّل بيانات الطلب الأول'); return; }
    if (!payValid()) { showToast('ارفع صورة التحويل الأول'); return; }
    if (sending) return;
    if (isDesk()) { try { popWin = window.open('', '_blank'); if (popWin) popWin.document.write('<meta charset="utf-8"><body style="background:#1c1812;color:#f3dca6;font-family:sans-serif;text-align:center;padding-top:20vh">بنجهّز واتساب، استنى لحظة...</body>'); } catch (x) { popWin = null; } }
    submit();
  }, true);
})();
