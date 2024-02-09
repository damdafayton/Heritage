import PolyfillCrypto from 'react-native-webview-crypto';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {useContext, useEffect, useState} from 'react';
import {HerritageWalletContext} from '../../context/HerritageWallet.context';
import {
  AddInheritantForm,
  AddInheritantVals,
} from '../../forms/AddInheritantForm';
import {useHeritageWalletContract} from '../../hooks/useHeritageWalletContract';
import {useAccount, useContractWrite} from 'wagmi';
import {DepositForm, DepositFormVals} from '../../forms/DepositForm';
import {useConvertDepositToWei} from '../../forms/hooks/useConvertDepositToWei';
import {SendFundsForm, SendFundsFormVals} from '../../forms/SendFundsForm';
import {EncryptedData} from './EncryptedData';
import {ActivityIndicator} from '../../ui/ActivityIndicator';
import {logger} from '../../utils/logger';
import {HomeSubscribedType, MenuType} from '../../typings/config';
import {Home} from './Home';
import {useTheme} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';
const log = logger('THomeSubscribedType.HOME');

export function HomeSubscribed({setActiveTab}) {
  log.debug('rendering Subscribed');

  const {subscriptionData, refetchSubscriptionData} = useContext(
    HerritageWalletContext,
  );

  if (!subscriptionData) return <ActivityIndicator />;

  const [activeForm, setActiveForm] = useState<
    | 'send'
    | 'deposit'
    | 'add-inheritant'
    | 'pay-fee'
    | 'encrypted-data'
    | undefined
  >(undefined);

  const {abi, address} = useHeritageWalletContract();

  const {getDepositInWei} = useConvertDepositToWei();

  const {
    writeAsync: writeAsyncDeposit,
    isLoading,
    isSuccess,
  } = useContractWrite({
    abi,
    address,
    functionName: 'deposit',
  });

  const {writeAsync: writeAsyncSendFunds, isSuccess: isSuccess2} =
    useContractWrite({
      abi,
      address,
      functionName: 'sendFunds',
    });

  const {write: writeAddInheritant, isSuccess: isSuccess3} = useContractWrite({
    abi,
    address,
    functionName: 'addInheritant',
  });

  const {address: userAddr} = useAccount();

  const onSubmitDeposit = async (vals: DepositFormVals) => {
    const wei = await getDepositInWei(vals);
    log.info({wei});

    if (!userAddr) return;

    await writeAsyncDeposit({
      value: wei,
      args: [userAddr],
    });

    refetchSubscriptionData();

    if (isSuccess) setActiveForm(undefined);
  };

  const onSubmitSendFunds = async (vals: SendFundsFormVals) => {
    const wei = await getDepositInWei(vals);
    log.info({wei});

    if (!userAddr) return;

    await writeAsyncSendFunds({
      args: [wei, vals.receiverAddress],
    });

    refetchSubscriptionData();

    if (isSuccess2) setActiveForm(undefined);
  };

  const onSubmitAddInheritant = async (vals: AddInheritantVals) => {
    await writeAddInheritant({args: [vals.address, BigInt(vals.percent)]});

    if (isSuccess3) setActiveForm(undefined);
  };

  const Stack = createNativeStackNavigator();

  const theme = useTheme();

  const globalScreenOptions = {headerShown: false};

  const navigation = useNavigation();

  return (
    <>
      <PolyfillCrypto />
      <Stack.Navigator
        screenListeners={{
          state: e => {
            const routes = e.data?.state?.routes;
            const lastRoute = routes[routes.length - 1];

            const parentState = navigation.getState();

            setTimeout(() => setActiveTab(lastRoute.name), 1);

            parentState.history?.push(lastRoute);
            //@ts-ignore
            // const historLen = e.data?.state.history.length;
            // if (historLen > 0) {
            //   const tabName =
            //     //@ts-ignore
            //     e.data?.state.history[historLen - 1].key.split('-')[0];
            //   setActiveTab(tabName);
            // }
          },
        }}
        screenOptions={{
          contentStyle: {
            backgroundColor: theme.colors.background,
            paddingTop: 20,
            flexDirection: 'column',
            rowGap: 14,
          },
        }}>
        <Stack.Screen
          name={HomeSubscribedType.HOME}
          component={Home}
          options={globalScreenOptions}
        />
        <Stack.Screen
          name={HomeSubscribedType.DEPOSIT}
          options={globalScreenOptions}>
          {props => <DepositForm onSubmit={onSubmitDeposit} {...props} />}
        </Stack.Screen>
        <Stack.Screen
          options={globalScreenOptions}
          name={HomeSubscribedType.ENCRYPTED_DATA}
          component={EncryptedData}
        />
        <Stack.Screen
          name={HomeSubscribedType.SEND}
          options={globalScreenOptions}>
          {props => <SendFundsForm onSubmit={onSubmitSendFunds} {...props} />}
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
