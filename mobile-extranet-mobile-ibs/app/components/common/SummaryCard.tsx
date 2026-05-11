import React from 'react';
import { Platform } from 'react-native';
import { useTheme } from '@shopify/restyle';
import Icon from '@expo/vector-icons/Ionicons';
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
      marginHorizontal="l" 
      padding="m" 
      borderRadius="m" 
      backgroundColor="cardBackground" 
      borderWidth={1}
      borderColor="border"
      style={Platform.select({ 
        ios: { 
          shadowColor: '#000', 
          shadowOffset: { width: 0, height: 1 }, 
          shadowOpacity: 0.1, 
          shadowRadius: 3 
        }, 
        android: { elevation: 2 },
        web: { boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }
      })}
    >
       <Box flexDirection="row" alignItems="center" marginBottom="m">
          <Box 
            width={44} 
            height={44} 
            borderRadius="round" 
            backgroundColor={active.bg as any} 
            alignItems="center" 
            justifyContent="center"
            marginRight="m"
          >
            <Icon 
              name={icon as any} 
              size={22} 
              color={theme.colors[active.main as keyof Theme['colors']]} 
            />
          </Box>
          <Box flex={1}>
            <Text variant="title" color="text" fontSize={rsp.normalize(18)} fontWeight="700">{title}</Text>
            <Text variant="bodySmall" color="textSecondary">{subtitle}</Text>
          </Box>
       </Box>
       
       <Box 
         flexDirection="row" 
         justifyContent="space-between" 
         alignItems="flex-end" 
         paddingTop="s" 
         borderTopWidth={1} 
         borderTopColor="border"
       >
          <Box>
            <Text variant="caption" color="textSecondary" fontWeight="600" fontSize={rsp.normalize(13)}>
              {amountLabel}
            </Text>
            <Text variant="header" color={active.main as any} fontSize={rsp.normalize(24)} fontWeight="700">
              {amount}
            </Text>
          </Box>
       </Box>
    </Box>
  );
};

export default SummaryCard;
