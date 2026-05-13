import React, { useState, useEffect } from 'react';
import { FlatList, RefreshControl, Platform, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Box, Text } from '../theme/restyle';
import AppHeader from '../components/layout/AppHeader';
import { policesAPI } from '../api';
import { StatusBadge, LoadingSpinner, EmptyView } from '../components/common';
import { Ionicons as Icon } from '@expo/vector-icons';
import { Theme } from '../theme/theme';
import { useTheme } from '@shopify/restyle';
import { cacheService } from '../services/cacheService';

const ContratScreen = () => {
  const theme = useTheme<Theme>();
  const navigation = useNavigation<any>();
  const [polices, setPolices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPolices = async (useCache = true) => {
    try {
      if (useCache) {
        // 1. Essayer de charger depuis le cache pour un affichage instantané
        const cachedData = await cacheService.get<any[]>('polices');
        if (cachedData) {
          setPolices(cachedData);
          setLoading(false); // On arrête le loader car on a déjà de la donnée
        }
      } else {
        setLoading(true);
      }

      // 2. Récupérer les données fraîches de l'API
      const data = await policesAPI.getAll();
      
      // 3. Mettre à jour l'état et le cache
      setPolices(data);
      await cacheService.set('polices', data);
    } catch (error) {
      console.error("Erreur chargement polices:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPolices();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchPolices(false); // Force le rechargement API sans passer par le cache
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

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity activeOpacity={0.8} onPress={() => navigation.navigate('ContratDetail', { police: item })}>
      <Box 
        backgroundColor="cardBackground" 
        marginHorizontal="m" 
        marginVertical="s" 
        borderRadius="l"
        padding="l"
        borderWidth={1}
        borderColor="borderLight"
        style={Platform.select({
          ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 12 },
          android: { elevation: 3 },
          web: { boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }
        })}
      >
        {/* Header: Status + Badge */}
        <Box flexDirection="row" justifyContent="space-between" alignItems="center" marginBottom="m">
          <Box flexDirection="row" alignItems="center">
            <Box backgroundColor="primaryBg" padding="s" borderRadius="m" marginRight="s">
              <Icon name="shield-checkmark" size={18} color={theme.colors.primary} />
            </Box>
            <Text variant="caption" color="primary" fontWeight="800" style={{ letterSpacing: 1, textTransform: 'uppercase' }}>
              {item.branche}
            </Text>
          </Box>
          <StatusBadge label={item.statut} variant={item.statut_variant || 'primary'} />
        </Box>

        {/* Police Number */}
        <Box marginBottom="m">
          <Text variant="caption" color="textTertiary" marginBottom="xxs">Numéro de police</Text>
          <Text variant="title" fontWeight="900" fontSize={20} color="text">
            {item.police}
          </Text>
        </Box>

        <Box height={1} backgroundColor="borderLight" marginBottom="m" />

        {/* Details Grid */}
        <Box flexDirection="row" justifyContent="space-between">
          <Box flex={1} marginRight="m">
            <Box flexDirection="row" alignItems="center" marginBottom="xxs">
              <Icon name="business-outline" size={14} color={theme.colors.textTertiary} style={{ marginRight: 4 }} />
              <Text variant="caption" color="textTertiary">Compagnie</Text>
            </Box>
            <Text variant="bodySmall" fontWeight="700" color="text" numberOfLines={1}>
              {item.compagnie}
            </Text>
          </Box>

          <Box alignItems="flex-end">
            <Box flexDirection="row" alignItems="center" marginBottom="xxs">
              <Icon name="calendar-outline" size={14} color={theme.colors.textTertiary} style={{ marginRight: 4 }} />
              <Text variant="caption" color="textTertiary">Date d'échéance</Text>
            </Box>
            <Text variant="bodySmall" fontWeight="700" color="text">
              {formatDate(item.dateEcheance)}
            </Text>
          </Box>
        </Box>
      </Box>
    </TouchableOpacity>
  );

  return (
    <Box flex={1} backgroundColor="background">
      <AppHeader title="Mes Contrats" showBackButton={false} />
      
      {loading && !refreshing ? (
        <LoadingSpinner />
      ) : (
        <FlatList
          data={polices}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingVertical: 10, paddingBottom: 100 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <EmptyView 
              icon="document-text-outline" 
              message="Vous n'avez pas encore de contrats d'assurance enregistrés." 
            />
          }
        />
      )}
    </Box>
  );
};

export default ContratScreen;
