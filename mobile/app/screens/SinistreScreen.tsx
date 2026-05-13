import React, { useState, useEffect } from 'react';
import { FlatList, RefreshControl, Platform, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Box, Text } from '../theme/restyle';
import AppHeader from '../components/layout/AppHeader';
import { sinistresAPI } from '../api';
import { StatusBadge, LoadingSpinner, EmptyView } from '../components/common';
import { Ionicons as Icon } from '@expo/vector-icons';
import { Theme } from '../theme/theme';
import { useTheme } from '@shopify/restyle';
import { cacheService } from '../services/cacheService';

const SinistreScreen = () => {
  const theme = useTheme<Theme>();
  const navigation = useNavigation<any>();
  const [sinistres, setSinistres] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSinistres = async (useCache = true) => {
    try {
      if (useCache) {
        const cachedData = await cacheService.get<any[]>('sinistres');
        if (cachedData) {
          setSinistres(cachedData);
          setLoading(false);
        }
      } else {
        setLoading(true);
      }

      const data = await sinistresAPI.getAll();
      setSinistres(data);
      await cacheService.set('sinistres', data);
    } catch (error) {
      console.error("Erreur chargement sinistres:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSinistres();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchSinistres(false);
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
    <TouchableOpacity activeOpacity={0.8} onPress={() => navigation.navigate('SinistreDetail', { sinistre: item })}>
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
        {/* Header: Branche + Status */}
        <Box flexDirection="row" justifyContent="space-between" alignItems="center" marginBottom="m">
          <Box flexDirection="row" alignItems="center">
            <Box backgroundColor="errorBg" padding="s" borderRadius="m" marginRight="s">
              <Icon name="warning" size={18} color={theme.colors.error} />
            </Box>
            <Text variant="caption" color="error" fontWeight="800" style={{ letterSpacing: 1, textTransform: 'uppercase' }}>
              {item.branche || '-'}
            </Text>
          </Box>
          <StatusBadge label={item.statut || 'En cours'} variant={item.statut_variant || 'warning'} />
        </Box>

        {/* Sinistre Number */}
        <Box marginBottom="m">
          <Text variant="caption" color="textTertiary" marginBottom="xxs">N° de sinistre</Text>
          <Text variant="title" fontWeight="900" fontSize={20} color="text">
            {item.numero || item.num_sinistre || item.sinistre || 'N/A'}
          </Text>
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
               {item.police || 'N/A'}
            </Text>
          </Box>

          <Box alignItems="flex-end">
            <Box flexDirection="row" alignItems="center" marginBottom="xxs">
              <Icon name="calendar-outline" size={14} color={theme.colors.textTertiary} style={{ marginRight: 4 }} />
              <Text variant="caption" color="textTertiary">Date de survenance</Text>
            </Box>
            <Text variant="bodySmall" fontWeight="700" color="text">
              {formatDate(item.date || item.dateSurvenance || item.date_survenance)}
            </Text>
          </Box>
        </Box>
      </Box>
    </TouchableOpacity>
  );

  return (
    <Box flex={1} backgroundColor="background">
      <AppHeader title="Mes Sinistres" showBackButton={false} />
      
      {loading && !refreshing ? (
        <LoadingSpinner />
      ) : (
        <FlatList
          data={sinistres}
          renderItem={renderItem}
          keyExtractor={(item, index) => (item.id || index).toString()}
          contentContainerStyle={{ paddingVertical: 10, paddingBottom: 100 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <EmptyView 
              icon="warning-outline" 
              message="Aucun sinistre déclaré pour le moment." 
            />
          }
        />
      )}
    </Box>
  );
};

export default SinistreScreen;
