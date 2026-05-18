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
  <Box marginBottom="xl">
    {title && (
      <Box marginHorizontal="xl" marginBottom="m" flexDirection="row" alignItems="center">
        {icon && (
          <Box backgroundColor="primaryBg" padding="xs" borderRadius="s" marginRight="s">
            <Icon name={icon as any} size={14} color="#0369a1" />
          </Box>
        )}
        <Text 
          variant="premiumLabel" 
          color="textTertiary" 
          fontSize={rsp.normalize(10)} 
          style={{ letterSpacing: 1.2, textTransform: 'uppercase', fontWeight: '800' }}
        >
          {title}
        </Text>
      </Box>
    )}
    <Box 
      backgroundColor="cardBackground" 
      marginHorizontal={Platform.OS === 'web' ? 'none' : 'l'} 
      borderRadius="xl" 
      padding={padding ? "l" : "none"} 
      borderWidth={1}
      borderColor="borderLight"
      overflow="hidden"
      style={Platform.select({
        ios: { 
          shadowColor: '#075985', 
          shadowOffset: { width: 0, height: 8 }, 
          shadowOpacity: 0.08, 
          shadowRadius: 15 
        },
        android: { elevation: 4 },
        web: { boxShadow: '0 8px 24px rgba(7, 89, 133, 0.08)' }
      })}
    >
      {children}
    </Box>
  </Box>
);

export default Section;
