/* FILE: js/22-app-state.js
   المتغيرات العامة للحالة: ALL, cart, curProduct, filter, ...
   (جزء من HoodZilla — بيتحمّل بالترتيب من index.html، والـ global scope مشترك بين كل الملفات. راجع FILES-GUIDE.md) */
var ALL = [];
var PROMOS = [];
var promoApplied = null;
var filter = 'all';
var sortMode = 'def';
var query = '';
var curProduct = null;
var curColor = null;
var curSize = null;
var modalQty = 1;
var rotators = [];
var modalTimer = null;
var modalImgs = [];
var modalIdx = 0;
var cart = [];
var toastTimer = null;
var hashHandled = false;
var modalPushed = false;
var cartPushed = false;
