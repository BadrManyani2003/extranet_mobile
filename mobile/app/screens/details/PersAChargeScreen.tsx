import React, { useState, useEffect } from 'react';
import { ScrollView, RefreshControl, Platform, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Box, Text } from '../../theme/restyle';
import AppHeader from '../../components/layout/AppHeader';
import { LoadingSpinner, EmptyView, Section } from '../../components/common';
import { Ionicons as Icon } from '@expo/vector-icons';
import { Theme } from '../../theme/theme';
import { useTheme } from '@shopify/restyle';
import { adherentsAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';

const PersAChargeScreen = () => {
  const theme = useTheme<Theme>();
  const navigation = useNavigation();
  const { user } = useAuth();
  const [persons, setPersons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Note: On suppose que l'ID de l'adhérent est lié à l'utilisateur courant
  // Si on n'a pas l'ID de l'adhérent directement, on pourrait avoir besoin d'une étape intermédiaire
  // Mais sp_GetPersACharge attend @FK_Adherent_Id.
  // Pour cet exemple, on va récupérer les adhérents liés à l'utilisateur pour trouver l'ID de l'adhérent principal.
  
  const fetchData = async () => {
    try {
      setLoading(true);
      // Étape 1: Récupérer l'ID de l'adhérent lié à l'utilisateur
      const ads = await adherentsAPI.getAll();
      if (ads && ads.length > 0) {
        const principalAdherent = ads[0]; // On prend le premier
        // Étape 2: Récupérer les personnes à charge
        const res = await adherentsAPI.getFamille(principalAdherent.id);
        setPersons(res);
      }
    } catch (error) {
      console.error("Erreur personnes à charge:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '--/--/----';
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR');
  };

  if (loading && !refreshing) return <LoadingSpinner />;

  return (
    <Box flex={1} backgroundColor="background">
      <AppHeader title="Personnes à charge" showBackButton={true} />
      
      <ScrollView 
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />
        }
      >
        <Box padding="m">
           <Text variant="bodySmall" color="textSecondary" marginBottom="l" textAlign="center">
             Liste des membres de votre famille couverts par votre contrat.
           </Text>

           {persons.length === 0 ? (
             <EmptyView message="Aucune personne à charge trouvée." icon="people-outline" />
           ) : (
             <Box gap="m">
               {persons.map((person) => (
                 <Box 
                   key={person.id}
                   backgroundColor="cardBackground"
                   padding="l"
                   borderRadius="xl"
                   borderWidth={1}
                   borderColor="borderLight"
                   style={Platform.select({
                     ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10 },
                     android: { elevation: 2 },
                     web: { boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }
                   })}
                 >
                    <Box flexDirection="row" alignItems="center">
                       <Box 
                         width={48} 
                         height={48} 
                         borderRadius="round" 
                         backgroundColor="primaryBg" 
                         alignItems="center" 
                         justifyContent="center"
                         marginRight="m"
                       >
                          <Icon name="person" size={24} color={theme.colors.primary} />
                       </Box>
                       <Box flex={1}>
                          <Text variant="bodyMedium" fontWeight="800" color="text">{person.nom}</Text>
                          <Text variant="premiumLabel" color="primary" fontSize={10} marginTop="xxs">
                             {person.lien || 'Bénéficiaire'}
                          </Text>
                       </Box>
                    </Box>

                    <Box height={1} backgroundColor="borderLight" marginVertical="m" />

                    <Box flexDirection="row" justifyContent="space-between">
                       <Box>
                          <Text variant="caption" color="textTertiary">Date de naissance</Text>
                          <Text variant="bodySmall" fontWeight="700">{formatDate(person.dateNaissance)}</Text>
                       </Box>
                       <Box alignItems="flex-end">
                          <Text variant="caption" color="textTertiary">Date d'adhésion</Text>
                          <Text variant="bodySmall" fontWeight="700">{formatDate(person.dateAdhesion)}</Text>
                       </Box>
                    </Box>
                 </Box>
               ))}
             </Box>
           )}
        </Box>
      </ScrollView>
    </Box>
  );
};

export default PersAChargeScreen;
