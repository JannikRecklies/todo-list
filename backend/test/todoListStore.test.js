import assert from 'node:assert/strict'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, test } from 'node:test'
import Database from 'better-sqlite3'
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
  store.update('0000000001', 'Renamed list', [
    { text: 'Saved todo', completed: true },
    { text: '', completed: false },
  ])
  store.close()

  store = createTodoListStore(databasePath)
  assert.deepEqual(store.getAll()['0000000001'], {
    id: '0000000001',
    title: 'Renamed list',
    todos: [
      { text: 'Saved todo', completed: true },
      { text: '', completed: false },
    ],
  })
  store.close()
})

test('creates and deletes lists with their todos', () => {
  const store = createTodoListStore(createTemporaryDatabasePath())
  const createdList = store.create('New list')

  store.update(createdList.id, createdList.title, [{ text: 'One todo', completed: false }])
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

test('adds the completed column to a database created before completion existed', () => {
  const databasePath = createTemporaryDatabasePath()
  const oldDatabase = new Database(databasePath)
  oldDatabase.exec(`
    CREATE TABLE todo_list (id TEXT PRIMARY KEY, title TEXT NOT NULL, position INTEGER NOT NULL UNIQUE);
    CREATE TABLE todo (
      list_id TEXT NOT NULL REFERENCES todo_list(id) ON DELETE CASCADE,
      position INTEGER NOT NULL,
      text TEXT NOT NULL,
      PRIMARY KEY (list_id, position)
    );
    INSERT INTO todo_list (id, title, position) VALUES ('old-list', 'Old list', 0);
    INSERT INTO todo (list_id, position, text) VALUES ('old-list', 0, 'Old todo');
  `)
  oldDatabase.close()

  const store = createTodoListStore(databasePath)
  assert.deepEqual(store.getAll()['old-list'].todos, [{ text: 'Old todo', completed: false }])
  store.close()
})
