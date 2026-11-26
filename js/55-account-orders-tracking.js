/* FILE: js/55-account-orders-tracking.js
   حساب العميل: دخول/تسجيل، البروفايل، قائمة الطلبات، التتبع، الاسترجاع
   (جزء من HoodZilla — بيتحمّل بالترتيب من index.html، والـ global scope مشترك بين كل الملفات. راجع FILES-GUIDE.md) */
(function () {
  /* ===================== التتبع والحساب (أيقونات في الهيدر + صفحات الطلبات) ===================== */
  var HZT = {
    DOT_CHECK_MIN: 5,          // كل كام دقيقة نفحص لو حالة طلب اتغيرت (للنقطة الحمراء)
    FORGOT_MSG: function (name, ph) { return 'أنا ' + name + ' رقمي ' + ph + ' نسيت الباسورد وعايز أغيّره'; }
  };
  var $$ = function (i) { return document.getElementById(i); }, SESS = '', PHONE = '', PROFILE = null, ORDERS = [], META = {}, ST = ['استلمنا', 'اتأكد', 'في الطريق', 'اتسلم'];
  try { SESS = localStorage.getItem('hz_sess') || ''; PHONE = localStorage.getItem('hz_phone') || ''; } catch (e) {}
  function E(v) { return String(v == null ? '' : v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function N(v) { var n = parseFloat(v); return isNaN(n) ? 0 : n; }
  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) {} }

  var SVG = {
    box: '<svg viewBox="0 0 24 24"><path d="M21 8l-9-5-9 5v8l9 5 9-5z"/><path d="M3 8l9 5 9-5M12 13v8"/></svg>',
    user: '<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"/></svg>',
    refresh: '<svg viewBox="0 0 24 24"><path d="M20 11a8 8 0 1 0-2.3 5.7"/><path d="M20 4v7h-7"/></svg>',
    out: '<svg viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5M21 12H9"/></svg>',
    wa: '<svg viewBox="0 0 24 24"><path d="M3 21l1.6-4.9A8.5 8.5 0 1 1 8 19.5z"/><path d="M9 9.5c.3 2 2.5 4.2 4.5 4.5l1.2-1.2-1.8-1-.8.6c-.7-.3-1.4-1-1.7-1.7l.6-.8-1-1.8z"/></svg>',
    back: '<svg viewBox="0 0 24 24"><path d="M9 6l6 6-6 6"/></svg>',
    share: '<svg viewBox="0 0 24 24"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 10.5l6.8-4M8.6 13.5l6.8 4"/></svg>',
    x: '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>'
  };
  var css = document.createElement('style');
  css.textContent = '#hztr .hzs{max-width:560px;min-height:50vh}.hzib{position:relative;width:38px;height:38px;border-radius:50%;border:1px solid rgba(216,180,114,.55);background:rgba(20,17,13,.7);color:var(--gold-2);display:inline-flex;align-items:center;justify-content:center;cursor:pointer;padding:0;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none}.hzib svg{width:19px;height:19px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}.hzib:hover{background:rgba(216,180,114,.18)}.hzib::after{content:attr(data-tip);position:absolute;top:calc(100% + 8px);left:50%;transform:translateX(-50%);opacity:0;pointer-events:none;white-space:nowrap;background:rgba(20,17,13,.96);color:var(--gold-2);border:1px solid rgba(216,180,114,.45);padding:4px 11px;border-radius:30px;font-size:11.5px;font-weight:700;z-index:30;transition:opacity .15s}.hzib:hover::after,.hzib.tipon::after{opacity:1}#hzhb{position:absolute;top:12px;left:12px;display:flex;gap:10px;z-index:4}.hzdot{position:absolute;top:1px;right:1px;width:10px;height:10px;border-radius:50%;background:#ff4d3d;border:2px solid #1c1812;display:none}' +
    '.hzhd{position:sticky;top:0;z-index:20;margin:-18px -18px 12px;padding:12px 16px;background:#241f17;border-bottom:1px solid var(--line);display:flex;align-items:center;gap:8px}.hzhd h3{flex:1;margin:0!important;font-size:17px!important;color:var(--gold-2)}.hzhd .hzib{width:34px;height:34px}.hzhd .hzib svg{width:17px;height:17px}.hzhd .hzib::after{top:calc(100% + 6px)}' +
    '.hztab{display:flex;gap:8px;margin-bottom:12px}.hztab button{flex:1;padding:9px;border-radius:30px;border:1px solid var(--gold);background:transparent;color:var(--gold-2);font-family:inherit;font-weight:700;cursor:pointer}.hztab button.on{background:linear-gradient(135deg,var(--gold-2),var(--gold));color:#1a1408}#hztr .hzin{display:flex;flex-direction:column;gap:8px}#hztr .hzin input,#hztr .hzin select,#hztr .hzin textarea{width:100%;padding:10px 12px;border-radius:10px;border:1px solid rgba(216,180,114,.25);background:var(--panel);color:var(--ink);font-family:inherit;font-size:16px}' +
    '.hzpre{display:flex;direction:ltr;border:1px solid rgba(216,180,114,.25);border-radius:10px;background:var(--panel);overflow:hidden}.hzpre span{padding:10px 12px;background:rgba(216,180,114,.14);color:var(--gold-2);font-weight:800;font-size:16px}#hztr .hzin .hzpre input{border:0;border-radius:0;direction:ltr;background:transparent}' +
    '.hzo2{border:1px solid var(--line);border-radius:14px;padding:12px;margin-bottom:10px;background:rgba(216,180,114,.05);font-size:13px;line-height:1.8;cursor:pointer}.hzo2:hover{border-color:var(--gold)}.hzo2 h4{display:flex;justify-content:space-between;color:var(--gold-2);font-size:15px}.hzo2 .row{display:flex;justify-content:space-between;color:var(--muted);font-size:12.5px}.hzbar{display:flex;gap:4px;margin:10px 0}.hzbar i{flex:1;height:6px;border-radius:4px;background:rgba(216,180,114,.2)}.hzbar i.on{background:var(--gold)}.hzbl{display:flex;justify-content:space-between;font-size:10.5px;color:var(--muted)}' +
    '.hzacts{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px}.hzacts button,.hzacts a{border:1px solid var(--gold);background:transparent;color:var(--gold-2);border-radius:20px;padding:7px 14px;font-family:inherit;font-size:12.5px;font-weight:700;cursor:pointer;text-decoration:none}.hzacts .pri{background:linear-gradient(135deg,var(--gold-2),var(--gold));color:#1a1408}.hzacts .dis{opacity:.45;pointer-events:none}.hzvip{background:linear-gradient(135deg,var(--gold-2),var(--gold));color:#1a1408;border-radius:12px;padding:10px;margin-bottom:12px;font-weight:800;text-align:center}.hzwel{border:1px dashed var(--gold);background:rgba(216,180,114,.08);border-radius:12px;padding:12px;margin-bottom:12px;text-align:center;line-height:1.8}.hzwel b{display:block;color:var(--gold-2);font-size:14px}.hzwel .cd{display:inline-block;direction:ltr;unicode-bidi:isolate;font-weight:900;letter-spacing:1px;color:var(--gold-2);border:1px solid var(--line);border-radius:8px;padding:2px 12px;margin:4px 0;font-size:16px}.hzwel .sm{display:inline-block;margin:0 6px;font-size:12px;color:var(--muted)}.hzwel .sm.ln{display:block;margin:0}.hzwel button{margin-top:8px;border:0;background:linear-gradient(135deg,var(--gold-2),var(--gold));color:#1a1408;border-radius:20px;padding:8px 24px;font-family:inherit;font-weight:800;font-size:13px;cursor:pointer}' +
    '.hzit{display:flex;gap:10px;align-items:center;padding:8px 0;border-top:1px solid rgba(216,180,114,.14)}.hzit:first-child{border-top:0}.hzit .th{position:relative;width:52px;height:68px;border-radius:8px;overflow:hidden;background:#2a241b;flex:none}.hzit .th img{width:100%;height:100%;object-fit:cover}.hzit .in{flex:1;min-width:0}.hzit .in b{display:block;font-size:13.5px}.hzit .in small{display:block;color:var(--muted);font-size:12px}.hzit .in .cx{font-size:11.5px;color:var(--gold)}.hzit .pr{font-weight:900;color:var(--gold-2);font-size:14px;white-space:nowrap}' +
    '.hzsec{border:1px solid var(--line);border-radius:14px;padding:10px 12px;margin-bottom:10px;background:rgba(255,255,255,.02)}.hzsec h5{color:var(--gold-2);font-size:13px;margin-bottom:6px}.hztb2{width:100%;font-size:13px;border-collapse:collapse}.hztb2 td{padding:4px 0}.hztb2 td:last-child{text-align:left;font-weight:700}.hztb2 tr.t td{border-top:1px solid var(--line);padding-top:8px;font-size:15px;color:var(--gold-2);font-weight:900}.hztb2 .d td:last-child{color:var(--green)}' +
    '.hzchip{display:inline-block;border-radius:20px;padding:3px 12px;font-size:12px;font-weight:800;background:rgba(216,180,114,.15);color:var(--gold-2)}.hzrt{border:1px solid rgba(216,180,114,.25);border-radius:12px;padding:10px;margin:8px 0}.hzrt label{display:flex;gap:8px;align-items:center;font-size:13px}.hzrt input[type=checkbox]{width:auto!important}.hzrt .sub{margin-top:8px;display:flex;flex-direction:column;gap:6px}.hzseg{display:flex;gap:8px}.hzseg button{flex:1;padding:8px;border-radius:20px;border:1px solid var(--gold);background:transparent;color:var(--gold-2);font-family:inherit;font-weight:700;cursor:pointer}.hzseg button.on{background:linear-gradient(135deg,var(--gold-2),var(--gold));color:#1a1408}.hzaddr{display:flex;justify-content:space-between;align-items:center;gap:8px;border:1px solid rgba(216,180,114,.25);border-radius:10px;padding:8px 10px;font-size:13px}.hzaddr button{border:0;background:none;color:#ffb3a6;cursor:pointer;font-size:18px}' +
    '.hztab button{min-height:44px;line-height:1.5;padding:10px 6px;font-size:15px;white-space:nowrap}.hztab{margin-top:4px}.hzauth{min-height:0!important;scrollbar-width:none;-ms-overflow-style:none}.hzauth::-webkit-scrollbar{display:none}.hzlink{color:var(--gold-2);font-weight:800;text-decoration:underline;cursor:pointer}#hztr .hzin input:-webkit-autofill,#hztr .hzin input:-webkit-autofill:hover,#hztr .hzin input:-webkit-autofill:focus{-webkit-box-shadow:0 0 0 1000px var(--panel) inset!important;box-shadow:0 0 0 1000px var(--panel) inset!important;-webkit-text-fill-color:var(--ink)!important;caret-color:var(--ink);transition:background-color 99999s ease-in-out 0s}#hztr .hzin input:autofill{background-color:var(--panel)!important;color:var(--ink)!important}.hzcomp{text-align:center;padding:22px 14px;border:1px solid var(--line);border-radius:18px;background:linear-gradient(180deg,rgba(216,180,114,.1),rgba(216,180,114,.02))}.hzcomp .ic{width:62px;height:62px;border-radius:50%;margin:0 auto 12px;display:flex;align-items:center;justify-content:center;border:1px solid var(--gold);color:var(--gold-2);background:rgba(216,180,114,.1)}.hzcomp h4{font-size:18px;color:var(--gold-2);margin-bottom:6px}.hzcomp p{font-size:13.5px;line-height:1.9;color:var(--muted);margin-bottom:16px}.hzcomp .bt{display:flex;flex-direction:column;gap:8px}.hzcomp .btn{width:100%;margin:0}.hzlater{background:none;border:0;color:var(--muted);font-family:inherit;font-size:13.5px;padding:8px;cursor:pointer}.hzokb{position:fixed;left:50%;top:42%;transform:translate(-50%,-50%);z-index:200;background:#241f17;border:1px solid rgba(84,212,149,.6);border-radius:16px;padding:18px 28px;display:flex;flex-direction:column;align-items:center;gap:8px;color:#fff;box-shadow:0 12px 40px rgba(0,0,0,.6);transition:opacity .4s}.hzokb.out{opacity:0}.hzfg{display:flex;align-items:center;gap:8px;font-size:12.5px;color:var(--muted)}.hzfg .hzib{width:32px;height:32px;flex:none}#hzhb .hzib{backdrop-filter:blur(4px)}';
  document.head.appendChild(css);

  var ov = document.createElement('div'); ov.id = 'hztr'; ov.className = 'hzo'; ov.innerHTML = '<div class="hzs"></div>'; document.body.appendChild(ov);
  ov.addEventListener('click', function (e) { if (e.target === ov) closeT(); });
  var box = ov.querySelector('.hzs');
  function closeT() { ov.classList.remove('open'); }
  function tipify(b) {
    var t = null, lp = false;
    b.addEventListener('touchstart', function () { lp = false; t = setTimeout(function () { lp = true; b.classList.add('tipon'); }, 450); }, { passive: true });
    function end() { clearTimeout(t); if (lp) setTimeout(function () { b.classList.remove('tipon'); }, 1400); }
    b.addEventListener('touchend', end); b.addEventListener('touchcancel', end);
    b.addEventListener('contextmenu', function (ev) { ev.preventDefault(); });
    b.addEventListener('click', function (ev) { if (lp) { ev.preventDefault(); ev.stopImmediatePropagation(); lp = false; } }, true);
  }
  function ib(id, svg, tip) { return '<button class="hzib" type="button" id="' + id + '" data-tip="' + tip + '" aria-label="' + tip + '">' + svg + '</button>'; }
  function head(title, o) {
    o = o || {};
    return '<div class="hzhd">' + (o.back ? ib('hzbk', SVG.back, 'رجوع') : '') + '<h3>' + title + '</h3>' + (o.refresh ? ib('hzrf', SVG.refresh, 'تحديث') : '') + (o.out ? ib('hzlo', SVG.out, 'تسجيل خروج') : '') + ib('hztx', SVG.x, 'إغلاق') + '</div>';
  }
  function bind(o) {
    o = o || {};
    Array.prototype.forEach.call(box.querySelectorAll('.hzib'), tipify);
    box.classList.toggle('hzauth', !!box.querySelector('#hztf'));
    $$('hztx').onclick = closeT;
    if ($$('hzbk') && o.back) $$('hzbk').onclick = o.back;
    if ($$('hzrf') && o.refresh) $$('hzrf').onclick = o.refresh;
    if ($$('hzlo')) $$('hzlo').onclick = function () { cfm('متأكد إنك عايز تسجّل خروج من حسابك؟', 'تسجيل خروج', logout); };
  }
  function cfm(msg, ok, cb) {
    var d = document.createElement('div'); d.className = 'hzo open'; d.style.zIndex = 140;
    d.innerHTML = '<div class="hzs" style="max-width:330px;text-align:center;padding:22px 18px"><div style="line-height:1.9;margin-bottom:14px;font-size:15px">' + msg + '</div><div class="hzacts" style="justify-content:center"><button class="pri" type="button" data-y>' + ok + '</button><button type="button" data-n>إلغاء</button></div></div>';
    document.body.appendChild(d);
    d.addEventListener('click', function (e) { if (e.target === d || (e.target.hasAttribute && e.target.hasAttribute('data-n'))) d.remove(); else if (e.target.hasAttribute && e.target.hasAttribute('data-y')) { d.remove(); cb(); } });
  }
  function okBox(msg) {
    var d = document.createElement('div'); d.className = 'hzokb';
    d.innerHTML = '<svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="#54d495" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M7.5 12.5l3 3 6-6.5"/></svg><b>' + msg + '</b>';
    document.body.appendChild(d); setTimeout(function () { d.classList.add('out'); setTimeout(function () { d.remove(); }, 400); }, 1800);
  }
  function nameOk(n) { var w = String(n || '').trim().split(/\s+/); if (w.length < 2) return false; for (var i = 0; i < w.length; i++) if (!/^[A-Za-z؀-ۿ]{2,}$/.test(w[i])) return false; return true; }
  var NAME_MSG = 'اكتب الاسم ثنائي على الأقل (كل كلمة حرفين أو أكتر)';
  window.__hzConfirm = cfm; window.__hzOk = okBox; window.__hzNameOk = nameOk; window.__hzNameMsg = NAME_MSG;
  function setSess(s) { SESS = s || ''; lsSet('hz_sess', SESS || null); if (!SESS) { PROFILE = null; ORDERS = []; OT = 0; lsSet('hz_ords', null); document.dispatchEvent(new CustomEvent('hzprof', { detail: null })); lsSet('hz_prof', null); dot(false); } }
  function logout() { setSess(''); lsSet('hz_seen', null); auth('in'); }
  var ERR = { no_account: 'مفيش حساب بالرقم ده.', locked_reg: 'محاولات التحقق من رقم الفاتورة زادت. جرّب بعد شوية', name: NAME_MSG, bad_login: 'الرقم أو الباسورد غلط', locked: 'محاولات كتير غلط. جرب بعد شوية', exists: 'الرقم ده مسجّل قبل كده. ادخل بالباسورد', need_invoice: 'عندك طلبات قبل كده. اكتب رقم فاتورة من طلباتك عشان نتأكد إنك صاحب الرقم', bad_invoice: 'رقم الفاتورة مش بتاع الرقم ده', invalid: 'راجع البيانات (الباسورد 6 حروف على الأقل)', not_found: 'مش لاقيين الطلب ده', cannot: 'مينفعش دلوقتي، كلمنا على واتساب', closed: 'مدة الاسترجاع خلصت', zone_changed: 'العنوان الجديد سعر شحنه مختلف. كلمنا على واتساب', shipping_unavailable: 'الشحن غير متاح للمدينة دي' };
  function dt(t) { try { return new Date(t).toLocaleDateString(document.documentElement.getAttribute('lang') === 'en' ? 'en-GB' : 'ar-EG', { day: 'numeric', month: 'short', year: 'numeric' }); } catch (e) { return ''; } }
  function dot(on) { var d = $$('hztdot'); if (d) d.style.display = on ? 'block' : 'none'; }

  /* ---------- دخول / تسجيل ---------- */
  var AUTHP = '';
  function auth(mode, note) {
    var reg = mode === 'reg';
    var fld = '<input id="hztp" name="username" type="tel" dir="ltr" inputmode="numeric" autocomplete="username" placeholder="رقم الموبايل" value="' + E(AUTHP || PHONE) + '">';
    if (reg) fld += '<input id="hztn" name="name" autocomplete="name" placeholder="الاسم (اسمين على الأقل)">';
    fld += '<input id="hztw" name="password" type="password" placeholder="الباسورد" autocomplete="' + (reg ? 'new-password' : 'current-password') + '">';
    if (reg) fld += '<input id="hztw2" type="password" placeholder="تأكيد الباسورد" autocomplete="new-password"><div class="hzn">لو عندك طلبات قبل كده اكتب رقم فاتورة من طلباتك:</div><div class="hzpre"><span>HZ-</span><input id="hzti" inputmode="numeric" placeholder="1001"></div>';
    box.innerHTML = head('تتبع طلباتك') + (note ? '<div class="hzb" style="margin-bottom:8px">' + note + '</div>' : '') +
      '<div class="hztab" role="tablist"><button type="button" data-m="in" class="' + (reg ? '' : 'on') + '">دخول</button><button type="button" data-m="reg" class="' + (reg ? 'on' : '') + '">حساب جديد</button></div>' +
      '<form class="hzin" id="hztf" novalidate>' + fld + '<div class="hzb" id="hztm" role="alert"></div><button class="btn add" type="submit" id="hztg">' + (reg ? 'إنشاء حساب' : 'دخول') + '</button>' +
      (reg ? '' : '<div class="hzfg"><span>نسيت الباسورد؟</span><button class="hzib" type="button" id="hzfw" data-tip="كلمنا على واتساب" aria-label="واتساب">' + SVG.wa + '</button></div><div class="hzin" id="hzfb" style="display:none"><input id="hzfn" placeholder="اكتب اسمك"><button class="btn wa" type="button" id="hzfs">ابعت على واتساب</button></div>') + '</form>';
    bind();
    var m = $$('hztm');
    function setMsg(txt, linkTxt, linkMode) {
      m.textContent = txt || '';
      if (linkTxt) { m.appendChild(document.createTextNode(' ')); var a = document.createElement('a'); a.href = '#'; a.className = 'hzlink'; a.textContent = linkTxt; a.addEventListener('click', function (e) { e.preventDefault(); AUTHP = ($$('hztp').value || '').replace(/\D/g, ''); auth(linkMode); }); m.appendChild(a); }
    }
    Array.prototype.forEach.call(box.querySelectorAll('.hztab button'), function (b) {
      b.addEventListener('click', function (e) { e.preventDefault(); var md = b.getAttribute('data-m'); if (md === (reg ? 'reg' : 'in')) return; AUTHP = ($$('hztp').value || '').replace(/\D/g, ''); auth(md); });
    });
    if ($$('hzti')) $$('hzti').oninput = function () { this.value = this.value.replace(/\D/g, '').slice(0, 8); };
    if ($$('hzfw')) {
      $$('hzfw').onclick = function () { $$('hzfb').style.display = 'flex'; $$('hzfn').focus(); };
      $$('hzfs').onclick = function () {
        var n = $$('hzfn').value.trim(), ph = $$('hztp').value.replace(/\D/g, '');
        if (!nameOk(n)) { showToast(NAME_MSG); return; }
        if (!/^01\d{9}$/.test(ph)) { showToast('اكتب رقم موبايلك فوق الأول'); return; }
        window.open('https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(HZT.FORGOT_MSG(n, ph)), '_blank');
      };
    }
    $$('hztf').addEventListener('submit', function (e) {
      e.preventDefault();
      var ph = $$('hztp').value.replace(/\D/g, ''), pw = $$('hztw').value, b = $$('hztg');
      if (!/^01\d{9}$/.test(ph)) { setMsg('اكتب رقم موبايل صحيح'); return; }
      if (pw.length < 6) { setMsg('الباسورد 6 حروف على الأقل'); return; }
      if (reg) {
        if (!nameOk($$('hztn').value)) { setMsg(NAME_MSG); return; }
        if ($$('hztw2').value !== pw) { setMsg('الباسورد وتأكيده مش متطابقين'); return; }
      }
      setMsg('استنى لحظة...'); b.disabled = true;
      var inv = reg && $$('hzti').value ? 'HZ-' + $$('hzti').value : '';
      postApi({ type: reg ? 'track_register' : 'track_login', phone: ph, pass: pw, inv: inv, name: reg ? $$('hztn').value.trim() : '' }, function (r) {
        b.disabled = false;
        if (r && r.ok) {
          PHONE = ph; AUTHP = ''; lsSet('hz_phone', ph); lsSet('hz_reg', '1'); setSess(r.sess);
          if (r.welcome) { lsSet('hz_welcome', JSON.stringify(r.welcome)); }
          if (r.mustChange) changePass(); else afterLogin(reg);
          return;
        }
        if (!r) { setMsg('مشكلة في النت، جرب تاني'); return; }
        if (r.error === 'exists') { setMsg(ERR.exists.replace(' ادخل بالباسورد', '').replace('. ادخل بالباسورد', '.'), 'ادخل في الحساب', 'in'); return; }
        if (r.error === 'no_account') { setMsg(ERR.no_account, 'أنشئ حساب جديد', 'reg'); return; }
        if (r.error === 'locked') { setMsg('محاولات كتير غلط. جرب بعد ' + (r.mins || 15) + ' دقيقة'); return; }
        if (r.error === 'bad_login' && r.left > 0 && r.left <= 3) { setMsg(ERR.bad_login + ' (باقي ' + r.left + ' محاولات)'); return; }
        setMsg(ERR[r.error] || 'حصل خطأ');
      }, 30000);
    });
  }
  function changePass() {
    box.innerHTML = head('اختار باسورد جديد') + '<div class="hzin"><input id="hznp" type="password" placeholder="الباسورد الجديد (6 حروف على الأقل)"><div class="hzb" id="hznm"></div><button class="btn add" type="button" id="hzng">حفظ</button></div>'; bind();
    $$('hzng').onclick = function () { var p = $$('hznp').value; if (p.length < 6) { $$('hznm').textContent = 'الباسورد قصير'; return; } postApi({ type: 'track_changepass', sess: SESS, pass: p }, function (r) { if (r && r.ok) afterLogin(false); else $$('hznm').textContent = 'حصل خطأ'; }, 30000); };
  }
  function pubProf(p) { return { phone: PHONE, name: p.name || '', age: p.age || '', ph2: p.ph2 || '', addrs: p.addrs || [] }; }
  var szFetched = false;
  window.__hzGetSz = function () {
    if (SESS && !PROFILE && !szFetched) { szFetched = true; postApi({ type: 'track_profile', sess: SESS }, function (r) { if (r && r.ok && !PROFILE) PROFILE = r.profile; }, 30000); }
    return SESS && PROFILE && PROFILE.sz ? PROFILE.sz : null;
  };
  window.__hzSaveSz = function (z) {
    if (!SESS) return;
    function go(P) {
      var age = P.age || z.age || '';
      postApi({ type: 'track_profile', sess: SESS, save: 1, profile: { name: P.name || '', age: age, ph2: P.ph2 || '', addrs: P.addrs || [], sz: { age: age, w: z.w || '', h: z.h || '', size: z.size || '' } } }, function (r) { if (r && r.ok) PROFILE = r.profile; }, 30000);
    }
    if (PROFILE) go(PROFILE); else postApi({ type: 'track_profile', sess: SESS }, function (r) { if (r && r.ok) { PROFILE = r.profile; go(PROFILE); } }, 30000);
  };
  function afterLogin(isNew) {
    box.innerHTML = head('تتبع طلباتك') + '<div class="hzn">استنى لحظة...</div>'; bind();
    postApi({ type: 'track_profile', sess: SESS }, function (r) {
      if (r && r.ok) { PROFILE = r.profile; document.dispatchEvent(new CustomEvent('hzprof', { detail: pubProf(PROFILE) })); }
      var done = PROFILE && PROFILE.name && PROFILE.age && PROFILE.addrs && PROFILE.addrs.length;
      if (!done && lsGet('hz_skipprof') !== '1') { complete(); } else ordersView();
    }, 30000);
  }
  function complete() {
    box.innerHTML = head('أهلاً بيك') + '<div class="hzcomp"><div class="ic"><svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"/></svg></div><h4>كمّل بياناتك</h4><p>الاسم والسن وعنوان محفوظ، وبعدها تطلب بضغطة واحدة من غير ما تكتب كل مرة.</p><div class="bt"><button class="btn add" type="button" id="hzcy">كمّل بياناتي</button><button class="hzlater" type="button" id="hzcn">لاحقاً</button></div></div>'; bind();
    $$('hzcy').onclick = profileView; $$('hzcn').onclick = function () { lsSet('hz_skipprof', '1'); ordersView(); };
  }

  /* ---------- الملف الشخصي والعناوين ---------- */
  function profileView() {
    if (!SESS) { auth('in'); return; }
    if (window.__hzLoadGeo) window.__hzLoadGeo();
    var P = PROFILE || { name: '', age: '', ph2: '', addrs: [] }, A = (P.addrs || []).slice(), adding = false, base = '';
    function snap() { return JSON.stringify([P.name || '', String(P.age || ''), P.ph2 || '', A]); }
    base = snap();
    function keep() { if ($$('hzpn')) { P.name = $$('hzpn').value.trim(); P.age = $$('hzpa').value; P.ph2 = $$('hzp2').value; } P.addrs = A; }
    function sync() { keep(); var b = $$('hzps'); if (b) { var d = snap() !== base; b.disabled = !d; b.classList.toggle('dis', !d); } }
    function persist(msg, cb) {
      postApi({ type: 'track_profile', sess: SESS, save: 1, profile: { name: P.name, age: P.age, ph2: P.ph2, addrs: A } }, function (r) {
        if (r && r.ok) { PROFILE = r.profile; document.dispatchEvent(new CustomEvent('hzprof', { detail: pubProf(PROFILE) })); if (msg) showToast(msg); }
        cb && cb(r);
      }, 30000);
    }
    function draw() {
      var G = window.__hzGeo || {}, gs = Object.keys(G);
      var list = A.length ? A.map(function (a, i) { return '<div class="hzaddr"><button type="button" class="hzstar' + (i === 0 ? ' on' : '') + '" data-s="' + i + '" aria-label="عنوان أساسي" title="' + (i === 0 ? 'العنوان الأساسي' : 'اجعله العنوان الأساسي') + '">' + (i === 0 ? '★' : '☆') + '</button><span><b>' + E(a.l || 'عنوان') + (i === 0 ? ' <em class="hzdef">أساسي</em>' : '') + '</b><br><small>' + E(a.gov + ' - ' + a.city + ' - ' + a.a) + '</small></span><button type="button" data-d="' + i + '" aria-label="حذف">×</button></div>'; }).join('') : '<div class="hzn">مفيش عناوين محفوظة.</div>';
      var form = adding ? '<div class="hzin" style="margin-top:8px"><input id="hzal" placeholder="اسم العنوان (البيت / الشغل)"><div class="hzr" style="display:flex;gap:8px"><select id="hzag" style="flex:1"><option value="">اختار المحافظة</option>' + gs.map(function (g) { return '<option>' + E(g) + '</option>'; }).join('') + '</select><select id="hzac" style="flex:1"><option value="">اختار المدينة</option></select></div><textarea id="hzad2" placeholder="العنوان بالتفصيل"></textarea><div style="display:flex;gap:8px"><button type="button" class="btn add" id="hzaa" style="padding:10px;flex:2">إضافة العنوان</button><button type="button" class="hzghost" id="hzac0" style="flex:1">إلغاء</button></div></div>' : (A.length < 6 ? '<button type="button" class="hzghost" id="hzan" style="width:100%;margin-top:8px">+ إضافة عنوان جديد</button>' : '');
      box.innerHTML = head('حسابي') + '<div class="hzin"><div class="hzn">الرقم: <b dir="ltr">' + E(PHONE) + '</b></div><input id="hzpn" placeholder="الاسم الثنائي" value="' + E(P.name) + '"><div class="hzr" style="display:flex;gap:8px"><input id="hzpa" inputmode="numeric" maxlength="2" placeholder="السن" value="' + E(P.age) + '" style="flex:1"><input id="hzp2" type="tel" dir="ltr" placeholder="رقم تاني (اختياري)" value="' + E(P.ph2) + '" style="flex:2"></div>' +
        '<div class="hzsec"><h5>عناويني</h5>' + list + form + '</div>' +
        '<div class="hzb" id="hzpm"></div><button class="btn add" type="button" id="hzps" disabled>حفظ بياناتي</button>' +
        '<button class="hzghost" type="button" id="hzpo2" style="width:100%">تتبع الطلبات</button><button class="hzghost hzout" type="button" id="hzpl">تسجيل خروج</button></div>';
      bind(); sync();
      if (adding && !gs.length && window.__hzLoadGeo) setTimeout(function () { if (adding && box.querySelector('#hzag') && window.__hzGeo) { keep(); draw(); } }, 1200);
      $$('hzpa').oninput = function () { this.value = this.value.replace(/\D/g, '').slice(0, 2); sync(); };
      $$('hzp2').oninput = function () { this.value = this.value.replace(/\D/g, ''); sync(); };
      $$('hzpn').oninput = sync;
      $$('hzpo2').onclick = function () { ordersView(); };
      $$('hzpl').onclick = function () { cfm('متأكد إنك عايز تسجّل خروج من حسابك؟', 'تسجيل خروج', logout); };
      Array.prototype.forEach.call(box.querySelectorAll('[data-d]'), function (b) { b.onclick = function () { keep(); A.splice(+b.getAttribute('data-d'), 1); P.addrs = A; draw(); }; });
      Array.prototype.forEach.call(box.querySelectorAll('[data-s]'), function (b) { b.onclick = function () { keep(); var i = +b.getAttribute('data-s'); if (i > 0) { var x = A.splice(i, 1)[0]; A.unshift(x); P.addrs = A; draw(); } }; });
      if ($$('hzan')) $$('hzan').onclick = function () { keep(); adding = true; draw(); };
      if ($$('hzac0')) $$('hzac0').onclick = function () { keep(); adding = false; draw(); };
      if ($$('hzag')) {
        var sg = $$('hzag'), sc = $$('hzac');
        sg.onchange = function () { sc.innerHTML = '<option value="">اختار المدينة</option>' + ((G[sg.value] || []).filter(function (x) { return x.ok; }).map(function (x) { return '<option>' + E(x.c) + '</option>'; }).join('')); };
        $$('hzaa').onclick = function () {
          var g = sg.value, c = sc.value, a = $$('hzad2').value.trim();
          if (!g || !c || a.length < 6) { $$('hzpm').textContent = 'اختار المحافظة والمدينة واكتب العنوان بالتفصيل'; return; }
          if (A.length >= 6) { $$('hzpm').textContent = 'أقصى عدد عناوين 6'; return; }
          keep(); A.push({ l: $$('hzal').value.trim() || 'عنوان', gov: g, city: c, a: a }); adding = false; draw();
        };
      }
      $$('hzps').onclick = function () {
        keep(); var m = $$('hzpm'), b = this;
        if (!nameOk(P.name)) { m.textContent = NAME_MSG; return; }
        if (P.ph2 && !/^01\d{9}$/.test(P.ph2)) { m.textContent = 'الرقم التاني غير صحيح'; return; }
        m.textContent = 'استنى لحظة...'; b.disabled = true;
        persist('اتحفظت بياناتك', function (r) {
          if (r && r.ok) ordersView();
          else { b.disabled = false; m.textContent = r && r.error === 'session' ? 'سجّل دخول تاني' : 'حصل خطأ، جرب تاني'; }
        });
      };
    }
    draw();
  }
  window.__hzAuth = function () { return !!SESS; };
  window.__hzSaveAddr = function (addr, cb) {
    var P = PROFILE || { name: '', age: '', ph2: '', addrs: [] }, A = (P.addrs || []).slice(0, 5); A.push(addr);
    postApi({ type: 'track_profile', sess: SESS, save: 1, profile: { name: P.name, age: P.age, ph2: P.ph2, addrs: A } }, function (r) {
      if (r && r.ok) { PROFILE = r.profile; document.dispatchEvent(new CustomEvent('hzprof', { detail: pubProf(PROFILE) })); okBox('تم إضافة العنوان'); cb(true); } else cb(false);
    }, 30000);
  };

  /* ---------- قائمة الطلبات ---------- */
  function seenMap() { try { return JSON.parse(lsGet('hz_seen') || '{}'); } catch (e) { return {}; } }
  function markSeen(list) { var m = {}; list.forEach(function (o) { m[o.inv] = o.status; }); lsSet('hz_seen', JSON.stringify(m)); dot(false); }
  function bar(o) {
    if (!(o.step > 0)) return '<span class="hzchip">' + E(o.label) + '</span>';
    return '<div class="hzbar">' + ST.map(function (s, i) { return '<i class="' + (i < o.step ? 'on' : '') + '"></i>'; }).join('') + '</div><div class="hzbl">' + ST.map(function (s) { return '<span>' + s + '</span>'; }).join('') + '</div>';
  }
  var VIP = null, WEL = null, OT = 0;
  try { var c0 = JSON.parse(lsGet('hz_ords') || 'null'); if (c0 && c0.p === PHONE && c0.p) { ORDERS = c0.o || []; VIP = c0.v || null; WEL = c0.w || null; OT = c0.t || 0; META = c0.m || META; } } catch (e) {}
  if (!WEL) { try { var w0 = JSON.parse(lsGet('hz_welcome') || 'null'); if (w0 && w0.code && PHONE && String(w0.code).slice(-4) === String(PHONE).slice(-4)) WEL = w0; } catch (e) {} }
  /* كوبون الترحيب: بيظهر لو السيرفر قال إنه لسه صالح (مرة واحدة، ومدته من تاريخ إنشاء الحساب) */
  function welBox() {
    var w = WEL, v = w.type === 'نسبة' ? 'خصم ' + w.value + '%' : 'خصم ' + w.value + ' ج.م';
    return '<div class="hzwel"><b>كود الترحيب بتاعك</b><span class="cd">' + E(w.code) + '</span><div><span class="sm">' + E(v) + '</span>' + (w.minQty > 0 ? '<span class="sm">من ' + E(w.minQty) + ' قطع</span>' : '') + (w.until ? '<span class="sm">ينتهي في ' + E(w.until) + '</span>' : '') + '</div><span class="sm ln">بيتطبّق مرة واحدة على طلبك</span><button type="button" id="hzwu">استخدمه</button></div>';
  }
  function useWel() {
    var w = WEL; if (!w) return;
    var inp = document.getElementById('pinput'); if (inp) inp.value = w.code;
    if (!cart.length) { closeT(); showToast('كود الترحيب اتحط في خانة الكوبون. ضيف قطع للسلة وبعدين دوس تطبيق', 5000); return; }
    closeT(); openCart(); applyPromo();
  }
  function paintOrders(sc) {
    box.innerHTML = head('طلباتك', { refresh: 1, out: 1 }) + (VIP ? '<div class="hzvip">كود خصم خاص بيك: <span dir="ltr">' + E(VIP.code) + '</span> (' + VIP.amount + ' ج.م)</div>' : '') + (WEL ? welBox() : '') +
      (ORDERS.length ? ORDERS.map(function (o) { return '<div class="hzo2" data-inv="' + E(o.inv) + '"><h4><span dir="ltr">' + E(o.inv) + '</span><span>' + E(o.label) + '</span></h4><div class="row"><span>' + dt(o.time) + '</span><span>' + o.items.reduce(function (a, i) { return a + i.q; }, 0) + ' قطع · ' + o.total + ' ج.م</span></div>' + bar(o) + '</div>'; }).join('') : '<div class="hzn">مفيش طلبات لسه.</div>') +
      '<div class="hzacts"><button type="button" id="hzmy">حسابي وعناويني</button></div>';
    bind({ refresh: function () { ordersView(true, true); } });
    box.scrollTop = sc || 0;
    $$('hzmy').onclick = profileView;
    if ($$('hzwu')) $$('hzwu').onclick = useWel;
    Array.prototype.forEach.call(box.querySelectorAll('.hzo2'), function (c) { c.onclick = function () { var o = ORDERS.filter(function (x) { return x.inv === c.getAttribute('data-inv'); })[0]; if (o) detail(o, false); }; });
  }
  function ordersView(keepScroll, force) {
    if (!SESS) { auth('in'); return; }
    var sc = keepScroll ? box.scrollTop : 0, have = ORDERS.length || OT, fresh = have && !force && Date.now() - OT < 180000;
    if (have) paintOrders(sc); else { box.innerHTML = head('طلباتك', { refresh: 1, out: 1 }) + '<div class="hzn">استنى لحظة</div>'; bind({ refresh: function () { ordersView(true, true); } }); }
    if (fresh) return;
    postApi({ type: 'track_orders', sess: SESS }, function (r) {
      if (!r) { if (!have) { box.innerHTML = head('طلباتك', { refresh: 1, out: 1 }) + '<div class="hzb">مشكلة في النت، جرب تاني</div>'; bind({ refresh: function () { ordersView(true, true); } }); } return; }
      if (!r.ok) { setSess(''); ORDERS = []; OT = 0; lsSet('hz_ords', null); auth('in', 'سجّل دخول تاني'); return; }
      var old = JSON.stringify(ORDERS) + JSON.stringify(VIP) + JSON.stringify(WEL);
      ORDERS = r.orders; VIP = r.vip || null; WEL = r.welcome || null; OT = Date.now(); META = { days: r.returnDays, share: r.share, again: r.orderAgain, reasons: r.retReasons || [] };
      if (!WEL) lsSet('hz_welcome', null);
      lsSet('hz_ords', JSON.stringify({ p: PHONE, o: ORDERS, v: VIP, w: WEL, t: OT, m: META }));
      if (r.profile) { PROFILE = r.profile; document.dispatchEvent(new CustomEvent('hzprof', { detail: pubProf(PROFILE) })); }
      markSeen(ORDERS);
      var onList = !!box.querySelector('#hzmy') && ov.classList.contains('open');
      if (!have || (onList && old !== JSON.stringify(ORDERS) + JSON.stringify(VIP) + JSON.stringify(WEL))) paintOrders(box.scrollTop);
    }, 30000);
  }

  /* ---------- تفاصيل الطلب ---------- */
  function pinfo(it) {
    var p = ALL.filter(function (x) { return x.code === it.code; })[0], c = null, s = null;
    if (p) { p.colors.forEach(function (x) { if (x.name === it.c) c = x; }); if (c) c.sizes.forEach(function (z) { if (z.size === it.s) s = z; }); }
    return { p: p, c: c, s: s };
  }
  function itemsHtml(o) {
    return '<div class="hzsec">' + o.items.map(function (it, i) {
      return '<div class="hzit"><div class="th" data-i="' + i + '"></div><div class="in"><b>' + E(it.n) + '</b><small>' + E(it.c) + ' · ' + E(it.s) + ' · ×' + it.q + '</small>' + (it.x ? '<div class="cx">' + E(it.x.replace(/ \|\| /g, ' · ')) + '</div>' : '') + '</div><div class="pr">' + (it.p * it.q) + ' ج.م</div></div>';
    }).join('') + '</div>';
  }
  function thumbs(o) {
    Array.prototype.forEach.call(box.querySelectorAll('.th'), function (th) {
      var it = o.items[+th.getAttribute('data-i')], pi = pinfo(it), id = pi.c && pi.c.imageId || (pi.p && pi.p.main) || '';
      if (id) { var im = makeImg(id, 200, it.n); th.appendChild(im); im.load(); im.className = 'on'; }
    });
  }
  function priceHtml(o) {
    var r = '<table class="hztb2"><tr><td>المجموع</td><td>' + o.sub + ' ج.م</td></tr>';
    if (o.qd > 0) r += '<tr class="d"><td>خصم الكمية</td><td>-' + o.qd + ' ج.م</td></tr>';
    if (o.promo > 0) r += '<tr class="d"><td>كود الخصم' + (o.pcode ? ' (' + E(o.pcode) + ')' : '') + '</td><td>-' + o.promo + ' ج.م</td></tr>';
    r += '<tr><td>الشحن</td><td>' + (o.ship > 0 ? o.ship + ' ج.م' : 'مجاني') + '</td></tr><tr class="t"><td>الإجمالي</td><td>' + o.total + ' ج.م</td></tr>';
    if (o.paid > 0) r += '<tr class="d"><td>اتدفع مقدماً</td><td>-' + o.paid + ' ج.م</td></tr><tr class="t"><td>المتبقي عند الاستلام</td><td>' + o.left + ' ج.م</td></tr>';
    return r + '</table>';
  }
  function detail(o, single) {
    var back = single ? null : function () { ordersView(true); };
    var canRet = !single && o.status === 'اتسلم';
    var acts = '<a target="_blank" rel="noopener" href="https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent('مرحباً، بخصوص طلبي رقم ' + o.inv) + '">كلم الدعم</a>' + (o.url ? '<a href="' + E(o.url) + '" target="_blank" rel="noopener">تتبع الشحنة</a>' : '');
    if (META.share !== false && o.tk) acts += '<button type="button" id="hzsh">' + SVG.share.replace('<svg', '<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle;margin-left:4px"') + 'شارك تتبع طلبي</button>';
    if (!single && o.canEdit) acts += '<button type="button" id="hzea">تعديل العنوان</button>';
    if (canRet) {
      if (o.ret) acts += '<span class="hzchip">طلب ' + E(o.ret.kind) + ': ' + E(o.ret.st) + '</span>';
      else if (o.canReturn) acts += '<button type="button" class="pri" id="hzrt">استرجاع / استبدال</button>';
      else acts += '<span class="hzchip" style="opacity:.7">انتهت مدة الاسترجاع (' + (o.retDays || META.days || 14) + ' يوم)</span>';
      if (META.again !== false) acts += '<button type="button" id="hzro">اطلب نفس الطلب تاني</button>';
    }
    var rf = SESS && !single ? function () {
      showToast('جاري التحديث...');
      postApi({ type: 'track_orders', sess: SESS }, function (r) {
        if (!r || !r.ok) { showToast('مشكلة في النت، جرب تاني'); return; }
        ORDERS = r.orders; OT = Date.now(); lsSet('hz_ords', JSON.stringify({ p: PHONE, o: ORDERS, v: VIP, w: WEL, t: OT, m: META }));
        var n = ORDERS.filter(function (x) { return x.inv === o.inv; })[0]; if (n) { detail(n, single); showToast('اتحدّث'); }
      }, 30000);
    } : null;
    box.innerHTML = head('طلب ' + E(o.inv), { back: back || null, refresh: rf ? 1 : 0 }) + '<div class="hzsec"><div style="display:flex;justify-content:space-between;align-items:center"><span class="hzn">' + dt(o.time) + '</span><span class="hzchip">' + E(o.label) + '</span></div>' + bar(o) +
      (o.eta && o.step > 0 && o.step < 4 ? '<div class="hzn" style="margin-top:6px">موعد التسليم المتوقع: <b>' + E(o.eta) + '</b></div>' : '') + (o.deliv ? '<div class="hzn">اتسلم يوم: <b>' + dt(o.deliv) + '</b></div>' : '') +
      (o.carrier || o.awb || o.courier ? '<div class="hzn">الشحن: ' + [o.carrier, o.awb ? 'بوليصة ' + E(o.awb) : '', o.courier ? 'المندوب ' + E(o.courier) : ''].filter(String).join(' | ') + '</div>' : '') + '</div>' +
      itemsHtml(o) + '<div class="hzsec"><h5>الحساب</h5>' + priceHtml(o) + '</div>' +
      (o.addr ? '<div class="hzsec"><h5>العنوان</h5><div style="font-size:13px;line-height:1.8">' + E(o.addr.fullName) + '<br>' + E(o.addr.gov + ' - ' + o.addr.city + ' - ' + o.addr.addr) + '<br><span dir="ltr">' + E(o.addr.ph2 ? PHONE + ' - ' + o.addr.ph2 : PHONE) + '</span></div></div>' : '') +
      '<div class="hzacts">' + acts + '</div><div class="hzin" id="hzfm" style="margin-top:10px"></div>' + (single ? '<button class="btn add" type="button" id="hzall" style="margin-top:12px">شوف كل طلباتك</button>' : '');
    bind({ back: back, refresh: rf }); thumbs(o);
    if ($$('hzall')) $$('hzall').onclick = function () { if (SESS) ordersView(); else auth('in'); };
    if ($$('hzsh')) $$('hzsh').onclick = function () { share(o); };
    if ($$('hzro')) $$('hzro').onclick = function () { reorder(o); };
    if ($$('hzrt')) $$('hzrt').onclick = function () { returnView(o); };
    if ($$('hzea')) $$('hzea').onclick = function () { addrEdit(o); };
  }
  function share(o) {
    var url = location.href.split('#')[0] + '#track=' + o.inv + '.' + o.tk, txt = 'تابع حالة طلبي ' + o.inv;
    if (navigator.share) { navigator.share({ title: BRAND, text: txt, url: url }).catch(function () {}); return; }
    try { navigator.clipboard.writeText(url).then(function () { showToast('اتنسخ لينك التتبع'); }, function () { window.prompt('', url); }); } catch (e) { window.prompt('', url); }
  }
  function reorder(o) {
    var added = 0, miss = [], part = [], special = 0;
    o.items.forEach(function (it) {
      var pi = pinfo(it);
      if (it.x) special++;
      if (!pi.p || !pi.c || !pi.s || !pi.s.inStock) { miss.push(it.n + ' ' + it.c + ' ' + it.s); return; }
      var key = [pi.p.code, pi.c.name || '', pi.s.size || ''].join('|'), f = null; cart.forEach(function (i) { if (i.key === key) f = i; });
      var max = pi.s.max == null ? 99 : pi.s.max, cur = f ? f.qty : 0, q = Math.min(it.q, Math.max(0, max - cur));
      if (q < 1) { miss.push(it.n + ' ' + it.c + ' ' + it.s + ' (وصلت أقصى كمية)'); return; }
      if (q < it.q) part.push(it.n + ' ' + it.s + ': اتضاف ' + q + ' بس من ' + it.q);
      if (f) f.qty += q; else cart.push({ key: key, code: pi.p.code, name: pi.p.name, color: pi.c.name || '', size: pi.s.size || '', price: pi.s.price, imageId: pi.c.imageId || pi.p.main || '', qty: q, max: pi.s.max });
      added++;
    });
    var notes = [];
    if (miss.length) notes.push('مش متاح دلوقتي: ' + miss.join('، '));
    if (part.length) notes.push(part.join('، '));
    if (special) notes.push('القطع الخاصة (مقاس/طباعة) لازم تطلبها من جديد.');
    if (!added) {
      var m0 = $$('hzfm'); if (m0) m0.innerHTML = notes.length ? '<div class="hzb">' + E(notes.join(' · ')) + '</div>' : '';
      showToast('القطع دي مش متاحة دلوقتي');
      return;
    }
    saveCart(); updateBadge(); bumpCart();
    closeT(); openCart();
    if (notes.length) showToast(notes.join(' · '), 6000);
  }
  function addrEdit(o) {
    var G = window.__hzGeo || {}, gs = Object.keys(G), f = $$('hzfm');
    if (window.__hzLoadGeo && !gs.length) { window.__hzLoadGeo(); f.innerHTML = '<div class="hzn">استنى لحظة...</div>'; setTimeout(function () { addrEdit(o); }, 1500); return; }
    var sv = (PROFILE && PROFILE.addrs || []);
    f.innerHTML = (sv.length ? '<select id="hzas"><option value="">اختار من عناويني</option>' + sv.map(function (a, i) { return '<option value="' + i + '">' + E(a.l + ' - ' + a.city) + '</option>'; }).join('') + '</select>' : '') + '<select id="hzg1">' + gs.map(function (g) { return '<option>' + E(g) + '</option>'; }).join('') + '</select><select id="hzc1"></select><textarea id="hza1" placeholder="العنوان بالتفصيل"></textarea><button class="btn add" type="button" id="hzs1">حفظ العنوان</button>';
    var sg = $$('hzg1'), sc = $$('hzc1'); function fc() { sc.innerHTML = (G[sg.value] || []).filter(function (x) { return x.ok; }).map(function (x) { return '<option>' + E(x.c) + '</option>'; }).join(''); } sg.onchange = fc; fc();
    if ($$('hzas')) $$('hzas').onchange = function () { var a = sv[+this.value]; if (a) { sg.value = a.gov; fc(); sc.value = a.city; $$('hza1').value = a.a; } };
    $$('hzs1').onclick = function () { postApi({ type: 'track_address', sess: SESS, inv: o.inv, gov: sg.value, city: sc.value, address: $$('hza1').value }, function (r) { showToast(r && r.ok ? 'تم تعديل العنوان' : (ERR[r && r.error] || 'حصل خطأ')); if (r && r.ok) ordersView(); }, 30000); };
  }

  /* ---------- استرجاع / استبدال ---------- */
  function returnView(o) {
    var kind = 'استرجاع', sel = {}, to = {}, rsn = '', RS = (META && META.reasons) || [];
    function isOther(r) { return /تاني|تانى|آخر|اخر|أخرى|اخرى|غير ذلك/.test(String(r)); }
    function liveProducts() { return ALL.filter(function (p) { return p.inStock; }); }
    function draw() {
      var h = head('استرجاع / استبدال', { back: function () { detail(o, false); } }) + '<div class="hzn">رقم الفاتورة: <b dir="ltr">' + E(o.inv) + '</b> · المدة المسموحة ' + (o.retDays || META.days || 14) + ' يوم من الاستلام.</div><div class="hzseg" style="margin:10px 0"><button type="button" data-k="استرجاع" class="' + (kind === 'استرجاع' ? 'on' : '') + '">استرجاع</button><button type="button" data-k="استبدال" class="' + (kind === 'استبدال' ? 'on' : '') + '">استبدال</button></div><div class="hzn">اختار القطع والكمية:</div>';
      o.items.forEach(function (it, i) {
        var on = !!sel[i], q = sel[i] || 1;
        h += '<div class="hzrt"><label><input type="checkbox" data-c="' + i + '"' + (on ? ' checked' : '') + '><span>' + E(it.n) + ' · ' + E(it.c) + ' · ' + E(it.s) + ' (×' + it.q + ')</span></label>';
        if (on) {
          h += '<div class="sub"><label>الكمية: <select data-q="' + i + '" style="width:auto">' + Array.apply(null, Array(it.q)).map(function (_, k) { return '<option' + (q === k + 1 ? ' selected' : '') + '>' + (k + 1) + '</option>'; }).join('') + '</select></label>';
          if (kind === 'استبدال') {
            var t = to[i] || {}, ps = liveProducts(), p = ps.filter(function (x) { return x.code === t.code; })[0], cs = p ? p.colors.filter(function (c) { return c.inStock; }) : [], c = cs.filter(function (x) { return x.name === t.color; })[0], ss = c ? c.sizes.filter(function (z) { return z.inStock; }) : [], z = ss.filter(function (x) { return x.size === t.size; })[0];
            h += '<select data-p="' + i + '"><option value="">اختار التصميم البديل</option>' + ps.map(function (x) { return '<option value="' + E(x.code) + '"' + (x.code === t.code ? ' selected' : '') + '>' + E(x.name) + '</option>'; }).join('') + '</select>';
            if (p) h += '<select data-l="' + i + '"><option value="">اللون</option>' + cs.map(function (x) { return '<option' + (x.name === t.color ? ' selected' : '') + '>' + E(x.name) + '</option>'; }).join('') + '</select>';
            if (c) h += '<select data-s="' + i + '"><option value="">المقاس</option>' + ss.map(function (x) { return '<option' + (x.size === t.size ? ' selected' : '') + '>' + E(x.size) + '</option>'; }).join('') + '</select>';
            if (z) { var d = (toNumber(z.price) - it.p) * q; h += '<div class="hzn">سعر البديل ' + z.price + ' ج.م ' + (d > 0 ? '· هتدفع فرق <b>' + d + ' ج.م</b>' : d < 0 ? '· هيترد لك فرق <b>' + (-d) + ' ج.م</b>' : '· من غير فرق سعر') + '</div>'; }
          }
          h += '</div>';
        }
        h += '</div>';
      });
      var needDet = !RS.length || isOther(rsn);
      h += '<div class="hzin">' + (RS.length ? '<select id="hzrc"><option value="">اختار السبب</option>' + RS.map(function (x) { return '<option value="' + E(x) + '"' + (x === rsn ? ' selected' : '') + '>' + E(x) + '</option>'; }).join('') + '</select>' : '') + '<textarea id="hzrr" placeholder="' + (RS.length ? (needDet ? 'اكتب التفاصيل (إجباري)' : 'تفاصيل إضافية (اختياري)') : 'السبب (إجباري)') + '"></textarea><input type="file" id="hzri" accept="image/*"><div class="hzb" id="hzrm"></div><button class="btn add" type="button" id="hzrs">إرسال الطلب</button></div>';
      var keepR = $$('hzrr') ? $$('hzrr').value : '';
      box.innerHTML = h; bind({ back: function () { detail(o, false); } }); if (keepR) $$('hzrr').value = keepR;
      Array.prototype.forEach.call(box.querySelectorAll('[data-k]'), function (b) { b.onclick = function () { kind = b.getAttribute('data-k'); draw(); }; });
      Array.prototype.forEach.call(box.querySelectorAll('[data-c]'), function (b) { b.onchange = function () { var i = +b.getAttribute('data-c'); if (b.checked) sel[i] = 1; else { delete sel[i]; delete to[i]; } draw(); }; });
      Array.prototype.forEach.call(box.querySelectorAll('[data-q]'), function (b) { b.onchange = function () { sel[+b.getAttribute('data-q')] = +b.value; draw(); }; });
      Array.prototype.forEach.call(box.querySelectorAll('[data-p]'), function (b) { b.onchange = function () { to[+b.getAttribute('data-p')] = { code: b.value }; draw(); }; });
      Array.prototype.forEach.call(box.querySelectorAll('[data-l]'), function (b) { b.onchange = function () { var i = +b.getAttribute('data-l'); to[i] = { code: to[i].code, color: b.value }; draw(); }; });
      Array.prototype.forEach.call(box.querySelectorAll('[data-s]'), function (b) { b.onchange = function () { var i = +b.getAttribute('data-s'); to[i].size = b.value; draw(); }; });
      if ($$('hzrc')) $$('hzrc').onchange = function () { rsn = this.value; draw(); };
      $$('hzrs').onclick = submit;
    }
    function toNumber(v) { return toNum(v); }
    function submit() {
      var m = $$('hzrm'), ks = Object.keys(sel), det = $$('hzrr').value.trim(), reason = det;
      if (!ks.length) { m.textContent = 'اختار قطعة واحدة على الأقل'; return; }
      if (RS.length) {
        if (!rsn) { m.textContent = 'اختار السبب'; return; }
        if (isOther(rsn) && det.length < 3) { m.textContent = 'اكتب التفاصيل'; return; }
        reason = rsn + (det ? ' - ' + det : '');
      } else if (det.length < 3) { m.textContent = 'اكتب السبب'; return; }
      var items = [];
      for (var k = 0; k < ks.length; k++) {
        var i = +ks[k], x = { i: i, q: sel[i] };
        if (kind === 'استبدال') { var t = to[i]; if (!t || !t.code || !t.color || !t.size) { m.textContent = 'اختار البديل (التصميم واللون والمقاس) لكل قطعة'; return; } x.to = t; }
        items.push(x);
      }
      var file = $$('hzri').files[0], b = $$('hzrs'); b.disabled = true; m.textContent = 'استنى لحظة...';
      var send = function (b64) {
        postApi({ type: 'track_return', sess: SESS, inv: o.inv, kind: kind, reason: reason, items: items, img: b64 || '' }, function (r) {
          b.disabled = false;
          if (r && r.ok) { o.ret = { kind: kind, st: 'جديد' }; box.innerHTML = head('تم الإرسال', { back: function () { detail(o, false); } }) + '<div class="hzsec" style="text-align:center;line-height:1.9">وصل طلب ال' + E(kind) + ' وهنتواصل معاك قريب.</div>'; bind({ back: function () { detail(o, false); } }); }
          else m.textContent = r ? (ERR[r.error] || 'حصل خطأ') : 'مشكلة في النت، جرب تاني';
        }, 60000);
      };
      if (!file) { send(''); return; }
      var im = new Image(), u = URL.createObjectURL(file); im.onload = function () { var s = Math.min(1, 1200 / Math.max(im.width, im.height)), cv = document.createElement('canvas'); cv.width = im.width * s; cv.height = im.height * s; cv.getContext('2d').drawImage(im, 0, 0, cv.width, cv.height); send(cv.toDataURL('image/jpeg', .8).split(',')[1]); }; im.onerror = function () { send(''); }; im.src = u;
    }
    draw();
  }

  /* ---------- لينك مباشر (من الواتساب أو المشاركة): من غير عنوان ---------- */
  function direct(tok) {
    var p = String(tok).split('.'); box.innerHTML = head('حالة طلبك') + '<div class="hzn">استنى لحظة...</div>'; bind(); ov.classList.add('open');
    postApi({ type: 'track_link', inv: p[0], tk: p[1] }, function (r) {
      if (!r || !r.ok || !r.orders.length) { box.innerHTML = head('حالة طلبك') + '<div class="hzb">' + (r ? 'اللينك مش صحيح' : 'مشكلة في النت') + '</div>'; bind(); return; }
      var o = r.orders[0]; o.tk = ''; META = { share: false, days: o.retDays };
      detail(o, true);
    }, 30000);
  }

  /* ---------- أيقونات الهيدر + النقطة الحمراء ---------- */
  window.__hzTrack = function (tok) {
    if (tok) { direct(tok); return; }
    ov.classList.add('open');
    if (SESS) ordersView(); else auth('in');
  };
  function openAccount() { ov.classList.add('open'); if (SESS) profileView(); else auth('in'); }
  var hero = document.querySelector('.hero'), hb = document.createElement('div'); hb.id = 'hzhb';
  hb.innerHTML = ib('hzab', SVG.user, 'حسابي') + '<span id="hztbw" style="display:none">' + ib('hztb', SVG.box, 'تتبع طلبي') + '</span>';
  hero.appendChild(hb);
  Array.prototype.forEach.call(hb.querySelectorAll('.hzib'), tipify);
  $$('hztb').onclick = function () { window.__hzTrack(); }; $$('hzab').onclick = openAccount;
  function checkDot(force) {
    if (!SESS) return;
    var last = N(lsGet('hz_dotchk')); if (!force && Date.now() - last < HZT.DOT_CHECK_MIN * 60000) return;
    lsSet('hz_dotchk', String(Date.now()));
    postApi({ type: 'track_orders', sess: SESS }, function (r) {
      if (!r || !r.ok) { if (r && r.error === 'session') setSess(''); return; }
      var seen = seenMap(), ch = r.orders.some(function (o) { return seen[o.inv] !== undefined && seen[o.inv] !== o.status; }) || (!Object.keys(seen).length && false);
      if (r.profile) document.dispatchEvent(new CustomEvent('hzprof', { detail: pubProf(r.profile) }));
      if (!Object.keys(seen).length) markSeen(r.orders); else dot(ch);
    }, 30000);
  }
  setTimeout(function () { checkDot(false); }, 2500);
  document.addEventListener('visibilitychange', function () { if (!document.hidden) checkDot(false); });
  var m = /#track=([^&]*)/.exec(location.hash || '');
  if (m) { var t = decodeURIComponent(m[1]); try { history.replaceState(history.state, '', location.pathname + location.search); } catch (e) {} setTimeout(function () { window.__hzTrack(t.indexOf('.') > 0 ? t : ''); }, 300); }
})();
