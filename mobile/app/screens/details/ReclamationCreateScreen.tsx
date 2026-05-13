import React, { useState } from 'react';
import { ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Box, Text } from '../../theme/restyle';
import AppHeader from '../../components/layout/AppHeader';
import { FormInput, Section } from '../../components/common';
import { Ionicons as Icon } from '@expo/vector-icons';
import { Theme } from '../../theme/theme';
import { useTheme } from '@shopify/restyle';
import { reclamationsAPI } from '../../api';

const ReclamationCreateScreen = () => {
  const theme = useTheme<Theme>();
  const navigation = useNavigation<any>();
  
  const [sujet, setSujet] = useState('');
  const [nature, setNature] = useState('R'); // R: Réclamation, D: Demande d'info, S: Sinistre
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!sujet.trim() || !message.trim()) {
      Alert.alert("Champs requis", "Veuillez remplir le sujet et le message.");
      return;
    }

    setLoading(true);
    try {
      await reclamationsAPI.create(sujet, nature, message);
      Alert.alert("Succès", "Votre demande a été envoyée avec succès.");
      navigation.goBack();
    } catch (error) {
      console.error("Erreur création réclamation:", error);
      Alert.alert("Erreur", "Une erreur est survenue lors de l'envoi.");
    } finally {
      setLoading(false);
    }
  };

  const natureOptions = [
    { label: 'Réclamation', value: 'R', icon: 'alert-circle-outline' },
    { label: 'Demande d\'info', value: 'D', icon: 'help-circle-outline' },
    { label: 'Déclarer un Sinistre', value: 'S', icon: 'warning-outline' },
  ];

  return (
    <Box flex={1} backgroundColor="background">
      <AppHeader title="Nouvelle Demande" showBackButton={true} />
      
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text variant="header" fontSize={20} marginBottom="l">Comment pouvons-nous vous aider ?</Text>

        <Section title="Nature de la demande" icon="list-outline">
          <Box flexDirection="row" justifyContent="space-between" paddingVertical="m">
            {natureOptions.map((opt) => (
              <TouchableOpacity 
                key={opt.value}
                onPress={() => setNature(opt.value)}
                style={{
                  flex: 1,
                  alignItems: 'center',
                  padding: 12,
                  borderRadius: 12,
                  backgroundColor: nature === opt.value ? theme.colors.primaryBg : 'transparent',
                  borderWidth: 1,
                  borderColor: nature === opt.value ? theme.colors.primary : theme.colors.border,
                  marginHorizontal: 4
                }}
              >
                <Icon name={opt.icon as any} size={24} color={nature === opt.value ? theme.colors.primary : theme.colors.textTertiary} />
                <Text 
                  variant="caption" 
                  marginTop="s" 
                  textAlign="center"
                  color={nature === opt.value ? 'primary' : 'textTertiary'}
                  fontWeight={nature === opt.value ? '700' : '400'}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </Box>
        </Section>

        <Box marginTop="l">
          <Text variant="caption" color="textTertiary" marginBottom="s" marginLeft="s">Sujet de votre demande</Text>
          <TextInput 
            placeholder="Ex: Problème de remboursement..."
            value={sujet}
            onChangeText={setSujet}
            style={{
              backgroundColor: theme.colors.cardBackground,
              borderRadius: 12,
              padding: 15,
              fontSize: 16,
              borderWidth: 1,
              borderColor: theme.colors.border,
              color: theme.colors.text
            }}
          />
        </Box>

        <Box marginTop="l">
          <Text variant="caption" color="textTertiary" marginBottom="s" marginLeft="s">Votre message détaillé</Text>
          <TextInput 
            placeholder="Décrivez votre situation ici..."
            value={message}
            onChangeText={setMessage}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            style={{
              backgroundColor: theme.colors.cardBackground,
              borderRadius: 12,
              padding: 15,
              fontSize: 16,
              borderWidth: 1,
              borderColor: theme.colors.border,
              height: 150,
              color: theme.colors.text
            }}
          />
        </Box>

        <TouchableOpacity 
          onPress={handleCreate}
          disabled={loading}
          style={{
            backgroundColor: theme.colors.primary,
            borderRadius: 15,
            padding: 18,
            alignItems: 'center',
            marginTop: 30,
            flexDirection: 'row',
            justifyContent: 'center',
            shadowOpacity: 0.3,
            shadowRadius: 10,
            boxShadow: Platform.OS === 'web' ? `0 4px 10px ${theme.colors.primary}4D` : undefined
          }}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Icon name="send" size={20} color="white" style={{ marginRight: 10 }} />
              <Text style={{ color: 'white', fontWeight: '900', fontSize: 18 }}>Envoyer ma demande</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </Box>
  );
};

export default ReclamationCreateScreen;
