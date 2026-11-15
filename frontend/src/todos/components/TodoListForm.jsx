import { useEffect, useRef, useState } from 'react'
import {
  Alert,
  TextField,
  Box,
  Button,
  Checkbox,
  IconButton,
  Paper,
} from '@mui/material'
import { Add, CheckCircle, Close, DeleteOutline, RadioButtonUnchecked } from '@mui/icons-material'

const AUTOSAVE_DELAY_MS = 1000

const normalizeTodoList = (title, todos) => ({
  title: title.trim(),
  todos: todos.filter((todo) => todo.text.trim() !== ''),
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
    const nextTodos = todos.map((todo, i) => (i === index ? { ...todo, text } : todo))
    setTodos(nextTodos)
    scheduleSave(title, nextTodos, AUTOSAVE_DELAY_MS)
  }

  const toggleTodo = (index) => {
    const nextTodos = todos.map((todo, i) =>
      i === index ? { ...todo, completed: !todo.completed } : todo
    )
    setTodos(nextTodos)
    scheduleSave(title, nextTodos, 0)
  }

  const removeTodo = (index) => {
    const nextTodos = todos.filter((todo, i) => i !== index)
    setTodos(nextTodos)
    scheduleSave(title, nextTodos, 0)
  }

  const addTodo = () => {
    setTodos([...todos, { text: '', completed: false }])
  }

  return (
    <Paper
      elevation={0}
      sx={{
        width: '100%',
        maxWidth: 820,
        p: { xs: 2, sm: 3, md: 4 },
        border: 1,
        borderColor: 'divider',
        borderRadius: 2,
      }}
    >
      {error && <Alert severity='error' sx={{ mb: 2 }}>{error}</Alert>}
      <form>
        <TextField
          required
          fullWidth
          variant='standard'
          label='List title'
          value={title}
          onChange={(event) => changeTitle(event.target.value)}
          sx={{ mb: 3, '& .MuiInputBase-input': { fontSize: '1.35rem', fontWeight: 650 } }}
        />
        <Box>
          {todos.map((todo, index) => (
            <Box
              key={index}
              className='todo-row'
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                minHeight: 58,
                borderBottom: 1,
                borderColor: 'divider',
                '& .todo-delete': { opacity: 0.35 },
                '&:hover .todo-delete, &:focus-within .todo-delete': { opacity: 1 },
                '@media (hover: none)': { '& .todo-delete': { opacity: 0.7 } },
              }}
            >
              <Checkbox
                checked={todo.completed}
                onChange={() => toggleTodo(index)}
                icon={<RadioButtonUnchecked fontSize='small' />}
                checkedIcon={<CheckCircle fontSize='small' />}
                inputProps={{ 'aria-label': `Mark ${todo.text || `todo ${index + 1}`} as completed` }}
                sx={{
                  p: 0.75,
                  color: '#9ca3af',
                  '&.Mui-checked': { color: '#6b7280' },
                }}
              />
              <TextField
                fullWidth
                variant='standard'
                value={todo.text}
                onChange={(event) => changeTodo(index, event.target.value)}
                placeholder='What needs to be done?'
                autoFocus={todo.text === ''}
                inputProps={{ 'aria-label': `Todo ${index + 1}` }}
                sx={{
                  flex: 1,
                  '& .MuiInput-root:before, & .MuiInput-root:after': { display: 'none' },
                  '& .MuiInputBase-input': {
                    py: 1.5,
                    color: todo.completed ? 'text.secondary' : 'text.primary',
                    textDecoration: todo.completed ? 'line-through' : 'none',
                  },
                }}
              />
              <IconButton
                className='todo-delete'
                aria-label={`Delete ${todo.text || `todo ${index + 1}`}`}
                size='small'
                onClick={() => removeTodo(index)}
                sx={{
                  color: 'text.secondary',
                  transition: 'color 120ms ease, opacity 120ms ease',
                  '&:hover': { color: 'error.main', bgcolor: 'transparent' },
                }}
              >
                <Close fontSize='small' />
              </IconButton>
            </Box>
          ))}
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
          <Button type='button' startIcon={<Add />} onClick={addTodo}>
            Add todo
          </Button>
          <Button
            type='button'
            color='error'
            startIcon={<DeleteOutline />}
            onClick={deleteTodoList}
          >
            Delete list
          </Button>
        </Box>
      </form>
    </Paper>
  )
}
