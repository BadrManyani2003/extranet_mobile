import React from 'react';
import { TouchableOpacity, StyleSheet, Platform, View } from 'react-native';
import { Box, Text } from '../../theme/restyle';
import { useTheme } from '@shopify/restyle';
import Icon from '@expo/vector-icons/Ionicons';
import { Theme } from '../../theme/theme';

type SinistreCardProps = {
  type: string;
  date: string;
  statut: 'En traitement' | 'Indemnisé' | 'Traité';
  reference: string;
  description: string;
  montant?: string;
  icon: string;
  iconColor: keyof Theme['colors'];
  onPress?: () => void;
};

const SinistreCard: React.FC<SinistreCardProps> = ({
  type,
  date,
  statut,
  reference,
  description,
  montant,
  icon,
  iconColor,
  onPress,
}) => {
  const theme = useTheme<Theme>();
  const themes = theme;

  // Fonction pour obtenir les couleurs du statut
  const getStatusColors = (): {
    color: keyof Theme['colors'];
    bgColor: keyof Theme['colors'];
  } => {
    if (statut === 'Indemnisé') {
      return { color: 'success', bgColor: 'successLight' };
    }
    if (statut === 'En traitement') {
      return { color: 'warning', bgColor: 'warningLight' };
    }
    return { color: 'info', bgColor: 'infoLight' };
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
        <Box flexDirection="row" alignItems="flex-start" marginBottom="m">
          <Box
            width={44}
            height={44}
            borderRadius="m"
            backgroundColor={iconBgColor}
            justifyContent="center"
            alignItems="center"
            marginRight="m"
          >
            <Icon 
              name={icon as any} 
              size={24} 
              color={theme.colors[iconColor]} 
            />
          </Box>
          
          <Box flex={1}>
            <Box flexDirection="row" justifyContent="space-between" alignItems="flex-start">
              <Box flex={1}>
                <Text variant="cardTitle" color="text" marginBottom="xs" style={{ fontSize: 16, fontWeight: '700' }}>
                  {type}
                </Text>
                <Text variant="caption" color="textTertiary">
                   {reference} • {date}
                </Text>
              </Box>
              
              <Box
                paddingHorizontal="m"
                paddingVertical="xs"
                backgroundColor={statusColors.bgColor}
                borderRadius="round"
                marginLeft="s"
              >
                <Text 
                  variant="caption" 
                  color={statusColors.color}
                  style={{ fontWeight: '700', fontSize: 10, textTransform: 'uppercase' }}
                >
                  {statut}
                </Text>
              </Box>
            </Box>
            
            <View style={{ marginTop: 10, backgroundColor: theme.colors.backgroundGray, padding: 10, borderRadius: 8 }}>
              <Text variant="caption" color="textSecondary" style={{ fontStyle: 'italic' }}>
                "{description}"
              </Text>
            </View>
            
            {montant && (
              <Box flexDirection="row" alignItems="center" marginTop="m" paddingHorizontal="xs">
                <Icon name="cash-outline" size={16} color={theme.colors.success} style={{ marginRight: 6 }} />
                <Text variant="caption" color="success" style={{ fontWeight: '700' }}>
                   Indemnisation: {montant}
                </Text>
              </Box>
            )}
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

export default SinistreCard;
