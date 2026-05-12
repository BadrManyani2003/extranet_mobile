import React from 'react';
import {
  TextInput,
  TextInputProps,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { useTheme } from '@shopify/restyle';
import { Ionicons as Icon } from '@expo/vector-icons';
import { Box, Text } from '../../theme/restyle';
import { Theme } from '../../theme/theme';
import { rsp } from '../../utils/responsive';

interface FormInputProps extends TextInputProps {
  label: string;
  icon?: string;
  error?: string | null;
  rightIcon?: string;
  onRightIconPress?: () => void;
  secureTextEntry?: boolean;
}

const FormInput: React.FC<FormInputProps> = ({
  label,
  icon,
  error,
  rightIcon,
  onRightIconPress,
  secureTextEntry,
  style,
  ...props
}) => {
  const theme = useTheme<Theme>();
  const c = theme.colors;

  return (
    <Box marginBottom="m">
      <Text 
        variant="labelBold" 
        marginBottom="xs" 
        marginLeft="xs" 
        color={error ? 'error' : 'textTertiary'}
        fontSize={10}
        textTransform="uppercase"
        letterSpacing={0.5}
      >
        {label}
      </Text>
      <Box 
        flexDirection="row" 
        alignItems="center" 
        backgroundColor="cardBackground" 
        borderRadius="l" 
        borderWidth={1.5} 
        borderColor={error ? 'error' : 'borderLight'} 
        paddingHorizontal="m" 
        height={rsp.verticalScale(55)}
        style={Platform.select({
          ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.02, shadowRadius: 4 },
          android: { elevation: 1 },
          web: { boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }
        })}
      >
        {icon && (
          <Icon 
            name={icon as any} 
            size={20} 
            color={error ? c.error : c.primary} 
            style={{ marginRight: 12 }} 
          />
        )}
        <TextInput
          placeholderTextColor={c.placeholderText}
          secureTextEntry={secureTextEntry}
          style={[
            { 
              flex: 1, 
              color: c.text, 
              fontSize: rsp.normalize(15), 
              fontWeight: '600',
              paddingVertical: 0,
            },
            style
          ]}
          {...props}
        />
        {rightIcon && (
          <TouchableOpacity 
            onPress={onRightIconPress} 
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Icon name={rightIcon as any} size={20} color={c.textTertiary} />
          </TouchableOpacity>
        )}
      </Box>
      {error && (
        <Text variant="caption" color="error" marginTop="xxs" marginLeft="xs" fontSize={10} fontWeight="600">
          {error}
        </Text>
      )}
    </Box>
  );
};

export default FormInput;
