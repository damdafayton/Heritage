import {useContext, useEffect, useState} from 'react';
import {AppStateContext} from '../context/AppState.context';
import {Snackbar, Text} from '../ui';

import {logger} from '../utils/logger';
import {useTheme} from 'react-native-paper';
import {View} from 'react-native';
const log = logger('ErrorSnackbar');

export function ErrorSnackbar() {
  const {errors, clearErrors} = useContext(AppStateContext);

  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (errors.length) {
      setVisible(true);
      return;
    }
    setVisible(false);
  }, [errors]);

  const onDismissSnackBar = () => {
    clearErrors();
    setVisible(false);
  };

  const theme = useTheme();

  return (
    <View>
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
          {errors}
        </Text>
      </Snackbar>
    </View>
  );
}
