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

// опрос на главной: ответ запоминаем у читателя, итоги покажем, когда накопятся настоящие
(function () {
  var box = document.getElementById('poll');
  if (!box) return;
  var out = box.querySelector('.poll-a');
  function show(opt) {
    box.querySelectorAll('.rb').forEach(function (b) { b.classList.toggle('on', b.dataset.opt === opt); });
    out.hidden = false;
    out.innerHTML = 'Спасибо! Подсказки именно про это — в нашем канале в Максе: <a href="' +
      document.querySelector('.btn-max').href + '" data-goal="poll_max">подписаться</a>';
  }
  var saved = localStorage.getItem('poll:main');
  if (saved) show(saved);
  box.addEventListener('click', function (e) {
    var b = e.target.closest('.rb'); if (!b) return;
    localStorage.setItem('poll:main', b.dataset.opt); show(b.dataset.opt);
  });
})();

// полоса прогресса чтения и плавающая кнопка в Макс (только статьи)
(function () {
  var pg = document.getElementById('pg'), stk = document.getElementById('stk');
  if (!pg) return;
  var closed = sessionStorage.getItem('stk-x');
  var x = document.getElementById('stk-x');
  if (x) x.addEventListener('click', function () { sessionStorage.setItem('stk-x', '1'); stk.hidden = true; closed = '1'; });
  function upd() {
    var h = document.documentElement, p = h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight);
    pg.style.width = (Math.min(1, p) * 100) + '%';
    if (stk && !closed) stk.hidden = !(p > 0.22 && p < 0.97);
  }
  window.addEventListener('scroll', upd, { passive: true }); upd();
})();

// «Что делать в этом месяце»: галочки с подсчётом + совет дня
(function () {
  var box = document.getElementById('mon'); if (!box) return;
  var M = JSON.parse(box.dataset.months), T = JSON.parse(box.dataset.tips);
  var now = new Date(), m = now.getMonth() + 1, d = M[m];
  document.getElementById('mon-name').textContent = d[0].toLowerCase().replace(/ь$/, 'е').replace(/т$/, 'те').replace(/й$/, 'е').replace(/я$/, 'е');
  var key = 'mon:' + now.getFullYear() + '-' + m, saved = JSON.parse(localStorage.getItem(key) || '[]');
  var ul = document.getElementById('mon-list'), cnt = document.getElementById('mon-n'), done = document.getElementById('mon-done');
  d[1].forEach(function (t, i) {
    var li = document.createElement('li'); li.className = 'mon-i' + (saved.indexOf(i) > -1 ? ' ok' : '');
    li.innerHTML = '<label><input type="checkbox"' + (saved.indexOf(i) > -1 ? ' checked' : '') + '><span></span></label>';
    li.querySelector('span').textContent = t; ul.appendChild(li);
    li.querySelector('input').addEventListener('change', function (e) {
      var s = JSON.parse(localStorage.getItem(key) || '[]'), k = s.indexOf(i);
      if (e.target.checked && k < 0) s.push(i); if (!e.target.checked && k > -1) s.splice(k, 1);
      localStorage.setItem(key, JSON.stringify(s)); li.classList.toggle('ok', e.target.checked); upd();
    });
  });
  function upd() {
    var n = ul.querySelectorAll('input:checked').length; cnt.textContent = n; done.hidden = n < d[1].length;
    if (n === d[1].length && window.ym && window.YM_ID) ym(window.YM_ID, 'reachGoal', 'mon_done');
  }
  upd();
  var doy = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 864e5);
  document.getElementById('tip-t').textContent = T[doy % T.length];
})();

// тест готовности к сезону
(function () {
  var box = document.getElementById('quiz'); if (!box) return;
  var Q = JSON.parse(box.dataset.q), i = 0, score = 0, started = false;
  var qq = document.getElementById('qq'), qa = document.getElementById('qa'), qn = document.getElementById('qn'), bar = document.getElementById('qbar');
  function goal(g) { if (window.ym && window.YM_ID) ym(window.YM_ID, 'reachGoal', g); }
  function show() {
    qn.textContent = 'Вопрос ' + (i + 1) + ' из ' + Q.length; bar.style.width = (i / Q.length * 100) + '%';
    qq.textContent = Q[i][0]; qa.innerHTML = '';
    Q[i][1].forEach(function (a, k) {
      var b = document.createElement('button'); b.type = 'button'; b.className = 'rb'; b.textContent = a;
      b.addEventListener('click', function () {
        if (!started) { started = true; goal('quiz_start'); }
        score += 2 - k; i++; i < Q.length ? show() : finish();
      });
      qa.appendChild(b);
    });
  }
  function finish() {
    bar.style.width = '100%'; qq.hidden = true; qa.hidden = true; qn.hidden = true;
    var r = document.getElementById('qres'), t, s;
    if (score <= 4) { t = 'Вы в начале пути'; s = 'Ничего страшного: до посева ещё есть время. Начните с трёх вещей: узнайте даты посева в калькуляторе, проверьте семена на всхожесть и подготовьте место со светом для рассады.'; }
    else if (score <= 8) { t = 'Почти готовы'; s = 'Основа есть. Добейте слабые места: сверьте даты посева, подготовьте подсветку и грунт заранее, чтобы в марте не бегать по магазинам.'; }
    else { t = 'Вы опытный огородник'; s = 'Всё готово к сезону. Осталось не упустить сроки и записывать результаты в дневник, чтобы в следующем году стало ещё лучше.'; }
    r.innerHTML = '<p class="cta-t"></p><p class="qs"></p><p><a class="btn-big" href="/kalkulyator/" data-goal="quiz_calc">Узнать даты посева</a></p>';
    r.querySelector('.cta-t').textContent = t + ' · ' + score + ' из ' + (Q.length * 2); r.querySelector('.qs').textContent = s;
    r.hidden = false; document.getElementById('qcta').hidden = false; goal('quiz_done');
  }
  show();
})();

// «Мой огород»: очки за полезные действия, 5 уровней, подарок в Максе на последнем
(function () {
  var G = document.getElementById('game'); if (!G) return;
  var STAGES = ['🌰', '🌱', '🌿', '🌼', '🍅'];
  var NAMES = ['Семечко', 'Росток', 'Рассада', 'Цветёт', 'Урожай'];
  var TASKS = [
    ['visit', 'Заглянуть на сайт'], ['read', 'Дочитать статью'], ['mon', 'Отметить задачу месяца'],
    ['quiz', 'Пройти тест'], ['poll', 'Ответить в опросе']
  ];
  var state = JSON.parse(localStorage.getItem('game') || '{"d":{},"days":[]}');
  function save() { localStorage.setItem('game', JSON.stringify(state)); }
  function done() { return TASKS.filter(function (t) { return state.d[t[0]]; }).length; }
  function render() {
    var n = done(); G.hidden = false;
    document.getElementById('game-i').textContent = STAGES[Math.min(n, 4)];
    document.getElementById('game-n').textContent = n + '/5';
    document.querySelector('#game-b u').style.width = (n / 5 * 100) + '%';
  }
  function toast(t) { var e = document.createElement('div'); e.className = 'gtoast'; e.textContent = t; document.body.appendChild(e); setTimeout(function () { e.remove(); }, 2600); }
  function award(k) {
    if (state.d[k]) return; state.d[k] = 1; save(); render();
    var n = done(), t = TASKS.filter(function (x) { return x[0] === k; })[0][1];
    toast(STAGES[Math.min(n, 4)] + ' ' + t + ' — ' + n + ' из 5');
    if (n === 5) { openWin(true); if (window.ym && window.YM_ID) ym(window.YM_ID, 'reachGoal', 'game_done'); }
  }
  function openWin(final) {
    var n = done(), w = document.getElementById('gwin'), l = document.getElementById('gwin-l');
    document.getElementById('gwin-t').textContent = final ? 'Урожай собран! 🍅' : STAGES[Math.min(n, 4)] + ' ' + NAMES[Math.min(n, 4)];
    document.getElementById('gwin-s').textContent = final ? 'Вы выполнили все пять действий. Заберите подарок: мини-гайд «7 ошибок с рассадой» в нашем канале.' : 'Выполните 5 действий — вырастите огород и получите подарок в Максе.';
    l.innerHTML = ''; TASKS.forEach(function (t) { var li = document.createElement('li'); li.textContent = t[1]; if (state.d[t[0]]) li.className = 'ok'; l.appendChild(li); });
    document.getElementById('gwin-a').hidden = !final && n < 5; w.hidden = false;
  }
  G.addEventListener('click', function () { openWin(done() === 5); });
  document.getElementById('gwin-x').addEventListener('click', function () { document.getElementById('gwin').hidden = true; });
  document.getElementById('gwin').addEventListener('click', function (e) { if (e.target.id === 'gwin') e.target.hidden = true; });
  render(); award('visit');
  // дочитал статью (до 85% прокрутки)
  if (document.getElementById('pg')) window.addEventListener('scroll', function f() {
    var h = document.documentElement; if (h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight) > .85) { award('read'); window.removeEventListener('scroll', f); }
  }, { passive: true });
  document.addEventListener('change', function (e) { if (e.target.closest && e.target.closest('#mon-list') && e.target.checked) award('mon'); });
  document.addEventListener('click', function (e) {
    if (e.target.closest('#poll .rb')) award('poll');
    if (e.target.closest('#quiz #qa .rb') && document.querySelector('#qres:not([hidden])')) award('quiz');
  });
  var obs = document.getElementById('qres');
  if (obs) new MutationObserver(function () { if (!obs.hidden) award('quiz'); }).observe(obs, { attributes: true, attributeFilter: ['hidden'] });
})();
