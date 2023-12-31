/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, {useEffect, useState} from 'react';

import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import {W3mButton} from '@web3modal/wagmi-react-native';
import {useAccount, useContractRead} from 'wagmi';
import {useHeritageContract} from './hooks/useHeritageContract';
import {DisplayVariable} from './components/Contract/DiplayVariable';
import {displayTxResult} from './components/Contract/utils';
import {NotSubscribed} from './components/NotSubscribed';

const App = () => {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  const {address, isConnecting, isDisconnected} = useAccount();

  const {
    address: heritageAddress,
    abi: heritageABI,
    getHeritageFunction,
  } = useHeritageContract();

  const fnFeeThousandage = getHeritageFunction?.('feeThousandagePerYear');
  const fnMinFee = getHeritageFunction?.('minFeePerYearInUsd');
  const addressSubscriptionMap = getHeritageFunction?.(
    'addressSubscriptionMap',
  );

  const {
    data: subscriptionData,
    isFetching,
    refetch,
  } = useContractRead({
    abi: [addressSubscriptionMap],
    address: heritageAddress,
    functionName: addressSubscriptionMap?.name,
    args: [address],
  });

  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    if (isFetching || !subscriptionData) return;

    const [timestamp] = subscriptionData as Array<any>;

    setIsSubscribed(displayTxResult(timestamp) === 0 ? false : true);
  }, [isFetching]);

  const refreshDisplayVariables = true;

  return (
    <SafeAreaView style={backgroundStyle}>
      <W3mButton balance="show" />
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={backgroundStyle}>
        <View
          style={{
            backgroundColor: isDarkMode ? Colors.black : Colors.white,
          }}>
          <Text style={styles.header}>HERITAGE</Text>
          {heritageAddress && (
            <>
              <View style={styles.contractData}>
                <Text>Annual fee: </Text>
                <DisplayVariable
                  abiFunction={fnFeeThousandage}
                  contractAddress={heritageAddress}
                  refreshDisplayVariables={refreshDisplayVariables}
                />
                <Text>‰</Text>
              </View>
              <View style={styles.contractData}>
                <Text>Minimum fee: </Text>
                <DisplayVariable
                  abiFunction={fnMinFee}
                  contractAddress={heritageAddress}
                  refreshDisplayVariables={refreshDisplayVariables}
                />
                <Text>$</Text>
              </View>
              {isSubscribed ? (
                <>
                  <Section title="Step OneE">
                    Edit <Text style={styles.highlight}>App.js</Text> to change
                    this screen and then come back to see your edits. HI
                  </Section>

                  <Text>Learn More Links</Text>
                </>
              ) : (
                <NotSubscribed />
              )}
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// import {ConnectButton} from '@rainbow-me/rainbowkit';

// import {
//   Colors,
//   DebugInstructions,
//   Header,
//   LearnMoreLinks,
//   ReloadInstructions,
// } from 'react-native/Libraries/NewAppScreen';

const Colors = {
  white: '#fff',
  black: '#000',
  light: '#ddd',
  dark: '#333',
  lighter: '#eee',
  darker: '#111',
};

const Section = ({children, title}: {children: any; title: string}) => {
  const isDarkMode = useColorScheme() === 'dark';
  return (
    <View style={styles.sectionContainer}>
      <Text
        style={[
          styles.sectionTitle,
          {
            color: isDarkMode ? Colors.white : Colors.black,
          },
        ]}>
        {title}
      </Text>
      <Text
        style={[
          styles.sectionDescription,
          {
            color: isDarkMode ? Colors.light : Colors.dark,
          },
        ]}>
        {children}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
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
  contractData: {
    flexDirection: 'row',
    columnGap: 2,
  },
});

export default App;

// /**
//  * Sample React Native App
//  * https://github.com/facebook/react-native
//  *
//  * @format
//  */

// import React from 'react';
// import type {PropsWithChildren} from 'react';
// import {
//   SafeAreaView,
//   ScrollView,
//   StatusBar,
//   StyleSheet,
//   Text,
//   useColorScheme,
//   View,
// } from 'react-native';

// import {
//   Colors,
//   DebugInstructions,
//   Header,
//   LearnMoreLinks,
//   ReloadInstructions,
// } from 'react-native/Libraries/NewAppScreen';

// type SectionProps = PropsWithChildren<{
//   title: string;
// }>;

// function Section({children, title}: SectionProps): JSX.Element {
//   const isDarkMode = useColorScheme() === 'dark';
//   return (
//     <View style={styles.sectionContainer}>
//       <Text
//         style={[
//           styles.sectionTitle,
//           {
//             color: isDarkMode ? Colors.white : Colors.black,
//           },
//         ]}>
//         {title}
//       </Text>
//       <Text
//         style={[
//           styles.sectionDescription,
//           {
//             color: isDarkMode ? Colors.light : Colors.dark,
//           },
//         ]}>
//         {children}
//       </Text>
//     </View>
//   );
// }

// function App(): JSX.Element {
//   const isDarkMode = useColorScheme() === 'dark';

//   const backgroundStyle = {
//     backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
//   };

//   return (
//     <SafeAreaView style={backgroundStyle}>
//       <StatusBar
//         barStyle={isDarkMode ? 'light-content' : 'dark-content'}
//         backgroundColor={backgroundStyle.backgroundColor}
//       />
//       <ScrollView
//         contentInsetAdjustmentBehavior="automatic"
//         style={backgroundStyle}>
//         <Header />
//         <View
//           style={{
//             backgroundColor: isDarkMode ? Colors.black : Colors.white,
//           }}>
//           <Section title="Step One">
//             Edit <Text style={styles.highlight}>App.tsx</Text> to change this
//             screen and then come back to see your edits.
//           </Section>
//           <Section title="See Your Changes">
//             <ReloadInstructions />
//           </Section>
//           <Section title="Debug">
//             <DebugInstructions />
//           </Section>
//           <Section title="Learn More">
//             Read the docs to discover what to do next:
//           </Section>
//           <LearnMoreLinks />
//         </View>
//       </ScrollView>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   sectionContainer: {
//     marginTop: 32,
//     paddingHorizontal: 24,
//   },
//   sectionTitle: {
//     fontSize: 24,
//     fontWeight: '600',
//   },
//   sectionDescription: {
//     marginTop: 8,
//     fontSize: 18,
//     fontWeight: '400',
//   },
//   highlight: {
//     fontWeight: '700',
//   },
// });

// export default App;
