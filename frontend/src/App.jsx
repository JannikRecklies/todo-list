import React, { useState } from 'react'
import { AppBar, IconButton, Toolbar, Typography, useMediaQuery, useTheme } from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import { TodoLists } from './todos/components/TodoLists'

const MainAppBar = ({ onOpenNavigation, isMobile }) => {
  return (
    <AppBar
      position='static'
      elevation={0}
      sx={{ bgcolor: 'primary.main', color: 'primary.contrastText' }}
    >
      <Toolbar sx={{ minHeight: 64 }}>
        {isMobile && (
          <IconButton
            edge='start'
            color='inherit'
            aria-label='Open lists'
            onClick={onOpenNavigation}
            sx={{ mr: 1 }}
          >
            <MenuIcon />
          </IconButton>
        )}
        <Typography variant='h6' component='h1' sx={{ fontWeight: 700, letterSpacing: '-0.03em' }}>
          Things to do
        </Typography>
      </Toolbar>
    </AppBar>
  )
}

const App = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [isNavigationOpen, setIsNavigationOpen] = useState(false)

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <MainAppBar
        isMobile={isMobile}
        onOpenNavigation={() => setIsNavigationOpen(true)}
      />
      <TodoLists
        isNavigationOpen={isNavigationOpen}
        onCloseNavigation={() => setIsNavigationOpen(false)}
      />
    </div>
  )
}

export default App
