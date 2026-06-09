import React from 'react';
import { ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { Box, Text } from '../../theme/restyle';
import AppHeader from '../../components/layout/AppHeader';
import { InfoRow, StatusBadge, Section } from '../../components/common';
import { Ionicons as Icon } from '@expo/vector-icons';
import { Theme } from '../../theme/theme';
import { useTheme } from '@shopify/restyle';
import { rsp } from '../../utils/responsive';
import { useTranslation } from '../../utils/i18n';

const SinistreDetailScreen = () => {
  const { t } = useTranslation();
  const theme = useTheme<Theme>();
  const route = useRoute<any>();
  const { sinistre } = route.params;

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '--/--/----';
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR');
  };

  const isSante = sinistre.branche && sinistre.branche.toLowerCase().includes('sant');
  const isAT = sinistre.branche && (sinistre.branche.toLowerCase() === 'at' || sinistre.branche.toLowerCase().includes('accident') || sinistre.branche.toLowerCase().includes('travail'));

  return (
    <Box flex={1} backgroundColor="background">
      <AppHeader title={sinistre.numero} showBackButton={true} />
      
      <ScrollView contentContainerStyle={{ paddingBottom: 60, paddingTop: 10 }}>
        <Box height={20} />
        
        {/* Détails du Sinistre */}
        <Section title={t("Détails du Sinistre")} icon="alert-circle-outline">
          <InfoRow label={t("N° Sinistre")} value={sinistre.numero} icon="document-text-outline" />
          <InfoRow label={t("Police Associée")} value={sinistre.police || '-'} icon="shield-outline" />
          <InfoRow label={t("Branche")} value={sinistre.branche || '-'} icon="shield-checkmark-outline" />
          {isSante ? (
            <InfoRow label={t("Adhérent")} value={sinistre.objet || '-'} icon="person-outline" />
          ) : isAT ? (
            <InfoRow label={t("Assuré")} value={sinistre.objet || '-'} icon="person-outline" />
          ) : (
            <InfoRow label={t("Risque")} value={sinistre.objet || '-'} icon="shield-outline" />
          )}
          <InfoRow label={t("Date du Sinistre")} value={formatDate(sinistre.date)} icon="calendar-outline" />
          <InfoRow label={t("Date de Déclaration")} value={formatDate(sinistre.dateDeclaration)} icon="time-outline" />
          <InfoRow label={t("Statut")} value={sinistre.statut} icon="stats-chart-outline" valueColor={sinistre.statut_variant === 'success' ? 'success' : 'warning'} isLast={true} />
        </Section>

        {/* Informations Financières */}
        <Section title={t("Informations Financières")} icon="cash-outline">
          {isSante ? (
            <InfoRow label={t("Frais engagé")} value={`${sinistre.mtFrais || 0}`} icon="receipt-outline" />
          ) : (
            <InfoRow label={t("Montant Dommages")} value={`${sinistre.mtDommage || 0}`} icon="hammer-outline" />
          )}
          <InfoRow label={t("Franchise")} value={`${sinistre.mtFranchise || 0}`} icon="remove-circle-outline" valueColor="error" />
          <InfoRow label={t("Montant Remboursé")} value={`${sinistre.mtRembourse || 0}`} icon="checkmark-circle-outline" valueColor="success" isLast={true} />
        </Section>

        {/* Observations */}
        {sinistre.observation ? (
          <Section title={t("Observations")} icon="document-text-outline">
            <Box padding="m">
              <Text variant="bodySmall" color="textSecondary" lineHeight={22}>
                {sinistre.observation}
              </Text>
            </Box>
          </Section>
        ) : null}

      </ScrollView>
    </Box>
  );
};

export default SinistreDetailScreen;
