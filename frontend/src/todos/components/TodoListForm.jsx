import React, { useState } from 'react'
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

export const TodoListForm = ({ todoList, saveTodoList, deleteTodoList }) => {
  const [title, setTitle] = useState(todoList.title)
  const [todos, setTodos] = useState(todoList.todos)
  const [error, setError] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const changeTodo = (index, text) => {
    setTodos(todos.map((todo, i) => (i === index ? text : todo)))
  }

  const removeTodo = (index) => {
    setTodos(todos.filter((todo, i) => i !== index))
  }

  const addTodo = () => {
    setTodos([...todos, ''])
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setIsSaving(true)
    setError('')

    try {
      await saveTodoList(todoList.id, { title: title.trim(), todos })
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card sx={{ margin: '0 1rem' }}>
      <CardContent>
        <Typography component='h2' sx={{ marginBottom: '1rem' }}>
          Edit Todo List
        </Typography>
        {error && <Alert severity='error'>{error}</Alert>}
        <form
          onSubmit={handleSubmit}
          style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}
        >
          <TextField
            required
            label='List title'
            value={title}
            onChange={(event) => setTitle(event.target.value)}
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
                disabled={isSaving}
              />
              <Button
                type='button'
                sx={{ margin: '8px' }}
                size='small'
                color='secondary'
                disabled={isSaving}
                onClick={() => removeTodo(index)}
              >
                <DeleteIcon />
              </Button>
            </div>
          ))}
          <CardActions>
            <Button type='button' color='primary' disabled={isSaving} onClick={addTodo}>
              Add Todo <AddIcon />
            </Button>
            <Button type='submit' variant='contained' color='primary' disabled={isSaving}>
              Save
            </Button>
            <Button
              type='button'
              color='error'
              disabled={isSaving}
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
