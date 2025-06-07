import React from 'react';
import { Handle, Position } from 'reactflow';
import { Paper, Typography, Box, Chip } from '@mui/material';
import { ResourceType } from '../../types/kubernetes';

const nodeTypeStyles: Record<ResourceType, { bgcolor: string; color: string; borderColor: string }> = {
    [ResourceType.NAMESPACE]: {
        bgcolor: '#F3F4F6',
        color: '#111827',
        borderColor: '#E5E7EB',
    },
    [ResourceType.POD]: {
        bgcolor: '#22C55E',
        color: '#fff',
        borderColor: '#16A34A',
    },
    [ResourceType.SERVICE]: {
        bgcolor: '#8B5CF6',
        color: '#fff',
        borderColor: '#7C3AED',
    },
    [ResourceType.DEPLOYMENT]: {
        bgcolor: '#0EA5E9',
        color: '#fff',
        borderColor: '#0369A1',
    },
    [ResourceType.INGRESS]: {
        bgcolor: '#F472B6',
        color: '#fff',
        borderColor: '#DB2777',
    },
    [ResourceType.REPLICASET]: {
        bgcolor: '#F59E42',
        color: '#fff',
        borderColor: '#EA580C',
    },
    [ResourceType.SECRETS]: {
      bgcolor: '#EDA',
      color: '#fff',
      borderColor: '#EA3873'
    },
    [ResourceType.CONFIGMAP]: {
      bgcolor: '#32E',
      color: '#fff',
      borderColor: '#DD3'
    }
};

interface CustomNodeProps {
    data: {
        name: string;
        type: ResourceType;
        status?: string;
        cpu?: string;
        ram?: string;
        role?: string;
    };
    selected?: boolean;
}

export const CustomNode: React.FC<CustomNodeProps> = ({ data, selected }) => {
    const style = nodeTypeStyles[data.type] || nodeTypeStyles[ResourceType.POD];

    return (
        <Paper
            elevation={selected ? 6 : 2}
            sx={{
                p: 2,
                minWidth: 170,
                borderRadius: 2,
                bgcolor: style.bgcolor,
                color: style.color,
                border: `2px solid ${selected ? style.borderColor : 'transparent'}`,
                boxShadow: selected ? '0 4px 24px 0 rgba(0,0,0,0.10)' : '0 1px 4px 0 rgba(0,0,0,0.06)',
                transition: 'all 0.2s',
                position: 'relative',
                textAlign: 'left',
            }}
        >
            <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />
            <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '1rem', color: style.color, mb: 0.5 }}>
                    {data.name}
                </Typography>
                <Typography variant="caption" sx={{ color: style.color, opacity: 0.85, fontWeight: 500, mb: 0.5, display: 'block' }}>
                    {data.type}
                </Typography>
                {data.status && (
                    <Chip
                        label={data.status}
                        size="small"
                        sx={{
                            bgcolor: '#fff',
                            color: style.bgcolor,
                            fontWeight: 700,
                            fontSize: '0.75rem',
                            height: 22,
                            borderRadius: 1,
                            mb: 0.5,
                        }}
                    />
                )}
                {(data.cpu || data.ram || data.role) && (
                    <Box sx={{ mt: 0.5 }}>
                        {data.cpu && (
                            <Typography variant="caption" sx={{ color: style.color, opacity: 0.8, mr: 1 }}>
                                CPU: {data.cpu}
                            </Typography>
                        )}
                        {data.ram && (
                            <Typography variant="caption" sx={{ color: style.color, opacity: 0.8, mr: 1 }}>
                                RAM: {data.ram}
                            </Typography>
                        )}
                        {data.role && (
                            <Typography variant="caption" sx={{ color: style.color, opacity: 0.8 }}>
                                {data.role}
                            </Typography>
                        )}
                    </Box>
                )}
            </Box>
            <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />
        </Paper>
    );
}; 