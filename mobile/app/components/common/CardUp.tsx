import React from 'react';
import {
  Modal,
  Animated,
  Platform,
  Dimensions,
  Pressable,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '@shopify/restyle';
import { Ionicons as Icon } from '@expo/vector-icons';
import { Box, Text } from '../../theme/restyle';
import { Theme } from '../../theme/theme';
import { rsp } from '../../utils/responsive';

const AnimatedBox = Animated.createAnimatedComponent(Box);

interface CardUpProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

const CardUp: React.FC<CardUpProps> = ({ visible, onClose, title, subtitle, children }) => {
  const theme = useTheme<Theme>();

  return (
    <Modal visible={visible} animationType="slide" transparent statusBarTranslucent>
      <Box flex={1} backgroundColor="transparentNavy" justifyContent="flex-end">
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <AnimatedBox 
          backgroundColor="cardBackground" 
          borderTopLeftRadius="xxl" 
          borderTopRightRadius="xxl" 
          maxHeight="92%"
          width="100%"
          paddingBottom="xl"
          style={Platform.select({ 
            ios: { 
              shadowColor: theme.colors.primary, 
              shadowOffset: { width: 0, height: -12 }, 
              shadowOpacity: 0.15, 
              shadowRadius: 24 
            },
            android: { elevation: 20 },
            web: { boxShadow: `0 -12px 24px ${theme.colors.transparentNavy}` }
          })}
        >
          {/* Handle */}
          <Box 
            width={44} 
            height={5} 
            backgroundColor="border" 
            borderRadius="round" 
            alignSelf="center" 
            marginTop="s" 
            marginBottom="s" 
            opacity={0.6} 
          />

          {/* Header */}
          <Box 
            flexDirection="row" 
            justifyContent="space-between" 
            alignItems="center" 
            paddingHorizontal="l" 
            paddingVertical="m" 
            borderBottomWidth={1} 
            borderBottomColor="borderLight"
          >
            <Box flex={1}>
              <Text variant="subheader" color="text" fontSize={rsp.normalize(20)} fontWeight="900">
                {title}
              </Text>
              {subtitle && (
                <Text variant="caption" color="textTertiary" fontSize={11} marginTop="xxs" fontWeight="600">
                  {subtitle}
                </Text>
              )}
            </Box>
            <TouchableOpacity 
              onPress={onClose} 
              style={{ 
                backgroundColor: theme.colors.backgroundLight, 
                width: 34, 
                height: 34, 
                borderRadius: 17, 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}
            >
              <Icon name="close" size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </Box>

          {/* Content */}
          <Box flexShrink={1}>
            {children}
          </Box>
        </AnimatedBox>
      </Box>
    </Modal>
  );
};

export default CardUp;
