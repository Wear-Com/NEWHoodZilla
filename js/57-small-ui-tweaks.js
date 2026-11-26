/* FILE: js/57-small-ui-tweaks.js
   تعديلات واجهة صغيرة (CSS يتحقن + تعديلات)
   (جزء من HoodZilla — بيتحمّل بالترتيب من index.html، والـ global scope مشترك بين كل الملفات. راجع FILES-GUIDE.md) */
(function () {
  /* ===================== تعديلات واجهة صغيرة (اسم المنتج في النص، بوكس الكود، التوفر...) ===================== */
  var $$ = function (i) { return document.getElementById(i); };
  var st = document.createElement('style');
  st.textContent = '.mtop{position:relative}.mtt{position:static}.mtt h2{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);max-width:calc(100% - 262px);text-align:center;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;padding:0;font-size:17px;margin:0}' +
    '.otile.promo .ooff{font-size:13px;line-height:1.45;font-weight:800}.otile.promo .otitle{font-size:12px}' +
    '.hzt b{color:var(--gold-2);font-size:15px}.hzt small{display:block;font-size:11px;color:var(--muted);font-weight:500;margin-top:1px}' +
    '#hzpl2{display:block;clear:both;margin:10px auto 0}#foot{text-align:center}';
  document.head.appendChild(st);
  // لو الصنف/اللون/المنتج نافذ: "اسأل عن توفره" بتبقى جنب جملة اللون (والزرار القديم اتشال)
  var _ui = updateInfo;
  updateInfo = function () {
    _ui.apply(this, arguments);
    try {
      var p = curProduct, h = $$('chint'); if (!p || !h) return;
      var old = h.querySelector('.hzaskl'); if (old) old.remove();
      if (!(window.__hzHasOut && window.__hzHasOut(p))) return;
      var a = document.createElement('button'); a.type = 'button'; a.className = 'hzaskl';
      a.innerHTML = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/></svg><span>اسأل عن توفره</span>';
      a.addEventListener('click', function () { if (window.__hzAskInCard) window.__hzAskInCard(); }); h.appendChild(a);
    } catch (e) {}
  };
})();
