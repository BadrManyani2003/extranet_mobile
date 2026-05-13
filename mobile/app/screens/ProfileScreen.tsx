import React from 'react';
import { StyleSheet, View, Alert, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from '../utils/i18n';
import { Box, Text } from '../theme/restyle';
import AppHeader from '../components/layout/AppHeader';
import { InfoRow, Section } from '../components/common';
import { useAuth } from '../context/AuthContext';
import { Ionicons as Icon } from '@expo/vector-icons';
import { useTheme } from '@shopify/restyle';
import { Theme } from '../theme/theme';

const ProfileScreen: React.FC = () => {
  const theme = useTheme<Theme>();
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const navigation = useNavigation<any>();

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

  const roles = user?.roles?.map(r => r.toUpperCase()) || [];
  const isAdherent = roles.includes('ADHERENT');

  return (
    <Box flex={1} backgroundColor="background">
      <AppHeader title={t('Mon Profil')} showBackButton={false} />
      
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Profile Header */}
        <Box 
          backgroundColor="primary" 
          paddingVertical="xxl" 
          alignItems="center"
          borderBottomLeftRadius="3xl"
          borderBottomRightRadius="3xl"
          marginBottom="xl"
        >
          <Box 
            width={100} 
            height={100} 
            borderRadius="round" 
            backgroundColor="white" 
            alignItems="center" 
            justifyContent="center"
            marginBottom="m"
            style={{ elevation: 10, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 10 }}
          >
             <Text variant="header" color="primary" fontSize={40}>
                {user?.nom?.charAt(0).toUpperCase()}
             </Text>
          </Box>
          <Text variant="subheader" color="white">{user?.nom}</Text>
          <Text variant="bodySmall" color="white" style={{ opacity: 0.7 }}>{user?.email}</Text>
        </Box>

        <Box paddingHorizontal="m">
          {/* Information Section */}
          <Section title="Informations Personnelles" icon="person-outline">
            <InfoRow label="Nom complet" value={user?.nom || '-'} icon="person-circle-outline" />
            <InfoRow label="Email" value={user?.email || '-'} icon="mail-outline" />
            <InfoRow label="Téléphone" value={user?.telephone || '-'} icon="call-outline" isLast={true} />
          </Section>

          {/* Adhérent Specific Section */}
          {isAdherent && (
            <Section title="Espace Adhérent" icon="people-outline">
              <TouchableOpacity 
                activeOpacity={0.7} 
                onPress={() => navigation.navigate('PersACharge')}
                style={{ padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
              >
                <Box flexDirection="row" alignItems="center">
                   <Box width={36} height={36} borderRadius="m" backgroundColor="primaryBg" alignItems="center" justifyContent="center" marginRight="m">
                      <Icon name="people-circle-outline" size={20} color={theme.colors.primary} />
                   </Box>
                   <Text variant="bodyMedium">Personnes à charge</Text>
                </Box>
                <Icon name="chevron-forward" size={20} color={theme.colors.textTertiary} />
              </TouchableOpacity>
            </Section>
          )}

          {/* Settings Section */}
          <Section title="Paramètres" icon="settings-outline">
            <TouchableOpacity style={{ padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box flexDirection="row" alignItems="center">
                   <Box width={36} height={36} borderRadius="m" backgroundColor="primaryBg" alignItems="center" justifyContent="center" marginRight="m">
                      <Icon name="notifications-outline" size={20} color={theme.colors.primary} />
                   </Box>
                   <Text variant="bodyMedium">Notifications</Text>
                </Box>
                <Icon name="chevron-forward" size={20} color={theme.colors.textTertiary} />
            </TouchableOpacity>
            <TouchableOpacity style={{ padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: theme.colors.borderLight }}>
                <Box flexDirection="row" alignItems="center">
                   <Box width={36} height={36} borderRadius="m" backgroundColor="primaryBg" alignItems="center" justifyContent="center" marginRight="m">
                      <Icon name="lock-closed-outline" size={20} color={theme.colors.primary} />
                   </Box>
                   <Text variant="bodyMedium">Sécurité & Mot de passe</Text>
                </Box>
                <Icon name="chevron-forward" size={20} color={theme.colors.textTertiary} />
            </TouchableOpacity>
          </Section>

          {/* Logout Section */}
          <TouchableOpacity 
            onPress={handleLogout}
            style={{ 
              backgroundColor: theme.colors.errorBg, 
              padding: 16, 
              borderRadius: 20, 
              flexDirection: 'row', 
              alignItems: 'center', 
              justifyContent: 'center',
              marginTop: 20,
              borderWidth: 1,
              borderColor: theme.colors.error
            }}
          >
            <Icon name="log-out-outline" size={20} color={theme.colors.error} style={{ marginRight: 8 }} />
            <Text variant="bodyMedium" color="error" fontWeight="800" style={{ textTransform: 'uppercase', letterSpacing: 1 }}>
              {t('Se déconnecter')}
            </Text>
          </TouchableOpacity>
        </Box>
      </ScrollView>
    </Box>
  );
};

export default ProfileScreen;
