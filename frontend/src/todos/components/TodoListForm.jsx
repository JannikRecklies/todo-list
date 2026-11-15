import { useEffect, useRef, useState } from 'react'
import {
  Alert,
  TextField,
  Card,
  CardContent,
  CardActions,
  Button,
  Typography,
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add'

const AUTOSAVE_DELAY_MS = 1000

const normalizeTodoList = (title, todos) => ({
  title: title.trim(),
  todos: todos.filter((todo) => todo.trim() !== ''),
})

export const TodoListForm = ({ todoList, saveTodoList, deleteTodoList }) => {
  const [title, setTitle] = useState(todoList.title)
  const [todos, setTodos] = useState(todoList.todos)
  const [error, setError] = useState('')
  // The save waiting for its delay, as { timer, todoListToSave }. Only one is ever waiting.
  const pendingTodoListSave = useRef(null)

  const save = async (todoListToSave) => {
    pendingTodoListSave.current = null
    try {
      await saveTodoList(todoList.id, todoListToSave)
      setError('')
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  const scheduleSave = (nextTitle, nextTodos, delay) => {
    clearTimeout(pendingTodoListSave.current?.timer)
    pendingTodoListSave.current = null

    const updatedTodoList = normalizeTodoList(nextTitle, nextTodos)
    if (!updatedTodoList.title) return

    const todoListSaveTimer = setTimeout(() => save(updatedTodoList), delay)
    pendingTodoListSave.current = { todoListToSave: updatedTodoList, timer: todoListSaveTimer }
  }

  // Switching lists unmounts the form, so send the edit that is still waiting for its delay.
  useEffect(
    () => () => {
      if (!pendingTodoListSave.current) return
      clearTimeout(pendingTodoListSave.current.timer)
      saveTodoList(todoList.id, pendingTodoListSave.current.todoListToSave).catch(() => {})
    },
    [todoList.id, saveTodoList],
  )

  const changeTitle = (newTitle) => {
    setTitle(newTitle)
    scheduleSave(newTitle, todos, AUTOSAVE_DELAY_MS)
  }

  const changeTodo = (index, text) => {
    const nextTodos = todos.map((todo, i) => (i === index ? text : todo))
    setTodos(nextTodos)
    scheduleSave(title, nextTodos, AUTOSAVE_DELAY_MS)
  }

  const removeTodo = (index) => {
    const nextTodos = todos.filter((todo, i) => i !== index)
    setTodos(nextTodos)
    scheduleSave(title, nextTodos, 0)
  }

  const addTodo = () => {
    setTodos([...todos, ''])
  }

  return (
    <Card sx={{ margin: '0 1rem' }}>
      <CardContent>
        <Typography component='h2' sx={{ marginBottom: '1rem' }}>
          Edit Todo List
        </Typography>
        {error && <Alert severity='error'>{error}</Alert>}
        <form style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
          <TextField
            required
            label='List title'
            value={title}
            onChange={(event) => changeTitle(event.target.value)}
            sx={{ marginTop: '1rem' }}
          />
          {todos.map((name, index) => (
            <div key={index} style={{ display: 'flex', alignItems: 'center' }}>
              <Typography sx={{ margin: '8px' }} variant='h6'>
                {index + 1}
              </Typography>
              <TextField
                sx={{ flexGrow: 1, marginTop: '1rem' }}
                label='What to do?'
                value={name}
                onChange={(event) => changeTodo(index, event.target.value)}
              />
              <Button
                type='button'
                sx={{ margin: '8px' }}
                size='small'
                color='secondary'
                onClick={() => removeTodo(index)}
              >
                <DeleteIcon />
              </Button>
            </div>
          ))}
          <CardActions>
            <Button type='button' color='primary' onClick={addTodo}>
              Add Todo <AddIcon />
            </Button>
            <Button
              type='button'
              color='error'
              onClick={deleteTodoList}
              sx={{ marginLeft: 'auto' }}
            >
              Delete List <DeleteIcon />
            </Button>
          </CardActions>
        </form>
      </CardContent>
    </Card>
  )
}
