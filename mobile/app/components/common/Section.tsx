import React from 'react';
import { Platform } from 'react-native';
import { Box, Text } from '../../theme/restyle';
import { rsp } from '../../utils/responsive';
import { Ionicons as Icon } from '@expo/vector-icons';

interface SectionProps {
  title?: string;
  icon?: string;
  children: React.ReactNode;
  padding?: boolean;
}

const Section: React.FC<SectionProps> = ({ title, icon, children, padding = false }) => (
  <Box marginBottom="l">
    {title && (
      <Box marginHorizontal="l" marginBottom="s" flexDirection="row" alignItems="center">
        {icon && (
          <Icon name={icon as any} size={16} color="#075985" style={{ marginRight: 8 }} />
        )}
        <Text variant="premiumLabel" color="textSecondary" fontSize={rsp.normalize(11)}>
          {title}
        </Text>
      </Box>
    )}
    <Box 
      backgroundColor="cardBackground" 
      marginHorizontal={Platform.OS === 'web' ? 'none' : 'l'} 
      borderRadius="xl" 
      padding={padding ? "m" : "none"} 
      borderWidth={1}
      borderColor="borderLight"
      overflow="hidden"
      style={Platform.select({
        ios: { shadowColor: '#075985', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10 },
        android: { elevation: 3 },
        web: { boxShadow: '0 4px 12px rgba(7, 89, 133, 0.05)' }
      })}
    >
      {children}
    </Box>
  </Box>
);

export default Section;
