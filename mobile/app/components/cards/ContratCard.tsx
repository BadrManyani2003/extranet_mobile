import React from 'react';
import { TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Box, Text } from '../../theme/restyle';
import { useTheme } from '@shopify/restyle';
import { Ionicons as Icon } from '@expo/vector-icons';
import { Theme } from '../../theme/theme';

type ContratCardProps = {
  title: string;
  numero: string;
  statut: 'Actif' | 'Expiré';
  prime: string;
  echeance: string;
  date: string;
  icon: string;
  iconColor: keyof Theme['colors'];
  onPress?: () => void;
};

const ContratCard: React.FC<ContratCardProps> = ({
  title,
  numero,
  statut,
  prime,
  echeance,
  date,
  icon,
  iconColor,
  onPress,
}) => {
  const theme = useTheme<Theme>();
  const themes = theme; // alias

  // Fonction helper pour obtenir la couleur du statut
  const getStatusColor = (): {
    color: keyof Theme['colors'];
    bgColor: keyof Theme['colors'];
  } => {
    if (statut === 'Actif') {
      return { color: 'success', bgColor: 'successLight' };
    }
    return { color: 'error', bgColor: 'errorLight' };
  };

  // Fonction helper pour obtenir la couleur de fond de l'icône
  const getIconBackgroundColor = (): keyof Theme['colors'] => {
    if (iconColor === 'primary') return 'primaryBg';
    if (iconColor === 'success') return 'successBg';
    if (iconColor === 'warning') return 'warningBg';
    if (iconColor === 'error') return 'errorBg';
    if (iconColor === 'info') return 'infoBg';
    if (iconColor === 'purple') return 'purpleBg';
    return 'backgroundGray';
  };

  const statusColors = getStatusColor();
  const iconBgColor = getIconBackgroundColor();

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={styles.container}
    >
      <Box
        backgroundColor="cardBackground"
        padding="m"
        borderRadius="l"
        borderWidth={1}
        borderColor="border"
        style={{
          ...Platform.select({
            web: { boxShadow: '0 4px 12px rgba(0,0,0,0.06)' },
            default: {
              shadowColor: themes.colors.text,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.08,
              shadowRadius: 8,
            }
          }),
          elevation: 3,
        }}
      >
        <Box flexDirection="row" alignItems="center" marginBottom="m">
          <Box
            width={48}
            height={48}
            borderRadius="m"
            backgroundColor={iconBgColor}
            justifyContent="center"
            alignItems="center"
            marginRight="m"
          >
            <Icon 
              name={icon as any} 
              size={26} 
              color={theme.colors[iconColor]} 
            />
          </Box>
          
          <Box flex={1}>
            <Text variant="cardTitle" color="text" marginBottom="xs" style={{ fontSize: 17, fontWeight: '700' }}>
              {title}
            </Text>
            <Text variant="caption" color="textTertiary" style={{ letterSpacing: 0.5 }}>
              N° {numero}
            </Text>
          </Box>
          
          <Box
            paddingHorizontal="m"
            paddingVertical="xs"
            backgroundColor={statusColors.bgColor}
            borderRadius="round"
          >
            <Text 
              variant="caption" 
              color={statusColors.color}
              style={{ fontWeight: '700', fontSize: 11, textTransform: 'uppercase' }}
            >
              {statut}
            </Text>
          </Box>
        </Box>
        
        <Box 
          flexDirection="row" 
          justifyContent="space-between" 
          paddingTop="m" 
          borderTopWidth={1} 
          borderTopColor="borderLight"
        >
          <Box flex={2}>
            <Text variant="caption" color="textTertiary" style={{ marginBottom: 4 }}>
              Prime totale
            </Text>
            <Text variant="body" color="primary" style={{ fontWeight: '800', fontSize: 15 }}>
              {prime}
            </Text>
          </Box>
          
          <Box flex={2} alignItems="center">
            <Text variant="caption" color="textTertiary" style={{ marginBottom: 4 }}>
              Date d'effet
            </Text>
            <Text variant="body" color="text" style={{ fontWeight: '600', fontSize: 14 }}>
              {date}
            </Text>
          </Box>
          
          <Box flex={2} alignItems="flex-end">
            <Text variant="caption" color="textTertiary" style={{ marginBottom: 4 }}>
              Échéance
            </Text>
            <Text variant="body" color="error" style={{ fontWeight: '700', fontSize: 14 }}>
              {echeance}
            </Text>
          </Box>
        </Box>
      </Box>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
});

export default ContratCard;
