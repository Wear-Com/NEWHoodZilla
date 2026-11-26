/* FILE: js/56-side-menu-header-support-lang.js
   الهيدر والقايمة الجانبية والدعم والآراء وصفحة المنتجات الخاصة وتبديل اللغة
   (جزء من HoodZilla — بيتحمّل بالترتيب من index.html، والـ global scope مشترك بين كل الملفات. راجع FILES-GUIDE.md) */
(function () {
  /* ===================== القايمة الجانبية + الهيدر + عناوين إنجليزي + صفحة المنتجات الخاصة + أيقونات الكروت ===================== */
  var $$ = function (i) { return document.getElementById(i); }, SP = { psz: [], pz: [], pt: [] }, SXX = {};
  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function on(k) { return String(SXX[k]) !== 'لا'; }
  var IC = {
    menu: '<svg viewBox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
    box: '<svg viewBox="0 0 24 24"><path d="M21 8l-9-5-9 5v8l9 5 9-5z"/><path d="M3 8l9 5 9-5M12 13v8"/></svg>',
    ruler: '<svg viewBox="0 0 24 24"><path d="M3 17L17 3l4 4L7 21z"/><path d="M7 13l2 2M10 10l2 2M13 7l2 2"/></svg>',
    print: '<svg viewBox="0 0 24 24"><path d="M4 7l4-3h8l4 3-2.5 3.2L16 9v11H8V9l-1.5 1.2z"/><path d="M10.5 12.5l1.5 1.5 2.5-3"/></svg>',
    globe: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.2 3 14.8 0 18M12 3c-3 3.2-3 14.8 0 18"/></svg>',
    doc: '<svg viewBox="0 0 24 24"><path d="M6 3h9l4 4v14H6z"/><path d="M14 3v5h5M9 13h7M9 17h7"/></svg>',
    x: '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    dl: '<svg viewBox="0 0 24 24"><path d="M12 3v12M7 10l5 5 5-5M5 21h14"/></svg>',
    back: '<svg viewBox="0 0 24 24"><path d="M9 6l6 6-6 6"/></svg>'
  };
  var st = document.createElement('style');
  st.textContent = '#hzmb{position:absolute;top:12px;right:12px;z-index:4}#hzmb .hzib{position:relative}#hzhb{left:12px}' +
    '.hzib svg{stroke-width:2}.hzdot{position:absolute;top:-1px;right:-1px;width:10px;height:10px;border-radius:50%;background:#e56b58;border:2px solid #1c1812;display:none}' +
    '.hzdr{position:fixed;inset:0;z-index:90;display:none}.hzdr.open{display:block}.hzdr .bg{position:absolute;inset:0;background:rgba(0,0,0,.65);opacity:0;transition:opacity .25s}.hzdr.open .bg{opacity:1}' +
    '.hzdr .pn{position:absolute;top:0;bottom:0;right:0;width:min(86vw,340px);background:linear-gradient(180deg,#2b251c,#1a1610);border-left:1px solid rgba(216,180,114,.4);transform:translateX(100%);transition:transform .28s;display:flex;flex-direction:column;overflow:auto}.hzdr.open .pn{transform:none}' +
    '.hzdr .hd{display:flex;align-items:center;justify-content:space-between;padding:16px 16px 12px;border-bottom:1px solid var(--line)}.hzdr .hd b{font-size:19px;letter-spacing:1px;color:var(--gold-2)}' +
    '.hzdr .it{display:flex;align-items:center;gap:14px;padding:14px 18px;color:var(--ink);font-size:15.5px;font-weight:700;background:none;border:0;border-bottom:1px solid rgba(216,180,114,.1);width:100%;text-align:right;font-family:inherit;cursor:pointer;position:relative}' +
    '.hzdr .it svg{width:22px;height:22px;fill:none;stroke:var(--gold);stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round;flex:none}.hzdr .it small{display:block;font-size:11.5px;color:var(--muted);font-weight:500;margin-top:2px}.hzdr .it:hover{background:rgba(216,180,114,.07)}' +
    '.hzdr .it .hzdot{top:14px;right:auto;left:18px;display:none}.hzdr .gap{flex:1}' +
    '.hzdr .lang{display:flex;gap:6px;padding:12px 18px;align-items:center;border-bottom:1px solid rgba(216,180,114,.1)}.hzdr .lang svg{width:22px;height:22px;fill:none;stroke:var(--gold);stroke-width:1.9;margin-left:8px}.hzdr .lang button{flex:1;border:1px solid var(--gold);background:transparent;color:var(--gold-2);border-radius:30px;padding:7px;font-family:inherit;font-weight:700;cursor:pointer}.hzdr .lang button.on{background:linear-gradient(135deg,var(--gold-2),var(--gold));color:#1a1408}' +
    '.hzdr .ft{padding:10px 0 18px}.hzdr .ft .it{border-bottom:0;font-size:14px;color:var(--muted)}' +
    '.hzspg{position:fixed;inset:0;z-index:85;background:#1c1812;display:none;flex-direction:column}.hzspg.open{display:flex}.hzspg .hd{display:flex;align-items:center;gap:10px;padding:12px 14px;border-bottom:1px solid var(--line);background:#241f17}.hzspg .hd h3{flex:1;font-size:17px;color:var(--gold-2)}.hzspg .bd{flex:1;overflow:auto;padding:14px}.hzspg .nt{font-size:13px;color:var(--muted);line-height:1.9;margin-bottom:12px}' +
    '.hzspg .gr{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}@media(min-width:760px){.hzspg .gr{grid-template-columns:repeat(4,1fr)}}.hzspg .pc{border:1px solid var(--line);border-radius:14px;overflow:hidden;background:var(--card);cursor:pointer;text-align:center;padding-bottom:8px}.hzspg .pc .im{position:relative;padding-top:120%;background:#2a241b;overflow:hidden}.hzspg .pc .im img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0;transition:opacity .6s}.hzspg .pc .im img.on{opacity:1}.hzspg .pc b{display:block;font-size:13.5px;margin:8px 6px 2px}.hzspg .pc span{font-size:12px;color:var(--gold-2)}' +
    '.hzspic{position:absolute;bottom:8px;left:8px;display:flex;gap:5px;z-index:3}.hzspic i{width:26px;height:26px;border-radius:50%;background:rgba(20,17,13,.78);border:1px solid rgba(216,180,114,.6);display:flex;align-items:center;justify-content:center;color:var(--gold-2)}.hzspic svg{width:15px;height:15px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}' +
    '.hzhelp{line-height:2;font-size:14px}.hzhelp ol{padding-right:20px;margin:10px 0}' +
    '.hzaskl{color:var(--gold-2);font-weight:800;text-decoration:underline;margin-right:6px;white-space:nowrap}#hzask{display:none!important}button.hzaskl{background:none;border:0;font:inherit;cursor:pointer;opacity:.7;display:inline-flex;align-items:center;gap:4px;text-decoration:none;padding:0}button.hzaskl svg{flex:none}';
  document.head.appendChild(st);

  /* ---------- هيدر: حسابي + تثبيت (شمال) / 3 شرط (يمين) ---------- */
  var hero = document.querySelector('.hero'), hb = $$('hzhb');
  var mb = document.createElement('div'); mb.id = 'hzmb'; mb.innerHTML = '<button class="hzib" id="hzmenu" type="button" aria-label="القائمة">' + IC.menu + '<i class="hzdot" id="hztdot"></i></button>'; hero.appendChild(mb);
  var UA = navigator.userAgent, ios = /iphone|ipad|ipod/i.test(UA) || (/Macintosh/i.test(UA) && navigator.maxTouchPoints > 1), android = /android/i.test(UA), dp = window.__hzdp || null;
  var standalone = (window.navigator.standalone === true) || (window.matchMedia && (matchMedia('(display-mode: standalone)').matches || matchMedia('(display-mode: fullscreen)').matches || matchMedia('(display-mode: minimal-ui)').matches));
  function getI() { try { return localStorage.getItem('hz_inst') === '1'; } catch (e) { return false; } }
  function setI() { try { localStorage.setItem('hz_inst', '1'); } catch (e) {} }
  if (standalone) setI();
  window.addEventListener('appinstalled', function () { setI(); dp = null; window.__hzdp = null; });
  var ib = document.createElement('button'); ib.id = 'hzin'; ib.className = 'hzib'; ib.type = 'button'; ib.setAttribute('data-tip', 'تثبيت التطبيق'); ib.setAttribute('aria-label', 'تثبيت التطبيق'); ib.innerHTML = IC.dl;
  if (!standalone && hb) hb.appendChild(ib);              // جوه التطبيق مفيش أيقونة. في المتصفح بتفضل ظاهرة
  window.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); dp = e; window.__hzdp = e; try { localStorage.removeItem('hz_inst'); } catch (x) {} });
  if (dp) { try { localStorage.removeItem('hz_inst'); } catch (x) {} }   // الحدث اتلقط بدري: يبقى التطبيق مش متثبت
  try { if (navigator.getInstalledRelatedApps) navigator.getInstalledRelatedApps().then(function (a) { if (a && a.length) setI(); }).catch(function () {}); } catch (e) {}
  function browser() {
    if (/FBAN|FBAV|Instagram|TikTok|musical_ly|Line\/|Snapchat|Twitter|WhatsApp|; wv\)/i.test(UA)) return 'inapp';
    if (/Opera Mini/i.test(UA)) return 'operamini'; if (/OPR\/|Opera|OPT\//i.test(UA)) return 'opera'; if (/SamsungBrowser/i.test(UA)) return 'samsung'; if (/EdgA|EdgiOS|Edg\//i.test(UA)) return 'edge';
    if (/Firefox|FxiOS/i.test(UA)) return 'firefox'; if (/CriOS|Chrome/i.test(UA)) return 'chrome'; if (/Safari/i.test(UA)) return 'safari'; return 'other';
  }
  function steps(br) {
    if (ios) return br === 'inapp' ? ['افتح الرابط في Safari (اضغط ⋯ ثم "Open in Safari" أو انسخ الرابط).', 'اضغط زرار المشاركة ⬆︎.', 'اختار "Add to Home Screen" (إضافة إلى الشاشة الرئيسية) ثم "Add".'] : ['اضغط زرار المشاركة ⬆︎ (تحت في Safari، أو فوق جنب شريط العنوان).', 'اسحب لتحت واختار "Add to Home Screen" (إضافة إلى الشاشة الرئيسية).', 'اضغط "Add" وهتلاقي HoodZilla بين تطبيقاتك.'];
    if (br === 'inapp') return ['إنت فاتح الموقع جوه تطبيق (انستا/فيسبوك/تيك توك) والتثبيت مش بيشتغل منه.', 'اضغط ⋮ أو ⋯ واختار "فتح في المتصفح" (Open in browser).', 'بعدها اضغط أيقونة التثبيت هنا تاني.'];
    if (android) {
      if (br === 'operamini') return ['Opera Mini مبيدعمش تثبيت المواقع كتطبيقات.', 'افتح الموقع من Opera العادي أو Chrome.', 'بعدها اضغط أيقونة التثبيت هنا تاني.'];
      if (br === 'opera') return ['اضغط على ⋮ أو أيقونة القائمة في Opera.', 'اختار "الصفحة الرئيسية / Home screen" أو "إضافة إلى" ثم "الشاشة الرئيسية".', 'اضغط "إضافة" (لو ظهر "تثبيت" اختاره).'];
      if (br === 'samsung') return ['اضغط ☰ (القائمة) في Samsung Internet.', 'اختار "إضافة الصفحة إلى" ثم "الشاشة الرئيسية".', 'اضغط "إضافة".'];
      if (br === 'firefox') return ['اضغط ⋮ في Firefox.', 'اختار "تثبيت" (Install) أو "إضافة إلى الشاشة الرئيسية".', 'اضغط "إضافة".'];
      if (br === 'edge') return ['اضغط ⋯ في Edge.', 'اختار "إضافة إلى الهاتف" (Add to phone).', 'اضغط "تثبيت".'];
      return ['اضغط ⋮ في المتصفح.', 'اختار "تثبيت التطبيق" (Install app). لو مش موجود اختار "إضافة إلى الشاشة الرئيسية".', 'اضغط "تثبيت" وهيظهر على موبايلك كتطبيق.'];
    }
    if (br === 'safari') return ['من قايمة Safari اختار File ثم "Add to Dock".'];
    if (br === 'firefox') return ['Firefox على الكمبيوتر مبيدعمش تثبيت المواقع كتطبيقات. افتح الموقع من Chrome أو Edge.'];
    return ['دوّر على أيقونة التثبيت ⊕ في شريط العنوان (يمين).', 'أو افتح قايمة المتصفح (⋮) واختار "تثبيت HoodZilla Store".', 'اضغط "تثبيت".'];
  }
  function help(installed) {
    var br = browser(), o = ovl('hzhelp'), st = steps(br), canOpen = android && br === 'inapp';
    o.querySelector('.hzs').innerHTML = '<h3><span>' + (installed ? 'التطبيق متثبت عندك' : 'تثبيت التطبيق') + '</span><button class="hzx" type="button">×</button></h3><div class="hzhelp">' +
      (installed ? '<p style="margin-bottom:8px">HoodZilla متثبت على جهازك. افتحه من الشاشة الرئيسية أو قايمة التطبيقات. وهنحاول نفتحه لك دلوقتي.</p>' : '') +
      (br === 'opera' && android && !installed ? '<p style="margin-bottom:8px">Opera غالباً مبيعرضش نافذة التثبيت لوحده، فالخطوات دي هي الطريقة.</p>' : '') +
      '<ol>' + st.map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ol>' +
      '<div style="display:flex;gap:8px;margin-top:10px">' + (canOpen ? '<button class="btn add" type="button" id="hzob">افتح في المتصفح</button>' : '') + '<button class="btn add" type="button" id="hzcl">انسخ الرابط</button></div></div>';
    o.classList.add('open'); o.querySelector('.hzx').onclick = function () { o.classList.remove('open'); };
    var cl = o.querySelector('#hzcl'); if (cl) cl.onclick = function () { try { navigator.clipboard.writeText(location.href.split('#')[0]); cl.textContent = 'اتنسخ ✓'; } catch (e) { cl.textContent = location.href; } };
    var ob = o.querySelector('#hzob'); if (ob) ob.onclick = function () { location.href = 'intent://' + location.host + location.pathname + location.search + '#Intent;scheme=https;action=android.intent.action.VIEW;end'; };
  }
  ib.onclick = function () {
    if (dp) {                                                 // الحدث بيتستخدم مرة واحدة بس. بعدها الدوسة التانية تفتح الخطوات
      var q = dp; dp = null; window.__hzdp = null;
      try { q.prompt(); if (q.userChoice) q.userChoice.then(function (r) { if (r && r.outcome === 'accepted') setI(); }, function () {}); } catch (e) { help(false); }
      return;
    }
    if (getI()) {                                              // متثبت فعلاً: حاول تفتحه بدل ما تثبّته تاني
      help(true);
      try { var w = window.open(location.origin + location.pathname, '_blank'); } catch (e) {}
      return;
    }
    help(false);
  };
  function ovl(id) { var o = $$(id); if (!o) { o = document.createElement('div'); o.id = id; o.className = 'hzo'; o.innerHTML = '<div class="hzs"></div>'; document.body.appendChild(o); o.addEventListener('click', function (e) { if (e.target === o) o.classList.remove('open'); }); } return o; }

  /* ---------- القايمة الجانبية ---------- */
  var dr = document.createElement('div'); dr.className = 'hzdr'; dr.id = 'hzdr';
  var IC2 = {
    user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="3.6"/><path d="M4.5 20c.8-3.6 3.8-5.6 7.5-5.6s6.7 2 7.5 5.6"/></svg>',
    help: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 13v-1a8 8 0 0 1 16 0v1"/><rect x="3" y="13" width="4" height="6" rx="1.5"/><rect x="17" y="13" width="4" height="6" rx="1.5"/><path d="M19 19c0 1.7-2 2.5-5 2.5"/></svg>',
    msg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5h16v11H9l-5 4z"/><path d="M8 9.5h8M8 12.5h5"/></svg>'
  };
  dr.innerHTML = '<div class="bg"></div><div class="pn"><div class="hd"><b>HoodZilla Store</b><button class="hzib" type="button" id="hzdx" aria-label="إغلاق">' + IC.x + '</button></div>' +
    '<button class="it" type="button" id="hzd1">' + IC.box + '<span>تتبع الطلبات</span><i class="hzdot" id="hztdot2"></i></button>' +
    '<button class="it" type="button" id="hzd5">' + IC2.user + '<span>حسابي<small>بياناتك وعناوينك وطلباتك</small></span></button>' +
    '<button class="it" type="button" id="hzd2" data-sp="sz">' + IC.ruler + '<span>اطلب مقاس مخصص<small>مقاسك بالظبط على المنتجات المتاحة</small></span></button>' +
    '<button class="it" type="button" id="hzd3" data-sp="pr">' + IC.print + '<span>اطلب طباعة خاصة<small>صمّم وشوف المعاينة 3D</small></span></button>' +
    '<div class="gap"></div>' +
    '<div class="ft"><button class="it sm" type="button" id="hzd6">' + IC2.help + '<span>الدعم وخدمة العملاء</span></button>' +
    '<button class="it sm" type="button" id="hzd7">' + IC2.msg + '<span>آراء واقتراحات</span></button>' +
    '<button class="it sm" type="button" id="hzd4">' + IC.doc + '<span>سياسة الموقع</span></button>' +
    '<div class="lang">' + IC.globe + '<button type="button" data-l="ar" class="on">عربي</button><button type="button" data-l="en">English</button></div></div></div>';
  document.body.appendChild(dr);
  function openDr() { dr.classList.add('open'); try { history.pushState({ hz: 'dr' }, '', location.pathname + location.search); dr._p = true; } catch (e) {} }
  function closeDr(fromPop) { if (!dr.classList.contains('open')) return; dr.classList.remove('open'); if (dr._p) { dr._p = false; if (fromPop !== true) { window.__skipPop = true; setTimeout(function () { window.__skipPop = false; }, 600); try { history.back(); } catch (e) {} } } }
  window.addEventListener('popstate', function () { if (dr.classList.contains('open') && !(history.state && history.state.hz === 'dr')) { dr._p = false; dr.classList.remove('open'); } });
  $$('hzmenu').onclick = openDr; $$('hzdx').onclick = function () { closeDr(); }; dr.querySelector('.bg').onclick = function () { closeDr(); };
  $$('hzd1').onclick = function () { closeDr(); setTimeout(function () { window.__hzTrack(); }, 60); };
  $$('hzd4').onclick = function () { closeDr(); setTimeout(function () { var b = $$('hzpl2'); if (b) b.click(); }, 60); };
  $$('hzd5').onclick = function () { closeDr(); setTimeout(function () { var b = $$('hzab'); if (b) b.click(); }, 60); };
  $$('hzd6').onclick = function () { closeDr(); setTimeout(function () { supportPanel(); }, 60); };
  $$('hzd7').onclick = function () { closeDr(); setTimeout(function () { feedbackPanel(); }, 60); };
  function E(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function sset(k) { return (window.__hzSET || {})[k] || ''; }
  /* الدعم وخدمة العملاء: أسئلة شائعة (من الشيت) + زرار واتساب */
  function supportPanel() {
    var o = ovl('hzsup'), faq = window.__hzFAQ || [], num = String(sset('واتساب_الدعم') || WHATSAPP || '').replace(/\D/g, '');
    var h = '<h3><span>الدعم وخدمة العملاء</span><button class="hzx" type="button">' + IC.x + '</button></h3><div class="hzhelp">';
    if (faq.length) h += '<div class="hzfaq">' + faq.map(function (f, i) { return '<details><summary>' + E(f.q) + '</summary><p>' + E(f.a) + '</p></details>'; }).join('') + '</div>';
    h += '<p class="hzm" style="margin:10px 0">لو لسه محتاج مساعدة، كلمنا على واتساب ونرد عليك بأسرع وقت.</p>';
    if (num) h += '<a class="btn wa" target="_blank" rel="noopener" href="https://wa.me/' + num + '?text=' + encodeURIComponent(sset('رسالة_الدعم') || 'أهلاً HoodZilla، محتاج مساعدة في') + '">كلّمنا على واتساب</a>';
    h += '</div>';
    o.querySelector('.hzs').innerHTML = h; o.classList.add('open'); o.querySelector('.hzx').onclick = function () { o.classList.remove('open'); };
  }
  /* آراء واقتراحات: بتتسجل في الشيت (تاب آراء العملاء) وبتتبعتلك على واتساب */
  function feedbackPanel() {
    if (sset('آراء_واقتراحات_مفعلة') === 'لا') return;
    var o = ovl('hzfbk'), nm = (lsGet('hz_fbname') || '');
    o.querySelector('.hzs').innerHTML = '<h3><span>آراء واقتراحات</span><button class="hzx" type="button">' + IC.x + '</button></h3><div class="hzhelp" id="hzfbb"><p class="hzm" style="margin-bottom:8px">رأيك بيفرق معانا. اكتب أي اقتراح أو ملاحظة على الموقع أو المنتجات.</p><textarea id="hzfbt" rows="5" maxlength="1000" placeholder="اكتب رأيك أو اقتراحك هنا"></textarea><input id="hzfbn" placeholder="اسمك (اختياري)" value="' + E(nm) + '"><div class="hzb" id="hzfbm" role="alert"></div><button class="btn add" type="button" id="hzfbs">إرسال</button></div>';
    o.classList.add('open'); o.querySelector('.hzx').onclick = function () { o.classList.remove('open'); };
    $$('hzfbs').onclick = function () {
      var txt = $$('hzfbt').value.trim(), b = $$('hzfbs'), m = $$('hzfbm');
      if (txt.length < 3) { m.textContent = 'اكتب رأيك الأول'; return; }
      b.disabled = true; m.textContent = 'استنى لحظة...'; lsSet('hz_fbname', $$('hzfbn').value.trim());
      var sid = lsGet('hz_sid') || (function () { var s = Math.random().toString(36).slice(2, 12); lsSet('hz_sid', s); return s; })();
      postApi({ type: 'feedback', text: txt, name: $$('hzfbn').value.trim(), phone: lsGet('hz_phone') || '', sid: sid, page: (location.hash || '').slice(0, 60), lang: lsGet('hz_lang') === 'en' ? 'en' : 'ar' }, function (r) {
        b.disabled = false;
        if (r && r.ok) { $$('hzfbb').innerHTML = '<p style="text-align:center;margin:18px 0;color:var(--gold-2);font-weight:800">شكراً لرأيك، وصلنا</p><button class="btn add" type="button" id="hzfbc">تمام</button>'; $$('hzfbc').onclick = function () { o.classList.remove('open'); }; }
        else m.textContent = !r ? 'مشكلة في النت، جرّب تاني' : (r.error === 'rate' ? 'بعتّ كذا رسالة، جرّب بعد شوية' : (r.error === 'short' ? 'اكتب رأيك الأول' : 'حصل خطأ، جرّب تاني'));
      }, 20000);
    };
  }
  Array.prototype.forEach.call(dr.querySelectorAll('[data-sp]'), function (b) { b.onclick = function () { var k = b.getAttribute('data-sp'); closeDr(); setTimeout(function () { spPage(k); }, 60); }; });
  new MutationObserver(function () { var d = $$('hztdot'); $$('hztdot2').style.display = d && d.style.display === 'block' ? 'block' : 'none'; }).observe($$('hztdot'), { attributes: true, attributeFilter: ['style'] });

  /* ---------- صفحة المنتجات المتاحة للمقاس/الطباعة الخاصة ---------- */
  var pg = document.createElement('div'); pg.className = 'hzspg'; pg.id = 'hzspg'; document.body.appendChild(pg);
  function elig(p, k) {
    if (!p.inStock) return false;
    if (k === 'sz') return !!p.sp && on('المقاس_الخاص_مفعل') && (p.mt !== 'pants' || SP.psz.length > 0);
    return !!p.pp && on('الطباعة_الخاصة_مفعلة');
  }
  function spPage(k) {
    var list = ALL.filter(function (p) { return elig(p, k); });
    pg.innerHTML = '<div class="hd"><h3>' + (k === 'sz' ? 'مقاس مخصص' : 'طباعة خاصة') + '</h3><button class="hzib" type="button" id="hzspx">' + IC.x + '</button></div><div class="bd"><div class="nt">' + (k === 'sz' ? 'اختار المنتج اللي عايزه بمقاسك بالظبط، وهنفتحلك نموذج القياسات.' : 'اختار المنتج، وارفع تصميمك وشوف شكله على المنتج بالـ 3D قبل ما تطلب.') + '</div><div class="gr" id="hzspgr"></div></div>';
    var gr = $$('hzspgr');
    if (!list.length) gr.innerHTML = '<div class="nt">مفيش منتجات متاحة دلوقتي.</div>';
    list.forEach(function (p) {
      var c = document.createElement('div'), cp = cardPrice(p); c.className = 'pc';
      c.innerHTML = '<div class="im"></div><b></b><span></span>'; c.querySelector('b').textContent = p.name; c.querySelector('span').textContent = (cp.differ ? 'يبدأ من ' : '') + cp.text + ' ' + CURRENCY;
      var imgs = cardImgs(p); if (imgs.length) { var im = makeImg(imgs[0].id, IMG_W, p.name); c.querySelector('.im').appendChild(im); im.load(); im.className = 'on'; }
      c.onclick = function () { pg.classList.remove('open'); closePg(true); openModal(p); setTimeout(function () { if (window.__hzOpenSpecial) window.__hzOpenSpecial(k); }, 450); };
      gr.appendChild(c);
    });
    $$('hzspx').onclick = function () { closePg(); };
    pg.classList.add('open'); try { history.pushState({ hz: 'sp' }, '', location.pathname + location.search); pg._p = true; } catch (e) {}
  }
  function closePg(silent) { pg.classList.remove('open'); if (pg._p) { pg._p = false; if (!silent) { window.__skipPop = true; setTimeout(function () { window.__skipPop = false; }, 600); try { history.back(); } catch (e) {} } } }
  window.addEventListener('popstate', function () { if (pg.classList.contains('open') && !(history.state && history.state.hz === 'sp')) { pg._p = false; pg.classList.remove('open'); } });

  /* ---------- أيقونات المقاس/الطباعة على كروت المنتجات ---------- */
  function decorate() {
    Array.prototype.forEach.call(document.querySelectorAll('#grid .card'), function (c) {
      if (c._hzd) return; c._hzd = 1;
      var chip = c.querySelector('.codechip'); if (!chip) return;
      var p = ALL.filter(function (x) { return dcode(x.code) === chip.textContent; })[0]; if (!p) return;
      var a = elig(p, 'sz'), b = elig(p, 'pr'); if (!a && !b) return;
      var w = c.querySelector('.imgwrap'); if (!w) return;
      var d = document.createElement('div'); d.className = 'hzspic'; d.innerHTML = (a ? '<i title="مقاس مخصص">' + IC.ruler + '</i>' : '') + (b ? '<i title="طباعة خاصة">' + IC.print + '</i>' : ''); w.appendChild(d);
    });
  }
  new MutationObserver(decorate).observe($$('grid'), { childList: true });

  /* ---------- عناوين إنجليزي (العناوين والأزرار الرئيسية بس) ---------- */
  var EN = {
    'تتبع الطلبات': 'Track order', 'اطلب مقاس مخصص': 'Custom sizes', 'اطلب طباعة خاصة': 'Custom printing', 'سياسة الموقع': 'Website policy', 'مقاسات مخصصة': 'Custom sizes', 'طباعة خاصة': 'Custom printing',
    'القائمة': 'Menu', 'جدول المقاسات': 'Size chart', 'اعرف مقاسك': 'Find your size', 'حسابي': 'My account', 'طلباتك': 'My orders', 'تتبع طلباتك': 'Track your orders', 'دخول': 'Log in', 'حساب جديد': 'Sign up',
    'إضافة للسلة': 'Add to cart', 'السلة': 'Cart', 'بيانات العميل': 'Customer details', 'إتمام الطلب': 'Place order', 'اختر اللون': 'Choose colour', 'اللون': 'Colour', 'المقاس': 'Size', 'الكمية': 'Quantity',
    'تثبيت التطبيق': 'Install app', 'سياسة الشغل والاسترجاع': 'Work & return policy', 'أهلاً بيك': 'Welcome', 'كمّل بياناتك': 'Complete your details', 'عناويني': 'My addresses', 'تفاصيل الطلب': 'Order details',
    'تصميم جديد': 'New design', 'التصاميم': 'Designs', 'مكان الطباعة': 'Print placement', 'معاينة 3D': '3D preview', 'عربي': 'عربي', 'English': 'English'
  };
  Object.keys(window.HZ_EN || {}).forEach(function (k) { EN[k] = window.HZ_EN[k]; });
  var orig = new WeakMap(), lang = lsGet('hz_lang') === 'en' ? 'en' : 'ar', busy = false;
  function tr(root) {
    if (busy) return; busy = true;
    var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null), n, list = [];
    while ((n = w.nextNode())) list.push(n);
    list.forEach(function (t) {
      var raw = t.nodeValue, k = (orig.has(t) ? orig.get(t) : raw).trim();
      if (lang === 'en' && EN[k] && !/^(script|style)$/i.test(t.parentNode.nodeName)) { if (!orig.has(t)) orig.set(t, raw); t.nodeValue = raw.replace(k, EN[k]); }
      else if (lang === 'ar' && orig.has(t)) { t.nodeValue = orig.get(t); orig.delete(t); }
    });
    busy = false;
  }
  function setLang(l) {
    lang = l; lsSet('hz_lang', l); Array.prototype.forEach.call(dr.querySelectorAll('.lang button'), function (b) { b.classList.toggle('on', b.getAttribute('data-l') === l); });
    document.documentElement.setAttribute('lang', l === 'en' ? 'en' : 'ar'); tr(document.body);
  }
  Array.prototype.forEach.call(dr.querySelectorAll('.lang button'), function (b) { b.onclick = function () { setLang(b.getAttribute('data-l')); }; });
  var tm = null; new MutationObserver(function (ms) { if (lang !== 'en') return; for (var i = 0; i < ms.length; i++) { var an = ms[i].addedNodes; for (var j = 0; j < an.length; j++) { if (an[j].nodeType === 1) tr(an[j]); } } clearTimeout(tm); tm = setTimeout(function () { tr(document.body); }, 120); }).observe(document.body, { childList: true, subtree: true, characterData: false });
  if (lang === 'en') setLang('en');

  /* ---------- بيانات الكتالوج ---------- */
  var _ad = applyData;
  applyData = function (d, f) { SXX = d.settings || {}; SP = { psz: d.psz || [], pz: d.pz || [], pt: d.pt || [] }; window.__hzSP = SP; _ad(d, f); setTimeout(decorate, 50); if (lang === 'en') setTimeout(function () { tr(document.body); }, 200); };
  window.__hzElig = elig;
})();
