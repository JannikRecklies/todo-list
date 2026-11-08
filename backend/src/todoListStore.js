import { randomUUID } from 'node:crypto'
import { openDatabase } from './database.js'

export const createTodoListStore = (databasePath) => {
  const database = openDatabase(databasePath)

  const findList = (id) => {
    const list = database.prepare('SELECT id, title FROM todo_list WHERE id = ?').get(id)
    if (!list) return null

    return { id: list.id, title: list.title, todos: findTodoTexts(id) }
  }

  const findTodoTexts = (listId) => {
    const rows = database
      .prepare('SELECT text FROM todo WHERE list_id = ? ORDER BY position')
      .all(listId)
    return rows.map((row) => row.text)
  }

  const findAllListIds = () => {
    const rows = database.prepare('SELECT id FROM todo_list ORDER BY position').all()
    return rows.map((row) => row.id)
  }

  const findNextListPosition = () => {
    const row = database
      .prepare('SELECT COALESCE(MAX(position), -1) + 1 AS position FROM todo_list')
      .get()
    return row.position
  }

  const insertTodos = (listId, texts) => {
    texts.forEach((text, position) => {
      database
        .prepare('INSERT INTO todo (list_id, position, text) VALUES (?, ?, ?)')
        .run(listId, position, text)
    })
  }

  const replaceTodos = (listId, texts) => {
    database.prepare('DELETE FROM todo WHERE list_id = ?').run(listId)
    insertTodos(listId, texts)
  }

  const getAll = () => {
    const lists = {}
    findAllListIds().forEach((id) => {
      lists[id] = findList(id)
    })
    return lists
  }

  const create = (title) => {
    const id = randomUUID()
    database
      .prepare('INSERT INTO todo_list (id, title, position) VALUES (?, ?, ?)')
      .run(id, title, findNextListPosition())

    return findList(id)
  }

  const updateList = (id, title, todos) => {
    const result = database.prepare('UPDATE todo_list SET title = ? WHERE id = ?').run(title, id)
    if (result.changes === 0) return null

    replaceTodos(id, todos)
    return findList(id)
  }

  // A transaction makes the update all-or-nothing: if one step fails, nothing is saved.
  const update = database.transaction(updateList)

  const remove = (id) => {
    const result = database.prepare('DELETE FROM todo_list WHERE id = ?').run(id)
    return result.changes > 0
  }

  const close = () => database.close()

  return { close, create, getAll, remove, update }
}
