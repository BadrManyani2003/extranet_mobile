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
import { Ionicons as Icon } from '@expo/vector-icons';

import { useAuth } from '../context/AuthContext';
import { quittancesAPI } from '../api';
import { Quittance } from '../types';
import { useApiCall, formatDate, formatMontant } from '../hooks/useApiCall';
import { Theme } from '../theme/theme';
import { Box, Text } from '../theme/restyle';
import { rsp } from '../utils/responsive';
import { LoadingSpinner, ErrorView, EmptyView, InfoRow, Section, StatusBadge, Button, CardUp, SummaryCard } from '../components/common';
import AppHeader from '../components/layout/AppHeader';

// ─── Business Logic Hook ─────────────────────────────────────────────────────
const useQuittances = () => {
  const { data, loading, error, execute } = useApiCall<Quittance[]>();

  const load = React.useCallback(() => {
    execute(() => quittancesAPI.getAll());
  }, [execute]);


  React.useEffect(() => { load(); }, [load]);

  const sortedData = useMemo(() => 
    (data || []).sort((a, b) => b.id - a.id), 
  [data]);

  const stats = useMemo(() => {
    const totalImpaye = sortedData.reduce((s, q) => s + Number(q.montant_impaye || 0), 0);
    const nbImpayees = sortedData.filter(q => Number(q.montant_impaye || 0) > 0).length;
    return { totalImpaye, nbImpayees };
  }, [sortedData]);

  return { quittances: sortedData, stats, loading, error, refresh: load };
};

// ─── Internal Components ─────────────────────────────────────────────────────
const QuittanceDetailModal: React.FC<{
  quittance: Quittance;
  visible: boolean;
  onClose: () => void;
  onPay?: () => void;
}> = ({ quittance, visible, onClose, onPay }) => {
  const isImpaye = Number(quittance.montant_impaye || 0) > 0;
  


  return (
    <CardUp visible={visible} onClose={onClose} title="Récapitulatif Financier" subtitle={`Quittance N° ${quittance.num_quittance}`}>
      <FlatList
        data={['info', 'dates', 'financial']}
        keyExtractor={item => item}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          if (item === 'info') return (
            <Section title="Informations Dossier" padding>
               <InfoRow label="Référence" value={quittance.num_quittance} icon="finger-print" />
               <InfoRow label="Branche" value={quittance.branche || 'NON SPÉCIFIÉ'} icon="layers" />
               <InfoRow label="État Dossier" value={quittance.statut} valueColor={quittance.statut_variant as any} icon="shield-checkmark" isLast />
            </Section>
          );
          if (item === 'dates') return (
            <Section title="Période Validité" padding>
               <InfoRow label="Début de Garantie" value={formatDate(quittance.date_effet)} icon="play-circle" />
               <InfoRow label="Fin de Garantie" value={formatDate(quittance.date_echeance)} icon="stop-circle" isLast />
            </Section>
          );
          return (
            <Section title="Détail Financier" padding>
               <InfoRow label="Prime à Échoir" value={formatMontant(quittance.prime_totale)} valueColor="text" icon="cash" />
               <InfoRow label="Montant Régularisé" value={formatMontant(quittance.montant_encaisse)} valueColor="success" icon="checkmark-circle" />
               <InfoRow label="Solde à Régler" value={formatMontant(quittance.montant_impaye)} valueColor="error" icon="alert-circle" isLast />
            </Section>
          );
        }}
        ListFooterComponent={
          <Box paddingHorizontal="l" marginTop="m" paddingBottom="xl">
            {isImpaye ? (
              <Button label="Régulariser Maintenant" variant="primary" icon="card-outline" onPress={() => onPay?.()} />
            ) : (
              <Button label="Obtenir mon Reçu" variant="secondary" icon="document-text-outline" onPress={() => {}} />
            )}
          </Box>
        }
      />
    </CardUp>
  );
};

const QuittanceItem: React.FC<{ item: Quittance; index: number; onPress: () => void; onPay?: () => void }> = ({ item, index, onPress, onPay }) => {
  const theme = useTheme<Theme>();
  const isImpaye = Number(item.montant_impaye || 0) > 0;



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
               <Box backgroundColor="primary" width={24} height={24} borderRadius="round" alignItems="center" justifyContent="center" marginRight="s">
                  <Icon name="receipt" size={12} color="white" />
               </Box>
               <Text variant="labelBold" color="text" fontSize={12} fontWeight="700">{item.branche || 'Assurance'}</Text>
            </Box>
            <StatusBadge label={item.statut} variant={item.statut_variant as any} />
          </Box>

          <Box padding="m" borderBottomWidth={1} borderBottomColor="border">
            <Box flexDirection="row" justifyContent="space-between" alignItems="flex-start">
               <Box flex={1}>
                  <Text variant="bodySmall" color="textSecondary" fontWeight="600">RÉF. {item.num_quittance}</Text>
                  <Text variant="title" color="text" fontSize={rsp.normalize(22)} fontWeight="700" marginBottom="none">{formatMontant(item.prime_totale)}</Text>
                  <Text variant="bodySmall" color="textSecondary" fontWeight="600">Police N°: {item.police_num || '-'}</Text>
               </Box>
                <TouchableOpacity onPress={isImpaye ? onPay : onPress}>
                   <Box 
                     backgroundColor={isImpaye ? "error" : "buttonSecondaryBg"} 
                     paddingHorizontal="m" 
                     paddingVertical="xxs" 
                     borderRadius="s"
                     minWidth={rsp.scale(80)}
                     alignItems="center"
                   >
                      <Text 
                        variant="caption" 
                        color={isImpaye ? "white" : "text"} 
                        fontWeight="700" 
                        fontSize={rsp.normalize(11)}
                      >
                        {isImpaye ? 'RÉGLER' : 'DÉTAILS'}
                      </Text>
                   </Box>
                </TouchableOpacity>
            </Box>
          </Box>

          <Box paddingHorizontal="m" paddingVertical="s" flexDirection="row" justifyContent="space-between" alignItems="center">
             <Text variant="caption" color="textSecondary" fontWeight="600">Dû: <Text fontWeight="800" color={isImpaye ? "error" : "success"}>{formatMontant(item.montant_impaye)}</Text></Text>
             <Text variant="caption" color="textSecondary" fontWeight="600">{formatDate(item.date_effet)}</Text>
          </Box>
        </Box>
    </TouchableOpacity>
  );
};

// ─── Main Screen Component - Meta Style ──────────────────────────────────────
const QuittanceScreen: React.FC = () => {
  const theme = useTheme<Theme>();
  const { user } = useAuth();
  const { quittances, stats, loading, error, refresh } = useQuittances();
  const [selected, setSelected] = useState<Quittance | null>(null);

  return (
    <Box flex={1} backgroundColor="background">
      <AppHeader 
        title="Facturation" 
        showBackButton={false} 
        rightIconName="receipt" 
      />

      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refresh} />
        }
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        <Box paddingVertical="xl" paddingHorizontal="m">
            <Text variant="header" color="text" fontSize={rsp.normalize(26)} fontWeight="700">Votre Solde Actuel</Text>
            <Text variant="bodySmall" color="textSecondary" fontWeight="600">Récapitulatif de vos quittances et règlements</Text>
        </Box>

        <Box marginBottom="m">
          <SummaryCard 
              title="Situation Globale" 
              subtitle="Montant total des impayés à régler." 
              icon="wallet" 
              amount={formatMontant(stats.totalImpaye)} 
              amountLabel="SOLDE À RÉGLER"
              variant={stats.totalImpaye > 0 ? 'error' : 'success'}
          />
        </Box>

        <Box paddingHorizontal="m" marginBottom="m">
           <Text variant="bodyMedium" color="textSecondary" fontWeight="700" fontSize={14} marginLeft="xs">HISTORIQUE DES PAIEMENTS</Text>
        </Box>

        {loading && quittances.length === 0 ? (
          <LoadingSpinner message="Calcul du solde..." />
        ) : error ? (
          <ErrorView message={error} onRetry={refresh} />
        ) : quittances.length === 0 ? (
          <EmptyView message="Aucun document trouvé." icon="receipt-outline" />
        ) : (
          <Box>
            {quittances.map((item, idx) => (
              <QuittanceItem key={item.id} item={item} index={idx} onPress={() => setSelected(item)} onPay={() => {}} />
            ))}
          </Box>
        )}
      </ScrollView>

      {selected && (
        <QuittanceDetailModal
          quittance={selected}
          visible={!!selected}
          onClose={() => setSelected(null)}
          onPay={() => {}}
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

export default QuittanceScreen;
