import React, { ReactNode } from 'react';
import { Box, Paper } from '@mui/material';
import { TopBar } from './TopBar';

interface MainLayoutProps {
    children: [ReactNode, ReactNode]; // [Sidebar, MainContent]
    onRefresh: () => void;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children, onRefresh }) => {
    const [sidebar, mainContent] = children;

    return (
        <Box sx={{ height: '100vh', bgcolor: 'background.default', display: 'flex', flexDirection: 'column' }}>
            {/* TopBar */}
            <TopBar onRefresh={onRefresh} />
            {/* Main area: Sidebar + Content */}
            <Box sx={{ display: 'flex', flex: 1, minHeight: 0 }}>
                {/* Sidebar */}
                <Paper
                    elevation={0}
                    sx={{
                        width: 240,
                        borderRight: 1,
                        borderColor: 'divider',
                        bgcolor: 'background.paper',
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                >
                    {sidebar}
                </Paper>
                {/* Main Canvas */}
                <Box
                    sx={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                        bgcolor: 'background.default',
                    }}
                >
                    {mainContent}
                </Box>
            </Box>
        </Box>
    );
};