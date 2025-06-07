import React from 'react';
import { Box, Typography, keyframes, Theme } from '@mui/material';
import { styled } from '@mui/material/styles';

const pulse = keyframes`
  0% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(62, 207, 142, 0.7);
  }
  
  70% {
    transform: scale(1);
    box-shadow: 0 0 0 10px rgba(62, 207, 142, 0);
  }
  
  100% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(62, 207, 142, 0);
  }
`;

const LoadingDot = styled(Box)(({ theme }) => ({
  width: 12,
  height: 12,
  borderRadius: '50%',
  backgroundColor: '#3ECF8E',
  animation: `${pulse} 1.5s ease-in-out infinite`,
  margin: '0 4px',
}));

const LoadingContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(5px)',
  zIndex: 9999,
}));

const DotsContainer = styled(Box)(({ theme }: { theme: Theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginTop: theme.spacing(2),
}));

interface LoadingScreenProps {
  message?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = 'Loading topology...' 
}) => {
  return (
    <LoadingContainer>
      <Typography 
        variant="h5" 
        sx={{ 
          color: 'text.primary',
          fontWeight: 600,
          mb: 2
        }}
      >
        {message}
      </Typography>
      <DotsContainer>
        <LoadingDot style={{ animationDelay: '0s' }} />
        <LoadingDot style={{ animationDelay: '0.2s' }} />
        <LoadingDot style={{ animationDelay: '0.4s' }} />
      </DotsContainer>
    </LoadingContainer>
  );
}; 