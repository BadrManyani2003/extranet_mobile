import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@shopify/restyle';
import { LinearGradient } from 'expo-linear-gradient';

import { Theme } from '../theme/theme';
import { useTranslation } from '../utils/i18n';
import { useAuth } from '../context/AuthContext';
import { rsp } from '../utils/responsive';

const RestrictedScreen = () => {
  const theme = useTheme<Theme>();
  const { t } = useTranslation();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} bounces={false}>
        <View style={[styles.card, { backgroundColor: theme.colors.cardBackground, borderColor: theme.colors.border }]}>
          <LinearGradient
            colors={[theme.colors.error, '#FF9494']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.topBar}
          />

          <View style={styles.content}>
            <View style={[styles.iconContainer, { backgroundColor: theme.colors.errorBg }]}>
              <Ionicons name="shield-half-sharp" size={rsp.scale(48)} color={theme.colors.error} />
            </View>

            <Text style={[styles.title, { color: theme.colors.text }]}>
              {t('restricted_title')}
            </Text>

            <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
              {t('restricted_description')}
            </Text>

            <View style={styles.buttonGroup}>
              <TouchableOpacity
                style={[styles.primaryButton, { backgroundColor: theme.colors.error }]}
                onPress={handleLogout}
                activeOpacity={0.8}
              >
                <Ionicons name="log-out-outline" size={20} color="white" style={styles.buttonIcon} />
                <Text style={styles.primaryButtonText}>{t('restricted_logout')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: rsp.scale(20),
  },
  card: {
    width: '100%',
    borderRadius: rsp.scale(32),
    overflow: 'hidden',
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
      },
    }),
  },
  topBar: {
    height: rsp.scale(6),
    width: '100%',
  },
  content: {
    padding: rsp.scale(32),
    alignItems: 'center',
  },
  iconContainer: {
    width: rsp.scale(88),
    height: rsp.scale(88),
    borderRadius: rsp.scale(24),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: rsp.scale(24),
  },
  title: {
    fontSize: rsp.normalize(26),
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: rsp.scale(12),
    letterSpacing: -0.5,
  },
  description: {
    fontSize: rsp.normalize(15),
    textAlign: 'center',
    lineHeight: rsp.normalize(22),
    marginBottom: rsp.scale(32),
    fontWeight: '500',
  },
  buttonGroup: {
    width: '100%',
    gap: rsp.scale(12),
  },
  primaryButton: {
    flexDirection: 'row',
    height: rsp.scale(56),
    borderRadius: rsp.scale(16),
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#EF4444',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      web: {
        boxShadow: '0 4px 8px rgba(239, 68, 68, 0.2)',
      },
    }),
  },
  buttonIcon: {
    marginRight: rsp.scale(8),
  },
  primaryButtonText: {
    color: 'white',
    fontSize: rsp.normalize(16),
    fontWeight: '700',
  },
  footer: {
    paddingVertical: rsp.scale(16),
    alignItems: 'center',
    borderTopWidth: 1,
  },
  footerText: {
    fontSize: rsp.normalize(10),
    fontWeight: '900',
    letterSpacing: 2,
  },
});

export default RestrictedScreen;
