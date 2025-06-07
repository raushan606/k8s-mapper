import React from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  Tooltip,
  Chip,
  Badge,
} from '@mui/material';
import FolderIcon from '@mui/icons-material/Folder';
import StorageIcon from '@mui/icons-material/Storage';
import DnsIcon from '@mui/icons-material/Dns';
import CloudQueueIcon from '@mui/icons-material/CloudQueue';
import SettingsEthernetIcon from '@mui/icons-material/SettingsEthernet';
import ListAltIcon from '@mui/icons-material/ListAlt';

interface Namespace {
  id: string;
  name: string;
  podCount?: number;
  color?: string;
}

interface SidebarProps {
  namespaces: Namespace[];
  selectedNamespace: string | null;
  onNamespaceSelect: (namespaceId: string | null) => void;
}

const resources = [
  { label: 'Nodes', icon: <StorageIcon fontSize="small" sx={{ color: '#A3A3A3' }} /> },
  { label: 'Pods', icon: <DnsIcon fontSize="small" sx={{ color: '#A3A3A3' }} /> },
  { label: 'Services', icon: <CloudQueueIcon fontSize="small" sx={{ color: '#A3A3A3' }} /> },
  { label: 'ConfigMaps', icon: <ListAltIcon fontSize="small" sx={{ color: '#A3A3A3' }} /> },
  { label: 'Ingress', icon: <SettingsEthernetIcon fontSize="small" sx={{ color: '#A3A3A3' }} /> },
];

export const Sidebar: React.FC<SidebarProps> = ({
  namespaces,
  selectedNamespace,
  onNamespaceSelect,
}) => {
  return (
    <Box sx={{ p: 2, width: 240, bgcolor: 'background.paper', height: '100vh', borderRight: 1, borderColor: 'divider' }}>
      {/* NAMESPACES SECTION */}
      <Typography
        variant="subtitle2"
        sx={{
          color: 'text.secondary',
          mb: 1,
          px: 2,
          fontSize: '0.75rem',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
        }}
      >
        NAMESPACES
      </Typography>
      <List dense disablePadding>
        <ListItem disablePadding>
          <ListItemButton
            selected={selectedNamespace === null}
            onClick={() => onNamespaceSelect(null)}
            sx={{
              borderRadius: 1,
              mb: 0.5,
              '&.Mui-selected': {
                bgcolor: 'rgba(62, 207, 142, 0.1)',
                '&:hover': {
                  bgcolor: 'rgba(62, 207, 142, 0.15)',
                },
              },
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.05)',
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 36 }}>
              <FolderIcon sx={{ color: selectedNamespace === null ? '#3ECF8E' : 'text.secondary', fontSize: '1.25rem' }} />
            </ListItemIcon>
            <ListItemText
              primary={
                <Typography
                  sx={{
                    fontSize: '0.875rem',
                    fontWeight: selectedNamespace === null ? 600 : 400,
                    color: selectedNamespace === null ? 'text.primary' : 'text.secondary',
                  }}
                >
                  All Namespaces
                </Typography>
              }
            />
          </ListItemButton>
        </ListItem>
        {namespaces.map((namespace) => (
          <ListItem key={namespace.id} disablePadding>
            <Tooltip title={namespace.name} placement="right">
              <ListItemButton
                selected={selectedNamespace === namespace.id}
                onClick={() => onNamespaceSelect(namespace.id)}
                sx={{
                  borderRadius: 1,
                  mb: 0.5,
                  color: 'text.primary',
                  '&.Mui-selected': {
                    bgcolor: 'rgba(62, 207, 142, 0.1)',
                    '&:hover': {
                      bgcolor: 'rgba(62, 207, 142, 0.15)',
                    },
                  },
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.05)',
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <Box
                    sx={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      bgcolor: namespace.color || '#3ECF8E',
                      mr: 1.5,
                      border: selectedNamespace === namespace.id ? '2px solid #3ECF8E' : '2px solid transparent',
                    }}
                  />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography
                      sx={{
                        fontSize: '0.875rem',
                        fontWeight: selectedNamespace === namespace.id ? 600 : 400,
                        color: selectedNamespace === namespace.id ? 'text.primary' : 'text.secondary',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {namespace.name}
                    </Typography>
                  }
                />
                {namespace.podCount !== undefined && (
                  <Chip
                    label={`${namespace.podCount} pods`}
                    size="small"
                    sx={{
                      ml: 1,
                      bgcolor: 'rgba(62, 207, 142, 0.08)',
                      color: '#3ECF8E',
                      fontWeight: 600,
                      fontSize: '0.75rem',
                      height: 22,
                      borderRadius: 1,
                    }}
                  />
                )}
              </ListItemButton>
            </Tooltip>
          </ListItem>
        ))}
      </List>
      <Divider sx={{ my: 2, borderColor: 'rgba(62, 207, 142, 0.2)' }} />
      {/* RESOURCES SECTION */}
      <Typography
        variant="subtitle2"
        sx={{
          color: 'text.secondary',
          mb: 1,
          px: 2,
          fontSize: '0.75rem',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
        }}
      >
        RESOURCES
      </Typography>
      <List dense disablePadding>
        {resources.map((resource) => (
          <ListItem key={resource.label} disablePadding>
            <ListItemButton sx={{ borderRadius: 1, mb: 0.5 }}>
              <ListItemIcon sx={{ minWidth: 36 }}>{resource.icon}</ListItemIcon>
              <ListItemText
                primary={
                  <Typography sx={{ fontSize: '0.875rem', color: 'text.secondary', fontWeight: 500 }}>
                    {resource.label}
                  </Typography>
                }
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );
}; 