import React, {useContext} from 'react';
import {Image, StyleSheet, View} from 'react-native';

import {SegmentedButtons, Text} from '../ui';
import {AppStateContext} from '../context/AppState.context';
import {useTheme} from 'react-native-paper';
import {AppMode} from '../types/types';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function SelectUserType() {
  const appState = useContext(AppStateContext);

  const {setAppMode} = appState;

  const theme = useTheme();

  const onValueChange = async (value: string) => {
    await AsyncStorage.setItem('appMode', value);
    setAppMode(value as `${AppMode}`);
  };

  return (
    <View style={[styles.view, {backgroundColor: theme.colors.background}]}>
      <Image source={require('../assets/Icon-App-60x60.png')} />
      <Text variant="titleLarge" style={styles.title}>
        Select user type
      </Text>
      <Text variant="bodyMedium" style={{}}>
        You can change this later from the 'Settings' menu.
      </Text>
      <SegmentedButtons
        value=""
        onValueChange={onValueChange}
        style={{width: '100%'}}
        buttons={[
          {value: AppMode.INHERITEE, label: 'Inheritee'},
          {value: AppMode.INHERITOR, label: 'Inheritor'},
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  view: {flex: 1, padding: 20, alignItems: 'center'},
  title: {
    alignSelf: 'center',
    marginTop: 20,
  },
});
