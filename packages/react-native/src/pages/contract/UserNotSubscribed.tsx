import {StyleSheet, View} from 'react-native';
import {useState} from 'react';
import {logger} from 'react-native-logs';
import {Button, Divider, Text} from '../../ui';
import {Subscribe} from './subscribe/Subscribe';
import {ContractData} from '../../molecules/ContractData';
import {styles as s} from '../../ui/styles';
const log = logger.createLogger().extend('HomeNonSubscribed');

export function UserNotSubscribed() {
  const [visible, setVisible] = useState(false);

  return (
    <View>
      <ContractData />
      <Divider />
      <Text style={styles.text}>
        You are not registered. Click below button to register.
      </Text>
      <Button mode="contained" onPress={() => setVisible(true)}>
        Register
      </Button>
      <Subscribe visible={visible} setVisible={setVisible} />
    </View>
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
    ...s.global,
  },
});
