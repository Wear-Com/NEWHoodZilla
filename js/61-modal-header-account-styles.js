/* FILE: js/61-modal-header-account-styles.js
   v4 ستايل هيدر المودالات والحساب
   (جزء من HoodZilla — بيتحمّل بالترتيب من index.html، والـ global scope مشترك بين كل الملفات. راجع FILES-GUIDE.md) */
  /* ===================== v4: هيدر المودالات + الحساب ===================== */
  (function () {
    var st = document.createElement('style');
    st.textContent = '.hzs{padding-top:0!important}.hzs>:first-child:not(.hzhd){margin-top:18px}.hzhd{margin:0 -18px 12px!important;border-radius:18px 18px 0 0}' +
      '.hzstar{background:none;border:0;color:var(--gold);font-size:21px;line-height:1;cursor:pointer;padding:0 4px}.hzstar.on{color:var(--gold-2)}.hzdef{font-style:normal;font-size:10px;background:rgba(216,180,114,.2);border-radius:10px;padding:1px 7px;margin-inline-start:4px;color:var(--gold-2)}' +
      '.hzghost{border:1px solid var(--gold);background:transparent;color:var(--gold-2);border-radius:30px;padding:10px;font-family:inherit;font-weight:700;font-size:14px;cursor:pointer}.hzout{width:100%;border-color:rgba(229,107,88,.6);color:var(--red)}#hzps.dis,#hzps:disabled{opacity:.4;cursor:not-allowed}';
    document.head.appendChild(st);
  })();
