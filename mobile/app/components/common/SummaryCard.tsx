import React from 'react';
import { useTheme } from '@shopify/restyle';
import { ArrowRight, LucideIcon } from 'lucide-react-native';
import { Box, Text } from '../../theme/restyle';
import { Theme, shadows } from '../../theme/theme';
import { rsp } from '../../utils/responsive';

interface SummaryCardProps {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  amount: string;
  amountLabel: string;
  variant?: 'primary' | 'error' | 'success' | 'warning';
}

const SummaryCard: React.FC<SummaryCardProps> = ({ 
  title, 
  subtitle, 
  icon: Icon, 
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
      padding="m" 
      borderRadius="xl" 
      backgroundColor="white" 
      style={shadows.small}
      borderWidth={1}
      borderColor="borderLight"
    >
       <Box flexDirection="row" alignItems="center" marginBottom="m">
          <Box 
            width={44} 
            height={44} 
            borderRadius="l" 
            backgroundColor={active.bg as keyof Theme['colors']} 
            alignItems="center" 
            justifyContent="center"
            marginRight="m"
          >
            <Icon 
              size={22} 
              color={theme.colors[active.main as keyof Theme['colors']]} 
            />
          </Box>
          <Box flex={1}>
            <Text variant="labelBold" color="textMuted" letterSpacing={1}>{title}</Text>
            <Text variant="bodyMedium" color="text" numberOfLines={1}>{subtitle}</Text>
          </Box>
       </Box>
       
       <Box 
         flexDirection="row" 
         justifyContent="space-between" 
         alignItems="flex-end"
       >
          <Box flex={1}>
            <Text variant="header" color="primary" fontSize={rsp.normalize(24)} fontWeight="800">
              {amount}
            </Text>
            <Text variant="bodySmall" color="textMuted">
              {amountLabel}
            </Text>
          </Box>
          <Box backgroundColor="primaryBg" width={36} height={36} borderRadius="m" alignItems="center" justifyContent="center">
             <ArrowRight size={20} color={theme.colors.primary} />
          </Box>
       </Box>
    </Box>
  );
};

export default SummaryCard;
