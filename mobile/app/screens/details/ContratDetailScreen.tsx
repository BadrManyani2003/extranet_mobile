import React, { useState, useEffect } from 'react';
import { ScrollView, RefreshControl, TouchableOpacity, Animated, Platform } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Box, Text } from '../../theme/restyle';
import AppHeader from '../../components/layout/AppHeader';
import { InfoRow, StatusBadge, LoadingSpinner, Section } from '../../components/common';
import { Ionicons as Icon } from '@expo/vector-icons';
import { Theme } from '../../theme/theme';
import { useTheme } from '@shopify/restyle';
import { dataAPI, quittancesAPI, adherentsAPI } from '../../api';
import { rsp } from '../../utils/responsive';

const ContratDetailScreen = () => {
  const theme = useTheme<Theme>();
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { police } = route.params;

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [risques, setRisques] = useState<any[]>([]);
  const [quittances, setQuittances] = useState<any[]>([]);
  const [adherents, setAdherents] = useState<any[]>([]);

  const fetchData = async () => {
    try {
      const [statsRes, risquesRes, quittancesRes, adherentsRes] = await Promise.all([
        dataAPI.getStatsByPolice(police.id),
        dataAPI.getRisques(police.id),
        quittancesAPI.getAll(police.id),
        adherentsAPI.getAll(police.id)
      ]);

      setStats(statsRes);
      setRisques(risquesRes);
      setQuittances(quittancesRes);
      setAdherents(adherentsRes);
    } catch (error) {
      console.error("Erreur chargement détails contrat:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [police.id]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '--/--/----';
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR');
  };

  if (loading && !refreshing) return <LoadingSpinner />;

  return (
    <Box flex={1} backgroundColor="background">
      <AppHeader title={`Police ${police.police}`} showBackButton={true} />
      
      <ScrollView 
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Header Card */}
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
            <Box backgroundColor="primaryBg" padding="s" borderRadius="m">
              <Icon name="shield-checkmark" size={24} color={theme.colors.primary} />
            </Box>
            <StatusBadge label={police.statut} variant={police.statut_variant || 'primary'} />
          </Box>

          <Text variant="title" fontWeight="900" fontSize={24} color="text" marginBottom="xs">
            {police.branche}
          </Text>
          <Text variant="body" color="textSecondary" marginBottom="l">
            Compagnie: {police.compagnie}
          </Text>

          <Box height={1} backgroundColor="borderLight" marginBottom="m" />

          <Box flexDirection="row" flexWrap="wrap">
            <Box width="50%" marginBottom="m">
              <Text variant="caption" color="textTertiary">N° Police</Text>
              <Text variant="body" fontWeight="700">{police.police}</Text>
            </Box>
            <Box width="50%" marginBottom="m">
              <Text variant="caption" color="textTertiary">Échéance</Text>
              <Text variant="body" fontWeight="700">{formatDate(police.dateEcheance)}</Text>
            </Box>
            <Box width="50%">
              <Text variant="caption" color="textTertiary">Client</Text>
              <Text variant="body" fontWeight="700">{police.client}</Text>
            </Box>
            <Box width="50%">
              <Text variant="caption" color="textTertiary">Module</Text>
              <Text variant="body" fontWeight="700">{police.module || '-'}</Text>
            </Box>
          </Box>
        </Box>

        {/* Stats Section */}
        {stats && (
          <Section title="Résumé Financier" icon="analytics-outline">
            <Box flexDirection="row" justifyContent="space-around" paddingVertical="m">
              <Box alignItems="center">
                <Text variant="caption" color="textTertiary">Risques</Text>
                <Text variant="title" color="text" fontSize={20}>{stats.nbRisques || 0}</Text>
              </Box>
              <Box alignItems="center">
                <Text variant="caption" color="textTertiary">Impayés</Text>
                <Text variant="title" color="error" fontSize={20}>{stats.impayes || 0} DH</Text>
              </Box>
              <Box alignItems="center">
                <Text variant="caption" color="textTertiary">Sinistres</Text>
                <Text variant="title" color="warning" fontSize={20}>{stats.nbSinistres || 0}</Text>
              </Box>
            </Box>
          </Section>
        )}

        {/* Risques Section */}
        {risques.length > 0 && (
          <Section title="Objets Assurés (Risques)" icon="car-sport-outline">
            {risques.map((risque, index) => (
              <Box 
                key={risque.id} 
                padding="m" 
                borderBottomWidth={index === risques.length - 1 ? 0 : 1}
                borderColor="borderLight"
              >
                <Box flexDirection="row" justifyContent="space-between" alignItems="center">
                  <Box flex={1}>
                    <Text variant="body" fontWeight="700">{risque.nom}</Text>
                    <Text variant="caption" color="textTertiary">{risque.identifiant} • {risque.description}</Text>
                  </Box>
                  <Icon name="chevron-forward" size={20} color={theme.colors.textTertiary} />
                </Box>
              </Box>
            ))}
          </Section>
        )}

        {/* Adhérents Section */}
        {adherents.length > 0 && (
          <Section title="Bénéficiaires (Adhérents)" icon="people-outline">
            {adherents.map((adherent, index) => (
              <Box 
                key={adherent.id} 
                padding="m" 
                borderBottomWidth={index === adherents.length - 1 ? 0 : 1}
                borderColor="borderLight"
              >
                <Box flexDirection="row" justifyContent="space-between" alignItems="center">
                  <Box flex={1}>
                    <Text variant="body" fontWeight="700">{adherent.nom}</Text>
                    <Text variant="caption" color="textTertiary">N° Adhésion: {adherent.numAdhesion}</Text>
                  </Box>
                  <StatusBadge label={adherent.actif === 'O' ? 'Actif' : 'Inactif'} variant={adherent.actif === 'O' ? 'success' : 'neutral'} />
                </Box>
              </Box>
            ))}
          </Section>
        )}

        {/* Dernières Quittances */}
        {quittances.length > 0 && (
          <Section title="Dernières Quittances" icon="receipt-outline">
            {quittances.slice(0, 3).map((q, index) => (
              <TouchableOpacity 
                key={q.id} 
                onPress={() => navigation.navigate('QuittanceDetail', { quittance: q })}
              >
                <Box 
                  padding="m" 
                  borderBottomWidth={index === Math.min(quittances.length, 3) - 1 ? 0 : 1}
                  borderColor="borderLight"
                  flexDirection="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Box>
                    <Text variant="bodySmall" fontWeight="700">N° {q.numero}</Text>
                    <Text variant="caption" color="textTertiary">{formatDate(q.dateDebut)} - {formatDate(q.dateFin)}</Text>
                  </Box>
                  <Box alignItems="flex-end">
                    <Text variant="bodySmall" fontWeight="700" color="primary">{q.montantTotal} DH</Text>
                    <StatusBadge label={q.statut} variant={q.statut_variant || 'neutral'} size="small" />
                  </Box>
                </Box>
              </TouchableOpacity>
            ))}
            {quittances.length > 3 && (
              <TouchableOpacity onPress={() => navigation.navigate('Quittances', { policeId: police.id })}>
                <Text variant="bodySmall" color="primary" textAlign="center" padding="m" fontWeight="700">Voir toutes les quittances</Text>
              </TouchableOpacity>
            )}
          </Section>
        )}
      </ScrollView>
    </Box>
  );
};

export default ContratDetailScreen;
