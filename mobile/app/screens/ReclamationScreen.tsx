import React, { useState, useCallback } from 'react';
import { ScrollView, RefreshControl, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '@shopify/restyle';
import { Ionicons as Icon } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Box, Text } from '../theme/restyle';
import { Theme } from '../theme/theme';
import { reclamationsAPI } from '../api';
import AppHeader from '../components/layout/AppHeader';
import { LoadingSpinner, EmptyView, ErrorView, Button } from '../components/common';
import { TabParamList } from '../navigation/MainNavigator';
import { useTranslation } from '../utils/i18n';
import { rsp } from '../utils/responsive';

type Props = NativeStackScreenProps<TabParamList, 'Reclamations'>;

const ReclamationScreen: React.FC<Props> = ({ navigation }) => {
  const theme = useTheme<Theme>();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [reclamations, setReclamations] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setError(null);
      const data = await reclamationsAPI.getAll();
      setReclamations(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  if (loading && !refreshing) return <LoadingSpinner />;
  if (error) return <ErrorView message={error} onRetry={loadData} />;

  return (
    <Box flex={1} backgroundColor="background">
      <AppHeader title={t('Mes Demandes')} showBackButton={false} />
      
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} />}
      >
        <Box padding="m">
          <Text variant="bodySmall" marginBottom="m" color="textSecondary">
            {t("Suivez l'état de vos demandes.")}
          </Text>

          {reclamations.length === 0 ? (
            <EmptyView 
              message={t("Aucune demande")} 
            />
          ) : (
            reclamations.map((item) => (
              <TouchableOpacity
                key={item.id}
                onPress={() => navigation.navigate('ReclamationDetail' as any, { reclamationId: item.id, sujet: item.sujet })}
                activeOpacity={0.7}
              >
                <Box
                  backgroundColor="cardBackground"
                  padding="m"
                  borderRadius="m"
                  marginBottom="s"
                  borderWidth={1}
                  borderColor="border"
                  flexDirection="row"
                  alignItems="center"
                >
                  <Box flex={1}>
                    <Box flexDirection="row" alignItems="center" marginBottom="xxs">
                      <Box 
                        width={8} 
                        height={8} 
                        borderRadius="round" 
                        backgroundColor={item.statut === 'E' ? 'warning' : item.statut === 'C' ? 'success' : 'primary'} 
                        marginRight="xs"
                      />
                      <Text variant="title" fontSize={16}>{item.sujet}</Text>
                    </Box>
                    <Text variant="caption">{item.nature} • {new Date(item.dateReclamation).toLocaleDateString()}</Text>
                  </Box>
                  <Icon name="chevron-forward" size={20} color={theme.colors.textTertiary} />
                </Box>
              </TouchableOpacity>
            ))
          )}
        </Box>
      </ScrollView>

    </Box>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
});

export default ReclamationScreen;
