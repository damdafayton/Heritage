import {useContext, useEffect, useState} from 'react';
import Ant from 'react-native-vector-icons/AntDesign';

import {AppStateContext} from '../context/AppState.context';
import {Snackbar, Text} from '../ui';

import {logger} from '../utils/logger';
import {useTheme} from 'react-native-paper';
import {View} from 'react-native';
const log = logger('SuccessSnackbar');

export function SuccessSnackbar({successes}: {successes: string[]}) {
  const {clearSuccesses} = useContext(AppStateContext);

  const [visible, setVisible] = useState(true);

  useEffect(() => {
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
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <Ant
            name="checkcircle"
            size={20}
            color={theme.colors.inverseOnSurface}
            style={{marginRight: 10}}
          />
          <Text
            style={{
              color: theme.colors.inverseOnSurface,
            }}>
            {successes.join(', ')}
          </Text>
        </View>
      </Snackbar>
    </View>
  );
}
