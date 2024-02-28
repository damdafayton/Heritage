import PolyfillCrypto from 'react-native-webview-crypto';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {useContext} from 'react';

import {HerritageWalletContext} from '../../context/HerritageWallet.context';
import {EncryptedData} from './EncryptedData';
import {ActivityIndicator} from '../../ui/ActivityIndicator';
import {logger} from '../../utils/logger';
import {HomeSubscribedType} from '../../typings/config';
import {HomeSubscribed} from './HomeSubscribed';
import {useTheme} from 'react-native-paper';
import {SendFunds} from './SendFunds';
import {Deposit} from './Deposit';
import {AddInheritant} from './AddInheritant';
import {ScrollView} from 'react-native';
import {styles} from '../../ui/styles';
import {Text} from '../../ui';

const log = logger('HomeStack');

export function HomeStack() {
  const {subscriptionData, refetchSubscriptionData} = useContext(
    HerritageWalletContext,
  );

  if (!subscriptionData) return <ActivityIndicator />;

  const Stack = createNativeStackNavigator();

  const theme = useTheme();

  const globalScreenOptions = {headerShown: false};

  const StyledScrollView = ({children, ...props}) => {
    return (
      <ScrollView {...props}>
        {children}
        <Text style={{marginBottom: 24}}>{''}</Text>
      </ScrollView>
    );
  };

  return (
    <>
      <PolyfillCrypto />
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
              <HomeSubscribed />
            </StyledScrollView>
          )}
        </Stack.Screen>
        <Stack.Screen
          name={HomeSubscribedType.DEPOSIT}
          options={{...globalScreenOptions}}>
          {props => (
            <StyledScrollView {...props}>
              <Deposit />
            </StyledScrollView>
          )}
        </Stack.Screen>
        <Stack.Screen
          options={globalScreenOptions}
          name={HomeSubscribedType.ENCRYPTED_DATA}>
          {props => (
            <StyledScrollView {...props}>
              <EncryptedData></EncryptedData>
            </StyledScrollView>
          )}
        </Stack.Screen>
        <Stack.Screen
          name={HomeSubscribedType.SEND}
          options={globalScreenOptions}>
          {props => (
            <StyledScrollView {...props}>
              <SendFunds />
            </StyledScrollView>
          )}
        </Stack.Screen>
        <Stack.Screen
          name={HomeSubscribedType.ADD_INHERITANT}
          options={globalScreenOptions}>
          {props => (
            <StyledScrollView {...props}>
              <AddInheritant />
            </StyledScrollView>
          )}
        </Stack.Screen>
      </Stack.Navigator>
    </>
  );
}
