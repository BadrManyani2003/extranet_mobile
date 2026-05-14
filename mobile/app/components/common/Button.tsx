import React from 'react';
import {
  ActivityIndicator,
  TouchableOpacity,
  ViewStyle,
  Platform,
} from 'react-native';
import { useTheme } from '@shopify/restyle';
import { Ionicons as Icon } from '@expo/vector-icons';
import { Box, Text } from '../../theme/restyle';
import { Theme } from '../../theme/theme';
import { rsp } from '../../utils/responsive';

interface ButtonProps {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'outline' | 'error' | 'success' | 'white';
  icon?: string;
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  label, onPress, loading, disabled, variant = 'primary', icon, size = 'medium', style, fullWidth = true
}) => {
  const theme = useTheme<Theme>();
  
  const getVariants = () => {
    switch (variant) {
      case 'secondary': return { bg: 'buttonSecondaryBg', text: 'text' };
      case 'outline':   return { bg: 'transparent', text: 'primary', border: 'border' };
      case 'error':     return { bg: 'error', text: 'white' };
      case 'success':   return { bg: 'success', text: 'white' };
      case 'white':     return { bg: 'white', text: 'primary' };
      default:          return { bg: 'primary', text: 'white' };
    }
  };

  const { bg, text, border } = getVariants();
  const height = size === 'small' ? 36 : size === 'large' ? 52 : 44;

  return (
    <TouchableOpacity 
      onPress={onPress} 
      disabled={disabled || loading} 
      activeOpacity={0.8} 
      style={[{ width: fullWidth ? '100%' : 'auto' }, style]}
    >
      <Box 
        backgroundColor={bg as any} 
        borderWidth={border ? 1 : 0} 
        borderColor={border as any} 
        borderRadius="l" 
        height={height} 
        flexDirection="row" 
        alignItems="center" 
        justifyContent="center" 
        opacity={disabled || loading ? 0.6 : 1}
        style={variant === 'primary' ? {
          shadowColor: theme.colors.primary,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.2,
          shadowRadius: 8,
          elevation: 4,
        } : {}}
      >
        {loading ? (
          <ActivityIndicator color={theme.colors[text as keyof Theme['colors']]} size="small" />
        ) : (
          <>
            {icon && (
              <Icon 
                name={icon as any} 
                size={size === 'small' ? 16 : 18} 
                color={theme.colors[text as keyof Theme['colors']]} 
                style={{ marginRight: 8 }} 
              />
            )}
            <Text 
              variant="button" 
              color={text as any} 
              fontSize={rsp.normalize(size === 'small' ? 13 : 15)} 
              fontWeight="600" 
            >
              {label}
            </Text>
          </>
        )}
      </Box>
    </TouchableOpacity>
  );
};

export default Button;
