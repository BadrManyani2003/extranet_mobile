import React, { useState, useMemo } from 'react';
import {
  RefreshControl,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Platform,
  StyleSheet,
} from 'react-native';
import { useTheme } from '@shopify/restyle';
import Icon from '@expo/vector-icons/Ionicons';

import { useAuth } from '../context/AuthContext';
import { policesAPI } from '../api';
import { Police } from '../types';
import { useApiCall, formatDate } from '../hooks/useApiCall';
import { Theme } from '../theme/theme';
import { Box, Text } from '../theme/restyle';
import { rsp } from '../utils/responsive';
import { LoadingSpinner, ErrorView, EmptyView, InfoRow, Section, StatusBadge, Button, CardUp } from '../components/common';
import AppHeader from '../components/layout/AppHeader';

// ─── Business Logic Hook ─────────────────────────────────────────────────────
const usePolices = () => {
  const { data, loading, error, execute } = useApiCall<Police[]>();

  const load = React.useCallback(() => {
    execute(() => policesAPI.getAll());
  }, [execute]);


  React.useEffect(() => { load(); }, [load]);

  const sortedData = useMemo(() => 
    (data || []).sort((a, b) => b.id - a.id), 
  [data]);

  const stats = useMemo(() => {
    const actives = sortedData.filter(p => {
      const s = p.statut?.toUpperCase()?.trim();
      return s === 'EN VIGUEUR' || s === 'ACTIF' || s === 'VALIDE';
    }).length;
    return { total: sortedData.length, actives };
  }, [sortedData]);

  return { polices: sortedData, stats, loading, error, refresh: load };
};

// ─── Internal Components ─────────────────────────────────────────────────────
const ContratDetailModal: React.FC<{
  police: Police;
  visible: boolean;
  onClose: () => void;
}> = ({ police, visible, onClose }) => {
  const getStatusVariant = (statut: string) => {
    const s = statut?.toUpperCase()?.trim();
    if (s === 'EN VIGUEUR' || s === 'ACTIF' || s === 'VALIDE') return 'success';
    if (s === 'ÉCHU' || s === 'EXPIRÉ' || s === 'RÉSILLIÉ') return 'error';
    return 'neutral';
  };

  return (
    <CardUp visible={visible} onClose={onClose} title="Expertise Contrat" subtitle={`Police N° ${police.num_police}`}>
      <FlatList
        data={['contrat', 'assure', 'dates']}
        keyExtractor={item => item}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          if (item === 'contrat') return (
            <Section title="VOTRE CONTRAT" padding>
               <InfoRow label="Identifiant" value={police.num_police} icon="card" />
               <InfoRow label="Branche" value={police.branche} icon="layers" />
               <InfoRow label="État Dossier" value={police.statut} valueColor={getStatusVariant(police.statut) as any} icon={getStatusVariant(police.statut) === 'success' ? 'checkmark-circle' : 'alert-circle'} isLast />
            </Section>
          );
          if (item === 'assure') return (
            <Section title="VOTRE PROTECTION" padding>
               <InfoRow label="Compagnie" value={police.compagnie} icon="business" />
               <InfoRow label="Assuré" value={police.assure || '-'} icon="person" isLast />
            </Section>
          );
          return (
            <Section title="VALIDITÉ" padding>
               <InfoRow label="Depuis le" value={formatDate(police.date_souscription)} icon="play" />
               <InfoRow label="Jusqu'au" value={formatDate(police.date_echeance)} icon="stop" isLast />
            </Section>
          );
        }}
        ListFooterComponent={
          <Box paddingHorizontal="l" marginTop="m" paddingBottom="xl">
            <Button label="Demande de renouvellement" variant="primary" icon="refresh-outline" onPress={() => {}} />
            <Button label="Imprimer l'attestation" variant="secondary" icon="print-outline" style={{ marginTop: 12 }} onPress={() => {}} />
          </Box>
        }
      />
    </CardUp>
  );
};

const ContratItem: React.FC<{ item: Police; onPress: () => void }> = ({ item, onPress }) => {
  const theme = useTheme<Theme>();
  const getStatusVariant = (statut: string) => {
    const s = statut?.toUpperCase()?.trim();
    if (s === 'EN VIGUEUR' || s === 'ACTIF' || s === 'VALIDE') return 'success';
    if (s === 'ÉCHU' || s === 'EXPIRÉ' || s === 'RÉSILLIÉ') return 'error';
    return 'neutral';
  };

  const isSuccess = getStatusVariant(item.statut) === 'success';

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress}>
        <Box 
          backgroundColor="cardBackground"
          borderRadius="l"
          marginHorizontal="m"
          marginBottom="m"
          overflow="hidden"
          style={styles.card}
        >
          <Box paddingHorizontal="m" paddingVertical="s" backgroundColor="backgroundGray" flexDirection="row" justifyContent="space-between" alignItems="center">
            <Box flexDirection="row" alignItems="center">
               <Box backgroundColor={isSuccess ? "success" : "error"} width={24} height={24} borderRadius="round" alignItems="center" justifyContent="center" marginRight="s">
                  <Icon name={isSuccess ? "shield-checkmark" : "shield-half"} size={12} color="white" />
               </Box>
               <Text variant="labelBold" color="text" fontSize={12} fontWeight="700">{item.branche?.toUpperCase() || 'ASSURANCE'}</Text>
            </Box>
            <StatusBadge label={item.statut} variant={getStatusVariant(item.statut) as any} />
          </Box>

          <Box padding="m" borderBottomWidth={1} borderBottomColor="border">
             <Text variant="bodySmall" color="textSecondary" fontWeight="600">POLICE #{item.num_police}</Text>
             <Text variant="title" color="text" fontSize={rsp.normalize(18)} fontWeight="700" marginVertical="xxs">{item.compagnie}</Text>
             <Text variant="bodySmall" color="textSecondary" fontWeight="600">Assuré: {item.assure || '-'}</Text>
          </Box>

          <Box paddingHorizontal="m" paddingVertical="s" flexDirection="row" justifyContent="space-between" alignItems="center">
             <Box flexDirection="row" alignItems="center">
               <Icon name="calendar-outline" size={12} color={theme.colors.textSecondary} style={{ marginRight: 6 }} />
               <Text variant="caption" color="textSecondary" fontWeight="600">SOUSCRIT LE {formatDate(item.date_souscription)}</Text>
             </Box>
             <Icon name="chevron-forward" size={16} color={theme.colors.textTertiary} />
          </Box>
        </Box>
    </TouchableOpacity>
  );
};

// ─── Main Screen Component - Meta Style ──────────────────────────────────────
const ContratScreen: React.FC = () => {
  const theme = useTheme<Theme>();
  const { user } = useAuth();
  const { polices, stats, loading, error, refresh } = usePolices();
  const [selected, setSelected] = useState<Police | null>(null);

  return (
    <Box flex={1} backgroundColor="background">
      <AppHeader 
        title="Mes Contrats" 
        showBackButton={false} 
        rightIconName="shield" 
      />

      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refresh} />
        }
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        <Box paddingVertical="xl" paddingHorizontal="m">
            <Text variant="header" color="text" fontSize={rsp.normalize(26)} fontWeight="700">Portefeuille Assurances</Text>
            <Text variant="bodySmall" color="textSecondary" fontWeight="600">Gérez vos garanties et attestations en un clic</Text>
        </Box>

        <Box paddingHorizontal="m" marginBottom="l">
          <Box backgroundColor="cardBackground" borderRadius="l" padding="m" style={styles.card} flexDirection="row" alignItems="center">
             <Box backgroundColor="primaryBg" width={48} height={48} borderRadius="round" alignItems="center" justifyContent="center" marginRight="m">
                <Text variant="header" color="primary" fontSize={22} fontWeight="900">{stats.actives}</Text>
             </Box>
             <Box flex={1}>
                <Text variant="title" fontSize={16} fontWeight="700">Contrats Actifs</Text>
                <Text variant="bodySmall" color="textSecondary">Votre protection est à jour sur {stats.total} dossiers.</Text>
             </Box>
          </Box>
        </Box>

        <Box paddingHorizontal="m" marginBottom="m">
           <Text variant="bodyMedium" color="textSecondary" fontWeight="700" fontSize={14} marginLeft="xs">VOS POLICES EN VIGUEUR</Text>
        </Box>

        {loading && polices.length === 0 ? (
          <LoadingSpinner message="Recherche des polices..." />
        ) : error ? (
          <ErrorView message={error} onRetry={refresh} />
        ) : polices.length === 0 ? (
          <EmptyView message="Aucun contrat découvert." icon="shield-outline" />
        ) : (
          <Box>
            {polices.map((item) => (
              <ContratItem key={item.id} item={item} onPress={() => setSelected(item)} />
            ))}
          </Box>
        )}
      </ScrollView>

      {selected && (
        <ContratDetailModal
          police={selected}
          visible={!!selected}
          onClose={() => setSelected(null)}
        />
      )}
    </Box>
  );
};

const styles = StyleSheet.create({
  card: {
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3 },
      android: { elevation: 2 },
    }),
  }
});

export default ContratScreen;
