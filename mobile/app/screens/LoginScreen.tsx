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
import { Ionicons as Icon } from '@expo/vector-icons';
import { useTheme } from '@shopify/restyle';
import * as AuthSession from 'expo-auth-session';
import { jwtDecode } from 'jwt-decode';

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
  const { signin } = useAuth();
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
      Animated.spring(logoScale,  { toValue: 1, bounciness: 4, useNativeDriver: true }),
      Animated.timing(opacity,    { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(formSlide,  { toValue: 0, bounciness: 4, speed: 10, delay: 100, useNativeDriver: true }),
    ]).start();
  }, []);

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

      const roles: string[] = decoded.realm_access?.roles || [];
      const hasRole = (roleName: string) => 
        roles.some(r => r.toUpperCase() === roleName.toUpperCase() || r.toUpperCase() === `ROLE_${roleName.toUpperCase()}`);

      const isAdherent = hasRole('ADHERENT');
      const isClient = hasRole('CLIENT');

      // Restriction d'accès : Seuls les Adhérents et Clients peuvent entrer
      if (!isAdherent && !isClient) {
        setErrorMsg("Accès refusé. Cette application est réservée aux Adhérents et Clients.");
        return;
      }

      const user = {
        id:     decoded.sub       || '',
        email:  decoded.email     || decoded.preferred_username || '',
        nom:    decoded.family_name  || '',
        prenom: decoded.given_name   || '',
        role:   isAdherent ? 'ADHERENT' : 'CLIENT',
        roles:  roles,
      };

      const userSource: 'ADHERENT' | 'CLIENT' = isAdherent ? 'ADHERENT' : 'CLIENT';

      await signin(user, accessToken, userSource);


    } catch (err: unknown) {
      console.error('Keycloak token exchange error:', err);
      setErrorMsg("Erreur lors de la récupération du token. Réessayez.");
    } finally {
      setLoading(false);
    }
  };

  const c = theme.colors;

  return (
    <Box flex={1} backgroundColor="background">
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
              marginBottom: rsp.verticalScale(40),
            }}>
              <Box
                backgroundColor="primary"
                width={88}
                height={88}
                borderRadius="round"
                alignItems="center"
                justifyContent="center"
                marginBottom="l"
                style={{
                  shadowColor: c.primary,
                  shadowOffset: { width: 0, height: 12 },
                  shadowOpacity: 0.35,
                  shadowRadius: 20,
                  elevation: 12,
                }}
              >
                <Icon name={"shield-checkmark" as any} size={48} color="#FFF" />
              </Box>

              <Text
                variant="header"
                color="primary"
                fontSize={rsp.normalize(34)}
                fontWeight="800"
                letterSpacing={-1}
              >
                AssurPlus
              </Text>
              <Text
                variant="bodyMedium"
                color="textSecondary"
                marginTop="xs"
                fontWeight="600"
                textAlign="center"
              >
                {t('Gérez vos assurances comme jamais')}
              </Text>
            </Animated.View>

            {/* ── Card Section ── */}
            <Animated.View style={{ transform: [{ translateY: formSlide }], opacity }}>

              {/* Error banner */}
              {errorMsg && (
                <Box marginBottom="l">
                  <AlertBanner message={errorMsg} variant="error" />
                </Box>
              )}

              {/* Info card */}
              <Box
                backgroundColor="cardBackground"
                borderRadius="xl"
                padding="xl"
                borderWidth={1}
                borderColor="borderLight"
                marginBottom="xl"
                style={{
                  shadowColor: c.primary,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.08,
                  shadowRadius: 12,
                  elevation: 4,
                }}
              >
                <Box flexDirection="row" alignItems="center" marginBottom="m">
                  <Box
                    backgroundColor="primaryBg"
                    width={40}
                    height={40}
                    borderRadius="m"
                    alignItems="center"
                    justifyContent="center"
                    marginRight="m"
                  >
                    <Icon name={"lock-closed" as any} size={20} color={c.primary} />
                  </Box>
                  <Box flex={1}>
                    <Text variant="title" color="text" fontWeight="700" fontSize={16}>
                      Connexion sécurisée
                    </Text>
                    <Text variant="caption" color="textSecondary" marginTop="xs">
                      Via Keycloak — tous les opérateurs
                    </Text>
                  </Box>
                </Box>

                <Text variant="bodySmall" color="textTertiary" lineHeight={20}>
                  Connectez-vous avec vos identifiants professionnels.
                  Adhérents, Clients, Cabinets — une seule page de connexion.
                </Text>
              </Box>

              {/* Login Button */}
              <Button
                label={t('Se connecter')}
                onPress={() => promptAsync()}
                loading={loading || !request}
                disabled={!request}
                size="large"
                variant="primary"
              />

              <Box height={1} backgroundColor="border" width="100%" marginVertical="xl" />

              <Text variant="caption" color="textTertiary" textAlign="center">
                AssurPlus v1.0 — Portail Extranet Mobile
              </Text>
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
    paddingHorizontal: rsp.scale(28),
    paddingBottom: 40,
  },
});

export default LoginScreen;
