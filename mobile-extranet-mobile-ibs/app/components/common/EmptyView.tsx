import React from 'react';
import { useTheme } from '@shopify/restyle';
import Icon from '@expo/vector-icons/Ionicons';
import { Box, Text } from '../../theme/restyle';
import { Theme } from '../../theme/theme';

interface EmptyViewProps {
  message: string;
  icon?: string;
}

export const EmptyView: React.FC<EmptyViewProps> = ({ 
  message, 
  icon = 'folder-open-outline' 
}) => {
  const theme = useTheme<Theme>();
  return (
    <Box flex={1} alignItems="center" justifyContent="center" padding="xxl">
      <Box 
        backgroundColor="backgroundGray" 
        padding="xl" 
        borderRadius="round" 
        marginBottom="m"
      >
        <Icon 
          name={icon} 
          size={42} 
          color={theme.colors.textTertiary} 
        />
      </Box>
      <Text 
        variant="body" 
        color="textSecondary" 
        textAlign="center" 
        fontWeight="900" 
        textTransform="uppercase" 
        fontSize={13} 
        letterSpacing={1}
      >
        Aucune donnée
      </Text>
      <Text 
        variant="caption" 
        color="textTertiary" 
        textAlign="center" 
        marginTop="xs"
      >
        {message}
      </Text>
    </Box>
  );
};
