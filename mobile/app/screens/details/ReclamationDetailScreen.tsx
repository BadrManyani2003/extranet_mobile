import React, { useState, useEffect, useRef } from 'react';
import { ScrollView, KeyboardAvoidingView, Platform, TextInput, TouchableOpacity, ActivityIndicator, Alert, Modal } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { Box, Text } from '../../theme/restyle';
import AppHeader from '../../components/layout/AppHeader';
import { StatusBadge, LoadingSpinner } from '../../components/common';
import { useTranslation } from '../../utils/i18n';
import { Ionicons as Icon } from '@expo/vector-icons';
import { Theme } from '../../theme/theme';
import { useTheme } from '@shopify/restyle';
import { reclamationsAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { rsp } from '../../utils/responsive';

const ReclamationDetailScreen = () => {
  const theme = useTheme<Theme>();
  const { t } = useTranslation();
  const route = useRoute<any>();
  const { reclamation } = route.params;
  const { user } = useAuth();

  const isCabinetUser = (user?.roles || []).some(r => 
    r.toUpperCase() === 'ADMIN_CABINET' || r.toUpperCase() === 'COMMERCIAL_CABINET'
  );
  
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [currentStatut, setCurrentStatut] = useState<string>(reclamation.statut || 'En cours');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<number | null>(null);
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
      // Refresh & keep status in sync
      setCurrentStatut('En cours');
      await fetchDetails();
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
    } catch (error) {
      console.error("Erreur envoi message:", error);
    } finally {
      setSending(false);
    }
  };

  const handleUpdateStatus = async (newStatus: 'E' | 'C') => {
    setUpdatingStatus(true);
    try {
      await reclamationsAPI.updateStatus(reclamation.id, newStatus);
      setCurrentStatut(newStatus === 'E' ? 'En cours' : 'Clôturé');
    } catch (error) {
      console.error("Erreur mise à jour statut:", error);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const performDelete = async (messageId: number) => {
    try {
      await reclamationsAPI.deleteMessage(messageId, reclamation.id);
      await fetchDetails();
    } catch (error) {
      console.error("Erreur suppression message:", error);
      if (Platform.OS === 'web') {
        window.alert(`${t("Erreur")}: ${t("Impossible de supprimer ce message.")}`);
      } else {
        Alert.alert(t("Erreur"), t("Impossible de supprimer ce message."));
      }
    }
  };

  const handleDeleteMessage = (messageId: number) => {
    setMessageToDelete(messageId);
    setDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    if (messageToDelete !== null) {
      const msgId = messageToDelete;
      setDeleteModalVisible(false);
      setMessageToDelete(null);
      await performDelete(msgId);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleString('fr-FR', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' });
  };

  const formatMsgTime = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) return <LoadingSpinner />;

  return (
    <Box flex={1} backgroundColor="backgroundLight">
      <AppHeader title={reclamation.sujet} showBackButton={true} />
      
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Status Header */}
        <Box 
          padding="m" 
          backgroundColor="cardBackground" 
          borderBottomWidth={1} 
          borderBottomColor="borderLight"
          flexDirection="row"
          alignItems="center"
          justifyContent="space-between"
          style={Platform.select({
            ios: { shadowColor: theme.colors.primary, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 6 },
            android: { elevation: 2 }
          })}
        >
          <Box flexDirection="row" alignItems="center">
            {/* Pulsing Avatar (Responsive sizing) */}
            <Box position="relative" marginRight="s">
              <Box 
                width={rsp.scale(36)} 
                height={rsp.scale(36)} 
                borderRadius="round" 
                backgroundColor="primary" 
                justifyContent="center" 
                alignItems="center"
              >
                <Icon name="shield-checkmark" size={rsp.scale(18)} color="white" />
              </Box>
              {/* Pulse Indicator */}
              <Box 
                position="absolute" 
                bottom={0} 
                right={0} 
                width={rsp.scale(10)} 
                height={rsp.scale(10)} 
                borderRadius="round" 
                backgroundColor="success" 
                borderWidth={1.5} 
                borderColor="cardBackground"
              />
            </Box>

            <Box>
              <Text variant="bodyMedium" fontSize={rsp.normalize(14)} color="text" fontWeight="800">
                {isCabinetUser ? (reclamation.client || t('Client')) : t('Support')}
              </Text>
              <Text variant="caption" color="textMuted" fontSize={rsp.normalize(11)}>
                {t('En ligne')} • {t('Ticket #')}{reclamation.id}
              </Text>
            </Box>
          </Box>

          {/* Status Badge + Action Buttons */}
          <Box flexDirection="row" alignItems="center" style={{ gap: 8 }}>
            <StatusBadge label={currentStatut} variant={currentStatut === 'En cours' ? 'warning' : 'success'} size="small" />
            {/* Toggle Status Button */}
            {currentStatut === 'En cours' || currentStatut === 'E' ? (
              <TouchableOpacity
                onPress={() => handleUpdateStatus('C')}
                disabled={updatingStatus}
                style={{
                  backgroundColor: '#f1f5f9',
                  paddingHorizontal: rsp.scale(10),
                  paddingVertical: rsp.scale(5),
                  borderRadius: rsp.scale(8),
                  opacity: updatingStatus ? 0.5 : 1
                }}
              >
                <Text style={{ fontSize: rsp.normalize(11), fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Clôturer
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={() => handleUpdateStatus('E')}
                disabled={updatingStatus}
                style={{
                  backgroundColor: '#fff7ed',
                  paddingHorizontal: rsp.scale(10),
                  paddingVertical: rsp.scale(5),
                  borderRadius: rsp.scale(8),
                  opacity: updatingStatus ? 0.5 : 1
                }}
              >
                <Text style={{ fontSize: rsp.normalize(11), fontWeight: '800', color: '#ea580c', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Réouvrir
                </Text>
              </TouchableOpacity>
            )}
          </Box>
        </Box>

        <ScrollView 
          ref={scrollViewRef}
          contentContainerStyle={{ padding: 15, paddingBottom: 30 }}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {/* Secured Chat Info Banner */}
          <Box 
            backgroundColor="transparentBlue" 
            padding="m" 
            borderRadius="m" 
            marginBottom="l" 
            flexDirection="row" 
            alignItems="center"
          >
            <Icon name="lock-closed" size={rsp.scale(16)} color={theme.colors.primary} style={{ marginRight: 8 }} />
            <Text variant="caption" color="textTertiary" flex={1} fontSize={rsp.normalize(11)}>
              {t('Cette discussion est sécurisée et confidentielle.')}
            </Text>
          </Box>

          {Array.isArray(messages) && [...messages].sort((a, b) => (Number(a.id) || 0) - (Number(b.id) || 0)).map((msg, index) => {
            const isMe = msg.fkUserId === user?.id;
            
            return (
              <Box 
                key={msg.id || index}
                flexDirection="row"
                alignSelf={isMe ? 'flex-end' : 'flex-start'}
                maxWidth="88%"
                marginBottom="m"
                alignItems="flex-end"
              >
                {/* Advisor Avatar on Left for Incoming Messages */}
                {!isMe && (
                  <Box 
                    width={rsp.scale(28)} 
                    height={rsp.scale(28)} 
                    borderRadius="round" 
                    backgroundColor="borderLight" 
                    justifyContent="center" 
                    alignItems="center"
                    marginRight="xs"
                    marginBottom="xxs"
                  >
                    <Icon name="person" size={rsp.scale(14)} color={theme.colors.textSecondary} />
                  </Box>
                )}

                {/* Delete Message Button (Aesthetic floating glass action) */}
                {Boolean(msg.canDelete) && (
                  <TouchableOpacity 
                    onPress={() => handleDeleteMessage(msg.id)}
                    activeOpacity={0.6}
                    hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                    style={{ marginRight: 6, marginBottom: 4, flexShrink: 0 }}
                  >
                    <Box 
                      width={rsp.scale(28)} 
                      height={rsp.scale(28)} 
                      borderRadius="round" 
                      backgroundColor="backgroundLight" 
                      justifyContent="center" 
                      alignItems="center"
                      borderWidth={1}
                      borderColor="borderLight"
                      style={{
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: 0.1,
                        shadowRadius: 1,
                        elevation: 1
                      }}
                    >
                      <Icon name="trash-outline" size={rsp.scale(14)} color="#ef4444" />
                    </Box>
                  </TouchableOpacity>
                )}

                <Box 
                  backgroundColor={isMe ? 'secondary' : 'cardBackground'}
                  paddingHorizontal="m"
                  paddingVertical="s"
                  style={{
                    borderTopRightRadius: isMe ? 4 : 20,
                    borderTopLeftRadius: !isMe ? 4 : 20,
                    borderBottomRightRadius: 20,
                    borderBottomLeftRadius: 20,
                    shadowColor: theme.colors.primary,
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.05,
                    shadowRadius: 2,
                    elevation: 1,
                    flexShrink: 1
                  }}
                >
                  {/* Sender Name if not Me */}
                  {!isMe && (
                    <Text variant="caption" color="primary" fontWeight="bold" fontSize={rsp.normalize(11)} marginBottom="xxs">
                      {msg.envoyeur || (msg.nature === 'Admin' || msg.nature === 'A' ? t('Support') : (msg.nature === 'E' ? t('Expert') : t('Client')))}
                    </Text>
                  )}

                  <Text color={isMe ? 'white' : 'text'} variant="bodySmall" style={{ lineHeight: 18, fontSize: rsp.normalize(14) }}>
                    {msg.message}
                  </Text>

                  {/* Message Timestamp & Checkmarks */}
                  <Box 
                    flexDirection="row" 
                    justifyContent="flex-end" 
                    alignItems="center" 
                    marginTop="xxs"
                    style={{ alignSelf: 'flex-end' }}
                  >
                    <Text 
                      color={isMe ? 'white' : 'textTertiary'} 
                      variant="caption" 
                      fontSize={rsp.normalize(9)} 
                      style={{ opacity: 0.7, marginRight: 2 }}
                    >
                      {formatMsgTime(msg.dateMessage)}
                    </Text>
                    {isMe && (
                      <Icon name="checkmark-done" size={rsp.scale(13)} color="white" style={{ opacity: 0.8 }} />
                    )}
                  </Box>
                </Box>
              </Box>
            );
          })}
        </ScrollView>

        {/* Floating Input Pill Bar */}
        {currentStatut !== 'Clôturé' && currentStatut !== 'C' ? (
          <Box 
            padding="m" 
            flexDirection="row" 
            alignItems="center" 
            backgroundColor="cardBackground"
            borderTopWidth={1}
            borderTopColor="borderLight"
            style={Platform.select({
              ios: { paddingBottom: rsp.verticalScale(25) },
              default: {}
            })}
          >
            {/* Input Field Capsule */}
            <Box 
              flex={1} 
              backgroundColor="backgroundLight" 
              borderRadius="xl" 
              paddingHorizontal="m" 
              paddingVertical="xs" 
              marginRight="s" 
              borderWidth={1} 
              borderColor="borderLight"
              flexDirection="row"
              alignItems="center"
            >
              <TextInput 
                placeholder={t('Votre message...')}
                placeholderTextColor={theme.colors.textMuted}
                value={newMessage}
                onChangeText={setNewMessage}
                multiline
                style={{ 
                  flex: 1,
                  color: theme.colors.text, 
                  fontSize: rsp.normalize(14), 
                  maxHeight: rsp.verticalScale(80),
                  fontFamily: 'Inter-Medium',
                  paddingVertical: Platform.OS === 'ios' ? 6 : 2,
                  ...Platform.select({
                    web: { outlineStyle: 'none' } as any,
                    default: {}
                  })
                }}
              />
            </Box>

            {/* Send Floating Action Button */}
            <TouchableOpacity 
              onPress={handleSendMessage}
              disabled={sending || !newMessage.trim()}
              style={{
                backgroundColor: theme.colors.primary,
                width: rsp.scale(42),
                height: rsp.scale(42),
                borderRadius: rsp.scale(21),
                justifyContent: 'center',
                alignItems: 'center',
                opacity: (sending || !newMessage.trim()) ? 0.6 : 1,
                ...Platform.select({
                  ios: { shadowColor: theme.colors.primary, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4 },
                  android: { elevation: 3 }
                })
              }}
            >
              {sending ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Icon name="send" size={rsp.scale(16)} color="white" style={{ marginLeft: 2 }} />
              )}
            </TouchableOpacity>
          </Box>
        ) : (
          /* Closed discussion notification */
          <Box 
            padding="m" 
            backgroundColor="transparentNavy"
            style={{ 
              backgroundColor: '#F8FAF5',
              paddingVertical: 18,
              borderTopWidth: 1, 
              borderTopColor: theme.colors.borderLight,
              alignItems: 'center',
              justifyContent: 'center',
              borderStyle: 'dashed',
              paddingBottom: Platform.OS === 'ios' ? rsp.verticalScale(30) : rsp.verticalScale(18)
            }}
          >
            <Box flexDirection="row" alignItems="center">
              <Icon name="lock-closed" size={rsp.scale(16)} color={theme.colors.textTertiary} style={{ marginRight: 6 }} />
              <Text variant="caption" color="textTertiary" fontWeight="800" style={{ letterSpacing: 1, textTransform: 'uppercase' }}>
                {t('Discussion clôturée')}
              </Text>
            </Box>
          </Box>
        )}
      </KeyboardAvoidingView>

      {/* Modern Destructive Confirmation Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={deleteModalVisible}
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <Box 
          flex={1} 
          justifyContent="center" 
          alignItems="center" 
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}
        >
          <Box 
            width="85%" 
            maxWidth={rsp.scale(320)}
            backgroundColor="cardBackground" 
            borderRadius="l" 
            padding="l"
            alignItems="center"
            style={Platform.select({
              ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 10 },
              android: { elevation: 8 },
              web: { boxShadow: '0px 4px 20px rgba(0,0,0,0.15)' } as any
            })}
          >
            {/* Warning Trash Icon Circle */}
            <Box 
              width={rsp.scale(54)} 
              height={rsp.scale(54)} 
              borderRadius="round" 
              backgroundColor="backgroundLight" 
              justifyContent="center" 
              alignItems="center"
              marginBottom="m"
              borderWidth={1}
              borderColor="borderLight"
            >
              <Icon name="trash-outline" size={rsp.scale(24)} color="#ef4444" />
            </Box>

            {/* Modal Title */}
            <Text 
              variant="title" 
              fontWeight="bold" 
              color="text" 
              marginBottom="s" 
              fontSize={rsp.normalize(16)}
              textAlign="center"
            >
              {t('Supprimer le message')}
            </Text>

            {/* Modal Description */}
            <Text 
              variant="bodySmall" 
              color="textSecondary" 
              marginBottom="xl" 
              fontSize={rsp.normalize(13)}
              textAlign="center"
              style={{ lineHeight: 18 }}
            >
              {t('Voulez-vous vraiment supprimer ce message ? Cette action est définitive.')}
            </Text>

            {/* Buttons Side by Side */}
            <Box flexDirection="row" width="100%" justifyContent="space-between">
              {/* Cancel Button */}
              <TouchableOpacity 
                onPress={() => setDeleteModalVisible(false)}
                style={{
                  flex: 1,
                  paddingVertical: rsp.verticalScale(12),
                  borderRadius: rsp.scale(10),
                  borderWidth: 1,
                  borderColor: theme.colors.borderLight,
                  marginRight: rsp.scale(8),
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: theme.colors.backgroundLight
                }}
              >
                <Text color="textSecondary" fontWeight="bold" fontSize={rsp.normalize(13)}>
                  {t('Annuler')}
                </Text>
              </TouchableOpacity>

              {/* Confirm Delete Button */}
              <TouchableOpacity 
                onPress={confirmDelete}
                style={{
                  flex: 1,
                  paddingVertical: rsp.verticalScale(12),
                  borderRadius: rsp.scale(10),
                  backgroundColor: '#ef4444',
                  marginLeft: rsp.scale(8),
                  justifyContent: 'center',
                  alignItems: 'center',
                  ...Platform.select({
                    ios: { shadowColor: '#ef4444', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 3 },
                    android: { elevation: 2 }
                  })
                }}
              >
                <Text color="white" fontWeight="bold" fontSize={rsp.normalize(13)}>
                  {t('Supprimer')}
                </Text>
              </TouchableOpacity>
            </Box>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default ReclamationDetailScreen;
