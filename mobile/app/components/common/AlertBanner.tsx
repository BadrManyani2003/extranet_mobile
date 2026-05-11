import React from 'react';
import { TouchableOpacity } from 'react-native';
import { useTheme } from '@shopify/restyle';
import { Ionicons as Icon } from '@expo/vector-icons';
import { Box, Text } from '../../theme/restyle';
import { Theme } from '../../theme/theme';

interface AlertBannerProps {
  message: string;
  variant?: 'error' | 'warning' | 'info' | 'success';
  icon?: string;
  onPress?: () => void;
}

const AlertBanner: React.FC<AlertBannerProps> = ({ 
  message, 
  variant = 'info', 
  icon, 
  onPress 
}) => {
  const theme = useTheme<Theme>();

  const getStyles = () => {
    switch (variant) {
      case 'error':   return { bg: 'errorBg', text: 'error', icon: 'alert-circle' };
      case 'warning': return { bg: 'warningBg', text: 'warning', icon: 'warning' };
      case 'success': return { bg: 'successBg', text: 'success', icon: 'checkmark-circle' };
      default:        return { bg: 'primaryBg', text: 'primary', icon: 'information-circle' };
    }
  };

  const style = getStyles();

  return (
    <TouchableOpacity activeOpacity={0.8} onPress={onPress}>
      <Box 
        backgroundColor={style.bg as any} 
        padding="m" 
        borderRadius="l" 
        flexDirection="row" 
        alignItems="center" 
        marginHorizontal="l" 
        marginBottom="m" 
        borderWidth={1} 
        borderColor={style.bg as any}
      >
        <Icon 
          name={(icon || style.icon) as any} 
          size={20} 
          color={theme.colors[style.text as keyof Theme['colors']]} 
          style={{ marginRight: 10 }} 
        />
        <Text variant="caption" color={style.text as any} fontWeight="700" flex={1}>
          {message}
        </Text>
        {onPress && (
          <Icon 
            name={"chevron-forward" as any} 
            size={14} 
            color={theme.colors[style.text as keyof Theme['colors']]} 
          />
        )}
      </Box>
    </TouchableOpacity>
  );
};

export default AlertBanner;
