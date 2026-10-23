// цели Метрики: клик в канал Макса и в гайд
document.addEventListener('click', function (e) {
  var a = e.target.closest('[data-goal]');
  if (a && window.ym && window.YM_ID) ym(window.YM_ID, 'reachGoal', a.dataset.goal);
});
