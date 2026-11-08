import { createApp } from './app.js'
import { createTodoListStore } from './todoListStore.js'

const store = createTodoListStore()
const app = createApp(store)
const PORT = process.env.PORT || 3001

app.listen(PORT, () => console.log(`Example app listening on port ${PORT}!`))
