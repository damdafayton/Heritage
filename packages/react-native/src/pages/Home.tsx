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
        <Text>You are not registered. Click button below to regsiter.</Text>
        <Button>Register</Button>
      </View>
    );
  };

  return (
    <ScrollView style={styles.view}>
      <Text style={styles.text}>HERITAGE</Text>
      {loading ? <ActivityIndicator /> : <Content />}
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
  text: {
    alignSelf: 'center',
    fontSize: 24,
    paddingVertical: 10,
  },
});
