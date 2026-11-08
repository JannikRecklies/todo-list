import { useEffect, useState } from 'react'
import {
  createTodoList,
  deleteTodoList,
  getTodoLists,
  saveTodoList,
} from './api'

// Holds all todo lists plus the selected one, and keeps them in sync with the server.
// The create/save/delete functions throw when the request fails, so the caller can show the error.
export const useTodoLists = () => {
  const [todoLists, setTodoLists] = useState({})
  const [activeListId, setActiveListId] = useState()
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    let isMounted = true

    getTodoLists()
      .then((lists) => {
        if (!isMounted) return
        setTodoLists(lists)
        setActiveListId(Object.keys(lists)[0])
      })
      .catch((error) => {
        if (isMounted) setLoadError(error.message)
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

  const createList = async (title) => {
    const createdList = await createTodoList(title)
    setTodoLists((lists) => ({ ...lists, [createdList.id]: createdList }))
    setActiveListId(createdList.id)
  }

  const saveList = async (id, changes) => {
    const savedList = await saveTodoList(id, changes)
    setTodoLists((lists) => ({ ...lists, [id]: savedList }))
  }

  const deleteList = async (id) => {
    await deleteTodoList(id)

    const remainingLists = { ...todoLists }
    delete remainingLists[id]
    setTodoLists(remainingLists)

    if (activeListId === id) setActiveListId(Object.keys(remainingLists)[0])
  }

  return {
    todoLists,
    activeList: todoLists[activeListId],
    isLoading,
    loadError,
    selectList: setActiveListId,
    createList,
    saveList,
    deleteList,
  }
}
