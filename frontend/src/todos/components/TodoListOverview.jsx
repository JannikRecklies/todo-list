import React from 'react'
import { Add, Check } from '@mui/icons-material'
import { Box, Button, List, ListItemButton, ListItemText, Typography } from '@mui/material'

export const TodoListOverview = ({ todoLists, activeListId, onSelect, onAdd }) => (
  <Box sx={{ p: 2, pt: 3 }}>
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 1, mb: 1.5 }}>
      <Typography variant='overline' sx={{ color: 'text.secondary', fontWeight: 700, letterSpacing: '0.1em' }}>
        Your lists
      </Typography>
      <Button
        size='small'
        startIcon={<Add />}
        onClick={onAdd}
        sx={{ minWidth: 0, px: 1, color: 'text.secondary' }}
      >
        Add
      </Button>
    </Box>
    <List disablePadding>
      {Object.values(todoLists).map((list) => {
        const selected = list.id === activeListId
        return (
          <ListItemButton
            key={list.id}
            selected={selected}
            onClick={() => onSelect(list.id)}
            sx={{
              minHeight: 46,
              mb: 0.5,
              px: 1.5,
              borderRadius: 1.5,
              color: selected ? 'primary.contrastText' : 'text.primary',
              '&.Mui-selected': {
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                '&:hover': { bgcolor: 'primary.dark' },
              },
            }}
          >
            <ListItemText
              primary={list.title}
              primaryTypographyProps={{ noWrap: true, fontWeight: selected ? 600 : 500 }}
            />
            {selected && <Check sx={{ ml: 1, fontSize: 18 }} aria-hidden='true' />}
          </ListItemButton>
        )
      })}
    </List>
  </Box>
)
