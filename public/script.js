const form = document.getElementById('noteForm');
const titleInput = document.getElementById('title');
const contentInput = document.getElementById('content');
const noteIdInput = document.getElementById('noteId');
const table = document.getElementById('notesTable');
const cancelBtn = document.getElementById('cancelBtn');

// элементы из index.html (если их нет — просто будет игнор)
const authOnlyBlock = document.getElementById('authOnly');
const loginAlert = document.getElementById('loginAlert');

let isLoggedIn = false;

function resetForm() {
  form.reset();
  noteIdInput.value = '';
}

cancelBtn?.addEventListener('click', resetForm);

async function checkAuth() {
  try {
    const res = await fetch('/api/auth/me', { credentials: 'include' });
    const data = await res.json();
    isLoggedIn = !!data.loggedIn;
  } catch {
    isLoggedIn = false;
  }

  // Если блоки есть в HTML — синхронизируем UI
  if (authOnlyBlock) authOnlyBlock.classList.toggle('d-none', !isLoggedIn);
  if (loginAlert) loginAlert.classList.toggle('d-none', isLoggedIn);

  return isLoggedIn;
}

function renderActionsCell(tr, note) {
  const td = document.createElement('td');

  if (!isLoggedIn) {
    td.innerHTML = `<span class="text-muted">Login to edit</span>`;
    return td;
  }

  const editBtn = document.createElement('button');
  editBtn.className = 'btn btn-sm btn-warning';
  editBtn.textContent = 'Edit';

  const delBtn = document.createElement('button');
  delBtn.className = 'btn btn-sm btn-danger ms-2';
  delBtn.textContent = 'Delete';

  editBtn.addEventListener('click', () => {
    noteIdInput.value = note._id;
    titleInput.value = note.title || '';
    contentInput.value = note.content || '';
    titleInput.focus();
  });

  delBtn.addEventListener('click', async () => {
    const ok = confirm('Delete this note?');
    if (!ok) return;

    const res = await fetch(`/api/notes/${note._id}`, {
      method: 'DELETE',
      credentials: 'include'
    });

    if (res.status === 401) {
      alert('Unauthorized. Please login.');
      window.location.href = '/login.html';
      return;
    }

    if (!res.ok) {
      alert('Delete failed.');
      return;
    }

    loadNotes();
  });

  td.appendChild(editBtn);
  td.appendChild(delBtn);
  return td;
}

async function loadNotes() {
  // перед отрисовкой актуализируем статус логина
  await checkAuth();

  const res = await fetch('/api/notes', { credentials: 'include' });
  const notes = await res.json();

  table.innerHTML = '';

  notes.forEach((note) => {
    const tr = document.createElement('tr');

    const titleTd = document.createElement('td');
    const contentTd = document.createElement('td');

    // безопасный вывод текста
    const titleDiv = document.createElement('div');
    titleDiv.textContent = note.title ?? '';

    const contentDiv = document.createElement('div');
    contentDiv.textContent = note.content ?? '';

    titleTd.appendChild(titleDiv);
    contentTd.appendChild(contentDiv);

    tr.appendChild(titleTd);
    tr.appendChild(contentTd);
    tr.appendChild(renderActionsCell(tr, note));

    table.appendChild(tr);
  });
}

form?.addEventListener('submit', async (e) => {
  e.preventDefault();

  // если не залогинен — не даём сделать write-операции
  if (!isLoggedIn) {
    alert('Please login to create/update notes.');
    window.location.href = '/login.html';
    return;
  }

  const data = {
    title: titleInput.value.trim(),
    content: contentInput.value.trim()
  };

  if (!data.title || !data.content) {
    alert('Title and content are required.');
    return;
  }

  const isEdit = !!noteIdInput.value;
  const url = isEdit ? `/api/notes/${noteIdInput.value}` : '/api/notes';
  const method = isEdit ? 'PUT' : 'POST';

  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data)
  });

  if (res.status === 401) {
    alert('Unauthorized. Please login.');
    window.location.href = '/login.html';
    return;
  }

  if (!res.ok) {
    alert('Save failed.');
    return;
  }

  resetForm();
  loadNotes();
});

// старт
loadNotes();
