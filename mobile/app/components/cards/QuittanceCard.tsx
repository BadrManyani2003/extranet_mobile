import React from 'react';
import { TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Box, Text } from '../../theme/restyle';
import { useTheme } from '@shopify/restyle';
import { Ionicons as Icon } from '@expo/vector-icons';
import { Theme } from '../../theme/theme';

type QuittanceCardProps = {
  contrat: string;
  montant: string;
  date: string;
  statut: 'À payer' | 'Payé';
  reference: string;
  type: 'Annuelle' | 'Mensuelle';
  icon: string;
  iconColor: keyof Theme['colors'];
  onPress?: () => void;
  onPay?: () => void;
};

const QuittanceCard: React.FC<QuittanceCardProps> = ({
  contrat,
  montant,
  date,
  statut,
  reference,
  type,
  icon,
  iconColor,
  onPress,
  onPay,
}) => {
  const theme = useTheme<Theme>();
  const themes = theme;

  // Fonction pour obtenir les couleurs du statut
  const getStatusColors = (): {
    color: keyof Theme['colors'];
    bgColor: keyof Theme['colors'];
  } => {
    if (statut === 'Payé') {
      return { color: 'success', bgColor: 'successLight' };
    }
    return { color: 'warning', bgColor: 'warningLight' };
  };

  // Fonction pour obtenir la couleur de fond de l'icône
  const getIconBackgroundColor = (): keyof Theme['colors'] => {
    const colorMap: Record<string, keyof Theme['colors']> = {
      'primary': 'primaryBg',
      'success': 'successBg',
      'warning': 'warningBg',
      'error': 'errorBg',
      'info': 'infoBg',
      'purple': 'purpleBg',
      'pink': 'purpleBg',
      'textTertiary': 'backgroundGray',
    };
    
    return colorMap[iconColor] || 'backgroundGray';
  };

  const statusColors = getStatusColors();
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
            <Text variant="cardTitle" color="text" marginBottom="xs" style={{ fontSize: 16, fontWeight: '700' }}>
              {contrat}
            </Text>
            <Text variant="caption" color="textTertiary">
              Réf: {reference} • {type}
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
          alignItems="center" 
          paddingTop="m"
          borderTopWidth={1}
          borderTopColor="borderLight"
        >
          <Box>
            <Text variant="caption" color="textTertiary" style={{ marginBottom: 4 }}>
              Montant
            </Text>
            <Text variant="body" color="primary" style={{ fontWeight: '800', fontSize: 18 }}>
              {montant}
            </Text>
          </Box>
          
          <Box alignItems="center">
            <Text variant="caption" color="textTertiary" style={{ marginBottom: 4 }}>
              Échéance
            </Text>
            <Text variant="body" color="text" style={{ fontWeight: '600' }}>
              {date}
            </Text>
          </Box>
          
          {statut === 'À payer' && onPay ? (
            <TouchableOpacity onPress={onPay}>
              <Box
                paddingHorizontal="l"
                paddingVertical="s"
                backgroundColor="primary"
                borderRadius="m"
                style={{
                  ...Platform.select({
                    web: { boxShadow: '0 2px 4px rgba(0,0,0,0.1)' },
                  })
                }}
              >
                <Text 
                  variant="caption" 
                  color="textInverse"
                  style={{ fontWeight: '700' }}
                >
                  Payer
                </Text>
              </Box>
            </TouchableOpacity>
          ) : (
             <Box
              paddingHorizontal="m"
              paddingVertical="xs"
              backgroundColor="successBg"
              borderRadius="m"
            >
              <Icon name="checkmark-circle" size={16} color={theme.colors.success} />
            </Box>
          )}
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

export default QuittanceCard;
