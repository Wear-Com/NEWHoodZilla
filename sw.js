/* HoodZilla service worker. غيّر رقم VERSION مع كل تحديث للموقع عشان العملاء ياخدوا النسخة الجديدة */
var VERSION = 'hz-v1';
var SHELL = ['./', 'index.html', 'manifest.json', 'icon-192.png', 'icon-512.png'];
self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(VERSION).then(function (c) { return c.addAll(SHELL).catch(function () {}); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) { return Promise.all(ks.filter(function (k) { return k !== VERSION; }).map(function (k) { return caches.delete(k); })); }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  var r = e.request, u = new URL(r.url);
  if (r.method !== 'GET' || u.origin !== location.origin) return;          // الـ API والصور من برّه مبنلمسهاش
  if (r.mode === 'navigate') {                                              // الصفحة: النت الأول (عشان التحديثات)، والكاش لو مفيش نت
    e.respondWith(fetch(r).then(function (res) { var cp = res.clone(); caches.open(VERSION).then(function (c) { c.put('index.html', cp); }); return res; }).catch(function () { return caches.match('index.html').then(function (m) { return m || caches.match('./'); }); }));
    return;
  }
  e.respondWith(caches.match(r).then(function (m) { var n = fetch(r).then(function (res) { if (res && res.ok) { var cp = res.clone(); caches.open(VERSION).then(function (c) { c.put(r, cp); }); } return res; }).catch(function () { return m; }); return m || n; }));
});
