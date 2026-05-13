import React, { useState, useEffect } from 'react';
import { ScrollView, RefreshControl, TouchableOpacity, Dimensions, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from '../utils/i18n';
import { Box, Text } from '../theme/restyle';
import AppHeader from '../components/layout/AppHeader';
import { SummaryCard } from '../components/common';
import { useAuth } from '../context/AuthContext';
import { dataAPI } from '../api';
import { cacheService } from '../services/cacheService';
import { Ionicons as Icon } from '@expo/vector-icons';
import { Theme } from '../theme/theme';
import { useTheme } from '@shopify/restyle';

const { width } = Dimensions.get('window');

const HomeScreen: React.FC = () => {
  const theme = useTheme<Theme>();
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const roles = user?.roles?.map(r => r.toUpperCase()) || [];
  const isAdherent = roles.includes('ADHERENT');
  const isClient = roles.includes('CLIENT');

  const fetchStats = async (useCache = true) => {
    try {
      if (useCache) {
        const cachedData = await cacheService.get<any>('stats');
        if (cachedData) {
          setStats(cachedData);
          setLoading(false);
        }
      } else {
        setLoading(true);
      }

      const res = await dataAPI.getStats();
      const data = (res && res[0] && res[0][0]) ? res[0][0] : (res && res[0] ? res[0] : null);
      
      setStats(data);
      await cacheService.set('stats', data);
    } catch (error) {
      console.error("Erreur stats:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchStats(false);
  };

  const getVal = (keys: string[]) => {
    if (!stats) return "0";
    for (const k of keys) {
      if (stats[k] !== undefined) return String(stats[k]);
    }
    return "0";
  };

  return (
    <Box flex={1} backgroundColor="background">
      <AppHeader title="AssurPlus" showBackButton={false} rightIconName="notifications-outline" />
      
      <ScrollView 
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />
        }
      >
        {/* Hero Section */}
        <Box 
          backgroundColor="primary" 
          paddingHorizontal="l" 
          paddingTop="xl" 
          paddingBottom="xxxl"
          borderBottomLeftRadius="3xl"
          borderBottomRightRadius="3xl"
        >
          <Box flexDirection="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Text variant="header" color="white">Hello {user?.nom?.split(' ')[0] || 'Utilisateur'},</Text>
              <Text variant="bodySmall" color="white" style={{ opacity: 0.8 }} marginTop="xxs">
                Ravi de vous revoir sur votre espace.
              </Text>
            </Box>
            <Box backgroundColor="white" width={50} height={50} borderRadius="round" alignItems="center" justifyContent="center">
               <Icon name="person" size={28} color={theme.colors.primary} />
            </Box>
          </Box>
        </Box>

        {/* Quick Stats Grid */}
        <Box marginTop="xxxl" paddingHorizontal="m" style={{ marginTop: -40 }}>
          <Box gap="m">
            {isClient && (
              <>
                <TouchableOpacity activeOpacity={0.9} onPress={() => navigation.navigate('Contrats')}>
                  <SummaryCard 
                    title="Mes Contrats" 
                    subtitle="Gestion des polices" 
                    icon="shield-checkmark" 
                    amount={getVal(['totalPolices'])} 
                    amountLabel="Actifs" 
                    variant="primary"
                  />
                </TouchableOpacity>
                <TouchableOpacity activeOpacity={0.9} onPress={() => navigation.navigate('Quittances')}>
                  <SummaryCard 
                    title="Mes Factures" 
                    subtitle="Suivi des paiements" 
                    icon="receipt" 
                    amount={getVal(['totalImpayes'])} 
                    amountLabel="Total Impayés (DH)" 
                    variant="success"
                  />
                </TouchableOpacity>
              </>
            )}

            {isAdherent && (
              <TouchableOpacity activeOpacity={0.9} onPress={() => navigation.navigate('Sinistres')}>
                <SummaryCard 
                  title="Mes Sinistres" 
                  subtitle="Dossiers en cours" 
                  icon="alert-circle" 
                  amount={getVal(['sinistresEnCours'])} 
                  amountLabel="En cours" 
                  variant="warning"
                />
              </TouchableOpacity>
            )}
          </Box>
        </Box>

        {/* Extra Actions Section */}
        <Box paddingHorizontal="m" marginTop="xl">
           <Text variant="premiumLabel" marginBottom="m" marginLeft="s">Actions Rapides</Text>
           <Box flexDirection="row" flexWrap="wrap" gap="m">
              {isClient && (
                <>
                  <TouchableOpacity 
                    onPress={() => navigation.navigate('Contrats')}
                    style={styles.quickAction}
                  >
                     <Icon name="document-text-outline" size={24} color={theme.colors.primary} />
                     <Text variant="bodySmall" marginTop="s" fontWeight="700">Contrats</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={() => navigation.navigate('Quittances')}
                    style={styles.quickAction}
                  >
                     <Icon name="receipt-outline" size={24} color={theme.colors.primary} />
                     <Text variant="bodySmall" marginTop="s" fontWeight="700">Factures</Text>
                  </TouchableOpacity>
                </>
              )}
              
              {(isClient || isAdherent) && (
                <TouchableOpacity 
                  onPress={() => navigation.navigate('Sinistres')}
                  style={styles.quickAction}
                >
                   <Icon name="warning-outline" size={24} color={theme.colors.primary} />
                   <Text variant="bodySmall" marginTop="s" fontWeight="700">Sinistres</Text>
                </TouchableOpacity>
              )}

              {(isClient || isAdherent) && (
                <TouchableOpacity 
                  onPress={() => navigation.navigate('PersACharge')}
                  style={styles.quickAction}
                >
                   <Icon name="people-outline" size={24} color={theme.colors.primary} />
                   <Text variant="bodySmall" marginTop="s" fontWeight="700" textAlign="center">Famille</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity 
                onPress={() => navigation.navigate('Reclamations')}
                style={styles.quickAction}
              >
                 <Icon name="chatbubbles-outline" size={24} color={theme.colors.primary} />
                 <Text variant="bodySmall" marginTop="s" fontWeight="700">Support</Text>
              </TouchableOpacity>
           </Box>
        </Box>
      </ScrollView>
    </Box>
  );
};

const styles = StyleSheet.create({
  quickAction: {
    width: (width - 48) / 3, // 3 columns with gaps
    backgroundColor: 'white', 
    padding: 16, 
    borderRadius: 20, 
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    marginBottom: 8,
  }
});

export default HomeScreen;
