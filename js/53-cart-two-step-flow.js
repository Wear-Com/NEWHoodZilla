/* FILE: js/53-cart-two-step-flow.js
   السلة على خطوتين (سلة ثم إتمام الطلب) وزر الرجوع
   (جزء من HoodZilla — بيتحمّل بالترتيب من index.html، والـ global scope مشترك بين كل الملفات. راجع FILES-GUIDE.md) */
(function () {
  var $$ = function (i) { return document.getElementById(i); }, FREE = 2;
  var _ap = applyData;
  applyData = function (d, f) { FREE = parseFloat((d.settings || {})['شحن_مجاني_من_قطع']) || 2; _ap(d, f); };
  function setStep(n) { $$('cpanel').className = 'cpanel s' + n; $$('ctitle').textContent = n === 1 ? 'السلة' : 'إتمام الطلب'; $$('cclear').textContent = 'الخطوة ' + n + ' من 2'; $$('hzback').style.display = n === 2 ? 'block' : 'none'; if (n === 1) window.__s2 = false; $$('cscroll').scrollTop = 0; }
  var go = el('button', 'btn add', 'استكمال'); go.id = 'hzgo'; go.type = 'button'; $$('cfoot').insertBefore(go, $$('csend'));
  var bk = el('button', '', ''); bk.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>'; bk.id = 'hzback'; bk.type = 'button'; $$('ctitle').parentNode.insertBefore(bk, $$('ctitle'));
  var _tr = track;
  track = function (ev, d) { if (ev === 'InitiateCheckout' && !window.__go) return; _tr(ev, d); };
  go.addEventListener('click', function () {
    if (!cart.length) return;
    var pc = calcPricing(); window.__go = 1; track('InitiateCheckout', { content_ids: cart.map(function (i) { return i.code; }), num_items: pc.n, value: pc.total, currency: 'EGP' }); window.__go = 0;
    var bt = go.textContent; go.textContent = 'استنى لحظة...'; go.disabled = true;
    window.__hzStock(function (ok) {
      go.textContent = bt; go.disabled = false;
      if (!ok || !cart.length) return;
      try { history.pushState({ hz: 's2' }, '', location.pathname + location.search); window.__s2 = true; } catch (e) {}
      setStep(2); renderCart();
    });
  });
  window.__s2back = function () { setStep(1); renderCart(); };
  bk.addEventListener('click', function () { if (window.__s2) { try { history.back(); return; } catch (e) {} } setStep(1); renderCart(); });
  new MutationObserver(function () { if ($$('cart').classList.contains('open')) { setStep(1); renderCart(); } }).observe($$('cart'), { attributes: true, attributeFilter: ['class'] });
  setStep(1);
  var _rc = renderCart;
  renderCart = function () {
    _rc();
    if (!cart.length) { setStep(1); return; }
    var pr = calcPricing(), unk = pr.n < FREE && pr.ship === 0;
    Array.prototype.forEach.call($$('csum').children, function (r) { var s = r.children; if (s.length === 2 && s[0].textContent === T_SHIP && unk) { s[1].textContent = 'يتحسب بعد اختيار المحافظة'; r.className = 'srow'; } });
    $$('ctotlbl').textContent = window.__hzLbl || (unk ? 'الإجمالي (قبل الشحن)' : T_TOTAL);
  };
  ['fbtn', 'cartfab', 'fab'].forEach(function (id) {
    var e = $$(id); if (!e) return; var t = null, lp = false;
    e.addEventListener('touchstart', function () { lp = false; t = setTimeout(function () { lp = true; e.classList.add('tipon'); }, 450); }, { passive: true });
    function end() { clearTimeout(t); if (lp) setTimeout(function () { e.classList.remove('tipon'); }, 1400); }
    e.addEventListener('touchend', end); e.addEventListener('touchcancel', end);
    e.addEventListener('contextmenu', function (ev) { ev.preventDefault(); });
    e.addEventListener('click', function (ev) { if (lp) { ev.preventDefault(); ev.stopImmediatePropagation(); lp = false; } }, true);
  });
})();
