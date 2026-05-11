import React, { useRef, useEffect, useState } from 'react';
import {
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
  Platform,
  Animated,
  Linking,
  StyleSheet,
} from 'react-native';
import { useTheme } from '@shopify/restyle';
import Icon from '@expo/vector-icons/Ionicons';

import { useAuth } from '../context/AuthContext';
import { useThemeContext } from '../context/ThemeContext';
import { Theme } from '../theme/theme';
import { Box, Text } from '../theme/restyle';
import { getInitials } from '../hooks/useApiCall';
import AppHeader from '../components/layout/AppHeader';
import { Section, InfoRow, Button, StatusBadge } from '../components/common';
import { rsp } from '../utils/responsive';
import { useTranslation } from '../utils/i18n';

// ─── Profile Screen Component - Meta Inspired ────────────────────────────────
const ProfileScreen: React.FC = () => {
  const theme = useTheme<Theme>();
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useThemeContext();
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
    Alert.alert(
      t('Déconnexion'),
      t('Confirmer déco'),
      [
        { text: t('Annuler'), style: 'cancel' },
        { text: t('Se déconnecter'), style: 'destructive', onPress: logout },
      ]
    );
  };

  const contactAgency = (type: 'tel' | 'mail' | 'map') => {
    let url = '';
    if (type === 'tel') url = `tel:${process.env.EXPO_PUBLIC_AGENCE_TEL}`;
    else if (type === 'mail') url = `mailto:${process.env.EXPO_PUBLIC_AGENCE_MAIL}`;
    else if (type === 'map') url = process.env.EXPO_PUBLIC_AGENCE_MAP || '';
    
    if (url) Linking.openURL(url);
  };

  const initials = getInitials(user?.nom || user?.email || 'U');

  return (
    <Box flex={1} backgroundColor="background">
      <AppHeader 
        title={t('Menu')} 
        showBackButton={false} 
        rightIconName="log-out-outline"
        onRightIconPress={handleLogout}
        iconColor="error"
      />

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
        style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
      >
        {/* User Card - Facebook Style */}
        <TouchableOpacity activeOpacity={0.7}>
          <Box backgroundColor="cardBackground" padding="l" borderBottomWidth={1} borderBottomColor="border" flexDirection="row" alignItems="center">
            <Box 
              width={64} 
              height={64} 
              borderRadius="round" 
              backgroundColor="backgroundGray" 
              alignItems="center" 
              justifyContent="center"
              marginRight="m"
              borderWidth={1}
              borderColor="border"
            >
              <Text variant="header" color="primary" fontSize={26} fontWeight="900">{initials}</Text>
            </Box>
            <Box flex={1}>
              <Text variant="header" color="text" fontSize={rsp.normalize(22)} fontWeight="700">{user?.nom || t('Utilisateur')}</Text>
              <Text variant="bodySmall" color="textSecondary" fontWeight="600">{t('Voir profil pro')}</Text>
            </Box>
            <Icon name="chevron-forward" size={20} color={theme.colors.textTertiary} />
          </Box>
        </TouchableOpacity>

        {/* Informational Group */}
        <Box marginTop="m">
          <Section title={t('INFOS PERSONNELLES')}>
            <InfoRow label={t('Nom')} value={user?.nom || '-'} icon="person" />
            <InfoRow label={t('E-mail')} value={user?.email || '-'} icon="mail" />
            <InfoRow label={t('Rôle')} value={user?.role || 'CLIENT'} icon="shield-checkmark" isLast />
          </Section>
        </Box>

        {/* Agency Support Section - Meta Business Style */}
        <Box marginTop="none">
          <Section title={t('AGENCE CONSEIL')}>
            <Box padding="m" borderBottomWidth={1} borderBottomColor="border">
              <Box flexDirection="row" alignItems="center">
                <Box backgroundColor="primary" width={40} height={40} borderRadius="round" alignItems="center" justifyContent="center" marginRight="m">
                  <Icon name="business" size={20} color="white" />
                </Box>
                <Box flex={1}>
                  <Text variant="bodyLarge" fontWeight="700" color="text">{process.env.EXPO_PUBLIC_AGENCE_NOM || 'Agence Conseil'}</Text>
                  <Text variant="bodySmall" color="textSecondary">{process.env.EXPO_PUBLIC_AGENCE_DESC || 'Expert Courtier'}</Text>
                </Box>
              </Box>
            </Box>
            <Box flexDirection="row" justifyContent="space-around" paddingVertical="m">
              <TouchableOpacity onPress={() => contactAgency('tel')} style={styles.actionBtn}>
                <Icon name="call" size={20} color={theme.colors.primary} />
                <Text variant="bodySmall" color="primary" fontWeight="700" marginTop="xxs">{t('Appeler')}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => contactAgency('mail')} style={styles.actionBtn}>
                <Icon name="chatbubble-ellipses" size={20} color={theme.colors.success} />
                <Text variant="bodySmall" color="success" fontWeight="700" marginTop="xxs">{t('Message')}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => contactAgency('map')} style={styles.actionBtn}>
                <Icon name="location" size={20} color={theme.colors.error} />
                <Text variant="bodySmall" color="error" fontWeight="700" marginTop="xxs">{t('Localiser')}</Text>
              </TouchableOpacity>
            </Box>
          </Section>
        </Box>

        {/* Settings Group */}
        <Box marginTop="none">
          <Section title={t('PARAMÈTRES')}>
            <Box flexDirection="row" justifyContent="space-between" alignItems="center" paddingVertical="m" marginHorizontal="m" borderBottomWidth={1} borderBottomColor="border">
              <Box flexDirection="row" alignItems="center">
                <Box backgroundColor="backgroundGray" width={32} height={32} borderRadius="round" alignItems="center" justifyContent="center" marginRight="m">
                  <Icon name={isDark ? 'moon' : 'sunny'} size={18} color="#65676B" />
                </Box>
                <Text variant="bodyMedium" color="text" fontWeight="600">{t('Mode Sombre')}</Text>
              </Box>
              <Switch
                value={isDark}
                onValueChange={toggleTheme}
                trackColor={{ false: '#B0B3B8', true: theme.colors.primary }}
                thumbColor="#FFF"
              />
            </Box>
            <Box flexDirection="row" justifyContent="space-between" alignItems="center" paddingVertical="m" marginHorizontal="m">
              <Box flexDirection="row" alignItems="center">
                <Box backgroundColor="backgroundGray" width={32} height={32} borderRadius="round" alignItems="center" justifyContent="center" marginRight="m">
                  <Icon name="finger-print" size={18} color="#65676B" />
                </Box>
                <Text variant="bodyMedium" color="text" fontWeight="600">{t('Biométrie')}</Text>
              </Box>
              <Switch
                value={biometrics}
                onValueChange={setBiometrics}
                trackColor={{ false: '#B0B3B8', true: theme.colors.primary }}
                thumbColor="#FFF"
              />
            </Box>
          </Section>
        </Box>

        {/* Utility Group */}
        <Box marginTop="none">
          <Section title={t('ASSISTANCE LÉGAL')}>
            <TouchableOpacity style={styles.menuItem}>
              <Box backgroundColor="backgroundGray" width={32} height={32} borderRadius="round" alignItems="center" justifyContent="center" marginRight="m">
                <Icon name="help-circle" size={18} color="#65676B" />
              </Box>
              <Text variant="bodyMedium" color="text" fontWeight="600" flex={1}>{t('Centre Assistance')}</Text>
              <Icon name="chevron-forward" size={16} color={theme.colors.textTertiary} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.menuItem, { borderBottomWidth: 0 }]}>
              <Box backgroundColor="backgroundGray" width={32} height={32} borderRadius="round" alignItems="center" justifyContent="center" marginRight="m">
                <Icon name="document-text" size={18} color="#65676B" />
              </Box>
              <Text variant="bodyMedium" color="text" fontWeight="600" flex={1}>{t('Cond Utilisation')}</Text>
              <Icon name="chevron-forward" size={16} color={theme.colors.textTertiary} />
            </TouchableOpacity>
          </Section>
        </Box>

        <Box paddingHorizontal="l" marginTop="l">
          <Button 
            label={t('Se déconnecter')} 
            variant="error" 
            icon="log-out"
            onPress={handleLogout} 
          />
        </Box>

        <Box marginTop="xl" padding="xl" alignItems="center">
          <Text variant="caption" color="textTertiary" fontWeight="600">ASSURPLUS MOBILE • VERSION 2.1.0 (Expert)</Text>
        </Box>
      </Animated.ScrollView>
    </Box>
  );
};

const styles = StyleSheet.create({
  actionBtn: { 
    alignItems: 'center', 
    justifyContent: 'center', 
    padding: 10,
    width: 90
  },
  menuItem: {
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingVertical: 12, 
    marginHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E4E6EB'
  }
});

export default ProfileScreen;
