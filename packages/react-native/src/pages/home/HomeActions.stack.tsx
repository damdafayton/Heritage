import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {useContext} from 'react';

import {HerritageWalletContext} from '../../context/HerritageWallet.context';
import {EncryptedData} from './EncryptedData';
import {ActivityIndicator} from '../../ui/ActivityIndicator';
import {logger} from '../../utils/logger';
import {HomeSubscribedType} from '../../typings/config';
import {useTheme} from 'react-native-paper';
import {ScrollView} from 'react-native';
import {Text} from '../../ui';
import {HomeActions} from './HomeActions';

const log = logger('HomeActionsStack');

export function HomeActionsStack() {
  const {subscriptionData} = useContext(HerritageWalletContext);

  if (!subscriptionData) return <ActivityIndicator />;

  const Stack = createNativeStackNavigator();

  const theme = useTheme();

  const globalScreenOptions = {headerShown: false};

  const StyledScrollView = ({children, ...props}) => {
    return (
      <ScrollView showsVerticalScrollIndicator={false} {...props}>
        {children}
        <Text style={{marginBottom: 24}}>{''}</Text>
      </ScrollView>
    );
  };

  return (
    <>
      <Stack.Navigator
        screenOptions={{
          contentStyle: {
            backgroundColor: theme.colors.background,
            // paddingTop: 4,
            flexDirection: 'column',
            rowGap: 2,
          },
        }}>
        <Stack.Screen
          name={HomeSubscribedType.HOME}
          options={{...globalScreenOptions}}>
          {props => (
            <StyledScrollView {...props}>
              <HomeActions />
            </StyledScrollView>
          )}
        </Stack.Screen>
        <Stack.Screen
          options={globalScreenOptions}
          name={HomeSubscribedType.ENCRYPTED_DATA}>
          {props => (
            <StyledScrollView {...props}>
              <EncryptedData />
            </StyledScrollView>
          )}
        </Stack.Screen>
      </Stack.Navigator>
    </>
  );
}
