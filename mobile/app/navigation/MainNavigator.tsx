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
  ActivityIndicator,
  StyleSheet,
  Animated,
  Pressable,
} from 'react-native';
import { Ionicons as Icon } from '@expo/vector-icons';
import { useTheme } from '@shopify/restyle';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '../context/AuthContext';
import { useThemeContext } from '../context/ThemeContext';
import { Theme } from '../theme/theme';
import { rsp } from '../utils/responsive';
import { useTranslation } from '../utils/i18n';
import { Box, Text } from '../theme/restyle';

// Screens
import HomeScreen from '../screens/HomeScreen';
import LoginScreen from '../screens/LoginScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ContratScreen from '../screens/ContratScreen';
import QuittanceScreen from '../screens/QuittanceScreen';
import SinistreScreen from '../screens/SinistreScreen';
import ReclamationScreen from '../screens/ReclamationScreen';
import ContratDetailScreen from '../screens/details/ContratDetailScreen';
import SinistreDetailScreen from '../screens/details/SinistreDetailScreen';
import QuittanceDetailScreen from '../screens/details/QuittanceDetailScreen';
import ReclamationDetailScreen from '../screens/details/ReclamationDetailScreen';
import ReclamationCreateScreen from '../screens/details/ReclamationCreateScreen';
import PersAChargeScreen from '../screens/details/PersAChargeScreen';

export type TabParamList = {
  Accueil: undefined;
  Contrats: undefined;
  Quittances: undefined;
  Sinistres: undefined;
  Reclamations: undefined;
  Profil: undefined;
};

export type RootStackParamList = {
  MainTabs: undefined;
  ContratDetail: { police: any };
  SinistreDetail: { sinistre: any };
  QuittanceDetail: { quittance: any };
  ReclamationDetail: { reclamation: any };
  ReclamationCreate: undefined;
  PersACharge: undefined;
  Login: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

// ─── Catégories de Design ─────────────────────────────────────────────────────
const isSmall = rsp.isSmallDevice;
const isTablet = rsp.isTablet;

// Calcul de la hauteur de la barre d'onglets selon la taille de l'appareil
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

// ─── Configuration des Onglets ──────────────────────────────────────────────────
const getTabConfig = (colors: Theme['colors'], t: any) => ({
  Accueil: { label: t('Accueil'), active: 'home', inactive: 'home-outline', accentColor: colors.primary, accentBg: colors.primaryBg },
  Contrats: { label: t('Contrats'), active: 'document-text', inactive: 'document-text-outline', accentColor: colors.primary, accentBg: colors.primaryBg },
  Quittances: { label: t('Quittances'), active: 'receipt', inactive: 'receipt-outline', accentColor: colors.primary, accentBg: colors.primaryBg },
  Sinistres: { label: t('Sinistres'), active: 'warning', inactive: 'warning-outline', accentColor: colors.error, accentBg: colors.errorBg },
  Reclamations: { label: t('Réclamations'), active: 'chatbubbles', inactive: 'chatbubbles-outline', accentColor: colors.primary, accentBg: colors.primaryBg },
  Profil: { label: t('Profil'), active: 'person-circle', inactive: 'person-circle-outline', accentColor: colors.primary, accentBg: colors.primaryBg },
});

// ─── Bouton d'Onglet Animé ─────────────────────────────────────────────────────
interface TabButtonProps {
  routeName: keyof TabParamList;
  focused: boolean;
  onPress: () => void;
  colors: Theme['colors'];
}

const TabButton: React.FC<TabButtonProps> = ({ routeName, focused, onPress, colors }) => {
  const { t } = useTranslation();
  const config = getTabConfig(colors, t)[routeName as keyof ReturnType<typeof getTabConfig>];
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

  // Dimensions de la pilule de l'icône
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
        {/* Pilule de l'icône */}
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

        {/* Libellé */}
        <Animated.Text
          style={[
            styles.tabLabel,
            {
              fontSize: labelSize,
              color: (focused ? config.accentColor : colors.textTertiary) as string,
              opacity: 1,
              fontFamily: focused ? 'Inter-Bold' : 'Inter-Medium',
              marginTop: isSmall ? 2 : 3,
            },
          ]}
          numberOfLines={1}
        >
          {config.label}
        </Animated.Text>

        {/* Indicateur point actif */}
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

// ─── Barre d'Onglets Personnalisée ──────────────────────────────────────────────
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
          height: isSmall ? 65 : 75,
          marginBottom: insets.bottom > 0 ? insets.bottom : 15,
          marginHorizontal: 20,
          borderRadius: 30,
          paddingBottom: 0,
          paddingTop: 0,
          backgroundColor: bgColor,
          borderTopColor: 'transparent',
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-around',
        },
        Platform.select({
          ios: {
            shadowColor: theme.colors.primary,
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.15,
            shadowRadius: 20,
          },
          android: { elevation: 12 },
          web: {
            boxShadow: `0 10px 30px rgba(7, 89, 133, 0.15)`,
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

// ─── Navigateur d'Onglets Inférieur ───────────────────────────────────────────────
const BottomTabs: React.FC = () => {
  const theme = useTheme<Theme>();
  const { user } = useAuth();
  const c = theme.colors;

  // Vérification cumulative des rôles
  const roles = user?.roles?.map(r => r.toUpperCase()) || [];
  const isAdherent = roles.includes('ADHERENT');
  const isClient = roles.includes('CLIENT');
  const isExpert = roles.includes('EXPERT');
  
  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <Tab.Navigator
        tabBar={(props) => <CustomTabBar {...props} />}
        screenOptions={{ headerShown: false }}
      >
        {/* Accueil en premier */}
        <Tab.Screen name="Accueil" component={HomeScreen} />

        {/* Autres onglets selon rôle */}
        {(isClient || isExpert) && (
          <>
            <Tab.Screen name="Contrats" component={ContratScreen} />
            <Tab.Screen name="Quittances" component={QuittanceScreen} />
          </>
        )}

        {(isAdherent || isClient || isExpert) && (
          <Tab.Screen name="Sinistres" component={SinistreScreen} />
        )}

        {(isAdherent || isClient || isExpert) && (
          <Tab.Screen name="Reclamations" component={ReclamationScreen} />
        )}

        <Tab.Screen name="Profil" component={ProfileScreen} />
      </Tab.Navigator>
    </View>
  );
};

// ─── Navigateur Principal ───────────────────────────────────────────────────────
const MainNavigator: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme<Theme>();
  const { isDark } = useThemeContext();
  const auth = useAuth();
  const { isAuthenticated, isLoading } = auth;
  const c = theme.colors;

  if (isLoading) {
    return (
      <Box flex={1} backgroundColor="background" justifyContent="center" alignItems="center" padding="xl">
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text variant="title" color="text" marginTop="l" textAlign="center">
          {t('Chargement')}
        </Text>
        <Text variant="bodySmall" color="textSecondary" marginTop="s" textAlign="center" marginBottom="xl">
          Préparation de votre espace...
        </Text>
      </Box>
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
          animation: 'slide_from_right',
          animationDuration: 250,
          contentStyle: { backgroundColor: c.background },
        }}
      >
        {!isAuthenticated ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          <>
            <Stack.Screen name="MainTabs" component={BottomTabs} />
            <Stack.Screen name="ContratDetail" component={ContratDetailScreen} />
            <Stack.Screen name="SinistreDetail" component={SinistreDetailScreen} />
            <Stack.Screen name="QuittanceDetail" component={QuittanceDetailScreen} />
            <Stack.Screen name="ReclamationDetail" component={ReclamationDetailScreen} />
            <Stack.Screen name="ReclamationCreate" component={ReclamationCreateScreen} />
            <Stack.Screen name="PersACharge" component={PersAChargeScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

// ─── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    ...Platform.select({
      web: { position: 'fixed' as any, bottom: 20, left: 20, right: 20, zIndex: 9999 },
      default: {},
    }),
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    minWidth: 44,
  },
  iconPill: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontFamily: 'Inter-Medium',
    letterSpacing: 0.2,
    textAlign: 'center',
    maxWidth: isSmall ? 52 : isTablet ? 80 : 64,
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 2,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    letterSpacing: 0.2,
  },
});

export default MainNavigator;
