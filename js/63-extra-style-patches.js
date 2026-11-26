/* FILE: js/63-extra-style-patches.js
   تصحيحات ستايل صغيرة بتتحقن بالـ JS (4 جزئيات)
   (جزء من HoodZilla — بيتحمّل بالترتيب من index.html، والـ global scope مشترك بين كل الملفات. راجع FILES-GUIDE.md) */
  (function () {
    var st = document.createElement('style');
    st.textContent = '#cnudge{position:sticky!important;top:0;z-index:40!important;background:#2b251c!important;opacity:1!important;border-bottom:1px solid rgba(216,180,114,.3);box-shadow:0 8px 10px -6px #2b251c,0 -14px 0 0 #2b251c}';
    document.head.appendChild(st);
  })();

  (function () {
    var st = document.createElement('style');
    st.textContent = '.hzsth{color:var(--gold-2);font-size:14px;margin:4px 0 6px}#hzsz tr.hit td{background:rgba(216,180,114,.22);font-weight:800}#hzsz tr[data-s]{cursor:default}.hzch{display:flex;flex-wrap:wrap;gap:6px}.hzch button{padding:6px 14px;border-radius:30px;border:1px solid rgba(216,180,114,.5);background:transparent;color:var(--gold-2);font:700 13px Cairo,sans-serif;cursor:pointer}.hzch button.sel{background:var(--gold);color:#1a1408}' +
      '.hzadv{margin-top:12px;border:1px solid var(--line);border-radius:12px;padding:8px 10px}.hzadv summary{cursor:pointer;color:var(--gold-2);font-weight:700}.hzadv .hzszf{margin-top:8px}#hzsz .hzt2{min-width:100%}#hzsz .hzrec{display:none}#hzsz .hzrec .bg{font-size:34px;font-weight:800;color:var(--gold-2)}' +
      '#hzsz .hzfind{display:grid;grid-template-columns:108px 1fr;gap:10px;align-items:stretch;margin-top:4px}#hzsz .hzfin{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px;align-content:start}#hzsz .hzfin label{display:flex;flex-direction:column;gap:3px;font-size:12px;color:var(--muted);min-width:0;text-align:center}#hzsz .hzfin input{width:100%;min-width:0;padding:10px 2px;text-align:center;border-radius:10px;border:1px solid rgba(216,180,114,.28);background:var(--panel);color:var(--ink);font-family:inherit;font-size:16px}#hzsz .hzfin small{font-size:10px;color:var(--muted)}' +
      '#hzsz .hzgold{border-radius:14px;background:linear-gradient(160deg,#f3dca6,#d8b472 55%,#a98241);color:#1a1408;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:8px 6px;min-height:96px}#hzsz .hzgold .bg{font-size:34px;font-weight:800;line-height:1.1;color:#1a1408}#hzsz .hzgold small{font-size:11px;line-height:1.35;font-weight:700}#hzsz .hzgold.warn{background:#2b251c;color:var(--red);border:1px solid var(--red)}#hzsz .hzgold.warn .bg{color:var(--red)}#hzsz .hzgold.empty{opacity:.6}' +
      '@media(max-width:330px){#hzsz .hzfind{grid-template-columns:1fr}}#hzsz tr.pick[data-s]{cursor:pointer}#hzsz tr.pick[data-s]:active td{background:rgba(216,180,114,.3)}' +
      '#hzsz .hzszf{display:grid;grid-template-columns:1fr 1fr;gap:8px}#hzsz .hzszf label{display:flex;flex-direction:column;gap:3px;font-size:12px;color:var(--muted)}#hzsz .hzszf input,#hzsz textarea{width:100%;padding:10px;border-radius:10px;border:1px solid rgba(216,180,114,.28);background:var(--panel);color:var(--ink);font-family:inherit;font-size:15px}';
    document.head.appendChild(st);
  })();
  (function () {
    var st = document.createElement('style');
    st.textContent = '.hzs>h3:first-child{position:sticky;top:0;z-index:20;background:#262017;margin:0 -18px 12px;padding:14px 18px;border-bottom:1px solid var(--line);border-radius:18px 18px 0 0}.hzs>h3:first-child{margin-top:0!important}.hzs>:first-child:is(h3){margin-top:0}';
    document.head.appendChild(st);
  })();

  (function () {
    var st = document.createElement('style');
    st.textContent = '#hzpdp .tn{position:relative}#hzpdp .tn .lkm{position:absolute;bottom:2px;left:2px;font-size:12px;line-height:1;background:rgba(0,0,0,.6);border-radius:8px;padding:2px 3px;cursor:pointer}#hzpdp .tn.lk img{opacity:.75}';
    document.head.appendChild(st);
  })();
