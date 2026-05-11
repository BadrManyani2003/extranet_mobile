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
import { sinistresAPI } from '../api';
import { Sinistre } from '../types';
import { useApiCall, formatDate } from '../hooks/useApiCall';
import { Theme } from '../theme/theme';
import { Box, Text } from '../theme/restyle';
import { rsp } from '../utils/responsive';
import { useTranslation } from '../utils/i18n';
import { LoadingSpinner, ErrorView, EmptyView, InfoRow, Section, StatusBadge, Button, CardUp, SummaryCard } from '../components/common';
import AppHeader from '../components/layout/AppHeader';

// ─── Business Logic Hook ─────────────────────────────────────────────────────
const useSinistres = () => {
  const { data, loading, error, execute } = useApiCall<Sinistre[]>();

  const load = React.useCallback(() => {
    execute(() => sinistresAPI.getAll());
  }, [execute]);


  React.useEffect(() => { load(); }, [load]);

  const sortedData = useMemo(() => 
    (data || []).sort((a, b) => b.id - a.id), 
  [data]);

  const stats = useMemo(() => {
    const enCours = sortedData.filter(s => s.etat?.trim() === 'E').length;
    return { total: sortedData.length, enCours };
  }, [sortedData]);

  return { sinistres: sortedData, stats, loading, error, refresh: load };
};

// ─── Internal Components ─────────────────────────────────────────────────────
const SinistreDetailModal: React.FC<{
  sinistre: Sinistre;
  visible: boolean;
  onClose: () => void;
}> = ({ sinistre, visible, onClose }) => {
  const { t } = useTranslation();
  const isEnCours = sinistre.etat?.trim() === 'E';

  return (
    <CardUp visible={visible} onClose={onClose} title={t('Détail du Sinistre')} subtitle={`Dossier N° ${sinistre.id}`}>
      <FlatList
        data={['identite', 'expertise', 'lieu']}
        keyExtractor={item => item}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          if (item === 'identite') return (
            <Section title={t('IDENTITÉ DU DOSSIER')} padding>
               <InfoRow label={t('Police')} value={sinistre.num_police || '-'} icon="shield-checkmark" />
               <InfoRow label={t('Compagnie')} value={sinistre.compagnie || t('NON PRÉCISÉ')} icon="business" />
               <InfoRow label={t('État Dossier')} value={isEnCours ? t('EN COURS') : t('CLÔTURÉ')} valueColor={isEnCours ? 'warning' : 'success'} icon="flag" isLast />
            </Section>
          );
          if (item === 'expertise') return (
            <Section title={t('DÉCLARATION & ÉVÉNEMENT')} padding>
               <InfoRow label={t('Date Sinistre')} value={formatDate(sinistre.date_sinistre)} icon="calendar" />
               <InfoRow label={t('Date Décl.')} value={formatDate(sinistre.date_dec_client)} icon="time-outline" />
               <InfoRow label={t('Expertise')} value={sinistre.sort || t('EN ATTENTE')} icon="analytics-outline" isLast />
            </Section>
          );
          return (
            <Section title={t('INFORMATIONS TERRAIN')} padding>
               <InfoRow label={t('Lieu')} value={sinistre.lieu_sinistre || t('NON PRÉCISÉ')} icon="navigate-circle" />
               <InfoRow label={t('Responsable')} value={sinistre.responsable === 1 ? t('OUI') : t('NON')} valueColor={sinistre.responsable === 1 ? 'error' : 'success'} icon="person-circle" isLast />
            </Section>
          );
        }}
        ListFooterComponent={
          <Box paddingHorizontal="l" marginTop="m" paddingBottom="xl">
            <Button label={t('Prendre Rendez-vous Expert')} variant="primary" icon="calendar-outline" onPress={() => {}} />
            <Button label={t('Partager le dossier')} variant="secondary" icon="share-social-outline" style={{ marginTop: 12 }} onPress={() => {}} />
          </Box>
        }
      />
    </CardUp>
  );
};

const SinistreItem: React.FC<{ item: Sinistre; onPress: () => void }> = ({ item, onPress }) => {
  const theme = useTheme<Theme>();
  const isEnCours = item.etat?.trim() === 'E';

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
               <Box backgroundColor={isEnCours ? "warning" : "success"} width={24} height={24} borderRadius="round" alignItems="center" justifyContent="center" marginRight="s">
                  <Icon name={isEnCours ? "alert-circle" : "checkmark-done"} size={12} color="white" />
               </Box>
               <Text variant="labelBold" color="text" fontSize={12} fontWeight="700">DOSSIER SINISTRE</Text>
            </Box>
            <StatusBadge label={isEnCours ? 'OUVERT' : 'CLÔTURÉ'} variant={isEnCours ? 'warning' : 'success'} />
          </Box>

          <Box padding="m" borderBottomWidth={1} borderBottomColor="border">
             <Text variant="bodySmall" color="textSecondary" fontWeight="600">ID #{item.id}</Text>
             <Text variant="title" color="text" fontSize={rsp.normalize(18)} fontWeight="700" marginVertical="xxs">{item.branche || 'Automobile'}</Text>
             <Text variant="bodySmall" color="textSecondary" fontWeight="600">Police: {item.num_police || '-'}</Text>
          </Box>

          <Box paddingHorizontal="m" paddingVertical="s" flexDirection="row" justifyContent="space-between" alignItems="center">
             <Box flexDirection="row" alignItems="center">
               <Icon name="calendar-outline" size={12} color={theme.colors.textSecondary} style={{ marginRight: 6 }} />
               <Text variant="caption" color="textSecondary" fontWeight="700">DU {formatDate(item.date_sinistre)}</Text>
             </Box>
             <Icon name="chevron-forward" size={16} color={theme.colors.textTertiary} />
          </Box>
        </Box>
    </TouchableOpacity>
  );
};

// ─── Main Screen Component - Meta Style ──────────────────────────────────────
const SinistreScreen: React.FC = () => {
  const theme = useTheme<Theme>();
  const { user } = useAuth();
  const { sinistres, stats, loading, error, refresh } = useSinistres();
  const [selected, setSelected] = useState<Sinistre | null>(null);

  return (
    <Box flex={1} backgroundColor="background">
      <AppHeader 
        title="Sinistres" 
        showBackButton={false} 
        rightIconName="alert-circle" 
      />

      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refresh} />
        }
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        <Box paddingVertical="xl" paddingHorizontal="m">
            <Text variant="header" color="text" fontSize={rsp.normalize(26)} fontWeight="700">Mes Dossiers Sinistres</Text>
            <Text variant="bodySmall" color="textSecondary" fontWeight="600">Suivi en temps réel de vos déclarations d'experts</Text>
        </Box>

        <Box marginBottom="m">
          <SummaryCard 
              title="Suivi de Dossiers" 
              subtitle="Statistiques de vos incidents en attente." 
              icon="flash-outline" 
              amount={stats.enCours.toString()} 
              amountLabel="EN COURS DE TRAITEMENT"
              variant={stats.enCours > 0 ? 'warning' : 'success'}
          />
        </Box>

        <Box paddingHorizontal="m" marginBottom="m">
           <Text variant="bodyMedium" color="textSecondary" fontWeight="700" fontSize={14} marginLeft="xs">LISTE DES SINISTRES DÉCLARÉS</Text>
        </Box>

        {loading && sinistres.length === 0 ? (
          <LoadingSpinner message="Récupération des dossiers..." />
        ) : error ? (
          <ErrorView message={error} onRetry={refresh} />
        ) : sinistres.length === 0 ? (
          <EmptyView message="Aucun sinistre déclaré." icon="alert-outline" />
        ) : (
          <Box>
            {sinistres.map((item) => (
              <SinistreItem key={item.id} item={item} onPress={() => setSelected(item)} />
            ))}
          </Box>
        )}
      </ScrollView>

      {selected && (
        <SinistreDetailModal
          sinistre={selected}
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
      web: { boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
    }),
  }
});

export default SinistreScreen;
