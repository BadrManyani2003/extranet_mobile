import React, { useState, useCallback, useRef, useEffect } from 'react';
import { 
  ScrollView, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform, 
  TextInput, 
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { useTheme } from '@shopify/restyle';
import { Ionicons as Icon } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Box, Text } from '../theme/restyle';
import { Theme } from '../theme/theme';
import { reclamationsAPI } from '../api';
import AppHeader from '../components/layout/AppHeader';
import { RootStackParamList } from '../navigation/MainNavigator';
import { useTranslation } from '../utils/i18n';
import { rsp } from '../utils/responsive';

type Props = NativeStackScreenProps<RootStackParamList, 'ReclamationDetail'>;

const ReclamationDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { reclamationId, sujet } = route.params;
  const theme = useTheme<Theme>();
  const { t } = useTranslation();
  const scrollViewRef = useRef<ScrollView>(null);

  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);

  const loadMessages = useCallback(async () => {
    try {
      const data = await reclamationsAPI.getDetails(reclamationId);
      setMessages(data || []);
    } catch {
      // Erreur silencieuse
    } finally {
      setLoading(false);
    }
  }, [reclamationId]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || sending) return;
    setSending(true);
    try {
      await reclamationsAPI.addMessage(reclamationId, newMessage);
      setNewMessage('');
      await loadMessages();
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
    } catch {
      // Erreur silencieuse
    } finally {
      setSending(false);
    }
  };

  const renderMessage = (msg: any) => {
    const isAdmin = msg.nature === 'Admin' || msg.nature === 'A';
    return (
      <Box
        key={msg.id}
        alignSelf={isAdmin ? 'flex-start' : 'flex-end'}
        maxWidth="80%"
        marginBottom="m"
      >
        <Box
          backgroundColor={isAdmin ? 'border' : 'primary'}
          paddingHorizontal="m"
          paddingVertical="s"
          borderRadius="l"
          borderBottomLeftRadius={isAdmin ? 'none' : 'l'}
          borderBottomRightRadius={isAdmin ? 'l' : 'none'}
        >
          <Text color={isAdmin ? 'text' : 'white'} variant="body">
            {msg.message}
          </Text>
        </Box>
        <Text variant="caption" marginTop="xxs" textAlign={isAdmin ? 'left' : 'right'} color="textSecondary">
          {new Date(msg.dateMessage).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </Box>
    );
  };

  return (
    <Box flex={1} backgroundColor="background">
      <AppHeader title={sujet} showBackButton onBackPress={() => navigation.goBack()} />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.scrollContent}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {loading ? (
            <ActivityIndicator size="small" color={theme.colors.primary} style={{ marginTop: 20 }} />
          ) : (
            messages.map(renderMessage)
          )}
        </ScrollView>

        <Box 
          padding="m" 
          backgroundColor="cardBackground" 
          borderTopWidth={1} 
          borderTopColor="border" 
          flexDirection="row" 
          alignItems="center"
        >
          <TextInput
            style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.border }]}
            placeholder={t('Votre message…')}
            placeholderTextColor={theme.colors.textSecondary}
            value={newMessage}
            onChangeText={setNewMessage}
            multiline
          />
          <TouchableOpacity 
            style={[styles.sendButton, { backgroundColor: theme.colors.primary }]}
            onPress={handleSendMessage}
            disabled={sending}
          >
            {sending ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Icon name="send" size={20} color="white" />
            )}
          </TouchableOpacity>
        </Box>
      </KeyboardAvoidingView>
    </Box>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    padding: 16,
    paddingBottom: 20,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
    fontSize: 15,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ReclamationDetailScreen;
