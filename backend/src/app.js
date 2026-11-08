import express from 'express'
import cors from 'cors'
import { createTodoListRoutes } from './todoListRoutes.js'

export const createApp = (todoListStore) => {
  const app = express()

  app.use(cors())
  app.use(express.json())

  app.get('/', (req, res) => res.send('Hello World!'))
  app.use('/api/todo-lists', createTodoListRoutes(todoListStore))

  return app
}
