import Database from 'better-sqlite3'
import { mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

// import.meta.url is this file's location (a file:// URL), so the path is resolved relative to the source, not the working directory.
const defaultDatabasePath = fileURLToPath(new URL('../data/todo-lists.sqlite', import.meta.url))

const sampleLists = [
  { id: '0000000001', title: 'First List', todos: ['First todo of first list!'] },
  { id: '0000000002', title: 'Second List', todos: ['First todo of second list!'] },
]

// Opens the database and makes sure it is ready to use.
export const openDatabase = (databasePath = process.env.TODO_DATABASE_PATH || defaultDatabasePath) => {
  const database = connect(databasePath)
  createTables(database)
  addSampleListsOnce(database)
  return database
}

const connect = (databasePath) => {
  const fullPath = resolve(databasePath)
  mkdirSync(dirname(fullPath), { recursive: true })

  const database = new Database(fullPath)
  database.pragma('foreign_keys = ON')
  return database
}

const createTables = (database) => {
  database.exec(`
    CREATE TABLE IF NOT EXISTS todo_list (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL CHECK (length(trim(title)) > 0),
      position INTEGER NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS todo (
      list_id TEXT NOT NULL REFERENCES todo_list(id) ON DELETE CASCADE,
      position INTEGER NOT NULL,
      text TEXT NOT NULL,
      PRIMARY KEY (list_id, position)
    );

    CREATE TABLE IF NOT EXISTS app_metadata (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `)
}

// The marker row remembers that the samples were added already, so they
// don't come back after the user deleted every list.
const addSampleListsOnce = (database) => {
  const run = database.transaction(() => {
    if (wereSamplesAdded(database)) return

    if (countLists(database) === 0) {
      sampleLists.forEach((list, position) => insertSampleList(database, list, position))
    }
    markSamplesAsAdded(database)
  })
  run()
}

const wereSamplesAdded = (database) => {
  const marker = database
    .prepare("SELECT 1 FROM app_metadata WHERE key = 'sample_lists_seeded'")
    .get()
  return marker !== undefined
}

const countLists = (database) => {
  return database.prepare('SELECT COUNT(*) AS count FROM todo_list').get().count
}

const insertSampleList = (database, list, position) => {
  database
    .prepare('INSERT INTO todo_list (id, title, position) VALUES (?, ?, ?)')
    .run(list.id, list.title, position)

  list.todos.forEach((text, todoPosition) => {
    database
      .prepare('INSERT INTO todo (list_id, position, text) VALUES (?, ?, ?)')
      .run(list.id, todoPosition, text)
  })
}

const markSamplesAsAdded = (database) => {
  database
    .prepare("INSERT INTO app_metadata (key, value) VALUES ('sample_lists_seeded', 'true')")
    .run()
}
