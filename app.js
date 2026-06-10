// 日付表示
document.getElementById('current-date').textContent =
  new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' });
