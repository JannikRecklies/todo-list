import React, { useState } from 'react'
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material'

export const CreateTodoListDialog = ({ open, onClose, onCreate }) => {
  const [title, setTitle] = useState('')
  const [error, setError] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  const close = () => {
    if (!isCreating) onClose()
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setIsCreating(true)
    setError('')

    try {
      await onCreate(title.trim())
      setTitle('')
      onClose()
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <Dialog open={open} onClose={close} fullWidth maxWidth='xs'>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Create a todo list</DialogTitle>
        <DialogContent>
          {error && <Alert severity='error'>{error}</Alert>}
          <TextField
            autoFocus
            required
            fullWidth
            margin='dense'
            label='List title'
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button type='button' onClick={close} disabled={isCreating}>
            Cancel
          </Button>
          <Button type='submit' disabled={isCreating || !title.trim()}>
            Create
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}
