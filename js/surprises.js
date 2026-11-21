/* X'enify — petites surprises : confettis quand on devient amis, emojis qui jaillissent quand on réagit,
   effets dans les messages (🎉 anniversaire bravo, ❤️ je t'aime), confettis d'anniversaire, bonjour du jour, secret caché. */
(function () {
  'use strict';
  var calm = false;
  try { calm = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}
  var COLORS = ['#ff3b5c', '#ffb02e', '#2fbf71', '#3aa0ff', '#a96bff', '#ff7ac8', '#ffe14a'];
  function rnd(a, b) { return a + Math.random() * (b - a); }
  function pt(x) {
    if (x && x.getBoundingClientRect) { var r = x.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }
    if (x && typeof x.x === 'number') return x;
    return { x: innerWidth / 2, y: innerHeight * 0.4 };
  }
  function particle(html, p, o) {
    var n = document.createElement('i'); n.className = 'xfx'; n.setAttribute('aria-hidden', 'true');
    if (o.bg) { n.style.background = o.bg; n.style.width = o.w + 'px'; n.style.height = o.h + 'px'; n.style.borderRadius = o.round ? '50%' : '2px'; }
    else { n.textContent = html; n.style.fontSize = o.size + 'px'; }
    document.body.appendChild(n);
    var dx = o.dx, dy = o.dy, g = o.g;
    var a = n.animate([
      { transform: 'translate(' + p.x + 'px,' + p.y + 'px) rotate(0deg) scale(.4)', opacity: 1 },
      { transform: 'translate(' + (p.x + dx * .6) + 'px,' + (p.y + dy) + 'px) rotate(' + o.rot * .5 + 'deg) scale(1)', opacity: 1, offset: .35 },
      { transform: 'translate(' + (p.x + dx) + 'px,' + (p.y + dy + g) + 'px) rotate(' + o.rot + 'deg) scale(.9)', opacity: 0 }
    ], { duration: o.t, easing: 'cubic-bezier(.2,.7,.4,1)', fill: 'forwards' });
    a.onfinish = function () { n.remove(); };
  }
  function confetti(where, n) {
    if (calm) return;
    var p = pt(where); n = n || 34;
    for (var i = 0; i < n; i++) {
      var ang = rnd(-Math.PI, 0), v = rnd(90, 260);
      particle('', p, { bg: COLORS[i % COLORS.length], w: rnd(5, 9), h: rnd(8, 14), round: i % 4 === 0, dx: Math.cos(ang) * v, dy: Math.sin(ang) * v, g: rnd(220, 420), rot: rnd(-720, 720), t: rnd(1100, 1800) });
    }
  }
  function burst(emoji, where, n) {
    if (calm) return;
    var p = pt(where); n = n || 9;
    for (var i = 0; i < n; i++) {
      var ang = rnd(-Math.PI * .95, -Math.PI * .05), v = rnd(70, 190);
      particle(emoji, p, { size: rnd(16, 30), dx: Math.cos(ang) * v, dy: Math.sin(ang) * v, g: rnd(40, 140), rot: rnd(-60, 60), t: rnd(800, 1300) });
    }
  }
  function rain(list, n) {
    if (calm) return;
    n = n || 26;
    for (var i = 0; i < n; i++) {
      (function (i) {
        setTimeout(function () {
          particle(list[i % list.length], { x: rnd(10, innerWidth - 10), y: -30 }, { size: rnd(20, 34), dx: rnd(-40, 40), dy: innerHeight * .5, g: innerHeight * .6, rot: rnd(-200, 200), t: rnd(1800, 2800) });
        }, i * 70);
      })(i);
    }
  }
  window.XenFx = { confetti: confetti, burst: burst, rain: rain };

  /* 1) réaction à un message : l'emoji jaillit du bouton */
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-e]');
    if (b && b.dataset.e && b.dataset.e.length <= 8) burst(b.dataset.e, b, 9);
  }, true);

  /* 2) anniversaire : confettis quand la bannière apparaît */
  function watchBday() {
    var bar = document.getElementById('bdayBar'); if (!bar || bar.__fx) return; bar.__fx = 1;
    new MutationObserver(function () { if (!bar.hidden) setTimeout(function () { confetti({ x: innerWidth / 2, y: innerHeight * .3 }, 46); }, 400); }).observe(bar, { attributes: true, attributeFilter: ['hidden'] });
  }

  /* 3) mots magiques dans une conversation (seulement les nouveaux messages, jamais l'historique) */
  var FEST = /(🎉|🥳|🎂|anniv|félicit|felicit|bravo|congrat|bonne année)/i, LOVE = /(❤|💕|💖|😍|🥰|je t.?aime|love you)/i;
  function watchLog() {
    var log = document.getElementById('log'); if (!log || log.__fx) return; log.__fx = 1;
    new MutationObserver(function (list) {
      list.forEach(function (m) {
        m.addedNodes.forEach(function (n) {
          if (!n.classList || !n.classList.contains('row') || !n.classList.contains('in') || n.__fx) return; n.__fx = 1;
          var b = n.querySelector('.bubble'); if (!b) return;
          var t = b.textContent || '';
          if (t.length > 300) return;
          if (FEST.test(t)) confetti(b, 36);
          else if (LOVE.test(t)) burst('❤️', b, 12);
        });
      });
    }).observe(log, { childList: true, subtree: true });
  }
  /* 4) bonjour du jour : une seule fois par jour, à l'ouverture */
  function hello() {
    try {
      var d = new Date().toDateString();
      if (localStorage.getItem('xen-hello') === d) return;
      localStorage.setItem('xen-hello', d);
    } catch (e) {}
    var h = new Date().getHours();
    var msg = h < 5 ? 'Encore debout ? 🌙 Bonne nuit quand même' : h < 12 ? 'Bonjour ☀️ belle journée à toi' : h < 18 ? 'Bon après-midi 👋' : 'Bonsoir ✨ content de te revoir';
    var n = document.createElement('div'); n.className = 'xfx-hello'; n.setAttribute('role', 'status'); n.textContent = msg;
    document.body.appendChild(n);
    setTimeout(function () { n.classList.add('on'); }, 900);
    setTimeout(function () { n.classList.remove('on'); }, 4200);
    setTimeout(function () { n.remove(); }, 5000);
  }

  /* 5) un secret : 5 appuis rapides sur le titre « Amis » */
  var taps = [];
  document.addEventListener('click', function (e) {
    if (!(e.target.closest && e.target.closest('.frp-title'))) return;
    var now = Date.now(); taps = taps.filter(function (t) { return now - t < 1600; }); taps.push(now);
    if (taps.length >= 5) {
      taps = [];
      rain(['💜', '✨', '🎈', '🌟', '🦋', '🍀', '💫', '🎊'], 36);
      var n = document.createElement('div'); n.className = 'xfx-hello'; n.textContent = 'Tu as trouvé le secret 🥚✨'; document.body.appendChild(n);
      setTimeout(function () { n.classList.add('on'); }, 30); setTimeout(function () { n.remove(); }, 3600);
    }
  });

  function init() { watchBday(); watchLog(); setTimeout(hello, 2500); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
