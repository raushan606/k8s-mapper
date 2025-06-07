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
        // Only reset loading state if we have new data
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
            <Box sx={{ width: '100%', height: '100%' }}>
                {/* Title and Namespace Context */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary', mr: 2 }}>
                        Cluster Topology
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                        {namespace ? namespace : 'default namespace'}
                    </Typography>
                    <Box sx={{ flex: 1 }} />
                    <IconButton color="primary" sx={{ mr: 1 }}>
                        <RefreshIcon />
                    </IconButton>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        sx={{
                            bgcolor: '#3ECF8E',
                            color: '#fff',
                            textTransform: 'none',
                            fontWeight: 600,
                            borderRadius: 2,
                            boxShadow: 'none',
                            px: 2.5,
                            '&:hover': { bgcolor: '#36b87c' },
                        }}
                    >
                        Deploy
                    </Button>
                </Box>
                {/* Topology Graph Card */}
                <Paper elevation={0} sx={{ p: 2, mb: 3, borderRadius: 3, border: '1px solid #E5E7EB', minHeight: 420, position: 'relative' }}>
                    <Box sx={{ width: '100%', height: 380, position: 'relative' }}>
                        <TopologyGraph 
                            initialData={initialData} 
                            namespace={namespace} 
                            onLoad={handleGraphLoad}
                        />
                    </Box>
                </Paper>
                {/* Cards below the graph */}
                <Grid container spacing={2}>
                    <Grid size={{xs:12, md:4}}>
                        <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: '1px solid #E5E7EB', minHeight: 120 }}>
                            <Typography variant="subtitle2" sx={{ color: 'text.secondary', fontWeight: 600, mb: 1 }}>
                                Cluster Health
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'text.primary' }}>3/3 Ready</Typography>
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>28/30 Running</Typography>
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>12 Active</Typography>
                        </Paper>
                    </Grid>
                    <Grid size={{xs:12, md:4}}>
                        <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: '1px solid #E5E7EB', minHeight: 120 }}>
                            <Typography variant="subtitle2" sx={{ color: 'text.secondary', fontWeight: 600, mb: 1 }}>
                                Resource Usage
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'text.primary' }}>CPU 67%</Typography>
                            <Typography variant="body2" sx={{ color: 'text.primary' }}>Memory 54%</Typography>
                            <Typography variant="body2" sx={{ color: 'text.primary' }}>Storage 32%</Typography>
                        </Paper>
                    </Grid>
                    <Grid size={{xs:12, md:4}}>
                        <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: '1px solid #E5E7EB', minHeight: 120 }}>
                            <Typography variant="subtitle2" sx={{ color: 'text.secondary', fontWeight: 600, mb: 1 }}>
                                Recent Events
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'text.primary' }}>Pod Created</Typography>
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>Service Updated</Typography>
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>Node Warning</Typography>
                        </Paper>
                    </Grid>
                </Grid>
            </Box>
        </>
    );
}; 