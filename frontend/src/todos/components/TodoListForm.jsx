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
  const saveTimer = useRef(null) // Holds the timer ID for the scheduled save
  const saveNow = useRef(null) // Holds the function to save the edit immediately if needed

  const save = async (todoListToSave) => {
    try {
      await saveTodoList(todoList.id, todoListToSave)
      setError('')
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  const scheduleSave = (nextTitle, nextTodos, delay) => {
    clearTimeout(saveTimer.current)
    saveNow.current = null

    const todoListToSave = normalizeTodoList(nextTitle, nextTodos)
    if (!todoListToSave.title) return

    const saveEditNow = () => {
      clearTimeout(saveTimer.current)
      saveNow.current = null
      save(todoListToSave)
    }
    saveTimer.current = setTimeout(saveEditNow, delay)
    saveNow.current = saveEditNow
  }

  // Switching lists unmounts the form: stop the timer and save the waiting edit now.
  useEffect(() => {
    return () => {
      if (saveNow.current) saveNow.current()
    }
  }, [])

  // Closing or refreshing the tab does not unmount the form, so save the waiting edit on pagehide.
  useEffect(() => {
    const saveBeforeClose = () => {
      if (saveNow.current) saveNow.current()
    }
    window.addEventListener('pagehide', saveBeforeClose)
    return () => window.removeEventListener('pagehide', saveBeforeClose)
  }, [])

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
