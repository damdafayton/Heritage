import MaterialCommunityIcons from 'react-native-vector-icons/MaterialIcons';
import {useContext} from 'react';

import {Banner} from '../ui/Banner';
import {AppStateContext} from '../context/AppState.context';
import {useTheme} from 'react-native-paper';

export function ErrorBanner() {
  const {errors, clearErrors} = useContext(AppStateContext);
  const theme = useTheme();

  return errors.length ? (
    <Banner
      style={{marginBottom: 16}}
      visible={errors.length}
      actions={[
        {
          label: 'Dismiss',
          onPress: clearErrors,
        },
      ]}
      icon={({size}) => (
        <MaterialCommunityIcons
          name="warning"
          size={size}
          color={theme.colors.error}
        />
      )}>
      {errors.join('\n')}
    </Banner>
  ) : (
    <></>
  );
}
