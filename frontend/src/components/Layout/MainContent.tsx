import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Divider, Button, IconButton, Alert } from '@mui/material';
import Grid from '@mui/material/Grid';
import RefreshIcon from '@mui/icons-material/Refresh';
import AddIcon from '@mui/icons-material/Add';
import { TopologyGraph } from '../TopologyGraph/TopologyGraph';
import { TopologyData } from '../../types/kubernetes';
import { LoadingScreen } from '../LoadingScreen/LoadingScreen';

interface MainContentProps {
    namespace?: string | null;
    initialData: TopologyData;
    isLoading?: boolean;
    error?: string | null;
}

export const MainContent: React.FC<MainContentProps> = ({ 
    namespace, 
    initialData, 
    isLoading = false,
    error = null 
}) => {
    const [isGraphLoading, setIsGraphLoading] = useState(true);

    useEffect(() => {
        if (initialData && initialData.nodes.length > 0) {
            setIsGraphLoading(true);
        }
    }, [initialData]);

    const handleGraphLoad = () => {
        setIsGraphLoading(false);
    };

    if (error) {
        return (
            <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Alert severity="error" sx={{ maxWidth: 400 }}>
                    {error}
                </Alert>
            </Box>
        );
    }

    return (
        <>
            {(isLoading || isGraphLoading) && <LoadingScreen message={isLoading ? "Loading data..." : "Rendering topology..."} />}
            <Box 
                sx={{
                    width: '100%', 
                    height: '100%', 
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column'
                }}
            >
                {/* Title and Namespace Context */}
                <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    p: 2,
                    gap: 2,
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    zIndex: 1,
                    background: 'linear-gradient(to bottom, rgba(31,41,55,0.9) 0%, rgba(31,41,55,0) 100%)',
                    pointerEvents: 'none'
                }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500, textAlign: 'center', width: '100%' }}>
                        {namespace ? namespace : 'All Namespace'}
                    </Typography>
                    <Box sx={{ flex: 1 }} />
                </Box>

                {/* Topology Graph - Full Size */}
                <Box sx={{ width: '100%', flex: 1, position: 'relative' }}>
                    <TopologyGraph 
                        initialData={initialData} 
                        namespace={namespace} 
                        onLoad={handleGraphLoad}
                    />
                </Box>

                {/* Info Cards Overlay */}
                
            </Box>
        </>
    );
}; 