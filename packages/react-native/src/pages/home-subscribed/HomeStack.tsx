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
import {SuccessSnackbar} from '../../molecules/SuccessSnackbar';

const log = logger('HomeStack');

export function HomeStack() {
  const {subscriptionData, refetchSubscriptionData} = useContext(
    HerritageWalletContext,
  );

  if (!subscriptionData) return <ActivityIndicator />;

  const Stack = createNativeStackNavigator();

  const theme = useTheme();

  const globalScreenOptions = {headerShown: false};

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
            marginBottom: 16,
          },
        }}>
        <Stack.Screen
          name={HomeSubscribedType.HOME}
          component={HomeSubscribed}
          options={{...globalScreenOptions}}
        />
        <Stack.Screen
          name={HomeSubscribedType.DEPOSIT}
          options={{...globalScreenOptions}}>
          {props => <Deposit {...props} />}
        </Stack.Screen>
        <Stack.Screen
          options={globalScreenOptions}
          name={HomeSubscribedType.ENCRYPTED_DATA}
          component={EncryptedData}
        />
        <Stack.Screen
          name={HomeSubscribedType.SEND}
          options={globalScreenOptions}>
          {props => <SendFunds {...props} />}
        </Stack.Screen>
        <Stack.Screen
          name={HomeSubscribedType.ADD_INHERITANT}
          options={globalScreenOptions}
          component={AddInheritant}
        />
      </Stack.Navigator>
    </>
  );
}
