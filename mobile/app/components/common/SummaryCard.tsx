import React from 'react';
import { Platform } from 'react-native';
import { useTheme } from '@shopify/restyle';
import { Ionicons as Icon } from '@expo/vector-icons';
import { Box, Text } from '../../theme/restyle';
import { Theme, shadows } from '../../theme/theme';
import { rsp } from '../../utils/responsive';

interface SummaryCardProps {
  title: string;
  subtitle: string;
  icon: string;
  amount: string;
  amountLabel: string;
  variant?: 'primary' | 'error' | 'success' | 'warning';
}

const SummaryCard: React.FC<SummaryCardProps> = ({ 
  title, 
  subtitle, 
  icon, 
  amount, 
  amountLabel, 
  variant = 'primary' 
}) => {
  const theme = useTheme<Theme>();

  const colorMap = {
    primary: { main: 'primary', bg: 'primaryBg' },
    error:   { main: 'error', bg: 'errorBg' },
    success: { main: 'success', bg: 'successBg' },
    warning: { main: 'warning', bg: 'warningBg' },
  } as const;

  const active = colorMap[variant] || colorMap.primary;

  return (
    <Box 
      padding="l" 
      borderRadius="xl" 
      backgroundColor="cardBackground" 
      style={shadows.medium}
    >
       <Box flexDirection="row" justifyContent="space-between" alignItems="flex-start" marginBottom="l">
          <Box flex={1}>
            <Text variant="premiumLabel" color="textTertiary" marginBottom="xxs">{title}</Text>
            <Text variant="subheader" fontSize={rsp.normalize(20)} numberOfLines={1}>{subtitle}</Text>
          </Box>
          <Box 
            width={48} 
            height={48} 
            borderRadius="l" 
            backgroundColor={active.bg as keyof Theme['colors']} 
            alignItems="center" 
            justifyContent="center"
          >
            <Icon 
              name={icon as any} 
              size={24} 
              color={theme.colors[active.main as keyof Theme['colors']]} 
            />
          </Box>
       </Box>
       
       <Box 
         flexDirection="row" 
         justifyContent="space-between" 
         alignItems="center"
         marginTop="s"
       >
          <Box>
            <Text variant="header" color="primary" fontSize={rsp.normalize(28)}>
              {amount}
            </Text>
            <Text variant="caption" color="textTertiary" fontWeight="600">
              {amountLabel}
            </Text>
          </Box>
          <Box backgroundColor="primary" width={32} height={32} borderRadius="m" alignItems="center" justifyContent="center" style={shadows.small}>
             <Icon name="chevron-forward" size={18} color="white" />
          </Box>
       </Box>
    </Box>
  );
};

export default SummaryCard;
