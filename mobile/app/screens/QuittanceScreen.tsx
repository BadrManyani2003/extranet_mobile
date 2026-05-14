import React, { useState, useEffect } from 'react';
import { FlatList, RefreshControl, Platform, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Box, Text } from '../theme/restyle';
import AppHeader from '../components/layout/AppHeader';
import { quittancesAPI } from '../api';
import { StatusBadge, LoadingSpinner, EmptyView } from '../components/common';
import { Ionicons as Icon } from '@expo/vector-icons';
import { Theme } from '../theme/theme';
import { useTheme } from '@shopify/restyle';
import { cacheService } from '../services/cacheService';

const QuittanceScreen = () => {
  const theme = useTheme<Theme>();
  const navigation = useNavigation<any>();
  const [quittances, setQuittances] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchQuittances = async (useCache = true) => {
    try {
      if (useCache) {
        const cachedData = await cacheService.get<any[]>('quittances');
        if (cachedData) {
          setQuittances(cachedData);
          setLoading(false);
        }
      } else {
        setLoading(true);
      }

      const data = await quittancesAPI.getAll();
      setQuittances(data);
      await cacheService.set('quittances', data);
    } catch (error) {
      console.error("Erreur chargement quittances:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchQuittances();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchQuittances(false);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '--/--/----';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      const d = String(date.getDate()).padStart(2, '0');
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const y = date.getFullYear();
      return `${d}/${m}/${y}`;
    } catch {
      return dateStr;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'MAD' }).format(amount);
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity activeOpacity={0.8} onPress={() => navigation.navigate('QuittanceDetail', { quittance: item })}>
      <Box
        backgroundColor="cardBackground"
        marginHorizontal="m"
        marginVertical="s"
        borderRadius="l"
        padding="l"
        borderWidth={1}
        borderColor="borderLight"
        style={Platform.select({
          ios: { shadowColor: theme.colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 12 },
          android: { elevation: 3 },
          web: { boxShadow: `0 4px 12px ${theme.colors.border}` }
        })}
      >
        {/* Header: Type + Status */}
        <Box flexDirection="row" justifyContent="space-between" alignItems="center" marginBottom="m">
          <Box flexDirection="row" alignItems="center">
            <Box backgroundColor="primaryBg" padding="s" borderRadius="m" marginRight="s">
              <Icon name="receipt" size={18} color={theme.colors.primary} />
            </Box>
            <Text variant="caption" color="primary" fontWeight="800" style={{ letterSpacing: 1, textTransform: 'uppercase' }}>
              Quittance
            </Text>
          </Box>
          <StatusBadge label={item.statut || 'Payée'} variant={item.statut_variant || 'success'} />
        </Box>

        {/* Quittance Number & Amount */}
        <Box flexDirection="row" justifyContent="space-between" alignItems="flex-end" marginBottom="m">
          <Box flex={1}>
            <Text variant="caption" color="textTertiary" marginBottom="xxs">N° de quittance</Text>
            <Text variant="title" fontWeight="900" fontSize={20} color="text">
              {item.numero || item.quittance || item.num_quittance || '-'}
            </Text>
          </Box>
          <Box alignItems="flex-end">
            <Text variant="title" fontWeight="900" fontSize={22} color="primary">
              {item.montantTotal || item.montant ? formatCurrency(item.montantTotal || item.montant) : '0,00 MAD'}
            </Text>
          </Box>
        </Box>

        <Box height={1} backgroundColor="borderLight" marginBottom="m" />

        {/* Details Grid */}
        <Box flexDirection="row" justifyContent="space-between">
          <Box flex={1} marginRight="m">
            <Box flexDirection="row" alignItems="center" marginBottom="xxs">
              <Icon name="document-text-outline" size={14} color={theme.colors.textTertiary} style={{ marginRight: 4 }} />
              <Text variant="caption" color="textTertiary">Police liée</Text>
            </Box>
            <Text variant="bodySmall" fontWeight="700" color="text">
              {item.police || '-'}
            </Text>
          </Box>

          <Box alignItems="flex-end">
            <Box flexDirection="row" alignItems="center" marginBottom="xxs">
              <Icon name="time-outline" size={14} color={theme.colors.textTertiary} style={{ marginRight: 4 }} />
              <Text variant="caption" color="textTertiary">Date d'échéance</Text>
            </Box>
            <Text variant="bodySmall" fontWeight="700" color="text">
              {formatDate(item.dateEcheance || item.date_echeance)}
            </Text>
          </Box>
        </Box>
      </Box>
    </TouchableOpacity>
  );

  return (
    <Box flex={1} backgroundColor="background">
      <AppHeader title="Mes Quittances" showBackButton={false} />

      {loading && !refreshing ? (
        <LoadingSpinner />
      ) : (
        <FlatList
          data={quittances}
          renderItem={renderItem}
          keyExtractor={(item, index) => (item.id || index).toString()}
          contentContainerStyle={{ paddingVertical: 10, paddingBottom: 100 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <EmptyView
              icon="receipt-outline"
              message="Vous n'avez pas encore de quittances enregistrées."
            />
          }
        />
      )}
    </Box>
  );
};

export default QuittanceScreen;
