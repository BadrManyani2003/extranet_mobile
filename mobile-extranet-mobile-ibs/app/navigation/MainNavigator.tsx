import React, { useRef, useEffect } from 'react';
import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  View,
  Platform,
  Dimensions,
  ActivityIndicator,
  StyleSheet,
  Animated,
  Pressable,
  Text,
  PixelRatio,
} from 'react-native';
import Icon from '@expo/vector-icons/Ionicons';
import { useTheme } from '@shopify/restyle';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '../context/AuthContext';
import { useThemeContext } from '../context/ThemeContext';
import { Theme } from '../theme/theme';
import { rsp } from '../utils/responsive';
import { useTranslation } from '../utils/i18n';

// Screens
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import ContratScreen from '../screens/ContratScreen';
import QuittanceScreen from '../screens/QuittanceScreen';
import SinistreScreen from '../screens/SinistreScreen';
import ProfileScreen from '../screens/ProfileScreen';

// ─── Navigation Types ──────────────────────────────────────────────────────────
export type RootStackParamList = {
  Login: undefined;
  MainTabs: undefined;
};

export type TabParamList = {
  Accueil: undefined;
  Contrats: undefined;
  Quittances: undefined;
  Sinistres: undefined;
  Profil: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

// ─── Design Categories ────────────────────────────────────────────────────────
const isSmall = rsp.isSmallDevice;
const isTablet = rsp.isTablet;

// Tab bar height calculations per device size
function getTabBarHeight(insetBottom: number): number {
  if (isTablet) return rsp.verticalScale(72) + insetBottom;
  if (rsp.isLargeDevice) return rsp.verticalScale(68) + insetBottom;
  if (isSmall) return rsp.verticalScale(60) + insetBottom;
  return rsp.verticalScale(64) + insetBottom;
}

function getIconSize(): number {
  if (isTablet) return 26;
  if (isSmall) return 22;
  return 24;
}

function getLabelSize(): number {
  if (isTablet) return 12;
  if (isSmall) return 9;
  return 10;
}

// ─── Tab Config ────────────────────────────────────────────────────────────────
const getTabConfig = (colors: Theme['colors'], t: any) => ({
  Accueil: { label: t('Accueil'), active: 'home', inactive: 'home-outline', accentColor: colors.primary, accentBg: colors.primaryBg },
  Contrats: { label: t('Contrats'), active: 'shield-checkmark', inactive: 'shield-checkmark-outline', accentColor: colors.primary, accentBg: colors.primaryBg },
  Quittances: { label: t('Quittances'), active: 'receipt', inactive: 'receipt-outline', accentColor: colors.primary, accentBg: colors.primaryBg },
  Sinistres: { label: t('Sinistres'), active: 'warning', inactive: 'warning-outline', accentColor: colors.primary, accentBg: colors.primaryBg },
  Profil: { label: t('Profil'), active: 'person-circle', inactive: 'person-circle-outline', accentColor: colors.primary, accentBg: colors.primaryBg },
});

// ─── Animated Tab Button ────────────────────────────────────────────────────────
interface TabButtonProps {
  routeName: keyof TabParamList;
  focused: boolean;
  onPress: () => void;
  colors: Theme['colors'];
}

const TabButton: React.FC<TabButtonProps> = ({ routeName, focused, onPress, colors }) => {
  const { t } = useTranslation();
  const config = getTabConfig(colors, t)[routeName];
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const bgAnim = useRef(new Animated.Value(focused ? 1 : 0)).current;
  const labelAnim = useRef(new Animated.Value(focused ? 1 : 0)).current;
  const translateY = useRef(new Animated.Value(focused ? 0 : 3)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(bgAnim, { toValue: focused ? 1 : 0, speed: 20, bounciness: 0, useNativeDriver: false }),
      Animated.spring(labelAnim, { toValue: focused ? 1 : 0, speed: 20, bounciness: 0, useNativeDriver: Platform.OS !== 'web' }),
      Animated.spring(translateY, { toValue: focused ? 0 : 3, speed: 20, bounciness: 0, useNativeDriver: Platform.OS !== 'web' }),
    ]).start();
  }, [focused]);

  const handlePressIn = () =>
    Animated.spring(scaleAnim, { toValue: 0.88, speed: 40, bounciness: 0, useNativeDriver: Platform.OS !== 'web' }).start();
  const handlePressOut = () =>
    Animated.spring(scaleAnim, { toValue: 1, speed: 20, bounciness: 6, useNativeDriver: Platform.OS !== 'web' }).start();

  const iconBgColor = bgAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['transparent', config.accentBg as string],
  });

  const iconColor = focused ? config.accentColor : colors.textTertiary;
  const iconSize = getIconSize();
  const labelSize = getLabelSize();

  // Icon pill dimensions
  const pillW = isTablet ? 68 : isSmall ? 48 : 56;
  const pillH = isTablet ? 34 : isSmall ? 28 : 30;

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={styles.tabButton}
      accessibilityRole="button"
      accessibilityLabel={config.label}
      accessibilityState={{ selected: focused }}
    >
      <Animated.View style={{ transform: [{ scale: scaleAnim }, { translateY }], alignItems: 'center' }}>
        {/* Icon pill */}
        <Animated.View
          style={[
            styles.iconPill,
            {
              width: pillW,
              height: pillH,
              borderRadius: pillH / 2,
              backgroundColor: iconBgColor,
            },
          ]}
        >
          <Icon
            name={(focused ? config.active : config.inactive) as any}
            size={iconSize}
            color={iconColor as string}
          />
        </Animated.View>

        {/* Label */}
        <Animated.Text
          style={[
            styles.tabLabel,
            {
              fontSize: labelSize,
              color: (focused ? config.accentColor : colors.textTertiary) as string,
              opacity: 1,
              fontWeight: focused ? '700' : '500',
              marginTop: isSmall ? 2 : 3,
            },
          ]}
          numberOfLines={1}
        >
          {config.label}
        </Animated.Text>

        {/* Active dot indicator */}
        {focused && (
          <Animated.View
            style={[
              styles.activeDot,
              { backgroundColor: config.accentColor as string, opacity: labelAnim },
            ]}
          />
        )}
      </Animated.View>
    </Pressable>
  );
};

// ─── Custom Tab Bar ─────────────────────────────────────────────────────────────
interface CustomTabBarProps {
  state: any;
  descriptors: any;
  navigation: any;
}

const CustomTabBar: React.FC<CustomTabBarProps> = ({ state, descriptors, navigation }) => {
  const insets = useSafeAreaInsets();
  const theme = useTheme<Theme>();
  const { isDark } = useThemeContext();

  const tabBarHeight = getTabBarHeight(insets.bottom);
  const paddingBottom = insets.bottom + (isSmall ? 6 : 8);
  const paddingTop = isSmall ? 8 : 10;

  const bgColor = theme.colors.cardBackground;
  const borderColor = theme.colors.border;

  return (
    <View
      style={[
        styles.tabBar,
        {
          height: tabBarHeight,
          paddingBottom,
          paddingTop,
          backgroundColor: bgColor,
          borderTopColor: borderColor,
          // Tablet: horizontal padding to center tabs
          paddingHorizontal: isTablet ? rsp.width * 0.1 : 0,
        },
        Platform.select({
          ios: {
            shadowColor: isDark ? '#000' : '#0F172A',
            shadowOffset: { width: 0, height: -3 },
            shadowOpacity: isDark ? 0.4 : 0.08,
            shadowRadius: 12,
          },
          android: { elevation: 24 },
          web: {
            boxShadow: `0 -3px 16px rgba(15,23,42,${isDark ? 0.35 : 0.07})`,
          } as any,
        }),
      ]}
    >
      {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
        const focused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!focused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TabButton
            key={route.key}
            routeName={route.name as keyof TabParamList}
            focused={focused}
            onPress={onPress}
            colors={theme.colors}
          />
        );
      })}
    </View>
  );
};

// ─── Bottom Tabs Navigator ──────────────────────────────────────────────────────
const BottomTabs: React.FC = () => {
  const theme = useTheme<Theme>();
  const c = theme.colors;

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <Tab.Navigator
        tabBar={(props) => <CustomTabBar {...props} />}
        screenOptions={{ headerShown: false }}
      >
        <Tab.Screen name="Accueil" component={HomeScreen} />
        <Tab.Screen name="Contrats" component={ContratScreen} />
        <Tab.Screen name="Quittances" component={QuittanceScreen} />
        <Tab.Screen name="Sinistres" component={SinistreScreen} />
        <Tab.Screen name="Profil" component={ProfileScreen} />
      </Tab.Navigator>
    </View>
  );
};

// ─── Main Navigator ─────────────────────────────────────────────────────────────
const MainNavigator: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme<Theme>();
  const { isDark } = useThemeContext();
  const { isAuthenticated, isLoading } = useAuth();
  const c = theme.colors;

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: c.background }]}>
        <ActivityIndicator size="large" color={c.primary} />
        <Text style={[styles.loadingText, { color: c.textTertiary }]}>
          {t('Chargement')}…
        </Text>
      </View>
    );
  }

  const navTheme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme : DefaultTheme).colors,
      primary: c.primary,
      background: c.background,
      card: c.cardBackground,
      text: c.text,
      border: c.border,
    },
  };

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'fade',
          animationDuration: 220,
          contentStyle: { backgroundColor: c.background },
        }}
      >
        {isAuthenticated ? (
          <Stack.Screen name="MainTabs" component={BottomTabs} />
        ) : (
          <>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ animation: 'none' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

// ─── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  // Tab bar container
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: 0.5,
    ...Platform.select({
      web: { position: 'fixed' as any, bottom: 0, left: 0, right: 0, zIndex: 9999 },
      default: {},
    }),
  },

  // Individual tab button
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    // Minimum touch target 44px per HIG / Material specs
    minHeight: 44,
    minWidth: 44,
  },

  // Icon pill (pill-shaped highlight when focused)
  iconPill: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Label below icon
  tabLabel: {
    letterSpacing: 0.2,
    textAlign: 'center',
    // Cap width so long labels don't overflow on small screens
    maxWidth: isSmall ? 52 : isTablet ? 80 : 64,
  },

  // Small dot under active label
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 2,
  },

  // Loading screen
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
});

export default MainNavigator;
