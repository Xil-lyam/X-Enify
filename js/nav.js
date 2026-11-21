/* X'enify — navigation : un nouvel appui sur l'onglet ouvert remonte tout en haut (comme sur les grandes applis),
   et un petit « tic » de vibration à chaque changement d'onglet. */
(function () {
  'use strict';
  var bar = document.getElementById('tabbar'); if (!bar) return;
  var SEL = ['#chats', '.vfeed', '.musicwrap', '.gamewrap', '.atlist', '.nwfeed', '#nwList', '.nwscroll', '.pfscroll'];
  function scroller() {
    var scr = document.querySelector('.screen:not([hidden])');
    var found = null;
    if (scr) {
      var cands = scr.querySelectorAll(SEL.join(','));
      for (var i = 0; i < cands.length; i++) { if (cands[i].scrollTop > 0 && cands[i].offsetParent) { found = cands[i]; break; } }
      if (!found) { var all = scr.querySelectorAll('*'); for (var j = 0; j < all.length; j++) { var n = all[j]; if (n.scrollTop > 40 && n.scrollHeight > n.clientHeight && n.offsetParent) { found = n; break; } } }
    }
    return found;
  }
  bar.addEventListener('click', function (e) {
    var t = e.target.closest && e.target.closest('.tab'); if (!t) return;
    try { navigator.vibrate && navigator.vibrate(6); } catch (x) {}
    if (t.getAttribute('aria-current') !== 'page' || t.dataset.t === 'create') return;
    var s = scroller();
    if (s) { try { s.scrollTo({ top: 0, behavior: 'smooth' }); } catch (x) { s.scrollTop = 0; } }
    else if (window.scrollY > 40) { window.scrollTo({ top: 0, behavior: 'smooth' }); }
  }, true);
})();
