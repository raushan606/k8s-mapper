import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  InputBase,
  IconButton,
  Button,
  Avatar,
  Paper,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import AddIcon from '@mui/icons-material/Add';

interface TopBarProps {
  onRefresh: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onRefresh }) => {
  return (
    <AppBar position="static" elevation={0} sx={{ bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider', zIndex: 1201 }}>
      <Toolbar sx={{ minHeight: 64, px: 3, display: 'flex', justifyContent: 'space-between' }}>
        {/* Logo/Name */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box 
            component="img"
            src="/letter-k.png"
            alt="K Logo"
            sx={{ 
              width: 32, 
              height: 32, 
              objectFit: 'contain',
              mr: 1 
            }}
          />
          <Typography variant="h6" sx={{ color: 'text.primary', fontWeight: 700, fontSize: '1.1rem', letterSpacing: 0.5 }}>
            Kubernetes Topology
          </Typography>
        </Box>
        {/* Search Bar */}
        {/* <Paper
          component="form"
          sx={{
            p: '2px 8px',
            display: 'flex',
            alignItems: 'center',
            width: 340,
            boxShadow: 'none',
            border: '1px solid #E5E7EB',
            borderRadius: 2,
            bgcolor: 'background.default',
          }}
        >
          <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />
          <InputBase
            sx={{ ml: 1, flex: 1, fontSize: '0.95rem' }}
            placeholder="Search nodes, pods, services..."
            inputProps={{ 'aria-label': 'search' }}
          />
        </Paper> */}
        {/* Actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <IconButton 
            color="primary" 
            sx={{ 
              bgcolor: 'background.default', 
              border: '1px solid #E5E7EB', 
              mr: 1,
              '&:hover': {
                bgcolor: 'rgba(62, 207, 142, 0.1)',
              }
            }}
            onClick={onRefresh}
          >
            <RefreshIcon />
          </IconButton>
          {/* <Button
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
          </Button> */}
          <Avatar
            alt="User"
            src="https://avatars.githubusercontent.com/u/25031628?v=4"
            sx={{ width: 36, height: 36, ml: 2 }}
          />
        </Box>
      </Toolbar>
    </AppBar>
  );
}; 