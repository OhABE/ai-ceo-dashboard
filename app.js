document.getElementById('current-date').textContent =
  new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' });

const CAT_LABELS = {
  channel: 'Oh!アベチャンネル',
  work:    '仕事・営業',
  side:    '副業・依頼',
  appdev:  'アプリ開発'
};

const AI_PROMPTS = {
  channel: t => `Oh!アベチャンネルの相談です。\n今やること：${t||'未設定'}\n\n次の具体的なアクションを3つ教えてください。`,
  work:    t => `仕事・営業の相談です。\n今やること：${t||'未設定'}\n\n効率的に進めるアドバイスをください。`,
  side:    t => `副業・依頼（SkyStage）の相談です。\n今やること：${t||'未設定'}\n\n具体的な進め方を教えてください。`,
  appdev:  t => `アプリ開発の相談です。\n今やること：${t||'未設定'}\n\n技術的なアドバイスと次のステップを教えてください。`
};

// 今やること表示
function loadTodos() {
  document.querySelectorAll('.todo-text').forEach(el => {
    const val = localStorage.getItem(el.dataset.key);
    if (val) {
      el.textContent = val;
      el.classList.remove('empty');
    } else {
      el.textContent = 'タップして編集...';
      el.classList.add('empty');
    }
  });
}
loadTodos();

// トースト
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}

// モーダル開閉
function openModal(id) { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }

// 今やること編集
let editingCat = null;

document.querySelectorAll('.todo-area').forEach(area => {
  area.addEventListener('click', () => {
    const cat = area.closest('.card').dataset.cat;
    editingCat = cat;
    const current = localStorage.getItem(`todo-${cat}`) || '';
    document.getElementById('edit-text').value = current;
    openModal('edit-modal');
    setTimeout(() => document.getElementById('edit-text').focus(), 100);
  });
});

document.getElementById('edit-save').addEventListener('click', () => {
  const val = document.getElementById('edit-text').value.trim();
  if (editingCat) {
    localStorage.setItem(`todo-${editingCat}`, val);
    loadTodos();
  }
  closeModal('edit-modal');
  showToast('保存しました');
});

document.getElementById('edit-cancel').addEventListener('click', () => closeModal('edit-modal'));

// AI相談
document.querySelectorAll('.btn-ai').forEach(btn => {
  btn.addEventListener('click', () => {
    const cat = btn.dataset.cat;
    const todo = localStorage.getItem(`todo-${cat}`) || '';
    const prompt = AI_PROMPTS[cat](todo);
    navigator.clipboard.writeText(prompt)
      .then(() => showToast('コピーしました。Claude.aiに貼り付けてください'))
      .catch(() => {
        const ta = document.createElement('textarea');
        ta.value = prompt;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        showToast('コピーしました。Claude.aiに貼り付けてください');
      });
  });
});

// 記録する
let recordingCat = null;

document.querySelectorAll('.btn-record').forEach(btn => {
  btn.addEventListener('click', () => {
    recordingCat = btn.dataset.cat;
    document.getElementById('record-title').textContent = `記録する — ${CAT_LABELS[recordingCat]}`;
    document.getElementById('record-text').value = '';
    openModal('record-modal');
    setTimeout(() => document.getElementById('record-text').focus(), 100);
  });
});

document.getElementById('record-save').addEventListener('click', () => {
  const text = document.getElementById('record-text').value.trim();
  if (!text) { closeModal('record-modal'); return; }
  const key = `memos-${recordingCat}`;
  const memos = JSON.parse(localStorage.getItem(key) || '[]');
  memos.unshift({ date: new Date().toLocaleString('ja-JP'), text });
  localStorage.setItem(key, JSON.stringify(memos));
  closeModal('record-modal');
  showToast('記録しました');
});

document.getElementById('record-cancel').addEventListener('click', () => closeModal('record-modal'));

// 過去メモ
document.querySelectorAll('.btn-memo').forEach(btn => {
  btn.addEventListener('click', () => {
    const cat = btn.dataset.cat;
    document.getElementById('memo-title').textContent = `過去メモ — ${CAT_LABELS[cat]}`;
    const memos = JSON.parse(localStorage.getItem(`memos-${cat}`) || '[]');
    const list = document.getElementById('memo-list');
    if (memos.length === 0) {
      list.innerHTML = '<div class="memo-empty">まだメモはありません</div>';
    } else {
      list.innerHTML = memos.map((m, i) => `
        <div class="memo-item">
          <div class="memo-date">${m.date}</div>
          <div class="memo-body">${m.text.replace(/\n/g, '<br>')}</div>
        </div>`).join('');
    }
    openModal('memo-modal');
  });
});

document.getElementById('memo-close').addEventListener('click', () => closeModal('memo-modal'));

// モーダル背景タップで閉じる
document.querySelectorAll('.modal').forEach(modal => {
  modal.addEventListener('click', e => {
    if (e.target === modal) modal.classList.remove('open');
  });
});
