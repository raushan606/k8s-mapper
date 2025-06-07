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
    Chip
} from '@mui/material';
import FolderIcon from '@mui/icons-material/Folder';
import StorageIcon from '@mui/icons-material/Storage';
import DnsIcon from '@mui/icons-material/Dns';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
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
        <Box 
            sx={{ 
                width: 250,
                height: '100vh',
                bgcolor: 'background.paper',
                borderRight: 2,
                borderColor: 'divider',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
            }}
        >
            <Box sx={{ p: 2, flex: 1, overflow: 'auto' }}>
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
                                        <AccountTreeIcon sx={{ color: namespace.color || '#3ECF8E' }} />
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
                                                {namespace.id}
                                            </Typography>
                                        }
                                    />
                                    {namespace.podCount !== undefined && (
                                        <Chip
                                            label={`${namespace.podCount} pods`}
                                            size="small"
                                            onClick={() => onNamespaceSelect(namespace.id)}
                                            sx={{
                                                ml: 0,
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
            </Box>
        </Box>
    );
}; 