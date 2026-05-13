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

  return (
    <Box flex={1} backgroundColor="background">
      <AppHeader title={`Sinistre ${sinistre.numero}`} showBackButton={true} />
      
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Header Summary */}
        <Box 
          backgroundColor="cardBackground" 
          margin="m" 
          borderRadius="l" 
          padding="l"
          borderWidth={1}
          borderColor="borderLight"
          style={Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8 },
            android: { elevation: 2 },
            web: { boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }
          })}
        >
          <Box flexDirection="row" justifyContent="space-between" alignItems="center" marginBottom="m">
            <Box backgroundColor="errorBg" padding="s" borderRadius="m">
              <Icon name="warning" size={24} color={theme.colors.error} />
            </Box>
            <StatusBadge label={sinistre.statut} variant={sinistre.statut_variant || 'warning'} />
          </Box>

          <Text variant="title" fontWeight="900" fontSize={24} color="text" marginBottom="xs">
            {sinistre.objet || 'Sinistre sans titre'}
          </Text>
          <Text variant="body" color="textSecondary" marginBottom="l">
            ID: {sinistre.identifiant || '-'}
          </Text>

          <Box height={1} backgroundColor="borderLight" marginBottom="m" />

          <Box flexDirection="row" flexWrap="wrap">
            <Box width="50%" marginBottom="m">
              <Text variant="caption" color="textTertiary">N° Sinistre</Text>
              <Text variant="body" fontWeight="700">{sinistre.numero}</Text>
            </Box>
            <Box width="50%" marginBottom="m">
              <Text variant="caption" color="textTertiary">Date Sinistre</Text>
              <Text variant="body" fontWeight="700">{formatDate(sinistre.date)}</Text>
            </Box>
            <Box width="50%">
              <Text variant="caption" color="textTertiary">Déclaration</Text>
              <Text variant="body" fontWeight="700">{formatDate(sinistre.dateDeclaration)}</Text>
            </Box>
            <Box width="50%">
              <Text variant="caption" color="textTertiary">Statut</Text>
              <Text variant="body" fontWeight="700">{sinistre.statut}</Text>
            </Box>
          </Box>
        </Box>

        {/* Financial Details */}
        <Section title="Informations Financières" icon="cash-outline">
          <InfoRow label="Montant Dommages" value={`${sinistre.mtDommage || 0} DH`} icon="hammer-outline" />
          <InfoRow label="Montant Frais" value={`${sinistre.mtFrais || 0} DH`} icon="receipt-outline" />
          <InfoRow label="Franchise" value={`${sinistre.mtFranchise || 0} DH`} icon="remove-circle-outline" valueColor="error" />
          <InfoRow label="Montant Remboursé" value={`${sinistre.mtRembourse || 0} DH`} icon="checkmark-circle-outline" valueColor="success" isLast={true} />
        </Section>

        {/* Observations */}
        {sinistre.observation ? (
          <Section title="Observations" icon="document-text-outline">
            <Box padding="m">
              <Text variant="body" color="textSecondary" lineHeight={22}>
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
