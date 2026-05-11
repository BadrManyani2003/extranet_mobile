import React from 'react';
import { Platform } from 'react-native';
import { Box, Text } from '../../theme/restyle';
import { rsp } from '../../utils/responsive';

interface SectionProps {
  title?: string;
  children: React.ReactNode;
  padding?: boolean;
}

const Section: React.FC<SectionProps> = ({ title, children, padding = false }) => (
  <Box marginBottom="l">
    {title && (
      <Box marginHorizontal="l" marginBottom="s">
        <Text variant="labelBold" color="textSecondary" fontSize={rsp.normalize(14)} fontWeight="700">
          {title}
        </Text>
      </Box>
    )}
    <Box 
      backgroundColor="cardBackground" 
      marginHorizontal={Platform.OS === 'web' ? 'none' : 'l'} 
      borderRadius="m" 
      padding={padding ? "m" : "none"} 
      borderWidth={Platform.OS === 'web' ? 1 : 0}
      borderColor="border"
      overflow="hidden"
      style={Platform.select({
        ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3 },
        android: { elevation: 2 }
      })}
    >
      {children}
    </Box>
  </Box>
);

export default Section;
