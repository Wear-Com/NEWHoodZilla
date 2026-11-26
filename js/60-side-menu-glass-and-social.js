/* FILE: js/60-side-menu-glass-and-social.js
   v4 القايمة الجانبية الزجاجية + السوشيال + FAQ
   (جزء من HoodZilla — بيتحمّل بالترتيب من index.html، والـ global scope مشترك بين كل الملفات. راجع FILES-GUIDE.md) */
  /* ===================== v4: القايمة الجانبية الزجاجية + سوشيال + اسم المنتج + ختام السياسة ===================== */
  (function () {
    var st = document.createElement('style');
    st.textContent = '.hzdr .pn{background:transparent!important;border-left:0!important;isolation:isolate;box-shadow:none}' +
      '.hzdr .pn::before{content:"";position:absolute;inset:0;z-index:-1;background:linear-gradient(270deg,rgba(28,24,18,.88),rgba(28,24,18,.5) 55%,rgba(28,24,18,.06));-webkit-backdrop-filter:blur(18px);backdrop-filter:blur(18px);-webkit-mask-image:linear-gradient(270deg,#000 50%,transparent);mask-image:linear-gradient(270deg,#000 50%,transparent)}' +
      '.hzsoc{display:flex;justify-content:center;gap:14px;padding:10px 18px 4px}.hzsoc a{width:42px;height:42px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:rgba(216,180,114,.12);border:1px solid rgba(216,180,114,.4);color:var(--gold-2)}.hzsoc a svg{width:21px;height:21px;fill:currentColor}' +
      '.hzmlbl{display:block;font:700 10px Cairo,sans-serif;color:var(--gold-2);text-align:center;margin-top:1px;line-height:1}#hzmenu{flex-direction:column}' +
      '.hzthx{text-align:center;color:var(--gold-2);font-weight:700;margin:14px 0 6px;line-height:1.8}.hzpclose{width:100%;margin-top:8px}' +
      '@media(max-width:1023px){.mtt{flex:1;min-width:0}.mtt h2{position:static!important;transform:none!important;max-width:none!important;text-align:right!important;flex:1}}';
    document.head.appendChild(st);
    var mn = document.getElementById('hzmenu'); if (mn) { mn.setAttribute('data-tip', 'القائمة'); mn.setAttribute('aria-label', 'القائمة'); HZ.tipify(mn); }
    var P = {
      wa: ['واتساب', 'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z'],
      tt: ['تيك توك', 'M16.600 3a5.300 5.300 0 0 0 4.400 4.700v3.300a8.600 8.600 0 0 1-4.400-1.300v6.200a6.200 6.200 0 1 1-6.200-6.200c.3 0 .6 0 .9.100v3.400a2.900 2.900 0 1 0 2 2.700V3h3.300z'],
      fb: ['فيسبوك', 'M13.500 21v-7.500h2.500l.4-3h-2.900V8.600c0-.9.3-1.500 1.500-1.500h1.500V4.400A20 20 0 0 0 14.400 4c-2.200 0-3.700 1.300-3.700 3.800v2.200H8.200v3h2.500V21h2.800z'],
      ig: ['انستجرام', 'M7.800 2h8.400A5.800 5.800 0 0 1 22 7.800v8.400a5.800 5.800 0 0 1-5.800 5.800H7.800A5.800 5.800 0 0 1 2 16.200V7.800A5.800 5.800 0 0 1 7.800 2zm-.2 2A3.600 3.600 0 0 0 4 7.600v8.800A3.600 3.600 0 0 0 7.600 20h8.800a3.600 3.600 0 0 0 3.600-3.600V7.600A3.600 3.600 0 0 0 16.400 4H7.600zM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6zm5.300-3.200a1.200 1.200 0 1 1 0 2.400 1.200 1.200 0 0 1 0-2.400z']
    };
    function socials() {
      var pn = document.querySelector('#hzdr .pn'), s = window.__hzSET || {}; if (!pn) return;
      var old = pn.querySelector('.hzsoc'); if (old) old.remove();
      var wa = (typeof WHATSAPP !== 'undefined' && WHATSAPP) ? 'https://wa.me/' + WHATSAPP : (s['واتساب_رابط'] || '');
      var L = [['wa', s['واتساب_رابط'] || wa], ['tt', s['تيك_توك_رابط']], ['fb', s['فيسبوك_رابط']], ['ig', s['انستجرام_رابط']]].filter(function (x) { return x[1] && /^https?:\/\//i.test(String(x[1]).trim()); });
      if (!L.length) return;
      var d = document.createElement('div'); d.className = 'hzsoc';
      L.forEach(function (x) { var a = document.createElement('a'); a.href = String(x[1]).trim(); a.target = '_blank'; a.rel = 'noopener'; a.setAttribute('aria-label', P[x[0]][0]); a.setAttribute('data-tip', P[x[0]][0]); a.className = 'hzib'; HZ.tipify(a); a.innerHTML = '<svg viewBox="0 0 24 24"><path d="' + P[x[0]][1] + '"/></svg>'; d.appendChild(a); });
      var ft = pn.querySelector('.ft'); ft.insertBefore(d, ft.firstChild);
    }
    var _a2 = window.applyData; window.applyData = function (d) { var r = _a2.apply(this, arguments); try { socials(); window.__hzFAQ = (d && d.faq) || []; } catch (e) {} return r; };
    try { socials(); } catch (e) {}
  })();
