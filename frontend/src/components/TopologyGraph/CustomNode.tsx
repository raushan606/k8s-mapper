import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Box, Typography, Paper, useTheme } from '@mui/material';
import { ResourceType } from '../../types/kubernetes';

const CustomNode = ({ data }: NodeProps) => {
  const theme = useTheme();

  const getNodeColor = (type: ResourceType) => {
    switch (type) {
      case ResourceType.NAMESPACE:
        return '#6366F1';
      case ResourceType.POD:
        return '#10B981';
      case ResourceType.SERVICE:
        return '#F59E0B';
      case ResourceType.DEPLOYMENT:
        return '#EC4899';
      case ResourceType.INGRESS:
        return '#8B5CF6';
      case ResourceType.REPLICASET:
        return '#3B82F6';
      case ResourceType.SECRETS:
        return '#EF4444';
      case ResourceType.CONFIGMAP:
        return '#6B7280';
      default:
        return '#6B7280';
    }
  };

  const getNodeIcon = (type: ResourceType) => {
    switch (type) {
      case ResourceType.NAMESPACE:
        return '📁';
      case ResourceType.POD:
        return '📦';
      case ResourceType.SERVICE:
        return '🔌';
      case ResourceType.DEPLOYMENT:
        return '🚀';
      case ResourceType.INGRESS:
        return '🌐';
      case ResourceType.REPLICASET:
        return '🔄';
      case ResourceType.SECRETS:
        return '🔒';
      case ResourceType.CONFIGMAP:
        return '⚙️';
      case ResourceType.PVC:
        return '🫙'
      case ResourceType.PV:
        return '💾'
      default:
        return '❓';
    }
  };

  return (
    <Paper
      elevation={2}
      sx={{
        padding: 2,
        minWidth: 180,
        backgroundColor: theme.palette.background.paper,
        border: '1px solid #E5E7EB',
        borderRadius: 2,
        '&:hover': {
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        },
      }}
    >
      <Handle
        type="target"
        position={Position.Left}
        style={{
          width: 8,
          height: 8,
          background: '#E5E7EB',
          border: '2px solid white',
        }}
      />
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          mb: 1,
        }}
      >
        <Box
          sx={{
            width: 24,
            height: 24,
            borderRadius: '50%',
            backgroundColor: getNodeColor(data.type),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '14px',
          }}
        >
          {getNodeIcon(data.type)}
        </Box>
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 600,
            color: 'text.primary',
          }}
        >
          {data.name}
        </Typography>
      </Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 0.5,
        }}
      >
        <Typography
          variant="caption"
          sx={{
            color: 'text.secondary',
            fontSize: '0.75rem',
          }}
        >
          Type: {data.type}
        </Typography>
        {data.namespace && (
          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary',
              fontSize: '0.75rem',
            }}
          >
            Namespace: {data.namespace}
          </Typography>
        )}
        {data.connections && (
          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary',
              fontSize: '0.75rem',
            }}
          >
            Connections: {data.connections.length}
          </Typography>
        )}
      </Box>
      <Handle
        type="source"
        position={Position.Right}
        style={{
          width: 8,
          height: 8,
          background: '#E5E7EB',
          border: '2px solid white',
        }}
      />
    </Paper>
  );
};

export default memo(CustomNode); 