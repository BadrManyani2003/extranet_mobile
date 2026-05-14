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

const SinistreDetailScreen = () => {
  const theme = useTheme<Theme>();
  const route = useRoute<any>();
  const { sinistre } = route.params;

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '--/--/----';
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR');
  };

  const isSante = sinistre.branche && sinistre.branche.toLowerCase().includes('sant');

  return (
    <Box flex={1} backgroundColor="background">
      <AppHeader title={`Sinistre ${sinistre.numero}`} showBackButton={true} />
      
      <ScrollView contentContainerStyle={{ paddingBottom: 40, paddingTop: 10 }}>
        <Box height={10} />
        
        {/* Détails du Sinistre */}
        <Section title="Détails du Sinistre" icon="alert-circle-outline">
          <InfoRow label="N° Sinistre" value={sinistre.numero} icon="document-text-outline" />
          <InfoRow label="Branche" value={sinistre.branche || '-'} icon="shield-checkmark-outline" />
          {isSante ? (
            <InfoRow label="Adhérent" value={sinistre.objet || '-'} icon="person-outline" />
          ) : (
            <InfoRow label="Risque" value={sinistre.objet || '-'} icon="car-sport-outline" />
          )}
          <InfoRow label="Date du Sinistre" value={formatDate(sinistre.date)} icon="calendar-outline" />
          <InfoRow label="Date de Déclaration" value={formatDate(sinistre.dateDeclaration)} icon="time-outline" />
          <InfoRow label="Statut" value={sinistre.statut} icon="stats-chart-outline" valueColor={sinistre.statut_variant === 'success' ? 'success' : 'warning'} isLast={true} />
        </Section>

        {/* Informations Financières */}
        <Section title="Informations Financières" icon="cash-outline">
          {isSante ? (
            <InfoRow label="Frais engagé" value={`${sinistre.mtFrais || 0} DH`} icon="receipt-outline" />
          ) : (
            <InfoRow label="Montant Dommages" value={`${sinistre.mtDommage || 0} DH`} icon="hammer-outline" />
          )}
          <InfoRow label="Franchise" value={`${sinistre.mtFranchise || 0} DH`} icon="remove-circle-outline" valueColor="error" />
          <InfoRow label="Montant Remboursé" value={`${sinistre.mtRembourse || 0} DH`} icon="checkmark-circle-outline" valueColor="success" isLast={true} />
        </Section>

        {/* Observations */}
        {sinistre.observation ? (
          <Section title="Observations" icon="document-text-outline">
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
