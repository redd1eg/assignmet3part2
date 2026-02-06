const form = document.getElementById('loginForm');
const errorDiv = document.getElementById('error');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include', // 🔥 обязательно для сессий
    body: JSON.stringify({ username, password })
  });

  if (res.ok) {
    window.location.href = '/'; // главная страница с заметками
  } else {
    errorDiv.textContent = 'Invalid credentials';
  }
});
