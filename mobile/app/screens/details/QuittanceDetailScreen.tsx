import React from 'react';
import { ScrollView, TouchableOpacity, Share, Platform } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { Box, Text } from '../../theme/restyle';
import AppHeader from '../../components/layout/AppHeader';
import { InfoRow, StatusBadge, Section } from '../../components/common';
import { Ionicons as Icon } from '@expo/vector-icons';
import { Theme } from '../../theme/theme';
import { useTheme } from '@shopify/restyle';

const QuittanceDetailScreen = () => {
  const theme = useTheme<Theme>();
  const route = useRoute<any>();
  const { quittance } = route.params;

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '--/--/----';
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR');
  };

  const onShare = async () => {
    try {
      await Share.share({
        message: `Quittance N° ${quittance.numero} - Montant: ${quittance.montantTotal} - Statut: ${quittance.statut}`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Box flex={1} backgroundColor="background">
      <AppHeader title={quittance.numero} showBackButton={true} />

      <ScrollView contentContainerStyle={{ paddingBottom: 60, paddingTop: 10 }}>
        <Box height={20} />

        {/* Informations de la Quittance */}
        <Section title="Détails de la Quittance" icon="receipt-outline">
          <InfoRow label="N° Quittance" value={quittance.numero} icon="document-text-outline" />
          <InfoRow label="Police liée" value={quittance.police || '-'} icon="shield-checkmark-outline" valueColor="primary" />
          <InfoRow label="Période" value={`${formatDate(quittance.dateDebut)} - ${formatDate(quittance.dateFin)}`} icon="time-outline" />
          <InfoRow label="Statut" value={quittance.statut} icon="stats-chart-outline" valueColor={quittance.statut_variant === 'success' ? 'success' : 'warning'} isLast={true} />
        </Section>

        {/* Situation Financière */}
        <Section title="Situation Financière" icon="wallet-outline">
          <InfoRow label="Montant Total" value={`${quittance.montantTotal}`} icon="cash-outline" />
          <InfoRow label="Reste à Payer" value={`${quittance.montantImpaye || 0}`} icon="alert-circle-outline" valueColor={quittance.montantImpaye > 0 ? "error" : "success"} isLast={true} />
        </Section>
      </ScrollView>
    </Box>
  );
};

export default QuittanceDetailScreen;
