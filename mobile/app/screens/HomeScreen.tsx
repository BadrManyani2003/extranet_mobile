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
import {
  ShieldCheck,
  ReceiptText,
  AlertCircle,
  MessageSquare,
  User as UserIcon,
  Bell,
  ArrowRight,
  FileText,
  BadgeAlert,
  Users
} from 'lucide-react-native';
import { Theme, shadows } from '../theme/theme';
import { useTheme } from '@shopify/restyle';
import { LinearGradient } from 'expo-linear-gradient';
import { rsp } from '../utils/responsive';

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
  const isExpert = roles.includes('EXPERT');

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
      <AppHeader title="MyAsk" showBackButton={false} rightIcon={Bell} />

      <ScrollView
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />
        }
      >
        {/* Hero Section */}
        <Box
          height={rsp.verticalScale(180)}
          paddingHorizontal="l"
          paddingTop="xl"
          position="relative"
        >
          <LinearGradient
            colors={[theme.colors.primary, theme.colors.primaryLight]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              ...StyleSheet.absoluteFillObject,
              borderBottomLeftRadius: theme.borderRadii['3xl'],
              borderBottomRightRadius: theme.borderRadii['3xl'],
            }}
          />
          <Box flexDirection="row" justifyContent="space-between" alignItems="center" zIndex={1}>
            <Box flex={1} marginRight="m">
              <Text
                variant="header"
                color="white"
                fontSize={rsp.normalize(24)}
                numberOfLines={2}
                adjustsFontSizeToFit
              >
                Bonjour {user?.nom || 'Utilisateur'},
              </Text>
              <Text variant="bodySmall" color="white" style={{ opacity: 0.9 }} marginTop="xxs">
                Ravi de vous revoir sur votre espace MyAsk.
              </Text>
            </Box>
            <Box
              backgroundColor="white"
              width={54}
              height={54}
              borderRadius="round"
              alignItems="center"
              justifyContent="center"
              style={{
                shadowColor: theme.colors.primary,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 10,
                elevation: 5,
              }}
            >
              <UserIcon size={28} color={theme.colors.primary} />
            </Box>
          </Box>
        </Box>

        {/* Quick Stats Grid */}
        <Box marginTop="xxxl" paddingHorizontal="m" style={{ marginTop: -40 }}>
          <Box gap="m">
            {(isClient || isExpert) && (
              <>
                <TouchableOpacity activeOpacity={0.9} onPress={() => navigation.navigate('Contrats')}>
                  <SummaryCard
                    title={isExpert ? "Gestion Polices" : "Mes Contrats"}
                    subtitle={isExpert ? "Toutes les polices" : "Gestion des polices"}
                    icon={ShieldCheck}
                    amount={getVal(['totalPolices'])}
                    amountLabel="Actifs"
                    variant="primary"
                  />
                </TouchableOpacity>
                <TouchableOpacity activeOpacity={0.9} onPress={() => navigation.navigate('Quittances')}>
                  <SummaryCard
                    title={isExpert ? "Gestion Impayés" : "Mes Factures"}
                    subtitle={isExpert ? "Balance globale" : "Suivi des paiements"}
                    icon={ReceiptText}
                    amount={getVal(['totalImpayes'])}
                    amountLabel="Total Impayés (DH)"
                    variant="success"
                  />
                </TouchableOpacity>
              </>
            )}

            {(isAdherent || isClient || isExpert) && (
              <TouchableOpacity activeOpacity={0.9} onPress={() => navigation.navigate('Sinistres')}>
                <SummaryCard
                  title={isExpert ? "Gestion Sinistres" : "Mes Sinistres"}
                  subtitle={isExpert ? "Dossiers à traiter" : "Dossiers en cours"}
                  icon={AlertCircle}
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
            {(isClient || isExpert) && (
              <>
                <TouchableOpacity
                  onPress={() => navigation.navigate('Contrats')}
                  style={styles.quickAction}
                >
                  <Box backgroundColor="primaryBg" padding="s" borderRadius="m" marginBottom="xs">
                    <FileText size={22} color={theme.colors.primary} />
                  </Box>
                  <Text variant="bodySmall" fontWeight="700">Contrats</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => navigation.navigate('Quittances')}
                  style={styles.quickAction}
                >
                  <Box backgroundColor="primaryBg" padding="s" borderRadius="m" marginBottom="xs">
                    <ReceiptText size={22} color={theme.colors.primary} />
                  </Box>
                  <Text variant="bodySmall" fontWeight="700">Factures</Text>
                </TouchableOpacity>
              </>
            )}

            {(isClient || isAdherent || isExpert) && (
              <TouchableOpacity
                onPress={() => navigation.navigate('Sinistres')}
                style={styles.quickAction}
              >
                <Box backgroundColor="primaryBg" padding="s" borderRadius="m" marginBottom="xs">
                  <BadgeAlert size={22} color={theme.colors.primary} />
                </Box>
                <Text variant="bodySmall" fontWeight="700">Sinistres</Text>
              </TouchableOpacity>
            )}

            {(isClient || isAdherent || isExpert) && (
              <TouchableOpacity
                onPress={() => navigation.navigate('Reclamations')}
                style={styles.quickAction}
              >
                <Box backgroundColor="primaryBg" padding="s" borderRadius="m" marginBottom="xs">
                  <MessageSquare size={22} color={theme.colors.primary} />
                </Box>
                <Text variant="bodySmall" fontWeight="700">Support</Text>
              </TouchableOpacity>
            )}

            {(isAdherent || isExpert) && (
              <TouchableOpacity
                onPress={() => navigation.navigate('PersACharge')}
                style={styles.quickAction}
              >
                <Box backgroundColor="primaryBg" padding="s" borderRadius="m" marginBottom="xs">
                  <Users size={22} color={theme.colors.primary} />
                </Box>
                <Text variant="bodySmall" fontWeight="700">Famille</Text>
              </TouchableOpacity>
            )}
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
    ...shadows.small,
    marginBottom: 8,
  }
});

export default HomeScreen;
