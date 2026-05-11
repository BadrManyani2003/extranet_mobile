import React, { useState, useRef, useEffect } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
  TouchableOpacity,
  StyleSheet,
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

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const theme = useTheme<Theme>();
  const c = theme.colors;

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Animations
  const slideAnim = useRef(new Animated.Value(20)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacityAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, bounciness: 4, speed: 10, useNativeDriver: true }),
    ]).start();
  }, [opacityAnim, slideAnim]);

  const handleRegister = async () => {
    const emailTrimmed = email.trim();
    if (!username || !emailTrimmed || !password || !confirmPassword) return;
    
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await authAPI.register(username, emailTrimmed, password, confirmPassword);
      navigation.navigate('Login');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l’inscription');
    } finally {
      setLoading(false);
    }
  };

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
            {/* Header */}
            <Animated.View style={{ opacity: opacityAnim, transform: [{ translateY: slideAnim }] }}>
              <TouchableOpacity 
                activeOpacity={0.7}
                onPress={() => navigation.goBack()} 
                style={styles.backButton}
              >
                <Icon name="arrow-back" size={26} color={c.text} />
              </TouchableOpacity>
              
              <Box marginBottom="xl" alignItems="center">
                <Text variant="header" color="primary" fontSize={28} fontWeight="800">Un nouveau départ</Text>
                <Text variant="bodySmall" color="textSecondary" marginTop="xs" fontWeight="600">Rejoignez la communauté AssurPlus</Text>
              </Box>
            </Animated.View>

            {/* Form */}
            <Animated.View style={{ opacity: opacityAnim, transform: [{ translateY: slideAnim }] }}>
              <FormInput
                label="Prénom et Nom"
                placeholder="Ex : Philippe Dubois"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="words"
              />

              <FormInput
                label="Votre e-mail"
                placeholder="votre@email.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <FormInput
                label="Mot de passe"
                placeholder="Choisissez votre sécurité"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />

              <FormInput
                label="Confirmez votre passe"
                placeholder="Une deuxième fois"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showPassword}
                error={error}
              />

              <Box marginTop="l">
                <Button 
                  label="Créer mon compte AssurPlus" 
                  onPress={handleRegister} 
                  loading={loading}
                  disabled={!email || !password || !username || !confirmPassword}
                  size="large"
                />
              </Box>

              <Box flexDirection="row" justifyContent="center" marginTop="xl" paddingBottom="xl">
                <Text variant="bodyMedium" color="textSecondary" fontWeight="600">Enregistré ? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                  <Text variant="bodyMedium" color="primary" fontWeight="800">Se connecter</Text>
                </TouchableOpacity>
              </Box>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Box>
  );
};

const styles = StyleSheet.create({
  scrollContent: { 
    paddingHorizontal: rsp.scale(32), 
    paddingBottom: 40,
    paddingTop: 10,
  },
  backButton: { 
    width: 44, 
    height: 44, 
    borderRadius: 22, 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginBottom: 20,
    marginLeft: -10
  }
});

export default RegisterScreen;
