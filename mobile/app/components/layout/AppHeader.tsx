import React from 'react';
import { 
  TouchableOpacity, 
  StatusBar, 
  Platform 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '@shopify/restyle';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, LucideIcon } from 'lucide-react-native';
import { Box, Text } from '../../theme/restyle';
import { Theme, shadows } from '../../theme/theme';
import { rsp } from '../../utils/responsive';
import { useThemeContext } from '../../context/ThemeContext';

type AppHeaderProps = {
  title: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  leftIcon?: LucideIcon;
  rightIcon?: LucideIcon;
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
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  onRightIconPress,
  showNotificationBadge = false,
  notificationCount = 0,
  backgroundColor = 'cardBackground',
  titleColor = 'text',
  iconColor = 'text',
  hideShadow = false,
}) => {
  const theme = useTheme<Theme>();
  const navigation = useNavigation();
  const { isDark } = useThemeContext();
  const insets = useSafeAreaInsets();

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

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
        ...( (hideShadow || isTransparent) ? {} : shadows.small )
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
            <TouchableOpacity onPress={handleBackPress} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <ChevronLeft size={24} color={theme.colors[iconColor]} />
            </TouchableOpacity>
          ) : LeftIcon ? (
            <TouchableOpacity onPress={handleBackPress} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <LeftIcon size={24} color={theme.colors[iconColor]} />
            </TouchableOpacity>
          ) : null}
        </Box>

        {/* Center Title */}
        <Box flex={1} alignItems="center">
          <Text variant="title" color={titleColor} numberOfLines={1}>
            {title}
          </Text>
        </Box>

        {/* Right Side */}
        <Box width={rsp.scale(60)} alignItems="flex-end">
          {RightIcon ? (
            <TouchableOpacity 
              onPress={onRightIconPress} 
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Box position="relative" backgroundColor="primaryBg" width={38} height={38} borderRadius="m" alignItems="center" justifyContent="center">
                <RightIcon size={20} color={theme.colors[iconColor]} />
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
