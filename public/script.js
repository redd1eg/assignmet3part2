const form = document.getElementById('noteForm')
const titleInput = document.getElementById('title')
const contentInput = document.getElementById('content')
const noteIdInput = document.getElementById('noteId')
const table = document.getElementById('notesTable')
const cancelBtn = document.getElementById('cancelBtn')

function resetForm() {
  form.reset()
  noteIdInput.value = ''
}

cancelBtn.addEventListener('click', resetForm)

async function loadNotes() {
  const res = await fetch('/api/notes')
  const notes = await res.json()

  table.innerHTML = ''
  notes.forEach(note => {
    const tr = document.createElement('tr')

    // безопасный вывод текста
    const titleDiv = document.createElement('div')
    titleDiv.textContent = note.title

    const contentDiv = document.createElement('div')
    contentDiv.textContent = note.content

    tr.innerHTML = `
      <td></td>
      <td></td>
      <td>
        <button class="btn btn-sm btn-warning btn-edit">Edit</button>
        <button class="btn btn-sm btn-danger btn-delete ms-2">Delete</button>
      </td>
    `
    tr.children[0].appendChild(titleDiv)
    tr.children[1].appendChild(contentDiv)

    tr.querySelector('.btn-edit').addEventListener('click', () => {
      noteIdInput.value = note._id
      titleInput.value = note.title
      contentInput.value = note.content
      titleInput.focus()
    })

    tr.querySelector('.btn-delete').addEventListener('click', async () => {
      await fetch(`/api/notes/${note._id}`, { method: 'DELETE' })
      loadNotes()
    })

    table.appendChild(tr)
  })
}

form.addEventListener('submit', async (e) => {
  e.preventDefault()

  const data = {
    title: titleInput.value,
    content: contentInput.value
  }

  if (noteIdInput.value) {
    await fetch(`/api/notes/${noteIdInput.value}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
  } else {
    await fetch('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
  }

  resetForm()
  loadNotes()
})

loadNotes()
