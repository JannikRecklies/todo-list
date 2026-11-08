/* global Promise */
import assert from 'node:assert/strict'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { request } from 'node:http'
import { once } from 'node:events'
import { afterEach, test } from 'node:test'
import { createApp } from '../src/app.js'
import { createTodoListStore } from '../src/todoListStore.js'

const temporaryDirectories = []

const createTemporaryDatabasePath = () => {
  const directory = mkdtempSync(join(tmpdir(), 'todo-list-api-test-'))
  temporaryDirectories.push(directory)
  return join(directory, 'todo-lists.sqlite')
}

const sendRequest = (server, path, method = 'GET', body) =>
  new Promise((resolve, reject) => {
    const payload = body === undefined ? undefined : JSON.stringify(body)
    const requestOptions = {
      hostname: '127.0.0.1',
      port: server.address().port,
      path,
      method,
      agent: false,
      headers: payload ? { 'Content-Type': 'application/json' } : {},
    }
    const clientRequest = request(requestOptions, (response) => {
      let responseBody = ''
      response.setEncoding('utf8')
      response.on('data', (chunk) => {
        responseBody += chunk
      })
      response.on('end', () => {
        resolve({
          status: response.statusCode,
          body: responseBody ? JSON.parse(responseBody) : null,
        })
      })
    })

    clientRequest.on('error', reject)
    clientRequest.setTimeout(5000, () => {
      clientRequest.destroy(new Error(`Request timed out: ${method} ${path}`))
    })
    if (payload) clientRequest.write(payload)
    clientRequest.end()
  })

afterEach(() => {
  temporaryDirectories.splice(0).forEach((directory) => {
    rmSync(directory, { recursive: true, force: true })
  })
})

test('supports list CRUD over HTTP and rejects invalid requests', async () => {
  const store = createTodoListStore(createTemporaryDatabasePath())
  const server = createApp(store).listen(0)
  try {
    await once(server, 'listening')

    const initialLists = await sendRequest(server, '/api/todo-lists')
    assert.equal(initialLists.status, 200)
    assert.equal(Object.keys(initialLists.body).length, 2)

    const invalidList = await sendRequest(server, '/api/todo-lists', 'POST', { title: '  ' })
    assert.equal(invalidList.status, 400)

    const created = await sendRequest(server, '/api/todo-lists', 'POST', { title: 'New list' })
    assert.equal(created.status, 201)
    assert.equal(created.body.title, 'New list')
    assert.deepEqual(created.body.todos, [])

    const updated = await sendRequest(
      server,
      `/api/todo-lists/${created.body.id}`,
      'PUT',
      { title: 'Renamed list', todos: ['First todo', ''] }
    )
    assert.equal(updated.status, 200)
    assert.deepEqual(updated.body, {
      id: created.body.id,
      title: 'Renamed list',
      todos: ['First todo', ''],
    })

    const invalidUpdate = await sendRequest(
      server,
      `/api/todo-lists/${created.body.id}`,
      'PUT',
      { title: 'Renamed list', todos: [1] }
    )
    assert.equal(invalidUpdate.status, 400)

    const deleted = await sendRequest(server, `/api/todo-lists/${created.body.id}`, 'DELETE')
    assert.equal(deleted.status, 204)

    const missingList = await sendRequest(server, `/api/todo-lists/${created.body.id}`, 'PUT', {
      title: 'Missing list',
      todos: [],
    })
    assert.equal(missingList.status, 404)
  } finally {
    await new Promise((resolve) => server.close(resolve))
    store.close()
  }
})
