import React from 'react';
import { Platform } from 'react-native';
import { useTheme } from '@shopify/restyle';
import { Ionicons as Icon } from '@expo/vector-icons';
import { Box, Text } from '../../theme/restyle';
import { Theme } from '../../theme/theme';
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
      borderWidth={1}
      borderColor="borderLight"
      style={Platform.select({ 
        ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.05, shadowRadius: 20 }, 
        android: { elevation: 4 },
        web: { boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }
      })}
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
          <Box backgroundColor="primaryBg" paddingHorizontal="s" paddingVertical="xxs" borderRadius="round">
             <Icon name="arrow-forward" size={16} color={theme.colors.primary} />
          </Box>
       </Box>
    </Box>
  );
};

export default SummaryCard;
