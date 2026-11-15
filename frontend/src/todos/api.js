const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

const request = async (path, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  if (response.status === 204) return null

  const result = await response.json()
  if (!response.ok) throw new Error(result.error || 'The request could not be completed.')

  return result
}

export const getTodoLists = () => request('/api/todo-lists')

export const createTodoList = (title) =>
  request('/api/todo-lists', {
    method: 'POST',
    body: JSON.stringify({ title }),
  })

// keepalive lets the browser finish the save even when the page is closing.
export const saveTodoList = (id, changes) =>
  request(`/api/todo-lists/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(changes),
    keepalive: true,
  })

export const deleteTodoList = (id) =>
  request(`/api/todo-lists/${encodeURIComponent(id)}`, { method: 'DELETE' })
