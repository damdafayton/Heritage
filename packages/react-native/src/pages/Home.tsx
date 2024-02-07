import {StyleSheet, Text, View, ScrollView} from 'react-native';
import {useState} from 'react';
import {logger} from 'react-native-logs';
const log = logger.createLogger().extend('Home');

import {Button} from '../ui/Button';
import {ActivityIndicator} from '../ui/ActivityIndicator';

import {Subscribe} from './subscribe/Subscribe';

export function Home({loading}: {loading: boolean}) {
  const [visible, setVisible] = useState(false);

  const Content = () => {
    return (
      <View>
        <Text style={styles.text}>
          You are not registered. Click button below to register.
        </Text>
        <Button onPress={() => setVisible(true)}>Register</Button>
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
      <Subscribe visible={visible} setVisible={setVisible} />
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
