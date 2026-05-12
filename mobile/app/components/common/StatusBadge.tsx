import React from 'react';
import { useTheme } from '@shopify/restyle';
import { Ionicons as Icon } from '@expo/vector-icons';
import { Box, Text } from '../../theme/restyle';
import { Theme } from '../../theme/theme';
import { rsp } from '../../utils/responsive';

interface StatusBadgeProps {
  label: string;
  variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'purple';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  label, 
  variant = 'neutral' 
}) => {
  const theme = useTheme<Theme>();

  const getColors = () => {
    switch (variant) {
      case 'success': return { bg: 'successBg', text: 'success', icon: 'checkmark-circle' };
      case 'warning': return { bg: 'warningBg', text: 'warning', icon: 'time-outline' };
      case 'error':   return { bg: 'errorBg',   text: 'error',   icon: 'alert-circle-outline' };
      case 'info':    return { bg: 'infoBg',    text: 'info',    icon: 'information-circle-outline' };
      case 'purple':  return { bg: 'purpleBg',  text: 'purple',  icon: 'ribbon-outline' };
      default:        return { bg: 'backgroundGray', text: 'textSecondary', icon: 'ellipse-outline' };
    }
  };

  const { bg, text, icon } = getColors();

  return (
    <Box 
      backgroundColor={bg as keyof Theme['colors']} 
      paddingHorizontal="s" 
      paddingVertical="xxs" 
      borderRadius="round" 
      flexDirection="row" 
      alignItems="center" 
      style={{ alignSelf: 'flex-start' }}
    >
      <Icon 
        name={icon as any} 
        size={11} 
        color={theme.colors[text as keyof Theme['colors']]} 
        style={{ marginRight: 5 }} 
      />
      <Text 
        variant="labelBold" 
        color={text as keyof Theme['colors']} 
        fontSize={11} 
        fontWeight="700"
      >
        {label}
      </Text>
    </Box>
  );
};

export default StatusBadge;
