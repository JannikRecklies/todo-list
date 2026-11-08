import assert from 'node:assert/strict'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, test } from 'node:test'
import { createTodoListStore } from '../src/todoListStore.js'

const temporaryDirectories = []

const createTemporaryDatabasePath = () => {
  const directory = mkdtempSync(join(tmpdir(), 'todo-list-test-'))
  temporaryDirectories.push(directory)
  return join(directory, 'todo-lists.sqlite')
}

afterEach(() => {
  temporaryDirectories.splice(0).forEach((directory) => {
    rmSync(directory, { recursive: true, force: true })
  })
})

test('seeds the sample lists once and keeps saved changes across a restart', () => {
  const databasePath = createTemporaryDatabasePath()
  let store = createTodoListStore(databasePath)

  assert.deepEqual(Object.values(store.getAll()).map(({ title }) => title), [
    'First List',
    'Second List',
  ])
  store.update('0000000001', 'Renamed list', ['Saved todo', ''])
  store.close()

  store = createTodoListStore(databasePath)
  assert.deepEqual(store.getAll()['0000000001'], {
    id: '0000000001',
    title: 'Renamed list',
    todos: ['Saved todo', ''],
  })
  store.close()
})

test('creates and deletes lists with their todos', () => {
  const store = createTodoListStore(createTemporaryDatabasePath())
  const createdList = store.create('New list')

  store.update(createdList.id, createdList.title, ['One todo'])
  assert.equal(store.remove(createdList.id), true)
  assert.equal(store.remove(createdList.id), false)
  assert.equal(store.getAll()[createdList.id], undefined)
  store.close()
})

test('does not reseed sample lists after all lists have been deleted', () => {
  const databasePath = createTemporaryDatabasePath()
  let store = createTodoListStore(databasePath)
  Object.keys(store.getAll()).forEach((id) => store.remove(id))
  store.close()

  store = createTodoListStore(databasePath)
  assert.deepEqual(store.getAll(), {})
  store.close()
})
