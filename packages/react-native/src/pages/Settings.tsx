import {logger} from 'react-native-logs';
const log = logger.createLogger().extend('Help');
import {List} from 'react-native-paper';

import {Text} from '../ui';
import {useContext} from 'react';
import {HerritageWalletContext} from '../context/HerritageWallet.context';
import {
  Appearance,
  ScrollView,
  StyleSheet,
  Switch,
  View,
  useColorScheme,
} from 'react-native';
import {styles} from '../ui/styles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {AppMode} from '../typings/config';
import {AppStateContext} from '../context/AppState.context';

export function Settings() {
  const {appMode, setAppMode} = useContext(AppStateContext);

  const colorScheme = useColorScheme();
  const changeTheme = () => {
    Appearance.setColorScheme(colorScheme === 'dark' ? 'light' : 'dark');
  };

  const changeAppType = async () => {
    let newMode = AppMode.SELECTOR;

    if (appMode === AppMode.INHERITEE) {
      newMode = AppMode.INHERITOR;
    } else if (appMode === AppMode.INHERITOR) {
      newMode = AppMode.INHERITEE;
    }

    await AsyncStorage.setItem('appMode', newMode);
    setAppMode(newMode);
  };

  return (
    <View>
      <Text variant="titleLarge">Settings</Text>
      <View style={pageStyle.view}>
        <Text>Switch theme:</Text>
        <Switch onChange={changeTheme} value={colorScheme === 'dark'} />
      </View>
      <View style={pageStyle.view}>
        <Text>Switch app type:</Text>
        <Switch
          onChange={changeAppType}
          value={appMode === AppMode.INHERITOR}
          style={pageStyle.switch}
        />
      </View>
    </View>
  );
}

const pageStyle = StyleSheet.create({
  view: {
    flexDirection: 'row',
    gap: 20,
    alignItems: 'center',
    marginTop: 16,
    justifyContent: 'space-between',
  },
  switch: {},
});
