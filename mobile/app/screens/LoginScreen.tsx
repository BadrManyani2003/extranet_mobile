import React, { useState, useRef, useEffect } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
  Dimensions,
  StyleSheet,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ShieldCheck } from 'lucide-react-native';
import { useTheme } from '@shopify/restyle';
import * as AuthSession from 'expo-auth-session';
import { jwtDecode } from 'jwt-decode';
import { LinearGradient } from 'expo-linear-gradient';

import { useAuth } from '../context/AuthContext';
import { Theme } from '../theme/theme';
import { Box, Text } from '../theme/restyle';
import { RootStackParamList } from '../navigation/MainNavigator';
import { rsp } from '../utils/responsive';
import { Button, AlertBanner } from '../components/common';
import { useTranslation } from '../utils/i18n';
import { keycloakDiscovery, keycloakConfig } from '../utils/keycloak';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

const LoginScreen: React.FC<Props> = () => {
  const theme = useTheme<Theme>();
  const { signin, logout } = useAuth();
  const { t } = useTranslation();

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // ── expo-auth-session PKCE request ──────────────────────────
  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    keycloakConfig,
    keycloakDiscovery
  );

  // ── Animations ───────────────────────────────────────────────
  const logoScale = useRef(new Animated.Value(0.9)).current;
  const opacity   = useRef(new Animated.Value(0)).current;
  const formSlide = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(logoScale,  { toValue: 1, bounciness: 4, useNativeDriver: Platform.OS !== 'web' }),
      Animated.timing(opacity,    { toValue: 1, duration: 800, useNativeDriver: Platform.OS !== 'web' }),
      Animated.spring(formSlide,  { toValue: 0, bounciness: 4, speed: 10, delay: 100, useNativeDriver: Platform.OS !== 'web' }),
    ]).start();

    // 🚀 Redirection automatique vers Keycloak dès que la requête est prête (Mobile uniquement)
    if (Platform.OS !== 'web' && request && !loading && !errorMsg && !response) {
      promptAsync();
    }
  }, [request, loading, errorMsg, response]);

  // ── Handle OAuth response ────────────────────────────────────
  useEffect(() => {
    if (response?.type === 'success') {
      const { code } = response.params;
      handleKeycloakCallback(code);
    } else if (response?.type === 'error') {
      setErrorMsg('Erreur lors de la connexion Keycloak. Réessayez.');
    }
  }, [response]);

  // ── Exchange code → token → decode → store session ──────────
  const handleKeycloakCallback = async (code: string) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const tokenResult = await AuthSession.exchangeCodeAsync(
        {
          clientId: keycloakConfig.clientId,
          code,
          redirectUri: keycloakConfig.redirectUri,
          extraParams: { code_verifier: request?.codeVerifier || '' },
        },
        keycloakDiscovery
      );

      const accessToken = tokenResult.accessToken;
      const decoded: any = jwtDecode(accessToken);

      // Extraction des rôles depuis le token Keycloak (Realm Roles + Client Roles)
      const realmRoles: string[] = decoded.realm_access?.roles || [];
      const clientRoles: string[] = decoded.resource_access?.[keycloakConfig.clientId]?.roles || [];
      const roles = [...new Set([...realmRoles, ...clientRoles])];
      
      const hasRole = (roleName: string) => 
        roles.some(r => r.toUpperCase() === roleName.toUpperCase());

      const isAdherent = hasRole('ADHERENT');
      const isClient = hasRole('CLIENT');
      const isExpert = hasRole('EXPERT');

      console.log("[Login] User roles:", roles);

      // 🛑 Restriction : Seuls les Adhérents, Clients et Experts peuvent se connecter
      if (!isAdherent && !isClient && !isExpert) {
        console.warn("[Login] Access denied: User lacks required roles.");
        setErrorMsg("non autoriser");
        setLoading(false);
        await logout(false);
        return;
      }

      // Détermination de la source pour les futures requêtes API
      let userSource: 'ADHERENT' | 'CLIENT' | 'EXPERT' = 'ADHERENT';
      if (isExpert) userSource = 'EXPERT';
      else if (isClient) userSource = 'CLIENT';

      const user = {
        id:     decoded.sub       || '',
        email:  decoded.email     || decoded.preferred_username || '',
        nom:    decoded.family_name  || '',
        prenom: decoded.given_name   || '',
        role:   userSource,
        roles:  roles,
      };

      await signin(user, accessToken, userSource); 


    } catch (error) {
      console.error("[Login] Error exchanging code for token:", error);
      setErrorMsg("Erreur lors de la récupération du token. Réessayez.");
    } finally {
      setLoading(false);
    }
  };

  const c = theme.colors;

  return (
    <Box flex={1} backgroundColor="background">
      <LinearGradient
        colors={[theme.colors.primaryBg, '#FFFFFF', theme.colors.primaryBg]}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* ── Logo / Header ── */}
            <Animated.View style={{
              opacity,
              transform: [{ scale: logoScale }],
              alignItems: 'center',
              marginBottom: rsp.verticalScale(60),
            }}>
              <Box
                backgroundColor="primary"
                width={rsp.scale(120)}
                height={rsp.scale(120)}
                borderRadius="round"
                alignItems="center"
                justifyContent="center"
                marginBottom="xl"
                style={Platform.select({
                  ios: {
                    shadowColor: c.primary,
                    shadowOffset: { width: 0, height: 20 },
                    shadowOpacity: 0.2,
                    shadowRadius: 30,
                  },
                  android: { elevation: 20 },
                  web: { boxShadow: `0 20px 40px rgba(3, 105, 161, 0.25)` }
                })}
              >
                <ShieldCheck size={rsp.scale(60)} color="#FFF" />
              </Box>

              <Text
                variant="header"
                color="primary"
                fontSize={rsp.normalize(44)}
                fontWeight="900"
                letterSpacing={-2}
              >
                MyAsk
              </Text>
              
              <Text
                variant="bodyMedium"
                color="textSecondary"
                marginTop="xs"
                fontWeight="700"
                textAlign="center"
                fontSize={rsp.normalize(18)}
                style={{ opacity: 0.6 }}
              >
                Espace Assurance
              </Text>
            </Animated.View>

            {/* ── Action Section ── */}
            <Animated.View style={{ transform: [{ translateY: formSlide }], opacity, width: '100%', alignItems: 'center' }}>

              {errorMsg && (
                <Box marginBottom="xl" width="100%">
                  <AlertBanner message={errorMsg} variant="error" />
                </Box>
              )}

              <Box width="100%" paddingHorizontal="l">
                <Button
                  label={t('Se connecter')}
                  onPress={() => promptAsync()}
                  loading={loading || !request}
                  disabled={!request}
                  variant="primary"
                  size="large"
                />
              </Box>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Box>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: rsp.scale(32),
    paddingBottom: 40,
  },
});

export default LoginScreen;
