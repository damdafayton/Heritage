import {useContext, useEffect, useState} from 'react';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialIcons';

import {AppStateContext} from '../context/AppState.context';
import {Snackbar, Text} from '../ui';

import {logger} from '../utils/logger';
import {useTheme} from 'react-native-paper';
import {View} from 'react-native';
const log = logger('ErrorSnackbar');

export function ErrorSnackbar({errors}: {errors: string[]}) {
  const {clearErrors} = useContext(AppStateContext);

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
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <MaterialCommunityIcons
            name="warning"
            size={30}
            color={theme.colors.errorContainer}
            style={{marginRight: 10}}
          />
          <Text
            style={{
              color: theme.colors.inverseOnSurface,
            }}>
            {errors}
          </Text>
        </View>
      </Snackbar>
    </View>
  );
}
