import {useContext} from 'react';
import {
  Appearance,
  Platform,
  StyleSheet,
  Switch,
  View,
  useColorScheme,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
const log = logger('Help');

import {Text} from '../ui';
import {AppMode} from '../types/types';
import {AppStateContext} from '../context/AppState.context';
import {logger} from '../utils/logger';

export function Settings() {
  const {appMode, setAppMode} = useContext(AppStateContext);

  const colorScheme = useColorScheme();
  const changeTheme = () => {
    console.log('changeTheme', Appearance);
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
      {Platform.OS !== 'web' && (
        <View style={pageStyle.view}>
          <Text>Switch theme:</Text>
          <Switch onValueChange={changeTheme} value={colorScheme === 'dark'} />
        </View>
      )}
      <View style={pageStyle.view}>
        <Text>Switch app type:</Text>
        <Switch
          onValueChange={changeAppType}
          value={appMode === AppMode.INHERITOR}
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
});
