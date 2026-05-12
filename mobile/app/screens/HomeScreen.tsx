import React, { useCallback, useEffect, useState } from 'react';
import {
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from 'react-native';
import { useTheme } from '@shopify/restyle';
import { Ionicons as Icon } from '@expo/vector-icons';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';

import { useAuth } from '../context/AuthContext';
import { policesAPI, quittancesAPI, sinistresAPI, reclamationsAPI } from '../api';
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
  AlertBanner,
  SummaryCard
} from '../components/common';

type HomeScreenProps = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'Accueil'>,
  NativeStackScreenProps<RootStackParamList>
>;

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const theme = useTheme<Theme>();
  const { user, logout } = useAuth();
  const { t } = useTranslation();

  const policesCall = useApiCall<Police[]>();
  const impayeesCall = useApiCall<Quittance[]>();
  const sinistresCall = useApiCall<Sinistre[]>();
  const reclamationsCall = useApiCall<any[]>();
  
  const userRoles = user?.roles || [];
  const hasClientRole = userRoles.some(r => r.toLowerCase() === 'client' || r.toLowerCase() === 'admincab' || r.toLowerCase() === 'comercialcab');

  const loadAll = useCallback(async () => {
    await Promise.allSettled([
      policesCall.execute(() => policesAPI.getAll()),
      impayeesCall.execute(() => quittancesAPI.getImpayees()),
      sinistresCall.execute(() => sinistresAPI.getEnCours()),
      reclamationsCall.execute(() => reclamationsAPI.getAll()),
    ]);
  }, []);

  const handleLogout = () => {
    Alert.alert(t('Déconnexion'), t('Confirmer déco'), [
      { text: t('Annuler'), style: 'cancel' },
      { text: t('Se déconnecter'), style: 'destructive', onPress: logout },
    ]);
  };

  useEffect(() => { loadAll(); }, [loadAll]);

  useFocusEffect(
    useCallback(() => {
      loadAll();
    }, [loadAll])
  );

  const isRefreshing = policesCall.loading || impayeesCall.loading || sinistresCall.loading;
  const impayees = impayeesCall.data ?? [];
  const totalImpaye = impayees.reduce((s, q) => s + Number(q.montant_impaye || 0), 0);
  const prenom = user?.nom?.split(' ')[0] || t('Assuré');

  return (
    <Box flex={1} backgroundColor="background">
      <AppHeader
        title="AssurPlus"
        showBackButton={false}
        leftIconName="log-out-outline"
        onBackPress={handleLogout}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={loadAll} colors={[theme.colors.primary]} />}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <Box padding="l">
          <Text variant="header" color="text">{t('Bonjour')}, {prenom}</Text>
          <Text variant="bodySmall" color="textSecondary" marginTop="xxs">{t('Résumé de vos contrats.')}</Text>
        </Box>

        {totalImpaye > 0 && (
          <Box paddingHorizontal="l" marginBottom="m">
            <AlertBanner
              message={`${t('Impayé')} : ${formatMontant(totalImpaye)}`}
              variant="error"
              onPress={() => navigation.navigate('Quittances')}
            />
          </Box>
        )}

        <Box paddingHorizontal="l" style={{ gap: theme.spacing.m }}>
          {hasClientRole && (
            <SummaryCard 
              title={t('Mes Contrats')} 
              subtitle={t("Consultation de vos polices")}
              icon="shield-checkmark" 
              amount={(policesCall.data?.length || 0).toString()} 
              amountLabel={t('ACTIFS')}
              variant="primary"
            />
          )}

          <SummaryCard 
            title={t('Sinistres')} 
            subtitle={t('Suivi de vos dossiers')}
            icon="warning" 
            amount={(sinistresCall.data?.length || 0).toString()} 
            amountLabel={t('DÉCLARÉS')}
            variant="warning"
          />

          <TouchableOpacity onPress={() => navigation.navigate('Reclamations' as any)}>
            <Box 
              backgroundColor="cardBackground" 
              padding="m" 
              borderRadius="m" 
              borderWidth={1} 
              borderColor="border"
              flexDirection="row"
              alignItems="center"
            >
              <Box backgroundColor="primaryBg" width={40} height={40} borderRadius="round" alignItems="center" justifyContent="center" marginRight="m">
                <Icon name="chatbubble-ellipses" size={20} color={theme.colors.primary} />
              </Box>
              <Box flex={1}>
                <Text variant="title" fontSize={16}>{t("Mes Demandes")}</Text>
                <Text variant="bodySmall">{t("Consulter vos messages")}</Text>
              </Box>
              <Icon name="chevron-forward" size={16} color={theme.colors.textTertiary} />
            </Box>
          </TouchableOpacity>
        </Box>
      </ScrollView>
    </Box>
  );
};

export default HomeScreen;
