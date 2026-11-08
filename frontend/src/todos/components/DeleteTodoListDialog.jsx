import React, { useState } from 'react'
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material'

// Open while `list` is set; asks for confirmation before deleting it.
export const DeleteTodoListDialog = ({ list, onClose, onDelete }) => {
  const [error, setError] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  const close = () => {
    if (isDeleting) return
    setError('')
    onClose()
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    setError('')

    try {
      await onDelete(list.id)
      onClose()
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Dialog open={Boolean(list)} onClose={close} fullWidth maxWidth='xs'>
      <DialogTitle>Delete todo list?</DialogTitle>
      <DialogContent>
        {error && <Alert severity='error'>{error}</Alert>}
        <Typography>{list?.title} and all of its todos will be permanently deleted.</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={close} disabled={isDeleting}>
          Cancel
        </Button>
        <Button color='error' onClick={handleDelete} disabled={isDeleting}>
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  )
}
