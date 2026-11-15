import React, { Fragment, useState } from 'react'
import { Alert, Box, CircularProgress, Drawer, Typography } from '@mui/material'
import { useTodoLists } from '../useTodoLists'
import { TodoListOverview } from './TodoListOverview'
import { TodoListForm } from './TodoListForm'
import { CreateTodoListDialog } from './CreateTodoListDialog'
import { DeleteTodoListDialog } from './DeleteTodoListDialog'
import { useMediaQuery, useTheme } from '@mui/material'

export const TodoLists = ({ isNavigationOpen, onCloseNavigation }) => {
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
  const [isCreatePending, setIsCreatePending] = useState(false)
  const [listToDelete, setListToDelete] = useState(null)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  if (isLoading) {
    return (
      <Box sx={{ display: 'grid', flex: 1, placeItems: 'center' }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Fragment>
      {loadError && (
        <Alert severity='error' sx={{ m: 2 }}>
          {loadError}
        </Alert>
      )}
      <Box sx={{ display: 'flex', flex: 1, minHeight: 0 }}>
        <Drawer
          variant={isMobile ? 'temporary' : 'permanent'}
          open={isMobile ? isNavigationOpen : true}
          onClose={onCloseNavigation}
          ModalProps={{ keepMounted: true }}
          SlideProps={{
            onExited: () => {
              if (isCreatePending) {
                setIsCreatePending(false)
                setIsCreateDialogOpen(true)
              }
            },
          }}
          sx={{
            width: 280,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: 280,
              boxSizing: 'border-box',
              position: isMobile ? 'fixed' : 'relative',
              borderRight: 1,
              borderColor: 'divider',
              bgcolor: 'background.paper',
            },
          }}
        >
          <TodoListOverview
            todoLists={todoLists}
            activeListId={activeList?.id}
            onSelect={(id) => {
              selectList(id)
              onCloseNavigation()
            }}
            onAdd={() => {
              if (isMobile) {
                setIsCreatePending(true)
                onCloseNavigation()
              } else {
                setIsCreateDialogOpen(true)
              }
            }}
          />
        </Drawer>
        <Box
          component='main'
          sx={{
            flex: 1,
            minWidth: 0,
            p: { xs: 2, sm: 3, md: 5 },
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-start',
          }}
        >
          {activeList ? (
            <TodoListForm
              key={activeList.id}
              todoList={activeList}
              saveTodoList={saveList}
              deleteTodoList={() => setListToDelete(activeList)}
            />
          ) : (
            <Box sx={{ m: 'auto', textAlign: 'center', color: 'text.secondary' }}>
              <Typography variant='h6' color='text.primary' sx={{ mb: 0.5 }}>
                No lists yet
              </Typography>
              <Typography>Create a list to get started.</Typography>
            </Box>
          )}
        </Box>
      </Box>
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
