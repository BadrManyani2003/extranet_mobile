import React from 'react';
import { Ionicons as Icon } from '@expo/vector-icons';
import { Box, Text } from '../../theme/restyle';
import { Theme } from '../../theme/theme';
import { rsp } from '../../utils/responsive';

interface InfoRowProps {
  label: string;
  value: string | number;
  valueColor?: keyof Theme['colors'];
  icon?: string;
  isLast?: boolean;
}

const InfoRow: React.FC<InfoRowProps> = ({ 
  label, 
  value, 
  valueColor = 'text', 
  icon, 
  isLast 
}) => (
  <Box 
    flexDirection="row" 
    alignItems="center" 
    paddingVertical="l" 
    paddingHorizontal="l" 
    borderBottomWidth={isLast ? 0 : 1} 
    borderBottomColor="borderLight"
  >
    <Box flex={1} flexDirection="row" alignItems="center">
      {icon && (
        <Box 
          width={32} 
          height={32} 
          borderRadius="s" 
          backgroundColor="primaryBg" 
          alignItems="center" 
          justifyContent="center" 
          marginRight="m"
        >
          <Icon 
            name={icon as any} 
            size={16} 
            color="#0ea5e9" 
          />
        </Box>
      )}
      <Text 
        variant="bodySmall" 
        color="textTertiary" 
        fontWeight="600"
        fontSize={rsp.normalize(13)}
      >
        {label}
      </Text>
    </Box>
    <Text 
      variant="bodyMedium" 
      color={valueColor as any} 
      fontWeight="700" 
      textAlign="right"
      fontSize={rsp.normalize(14)}
    >
      {value ?? '-'}
    </Text>
  </Box>
);

export default InfoRow;
