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
    paddingVertical="m" 
    paddingHorizontal="m" 
    borderBottomWidth={isLast ? 0 : 1} 
    borderBottomColor="borderLight"
  >
    <Box flex={1} flexDirection="row" alignItems="center">
      {icon && (
        <Box 
          width={36} 
          height={36} 
          borderRadius="m" 
          backgroundColor="primaryBg" 
          alignItems="center" 
          justifyContent="center" 
          marginRight="m"
        >
          <Icon 
            name={icon as any} 
            size={18} 
            color="#075985" 
          />
        </Box>
      )}
      <Text 
        variant="bodySmall" 
        color="textSecondary" 
        fontWeight="600"
      >
        {label}
      </Text>
    </Box>
    <Text 
      variant="bodyMedium" 
      color={valueColor as any} 
      fontWeight="800" 
      textAlign="right"
    >
      {value ?? '-'}
    </Text>
  </Box>
);

export default InfoRow;
