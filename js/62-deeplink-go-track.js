/* FILE: js/62-deeplink-go-track.js
   فتح التتبع من لينك ?go=track
   (جزء من HoodZilla — بيتحمّل بالترتيب من index.html، والـ global scope مشترك بين كل الملفات. راجع FILES-GUIDE.md) */
  (function () { try { if (/[?&]go=track/.test(location.search)) setTimeout(function () { if (window.__hzTrack) window.__hzTrack(); }, 900); } catch (e) {} })();
