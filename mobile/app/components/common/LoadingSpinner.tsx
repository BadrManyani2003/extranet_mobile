import React from 'react';
import { ActivityIndicator } from 'react-native';
import { useTheme } from '@shopify/restyle';
import { Box, Text } from '../../theme/restyle';
import { Theme } from '../../theme/theme';

interface LoadingSpinnerProps {
  message?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message }) => {
  const theme = useTheme<Theme>();
  return (
    <Box flex={1} alignItems="center" justifyContent="center" padding="xl">
      <ActivityIndicator size="large" color={theme.colors.primary} />
      {message && (
        <Text 
          variant="caption" 
          marginTop="m" 
          textAlign="center" 
          color="textTertiary" 
          letterSpacing={1.2} 
          fontWeight="700" 
          textTransform="uppercase"
        >
          {message}
        </Text>
      )}
    </Box>
  );
};
