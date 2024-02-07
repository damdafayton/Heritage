import {StyleSheet, Text, View, ScrollView} from 'react-native';
import {useContext} from 'react';
import {logger} from 'react-native-logs';
const log = logger.createLogger().extend('Home');

import {isSubscribed} from '../helpers/isSubscribed';
import {HerritageWalletContext} from '../context/HerritageWallet.context';
import {Button} from '../ui/Button';
import {ActivityIndicator} from '../ui/ActivityIndicator';
import {MenuType} from '../typings/config';
import {useNavigation} from '@react-navigation/native';
import {Subscribed} from './Subscribed';

export function Home({loading}: {loading: boolean}) {
  const {subscriptionData} = useContext(HerritageWalletContext);

  const isRegistered = subscriptionData && isSubscribed(subscriptionData);

  const navigation = useNavigation();

  const Content = () => {
    return (
      <View>
        <Text style={styles.text}>
          You are not registered. Click button below to register.
        </Text>
        <Button onPress={() => navigation.navigate(MenuType.REGISTER as never)}>
          Register
        </Button>
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
