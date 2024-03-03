import {ScrollView, StyleSheet} from 'react-native';
import {useState} from 'react';
import {logger} from 'react-native-logs';

import {Button, Divider, Text} from '../../ui';
import {Subscribe} from './subscribe/Subscribe';
import {ContractData} from '../../molecules/ContractData';
import {DividerFollowerView} from '../../molecules/DividerFollowerView';
const log = logger.createLogger().extend('HomeNonSubscribed');

export function UserNotSubscribed() {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <ContractData />
      <Divider />
      <DividerFollowerView>
        <Text style={[styles.text]}>
          You are not registered. Click below button to register.
        </Text>
        <Button mode="contained" onPress={() => setVisible(true)}>
          Register
        </Button>
        <Subscribe visible={visible} setVisible={setVisible} />
      </DividerFollowerView>
    </>
  );
}

const styles = StyleSheet.create({
  view: {},
  title: {
    alignSelf: 'center',
    fontSize: 24,
    paddingVertical: 10,
    paddingBottom: 20,
  },
  text: {
    alignSelf: 'center',
  },
});
