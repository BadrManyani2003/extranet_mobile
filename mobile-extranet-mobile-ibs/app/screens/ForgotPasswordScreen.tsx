import React, { useState, useRef, useEffect } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Icon from '@expo/vector-icons/Ionicons';
import { useTheme } from '@shopify/restyle';

import { authAPI } from '../api';
import { Theme } from '../theme/theme';
import { Box, Text } from '../theme/restyle';
import { RootStackParamList } from '../navigation/MainNavigator';
import { rsp } from '../utils/responsive';
import { Button, FormInput } from '../components/common';
import { useTranslation } from '../utils/i18n';

type Props = NativeStackScreenProps<RootStackParamList, 'ForgotPassword'>;
type Step = 'email' | 'code' | 'password';

const ForgotPasswordScreen: React.FC<Props> = ({ navigation }) => {
  const { t } = useTranslation();
  const theme = useTheme<Theme>();
  const c = theme.colors;

  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Animations
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    opacityAnim.setValue(0);
    slideAnim.setValue(20);
    Animated.parallel([
      Animated.timing(opacityAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, bounciness: 4, speed: 10, useNativeDriver: true }),
    ]).start();
  }, [step, opacityAnim, slideAnim]);

  const handleSendCode = async () => {
    if (!email.trim() || !email.includes('@')) {
      setError('Veuillez entrer une adresse email valide.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await authAPI.sendForgetPassword(email.trim());
      setStep('code');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = () => {
    if (code.length < 6) {
      setError('Le code doit contenir 6 chiffres.');
      return;
    }
    setError(null);
    setStep('password');
  };

  const handleResetPassword = async () => {
    if (newPassword.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      await authAPI.forgetPassword(email.trim(), code.trim(), newPassword, confirmNewPassword);
      navigation.navigate('Login');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const currentTitle = step === 'email' ? 'Récupération' : step === 'code' ? 'Vérification' : 'Nouveau passe';
  const currentSubtitle = step === 'email' 
    ? 'Recevez un code de validation pour sécuriser votre accès.' 
    : step === 'code' 
    ? 'Entrez le code reçu par e-mail pour confirmer votre identité.'
    : 'Créez un nouveau mot de passe sécurisé pour votre compte.';

  const isButtonDisabled = step === 'email' ? !email : step === 'code' ? code.length < 6 : (!newPassword || !confirmNewPassword);
  const handlePress = step === 'email' ? handleSendCode : step === 'code' ? handleVerifyCode : handleResetPassword;

  return (
    <Box flex={1} backgroundColor="backgroundLight">
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
            {/* Header */}
            <Animated.View style={{ opacity: opacityAnim, transform: [{ translateY: slideAnim }] }}>
              <TouchableOpacity 
                activeOpacity={0.7}
                onPress={() => step === 'email' ? navigation.goBack() : setStep(step === 'code' ? 'email' : 'code')} 
                style={styles.backButton}
              >
                <Icon name="chevron-back" size={24} color={c.text} />
              </TouchableOpacity>
              
              <Box marginBottom="xl">
                <Text variant="header" color="text" fontSize={rsp.normalize(28)} fontWeight="900">{currentTitle}</Text>
                <Text variant="bodySmall" color="textSecondary" marginTop="xs" fontWeight="500">
                  {currentSubtitle}
                </Text>
                <Box height={4} width={40} backgroundColor="primary" borderRadius="round" marginTop="s" />
              </Box>
            </Animated.View>

            {/* Form */}
            <Animated.View style={{ opacity: opacityAnim, transform: [{ translateY: slideAnim }] }}>
              {step === 'email' && (
                <FormInput
                  label="Vérification par e-mail"
                  placeholder="votre@email.com"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  icon="mail-outline"
                  error={error}
                />
              )}

              {step === 'code' && (
                <Animated.View style={{ opacity: opacityAnim }}>
                   <Box padding="l" backgroundColor="primaryBg" borderRadius="m" marginBottom="xl" borderWidth={1} borderColor="primaryLight">
                      <Icon name="mail-open-outline" size={32} color={theme.colors.primary} style={{ alignSelf: 'center', marginBottom: 12 }} />
                      <Text variant="bodyMedium" color="primary" fontWeight="700" textAlign="center" marginBottom="xs">
                        {t('Vérification requise') as any}
                      </Text>
                      <Text variant="bodySmall" color="textSecondary" textAlign="center" lineHeight={18}>
                        {t('Un code de sécurité a été envoyé à') as any}
                      </Text>
                      <Text variant="bodySmall" color="primary" fontWeight="bold" textAlign="center">
                        {email}
                      </Text>
                    </Box>

                    <Text variant="labelBold" color="textSecondary" marginBottom="s" textAlign="center" letterSpacing={1}>
                      {t('CODE DE VÉRIFICATION') as any}
                    </Text>
                    
                    {/* Styled OTP Input Container */}
                    <Box flexDirection="row" justifyContent="space-between" marginBottom="l">
                      {[0, 1, 2, 3, 4, 5].map((index) => {
                        const digit = code[index] || '';
                        const isFocused = code.length === index;
                        return (
                          <Box 
                            key={index}
                            width={rsp.scale(42)}
                            height={rsp.scale(54)}
                            borderRadius="s"
                            borderWidth={2}
                            borderColor={isFocused ? 'primary' : 'border'}
                            backgroundColor={digit ? 'primaryBg' : 'backgroundLight'}
                            alignItems="center"
                            justifyContent="center"
                            style={{
                              shadowColor: isFocused ? theme.colors.primary : 'transparent',
                              shadowOffset: { width: 0, height: 4 },
                              shadowOpacity: 0.1,
                              shadowRadius: 4,
                              elevation: isFocused ? 2 : 0
                            }}
                          >
                            <Text 
                              fontSize={rsp.normalize(24)} 
                              fontWeight="800" 
                              color="primary"
                            >
                              {digit}
                            </Text>
                            {isFocused && (
                              <Box position="absolute" bottom={8} width={12} height={2} backgroundColor="primary" />
                            )}
                          </Box>
                        );
                      })}
                    </Box>

                    {/* Hidden Actual Input */}
                    <TextInput
                      value={code}
                      onChangeText={(val) => setCode(val.replace(/[^0-9]/g, ''))}
                      keyboardType="number-pad"
                      maxLength={6}
                      autoFocus
                      style={{ position: 'absolute', opacity: 0, height: 0, width: 0 }}
                    />
                </Animated.View>
              )}

              {step === 'password' && (
                <>
                  <FormInput
                    label="Nouveau mot de passe"
                    placeholder="Minimum 8 caractères"
                    value={newPassword}
                    onChangeText={setNewPassword}
                    secureTextEntry
                    icon="lock-closed-outline"
                    error={error}
                  />
                  <Box height={15} />
                  <FormInput
                    label="Confirmer le mot de passe"
                    placeholder="Répétez le mot de passe"
                    value={confirmNewPassword}
                    onChangeText={setConfirmNewPassword}
                    secureTextEntry
                    icon="lock-closed-outline"
                  />
                </>
              )}

              <Box marginTop="m">
                <Button 
                  label={step === 'email' ? 'OBTENIR LE CODE' : step === 'code' ? 'CONTINUER' : 'RÉINITIALISER'} 
                  onPress={handlePress} 
                  loading={loading}
                  disabled={isButtonDisabled}
                  size="large"
                />
              </Box>

              {step === 'code' && (
                <TouchableOpacity 
                  onPress={() => setStep('email')}
                  style={{ alignSelf: 'center', marginTop: 25 }}
                >
                  <Text variant="bodySmall" color="primary" fontWeight="800">Modifier l'adresse e-mail</Text>
                </TouchableOpacity>
              )}
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Box>
  );
};

const styles = StyleSheet.create({
  scrollContent: { 
    paddingHorizontal: rsp.scale(24), 
    paddingBottom: 40,
    paddingTop: 10,
  },
  backButton: { 
    backgroundColor: 'white', 
    width: 44, 
    height: 44, 
    borderRadius: 22, 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginBottom: 25,
    ...Platform.select({
      web: { boxShadow: '0 2px 4px rgba(0,0,0,0.1)' },
      android: { elevation: 3 },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      }
    })
  }
});

export default ForgotPasswordScreen;
