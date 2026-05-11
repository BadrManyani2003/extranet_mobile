import React from 'react';
import { 
  TouchableOpacity, 
  StatusBar, 
  Platform 
} from 'react-native';
import { useTheme } from '@shopify/restyle';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from '@expo/vector-icons/Ionicons';
import { Box, Text } from '../../theme/restyle';
import { Theme } from '../../theme/theme';
import { rsp } from '../../utils/responsive';
import { useThemeContext } from '../../context/ThemeContext';

type AppHeaderProps = {
  title: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  leftIconName?: string;
  rightIconName?: string;
  onRightIconPress?: () => void;
  showNotificationBadge?: boolean;
  notificationCount?: number;
  backgroundColor?: keyof Theme['colors'];
  titleColor?: keyof Theme['colors'];
  iconColor?: keyof Theme['colors'];
  hideShadow?: boolean;
};

const AppHeader: React.FC<AppHeaderProps> = ({
  title,
  showBackButton = false,
  onBackPress,
  leftIconName,
  rightIconName,
  onRightIconPress,
  showNotificationBadge = false,
  notificationCount = 0,
  backgroundColor = 'cardBackground',
  titleColor = 'text',
  iconColor = 'text',
  hideShadow = false,
}) => {
  const theme = useTheme<Theme>();
  const { isDark } = useThemeContext();
  const insets = useSafeAreaInsets();

  const headerHeight = (Platform.OS === 'ios' ? 44 : 56);
  const bgColorValue = theme.colors[backgroundColor];
  const isTransparent = backgroundColor === 'transparent';

  return (
    <Box 
      width="100%" 
      backgroundColor={backgroundColor}
      style={{
        paddingTop: insets.top,
        zIndex: 10,
        ...Platform.select({
          web: { boxShadow: (hideShadow || isTransparent) ? 'none' : `0 1px 4px ${isDark ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.1)'}` },
          ios: { 
            shadowColor: '#000', 
            shadowOffset: { width: 0, height: 1 }, 
            shadowOpacity: (hideShadow || isTransparent) ? 0 : 0.05, 
            shadowRadius: 2 
          },
          android: { elevation: (hideShadow || isTransparent) ? 0 : 2 }
        })
      }}
    >
      <StatusBar 
        backgroundColor={isTransparent ? 'transparent' : bgColorValue}
        translucent={true}
        barStyle={isDark ? 'light-content' : 'dark-content'}
      />
      
      <Box 
        height={headerHeight}
        flexDirection="row" 
        alignItems="center" 
        justifyContent="space-between" 
        paddingHorizontal="m"
      >
        {/* Left Side */}
        <Box width={rsp.scale(60)} alignItems="flex-start">
          {showBackButton ? (
            <TouchableOpacity onPress={onBackPress} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Icon name={(leftIconName || 'chevron-back') as any} size={24} color={theme.colors[iconColor]} />
            </TouchableOpacity>
          ) : leftIconName ? (
            <TouchableOpacity onPress={onBackPress} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Icon name={leftIconName as any} size={24} color={theme.colors[iconColor]} />
            </TouchableOpacity>
          ) : null}
        </Box>

        {/* Center Title */}
        <Box flex={1} alignItems="center">
          <Text variant="title" color={titleColor} numberOfLines={1} fontWeight="700">
            {title}
          </Text>
        </Box>

        {/* Right Side */}
        <Box width={rsp.scale(60)} alignItems="flex-end">
          {rightIconName ? (
            <TouchableOpacity 
              onPress={onRightIconPress} 
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Box position="relative" backgroundColor="backgroundGray" width={34} height={34} borderRadius="round" alignItems="center" justifyContent="center">
                <Icon name={rightIconName as any} size={22} color={theme.colors[iconColor]} />
                {showNotificationBadge && notificationCount > 0 && (
                  <Box 
                    position="absolute"
                    top={-4}
                    right={-4}
                    backgroundColor="error"
                    borderWidth={2}
                    borderColor="cardBackground"
                    borderRadius="round"
                    minWidth={18}
                    height={18}
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Text color="white" fontSize={10} fontWeight="bold">
                      {notificationCount > 9 ? '9+' : notificationCount}
                    </Text>
                  </Box>
                )}
              </Box>
            </TouchableOpacity>
          ) : null}
        </Box>
      </Box>
    </Box>
  );
};

export default AppHeader;
