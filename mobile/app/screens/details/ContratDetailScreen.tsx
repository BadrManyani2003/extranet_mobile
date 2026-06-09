import React, { useState, useEffect } from 'react';
import { ScrollView, RefreshControl, TouchableOpacity, Animated, Platform, ActivityIndicator, LayoutAnimation } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Box, Text } from '../../theme/restyle';
import AppHeader from '../../components/layout/AppHeader';
import { InfoRow, StatusBadge, LoadingSpinner, Section } from '../../components/common';
import { Ionicons as Icon } from '@expo/vector-icons';
import { Theme } from '../../theme/theme';
import { useTheme } from '@shopify/restyle';
import { dataAPI, quittancesAPI } from '../../api';
import { rsp } from '../../utils/responsive';
import { useTranslation } from '../../utils/i18n';

const ContratDetailScreen = () => {
  const { t } = useTranslation();
  const theme = useTheme<Theme>();
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { police } = route.params;
  const isAT = police.branche && (police.branche.toLowerCase() === 'at' || police.branche.toLowerCase().includes('accident') || police.branche.toLowerCase().includes('travail'));

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [risques, setRisques] = useState<any[]>([]);
  const [quittances, setQuittances] = useState<any[]>([]);
  const [expandedRisqueId, setExpandedRisqueId] = useState<number | null>(null);
  const [garantiesMap, setGarantiesMap] = useState<Record<number, any[]>>({});
  const [garantiesLoading, setGarantiesLoading] = useState<Record<number, boolean>>({});

  const fetchData = async () => {
    try {
      const [statsRes, risquesRes, quittancesRes] = await Promise.all([
        dataAPI.getStatsByPolice(police.id),
        dataAPI.getRisques(police.id),
        quittancesAPI.getAll(police.id)
      ]);

      setStats(statsRes);
      setRisques(risquesRes);
      setQuittances(quittancesRes);
    } catch (error) {
      console.error("Erreur chargement détails contrat:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const toggleRisque = async (risqueId: number) => {
    if (expandedRisqueId === risqueId) {
      setExpandedRisqueId(null);
      return;
    }
    
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedRisqueId(risqueId);
    
    if (!garantiesMap[risqueId]) {
      setGarantiesLoading(prev => ({ ...prev, [risqueId]: true }));
      try {
        const res = await dataAPI.getGaranties(risqueId);
        setGarantiesMap(prev => ({ ...prev, [risqueId]: res }));
      } catch (err) {
        console.error("Erreur garanties:", err);
      } finally {
        setGarantiesLoading(prev => ({ ...prev, [risqueId]: false }));
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, [police.id]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const translateRisqueNom = (nom: string) => {
    if (!nom) return '';
    const lower = nom.toLowerCase().trim();
    if (lower === 'ensemble de personnel' || lower === 'ensemble de parsonelle' || lower.includes('personnel') || lower.includes('parsonelle')) {
      return t('Ensemble de personnel');
    }
    if (lower === 'liste nominative' || lower.includes('nominative')) {
      return t('Liste nominative');
    }
    return nom;
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '--/--/----';
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR');
  };

  if (loading && !refreshing) return <LoadingSpinner />;

  return (
    <Box flex={1} backgroundColor="background">
      <AppHeader title={police.police} showBackButton={true} />
      
      <ScrollView 
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={{ paddingBottom: 60, paddingTop: 10 }}
      >
        <Box height={20} />
        {/* Informations Générales */}
        <Section title={t("Informations du Contrat")} icon="information-circle-outline">
          <InfoRow label={t("Branche")} value={police.branche} icon="shield-checkmark-outline" />
          <InfoRow label={t("Compagnie")} value={police.compagnie} icon="business-outline" />
          <InfoRow label={t("Date d'échéance")} value={formatDate(police.dateEcheance)} icon="calendar-outline" />
          <InfoRow label={t("Statut")} value={police.statut} icon="stats-chart-outline" valueColor={police.statut_variant === 'success' ? 'success' : 'warning'} isLast={true} />
        </Section>

        {/* Stats Section */}
        {stats && (
          <Section title={t("Résumé Financier")} icon="analytics-outline">
            <Box flexDirection="row" justifyContent="space-around" paddingVertical="m">
              <Box alignItems="center" flex={1}>
                <Text variant="caption" color="textTertiary">{isAT ? t("Assurés") : t("Risques")}</Text>
                <Text variant="title" color="text" fontSize={isAT ? 13 : 20} textAlign="center" numberOfLines={1}>
                  {isAT ? (risques.length > 0 ? t('Liste nominative') : t('Ensemble de personnel')) : (stats.nbRisques || 0)}
                </Text>
              </Box>
              <Box alignItems="center" flex={1}>
                <Text variant="caption" color="textTertiary">{t("Impayés")}</Text>
                <Text variant="title" color="error" fontSize={20}>{stats.impayes || 0}</Text>
              </Box>
              <Box alignItems="center" flex={1}>
                <Text variant="caption" color="textTertiary">{t("Sinistres")}</Text>
                <Text variant="title" color="warning" fontSize={20}>{stats.nbSinistres || 0}</Text>
              </Box>
            </Box>
          </Section>
        )}

        {/* Risques Section */}
        {risques.length > 0 && (
          <Section title={isAT ? t("Assurés") : t("Objets Assurés (Risques)")} icon="shield-outline">
            {risques.map((risque, index) => {
              const isExpanded = expandedRisqueId === risque.id;
              const gList = garantiesMap[risque.id] || [];
              const isLoadingG = garantiesLoading[risque.id];

              return (
                <Box 
                  key={risque.id} 
                  borderBottomWidth={index === risques.length - 1 ? 0 : 1}
                  borderColor="borderLight"
                >
                  {isAT ? (
                    <Box padding="l" flexDirection="row" justifyContent="space-between" alignItems="center">
                      <Box flex={1}>
                        <Text variant="body" fontWeight="700">{risque.nom}</Text>
                        <Text variant="caption" color="textTertiary">{t("Identifiant")}: {risque.identifiant || '-'}</Text>
                      </Box>
                    </Box>
                  ) : (
                    <TouchableOpacity activeOpacity={0.7} onPress={() => toggleRisque(risque.id)}>
                      <Box padding="l" flexDirection="row" justifyContent="space-between" alignItems="center">
                        <Box flex={1}>
                          <Text variant="body" fontWeight="700">{risque.nom}</Text>
                          <Text variant="caption" color="textTertiary">{risque.identifiant} • {risque.description}</Text>
                        </Box>
                        <Box style={{ transform: [{ rotate: isExpanded ? '90deg' : '0deg' }] }}>
                          <Icon name="chevron-forward" size={20} color={theme.colors.textTertiary} />
                        </Box>
                      </Box>
                    </TouchableOpacity>
                  )}

                  {!isAT && isExpanded && (
                    <Box backgroundColor="background" paddingHorizontal="m" paddingBottom="m">
                      {isLoadingG ? (
                        <ActivityIndicator size="small" color={theme.colors.primary} style={{ marginVertical: 10 }} />
                      ) : gList.length > 0 ? (
                        <Box backgroundColor="borderLight" borderRadius="m" padding="s" marginTop="xs">
                          {gList.map((g, idx) => (
                            <Box 
                              key={g.id} 
                              flexDirection="row" 
                              justifyContent="space-between" 
                              paddingVertical="s"
                              paddingHorizontal="s"
                              borderBottomWidth={idx === gList.length - 1 ? 0 : 1}
                              borderColor="cardBackground"
                            >
                              <Box flex={2}>
                                <Text variant="bodySmall" fontWeight="600">{g.nom}</Text>
                              </Box>
                              <Box flex={1} alignItems="flex-end">
                                <Text variant="caption" color="primary" fontWeight="700">{g.capital > 0 ? `${g.capital}` : '-'}</Text>
                                {(g.franchise && g.franchise != '0' && g.franchise != 0) && <Text variant="caption" color="textTertiary" fontSize={9}>{t("Franchise: ")}{g.franchise}</Text>}
                              </Box>
                            </Box>
                          ))}
                        </Box>
                      ) : (
                        <Text variant="caption" color="textTertiary" textAlign="center" marginVertical="s">{t("Aucune garantie spécifique")}</Text>
                      )}
                    </Box>
                  )}
                </Box>
              );
            })}
          </Section>
        )}



        {/* Dernières Quittances */}
        {quittances.length > 0 && (
          <Section title={t("Dernières Quittances")} icon="receipt-outline">
            {quittances.slice(0, 3).map((q, index) => (
              <TouchableOpacity 
                key={q.id} 
                onPress={() => navigation.navigate('QuittanceDetail', { quittance: q })}
              >
                <Box 
                  padding="l" 
                  borderBottomWidth={index === Math.min(quittances.length, 3) - 1 ? 0 : 1}
                  borderColor="borderLight"
                  flexDirection="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Box gap="xxs">
                    <Text variant="bodySmall" fontWeight="700">N° {q.numero}</Text>
                    <Text variant="caption" color="textTertiary">{formatDate(q.dateDebut)} - {formatDate(q.dateFin)}</Text>
                  </Box>
                  <Box alignItems="flex-end" gap="xxs">
                    <Text variant="bodySmall" fontWeight="900" color="primary" fontSize={rsp.normalize(15)}>{q.montantTotal}</Text>
                    <StatusBadge label={q.statut} variant={q.statut_variant || 'neutral'} size="small" />
                  </Box>
                </Box>
              </TouchableOpacity>
            ))}
            {quittances.length > 3 && (
              <TouchableOpacity onPress={() => navigation.navigate('Quittances', { policeId: police.id })}>
                <Text variant="bodySmall" color="primary" textAlign="center" padding="m" fontWeight="700">{t("Voir toutes les quittances")}</Text>
              </TouchableOpacity>
            )}
          </Section>
        )}
      </ScrollView>
    </Box>
  );
};

export default ContratDetailScreen;
