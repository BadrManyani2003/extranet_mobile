import React, { useState, useEffect, useRef } from 'react';
import { ScrollView, KeyboardAvoidingView, Platform, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { Box, Text } from '../../theme/restyle';
import AppHeader from '../../components/layout/AppHeader';
import { StatusBadge, LoadingSpinner } from '../../components/common';
import { Ionicons as Icon } from '@expo/vector-icons';
import { Theme } from '../../theme/theme';
import { useTheme } from '@shopify/restyle';
import { reclamationsAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';

const ReclamationDetailScreen = () => {
  const theme = useTheme<Theme>();
  const route = useRoute<any>();
  const { reclamation } = route.params;
  const { user } = useAuth();
  
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);

  const fetchDetails = async () => {
    try {
      const data = await reclamationsAPI.getDetails(reclamation.id);
      setMessages(data);
    } catch (error) {
      console.error("Erreur détails réclamation:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [reclamation.id]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    setSending(true);
    try {
      await reclamationsAPI.addMessage(reclamation.id, newMessage);
      setNewMessage('');
      await fetchDetails();
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
    } catch (error) {
      console.error("Erreur envoi message:", error);
    } finally {
      setSending(false);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleString('fr-FR', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' });
  };

  if (loading) return <LoadingSpinner />;

  return (
    <Box flex={1} backgroundColor="background">
      <AppHeader title={reclamation.sujet} showBackButton={true} />
      
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <Box padding="m" backgroundColor="cardBackground" borderBottomWidth={1} borderBottomColor="borderLight">
          <Box flexDirection="row" justifyContent="space-between" alignItems="center">
            <Text variant="caption" color="textTertiary">
              Type: {reclamation.nature} • Créé le {formatDate(reclamation.dateReclamation)}
            </Text>
            <StatusBadge label={reclamation.statut} variant={reclamation.statut_variant || 'neutral'} size="small" />
          </Box>
        </Box>

        <ScrollView 
          ref={scrollViewRef}
          contentContainerStyle={{ padding: 15, paddingBottom: 30 }}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map((msg, index) => {
            const isMe = msg.fkUserId === user?.id;
            return (
              <Box 
                key={msg.id || index}
                alignSelf={isMe ? 'flex-end' : 'flex-start'}
                maxWidth="85%"
                marginBottom="m"
              >
                {!isMe && (
                  <Text variant="caption" color="textTertiary" marginLeft="s" marginBottom="xxs">
                    {msg.envoyeur}
                  </Text>
                )}
                <Box 
                  backgroundColor={isMe ? 'primary' : 'cardBackground'}
                  padding="m"
                  borderRadius="l"
                  style={{
                    borderTopRightRadius: isMe ? 4 : 20,
                    borderTopLeftRadius: !isMe ? 4 : 20,
                    shadowRadius: 2,
                    boxShadow: Platform.OS === 'web' ? '0 1px 2px rgba(0,0,0,0.05)' : undefined
                  }}
                >
                  <Text color={isMe ? 'white' : 'text'} variant="bodySmall">
                    {msg.message}
                  </Text>
                  <Text 
                    color={isMe ? 'white' : 'textTertiary'} 
                    variant="caption" 
                    fontSize={10} 
                    marginTop="xs" 
                    textAlign="right"
                    style={{ opacity: 0.8 }}
                  >
                    {formatDate(msg.dateMessage)}
                  </Text>
                </Box>
              </Box>
            );
          })}
        </ScrollView>

        {reclamation.statut !== 'Clôturé' && (
          <Box 
            padding="m" 
            flexDirection="row" 
            alignItems="center" 
            backgroundColor="cardBackground"
            borderTopWidth={1}
            borderTopColor="borderLight"
          >
            <Box flex={1} backgroundColor="background" borderRadius="xl" paddingHorizontal="m" paddingVertical="s" marginRight="s" borderWidth={1} borderColor="border">
              <TextInput 
                placeholder="Votre message..."
                value={newMessage}
                onChangeText={setNewMessage}
                multiline
                style={{ color: theme.colors.text, fontSize: 16, maxHeight: 100 }}
              />
            </Box>
            <TouchableOpacity 
              onPress={handleSendMessage}
              disabled={sending || !newMessage.trim()}
              style={{
                backgroundColor: theme.colors.primary,
                width: 44,
                height: 44,
                borderRadius: 22,
                justifyContent: 'center',
                alignItems: 'center',
                opacity: (sending || !newMessage.trim()) ? 0.6 : 1
              }}
            >
              {sending ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Icon name="send" size={20} color="white" />
              )}
            </TouchableOpacity>
          </Box>
        )}
      </KeyboardAvoidingView>
    </Box>
  );
};

export default ReclamationDetailScreen;
