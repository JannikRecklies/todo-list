import { Router } from 'express'

const isNonBlankString = (value) => typeof value === 'string' && value.trim() !== ''

const isTodo = (value) =>
  typeof value === 'object' &&
  value !== null &&
  typeof value.text === 'string' &&
  typeof value.completed === 'boolean'

const isArrayOfTodos = (value) => Array.isArray(value) && value.every(isTodo)

// Routes for /api/todo-lists. They check the request, call the store, and pick the HTTP status.
export const createTodoListRoutes = (todoListStore) => {
  const router = Router()

  router.get('/', (req, res) => {
    res.json(todoListStore.getAll())
  })

  router.post('/', (req, res) => {
    const { title } = req.body ?? {}
    if (!isNonBlankString(title)) {
      return res.status(400).json({ error: 'A list title is required.' })
    }

    const createdList = todoListStore.create(title.trim())
    res.status(201).json(createdList)
  })

  router.put('/:id', (req, res) => {
    const { title, todos } = req.body ?? {}
    if (!isNonBlankString(title) || !isArrayOfTodos(todos)) {
      return res.status(400).json({ error: 'A title and an array of todos with text and completed are required.' })
    }

    const updatedList = todoListStore.update(req.params.id, title.trim(), todos)
    if (!updatedList) {
      return res.status(404).json({ error: 'Todo list not found.' })
    }

    res.json(updatedList)
  })

  router.delete('/:id', (req, res) => {
    const wasDeleted = todoListStore.remove(req.params.id)
    if (!wasDeleted) {
      return res.status(404).json({ error: 'Todo list not found.' })
    }

    res.sendStatus(204)
  })

  return router
}
