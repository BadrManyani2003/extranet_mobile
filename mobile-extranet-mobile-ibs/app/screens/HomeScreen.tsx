import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
  Platform,
  Animated,
  Dimensions,
  StyleSheet,
} from 'react-native';
import { useTheme } from '@shopify/restyle';
import Icon from '@expo/vector-icons/Ionicons';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';

import { useAuth } from '../context/AuthContext';
import { policesAPI, quittancesAPI, sinistresAPI } from '../api';
import { Police, Quittance, Sinistre } from '../types';
import { Theme } from '../theme/theme';
import { Box, Text } from '../theme/restyle';
import { useApiCall, formatMontant } from '../hooks/useApiCall';
import AppHeader from '../components/layout/AppHeader';
import { RootStackParamList, TabParamList } from '../navigation/MainNavigator';
import { rsp } from '../utils/responsive';
import { useTranslation } from '../utils/i18n';
import { 
  LoadingSpinner, 
  ErrorView, 
  EmptyView, 
  AlertBanner,
  Button
} from '../components/common';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─────────────────────────────────────────────────────────────────
// KPI Card - Meta Inspired
// ─────────────────────────────────────────────────────────────────
interface KpiCardProps {
  icon: string;
  iconColor: string;
  iconBg: string;
  label: string;
  value: string | number;
  detail: string;
  delay?: number;
  onPress: () => void;
}

const KpiCard: React.FC<KpiCardProps> = ({
  icon, iconColor, iconBg, label, value, detail, delay = 0, onPress,
}) => {
  const theme = useTheme<Theme>();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(15)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, delay, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, bounciness: 4, speed: 10, delay, useNativeDriver: true }),
    ]).start();
  }, [delay, fadeAnim, slideAnim]);

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }], marginBottom: theme.spacing.s }}>
      <TouchableOpacity activeOpacity={0.9} onPress={onPress}>
        <Box 
          backgroundColor="cardBackground"
          borderRadius="l"
          padding="m"
          flexDirection="row"
          alignItems="center"
          borderWidth={Platform.OS === 'web' ? 1 : 0}
          borderColor="border"
          style={Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3 },
            android: { elevation: 2 },
            web: { boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
          })}
        >
          <Box 
            width={44} 
            height={44} 
            borderRadius="round"
            alignItems="center" 
            justifyContent="center"
            marginRight="m"
            backgroundColor={iconBg as any}
          >
            <Icon name={icon as any} size={22} color={iconColor} />
          </Box>

          <Box flex={1}>
            <Text variant="bodySmall" color="textSecondary" fontWeight="600" marginBottom="none">
              {label}
            </Text>
            <Box flexDirection="row" alignItems="baseline">
              <Text variant="header" fontSize={rsp.normalize(22)} color="text" marginRight="xs" fontWeight="700">
                {value}
              </Text>
              <Text variant="caption" color="textSecondary" fontWeight="600">
                {detail}
              </Text>
            </Box>
          </Box>

          <Icon name="chevron-forward" size={16} color={theme.colors.textTertiary} />
        </Box>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ─────────────────────────────────────────────────────────────────
// HomeScreen Component - Meta Style
// ─────────────────────────────────────────────────────────────────
type HomeScreenProps = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'Accueil'>,
  NativeStackScreenProps<RootStackParamList>
>;

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const theme = useTheme<Theme>();
  const { user, logout } = useAuth();
  const { t } = useTranslation();

  const policesCall = useApiCall<Police[]>();
  const quittancesCall = useApiCall<Quittance[]>();
  const sinistresCall = useApiCall<Sinistre[]>();
  const impayeesCall = useApiCall<Quittance[]>();

  const loadAll = useCallback(async () => {
    await Promise.allSettled([
      policesCall.execute(() => policesAPI.getAll()),
      quittancesCall.execute(() => quittancesAPI.getAll()),
      sinistresCall.execute(() => sinistresAPI.getAll()),
      impayeesCall.execute(() => quittancesAPI.getImpayees()),
    ]);
  }, []);

  const handleLogout = () => {
    console.log('🔘 Logout button pressed');
    Alert.alert(
      t('Déconnexion'),
      t('Confirmer déco'),
      [
        { text: t('Annuler'), style: 'cancel' },
        { text: t('Se déconnecter'), style: 'destructive', onPress: () => {
          console.log('✅ Confirmation received, calling logout');
          logout();
        }},
      ]
    );
  };


  useEffect(() => { loadAll(); }, [loadAll]);

  // Polling for "Real-time" Notifications (every 30 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      impayeesCall.execute(() => quittancesAPI.getImpayees(), true);
    }, 30000);
    return () => clearInterval(interval);
  }, []);


  // Refresh when screen focuses
  useFocusEffect(
    useCallback(() => {
      loadAll();
    }, [loadAll])
  );

  const isRefreshing = policesCall.loading || quittancesCall.loading || sinistresCall.loading;

  const polices = policesCall.data ?? [];
  const quittances = quittancesCall.data ?? [];
  const sinistres = sinistresCall.data ?? [];
  const impayees = impayeesCall.data ?? [];

  const totalPolices = polices.length;
  const policesActives = polices.filter(p => {
    const s = p.statut?.toUpperCase()?.trim();
    return s === 'EN VIGUEUR' || s === 'ACTIF' || s === 'VALIDE';
  }).length;

  const totalQuittances = quittances.length;
  const nbImpayees = impayees.length;
  const totalImpaye = impayees.reduce((s, q) => s + Number(q.montant_impaye || 0), 0);

  const totalSinistres = sinistres.length;
  const sinistresEnCours = sinistres.filter(s => s.etat?.trim() === 'E').length;

  const prenom = user?.nom?.split(' ')[0] || t('Assuré');

  return (
    <Box flex={1} backgroundColor="background">
      <AppHeader
        title="AssurPlus"
        showBackButton={false}
        leftIconName="log-out-outline"
        onBackPress={handleLogout}
        iconColor="textSecondary"
        rightIconName="notifications"
        showNotificationBadge={nbImpayees > 0}
        notificationCount={nbImpayees}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={loadAll} />
        }
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Profile Card / Feed-like Header */}
        <Box backgroundColor="cardBackground" padding="l" borderBottomWidth={1} borderBottomColor="border" marginBottom="s">
          <Box flexDirection="row" alignItems="center">
            <Box 
              width={60} 
              height={60} 
              borderRadius="round" 
              backgroundColor="backgroundGray"
              alignItems="center" 
              justifyContent="center"
              marginRight="m"
              borderWidth={1}
              borderColor="border"
            >
              <Text variant="subheader" color="primary" fontWeight="900" fontSize={26}>{prenom.charAt(0).toUpperCase()}</Text>
            </Box>
            <Box flex={1}>
              <Text variant="header" color="text" fontSize={rsp.normalize(24)} fontWeight="700">{t('Hey')}, {prenom} !</Text>
              <Text variant="bodySmall" color="textSecondary" fontWeight="600">{t('Votre protection est notre priorité')}</Text>
            </Box>
          </Box>
        </Box>

        {/* Alert Section */}
        {totalImpaye > 0 && (
          <Box paddingHorizontal="m" marginBottom="s">
            <AlertBanner
              message={`${t('Attention ! Solde Impayé')} : ${formatMontant(totalImpaye)}`}
              variant="error"
              onPress={() => navigation.navigate('Quittances')}
            />
          </Box>
        )}

        {/* Action Grid */}
        <Box paddingHorizontal="m" marginBottom="m">
          <Box flexDirection="row" justifyContent="space-between" style={{ gap: theme.spacing.s }}>
            {[
              { label: t('Déclarer un Sinistre'), icon: 'add-circle', colorKey: 'error', bgKey: 'errorBg', screen: 'Sinistres' },
              { label: t('Rayer une Facture'), icon: 'card', colorKey: 'success', bgKey: 'successBg', screen: 'Quittances' },
            ].map((item, i) => (
              <TouchableOpacity key={i} onPress={() => navigation.navigate(item.screen as any)} style={{ flex: 1 }}>
                <Box backgroundColor="cardBackground" padding="m" borderRadius="l" alignItems="center" marginVertical="xxs" style={styles.actionCard}>
                  <Box width={40} height={40} borderRadius="round" backgroundColor={item.bgKey as any} alignItems="center" justifyContent="center" marginBottom="s">
                    <Icon name={item.icon as any} size={20} color={theme.colors[item.colorKey as keyof Theme['colors']]} />
                  </Box>
                  <Text variant="bodySmall" fontWeight="700" color="text" textAlign="center">{item.label}</Text>
                </Box>
              </TouchableOpacity>
            ))}
          </Box>
        </Box>

        {/* KPI Feed */}
        <Box paddingHorizontal="m">
          <Box marginBottom="s" marginLeft="xs">
             <Text variant="bodyMedium" color="textSecondary" fontWeight="700" fontSize={14}>{t('VOTRE SITUATION EN UN COUP D\'OEIL')}</Text>
          </Box>
          <KpiCard
            icon="shield-checkmark"
            iconColor={theme.colors.primary}
            iconBg="primaryBg"
            label={t('Contrats d\'Assurance')}
            value={totalPolices}
            detail={`${policesActives} actifs`}
            delay={0}
            onPress={() => navigation.navigate('Contrats')}
          />
          <KpiCard
            icon="receipt"
            iconColor={theme.colors.success}
            iconBg="successBg"
            label={t('Mes Quittances')}
            value={totalQuittances}
            detail={`${nbImpayees} à régler`}
            delay={100}
            onPress={() => navigation.navigate('Quittances')}
          />
          <KpiCard
            icon="warning"
            iconColor={theme.colors.warning}
            iconBg="warningBg"
            label={t('Dossiers Sinistres')}
            value={totalSinistres}
            detail={`${sinistresEnCours} dossiers`}
            delay={200}
            onPress={() => navigation.navigate('Sinistres')}
          />
        </Box>

        {/* Discover Services */}
        <Box marginTop="m" paddingHorizontal="m">
           <Box backgroundColor="cardBackground" borderRadius="l" padding="m" style={styles.actionCard}>
              <Box flexDirection="row" alignItems="center" marginBottom="s">
                <Box backgroundColor="purpleBg" width={36} height={36} borderRadius="round" alignItems="center" justifyContent="center" marginRight="m">
                  <Icon name="rocket" size={18} color={theme.colors.purple} />
                </Box>
                <Text variant="title" fontSize={16} fontWeight="700">{t('Nos Services Premium')}</Text>
              </Box>
              <Text variant="bodySmall" color="textSecondary" marginBottom="m">{t('Explorez de nouvelles options pour protéger ce qui vous tient à cœur.')}</Text>
              <Button label={t('Découvrir les offres')} variant="secondary" size="small" onPress={() => {}} />
           </Box>
        </Box>

      </ScrollView>
    </Box>
  );
};

const styles = StyleSheet.create({
  actionCard: {
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3 },
      android: { elevation: 2 },
      web: { boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
    }),
  }
});

export default HomeScreen;
