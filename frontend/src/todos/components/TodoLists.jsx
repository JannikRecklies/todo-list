import React, { Fragment, useState } from 'react'
import { Alert, CircularProgress } from '@mui/material'
import { useTodoLists } from '../useTodoLists'
import { TodoListOverview } from './TodoListOverview'
import { TodoListForm } from './TodoListForm'
import { CreateTodoListDialog } from './CreateTodoListDialog'
import { DeleteTodoListDialog } from './DeleteTodoListDialog'

export const TodoLists = ({ style }) => {
  const {
    todoLists,
    activeList,
    isLoading,
    loadError,
    selectList,
    createList,
    saveList,
    deleteList,
  } = useTodoLists()
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [listToDelete, setListToDelete] = useState(null)

  if (isLoading) {
    return <CircularProgress sx={{ alignSelf: 'center', margin: '2rem' }} />
  }

  return (
    <Fragment>
      {loadError && (
        <Alert severity='error' sx={{ margin: '1rem' }}>
          {loadError}
        </Alert>
      )}
      <TodoListOverview
        todoLists={todoLists}
        onSelect={selectList}
        onAdd={() => setIsCreateDialogOpen(true)}
        style={style}
      />
      {activeList && (
        <TodoListForm
          key={activeList.id} // use key to make React recreate component to reset internal state
          todoList={activeList}
          saveTodoList={saveList}
          deleteTodoList={() => setListToDelete(activeList)}
        />
      )}
      <CreateTodoListDialog
        open={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onCreate={createList}
      />
      <DeleteTodoListDialog
        list={listToDelete}
        onClose={() => setListToDelete(null)}
        onDelete={deleteList}
      />
    </Fragment>
  )
}
