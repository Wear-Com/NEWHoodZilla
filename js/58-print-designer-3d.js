/* FILE: js/58-print-designer-3d.js
   مصمم الطباعة 3D: معاينة، قص، زوم، إزالة خلفية AI، رفع
   (جزء من HoodZilla — بيتحمّل بالترتيب من index.html، والـ global scope مشترك بين كل الملفات. راجع FILES-GUIDE.md) */
(function () {
  /* ===================== مصمّم الطباعة الخاصة: معاينة 3D + أكتر من تصميم + إزالة خلفية (سريعة / AI) + رفع ===================== */
  var CFG = {
    THREE: 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js',
    LIBS: ['https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js', 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js', 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/geometries/DecalGeometry.js'],
    ORT: 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.17.1/dist/ort.min.js',
    AI_MODEL: 'Assets/u2netp.onnx',                 // ملف الموديل في جذر الريبو
    MODELS: { hoodie: 'Assets/hoodie.glb', jacket: 'Assets/jacket.glb', pants: 'Assets/pants.glb' },
    WORK_MAX: 1600, CHUNK: 2400000
  };
  var $$ = function (i) { return document.getElementById(i); };
  function N(v) { var n = parseFloat(v); return isNaN(n) ? 0 : n; }
  function E(v) { return String(v == null ? '' : v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function rnd() { return Math.random().toString(36).slice(2, 10) + Date.now().toString(36); }
  var COL = { 'اسود': '#161616', 'ابيض': '#f1f1ee', 'رمادي': '#8a8a8a', 'رصاصي': '#5e5e62', 'كحلي': '#1d2b4a', 'ازرق': '#2f5aa8', 'لبني': '#8ec5ea', 'احمر': '#b3262b', 'بوردو': '#5b1a26', 'اخضر': '#2f6b3d', 'زيتي': '#5b6139', 'بيج': '#cdb894', 'كريمي': '#e8dcc2', 'بني': '#5a3b27', 'اصفر': '#e3c13b', 'برتقالي': '#d9702a', 'بينك': '#e58fb1', 'وردي': '#e58fb1', 'موف': '#7b4fa0', 'بنفسجي': '#6a3f95', 'جملي': '#b07a3a', 'ستون': '#9c9684', 'اوف وايت': '#ece6d6' };
  function norm(s) { return String(s || '').replace(/[ً-ْ]/g, '').replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي').trim(); }
  function colorHex(name, opts) {
    var m = {}; Object.keys(COL).forEach(function (k) { m[norm(k)] = COL[k]; });
    String((window.__hzSET || {})['ألوان_المجسم'] || '').split(/[;\n،]/).forEach(function (p) { var a = p.split('='); if (a.length === 2 && /^#?[0-9a-f]{3,8}$/i.test(a[1].trim())) m[norm(a[0])] = (a[1].trim()[0] === '#' ? '' : '#') + a[1].trim(); });
    var n = norm(name); if (m[n]) return m[n];
    var best = ''; Object.keys(m).forEach(function (k) { if (n.indexOf(k) > -1 && k.length > best.length) best = k; });
    return best ? m[best] : '#6f6f6f';
  }
  function loadScript(u) { return new Promise(function (res, rej) { var s = document.createElement('script'); s.src = u; s.onload = res; s.onerror = function () { rej(new Error('load ' + u)); }; document.head.appendChild(s); }); }
  var libP = null;
  function loadThree() {
    if (window.THREE && THREE.OrbitControls && THREE.GLTFLoader && THREE.DecalGeometry) return Promise.resolve();
    if (libP) return libP;
    libP = loadScript(CFG.THREE).then(function () { return Promise.all(CFG.LIBS.map(loadScript)); }).catch(function (e) { libP = null; throw e; });
    return libP;
  }
  function webglOk() { try { var c = document.createElement('canvas'); return !!(c.getContext('webgl') || c.getContext('experimental-webgl')); } catch (e) { return false; } }
  window.__hzPreloadDesigner = function () { if (webglOk()) loadThree().catch(function () {}); };

  var st = document.createElement('style');
  st.textContent = '#hzpd{position:fixed;inset:0;z-index:95;background:#16130e;display:none;flex-direction:column}#hzpd.open{display:flex}#hzpd .hd{display:flex;align-items:center;gap:10px;padding:10px 14px;background:#241f17;border-bottom:1px solid var(--line)}#hzpd .hd h3{flex:1;font-size:16px;color:var(--gold-2)}#hzpd .sc{flex:1;overflow:auto;-webkit-overflow-scrolling:touch}' +
    '#hzpd .stg{position:relative;width:100%;height:46vh;min-height:300px;background:radial-gradient(ellipse at 50% 35%,#2d261b,#14110c);touch-action:none}#hzpd .stg canvas{width:100%;height:100%;display:block;touch-action:none}#hzpd .hint{position:absolute;left:0;right:0;bottom:8px;text-align:center;font-size:11.5px;color:var(--muted);pointer-events:none}#hzpd .ldg{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:var(--muted);font-size:14px;pointer-events:none}' +
    '#hzpd .pn{padding:12px 14px;display:flex;flex-direction:column;gap:10px}#hzpd .chips{display:flex;gap:6px;flex-wrap:wrap}#hzpd .chips button,#hzpd .tb button,#hzpd .tb label.bt{border:1px solid rgba(216,180,114,.5);background:transparent;color:var(--gold-2);border-radius:30px;padding:7px 13px;font-family:inherit;font-size:12.5px;font-weight:700;cursor:pointer}#hzpd .chips button.on{background:linear-gradient(135deg,var(--gold-2),var(--gold));color:#1a1408}#hzpd .chips button:disabled{opacity:.35}' +
    '#hzpd .strip{display:flex;gap:8px;overflow:auto;padding-bottom:2px}#hzpd .tn{position:relative;flex:none;width:62px;height:62px;border-radius:10px;border:2px solid transparent;background:#2a241b;overflow:hidden;cursor:pointer}#hzpd .tn.on{border-color:var(--gold)}#hzpd .tn img{width:100%;height:100%;object-fit:contain}#hzpd .tn i{position:absolute;top:1px;left:1px;width:20px;height:20px;border-radius:50%;background:rgba(0,0,0,.7);color:#fff;font-style:normal;font-size:13px;line-height:20px;text-align:center}' +
    '#hzpd .add{flex:none;width:62px;height:62px;border-radius:10px;border:1.5px dashed var(--gold);color:var(--gold-2);display:flex;flex-direction:column;align-items:center;justify-content:center;font-size:11px;gap:2px;cursor:pointer;background:rgba(216,180,114,.06)}#hzpd .add b{font-size:22px;line-height:1}' +
    '#hzpd .sl{display:flex;align-items:center;gap:10px;font-size:12.5px;color:var(--muted)}#hzpd .sl span{width:70px;flex:none}#hzpd .sl input{flex:1;accent-color:#d8b472}#hzpd .sl em{width:62px;text-align:left;font-style:normal;color:var(--gold-2);direction:ltr}#hzpd .tb{display:flex;gap:6px;flex-wrap:wrap}#hzpd .info{font-size:12.5px;line-height:1.8;color:var(--gold-2);border:1px solid var(--line);border-radius:12px;padding:8px 10px}#hzpd .warn{color:var(--red);font-size:12.5px}#hzpd .msg{font-size:12.5px;line-height:1.8;color:var(--muted)}' +
    '#hzpd .ft{padding:10px 14px 14px;border-top:1px solid var(--line);background:#241f17}#hzpd .pbar{height:6px;border-radius:6px;background:rgba(255,255,255,.1);overflow:hidden;margin-bottom:8px;display:none}#hzpd .pbar i{display:block;height:100%;width:0;background:linear-gradient(90deg,var(--gold-3),var(--gold-2));transition:width .2s}#hzpd textarea{width:100%;padding:9px;border-radius:10px;border:1px solid rgba(216,180,114,.28);background:var(--panel);color:var(--ink);font-family:inherit;font-size:14px}' +
    '#hzpd .f2d{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;overflow:hidden}#hzpd .f2d .ph{position:relative;height:100%;aspect-ratio:3/4;max-width:100%}#hzpd .f2d .ph>img.bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}#hzpd .f2d .dg{position:absolute;touch-action:none;cursor:grab;mix-blend-mode:multiply}#hzpd .f2d .dg.on{outline:1.5px dashed var(--gold)}';
  document.head.appendChild(st);

  var ov = document.createElement('div'); ov.id = 'hzpd'; document.body.appendChild(ov);
  var D = null;   // الجلسة الحالية

  function open(o) {
    D = { o: o, designs: [], sel: -1, three: null, mode3d: false, saving: false, closeP: false, busyN: 0, z2: 1 };
    if (o.state && o.state.designs) { D.designs = o.state.designs; D.designs.forEach(function (d) { d.mesh = null; d.tex = null; d.el = null; }); D.sel = D.designs.length ? 0 : -1; D.restored = true; }
    ov.innerHTML = '<div class="hd"><h3>طباعة خاصة</h3><button class="hzib" type="button" id="hzpdx" aria-label="إغلاق"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div><div class="sc"><div class="stg" id="hzpds"><div class="ldg" id="hzpdl">جاري تحميل المجسم...</div></div><div class="pn" id="hzpdp"></div></div><div class="ft"><div class="pbar" id="hzpdb"><i></i></div><div class="msg" id="hzpdm" style="margin-bottom:6px"></div><button class="hzib" type="button" id="hzpdcx" aria-label="إيقاف الحفظ" data-tip="إيقاف الحفظ" style="display:none;margin:0 auto 8px"><svg viewBox="0 0 24 24"><rect x="6" y="6" width="12" height="12" rx="2"/></svg></button><button class="btn add" type="button" id="hzpdok">حفظ الطباعة الخاصة</button></div><div class="busy" id="hzpdbz"><i></i><span id="hzpdbt"></span><button type="button" id="hzpdbc" style="display:none">إلغاء</button></div><div id="hzcrop"></div>';
    ov.classList.add('open'); try { history.pushState({ hz: 'pd' }, '', location.pathname + location.search); D.closeP = true; } catch (e) {}
    $$('hzpdx').onclick = function () { close(); };
    $$('hzpdok').onclick = save;
    if (!D.o.color && D.o.product && D.o.product.colors && D.o.product.colors.length) { var c0 = null; D.o.product.colors.forEach(function (c) { if (!c0 && c.inStock) c0 = c; }); D.o.color = c0 || D.o.product.colors[0]; }
    panel(); hist.reset(); hist.watch();
    if (!webglOk()) { start2d(); return; }
    loadThree().then(function () { return init3d(); }).then(function () { D.mode3d = true; panel(); }, function () { start2d(); });
  }
  function close(silent) {
    if (D && D.saving) return;
    ov.classList.remove('open'); ov.classList.remove('busy'); cropClose();
    if (D && D.three) { try { D.three.dispose(); } catch (e) {} D.three = null; }
    if (D && D.closeP) { D.closeP = false; if (!silent) { window.__skipPop = true; setTimeout(function () { window.__skipPop = false; }, 600); try { history.back(); } catch (e) {} } }
    ov.querySelector('.sc').innerHTML = '';
  }
  window.addEventListener('popstate', function () { if (ov.classList.contains('open') && !(history.state && history.state.hz === 'pd') && D && !D.saving) { D.closeP = false; close(true); } });

  /* ---------- ب-12: ستايل القص والزوم واللودينج ---------- */
  var st2 = document.createElement('style');
  st2.textContent = '#hzpd .busy{position:absolute;inset:0;z-index:30;background:rgba(22,19,14,.8);display:none;flex-direction:column;align-items:center;justify-content:center;gap:14px;color:var(--gold-2);font-size:15px;font-weight:700;text-align:center;padding:20px}#hzpd.busy .busy{display:flex}' +
    '#hzpd .busy i{width:38px;height:38px;border-radius:50%;border:3px solid rgba(216,180,114,.25);border-top-color:var(--gold-2);animation:hzspin .8s linear infinite}@keyframes hzspin{to{transform:rotate(360deg)}}' +
    '#hzpd .busy button{border:1px solid rgba(216,180,114,.5);background:transparent;color:var(--gold-2);border-radius:30px;padding:8px 20px;font-family:inherit;font-size:13px;font-weight:700;cursor:pointer}' +
    '#hzpd .tb button.on{background:linear-gradient(135deg,var(--gold-2),var(--gold));color:#1a1408}' +
    '#hzpd .zm{position:absolute;top:8px;left:8px;z-index:3;display:flex;flex-direction:column;gap:6px}#hzpd .zm button{width:38px;height:38px;border-radius:50%;border:1px solid rgba(216,180,114,.5);background:rgba(36,31,23,.85);color:var(--gold-2);font-size:20px;line-height:1;cursor:pointer;font-family:inherit;padding:0}' +
    '#hzpd .f2d .ph{transition:transform .2s}' +
    '#hzcrop{position:absolute;inset:0;z-index:25;background:#16130e;display:none;flex-direction:column}#hzcrop.open{display:flex}' +
    '#hzcrop .cwrap{flex:1;min-height:0;display:flex;align-items:center;justify-content:center;padding:18px;overflow:hidden}' +
    '#hzcrop .cstage{position:relative;touch-action:none;line-height:0;background:repeating-conic-gradient(#3a3226 0 25%,#2a241b 0 50%) 0 0/16px 16px}#hzcrop canvas{display:block}' +
    '#hzcrop .cbx{position:absolute;box-sizing:border-box;border:2px solid var(--gold-2);box-shadow:0 0 0 9999px rgba(10,8,5,.62);cursor:move;touch-action:none}' +
    '#hzcrop .cbx i{position:absolute;width:32px;height:32px;margin:-16px 0 0 -16px;touch-action:none}#hzcrop .cbx i:after{content:"";position:absolute;left:10px;top:10px;width:12px;height:12px;border-radius:3px;background:var(--gold-2);border:1px solid #1a1408}' +
    '#hzcrop .cft{padding:10px 14px 14px;border-top:1px solid var(--line);background:#241f17;display:flex;flex-direction:column;gap:8px}#hzcrop .cacts{display:flex;gap:8px}#hzcrop .cacts .btn{flex:1}#hzcrop .cacts button.cn{flex:none;border:1px solid rgba(216,180,114,.5);background:transparent;color:var(--gold-2);border-radius:30px;padding:0 18px;font-family:inherit;font-weight:700;cursor:pointer}';
  document.head.appendChild(st2);

  /* ---------- ب-12: لودينج للعمليات البطيئة ---------- */
  function L(t) { try { if (document.documentElement.getAttribute('lang') === 'en' && window.HZ_EN && window.HZ_EN[t]) return window.HZ_EN[t]; } catch (e) {} return t; }   // ترجمة فورية لنص اللودينج (الترجمة العامة بتتأخر 150ms)
  function busyOn(t, cancel) {
    if (!D) return; D.busyN = (D.busyN || 0) + 1; ov.classList.add('busy');
    var s = $$('hzpdbt'); if (s) s.textContent = L(t || '');
    var b = $$('hzpdbc'); if (b) { b.style.display = cancel ? '' : 'none'; b.onclick = cancel ? function () { busyOff(true); cancel(); } : null; }
  }
  function busyText(t) { var s = $$('hzpdbt'); if (s) s.textContent = L(t || ''); }
  function busyOff(all) {
    if (!D) { ov.classList.remove('busy'); return; }
    D.busyN = all ? 0 : Math.max(0, (D.busyN || 0) - 1); if (!D.busyN) ov.classList.remove('busy');
  }
  function withBusy(t, fn) {   // بيظهر اللودينج ويستنى الشاشة تترسم قبل الشغل التقيل
    busyOn(t);
    return new Promise(function (res) {
      setTimeout(function () {
        var r; try { r = fn(); } catch (e) { r = null; try { console.error(e); } catch (x) {} }
        Promise.resolve(r).then(function (v) { return v; }, function () { return null; }).then(function (v) { busyOff(); res(v); });
      }, 60);
    });
  }

  /* ---------- ب-12: الأبعاد والتمطيط ---------- */
  function baseCv(d) { return d.src || d.work; }                       // الصورة الكاملة قبل القص
  function ratioNow(d) { return d.wcm > 0 && d.hcm > 0 ? d.hcm / d.wcm : d.asp; }   // النسبة الحالية (بتختلف عن d.asp لو متمطّط)
  function syncStretch(d) { var b = $$('hzpdrr'); if (b) b.style.display = Math.abs(ratioNow(d) - d.asp) > 0.01 * d.asp ? '' : 'none'; }
  function clampToZone(d, z) {
    if (!z) return;
    if (d.rl === false) { d.wcm = Math.min(d.wcm, z.w); d.hcm = Math.min(d.hcm, z.h); }
    else { var r = ratioNow(d); d.wcm = Math.min(d.wcm, z.w, z.h / r); d.hcm = d.wcm * r; }
  }

  /* ---------- ب-12: زوم المعاينة (3D و2D) ---------- */
  function zoomAdd(host) {
    if (!host || host.querySelector('.zm')) return;
    var z = document.createElement('div'); z.className = 'zm';
    z.innerHTML = '<button type="button" id="hzpdzi" aria-label="تكبير" data-tip="تكبير">+</button><button type="button" id="hzpdzo" aria-label="تصغير" data-tip="تصغير">−</button><button type="button" id="hzpdzr" aria-label="رجوع للحجم الأصلي" data-tip="رجوع للحجم الأصلي">⟲</button>';
    host.appendChild(z);
    $$('hzpdzi').onclick = function () { zoomBy(1.25); }; $$('hzpdzo').onclick = function () { zoomBy(0.8); }; $$('hzpdzr').onclick = zoomReset;
  }
  function zoomBy(f) {
    var T = D && D.three;
    if (T) {
      var tg = T.controls.target, v = T.cam.position.clone().sub(tg), nd = Math.max(T.controls.minDistance, Math.min(T.controls.maxDistance, v.length() / f));
      T.cam.position.copy(tg.clone().add(v.normalize().multiplyScalar(nd))); T.controls.update();
    } else { D.z2 = Math.max(1, Math.min(3, (D.z2 || 1) * f)); zoom2d(); }
  }
  function zoomReset() {
    var T = D && D.three;
    if (T) { var v = T.cam.position.clone().sub(T.controls.target).normalize().multiplyScalar(2.7); T.cam.position.copy(T.controls.target.clone().add(v)); T.controls.update(); }
    else { D.z2 = 1; zoom2d(); }
  }
  function zoom2d() {
    var ph = $$('hzpdph'); if (!ph) return; var d = cur();
    ph.style.transformOrigin = d && d.px != null ? (d.px * 100) + '% ' + (d.py * 100) + '%' : '50% 50%'; ph.style.transform = 'scale(' + (D.z2 || 1) + ')';
  }

  /* ---------- ب-12: القص ---------- */
  function applyCrop(d, fr) {
    var base = baseCv(d), bw = base.width, bh = base.height, sx = 0, sy = 0, sw = bw, sh = bh, c = base;
    if (fr) {
      sx = Math.max(0, Math.min(bw - 1, Math.round(fr.x * bw))); sy = Math.max(0, Math.min(bh - 1, Math.round(fr.y * bh)));
      sw = Math.max(1, Math.min(bw - sx, Math.round(fr.w * bw))); sh = Math.max(1, Math.min(bh - sy, Math.round(fr.h * bh)));
      c = document.createElement('canvas'); c.width = sw; c.height = sh; c.getContext('2d').drawImage(base, sx, sy, sw, sh, 0, 0, sw, sh);
    }
    d.work = c; d.crop = fr ? { x: sx / bw, y: sy / bh, w: sw / bw, h: sh / bh } : null; d.asp = sh / sw;
    var t = document.createElement('canvas'); t.width = 124; t.height = Math.max(1, Math.round(124 * sh / sw)); t.getContext('2d').drawImage(c, 0, 0, t.width, t.height); d.thumb = t.toDataURL('image/png');
    var z = zobj(d.zone); d.hcm = d.wcm * d.asp; if (z) { d.wcm = Math.min(d.wcm, z.w, z.h / d.asp); d.hcm = d.wcm * d.asp; }   // القص بيمسح التمطيط
    var kind = d.nbKind; d.cv = c; d.dirty = true; d.nbRef = '';
    if (kind === 'fast') applyFast(d); else { if (kind === 'ai') d.nbKind = ''; retex(d); }
    if (!D.three) refresh(d);
    hist.reset();
    return kind === 'ai';                  // الـAI لازم يتعاد على الصورة المقصوصة
  }
  function cropApply(d, fr) {
    return withBusy('جاري القص...', function () { return applyCrop(d, fr); }).then(function (needAi) { panel(); if (needAi) aiRemove(d); });
  }
  function cropClose() { var b = $$('hzcrop'); if (b) { b.classList.remove('open'); b.innerHTML = ''; } }
  function cropOpen() {
    var d = cur(), box = $$('hzcrop'); if (!d || d.lock || !box) return;
    var base = baseCv(d), bw = base.width, bh = base.height;
    box.innerHTML = '<div class="hd"><h3>قص الصورة</h3><button class="hzib" type="button" id="hzcx" aria-label="إغلاق"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div>' +
      '<div class="cwrap" id="hzcw"><div class="cstage" id="hzcs"><canvas id="hzcc"></canvas><div class="cbx" id="hzcb"><i data-h="nw" style="left:0;top:0"></i><i data-h="n" style="left:50%;top:0"></i><i data-h="ne" style="left:100%;top:0"></i><i data-h="e" style="left:100%;top:50%"></i><i data-h="se" style="left:100%;top:100%"></i><i data-h="s" style="left:50%;top:100%"></i><i data-h="sw" style="left:0;top:100%"></i><i data-h="w" style="left:0;top:50%"></i></div></div></div>' +
      '<div class="cft"><div class="chips" id="hzcr"><button type="button" data-r="free" class="on">حر</button><button type="button" data-r="orig">الأصلية</button><button type="button" data-r="1">1:1</button><button type="button" data-r="0.75">3:4</button><button type="button" data-r="1.3333">4:3</button></div>' +
      '<div class="msg">اسحب الإطار أو أطرافه لتحديد الجزء المطلوب.</div><div class="tb"><button type="button" id="hzcrs">إعادة ضبط</button></div><div class="cacts"><button class="btn add" type="button" id="hzcok">تطبيق القص</button><button type="button" class="cn" id="hzccn">إلغاء</button></div></div>';
    box.classList.add('open');
    var wrap = $$('hzcw'), cs = $$('hzcs'), cc = $$('hzcc'), cb = $$('hzcb');
    var aw = Math.max(120, (wrap.clientWidth || 340) - 36), ah = Math.max(120, (wrap.clientHeight || 400) - 36), k = Math.min(aw / bw, ah / bh);
    var W = Math.max(40, Math.floor(bw * k)), H = Math.max(40, Math.floor(bh * k));
    cc.width = W; cc.height = H; cc.getContext('2d').drawImage(base, 0, 0, W, H); cs.style.width = W + 'px'; cs.style.height = H + 'px';
    var R = d.crop ? { x: d.crop.x * W, y: d.crop.y * H, w: d.crop.w * W, h: d.crop.h * H } : { x: 0, y: 0, w: W, h: H }, ratio = null, drag = null, MIN = 24;
    function cl(v, a, b) { return Math.max(a, Math.min(b, v)); }
    function draw() { cb.style.left = R.x + 'px'; cb.style.top = R.y + 'px'; cb.style.width = R.w + 'px'; cb.style.height = R.h + 'px'; }
    function setRatio(val, key) {
      ratio = val; Array.prototype.forEach.call($$('hzcr').querySelectorAll('button'), function (b) { b.classList.toggle('on', b.getAttribute('data-r') === key); });
      if (val) {
        var cx = R.x + R.w / 2, cy = R.y + R.h / 2, w = R.w, h = R.h;
        if (w / h > val) w = h * val; else h = w / val;
        if (w > W) { w = W; h = w / val; } if (h > H) { h = H; w = h * val; }
        R = { x: cl(cx - w / 2, 0, W - w), y: cl(cy - h / 2, 0, H - h), w: w, h: h };
      }
      draw();
    }
    function moveRect(dx, dy) { var r = drag.r0; R = { x: cl(r.x + dx, 0, W - r.w), y: cl(r.y + dy, 0, H - r.h), w: r.w, h: r.h }; }
    function sizeRect(hn, dx, dy) {
      var r = drag.r0, L = r.x, T = r.y, Rr = r.x + r.w, B = r.y + r.h;
      var hasW = hn.indexOf('w') > -1, hasE = hn.indexOf('e') > -1, hasN = hn.indexOf('n') > -1, hasS = hn.indexOf('s') > -1;
      if (!ratio) {
        if (hasW) L = cl(L + dx, 0, Rr - MIN); if (hasE) Rr = cl(Rr + dx, L + MIN, W);
        if (hasN) T = cl(T + dy, 0, B - MIN); if (hasS) B = cl(B + dy, T + MIN, H);
        R = { x: L, y: T, w: Rr - L, h: B - T }; return;
      }
      var ax = hasW ? r.x + r.w : r.x, ay = hasN ? r.y + r.h : r.y, w, h;      // ax/ay: الحافة المقابلة (ثابتة)
      if ((hasW || hasE) && (hasN || hasS)) {
        w = hasW ? r.w - dx : r.w + dx; var mw = Math.min(hasW ? ax : W - ax, (hasN ? ay : H - ay) * ratio);
        w = cl(w, MIN, Math.max(MIN, mw)); h = w / ratio; R = { x: hasW ? ax - w : ax, y: hasN ? ay - h : ay, w: w, h: h };
      } else if (hasW || hasE) {
        w = hasW ? r.w - dx : r.w + dx; var cy = r.y + r.h / 2, mh = 2 * Math.min(cy, H - cy), mw2 = Math.min(hasW ? ax : W - ax, mh * ratio);
        w = cl(w, MIN, Math.max(MIN, mw2)); h = w / ratio; R = { x: hasW ? ax - w : ax, y: cy - h / 2, w: w, h: h };
      } else {
        h = hasN ? r.h - dy : r.h + dy; var cx2 = r.x + r.w / 2, mw3 = 2 * Math.min(cx2, W - cx2), mh2 = Math.min(hasN ? ay : H - ay, mw3 / ratio);
        h = cl(h, MIN / ratio, Math.max(MIN / ratio, mh2)); w = h * ratio; R = { x: cx2 - w / 2, y: hasN ? ay - h : ay, w: w, h: h };
      }
    }
    cb.addEventListener('pointerdown', function (e) {
      var hn = e.target && e.target.getAttribute ? e.target.getAttribute('data-h') : null;
      drag = { mode: hn || 'move', sx: e.clientX, sy: e.clientY, r0: { x: R.x, y: R.y, w: R.w, h: R.h } };
      try { cb.setPointerCapture(e.pointerId); } catch (x) {} e.preventDefault(); e.stopPropagation();
    });
    cb.addEventListener('pointermove', function (e) {
      if (!drag) return; var dx = e.clientX - drag.sx, dy = e.clientY - drag.sy;
      if (drag.mode === 'move') moveRect(dx, dy); else sizeRect(drag.mode, dx, dy); draw();
    });
    function up() { drag = null; } cb.addEventListener('pointerup', up); cb.addEventListener('pointercancel', up);
    Array.prototype.forEach.call($$('hzcr').querySelectorAll('button'), function (b) {
      b.onclick = function () { var key = b.getAttribute('data-r'); setRatio(key === 'free' ? null : key === 'orig' ? bw / bh : parseFloat(key), key); };
    });
    $$('hzcrs').onclick = function () { R = { x: 0, y: 0, w: W, h: H }; setRatio(null, 'free'); };
    $$('hzcx').onclick = cropClose; $$('hzccn').onclick = cropClose;
    $$('hzcok').onclick = function () {
      var fr = { x: R.x / W, y: R.y / H, w: R.w / W, h: R.h / H }, full = fr.x < 0.004 && fr.y < 0.004 && fr.w > 0.992 && fr.h > 0.992;
      cropClose(); var same = full ? !d.crop : (d.crop && Math.abs(d.crop.x - fr.x) < 0.002 && Math.abs(d.crop.y - fr.y) < 0.002 && Math.abs(d.crop.w - fr.w) < 0.002 && Math.abs(d.crop.h - fr.h) < 0.002);
      if (!same) cropApply(d, full ? null : fr);
    };
    draw();
  }

  /* ---------- لوحة التحكم ---------- */
  function zonesFor() { return D.o.zones; }
  function zname(c) { var n = c; D.o.zones.forEach(function (z) { if (z.code === c) n = z.name; }); return n; }
  function zobj(c) { var r = null; D.o.zones.forEach(function (z) { if (z.code === c) r = z; }); return r; }
  function cur() { return D.designs[D.sel] || null; }
  function feeNow() { return D.designs.length ? D.o.fee({ d: D.designs.map(function (d) { return { w: d.wcm, h: d.hcm }; }) }) : 0; }
  function panel() {
    var p = $$('hzpdp'); if (!p) return; var d = cur(), h = '';
    h += hist.bar();
    h += colorRow();
    h += '<div class="chips" id="hzpdz">' + zonesFor().map(function (z) { return '<button type="button" data-z="' + E(z.code) + '" class="' + (d && d.zone === z.code ? 'on' : '') + '">' + E(z.name) + '</button>'; }).join('') + '</div>';
    h += '<div class="strip">' + D.designs.map(function (x, i) { return '<div class="tn' + (i === D.sel ? ' on' : '') + (x.lock ? ' lk' : '') + '" data-i="' + i + '"><img alt="" src="' + x.thumb + '"><i data-r="' + i + '">×</i><b class="lkm" data-k="' + i + '" title="' + (x.lock ? 'مثبّت - اضغط لفك التثبيت' : 'اضغط لتثبيت التصميم') + '">' + (x.lock ? '🔒' : '🔓') + '</b></div>'; }).join('') + (D.designs.length < D.o.maxN ? '<label class="add"><b>+</b>تصميم<input id="hzpdf" type="file" accept="image/png,image/jpeg,image/webp" style="display:none"></label>' : '') + '</div>';
    h += '<div class="msg" id="hzpde"></div>';
    if (d) {
      var z = zobj(d.zone), rr = ratioNow(d), mx = z ? (d.rl === false ? z.w : Math.min(z.w, z.h / rr)) : 40, mh = z ? z.h : 40, strc = Math.abs(rr - d.asp) > 0.01 * d.asp;
      if (d.lock) h += '<div class="tb"><button type="button" id="hzpdk">🔒 التصميم مثبّت — اضغط لفك التثبيت والتعديل</button></div>';
      else {
      h += '<div class="sl"><span>' + (d.rl === false ? 'العرض' : 'الحجم') + '</span><input id="hzpdw" type="range" min="2" max="' + Math.max(3, Math.floor(mx * 2) / 2) + '" step="0.5" value="' + Math.min(d.wcm, mx) + '"><em id="hzpdwv">' + d.wcm.toFixed(1) + '×' + d.hcm.toFixed(1) + ' سم</em></div>';
      if (d.rl === false) h += '<div class="sl"><span>الارتفاع</span><input id="hzpdh" type="range" min="2" max="' + Math.max(3, Math.floor(mh * 2) / 2) + '" step="0.5" value="' + Math.min(d.hcm, mh) + '"></div>';
      h += '<div class="sl"><span>تدوير</span><input id="hzpdr" type="range" min="-180" max="180" step="1" value="' + Math.round(d.rot * 180 / Math.PI) + '"><em id="hzpdrv">' + Math.round(d.rot * 180 / Math.PI) + '°</em></div>';
      h += '<div class="tb"><button type="button" id="hzpdcr">✂ قص الصورة</button>' + (d.crop ? '<button type="button" id="hzpdcu">إلغاء القص</button>' : '') + '<button type="button" id="hzpdlk2" aria-pressed="' + (d.rl !== false) + '" class="' + (d.rl !== false ? 'on' : '') + '">🔗 قفل النسبة</button>' + '<button type="button" id="hzpdrr"' + (strc ? '' : ' style="display:none"') + '>رجوع للنسبة الأصلية</button>' + '</div>';
      h += '<div class="tb"><button type="button" id="hzpdq">' + (d.nbKind === 'fast' ? 'تعديل الإزالة السريعة' : 'إزالة الخلفية (سريعة)') + '</button><button type="button" id="hzpda">إزالة الخلفية بالـ AI</button>' + (d.nbKind ? '<button type="button" id="hzpdo">رجوع للأصلي</button>' : '') + '</div>';
      if (d.nbKind === 'fast') h += '<div class="sl"><span>الدرجة</span><input id="hzpdt" type="range" min="8" max="120" step="2" value="' + d.tol + '"><em>' + d.tol + '</em></div>';
      h += '<div class="tb"><button type="button" id="hzpdk">🔓 تثبيت التصميم في مكانه</button></div>';
      }
      var ew = Math.round(d.w0 * (d.crop ? d.crop.w : 1)), eh = Math.round(d.h0 * (d.crop ? d.crop.h : 1));
      if (Math.min(ew, eh) < 800) h += '<div class="warn">الصورة صغيرة (' + ew + '×' + eh + ') وممكن تطلع مش واضحة في الطباعة. الأفضل صورة أكبر.</div>';
      h += '<div class="info">المكان: <b>' + E(zname(d.zone)) + '</b> · المقاس ' + d.wcm.toFixed(1) + '×' + d.hcm.toFixed(1) + ' سم</div>';
    } else h += '<div class="info">ارفع تصميمك (PNG أو JPG أو WebP حتى ' + D.o.maxMB + ' ميجا) وهيظهر على المنتج. تقدر تضيف لحد ' + D.o.maxN + ' تصاميم.</div>';
    h += '<textarea id="hzpdn" rows="2" placeholder="ملاحظات على الطباعة (اختياري)">' + E(D.note || (D.o.existing && D.o.existing.note) || '') + '</textarea>';
    h += '<div class="info">سعر الطباعة للقطعة: <b>' + (D.designs.length ? feeNow() + ' ' + CURRENCY : '-') + '</b> (حسب عدد التصاميم ومساحتها) · المعاينة تقريبية وبنراجعها معاك قبل الطباعة.</div>';
    p.innerHTML = h;
    hist.bind(p);
    Array.prototype.forEach.call(p.querySelectorAll('[data-c]'), function (b) { b.onclick = function () { setColor(+b.getAttribute('data-c')); }; });
    Array.prototype.forEach.call(p.querySelectorAll('[data-z]'), function (b) { b.onclick = function () { setZone(b.getAttribute('data-z')); }; });
    Array.prototype.forEach.call(p.querySelectorAll('.tn'), function (t) { t.onclick = function (e) { if (e.target.getAttribute('data-r') != null) return; D.sel = +t.getAttribute('data-i'); panel(); focusDesign(); }; });
    Array.prototype.forEach.call(p.querySelectorAll('[data-k]'), function (t) { t.onclick = function (e) { e.stopPropagation(); var x = D.designs[+t.getAttribute('data-k')]; if (x) { x.lock = !x.lock; D.sel = +t.getAttribute('data-k'); panel(); } }; });
    if ($$('hzpdk')) $$('hzpdk').onclick = function () { var x = cur(); if (x) { x.lock = !x.lock; panel(); } };
    Array.prototype.forEach.call(p.querySelectorAll('[data-r]'), function (t) { t.onclick = function (e) { e.stopPropagation(); removeDesign(+t.getAttribute('data-r')); }; });
    if ($$('hzpdf')) $$('hzpdf').onchange = function () { var f = this.files[0]; this.value = ''; if (f) addFile(f); };
    if ($$('hzpdw')) $$('hzpdw').oninput = function () { var x = cur(), r = ratioNow(x); x.wcm = +this.value; if (x.rl !== false) x.hcm = x.wcm * r; $$('hzpdwv').textContent = x.wcm.toFixed(1) + '×' + x.hcm.toFixed(1) + ' سم'; refresh(x); infoLine(); syncStretch(x); };
    if ($$('hzpdh')) $$('hzpdh').oninput = function () { var x = cur(); x.hcm = +this.value; $$('hzpdwv').textContent = x.wcm.toFixed(1) + '×' + x.hcm.toFixed(1) + ' سم'; refresh(x); infoLine(); syncStretch(x); };
    if ($$('hzpdcr')) $$('hzpdcr').onclick = cropOpen;
    if ($$('hzpdcu')) $$('hzpdcu').onclick = function () { cropApply(cur(), null); };
    if ($$('hzpdlk2')) $$('hzpdlk2').onclick = function () { var x = cur(); x.rl = (x.rl === false); panel(); };
    if ($$('hzpdrr')) $$('hzpdrr').onclick = function () { var x = cur(), zz = zobj(x.zone); x.hcm = x.wcm * x.asp; if (zz && x.hcm > zz.h) { x.hcm = zz.h; x.wcm = x.hcm / x.asp; } refresh(x); panel(); };
    if ($$('hzpdr')) $$('hzpdr').oninput = function () { var x = cur(); x.rot = +this.value * Math.PI / 180; $$('hzpdrv').textContent = this.value + '°'; refresh(x); };
    if ($$('hzpdq')) $$('hzpdq').onclick = function () { var x = cur(); if (x.nbKind !== 'fast') { withBusy('جاري إزالة الخلفية...', function () { x.nbKind = 'fast'; applyFast(x); }).then(panel); } else panel(); };
    if ($$('hzpdt')) $$('hzpdt').oninput = function () { var x = cur(); x.tol = +this.value; this.nextElementSibling.textContent = x.tol; applyFast(x); };
    if ($$('hzpda')) $$('hzpda').onclick = function () { aiRemove(cur()); };
    if ($$('hzpdo')) $$('hzpdo').onclick = function () { var x = cur(); x.nbKind = ''; x.cv = x.work; x.dirty = true; retex(x); panel(); };
    $$('hzpdn').oninput = function () { D.note = this.value.slice(0, 160); };
  }

  /* ---------- اللون جوه المصمّم (اختياري: لو مفيش لون متحدد بنبدأ بأول لون) ---------- */
  function colorRow() {
    var cs = D.o.product && D.o.product.colors ? D.o.product.colors : []; if (cs.length < 2) return '';
    return '<div class="clr" id="hzpdc"><span>اللون</span>' + cs.map(function (c, i) { return '<button type="button" data-c="' + i + '" class="' + (D.o.color && D.o.color.name === c.name ? 'on' : '') + '" title="' + E(c.name) + '"><i style="background:' + colorHex(c.name) + '"></i><em>' + E(c.name) + '</em></button>'; }).join('') + '</div>';
  }
  function setColor(i) {
    var cs = D.o.product.colors, c = cs[i]; if (!c) return; D.o.color = c; var hx = colorHex(c.name);
    if (D.three && D.three.meshes) { D.three.meshes.forEach(function (m) { try { m.material.color.set(hx); } catch (e) {} }); }
    else { var bg = ov.querySelector('.f2d img.bg'); if (bg && c.imageId && window.makeImg) { var im = makeImg(c.imageId, 700, ''); im.className = 'bg on'; bg.replaceWith(im); im.load(); } }
    panel();
  }
  /* ---------- تراجع / إعادة (للتحريك والحجم والتدوير والمكان والتثبيت) ---------- */
  var hist = (function () {
    var stack = [], at = -1, busy = false, tm = null;
    function sig(s) { return JSON.stringify(s.items.map(function (x) { return [x.id, x.zone, +x.wcm.toFixed(2), +x.hcm.toFixed(2), +x.rot.toFixed(3), x.lock ? 1 : 0, x.px, x.py, x.pos ? [+x.pos.x.toFixed(4), +x.pos.y.toFixed(4), +x.pos.z.toFixed(4)] : 0]; })); }
    function take() { return { sel: D.sel, items: D.designs.map(function (d) { return { d: d, id: d.id, zone: d.zone, wcm: d.wcm, hcm: d.hcm, rot: d.rot || 0, lock: !!d.lock, px: d.px, py: d.py, pos: d.pos ? d.pos.clone() : null, nrm: d.nrm ? d.nrm.clone() : null }; }) }; }
    function ids(s) { return s.items.map(function (x) { return x.id; }).join(','); }
    function commit() {
      if (busy || !D || D.saving) return; var s = take();
      if (at >= 0 && ids(stack[at]) !== ids(s)) { stack = []; at = -1; }                 // اتضاف/اتشال تصميم: نبدأ تاريخ جديد
      if (at >= 0 && sig(stack[at]) === sig(s)) return;
      stack = stack.slice(0, at + 1); stack.push(s); if (stack.length > 40) stack.shift(); at = stack.length - 1; refreshBtns();
    }
    function apply(s) {
      busy = true;
      s.items.forEach(function (x) { var d = x.d; d.zone = x.zone; d.wcm = x.wcm; d.hcm = x.hcm; d.rot = x.rot; d.lock = x.lock; d.px = x.px; d.py = x.py; if (x.pos) d.pos = x.pos.clone(); if (x.nrm) d.nrm = x.nrm.clone(); try { refresh(d); } catch (e) {} });
      D.sel = Math.min(s.sel, D.designs.length - 1); panel(); busy = false;
    }
    function undo() { if (at > 0) { at--; apply(stack[at]); refreshBtns(); } }
    function redo() { if (at < stack.length - 1) { at++; apply(stack[at]); refreshBtns(); } }
    function refreshBtns() { var u = $$('hzpdu'), r = $$('hzpdre'); if (u) u.disabled = !(at > 0); if (r) r.disabled = !(at < stack.length - 1); }
    var ICU = '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M9 14L4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12h-3"/></svg>';
    var ICR = '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M15 14l5-5-5-5"/><path d="M20 9H10a6 6 0 0 0 0 12h3"/></svg>';
    return {
      bar: function () { return '<div class="tb hzhist"><button type="button" id="hzpdu" class="ib" aria-label="تراجع" data-tip="تراجع">' + ICU + '</button><button type="button" id="hzpdre" class="ib" aria-label="إعادة" data-tip="إعادة">' + ICR + '</button></div>'; },
      bind: function (p) { var u = $$('hzpdu'), r = $$('hzpdre'); if (u) u.onclick = undo; if (r) r.onclick = redo; refreshBtns(); },
      watch: function () { var f = function () { clearTimeout(tm); tm = setTimeout(commit, 160); }; ['pointerup', 'touchend', 'change', 'click', 'keyup'].forEach(function (ev) { ov.addEventListener(ev, f, true); }); stack = []; at = -1; setTimeout(commit, 400); },
      reset: function () { stack = []; at = -1; }
    };
  })();
  function infoLine() { var d = cur(), i = $$('hzpdp') && $$('hzpdp').querySelectorAll('.info'); if (d && i && i.length) { i[0].innerHTML = 'المكان: <b>' + E(zname(d.zone)) + '</b> · المقاس ' + d.wcm.toFixed(1) + '×' + d.hcm.toFixed(1) + ' سم'; if (i[1]) i[1].innerHTML = 'سعر الطباعة للقطعة: <b>' + feeNow() + ' ' + CURRENCY + '</b> (حسب عدد التصاميم ومساحتها) · المعاينة تقريبية وبنراجعها معاك قبل الطباعة.'; } }
  function msg(t) { var m = $$('hzpde'); if (m) m.textContent = t || ''; }

  /* ---------- إضافة تصميم ---------- */
  function addFile(f) {
    var okT = /^image\/(png|jpeg|webp)$/.test(f.type) || (!f.type && /\.(png|jpe?g|webp)$/i.test(f.name));
    if (!okT) { msg('الصيغة دي مش مدعومة. المدعوم: PNG أو JPG أو WebP.'); return; }
    if (f.size > D.o.maxMB * 1048576) { msg('حجم الملف أكبر من ' + D.o.maxMB + ' ميجا. صغّره وجرب تاني.'); return; }
    msg('جاري تجهيز التصميم...'); busyOn('جاري تجهيز التصميم...');
    var url = URL.createObjectURL(f), im = new Image();
    im.onerror = function () { URL.revokeObjectURL(url); busyOff(); msg('الملف ده مش صورة سليمة، جرب ملف تاني.'); };
    im.onload = function () { try { onl(); } finally { busyOff(); } };
    function onl() {
      var s = Math.min(1, CFG.WORK_MAX / Math.max(im.naturalWidth, im.naturalHeight)), cv = document.createElement('canvas'); cv.width = Math.max(1, Math.round(im.naturalWidth * s)); cv.height = Math.max(1, Math.round(im.naturalHeight * s));
      cv.getContext('2d').drawImage(im, 0, 0, cv.width, cv.height);
      var t = document.createElement('canvas'); t.width = 124; t.height = Math.max(1, Math.round(124 * cv.height / cv.width)); t.getContext('2d').drawImage(cv, 0, 0, t.width, t.height);
      URL.revokeObjectURL(url);
      var asp = cv.height / cv.width, zs = zonesFor(), z0 = zs[0], d = { id: rnd(), file: f, mime: f.type || (/png$/i.test(f.name) ? 'image/png' : /webp$/i.test(f.name) ? 'image/webp' : 'image/jpeg'), w0: im.naturalWidth, h0: im.naturalHeight, work: cv, src: cv, rl: true, crop: null, cv: cv, thumb: t.toDataURL('image/png'), asp: asp, nbKind: '', tol: 40, rot: 0, zone: z0.code, wcm: 10, hcm: 10 * asp, pos: null, nrm: null, mesh: null, ref: '', nbRef: '', dirty: true };
      // أول مكان: لو في مكان مختار قبل كده، أو "صدر" لو متاح
      zs.forEach(function (z) { if (z.code === 'chest') z0 = z; }); d.zone = z0.code; fit(d);
      D.designs.forEach(function (x) { x.lock = true; }); D.designs.push(d); D.sel = D.designs.length - 1; msg(''); mkTex(d); place(d, d.zone); panel(); focusDesign();
    }
    im.src = url;
  }
  function fit(d) { var z = zobj(d.zone); if (!z) return; d.wcm = Math.max(2, Math.min(20, z.w, z.h / d.asp)); d.hcm = d.wcm * d.asp; }
  function removeDesign(i) { var d = D.designs[i]; if (d && d.mesh && D.three) { D.three.scene.remove(d.mesh); d.mesh.geometry.dispose(); } if (d && d.el) d.el.remove(); D.designs.splice(i, 1); D.sel = Math.min(D.sel, D.designs.length - 1); panel(); }
  function setZone(code) {
    var d = cur(); if (!d || d.lock) { if (d && d.lock) showToast('التصميم مثبّت، فك التثبيت الأول'); lookAtZone(code); return; }
    d.zone = code; clampToZone(d, zobj(code)); place(d, code); panel(); lookAtZone(code);
  }

  /* ---------- إزالة الخلفية ---------- */
  function applyFast(d) {
    var w = d.work.width, h = d.work.height, c = document.createElement('canvas'); c.width = w; c.height = h; var x = c.getContext('2d'); x.drawImage(d.work, 0, 0);
    var im = x.getImageData(0, 0, w, h), a = im.data, px = function (i) { return [a[i * 4], a[i * 4 + 1], a[i * 4 + 2]]; };
    var bg = [0, 0, 0], k = 0, pts = [[2, 2], [w - 3, 2], [2, h - 3], [w - 3, h - 3], [w >> 1, 1], [w >> 1, h - 2], [1, h >> 1], [w - 2, h >> 1]];
    pts.forEach(function (p) { var q = px(Math.max(0, Math.min(h - 1, p[1])) * w + Math.max(0, Math.min(w - 1, p[0]))); bg[0] += q[0]; bg[1] += q[1]; bg[2] += q[2]; k++; });
    bg = [bg[0] / k, bg[1] / k, bg[2] / k];
    var tol = d.tol, seen = new Uint8Array(w * h), stack = [];
    function dist(i) { var dr = a[i * 4] - bg[0], dg = a[i * 4 + 1] - bg[1], db = a[i * 4 + 2] - bg[2]; return Math.sqrt(dr * dr + dg * dg + db * db) / 1.732; }
    function push(i) { if (!seen[i] && dist(i) <= tol) { seen[i] = 1; stack.push(i); } }
    var xx, yy; for (xx = 0; xx < w; xx++) { push(xx); push((h - 1) * w + xx); } for (yy = 0; yy < h; yy++) { push(yy * w); push(yy * w + w - 1); }
    while (stack.length) { var i = stack.pop(), cx = i % w, cy = (i / w) | 0; if (cx > 0) push(i - 1); if (cx < w - 1) push(i + 1); if (cy > 0) push(i - w); if (cy < h - 1) push(i + w); }
    for (var j = 0; j < w * h; j++) {
      if (seen[j]) a[j * 4 + 3] = 0;
      else { var cxj = j % w, cyj = (j / w) | 0, nb = (cxj > 0 && seen[j - 1]) || (cxj < w - 1 && seen[j + 1]) || (cyj > 0 && seen[j - w]) || (cyj < h - 1 && seen[j + w]); if (nb) { var dd = dist(j), f = Math.max(0, Math.min(1, (dd - tol) / (tol * 0.6 + 6))); a[j * 4 + 3] = Math.round(a[j * 4 + 3] * f); } }
    }
    x.putImageData(im, 0, 0); d.cv = c; d.nbKind = 'fast'; d.dirty = true; retex(d);
  }
  var ortP = null;
  function loadOrt() {
    if (window.ort) return Promise.resolve();
    if (!ortP) ortP = loadScript(CFG.ORT).catch(function (e) { ortP = null; throw e; });
    return ortP;
  }
  var sess = null;
  function aiRemove(d) {
    if (!d) return; var tok = { c: false }; msg(''); if ($$('hzpda')) $$('hzpda').disabled = true;
    busyOn('جاري تحميل أداة الـ AI (أول مرة بتاخد شوية)...', function () { tok.c = true; if ($$('hzpda')) $$('hzpda').disabled = false; });
    loadOrt().then(function () {
      ort.env.wasm.numThreads = 1; ort.env.wasm.proxy = false;
      if (sess) return sess;
      return ort.InferenceSession.create(CFG.AI_MODEL, { executionProviders: ['wasm'] }).then(function (s) { sess = s; return s; });
    }).then(function (s) {
      if (tok.c) return; busyText('جاري إزالة الخلفية...');
      var S = 320, c = document.createElement('canvas'); c.width = S; c.height = S; var x = c.getContext('2d'); x.drawImage(d.work, 0, 0, S, S);
      var px = x.getImageData(0, 0, S, S).data, f = new Float32Array(3 * S * S), mean = [0.485, 0.456, 0.406], sd = [0.229, 0.224, 0.225];
      for (var i = 0; i < S * S; i++) for (var ch = 0; ch < 3; ch++) f[ch * S * S + i] = (px[i * 4 + ch] / 255 - mean[ch]) / sd[ch];
      var feeds = {}; feeds[s.inputNames[0]] = new ort.Tensor('float32', f, [1, 3, S, S]);
      return s.run(feeds).then(function (out) {
        if (tok.c) return; var o = out[s.outputNames[0]].data, mn = 1e9, mx = -1e9, i2; for (i2 = 0; i2 < o.length; i2++) { if (o[i2] < mn) mn = o[i2]; if (o[i2] > mx) mx = o[i2]; }
        var m = document.createElement('canvas'); m.width = S; m.height = S; var mx2 = m.getContext('2d'), id = mx2.createImageData(S, S);
        for (i2 = 0; i2 < S * S; i2++) { var v = (o[i2] - mn) / (mx - mn || 1); v = Math.max(0, Math.min(1, (v - 0.12) / 0.7)); id.data[i2 * 4] = 255; id.data[i2 * 4 + 1] = 255; id.data[i2 * 4 + 2] = 255; id.data[i2 * 4 + 3] = Math.round(v * 255); }
        mx2.putImageData(id, 0, 0);
        var r = document.createElement('canvas'); r.width = d.work.width; r.height = d.work.height; var rx = r.getContext('2d');
        rx.drawImage(d.work, 0, 0); rx.globalCompositeOperation = 'destination-in'; rx.imageSmoothingQuality = 'high'; rx.drawImage(m, 0, 0, r.width, r.height);
        d.cv = r; d.nbKind = 'ai'; d.dirty = true; retex(d); busyOff(); msg(''); panel();
      });
    }).catch(function (e) { if (tok.c) return; busyOff(); msg('تعذّر تشغيل الـ AI على جهازك، جرب الإزالة السريعة أو ارفع صورة من غير خلفية.'); if ($$('hzpda')) $$('hzpda').disabled = false; });
  }

  /* ---------- 3D ---------- */
  function mkTex(d) { if (!D.three) return; if (d.tex) d.tex.dispose(); d.tex = new THREE.CanvasTexture(d.cv); d.tex.anisotropy = 4; d.tex.encoding = THREE.sRGBEncoding; }
  function retex(d) { if (D.three) { mkTex(d); refresh(d); } else if (d.el) { d.el.src = d.cv.toDataURL('image/png'); } d.thumbDirty = true; }
  function init3d() {
    var host = $$('hzpds'); if (!host) return Promise.reject();
    var T = {}, w = host.clientWidth || 360, h = host.clientHeight || 340;
    T.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true }); T.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2)); T.renderer.setSize(w, h); T.renderer.outputEncoding = THREE.sRGBEncoding;
    host.insertBefore(T.renderer.domElement, host.firstChild);
    T.scene = new THREE.Scene(); T.cam = new THREE.PerspectiveCamera(32, w / h, 0.05, 50); T.cam.position.set(0, 0.05, 2.7);
    T.scene.add(new THREE.AmbientLight(0xffffff, 0.75)); var dl = new THREE.DirectionalLight(0xffffff, 0.8); dl.position.set(1.5, 2, 3); T.scene.add(dl); var dl2 = new THREE.DirectionalLight(0xffffff, 0.35); dl2.position.set(-2, 1, -3); T.scene.add(dl2);
    T.ray = new THREE.Raycaster(); T.meshes = []; T.anch = {}; D.three = T;
    host.insertAdjacentHTML('beforeend', '<div class="hint">اسحب بعيد عن التصميم لتدوير المجسم · اضغط على التصميم واسحبه لتحريكه</div>');
    var el = T.renderer.domElement, drag = null;
    function ndc(e) { var r = el.getBoundingClientRect(); return new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1); }
    el.addEventListener('pointerdown', function (e) {
      T.ray.setFromCamera(ndc(e), T.cam); var ms = D.designs.filter(function (d) { return d.mesh && !d.lock; }).map(function (d) { return d.mesh; }), hit = T.ray.intersectObjects(ms, false)[0];
      if (hit) { var i = D.designs.findIndex(function (d) { return d.mesh === hit.object; }); if (i > -1) { D.sel = i; drag = { i: i }; T.controls.enabled = false; try { el.setPointerCapture(e.pointerId); } catch (x) {} panel(); e.stopPropagation(); } }
    });
    el.addEventListener('pointermove', function (e) {
      if (!drag) return; T.ray.setFromCamera(ndc(e), T.cam); var hit = T.ray.intersectObjects(T.meshes, true)[0]; if (!hit) return;
      var d = D.designs[drag.i], n = hit.face.normal.clone().transformDirection(hit.object.matrixWorld); d.pos = hit.point.clone(); d.nrm = n; refresh(d);
    });
    function up() { if (!drag) return; var d = D.designs[drag.i]; drag = null; T.controls.enabled = true; if (d && d.pos) { var z = nearestZone(d.pos); if (z && z !== d.zone) { d.zone = z; clampToZone(d, zobj(z)); refresh(d); } panel(); } }
    el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
    T.controls = new THREE.OrbitControls(T.cam, el); T.controls.enablePan = false; T.controls.enableDamping = true; T.controls.dampingFactor = 0.12; T.controls.minDistance = 1.2; T.controls.maxDistance = 4.2; T.controls.target.set(0, 0, 0);
    var alive = true; T.dispose = function () { alive = false; T.renderer.dispose(); window.removeEventListener('resize', rs); }; function loop() { if (!alive) return; T.controls.update(); T.renderer.render(T.scene, T.cam); requestAnimationFrame(loop); } loop();
    function rs() { var hh = $$('hzpds'); if (!hh) return; var w2 = hh.clientWidth, h2 = hh.clientHeight; T.renderer.setSize(w2, h2); T.cam.aspect = w2 / h2; T.cam.updateProjectionMatrix(); } window.addEventListener('resize', rs);
    return loadModel(T).then(function () { var l = $$('hzpdl'); if (l) l.remove(); zoomAdd($$('hzpds')); computeAnchors(T); D.designs.forEach(function (d) { mkTex(d); if (!d.pos) place(d, d.zone); else refresh(d); }); });
  }
  function loadModel(T) {
    var type = D.o.type, col = colorHex(D.o.color && D.o.color.name);
    return new Promise(function (res) {
      function done(root) {
        var box = new THREE.Box3().setFromObject(root), sz = box.getSize(new THREE.Vector3()), sc = 1 / (sz.y || 1); root.scale.multiplyScalar(sc); box.setFromObject(root); var c = box.getCenter(new THREE.Vector3()); root.position.sub(c);
        root.updateMatrixWorld(true); T.root = root; T.scene.add(root);
        root.traverse(function (m) { if (m.isMesh) { m.material = new THREE.MeshStandardMaterial({ color: new THREE.Color(col), roughness: 0.92, metalness: 0, side: THREE.DoubleSide }); m.updateMatrixWorld(true); T.meshes.push(m); } });
        res();
      }
      try { new THREE.GLTFLoader().load(CFG.MODELS[type] || CFG.MODELS.hoodie, function (g) { done(g.scene); }, undefined, function () { done(placeholder(type)); }); } catch (e) { done(placeholder(type)); }
    });
  }
  function placeholder(type) {
    var g = new THREE.Group(), M = function () { return new THREE.MeshStandardMaterial({ color: 0x777777 }); }, add = function (geo, x, y, z, rz, sx, sy, sz) { var m = new THREE.Mesh(geo, M()); m.position.set(x, y, z); m.rotation.z = rz || 0; m.scale.set(sx || 1, sy || 1, sz || 1); g.add(m); return m; };
    if (type === 'pants') {
      add(new THREE.CylinderGeometry(0.2, 0.2, 0.16, 36, 4), 0, 0.42, 0, 0, 1, 1, 0.62);
      add(new THREE.CylinderGeometry(0.1, 0.075, 0.88, 28, 14), -0.105, -0.0, 0, 0.02); add(new THREE.CylinderGeometry(0.1, 0.075, 0.88, 28, 14), 0.105, 0, 0, -0.02);
    } else {
      add(new THREE.CylinderGeometry(0.29, 0.31, 0.6, 44, 20), 0, -0.02, 0, 0, 1, 1, 0.62);
      add(new THREE.SphereGeometry(0.17, 28, 18), 0, 0.33, -0.06, 0, 1.2, 0.9, 1);
      add(new THREE.CylinderGeometry(0.078, 0.066, 0.52, 24, 12), -0.4, -0.04, 0, 0.16); add(new THREE.CylinderGeometry(0.078, 0.066, 0.52, 24, 12), 0.4, -0.04, 0, -0.16);
    }
    return g;
  }
  var ANCH = {
    chest: [[0, 0.14, 6], [0, 0, -1]], back: [[0, 0.1, -6], [0, 0, 1]], sleeveR: [[-6, -0.06, 0], [1, 0, 0]], sleeveL: [[6, -0.06, 0], [-1, 0, 0]],
    legR: [[-0.1, 0.0, 6], [0, 0, -1]], legL: [[0.1, 0.0, 6], [0, 0, -1]], backPocket: [[0.1, 0.36, -6], [0, 0, 1]]
  };
  var SIDE = { chest: 'f', back: 'b', backPocket: 'b', sleeveR: 'r', sleeveL: 'l', legR: 'f', legL: 'f' };
  function computeAnchors(T) {
    T.anch = {};
    D.o.zones.forEach(function (z) {
      var a = ANCH[z.code]; if (!a) return;
      T.ray.set(new THREE.Vector3(a[0][0], a[0][1], a[0][2]), new THREE.Vector3(a[1][0], a[1][1], a[1][2]));
      var hit = T.ray.intersectObjects(T.meshes, true)[0];
      if (!hit) { T.ray.set(new THREE.Vector3(a[0][0], 0.1, a[0][2]), new THREE.Vector3(a[1][0], a[1][1], a[1][2])); hit = T.ray.intersectObjects(T.meshes, true)[0]; }
      if (hit) T.anch[z.code] = { p: hit.point.clone(), n: hit.face.normal.clone().transformDirection(hit.object.matrixWorld) };
      else T.anch[z.code] = { p: new THREE.Vector3(a[0][0] * 0.05, a[0][1], a[0][2] * 0.05), n: new THREE.Vector3(-a[1][0], -a[1][1], -a[1][2]) };
    });
  }
  function nearestZone(p) { var T = D.three, best = '', bd = 1e9; Object.keys(T.anch).forEach(function (c) { var d = T.anch[c].p.distanceTo(p); if (d < bd) { bd = d; best = c; } }); return best; }
  function place(d, code) {
    if (D.three) { var a = D.three.anch[code]; if (a) { d.pos = a.p.clone(); d.nrm = a.n.clone(); d.rot = 0; refresh(d); } }
    else if (d.el !== undefined) place2d(d);
  }
  function refresh(d) {
    var T = D.three; if (!T) { if (D.o) refresh2d(d); return; }
    if (!d.pos || !T.meshes.length || !d.tex) return;
    if (d.mesh) { T.scene.remove(d.mesh); d.mesh.geometry.dispose(); d.mesh.material.dispose(); d.mesh = null; }
    var wU = d.wcm / D.o.refCm, hU = d.hcm / D.o.refCm, n = d.nrm.clone().normalize();
    var o = new THREE.Object3D(); o.position.copy(d.pos); o.up.set(0, 1, 0); if (Math.abs(n.y) > 0.97) o.up.set(0, 0, -1); o.lookAt(d.pos.clone().add(n));
    o.rotateZ(d.rot || 0); var eu = new THREE.Euler().setFromQuaternion(o.quaternion);
    var geos = [], parts = [];
    T.meshes.forEach(function (m) { try { var g = new THREE.DecalGeometry(m, d.pos, eu, new THREE.Vector3(wU, hU, 0.3)); if (g.attributes.position.count) parts.push(g); } catch (e) {} });
    if (!parts.length) return;
    var geo = parts[0]; if (parts.length > 1) { geo = THREE.BufferGeometryUtils ? THREE.BufferGeometryUtils.mergeBufferGeometries(parts) : parts[0]; }
    d.mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ map: d.tex, transparent: true, roughness: 0.88, metalness: 0, polygonOffset: true, polygonOffsetFactor: -4, depthWrite: false, alphaTest: 0.01 }));
    T.scene.add(d.mesh);
  }
  function camTo(side) {
    var T = D.three; if (!T) return; var R = Math.max(T.controls.minDistance, Math.min(T.controls.maxDistance, T.cam.position.length() || 2.7)), v = { f: [0, 0.05, R], b: [0, 0.05, -R], r: [-R, 0.05, 0.01], l: [R, 0.05, 0.01] }[side] || [0, 0.05, R], to = new THREE.Vector3(v[0], v[1], v[2]), from = T.cam.position.clone(), t0 = performance.now();
    (function step(t) { var k = Math.min(1, (t - t0) / 380), e = k * k * (3 - 2 * k); T.cam.position.lerpVectors(from, to, e); T.cam.lookAt(0, 0, 0); if (k < 1) requestAnimationFrame(step); })(t0);
  }
  function lookAtZone(code) { camTo(SIDE[code] || 'f'); }
  function focusDesign() { var d = cur(); if (d) lookAtZone(d.zone); }

  /* ---------- بديل 2D لو الجهاز مش بيدعم 3D ---------- */
  function start2d() {
    D.mode3d = false; var host = $$('hzpds'); if (!host) return;
    var l = $$('hzpdl'); if (l) l.remove();
    var src = D.o.product && D.o.product.main ? D.o.product.main : (D.o.color && D.o.color.imageId) || '';
    host.innerHTML = '<div class="f2d"><div class="ph" id="hzpdph"></div></div><div class="hint">معاينة تقريبية على صورة المنتج. اسحب التصميم لتحريكه.</div>';
    var ph = $$('hzpdph'); if (src && window.makeImg) { var im = makeImg(src, 700, ''); im.className = 'bg on'; ph.appendChild(im); im.load(); }
    D.designs.forEach(mk2d); zoomAdd(host); panel();
  }
  var Z2 = { chest: [0.5, 0.36], back: [0.5, 0.36], sleeveR: [0.16, 0.5], sleeveL: [0.84, 0.5], legR: [0.38, 0.55], legL: [0.62, 0.55], backPocket: [0.62, 0.3] };
  function mk2d(d) {
    var ph = $$('hzpdph'); if (!ph) return; if (d.el) d.el.remove();
    var im = document.createElement('img'); im.className = 'dg'; im.alt = ''; im.src = d.cv.toDataURL('image/png'); d.el = im; ph.appendChild(im);
    var drag = null; im.addEventListener('pointerdown', function (e) { D.sel = D.designs.indexOf(d); drag = { x: e.clientX, y: e.clientY, px: d.px, py: d.py }; im.setPointerCapture(e.pointerId); panel(); });
    im.addEventListener('pointermove', function (e) { if (!drag) return; var r = ph.getBoundingClientRect(); d.px = Math.min(0.95, Math.max(0.05, drag.px + (e.clientX - drag.x) / r.width)); d.py = Math.min(0.95, Math.max(0.05, drag.py + (e.clientY - drag.y) / r.height)); refresh2d(d); });
    im.addEventListener('pointerup', function () { drag = null; });
    if (d.px == null) { var z = Z2[d.zone] || [0.5, 0.4]; d.px = z[0]; d.py = z[1]; }
    refresh2d(d);
  }
  function place2d(d) { if (!d.el) { mk2d(d); return; } var z = Z2[d.zone] || [0.5, 0.4]; d.px = z[0]; d.py = z[1]; refresh2d(d); }
  function refresh2d(d) { if (!d.el) { mk2d(d); return; } var ph = $$('hzpdph'); if (!ph) return; var wpx = ph.clientWidth * (d.wcm / D.o.refCm) * 0.8; d.el.style.width = wpx + 'px'; d.el.style.height = (wpx * ratioNow(d)) + 'px'; d.el.style.left = (d.px * 100) + '%'; d.el.style.top = (d.py * 100) + '%'; d.el.style.transform = 'translate(-50%,-50%) rotate(' + (d.rot || 0) + 'rad)'; d.el.classList.toggle('on', cur() === d); }

  /* ---------- حفظ + رفع ---------- */
  function b64(blob) { return new Promise(function (res, rej) { var fr = new FileReader(); fr.onload = function () { res(String(fr.result).split(',')[1]); }; fr.onerror = rej; fr.readAsDataURL(blob); }); }
  function cvBlob(cv, mime, q) { return new Promise(function (res) { cv.toBlob(res, mime, q); }); }
  function post(o) { return new Promise(function (res, rej) { var n = 0; (function go() { postApi(o, function (r) { if (r && r.ok) return res(r); var er = r && r.error; if (er === 'format' || er === 'big' || er === 'image' || er === 'chunk') return rej(r); if (n++ >= (er === 'rate' ? 3 : 2)) return rej(r || { error: 'net' }); setTimeout(go, er === 'rate' ? 5000 : 1200 * n); }, 90000); })(); }); }
  async function upBlob(kind, blob, mime, prog) {
    var data = await b64(blob), n = Math.ceil(data.length / CFG.CHUNK), id = rnd().replace(/[^a-z0-9]/gi, '').slice(0, 20), r;
    for (var i = 0; i < n; i++) { r = await post({ type: 'dsn', kind: kind, mime: mime, up: id, idx: i, n: n, data: data.slice(i * CFG.CHUNK, (i + 1) * CFG.CHUNK) }); prog(Math.min(1, (i + 1) / n)); }
    return r.ref;
  }
  function views() { var s = {}; D.designs.forEach(function (d) { s[SIDE[d.zone] || 'f'] = 1; }); return Object.keys(s).slice(0, 3); }
  function snap(side) {
    var T = D.three; if (!T) return null;
    var R = 2.7, v = { f: [0, 0.05, R], b: [0, 0.05, -R], r: [-R, 0.05, 0.01], l: [R, 0.05, 0.01] }[side]; T.cam.position.set(v[0], v[1], v[2]); T.cam.lookAt(0, 0, 0); T.controls.update(); T.renderer.render(T.scene, T.cam);
    var src = T.renderer.domElement, c = document.createElement('canvas'), k = Math.min(1, 1000 / src.width); c.width = Math.round(src.width * k); c.height = Math.round(src.height * k); var x = c.getContext('2d'); x.fillStyle = '#1c1812'; x.fillRect(0, 0, c.width, c.height); x.drawImage(src, 0, 0, c.width, c.height); return c;
  }
  function snap2d() { var ph = $$('hzpdph'); if (!ph) return null; var c = document.createElement('canvas'); c.width = 600; c.height = 800; var x = c.getContext('2d'); x.fillStyle = '#2a241b'; x.fillRect(0, 0, 600, 800); var bg = ph.querySelector('img.bg'); try { if (bg && bg.naturalWidth) x.drawImage(bg, 0, 0, 600, 800); } catch (e) {} D.designs.forEach(function (d) { var w = 600 * (d.wcm / D.o.refCm) * 0.8, h = w * ratioNow(d); x.save(); x.translate(d.px * 600, d.py * 800); x.rotate(d.rot || 0); x.drawImage(d.cv, -w / 2, -h / 2, w, h); x.restore(); }); return c; }
  async function save() {
    if (D.saving) return; var m = $$('hzpdm'), bar = $$('hzpdb'), ok = $$('hzpdok');
    if (!D.designs.length) { m.textContent = 'ارفع تصميم واحد على الأقل.'; return; }
    D.saving = true; D.cancel = false; ok.disabled = true; bar.style.display = 'block'; m.textContent = 'جاري رفع التصميم...'; ov.classList.add('saving'); var cxb = $$('hzpdcx'); if (cxb) { cxb.style.display = 'flex'; cxb.onclick = function () { D.cancel = true; m.textContent = 'بنوقف الحفظ...'; }; }
    var tot = D.designs.length * 2 + 3, done = 0, setP = function (f) { bar.firstChild.style.width = Math.round((done + (f || 0)) / tot * 100) + '%'; };
    try {
      var pvs = [], th = '';
      if (D.three) { var sd = views(); for (var vi = 0; vi < sd.length; vi++) { var c = snap(sd[vi]); if (c) pvs.push(c); } }
      else { var c2 = snap2d(); if (c2) pvs.push(c2); }
      if (!pvs.length) throw { error: 'snap' };
      for (var i = 0; i < D.designs.length; i++) {
        var d = D.designs[i]; if (D.cancel) throw { cancel: true };
        if (!d.ref) { d.ref = await upBlob('orig', d.file, d.mime, setP); }
        done++; setP();
        if ((d.nbKind || d.crop) && (d.dirty || !d.nbRef)) { var nbBlob = await cvBlob(d.cv, 'image/png'); d.nbRef = await upBlob('nobg', nbBlob, 'image/png', setP); d.dirty = false; }
        else if (!d.nbKind && !d.crop) d.nbRef = '';
        done++; setP();
      }
      var pv = []; if (D.cancel) throw { cancel: true };
      for (var k = 0; k < pvs.length; k++) { if (D.cancel) throw { cancel: true }; var bl = await cvBlob(pvs[k], 'image/jpeg', 0.9); pv.push(await upBlob('prev', bl, 'image/jpeg', setP)); }
      done += 3; setP();
      var t = document.createElement('canvas'); t.width = 96; t.height = Math.round(96 * pvs[0].height / pvs[0].width); t.getContext('2d').drawImage(pvs[0], 0, 0, t.width, t.height); th = t.toDataURL('image/jpeg', 0.7);
      var cx = { d: D.designs.map(function (d) { return { ref: d.ref, nb: d.nbRef || '', z: d.zone, w: Math.round(d.wcm * 10) / 10, h: Math.round(d.hcm * 10) / 10 }; }), pv: pv, note: (D.note != null ? D.note : (D.o.existing && D.o.existing.note) || '').trim() };
      D.designs.forEach(function (d) { d.mesh = null; });
      var res = { cx: cx, th: th, color: D.o.color, state: { designs: D.designs } }, cb = D.o.onSave; D.saving = false; ov.classList.remove('saving'); close(); cb(res);
    } catch (e) {
      D.saving = false; ok.disabled = false; bar.style.display = 'none'; ov.classList.remove('saving'); var cxb2 = $$('hzpdcx'); if (cxb2) cxb2.style.display = 'none';
      var er = e && e.error; if (e && e.cancel) { m.textContent = 'اتوقف الحفظ. تقدر تعدّل وتحفظ تاني.'; return; } m.textContent = er === 'format' ? 'صيغة الملف مش مدعومة. المدعوم: PNG أو JPG أو WebP.' : er === 'big' ? 'حجم الملف أكبر من المسموح.' : er === 'rate' ? 'الموقع مشغول لحظات، استنى نص دقيقة وجرب تاني.' : 'مشكلة في رفع التصميم. اتأكد من النت وجرب تاني.';
    }
  }
  window.__hzDesigner = { open: open, _d: function () { return D; } };
  setTimeout(function () { if ('requestIdleCallback' in window) requestIdleCallback(function () {}); }, 0);
})();
