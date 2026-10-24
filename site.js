// цели Метрики: клик в канал Макса и в гайд
document.addEventListener('click', function (e) {
  var a = e.target.closest('[data-goal]');
  if (a && window.ym && window.YM_ID) ym(window.YM_ID, 'reachGoal', a.dataset.goal);
});

// реакции под статьёй: фиксируем цель в Метрике и ответ запоминаем, счётчик не накручиваем
(function () {
  var box = document.querySelector('.react'); if (!box) return;
  var key = 'react:' + box.dataset.slug, ans = box.querySelector('.react-a');
  function done(v) {
    box.querySelector('.react-b').hidden = true; box.querySelector('.react-q').hidden = true;
    ans.hidden = false;
    ans.innerHTML = v === 'yes' ? 'Спасибо! Рады, что пригодилось 🌱' : 'Жаль. Напишите в комментариях к любому посту в канале, чего не хватило — поправим статью.';
  }
  try { var old = localStorage.getItem(key); if (old) return done(old); } catch (e) {}
  box.addEventListener('click', function (e) {
    var b = e.target.closest('.rb'); if (!b) return;
    try { localStorage.setItem(key, b.dataset.v); } catch (e) {}
    done(b.dataset.v);
  });
})();
// плашка в канал: не раньше 5 минут на сайте, на выходе (мышь вверх / быстрый скролл вверх на телефоне), раз в 7 дней
(function () {
  var el = document.getElementById('exit'); if (!el) return;
  var T0 = 'ob_t0', LAST = 'ob_exit', t0;
  try {
    t0 = +sessionStorage.getItem(T0) || Date.now(); sessionStorage.setItem(T0, t0);
    if (Date.now() - (+localStorage.getItem(LAST) || 0) < 7 * 864e5) return;
  } catch (e) { return; }
  var shown = false;
  function show() {
    if (shown || Date.now() - t0 < 300000) return;
    shown = true; el.hidden = false;
    try { localStorage.setItem(LAST, Date.now()); } catch (e) {}
    if (window.ym && window.YM_ID) ym(window.YM_ID, 'reachGoal', 'exit_show');
  }
  document.addEventListener('mouseout', function (e) { if (e.clientY <= 0 && !e.relatedTarget) show(); });
  var y = window.scrollY, ty = Date.now();
  window.addEventListener('scroll', function () {
    var ny = window.scrollY, nt = Date.now();
    if (y - ny > 300 && nt - ty < 600 && ny < 400) show();
    y = ny; ty = nt;
  }, { passive: true });
  el.querySelector('.exit-x').addEventListener('click', function () { el.hidden = true; });
})();
