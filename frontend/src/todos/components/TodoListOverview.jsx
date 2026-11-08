import React from 'react'
import { Button, Card, CardContent, List, ListItemButton, ListItemIcon, ListItemText, Typography } from '@mui/material'
import ReceiptIcon from '@mui/icons-material/Receipt'

export const TodoListOverview = ({ todoLists, onSelect, onAdd, style }) => (
  <Card style={style}>
    <CardContent>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography component='h2'>My Todo Lists</Typography>
        <Button onClick={onAdd}>Add List</Button>
      </div>
      <List>
        {Object.values(todoLists).map((list) => (
          <ListItemButton key={list.id} onClick={() => onSelect(list.id)}>
            <ListItemIcon>
              <ReceiptIcon />
            </ListItemIcon>
            <ListItemText primary={list.title} />
          </ListItemButton>
        ))}
      </List>
    </CardContent>
  </Card>
)
