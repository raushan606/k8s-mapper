import React from 'react';
import { Node } from 'reactflow';
import { NodeData } from '../../types/kubernetes';
import {
  Paper,
  Typography,
  IconButton,
  Box,
  Divider,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface NodeDetailsPanelProps {
  node: Node<NodeData>;
  onClose: () => void;
}

export const NodeDetailsPanel: React.FC<NodeDetailsPanelProps> = ({
  node,
  onClose,
}) => {
  const { data } = node;

  return (
    <Paper
      elevation={2}
      sx={{
        position: 'absolute',
        top: 16,
        right: 16,
        width: 280,
        bgcolor: 'background.paper',
        borderRadius: 1,
      }}
    >
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography variant="subtitle1" component="h3">
          Node Details
        </Typography>
        <IconButton
          size="small"
          onClick={onClose}
          sx={{ color: 'text.secondary' }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>
      <Divider />
      <List dense>
        <ListItem>
          <ListItemText
            primary="Name"
            secondary={data.name}
            primaryTypographyProps={{ variant: 'caption', color: 'text.secondary' }}
            secondaryTypographyProps={{ variant: 'body2' }}
          />
        </ListItem>
        <ListItem>
          <ListItemText
            primary="Type"
            secondary={data.type}
            primaryTypographyProps={{ variant: 'caption', color: 'text.secondary' }}
            secondaryTypographyProps={{ variant: 'body2', sx: { textTransform: 'capitalize' } }}
          />
        </ListItem>
        <ListItem>
          <ListItemText
            primary="Namespace"
            secondary={data.namespace}
            primaryTypographyProps={{ variant: 'caption', color: 'text.secondary' }}
            secondaryTypographyProps={{ variant: 'body2' }}
          />
        </ListItem>
        {data.status && (
          <ListItem>
            <ListItemText
              primary="Status"
              secondary={data.status}
              primaryTypographyProps={{ variant: 'caption', color: 'text.secondary' }}
              secondaryTypographyProps={{ variant: 'body2' }}
            />
          </ListItem>
        )}
        {data.labels && Object.keys(data.labels).length > 0 && (
          <ListItem>
            <ListItemText
              primary="Labels"
              secondary={
                <Box component="span">
                  {Object.entries(data.labels).map(([key, value]) => (
                    <Box
                      key={key}
                      component="div"
                      sx={{ display: 'flex', gap: 0.5, fontSize: '0.875rem' }}
                    >
                      <Typography
                        component="span"
                        variant="body2"
                        color="text.secondary"
                      >
                        {key}:
                      </Typography>
                      <Typography component="span" variant="body2">
                        {value}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              }
              primaryTypographyProps={{ variant: 'caption', color: 'text.secondary' }}
            />
          </ListItem>
        )}
      </List>
    </Paper>
  );
}; 