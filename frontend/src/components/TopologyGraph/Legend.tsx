import React from 'react';
import { Paper, Typography, Box, List, ListItem } from '@mui/material';
import { ResourceType } from '../../types/kubernetes';

const nodeStyles = {
  [ResourceType.NAMESPACE]: {
    borderColor: '#3ECF8E',
    bgcolor: 'rgba(62, 207, 142, 0.1)',
  },
  [ResourceType.POD]: {
    borderColor: '#24B47E',
    bgcolor: 'rgba(36, 180, 126, 0.1)',
  },
  [ResourceType.SERVICE]: {
    borderColor: '#3ECF8E',
    bgcolor: 'rgba(62, 207, 142, 0.1)',
  },
  [ResourceType.DEPLOYMENT]: {
    borderColor: '#24B47E',
    bgcolor: 'rgba(36, 180, 126, 0.1)',
  },
  [ResourceType.INGRESS]: {
    borderColor: '#3ECF8E',
    bgcolor: 'rgba(62, 207, 142, 0.1)',
  },
  [ResourceType.REPLICASET]: {
    borderColor: '#24B47E',
    bgcolor: 'rgba(36, 180, 126, 0.1)',
  },
};

export const Legend: React.FC = () => {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 1.5,
        minWidth: 200,
        bgcolor: 'rgba(42, 42, 42, 0.8)',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(62, 207, 142, 0.2)',
      }}
    >
      <Typography
        variant="subtitle2"
        sx={{
          fontWeight: 600,
          color: 'text.primary',
          mb: 1,
          fontSize: '0.875rem',
        }}
      >
        Resource Types
      </Typography>
      <List dense disablePadding>
        {Object.entries(nodeStyles).map(([type, style]) => (
          <ListItem
            key={type}
            sx={{
              py: 0.5,
              px: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <Box
              sx={{
                width: 10,
                height: 10,
                borderRadius: '2px',
                border: '1px solid',
                borderColor: style.borderColor,
                bgcolor: style.bgcolor,
              }}
            />
            <Typography
              variant="caption"
              sx={{
                color: 'text.secondary',
                textTransform: 'capitalize',
                fontSize: '0.75rem',
                fontWeight: 500,
              }}
            >
              {type.toLowerCase()}
            </Typography>
          </ListItem>
        ))}
      </List>
    </Paper>
  );
}; 