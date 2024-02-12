import {useContext, useEffect, useState} from 'react';
import Ant from 'react-native-vector-icons/AntDesign';

import {AppStateContext} from '../context/AppState.context';
import {Snackbar, Text} from '../ui';

import {logger} from '../utils/logger';
import {useTheme} from 'react-native-paper';
import {View} from 'react-native';
const log = logger('SuccessSnackbar');

export function SuccessSnackbar() {
  const {successes, clearSuccesses} = useContext(AppStateContext);

  const [visible, setVisible] = useState(true);

  useEffect(() => {
    log.debug(successes);

    if (successes.length) {
      setVisible(true);
      return;
    }
    setVisible(false);
  }, [successes]);

  const onDismissSnackBar = () => {
    clearSuccesses();
    setVisible(false);
  };

  const theme = useTheme();

  return (
    <View style={{flexDirection: 'row'}}>
      <Snackbar
        visible={visible}
        onDismiss={onDismissSnackBar}
        action={{
          label: 'X',
          onPress: () => {
            // Do something
          },
        }}>
        <Text
          style={{
            color: theme.colors.inverseOnSurface,
            marginVertical: 0,
          }}>
          <Ant
            name="checkcircle"
            size={20}
            color={theme.colors.inverseOnSurface}
          />
          {'  '}
          {successes}
        </Text>
      </Snackbar>
    </View>
  );
}
