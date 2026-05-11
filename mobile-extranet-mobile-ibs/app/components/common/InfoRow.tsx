import React from 'react';
import Icon from '@expo/vector-icons/Ionicons';
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
    marginHorizontal="m" 
    borderBottomWidth={isLast ? 0 : 1} 
    borderBottomColor="border"
  >
    <Box flex={1} flexDirection="row" alignItems="center">
      {icon && (
        <Box 
          width={32} 
          height={32} 
          borderRadius="round" 
          backgroundColor="backgroundGray" 
          alignItems="center" 
          justifyContent="center" 
          marginRight="m"
        >
          <Icon 
            name={icon as any} 
            size={16} 
            color="#65676B" 
          />
        </Box>
      )}
      <Text 
        variant="bodyMedium" 
        color="textSecondary" 
        fontWeight="600" 
        fontSize={rsp.normalize(14)}
      >
        {label}
      </Text>
    </Box>
    <Text 
      variant="body" 
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
