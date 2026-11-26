/* FILE: js/01-early-install-capture.js — يلتقط beforeinstallprompt بدري (في الـ head) */
/* أ-11: التقاط حدث التثبيت بدري قبل ما السكربتات الكبيرة تتحمّل */window.__hzdp=null;window.addEventListener('beforeinstallprompt',function(e){e.preventDefault();window.__hzdp=e;});window.addEventListener('appinstalled',function(){window.__hzdp=null;});
