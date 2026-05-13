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
        message: `Quittance N° ${quittance.numero} - Montant: ${quittance.montantTotal} DH - Statut: ${quittance.statut}`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Box flex={1} backgroundColor="background">
      <AppHeader title={`Quittance ${quittance.numero}`} showBackButton={true} />
      
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Receipt Header */}
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
            <Box backgroundColor="successBg" padding="s" borderRadius="m">
              <Icon name="receipt" size={24} color={theme.colors.success} />
            </Box>
            <StatusBadge label={quittance.statut} variant={quittance.statut_variant || 'neutral'} />
          </Box>

          <Text variant="caption" color="textTertiary">Montant Total</Text>
          <Text variant="title" fontWeight="900" fontSize={32} color="text" marginBottom="l">
            {quittance.montantTotal} <Text variant="body" fontWeight="700">DH</Text>
          </Text>

          <Box height={1} backgroundColor="borderLight" marginBottom="m" />

          <Box flexDirection="row" flexWrap="wrap">
            <Box width="50%" marginBottom="m">
              <Text variant="caption" color="textTertiary">N° Quittance</Text>
              <Text variant="body" fontWeight="700">{quittance.numero}</Text>
            </Box>
            <Box width="50%" marginBottom="m">
              <Text variant="caption" color="textTertiary">Échéance</Text>
              <Text variant="body" fontWeight="700" color="error">{formatDate(quittance.dateEcheance)}</Text>
            </Box>
            <Box width="50%">
              <Text variant="caption" color="textTertiary">Début Période</Text>
              <Text variant="body" fontWeight="700">{formatDate(quittance.dateDebut)}</Text>
            </Box>
            <Box width="50%">
              <Text variant="caption" color="textTertiary">Fin Période</Text>
              <Text variant="body" fontWeight="700">{formatDate(quittance.dateFin)}</Text>
            </Box>
          </Box>
        </Box>

        {/* Payment Details */}
        <Section title="Détails du Paiement" icon="card-outline">
          <InfoRow label="Montant Total" value={`${quittance.montantTotal} DH`} icon="wallet-outline" />
          <InfoRow label="Reste à Payer" value={`${quittance.montantImpaye || 0} DH`} icon="alert-circle-outline" valueColor={quittance.montantImpaye > 0 ? "error" : "success"} isLast={true} />
        </Section>

        {/* Action Buttons */}
        <Box padding="m" gap="m">
          {quittance.montantImpaye > 0 && (
            <TouchableOpacity 
              style={{ 
                backgroundColor: theme.colors.primary, 
                padding: 16, 
                borderRadius: 12, 
                flexDirection: 'row', 
                justifyContent: 'center', 
                alignItems: 'center' 
              }}
            >
              <Icon name="card" size={20} color="white" style={{ marginRight: 8 }} />
              <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>Payer maintenant</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity 
            onPress={onShare}
            style={{ 
              backgroundColor: theme.colors.cardBackground, 
              padding: 16, 
              borderRadius: 12, 
              borderWidth: 1,
              borderColor: theme.colors.border,
              flexDirection: 'row', 
              justifyContent: 'center', 
              alignItems: 'center' 
            }}
          >
            <Icon name="share-outline" size={20} color={theme.colors.primary} style={{ marginRight: 8 }} />
            <Text style={{ color: theme.colors.primary, fontWeight: 'bold', fontSize: 16 }}>Partager / Imprimer</Text>
          </TouchableOpacity>
        </Box>
      </ScrollView>
    </Box>
  );
};

export default QuittanceDetailScreen;
