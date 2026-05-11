import React from 'react';
import { TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Box, Text } from '../../theme/restyle';
import { useTheme } from '@shopify/restyle';
import { Ionicons as Icon } from '@expo/vector-icons';
import { Theme } from '../../theme/theme';

type DashboardCardProps = {
  title: string;
  subtitle: string;
  iconName: string;
  count?: number;
  color: keyof Theme['colors']; // Utiliser les clés du thème
  onPress?: () => void;
};

const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  subtitle,
  iconName,
  count,
  color,
  onPress,
}) => {
  const theme = useTheme<Theme>();

  // Fonction pour obtenir la couleur de fond correspondante
  const getBackgroundColor = (): keyof Theme['colors'] => {
    const colorMap: Record<string, keyof Theme['colors']> = {
      'primary': 'primaryBg',
      'primaryLight': 'primaryBg',
      'primaryDark': 'primaryBg',
      'success': 'successBg',
      'successLight': 'successBg',
      'successDark': 'successBg',
      'warning': 'warningBg',
      'warningLight': 'warningBg',
      'warningDark': 'warningBg',
      'error': 'errorBg',
      'errorLight': 'errorBg',
      'errorDark': 'errorBg',
      'info': 'infoBg',
      'infoLight': 'infoBg',
      'infoDark': 'infoBg',
      'purple': 'purpleBg',
      'purpleLight': 'purpleBg',
      'purpleDark': 'purpleBg',
      'pink': 'purpleBg',
      'pinkLight': 'purpleBg',
      'pinkDark': 'purpleBg',
    };
    
    return colorMap[color] || 'backgroundGray';
  };

  const backgroundColor = getBackgroundColor();

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
        flexDirection="row"
        alignItems="center"
        style={{
          ...Platform.select({
            web: { boxShadow: '0 2px 4px rgba(0,0,0,0.1)' },
            default: {
              shadowColor: theme.colors.text,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: Platform.OS === 'ios' ? 0.1 : 0.05,
              shadowRadius: 4,
            }
          }),
          elevation: Platform.OS === 'android' ? 2 : 0,
        }}
      >
        <Box
          width={50}
          height={50}
          borderRadius="m"
          backgroundColor={backgroundColor}
          justifyContent="center"
          alignItems="center"
          marginRight="m"
        >
          <Icon 
            name={iconName as any} 
            size={28} 
            color={theme.colors[color]} 
          />
        </Box>
        
        <Box flex={1}>
          <Text 
            variant="cardTitle" 
            color="text"
            marginBottom="xs"
          >
            {title}
          </Text>
          <Text 
            variant="caption" 
            color="textSecondary"
          >
            {subtitle}
          </Text>
        </Box>
        
        {count !== undefined && (
          <Box
            padding="s"
            backgroundColor="primary"
            borderRadius="round"
            minWidth={28}
            height={28}
            justifyContent="center"
            alignItems="center"
          >
            <Text 
              variant="caption" 
              color="textInverse"
              style={{ 
                fontWeight: 'bold',
                fontSize: 12,
              }}
            >
              {count > 99 ? '99+' : count}
            </Text>
          </Box>
        )}
      </Box>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
});

export default DashboardCard;
