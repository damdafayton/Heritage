/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import 'react';

import {StyleSheet, useColorScheme} from 'react-native';
import {W3mButton} from '@web3modal/wagmi-react-native';
import {useAccount, useContractRead} from 'wagmi';
import Config from 'react-native-config';
import {createMaterialBottomTabNavigator} from 'react-native-paper/react-navigation';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {logger} from './utils/logger';
const log = logger('App');

import {Home} from './pages/Home';
import {Subscribe} from './pages/subscribe/Subscribe';
import {useGetSubscriptionData} from './hooks/useGetSubscriptionData';
import {HerritageWalletContext} from './context/HerritageWallet.context';
import {useHeritageWalletContract} from './hooks/useHeritageWalletContract';
import {Abi} from 'viem';
import {displayTxResult} from './helpers/utils';
import {Appbar} from './ui/Appbar';
import {MenuType} from './typings/config';
import {Contract} from './pages/Contract';
import {useEffect, useReducer, useState} from 'react';
import {Subscribed} from './pages/Subscribed';

const App = ({style}) => {
  log.debug({Config});
  const isDarkMode = useColorScheme() === 'dark';

  // const backgroundStyle = {
  //   backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  // };

  const {address: userAddress, isConnecting, isDisconnected} = useAccount();

  const {subscriptionData, refetchSubscriptionData, isSubscribed} =
    useGetSubscriptionData(userAddress);

  const {findContractFunction, address: heritageAddress} =
    useHeritageWalletContract();

  const fnFeeThousandage = findContractFunction?.('feeThousandagePerYear');
  const fnMinFee = findContractFunction?.('minFeePerYearInUsd');

  const {data: data1, refetch} = useContractRead({
    address: heritageAddress,
    functionName: fnFeeThousandage?.name,
    abi: [fnFeeThousandage] as Abi,
  });

  const {data: data2, refetch: refetch2} = useContractRead({
    address: heritageAddress,
    functionName: fnMinFee?.name,
    abi: [fnMinFee] as Abi,
  });

  const feeThousandagePerYear = Number(displayTxResult(data1));
  const minFeePerYear = Number(displayTxResult(data2));

  const [isConnected, setIsConnected] = useState(!!minFeePerYear);

  log.debug({minFeePerYear, feeThousandagePerYear});

  const Tab = createMaterialBottomTabNavigator();

  const [activeTab, setActiveTab] = useState<string>(MenuType.HOME);

  const [key, forceUpdate] = useReducer(x => x + 1, 0);

  useEffect(() => {
    if (isConnected) return;

    if (minFeePerYear && feeThousandagePerYear) {
      setIsConnected(true);
      return;
    }

    log.error(
      `Connection error to contract at ${heritageAddress}. Will try again in 4 seconds`,
    );

    setTimeout(() => {
      refetch();
      refetch2();
      forceUpdate();
    }, 2000);
  }, [key]);

  return (
    <>
      {/* // Only in iOS, test in Android */}
      {/* <SafeAreaView style={styles.safeArea}> */}
      {/* <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} /> */}
      <HerritageWalletContext.Provider
        key={key}
        value={{
          subscriptionData,
          refetchSubscriptionData,
          hostName: Config.HOSTNAME,
          minFeePerYear,
          feeThousandagePerYear,
        }}>
        {/* <ScrollView contentInsetAdjustmentBehavior="automatic"> */}
        {/* <View
        //     style={{
              backgroundColor: isDarkMode ? Colors.black : Colors.white,
            }}> */}
        <Appbar title={activeTab} />
        <W3mButton balance="show" />
        <Tab.Navigator
          barStyle={{marginHorizontal: -20}}
          style={{
            paddingHorizontal: 20,
            paddingTop: 10,
            ...style,
          }}
          screenListeners={{
            state: e => {
              //@ts-ignore
              const historLen = e.data?.state.history.length;
              if (historLen > 0) {
                const tabName =
                  //@ts-ignore
                  e.data?.state.history[historLen - 1].key.split('-')[0];
                setActiveTab(tabName);
              }
            },
          }}
          initialRouteName={MenuType.HOME}
          screenOptions={
            {
              //@ts-ignore
              // header: props => <Appbar {...props} />,
            }
          }>
          <Tab.Screen
            name={MenuType.HOME}
            options={{
              tabBarLabel: MenuType.HOME,
              tabBarIcon: ({color}) => (
                <MaterialCommunityIcons name="home" color={color} size={26} />
              ),
            }}>
            {props =>
              isSubscribed ? (
                <Subscribed />
              ) : (
                <Home {...props} loading={!isConnected} />
              )
            }
          </Tab.Screen>
          {isConnected && (
            <>
              <Tab.Screen
                name={MenuType.CONTRACT}
                options={{
                  tabBarLabel: MenuType.CONTRACT,
                  tabBarIcon: ({color}) => (
                    <MaterialCommunityIcons
                      name="bell"
                      color={color}
                      size={26}
                    />
                  ),
                }}>
                {props => (
                  <Contract
                    {...props}
                    minFeePerYear={displayTxResult(minFeePerYear)}
                    feeThousandagePerYear={displayTxResult(
                      feeThousandagePerYear,
                    )}
                  />
                )}
              </Tab.Screen>
              {false && (
                <Tab.Screen
                  component={Subscribe}
                  name={MenuType.REGISTER}
                  options={{
                    tabBarLabel: MenuType.REGISTER,
                    tabBarIcon: ({color}) => (
                      <MaterialCommunityIcons
                        name="account"
                        color={color}
                        size={26}
                      />
                    ),
                  }}
                />
              )}
            </>
          )}
        </Tab.Navigator>
        {/* {!(isConnected && subscriptionData) ? (
            <Text>Connecting to chain...</Text>
          ) : (
            <Main isSubscribed={isSubscribed(subscriptionData)} />
          )} */}
        {/* </View> */}
        {/* </ScrollView> */}
      </HerritageWalletContext.Provider>
      {/* </SafeAreaView> */}
      {/* <BottomNavigation /> */}
    </>
  );
};

const Colors = {
  white: '#fff',
  black: '#000',
  light: '#ddd',
  dark: '#333',
  lighter: '#eee',
  darker: '#111',
};

const styles = StyleSheet.create({
  safeArea: {
    flexGrow: 1,
  },
  wrapper: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: 'yellow',
  },
  header: {
    fontWeight: '600',
    fontSize: 24,
    textAlign: 'center',
    margin: 10,
  },
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

export default App;
