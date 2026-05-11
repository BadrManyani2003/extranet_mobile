import React from 'react';
import { useTheme } from '@shopify/restyle';
import { Ionicons as Icon } from '@expo/vector-icons';
import { Box, Text } from '../../theme/restyle';
import { Theme } from '../../theme/theme';
import { rsp } from '../../utils/responsive';
import Button from './Button';

interface ErrorViewProps {
  message: string;
  onRetry?: () => void;
}

export const ErrorView: React.FC<ErrorViewProps> = ({ message, onRetry }) => {
  const theme = useTheme<Theme>();
  return (
    <Box flex={1} alignItems="center" justifyContent="center" padding="xxl">
      <Box backgroundColor="errorBg" padding="xl" borderRadius="round" marginBottom="m">
        <Icon name="cloud-offline" size={48} color={theme.colors.error} />
      </Box>
      <Text variant="header" color="text" fontSize={rsp.normalize(22)}>Erreur Réseau</Text>
      <Text variant="bodySmall" color="textSecondary" marginTop="s" textAlign="center" marginBottom="xl">
        {message}
      </Text>
      {onRetry && (
        <Button 
          label="RÉESSAYER" 
          icon="refresh" 
          onPress={onRetry} 
          variant="outline" 
          size="small" 
          fullWidth={false}
        />
      )}
    </Box>
  );
};
