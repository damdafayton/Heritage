import PolyfillCrypto from 'react-native-webview-crypto';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {useContext} from 'react';
import {HerritageWalletContext} from '../../context/HerritageWallet.context';
import {
  AddInheritantForm,
  AddInheritantVals,
} from '../../forms/AddInheritantForm';
import {useHeritageWalletContract} from '../../hooks/useHeritageWalletContract';
import {useContractWrite} from 'wagmi';
import {EncryptedData} from './EncryptedData';
import {ActivityIndicator} from '../../ui/ActivityIndicator';
import {logger} from '../../utils/logger';
import {HomeSubscribedType} from '../../typings/config';
import {HomeSubscribed} from './HomeSubscribed';
import {useTheme} from 'react-native-paper';
import {SendFunds} from './SendFunds';
import {Deposit} from './Deposit';

const log = logger('HomeStack');

export function HomeStack() {
  const {subscriptionData, refetchSubscriptionData} = useContext(
    HerritageWalletContext,
  );

  if (!subscriptionData) return <ActivityIndicator />;

  const {abi, address} = useHeritageWalletContract();

  const {write: writeAddInheritant, isSuccess: isSuccess3} = useContractWrite({
    abi,
    address,
    functionName: 'addInheritant',
  });

  const onSubmitAddInheritant = async (vals: AddInheritantVals) => {
    await writeAddInheritant({args: [vals.address, BigInt(vals.percent)]});
  };

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
            paddingTop: 10,
            flexDirection: 'column',
            rowGap: 2,
          },
        }}>
        <Stack.Screen
          name={HomeSubscribedType.HOME}
          component={HomeSubscribed}
          options={{...globalScreenOptions, title: 'Home'}}
        />
        <Stack.Screen
          name={HomeSubscribedType.DEPOSIT}
          options={{...globalScreenOptions, title: 'newTitle'}}>
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
          options={globalScreenOptions}>
          {props => (
            <AddInheritantForm
              onSubmit={onSubmitAddInheritant}
              isSuccess={isSuccess3}
              {...props}
            />
          )}
        </Stack.Screen>
      </Stack.Navigator>
    </>
  );
}

{
  /* {subscriptionData && isSubscribed(subscriptionData) ? (
        <View style={styles.contractDataCell}>
          <Text>Fees for you</Text>
          <View style={styles.contractDataRow}>
            <Text>Annual fee: </Text>
            <Text>{subscriptionData.feeThousandagePerYear}</Text>
            <Text>‰</Text>
          </View>
          <View style={styles.contractDataRow}>
            <Text>Minimum fee: </Text>
            <Text>{subscriptionData.minFeePerYear}</Text>
            <Text>$</Text>
          </View>
        </View>
      ) : (
        <></>
      )} */
}
