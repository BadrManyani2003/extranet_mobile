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
      Animated.spring(logoScale,  { toValue: 1, bounciness: 4, useNativeDriver: Platform.OS !== 'web' }),
      Animated.timing(opacity,    { toValue: 1, duration: 800, useNativeDriver: Platform.OS !== 'web' }),
      Animated.spring(formSlide,  { toValue: 0, bounciness: 4, speed: 10, delay: 100, useNativeDriver: Platform.OS !== 'web' }),
    ]).start();

    // 🚀 Redirection automatique vers Keycloak dès que la requête est prête
    if (request && !loading && !errorMsg && !response) {
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

      // 🛑 Restriction stricte : Seuls les Adhérents et Clients peuvent se connecter
      if (!isAdherent && !isClient) {
        setErrorMsg("Accès non autorisé. Cette application est exclusivement réservée aux Adhérents et Clients.");
        setLoading(false);
        return;
      }

      // Détermination de la source pour les futures requêtes API
      const userSource: 'ADHERENT' | 'CLIENT' = isAdherent ? 'ADHERENT' : 'CLIENT';

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
                style={Platform.select({
                  ios: {
                    shadowColor: c.primary,
                    shadowOffset: { width: 0, height: 12 },
                    shadowOpacity: 0.35,
                    shadowRadius: 20,
                  },
                  android: { elevation: 12 },
                  web: { boxShadow: `0 12px 20px ${c.primary}59` }
                })}
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

              {/* Login Section / Auto-redirect */}
              <Box
                backgroundColor="cardBackground"
                borderRadius="xl"
                padding="xl"
                borderWidth={1}
                borderColor="borderLight"
                marginBottom="xl"
                alignItems="center"
                style={Platform.select({
                  ios: {
                    shadowColor: c.primary,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.08,
                    shadowRadius: 12,
                  },
                  android: { elevation: 4 },
                  web: { boxShadow: `0 4px 12px ${c.primary}14` }
                })}
              >
                {!errorMsg ? (
                  <>
                    <Box
                      backgroundColor="primaryBg"
                      width={60}
                      height={60}
                      borderRadius="round"
                      alignItems="center"
                      justifyContent="center"
                      marginBottom="m"
                    >
                      <Icon name="lock-closed" size={28} color={c.primary} />
                    </Box>
                    <Text variant="title" color="text" fontWeight="700" fontSize={18} textAlign="center">
                      Connexion sécurisée
                    </Text>
                    <Text variant="bodySmall" color="textSecondary" marginTop="s" textAlign="center">
                      Redirection vers la page de connexion Keycloak...
                    </Text>
                    <Box marginTop="l">
                      <Button
                        label={t('Se connecter')}
                        onPress={() => promptAsync()}
                        loading={loading || !request}
                        disabled={!request}
                        variant="primary"
                        size="medium"
                      />
                    </Box>
                  </>
                ) : (
                   <AlertBanner message={errorMsg} variant="error" />
                )}
              </Box>

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
