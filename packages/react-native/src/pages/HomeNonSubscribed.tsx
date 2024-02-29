import {StyleSheet, View} from 'react-native';
import {useState} from 'react';
import {logger} from 'react-native-logs';
const log = logger.createLogger().extend('HomeNonSubscribed');

import {Button} from '../ui/Button';
import {Subscribe} from './subscribe/Subscribe';
import {Text} from '../ui';

export function HomeNonSubscribed() {
  const [visible, setVisible] = useState(false);

  return (
    <View>
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
  },
});
