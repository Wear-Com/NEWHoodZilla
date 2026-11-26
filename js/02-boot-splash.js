/* FILE: js/02-boot-splash.js — إظهار شاشة البداية #hzboot في وضع التطبيق المتثبت */
try{if((window.matchMedia&&matchMedia('(display-mode: standalone)').matches)||navigator.standalone)document.getElementById('hzboot').style.display='flex';}catch(e){}
