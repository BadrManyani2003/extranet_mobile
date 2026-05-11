import React, { useState, useRef, useEffect } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
  Dimensions,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Icon from '@expo/vector-icons/Ionicons';
import { useTheme } from '@shopify/restyle';

import { useAuth } from '../context/AuthContext';
import { authAPI } from '../api';
import { Theme } from '../theme/theme';
import { Box, Text } from '../theme/restyle';
import { RootStackParamList } from '../navigation/MainNavigator';
import { rsp } from '../utils/responsive';
import { Button, FormInput, AlertBanner } from '../components/common';
import { useTranslation } from '../utils/i18n';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const theme = useTheme<Theme>();
  const { login } = useAuth();
  const { t } = useTranslation();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState<'ADHERENT' | 'CLIENT'>('ADHERENT');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Animations
  const logoScale = useRef(new Animated.Value(0.9)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const formSlide = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(logoScale, { toValue: 1, bounciness: 4, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(formSlide, { toValue: 0, bounciness: 4, speed: 10, delay: 100, useNativeDriver: true }),
    ]).start();
  }, [logoScale, opacity, formSlide]);

  const handleLogin = async () => {
    const identifierTrimmed = identifier.trim();
    if (!identifierTrimmed || !password) return;

    setLoading(true);
    setErrorMsg(null);
    try {
      await login(identifierTrimmed, password, userType);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  const c = theme.colors;

  return (
    <Box flex={1} backgroundColor="cardBackground">
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Header Section */}
            <Animated.View style={{ 
              opacity, 
              transform: [{ scale: logoScale }], 
              alignItems: 'center', 
              marginBottom: rsp.verticalScale(30) 
            }}>
              <Box 
                backgroundColor="primary" 
                width={80} 
                height={80} 
                borderRadius="round" 
                alignItems="center" 
                justifyContent="center"
                marginBottom="m"
                style={{ 
                    shadowColor: theme.colors.primary, 
                    shadowOffset: { width: 0, height: 10 }, 
                    shadowOpacity: 0.3, 
                    shadowRadius: 15,
                    elevation: 10
                }}
              >
                <Icon name="shield-checkmark" size={44} color="#FFF" />
              </Box>
              <Text variant="header" color="primary" fontSize={rsp.normalize(32)} fontWeight="800">AssurPlus</Text>
              <Text variant="bodyMedium" color="textSecondary" marginTop="xs" fontWeight="600">
                {t('Gérez vos assurances comme jamais')}
              </Text>
            </Animated.View>

            <Animated.View style={{ transform: [{ translateY: formSlide }], opacity }}>
              
              {/* Error Banner */}
              {errorMsg && (
                <Box marginBottom="l">
                   <AlertBanner message={errorMsg} variant="error" />
                </Box>
              )}

              {/* User Type Selector */}
              <Box flexDirection="row" backgroundColor="backgroundLight" borderRadius="m" padding="xs" marginBottom="xl">
                <TouchableOpacity 
                  style={[styles.typeBtn, userType === 'ADHERENT' && { backgroundColor: theme.colors.primary }]}
                  onPress={() => setUserType('ADHERENT')}
                >
                  <Text 
                    color={userType === 'ADHERENT' ? 'white' : 'textSecondary'} 
                    fontWeight="700"
                    fontSize={14}
                  >
                    {t('Adhérent')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.typeBtn, userType === 'CLIENT' && { backgroundColor: theme.colors.primary }]}
                  onPress={() => setUserType('CLIENT')}
                >
                  <Text 
                    color={userType === 'CLIENT' ? 'white' : 'textSecondary'} 
                    fontWeight="700"
                    fontSize={14}
                  >
                    {t('Particulier')}
                  </Text>
                </TouchableOpacity>
              </Box>

              {/* Form Input Group */}
              <Box marginBottom="s">
                <FormInput
                  label={t('Identifiant')}
                  placeholder={userType === 'ADHERENT' ? t('N° Adhérent') : t('Email ou CIN')}
                  value={identifier}
                  onChangeText={setIdentifier}
                  autoCapitalize="none"
                />

                <FormInput
                  label={t('Mot de passe')}
                  placeholder={t('Confidentialité assurée')}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  rightIcon={showPassword ? 'eye-off' : 'eye'}
                  onRightIconPress={() => setShowPassword(!showPassword)}
                />
              </Box>

              <Button 
                label={t('Se connecter')} 
                onPress={handleLogin} 
                loading={loading}
                disabled={!identifier || !password}
                size="large"
                variant="primary"
                style={{ marginTop: 10 }}
              />

              <Box height={1} backgroundColor="border" width="100%" marginVertical="xl" />
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Box>
  );
};


const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1, 
    justifyContent: 'center', 
    paddingHorizontal: rsp.scale(32),
    paddingBottom: 40,
  },
  typeBtn: {
    flex: 1,
    height: 45,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  forgotBtn: { 
    alignSelf: 'center', 
    marginTop: 25,
    paddingVertical: 10
  }
});

export default LoginScreen;

