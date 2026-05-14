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
import { LinearGradient } from 'expo-linear-gradient';

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
        { text: t('Se déconnecter'), style: 'destructive', onPress: () => logout() },
      ]);
    }
  };

  const roles = user?.roles?.map(r => r.toUpperCase()) || [];
  const isAdherent = roles.includes('ADHERENT');
  const isExpert = roles.includes('EXPERT');

  return (
    <Box flex={1} backgroundColor="background">
      <AppHeader title={t('Mon Profil')} showBackButton={false} />
      
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {/* Profile Header with Gradient */}
        <Box 
          height={240} 
          marginBottom="xl"
          borderBottomLeftRadius="3xl"
          borderBottomRightRadius="3xl"
          overflow="hidden"
          style={{ elevation: 15, shadowColor: theme.colors.primary, shadowOpacity: 0.3, shadowRadius: 15 }}
        >
          <LinearGradient
            colors={[theme.colors.primary, theme.colors.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          
          <Box flex={1} alignItems="center" justifyContent="center" paddingTop="m">
            <Box 
              width={110} 
              height={110} 
              borderRadius="round" 
              backgroundColor="white" 
              alignItems="center" 
              justifyContent="center"
              marginBottom="m"
              padding="xxs"
              style={{ elevation: 10, shadowColor: theme.colors.primary, shadowOpacity: 0.2, shadowRadius: 10 }}
            >
               <Box 
                 width="100%" 
                 height="100%" 
                 borderRadius="round" 
                 backgroundColor="primaryBg" 
                 alignItems="center" 
                 justifyContent="center"
                 borderWidth={2}
                 borderColor="white"
               >
                 <Text variant="header" color="primary" fontSize={44} fontWeight="900">
                    {user?.nom?.charAt(0).toUpperCase()}
                 </Text>
               </Box>
            </Box>
            
            <Text variant="subheader" color="white" fontSize={24}>{user?.nom}</Text>
            <Text variant="bodySmall" color="white" style={{ opacity: 0.85 }} marginTop="xs">
              {user?.email}
            </Text>
          </Box>
        </Box>

        <Box paddingHorizontal="m">
          {/* Information Section */}
          <Section title="Informations Personnelles" icon="person-outline">
            <InfoRow label="Nom complet" value={user?.nom || '-'} icon="person-circle-outline" />
            <InfoRow label="Email" value={user?.email || '-'} icon="mail-outline" isLast={true} />
          </Section>

          {/* Adhérent Specific Section */}
          {isAdherent && (
            <Section title="Espace Adhérent" icon="people-outline">
              <TouchableOpacity 
                activeOpacity={0.7} 
                onPress={() => navigation.navigate('PersACharge')}
                style={{ padding: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
              >
                <Box flexDirection="row" alignItems="center">
                   <Box width={40} height={40} borderRadius="m" backgroundColor="primaryBg" alignItems="center" justifyContent="center" marginRight="m">
                      <Icon name="people-circle-outline" size={22} color={theme.colors.primary} />
                   </Box>
                   <Text variant="bodyMedium">Personnes à charge</Text>
                </Box>
                <Icon name="chevron-forward" size={20} color={theme.colors.textTertiary} />
              </TouchableOpacity>
            </Section>
          )}

          {/* Expert Specific Section */}
          {isExpert && (
            <Section title="Espace Expert" icon="briefcase-outline">
              <TouchableOpacity 
                activeOpacity={0.7} 
                style={{ padding: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
              >
                <Box flexDirection="row" alignItems="center">
                   <Box width={40} height={40} borderRadius="m" backgroundColor="successBg" alignItems="center" justifyContent="center" marginRight="m">
                      <Icon name="analytics-outline" size={22} color={theme.colors.success} />
                   </Box>
                   <Text variant="bodyMedium">Rapports d'expertise</Text>
                </Box>
                <Icon name="chevron-forward" size={20} color={theme.colors.textTertiary} />
              </TouchableOpacity>
            </Section>
          )}

          {/* Settings Section */}
          <Section title="Paramètres de Sécurité" icon="shield-checkmark-outline">
            <TouchableOpacity 
              activeOpacity={0.7}
              style={{ padding: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
            >
                <Box flexDirection="row" alignItems="center">
                   <Box width={40} height={40} borderRadius="m" backgroundColor="primaryBg" alignItems="center" justifyContent="center" marginRight="m">
                      <Icon name="lock-closed-outline" size={22} color={theme.colors.primary} />
                   </Box>
                   <Text variant="bodyMedium">Sécurité & Mot de passe</Text>
                </Box>
                <Icon name="chevron-forward" size={20} color={theme.colors.textTertiary} />
            </TouchableOpacity>
          </Section>

          {/* Logout Section */}
          <TouchableOpacity 
            onPress={handleLogout}
            activeOpacity={0.8}
            style={{ 
              backgroundColor: theme.colors.errorBg, 
              padding: 18, 
              borderRadius: 24, 
              flexDirection: 'row', 
              alignItems: 'center', 
              justifyContent: 'center',
              marginTop: 24,
              borderWidth: 1,
              borderColor: theme.colors.error,
              elevation: 4,
              shadowColor: theme.colors.error,
              shadowOpacity: 0.1,
              shadowRadius: 8
            }}
          >
            <Icon name="log-out-outline" size={22} color={theme.colors.error} style={{ marginRight: 10 }} />
            <Text variant="bodyMedium" color="error" fontWeight="900" style={{ textTransform: 'uppercase', letterSpacing: 1.5 }}>
              {t('Se déconnecter')}
            </Text>
          </TouchableOpacity>
        </Box>
      </ScrollView>
    </Box>
  );
};

export default ProfileScreen;
