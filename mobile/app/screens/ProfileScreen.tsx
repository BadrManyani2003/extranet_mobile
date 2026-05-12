import React, { useRef, useEffect, useState } from 'react';
import {
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
  Animated,
  Linking,
  StyleSheet,
  Platform,
} from 'react-native';
import { useTheme } from '@shopify/restyle';
import { Ionicons as Icon } from '@expo/vector-icons';

import { useAuth } from '../context/AuthContext';
import { Theme } from '../theme/theme';
import { Box, Text } from '../theme/restyle';
import { getInitials } from '../hooks/useApiCall';
import AppHeader from '../components/layout/AppHeader';
import { Section, InfoRow, Button } from '../components/common';
import { rsp } from '../utils/responsive';
import { useTranslation } from '../utils/i18n';

const ProfileScreen: React.FC = () => {
  const theme = useTheme<Theme>();
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const [biometrics, setBiometrics] = useState(true);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, bounciness: 4, speed: 10, useNativeDriver: true }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      if (window.confirm(t('Confirmer déco'))) {
        logout();
      }
    } else {
      Alert.alert(t('Déconnexion'), t('Confirmer déco'), [
        { text: t('Annuler'), style: 'cancel' },
        { text: t('Se déconnecter'), style: 'destructive', onPress: logout },
      ]);
    }
  };

  const initials = getInitials(user?.nom || user?.email || 'U');

  return (
    <Box flex={1} backgroundColor="background">
      <AppHeader 
        title={t('Mon Profil')} 
        showBackButton={false} 
        rightIconName="log-out-outline"
        onRightIconPress={handleLogout}
      />

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
      >
        <Box backgroundColor="cardBackground" padding="l" borderBottomWidth={1} borderBottomColor="border" flexDirection="row" alignItems="center">
          <Box 
            width={60} 
            height={60} 
            borderRadius="round" 
            backgroundColor="primaryBg" 
            alignItems="center" 
            justifyContent="center"
            marginRight="m"
          >
            <Text variant="header" color="primary" fontSize={22} fontWeight="700">{initials}</Text>
          </Box>
          <Box flex={1}>
            <Text variant="title" color="text">{user?.nom || t('Utilisateur')}</Text>
            <Text variant="bodySmall" color="textSecondary">{user?.email}</Text>
          </Box>
        </Box>

        <Box marginTop="m">
          <Section title={t('INFORMATIONS')}>
            <InfoRow label={t('Nom')} value={user?.nom || '-'} icon="person-outline" />
            <InfoRow label={t('E-mail')} value={user?.email || '-'} icon="mail-outline" />
            <InfoRow label={t('Rôle')} value={user?.role || 'CLIENT'} icon="shield-outline" isLast />
          </Section>
        </Box>

        <Box marginTop="none">
          <Section title={t('SÉCURITÉ')}>
            <Box flexDirection="row" justifyContent="space-between" alignItems="center" paddingVertical="m" marginHorizontal="m">
              <Box flexDirection="row" alignItems="center">
                <Icon name="finger-print" size={20} color={theme.colors.textSecondary} style={{ marginRight: 12 }} />
                <Text variant="bodyMedium" color="text">{t('Authentification biométrique')}</Text>
              </Box>
              <Switch
                value={biometrics}
                onValueChange={setBiometrics}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                thumbColor="#FFF"
              />
            </Box>
          </Section>
        </Box>

        <Box paddingHorizontal="l" marginTop="xl">
          <Button 
            label={t('Se déconnecter')} 
            variant="error" 
            onPress={handleLogout} 
          />
        </Box>

        <Box marginTop="xl" padding="l" alignItems="center">
          <Text variant="caption" color="textTertiary">ASSURPLUS MOBILE v1.0</Text>
        </Box>
      </Animated.ScrollView>
    </Box>
  );
};

const styles = StyleSheet.create({});

export default ProfileScreen;
