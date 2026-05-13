import React, { useState, useEffect } from 'react';
import { FlatList, RefreshControl, Platform, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Box, Text } from '../theme/restyle';
import AppHeader from '../components/layout/AppHeader';
import { reclamationsAPI } from '../api';
import { StatusBadge, LoadingSpinner, EmptyView } from '../components/common';
import { Ionicons as Icon } from '@expo/vector-icons';
import { Theme } from '../theme/theme';
import { useTheme } from '@shopify/restyle';
import { cacheService } from '../services/cacheService';

const ReclamationScreen = () => {
  const theme = useTheme<Theme>();
  const navigation = useNavigation<any>();
  const [reclamations, setReclamations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchReclamations = async (useCache = true) => {
    try {
      if (useCache) {
        const cachedData = await cacheService.get<any[]>('reclamations');
        if (cachedData) {
          setReclamations(cachedData);
          setLoading(false);
        }
      } else {
        setLoading(true);
      }

      const data = await reclamationsAPI.getAll();
      setReclamations(data);
      await cacheService.set('reclamations', data);
    } catch (error) {
      console.error("Erreur chargement réclamations:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchReclamations();
    });
    return unsubscribe;
  }, [navigation]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchReclamations(false);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '--/--/----';
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR');
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity activeOpacity={0.8} onPress={() => navigation.navigate('ReclamationDetail', { reclamation: item })}>
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
        <Box flexDirection="row" justifyContent="space-between" alignItems="center" marginBottom="m">
          <Box flexDirection="row" alignItems="center">
            <Box backgroundColor="primaryBg" padding="s" borderRadius="m" marginRight="s">
              <Icon name="chatbubble-ellipses" size={18} color={theme.colors.primary} />
            </Box>
            <Text variant="caption" color="primary" fontWeight="800" style={{ letterSpacing: 1, textTransform: 'uppercase' }}>
              {item.nature}
            </Text>
          </Box>
          <StatusBadge label={item.statut} variant={item.statut_variant || 'neutral'} />
        </Box>

        <Box marginBottom="m">
          <Text variant="title" fontWeight="900" fontSize={18} color="text" numberOfLines={1}>
            {item.sujet}
          </Text>
          <Text variant="bodySmall" color="textSecondary" marginTop="xxs">
            Par {item.client}
          </Text>
        </Box>

        <Box height={1} backgroundColor="borderLight" marginBottom="m" />

        <Box flexDirection="row" justifyContent="space-between" alignItems="center">
          <Box flexDirection="row" alignItems="center">
            <Icon name="calendar-outline" size={14} color={theme.colors.textTertiary} style={{ marginRight: 4 }} />
            <Text variant="caption" color="textTertiary">{formatDate(item.dateReclamation)}</Text>
          </Box>
          <Icon name="chevron-forward" size={16} color={theme.colors.textTertiary} />
        </Box>
      </Box>
    </TouchableOpacity>
  );

  return (
    <Box flex={1} backgroundColor="background">
      <AppHeader title="Réclamations" showBackButton={false} />
      
      {loading && !refreshing ? (
        <LoadingSpinner />
      ) : (
        <FlatList
          data={reclamations}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingVertical: 10, paddingBottom: 100 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <EmptyView 
              icon="chatbubbles-outline" 
              message="Aucune demande ou réclamation pour le moment." 
            />
          }
        />
      )}

      {/* Floating Action Button */}
      <TouchableOpacity 
        onPress={() => navigation.navigate('ReclamationCreate')}
        style={{
          position: 'absolute',
          bottom: Platform.OS === 'ios' ? 100 : 80,
          right: 20,
          backgroundColor: theme.colors.primary,
          width: 56,
          height: 56,
          borderRadius: 28,
          justifyContent: 'center',
          alignItems: 'center',
          elevation: 8,
          shadowColor: theme.colors.primary,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 10
        }}
      >
        <Icon name="add" size={32} color="white" />
      </TouchableOpacity>
    </Box>
  );
};

export default ReclamationScreen;
