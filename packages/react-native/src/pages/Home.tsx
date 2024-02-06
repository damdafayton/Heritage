import {StyleSheet, Text, View, ScrollView} from 'react-native';
import {useContext} from 'react';
import {logger} from 'react-native-logs';
const log = logger.createLogger().extend('Home');

import {isSubscribed} from '../helpers/isSubscribed';
import {HerritageWalletContext} from '../context/HerritageWallet.context';
import {Button} from '../ui/Button';
import {Appbar} from '../ui/Appbar';
import {ActivityIndicator} from '../ui/ActivityIndicator';

export function Home({loading}: {loading: boolean}) {
  const {subscriptionData} = useContext(HerritageWalletContext);

  const isRegistered = subscriptionData && isSubscribed(subscriptionData);

  const Content = () => {
    return isRegistered ? (
      <Text>Welcome</Text>
    ) : (
      <View>
        <Text>You are not registered. Click button below to register.</Text>
        <Button>Register</Button>
      </View>
    );
  };

  return (
    <ScrollView style={styles.view}>
      <Text style={styles.title}>HERITAGE</Text>
      {loading ? (
        <>
          <Text style={styles.text}>
            Waiting for connection to the contract
          </Text>
          <ActivityIndicator />
        </>
      ) : (
        <Content />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  view: {},
  contractData: {
    display: 'flex',
    flexDirection: 'row',
    columnGap: 2,
  },
  contractDataCell: {
    flex: 1,
    backgroundColor: 'yellow',
  },
  contractDataRow: {
    display: 'flex',
    columnGap: 2,
    flexDirection: 'row',
  },
  title: {
    alignSelf: 'center',
    fontSize: 24,
    paddingVertical: 10,
    paddingBottom: 20,
  },
  text: {
    alignSelf: 'center',
    paddingBottom: 15,
  },
});
